import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useRows, useSaveRow } from "../../lib/data";
import { toNumberOrNull } from "../../lib/format";
import { useClientTypes } from "../../lib/queries";
import {
  LEAD_SOURCES,
  LEAD_SOURCE_LABEL,
  LEAD_STAGES,
  LEAD_STAGE_LABEL,
  SERVICES,
  type Lead,
  type LeadSource,
  type LeadStage,
} from "../../lib/types";
import { Chips, Field, FormDialog, MoneyInput, inputClass } from "../form";
import { DatePicker } from "../pickers";

export function LeadDialog({
  open,
  onOpenChange,
  lead,
  stage: initialStage = "new",
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead?: Lead | null;
  stage?: LeadStage;
}) {
  const save = useSaveRow("leads");
  const leads = useRows("leads", "position", true);
  const types = useClientTypes();
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [website, setWebsite] = useState("");
  const [industry, setIndustry] = useState("");
  const [typeId, setTypeId] = useState<string | null>(null);
  const [source, setSource] = useState<LeadSource>("referral");
  const [stage, setStage] = useState<LeadStage>("new");
  const [value, setValue] = useState("");
  const [services, setServices] = useState<string[]>([]);
  const [followUp, setFollowUp] = useState<string | null>(null);
  const [lostReason, setLostReason] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setName(lead?.name ?? "");
    setContact(lead?.contact_person ?? "");
    setEmail(lead?.email ?? "");
    setPhone(lead?.phone ?? "");
    setWebsite(lead?.website ?? "");
    setIndustry(lead?.industry ?? "");
    setTypeId(lead?.client_type_id ?? null);
    setSource(lead?.source ?? "referral");
    setStage(lead?.stage ?? initialStage);
    setValue(lead?.estimated_value != null ? String(lead.estimated_value) : "");
    setServices(lead?.services ?? []);
    setFollowUp(lead?.next_follow_up ?? null);
    setLostReason(lead?.lost_reason ?? "");
    setNotes(lead?.notes ?? "");
    setError(null);
  }, [open, lead, initialStage]);

  const submit = () => {
    if (!name.trim()) return setError("Give the lead a name.");
    const estimate = toNumberOrNull(value);
    if (value.trim() && estimate === null) return setError("Estimated value should be a number.");
    const blank = (v: string) => v.trim() || null;
    // New cards go to the bottom of their column.
    const position =
      lead && lead.stage === stage
        ? lead.position
        : Math.max(0, ...(leads.data ?? []).filter((l) => l.stage === stage).map((l) => l.position)) + 1;
    save.mutate(
      {
        id: lead?.id,
        values: {
          name: name.trim(),
          contact_person: blank(contact),
          email: blank(email),
          phone: blank(phone),
          website: blank(website),
          industry: blank(industry),
          client_type_id: typeId,
          source,
          stage,
          estimated_value: estimate,
          services,
          next_follow_up: followUp,
          lost_reason: stage === "lost" ? blank(lostReason) : null,
          notes: blank(notes),
          position,
        },
      },
      {
        onSuccess: () => {
          toast.success(lead ? "Lead updated" : "Lead added");
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
      title={lead ? `Edit ${lead.name}` : "New lead"}
      onSubmit={submit}
      submitLabel={lead ? "Save" : "Add lead"}
      pending={save.isPending}
      error={error}
      wide
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Business / name" htmlFor="lead-name">
          <Input
            id="lead-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            autoFocus={!lead}
          />
        </Field>
        <Field label="Contact person" htmlFor="lead-contact">
          <Input
            id="lead-contact"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Phone / WhatsApp" htmlFor="lead-phone">
          <Input
            id="lead-phone"
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Email" htmlFor="lead-email">
          <Input
            id="lead-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={inputClass}
          />
        </Field>
        <Field label="Stage">
          <Select value={stage} onValueChange={(v) => setStage(v as LeadStage)}>
            <SelectTrigger className={inputClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEAD_STAGES.map((s) => (
                <SelectItem key={s} value={s}>
                  {LEAD_STAGE_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Source">
          <Select value={source} onValueChange={(v) => setSource(v as LeadSource)}>
            <SelectTrigger className={inputClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LEAD_SOURCES.map((s) => (
                <SelectItem key={s} value={s}>
                  {LEAD_SOURCE_LABEL[s]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Estimated monthly value" htmlFor="lead-value">
          <MoneyInput id="lead-value" value={value} onChange={setValue} />
        </Field>
        <Field label="Next follow-up">
          <DatePicker value={followUp} onChange={setFollowUp} placeholder="No follow-up set" />
        </Field>
        <Field label="Client type">
          <Select value={typeId ?? "__none"} onValueChange={(v) => setTypeId(v === "__none" ? null : v)}>
            <SelectTrigger className={inputClass}>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__none">Not sure yet</SelectItem>
              {types.data?.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Industry" htmlFor="lead-industry">
          <Input
            id="lead-industry"
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className={inputClass}
          />
        </Field>
      </div>
      <Field label="Interested in">
        <Chips options={SERVICES} value={services} onChange={setServices} />
      </Field>
      {stage === "lost" && (
        <Field label="Why was it lost?" htmlFor="lead-lost">
          <Input
            id="lead-lost"
            value={lostReason}
            onChange={(e) => setLostReason(e.target.value)}
            placeholder="e.g. Budget, went with another agency"
            className={inputClass}
          />
        </Field>
      )}
      <Field label="Notes" htmlFor="lead-notes">
        <Textarea
          id="lead-notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="rounded-xl bg-background"
        />
      </Field>
      <Field label="Website" htmlFor="lead-website">
        <Input id="lead-website" value={website} onChange={(e) => setWebsite(e.target.value)} className={inputClass} />
      </Field>
    </FormDialog>
  );
}
