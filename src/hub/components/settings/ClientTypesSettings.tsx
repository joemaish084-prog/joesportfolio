import { useEffect, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ArrowDown, ArrowUp, Layers, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { db } from "../../lib/db";
import { hubKeys, unwrap, useClients, useClientTypes } from "../../lib/queries";
import {
  KPI_UNITS,
  KPI_UNIT_LABEL,
  type ClientType,
  type FieldDefinition,
  type FieldType,
  type KpiDefinition,
} from "../../lib/types";
import { Field, FormDialog, inputClass } from "../form";
import { EmptyState, Pill, SkeletonBlock } from "../ui";

const FIELD_TYPES: { value: FieldType; label: string }[] = [
  { value: "text", label: "Short text" },
  { value: "textarea", label: "Long text" },
  { value: "number", label: "Number" },
  { value: "currency", label: "Amount (KES)" },
  { value: "percent", label: "Percentage" },
  { value: "url", label: "Link" },
  { value: "select", label: "Pick one" },
  { value: "multiselect", label: "Pick several" },
];

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 40) || "field";

type FieldDraft = { key: string | null; label: string; type: FieldType; options: string };

function useSaveClientType() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      values,
    }: {
      id?: string;
      values: Partial<Omit<ClientType, "id" | "created_at" | "updated_at">>;
    }) =>
      id
        ? unwrap(await db.from("client_types").update(values).eq("id", id))
        : unwrap(await db.from("client_types").insert({ ...values, slug: values.slug!, name: values.name! })),
    onSuccess: () => qc.invalidateQueries({ queryKey: hubKeys.clientTypes }),
  });
}

