import { useEffect, useState, type FormEvent, type ReactNode } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { AlertTriangle, Check, ChevronLeft, Loader2, Plus, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { ENGAGEMENT_ICON } from "../components/engagement";
import { Chips, Field, inputClass } from "../components/form";
import { PageHeader, SkeletonBlock } from "../components/ui";
import { findSimilarClients } from "../lib/duplicates";
import { DURATION_PRESETS, ENGAGEMENT, durationLabel } from "../lib/engagement";
import { toNumberOrNull } from "../lib/format";
import {
  useClient,
  useClientKpis,
  useClients,
  useClientTypes,
  useSaveClient,
  type ClientDraft,
  type KpiDraft,
} from "../lib/queries";
import {
  CLIENT_STATUSES,
  ENGAGEMENT_TYPES,
  GOAL_LABEL,
  KPI_UNITS,
  KPI_UNIT_LABEL,
  MAIN_GOALS,
  SERVICES,
  STATUS_LABEL,
  type ClientStatus,
  type CustomFields,
  type EngagementType,
  type FieldDefinition,

  type KpiUnit,
  type MainGoal,
} from "../lib/types";

type FormState = {
  client_type_id: string | null;
  name: string;
  business_name: string;
  contact_person: string;
  email: string;
  phone: string;
  website: string;
  industry: string;
  status: ClientStatus;
  start_date: string;
  monthly_fee: string;
  engagement_type: EngagementType;
  end_date: string;
  project_fee: string;
  services: string[];
  main_goal: MainGoal | null;
  notes: string;
  custom_fields: CustomFields;
};

const EMPTY: FormState = {
  client_type_id: null,
  name: "",
  business_name: "",
  contact_person: "",
  email: "",
  phone: "",
  website: "",
  industry: "",
  status: "onboarding",
  start_date: "",
  monthly_fee: "",
  engagement_type: "retainer",
  end_date: "",
  project_fee: "",
  services: [],
  main_goal: null,
  notes: "",
  custom_fields: {},
};

const blankToNull = (v: string) => (v.trim() === "" ? null : v.trim());


// ---------------------------------------------------------------- small form pieces

function FormSection({ title, description, children }: { title: string; description?: string; children: ReactNode }) {
  return (
    <section>
      <h2 className="hub-section-title">{title}</h2>
      <div className="hub-card space-y-5 p-5 sm:p-6">
        {description && <p className="-mt-1 text-sm text-muted-foreground">{description}</p>}
        {children}
      </div>
    </section>
  );
}

function CustomFieldInput({
  def,
  value,
  onChange,
}: {
  def: FieldDefinition;
  value: CustomFields[string] | undefined;
  onChange: (value: CustomFields[string]) => void;
}) {
  const id = `cf-${def.key}`;
  switch (def.type) {
    case "textarea":
      return (
        <Textarea
          id={id}
          rows={3}
          value={(value as string) ?? ""}
          placeholder={def.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className="rounded-xl bg-background"
        />
      );
    case "select":
      return (
        <Select value={(value as string) || "__none"} onValueChange={(v) => onChange(v === "__none" ? null : v)}>
          <SelectTrigger id={id} className={inputClass}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none">Not set</SelectItem>
            {def.options?.map((o) => (
              <SelectItem key={o} value={o}>
                {o}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      );
    case "multiselect":
      return <Chips options={def.options ?? []} value={Array.isArray(value) ? value : []} onChange={onChange} />;
    case "number":
    case "currency":
    case "percent":
      return (
        <div className="relative">
          {def.type === "currency" && (
            <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              KES
            </span>
          )}
          <Input
            id={id}
            inputMode="decimal"
            value={value === null || value === undefined ? "" : String(value)}
            placeholder={def.placeholder}
            onChange={(e) => onChange(e.target.value)}
            className={cn(
              inputClass,
              "hub-tabular",
              def.type === "currency" && "pl-12",
              def.type === "percent" && "pr-9",
            )}
          />
          {def.type === "percent" && (
            <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
              %
            </span>
          )}
        </div>
      );
    default:
      return (
        <Input
          id={id}
          type={def.type === "url" ? "url" : "text"}
          value={(value as string) ?? ""}
          placeholder={def.placeholder}
          onChange={(e) => onChange(e.target.value)}
          className={inputClass}
        />
      );
  }
}

/** Numbers are typed as text so "45,000" works; stored as numbers. */
function normaliseCustomFields(values: CustomFields, defs: FieldDefinition[]): CustomFields {
  const out: CustomFields = { ...values };
  for (const def of defs) {
    const v = out[def.key];
    if (["number", "currency", "percent"].includes(def.type) && typeof v === "string") out[def.key] = toNumberOrNull(v);
    else if (typeof v === "string") out[def.key] = v.trim() === "" ? null : v.trim();
    if (out[def.key] === null || (Array.isArray(out[def.key]) && (out[def.key] as string[]).length === 0))
      delete out[def.key];
  }
  return out;
}

function KpiEditor({ kpis, onChange }: { kpis: KpiDraft[]; onChange: (next: KpiDraft[]) => void }) {
  const [name, setName] = useState("");
  const [unit, setUnit] = useState<KpiUnit>("number");
  const duplicate = kpis.some((k) => k.name.trim().toLowerCase() === name.trim().toLowerCase());

  const add = () => {
    if (!name.trim() || duplicate) return;
    onChange([...kpis, { name: name.trim(), unit }]);
    setName("");
  };

  return (
    <div className="space-y-3">
      {kpis.length > 0 && (
        <ul className="divide-y divide-border/60 overflow-hidden rounded-xl border border-border/70">
          {kpis.map((kpi, i) => (
            <li key={kpi.id ?? `new-${i}`} className="flex items-center gap-2 bg-background px-3 py-2">
              <Input
                value={kpi.name}
                onChange={(e) => onChange(kpis.map((k, j) => (j === i ? { ...k, name: e.target.value } : k)))}
                className="h-9 flex-1 border-transparent bg-transparent px-1 shadow-none focus-visible:ring-1"
                aria-label="KPI name"
              />
              <Select
                value={kpi.unit}
                onValueChange={(v) => onChange(kpis.map((k, j) => (j === i ? { ...k, unit: v as KpiUnit } : k)))}
              >
                <SelectTrigger className="h-9 w-28 rounded-lg" aria-label="Unit">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {KPI_UNITS.map((u) => (
                    <SelectItem key={u} value={u}>
                      {KPI_UNIT_LABEL[u]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <button
                type="button"
                onClick={() => onChange(kpis.filter((_, j) => j !== i))}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors duration-150 hover:bg-secondary hover:text-foreground"
                aria-label={`Remove ${kpi.name}`}
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}
      <div className="flex gap-2">
        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              add();
            }
          }}
          placeholder="e.g. Cost per lead"
          className={cn(inputClass, "flex-1")}
          aria-label="New KPI name"
        />
        <Select value={unit} onValueChange={(v) => setUnit(v as KpiUnit)}>
          <SelectTrigger className="h-11 w-28 rounded-xl" aria-label="New KPI unit">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {KPI_UNITS.map((u) => (
              <SelectItem key={u} value={u}>
                {KPI_UNIT_LABEL[u]}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Button
          type="button"
          variant="secondary"
          className="h-11 rounded-xl"
          onClick={add}
          disabled={!name.trim() || duplicate}
        >
          <Plus className="h-4 w-4" />
          <span className="sr-only">Add KPI</span>
        </Button>
      </div>
      {duplicate && name.trim() && <p className="text-xs text-warning">That KPI is already on the list.</p>}
    </div>
  );
}

// ---------------------------------------------------------------- page

export default function ClientFormPage() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const types = useClientTypes();
  const { data: existing, isLoading } = useClient(id);
  const existingKpis = useClientKpis(id);
  const save = useSaveClient();
  const allClients = useClients();

  const [form, setForm] = useState<FormState>(EMPTY);
  const [kpis, setKpis] = useState<KpiDraft[]>([]);
  const [loaded, setLoaded] = useState(!isEdit);
  const [kpisTouched, setKpisTouched] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fill the form once when editing.
  useEffect(() => {
    if (!isEdit || loaded || !existing || !existingKpis.data) return;
    setForm({
      client_type_id: existing.client_type_id,
      name: existing.name,
      business_name: existing.business_name ?? "",
      contact_person: existing.contact_person ?? "",
      email: existing.email ?? "",
      phone: existing.phone ?? "",
      website: existing.website ?? "",
      industry: existing.industry ?? "",
      status: existing.status,
      start_date: existing.start_date ?? "",
      monthly_fee: existing.monthly_fee === null ? "" : String(existing.monthly_fee),
      engagement_type: existing.engagement_type ?? "retainer",
      end_date: existing.end_date ?? "",
      project_fee: existing.project_fee == null ? "" : String(existing.project_fee),
      services: existing.services,
      main_goal: existing.main_goal,
      notes: existing.notes ?? "",
      custom_fields: existing.custom_fields ?? {},
    });
    setKpis(existingKpis.data.map((k) => ({ id: k.id, name: k.name, unit: k.unit })));
    setLoaded(true);
  }, [isEdit, loaded, existing, existingKpis.data]);

  const type = types.data?.find((t) => t.id === form.client_type_id);
  // Warn while typing if this client (by name, phone or email) is already in the hub.
  const similar = findSimilarClients(
    allClients.data ?? [],
    { name: form.name, phone: form.phone, email: form.email },
    id,
  );
  const set = <K extends keyof FormState>(key: K, value: FormState[K]) => setForm((f) => ({ ...f, [key]: value }));

  const setType = (typeId: string | null) => {
    set("client_type_id", typeId);
    // Suggest the type's KPIs until you've edited the list yourself.
    const nextType = types.data?.find((t) => t.id === typeId);
    if (!kpisTouched && !isEdit) setKpis((nextType?.default_kpis ?? []).map((k) => ({ ...k })));
  };

  const updateKpis = (next: KpiDraft[]) => {
    setKpisTouched(true);
    setKpis(next);
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!form.name.trim()) {
      setError("Give the client a name.");
      return;
    }
    const monthly = form.engagement_type !== "project";
    const fee = monthly ? toNumberOrNull(form.monthly_fee) : null;
    if (monthly && form.monthly_fee.trim() && fee === null) {
      setError("Monthly fee should be a number, e.g. 45000.");
      return;
    }
    const projectFee = monthly ? null : toNumberOrNull(form.project_fee);
    if (!monthly && form.project_fee.trim() && projectFee === null) {
      setError("Project fee should be a number, e.g. 25000.");
      return;
    }
    const endDate = form.engagement_type === "retainer" ? null : form.end_date || null;
    if (endDate && form.start_date && endDate < form.start_date) {
      setError(`The ${form.engagement_type === "project" ? "deadline" : "end date"} is before the start date.`);
      return;
    }
    const client: ClientDraft = {
      client_type_id: form.client_type_id,
      name: form.name.trim(),
      business_name: blankToNull(form.business_name),
      contact_person: blankToNull(form.contact_person),
      email: blankToNull(form.email),
      phone: blankToNull(form.phone),
      website: blankToNull(form.website),
      industry: blankToNull(form.industry),
      status: form.status,
      start_date: form.start_date || null,
      monthly_fee: fee,
      engagement_type: form.engagement_type,
      end_date: endDate,
      project_fee: projectFee,
      services: form.services,
      main_goal: form.main_goal,
      notes: blankToNull(form.notes),
      custom_fields: normaliseCustomFields(form.custom_fields, type?.field_definitions ?? []),
    };
    const cleanKpis = kpis.filter((k) => k.name.trim());
    save.mutate(
      { id, client, kpis: cleanKpis, typeChanged: isEdit && existing?.client_type_id !== form.client_type_id },
      {
        onSuccess: (saved) => {
          toast.success(isEdit ? "Changes saved" : `${saved.name} added`);
          navigate(`/hub/clients/${saved.id}`, { replace: true });
        },
        onError: (err) => setError(err.message),
      },
    );
  };

  if (isEdit && !loaded) {
    if (!isLoading && !existing) {
      return (
        <p className="text-sm text-muted-foreground">
          Client not found.{" "}
          <Link to="/hub/clients" className="text-primary">
            Back to clients
          </Link>
        </p>
      );
    }
    return (
      <div className="space-y-6">
        <SkeletonBlock className="h-10 w-64" />
        <SkeletonBlock className="h-96 rounded-[20px]" />
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mx-auto max-w-3xl" noValidate>
      <Link
        to={isEdit ? `/hub/clients/${id}` : "/hub/clients"}
        className="-ml-1 mb-4 flex w-fit items-center gap-0.5 text-sm text-primary transition-opacity duration-150 hover:opacity-80"
      >
        <ChevronLeft className="h-4 w-4" /> {isEdit ? "Back" : "Clients"}
      </Link>
      <PageHeader title={isEdit ? `Edit ${existing?.name ?? "client"}` : "New client"} />

      <div className="space-y-8">
        <FormSection title="Client">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Name *" htmlFor="name">
              <Input
                id="name"
                required
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                className={inputClass}
                autoFocus={!isEdit}
              />
            </Field>
            {similar.length > 0 && (
              <p className="flex flex-wrap items-center gap-x-1 rounded-xl bg-warning-soft px-3 py-2 text-sm text-warning sm:col-span-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                Looks like you already have
                {similar.slice(0, 3).map((c, i) => (
                  <span key={c.id}>
                    {i > 0 && ", "}
                    <Link to={`/hub/clients/${c.id}`} className="font-semibold underline underline-offset-2">
                      {c.name}
                    </Link>
                  </span>
                ))}
                . Open it instead of adding a duplicate?
              </p>
            )}
            <Field label="Business name" htmlFor="business_name">
              <Input
                id="business_name"
                value={form.business_name}
                onChange={(e) => set("business_name", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Client type" htmlFor="client_type" hint={type?.description ?? undefined}>
              <Select value={form.client_type_id ?? "__none"} onValueChange={(v) => setType(v === "__none" ? null : v)}>
                <SelectTrigger id="client_type" className={inputClass}>
                  <SelectValue placeholder="Choose a type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none">No type</SelectItem>
                  {types.data?.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {t.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Industry" htmlFor="industry">
              <Input
                id="industry"
                value={form.industry}
                onChange={(e) => set("industry", e.target.value)}
                className={inputClass}
                placeholder="e.g. Consumer electronics"
              />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Contact">
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Contact person" htmlFor="contact_person">
              <Input
                id="contact_person"
                value={form.contact_person}
                onChange={(e) => set("contact_person", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Email" htmlFor="email">
              <Input
                id="email"
                type="email"
                value={form.email}
                onChange={(e) => set("email", e.target.value)}
                className={inputClass}
              />
            </Field>
            <Field label="Phone / WhatsApp" htmlFor="phone">
              <Input
                id="phone"
                type="tel"
                value={form.phone}
                onChange={(e) => set("phone", e.target.value)}
                className={inputClass}
                placeholder="0712 345 678"
              />
            </Field>
            <Field label="Website" htmlFor="website">
              <Input
                id="website"
                type="url"
                value={form.website}
                onChange={(e) => set("website", e.target.value)}
                className={inputClass}
                placeholder="example.co.ke"
              />
            </Field>
          </div>
        </FormSection>

        <FormSection title="Engagement">
          <Field label="How you work together">
            <div className="grid gap-2 sm:grid-cols-3" role="radiogroup" aria-label="How you work together">
              {ENGAGEMENT_TYPES.map((t) => {
                const Icon = ENGAGEMENT_ICON[t];
                const on = form.engagement_type === t;
                return (
                  <button
                    key={t}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => set("engagement_type", t)}
                    className={cn(
                      "relative flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-[border-color,background-color,box-shadow] duration-150",
                      on
                        ? "border-primary/50 bg-tint/40 shadow-hub ring-1 ring-primary/30"
                        : "border-border bg-background hover:border-foreground/20",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-9 w-9 items-center justify-center rounded-xl",
                        on ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground",
                      )}
                    >
                      <Icon className="h-4 w-4" />
                    </span>
                    <span>
                      <span className="block text-sm font-semibold">{ENGAGEMENT[t].label}</span>
                      <span className="block text-xs text-muted-foreground">{ENGAGEMENT[t].description}</span>
                    </span>
                    {on && <Check className="absolute right-3 top-3 h-4 w-4 text-primary" />}
                  </button>
                );
              })}
            </div>
          </Field>

          <div className="grid gap-5 sm:grid-cols-3">
            <Field label="Status" htmlFor="status">
              <Select value={form.status} onValueChange={(v) => set("status", v as ClientStatus)}>
                <SelectTrigger id="status" className={inputClass}>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CLIENT_STATUSES.map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABEL[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
            <Field label="Start date" htmlFor="start_date">
              <Input
                id="start_date"
                type="date"
                value={form.start_date}
                onChange={(e) => set("start_date", e.target.value)}
                className={inputClass}
              />
            </Field>
            {form.engagement_type === "project" ? (
              <Field label="Project fee" htmlFor="project_fee" hint="The total for the whole job.">
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    KES
                  </span>
                  <Input
                    id="project_fee"
                    inputMode="decimal"
                    value={form.project_fee}
                    onChange={(e) => set("project_fee", e.target.value)}
                    className={cn(inputClass, "hub-tabular pl-12")}
                    placeholder="25,000"
                  />
                </div>
              </Field>
            ) : (
              <Field label="Monthly fee" htmlFor="monthly_fee">
                <div className="relative">
                  <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                    KES
                  </span>
                  <Input
                    id="monthly_fee"
                    inputMode="decimal"
                    value={form.monthly_fee}
                    onChange={(e) => set("monthly_fee", e.target.value)}
                    className={cn(inputClass, "hub-tabular pl-12")}
                    placeholder="45,000"
                  />
                </div>
              </Field>
            )}
          </div>

          {form.engagement_type !== "retainer" && (
            <div className="rounded-2xl bg-secondary/50 p-4">
              <div className="grid gap-4 sm:grid-cols-[1fr_auto] sm:items-end">
                <Field label={ENGAGEMENT[form.engagement_type].endLabel} htmlFor="end_date">
                  <Input
                    id="end_date"
                    type="date"
                    value={form.end_date}
                    min={form.start_date || undefined}
                    onChange={(e) => set("end_date", e.target.value)}
                    className={inputClass}
                  />
                </Field>
                <div className="flex flex-wrap gap-1.5">
                  {DURATION_PRESETS[form.engagement_type].map((p) => (
                    <button
                      key={p.label}
                      type="button"
                      onClick={() => {
                        const start = form.start_date ? parseISO(form.start_date) : new Date();
                        setForm((f) => ({
                          ...f,
                          start_date: f.start_date || format(start, "yyyy-MM-dd"),
                          end_date: format(p.apply(start), "yyyy-MM-dd"),
                        }));
                      }}
                      className="h-9 rounded-full border border-border bg-background px-3 text-xs font-medium text-muted-foreground transition-colors duration-150 hover:border-foreground/20 hover:text-foreground"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {durationLabel(form.start_date || null, form.end_date || null)
                  ? `${durationLabel(form.start_date || null, form.end_date || null)} from start to ${
                      form.engagement_type === "project" ? "deadline" : "end"
                    }. You'll see it on the Overview as the date gets close.`
                  : form.engagement_type === "project"
                    ? "Pick a deadline, or tap a length. Short jobs of a few days are fine."
                    : "Pick when the contract ends, or tap a length."}
              </p>
            </div>
          )}
          <Field label="Services">
            <Chips options={SERVICES} value={form.services} onChange={(v) => set("services", v)} />
          </Field>
          <Field label="Main goal">
            <div
              className="grid grid-cols-2 gap-1 rounded-xl bg-secondary p-1 sm:grid-cols-4"
              role="radiogroup"
              aria-label="Main goal"
            >
              {MAIN_GOALS.map((g) => (
                <button
                  key={g}
                  type="button"
                  role="radio"
                  aria-checked={form.main_goal === g}
                  onClick={() => set("main_goal", form.main_goal === g ? null : g)}
                  className={cn(
                    "rounded-lg py-2 text-sm transition-all duration-150",
                    form.main_goal === g
                      ? "bg-card font-medium text-foreground shadow-hub"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {GOAL_LABEL[g]}
                </button>
              ))}
            </div>
          </Field>
        </FormSection>

        {type && type.field_definitions.length > 0 && (
          <FormSection title={`${type.name} details`}>
            <div className="grid gap-5 sm:grid-cols-2">
              {type.field_definitions.map((def) => (
                <Field
                  key={def.key}
                  label={def.label}
                  htmlFor={`cf-${def.key}`}
                  className={def.type === "textarea" || def.type === "multiselect" ? "sm:col-span-2" : undefined}
                >
                  <CustomFieldInput
                    def={def}
                    value={form.custom_fields[def.key]}
                    onChange={(v) => set("custom_fields", { ...form.custom_fields, [def.key]: v })}
                  />
                </Field>
              ))}
            </div>
          </FormSection>
        )}

        <FormSection title="Key KPIs" description="The metrics you'll track and report on for this client.">
          <KpiEditor kpis={kpis} onChange={updateKpis} />
        </FormSection>

        <FormSection title="Notes">
          <Textarea
            value={form.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows={4}
            placeholder="Anything worth remembering"
            className="rounded-xl bg-background"
            aria-label="Notes"
          />
        </FormSection>
      </div>

      {error && (
        <p role="alert" className="mt-6 rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="sticky bottom-20 z-20 mt-8 flex justify-end gap-2 md:bottom-6">
        <div className="hub-glass flex gap-2 rounded-full border border-border/70 p-1.5 shadow-hub-lg">
          <Button type="button" variant="ghost" className="rounded-full" onClick={() => navigate(-1)}>
            Cancel
          </Button>
          <Button type="submit" className="min-w-28 rounded-full" disabled={save.isPending}>
            {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : isEdit ? "Save changes" : "Add client"}
          </Button>
        </div>
      </div>
    </form>
  );
}
