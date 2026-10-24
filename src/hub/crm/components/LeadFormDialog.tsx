import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useHubAuth } from "../../auth/HubAuthProvider";
import { Field, FormDialog, inputClass } from "../../components/form";
import { domainKey, emailKey, nameKey, phoneKey } from "../lib/normalize";
import { useCrm, useIndustries, useLeads, useMembers, useSaveLead } from "../lib/queries";
import type { CrmLead } from "../lib/types";
import { SelectField } from "./bits";

const FIELDS = ["name", "area", "business_type", "email", "phone", "website", "instagram", "facebook", "tiktok", "notes"] as const;
type Values = Record<(typeof FIELDS)[number], string> & { industry_id: string; owner_id: string };

const empty = (lead?: CrmLead | null, me?: string): Values => ({
  name: lead?.name ?? "",
  area: lead?.area ?? "",
  business_type: lead?.business_type ?? "",
  email: lead?.email ?? "",
  phone: lead?.phone ?? "",
  website: lead?.website ?? "",
  instagram: lead?.instagram ?? "",
  facebook: lead?.facebook ?? "",
  tiktok: lead?.tiktok ?? "",
  notes: lead?.notes ?? "",
  industry_id: lead?.industry_id ?? "",
  owner_id: lead ? (lead.owner_id ?? "") : (me ?? ""),
});

export function LeadFormDialog({
  open,
  onOpenChange,
  lead,
  onSaved,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead?: CrmLead | null;
  onSaved?: (lead: CrmLead) => void;
}) {
  const me = useHubAuth().session?.user.id;
  const { orgId, isOwner } = useCrm();
  const industries = useIndustries();
  const members = useMembers();
  const leads = useLeads();
  const save = useSaveLead();
  const [values, setValues] = useState<Values>(() => empty(lead, me));
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setValues(empty(lead, me));
      setError(null);
    }
  }, [open, lead, me]);

  const set = (k: keyof Values) => (v: string) => setValues((s) => ({ ...s, [k]: v }));

  // Same keys the database uses, so this warning matches what the import would say.
  const similar = useMemo(() => {
    const n = nameKey(values.name);
    const d = domainKey(values.website);
    const e = emailKey(values.email);
    const p = phoneKey(values.phone);
    return (leads.data ?? []).filter(
      (l) =>
        l.id !== lead?.id &&
        ((n && n.length > 2 && l.name_key === n) ||
          (d && l.domain_key === d) ||
          (e && l.email_key === e) ||
          (p && l.phone_key === p)),
    );
  }, [values.name, values.website, values.email, values.phone, leads.data, lead?.id]);

  const submit = () => {
    if (!values.name.trim()) {
      setError("Add the business name.");
      return;
    }
    const clean = (v: string) => (v.trim() === "" ? null : v.trim());
    const row: Record<string, unknown> = Object.fromEntries(FIELDS.map((f) => [f, clean(values[f])]));
    row.name = values.name.trim();
    row.industry_id = values.industry_id || null;
    if (isOwner) row.owner_id = values.owner_id || null;
    if (!lead) {
      row.org_id = orgId;
      // Managers can only create leads they own; the database enforces this too.
      if (!isOwner) row.owner_id = me;
    }
    save.mutate(
      { id: lead?.id, values: row },
      {
        onSuccess: (saved) => {
          onOpenChange(false);
          onSaved?.(saved);
        },
        onError: (e) => setError(e.message),
      },
    );
  };

  const text = (k: (typeof FIELDS)[number], label: string, props: { type?: string; placeholder?: string } = {}) => (
    <Field label={label} htmlFor={`lead-${k}`}>
      <Input id={`lead-${k}`} value={values[k]} onChange={(e) => set(k)(e.target.value)} className={inputClass} {...props} />
    </Field>
  );

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={lead ? `Edit ${lead.name}` : "New lead"}
      description="Leave anything you don't know blank. Blank means not found yet, never 'doesn't have one'."
      onSubmit={submit}
      pending={save.isPending}
      error={error}
      wide
    >
      {text("name", "Business name")}
      {similar.length > 0 && (
        <p className="rounded-xl bg-warning-soft px-3 py-2 text-sm text-warning">
          Looks like{" "}
          {similar.slice(0, 3).map((s, i) => (
            <span key={s.id}>
              {i > 0 && ", "}
              <Link to={`/hub/crm/leads/${s.id}`} className="font-medium underline" onClick={() => onOpenChange(false)}>
                {s.name}
              </Link>
            </span>
          ))}
          . Check it isn't the same business.
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Industry">
          <SelectField
            label="Industry"
            value={values.industry_id}
            onChange={set("industry_id")}
            options={[{ value: "", label: "Not set" }, ...(industries.data ?? []).map((i) => ({ value: i.id, label: i.name }))]}
          />
        </Field>
        {text("business_type", "Business type", { placeholder: "e.g. Used car dealer" })}
        {text("area", "Area", { placeholder: "e.g. Kilimani" })}
        {isOwner && (
          <Field label="Assigned to">
            <SelectField
              label="Assigned to"
              value={values.owner_id}
              onChange={set("owner_id")}
              options={[
                { value: "", label: "Unassigned" },
                ...(members.data ?? []).filter((m) => m.role !== "viewer").map((m) => ({ value: m.user_id, label: m.email })),
              ]}
            />
          </Field>
        )}
        {text("email", "Email", { type: "email" })}
        {text("phone", "Phone", { type: "tel" })}
        {text("website", "Website")}
        {text("instagram", "Instagram")}
        {text("facebook", "Facebook")}
        {text("tiktok", "TikTok")}
      </div>
      <Field label="Notes" htmlFor="lead-notes">
        <Textarea id="lead-notes" value={values.notes} onChange={(e) => set("notes")(e.target.value)} rows={3} className="rounded-xl bg-background" />
      </Field>
    </FormDialog>
  );
}