function TypeDialog({
  type,
  open,
  onOpenChange,
}: {
  type: ClientType | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const save = useSaveClientType();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fields, setFields] = useState<FieldDraft[]>([]);
  const [kpis, setKpis] = useState<KpiDefinition[]>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(type?.name ?? "");
    setDescription(type?.description ?? "");
    setFields(
      (type?.field_definitions ?? []).map((f) => ({
        key: f.key,
        label: f.label,
        type: f.type,
        options: (f.options ?? []).join(", "),
      })),
    );
    setKpis(type?.default_kpis ?? []);
    setError(null);
  }, [open, type]);

  const move = (i: number, by: number) =>
    setFields((fs) => {
      const next = [...fs];
      const j = i + by;
      if (j < 0 || j >= next.length) return fs;
      [next[i], next[j]] = [next[j], next[i]];
      return next;
    });

  const submit = () => {
    if (!name.trim()) return setError("Give the type a name.");
    const used = new Set<string>();
    const defs: FieldDefinition[] = [];
    for (const f of fields) {
      if (!f.label.trim()) return setError("Every field needs a label.");
      // Existing fields keep their key, so values already saved on clients still match.
      let key = f.key ?? slug(f.label);
      while (used.has(key)) key = `${key}_2`;
      used.add(key);
      const options = f.options
        .split(",")
        .map((o) => o.trim())
        .filter(Boolean);
      if ((f.type === "select" || f.type === "multiselect") && options.length < 2)
        return setError(`"${f.label}" needs at least two options, separated by commas.`);
      defs.push({
        key,
        label: f.label.trim(),
        type: f.type,
        ...(options.length && (f.type === "select" || f.type === "multiselect") ? { options } : {}),
      });
    }
    const cleanKpis = kpis.filter((k) => k.name.trim()).map((k) => ({ name: k.name.trim(), unit: k.unit }));
    save.mutate(
      {
        id: type?.id,
        values: {
          name: name.trim(),
          description: description.trim() || null,
          field_definitions: defs,
          default_kpis: cleanKpis,
          ...(type ? {} : { slug: `${slug(name)}-${Date.now().toString(36)}`, sort_order: 80 }),
        },
      },
      {
        onSuccess: () => {
          toast.success(type ? "Client type updated" : "Client type added");
          onOpenChange(false);
        },
        onError: (e) => setError(e.message),
      },
    );
  };

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={type ? `Edit ${type.name}` : "New client type"}
      description="The extra fields you fill in for clients of this type, and the KPIs they start with."
      onSubmit={submit}
      pending={save.isPending}
      error={error}
      wide
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor="ct-name">
          <Input id="ct-name" value={name} onChange={(e) => setName(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Description" htmlFor="ct-desc">
          <Input
            id="ct-desc"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>

      <div>
        <p className="hub-label mb-1.5">Custom fields</p>
        <div className="space-y-2">
          {fields.map((f, i) => (
            <div key={i} className="rounded-xl bg-secondary/50 p-2">
              <div className="grid grid-cols-[1fr_auto] gap-2 sm:grid-cols-[1fr_10rem_auto]">
                <Input
                  value={f.label}
                  onChange={(e) => setFields((fs) => fs.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)))}
                  placeholder="Field label, e.g. Store platform"
                  aria-label="Field label"
                  className="h-10 rounded-lg bg-card"
                />
                <Select
                  value={f.type}
                  onValueChange={(v) =>
                    setFields((fs) => fs.map((x, j) => (j === i ? { ...x, type: v as FieldType } : x)))
                  }
                >
                  <SelectTrigger
                    className="order-last col-span-2 h-10 rounded-lg bg-card sm:order-none sm:col-span-1"
                    aria-label="Field type"
                  >
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {FIELD_TYPES.map((t) => (
                      <SelectItem key={t.value} value={t.value}>
                        {t.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-10 w-8"
                    onClick={() => move(i, -1)}
                    aria-label="Move up"
                    disabled={i === 0}
                  >
                    <ArrowUp className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-10 w-8"
                    onClick={() => move(i, 1)}
                    aria-label="Move down"
                    disabled={i === fields.length - 1}
                  >
                    <ArrowDown className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-10 w-8 text-muted-foreground hover:text-destructive"
                    onClick={() => setFields((fs) => fs.filter((_, j) => j !== i))}
                    aria-label="Remove field"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {(f.type === "select" || f.type === "multiselect") && (
                <Input
                  value={f.options}
                  onChange={(e) =>
                    setFields((fs) => fs.map((x, j) => (j === i ? { ...x, options: e.target.value } : x)))
                  }
                  placeholder="Options, separated by commas: Shopify, WooCommerce, Other"
                  aria-label="Options"
                  className="mt-2 h-10 rounded-lg bg-card"
                />
              )}
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-2 rounded-full text-primary"
          onClick={() => setFields((fs) => [...fs, { key: null, label: "", type: "text", options: "" }])}
        >
          <Plus className="mr-1 h-4 w-4" /> Add field
        </Button>
      </div>

      <div>
        <p className="hub-label mb-1.5">Starting KPIs</p>
        <div className="space-y-2">
          {kpis.map((k, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={k.name}
                onChange={(e) => setKpis((ks) => ks.map((x, j) => (j === i ? { ...x, name: e.target.value } : x)))}
                placeholder="e.g. Cost per lead"
                aria-label="KPI name"
                className="h-10 flex-1 rounded-lg bg-background"
              />
              <Select
                value={k.unit}
                onValueChange={(v) =>
                  setKpis((ks) => ks.map((x, j) => (j === i ? { ...x, unit: v as KpiDefinition["unit"] } : x)))
                }
              >
                <SelectTrigger className="h-10 w-28 rounded-lg" aria-label="Unit">
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
                variant="ghost"
                size="icon"
                className="h-10 w-10 text-muted-foreground hover:text-destructive"
                onClick={() => setKpis((ks) => ks.filter((_, j) => j !== i))}
                aria-label="Remove KPI"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="mt-2 rounded-full text-primary"
          onClick={() => setKpis((ks) => [...ks, { name: "", unit: "number" }])}
        >
          <Plus className="mr-1 h-4 w-4" /> Add KPI
        </Button>
      </div>
      <p className="text-xs text-muted-foreground">
        Changing a type never deletes what's saved on clients. Renamed fields keep their values; removed fields still
        show on profiles until you edit them.
      </p>
    </FormDialog>
  );
}

export function ClientTypesSettings() {
  const types = useClientTypes();
  const clients = useClients();
  const save = useSaveClientType();
  const [editing, setEditing] = useState<ClientType | null>(null);
  const [open, setOpen] = useState(false);

  const countFor = (id: string) => (clients.data ?? []).filter((c) => c.client_type_id === id && !c.archived_at).length;

  if (types.isLoading) return <SkeletonBlock className="h-64 rounded-[20px]" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Each type has its own fields on the client profile and suggested KPIs.
        </p>
        <Button
          className="rounded-full px-4"
          onClick={() => {
            setEditing(null);
            setOpen(true);
          }}
        >
          <Plus className="mr-1.5 h-4 w-4" /> New type
        </Button>
      </div>
      {!types.data?.length ? (
        <div className="hub-card">
          <EmptyState icon={Layers} title="No client types" />
        </div>
      ) : (
        <ul className="grid gap-3 md:grid-cols-2">
          {types.data.map((t) => (
            <li key={t.id} className="hub-card flex flex-col p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold">{t.name}</p>
                  {t.description && <p className="text-sm text-muted-foreground">{t.description}</p>}
                </div>
                <Pill tone="neutral">
                  {countFor(t.id)} {countFor(t.id) === 1 ? "client" : "clients"}
                </Pill>
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                {t.field_definitions.map((f) => (
                  <Pill key={f.key} tone="outline">
                    {f.label}
                  </Pill>
                ))}
                {!t.field_definitions.length && <span className="text-xs text-muted-foreground">No extra fields</span>}
              </div>
              {t.default_kpis.length > 0 && (
                <p className="mt-2 text-xs text-muted-foreground">
                  KPIs: {t.default_kpis.map((k) => k.name).join(", ")}
                </p>
              )}
              <div className="mt-auto flex gap-2 pt-4">
                <Button
                  variant="secondary"
                  size="sm"
                  className="rounded-full"
                  onClick={() => {
                    setEditing(t);
                    setOpen(true);
                  }}
                >
                  <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
                </Button>
                {countFor(t.id) === 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="rounded-full text-muted-foreground"
                    onClick={() =>
                      save.mutate(
                        { id: t.id, values: { archived_at: new Date().toISOString() } },
                        { onSuccess: () => toast.success(`${t.name} removed`), onError: (e) => toast.error(e.message) },
                      )
                    }
                  >
                    Remove
                  </Button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
      <TypeDialog type={editing} open={open} onOpenChange={setOpen} />
    </div>
  );
}
