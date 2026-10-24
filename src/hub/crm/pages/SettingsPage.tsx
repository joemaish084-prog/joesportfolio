import { useEffect, useState, type ReactNode } from "react";
import { format, parseISO } from "date-fns";
import { Loader2, Lock, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { BlurFade } from "../../components/motion/blur-fade";
import { Field, inputClass } from "../../components/form";
import { PageHeader, Pill, Section } from "../../components/ui";
import { SelectField, useOwnerLabel } from "../components/bits";
import { MfaSettings } from "../components/MfaSettings";
import { DEFAULT_FIT_WEIGHTS, FIT_FACTORS, FIT_FACTOR_LABEL } from "../lib/fitScore";
import {
  useAddMember,
  useAddSuppression,
  useAuditLog,
  useCrm,
  useIndustries,
  useMembers,
  useOrg,
  usePurgeStale,
  useRemoveSuppression,
  useSaveIndustry,
  useSaveOrg,
  useSuppression,
  useUpdateMember,
} from "../lib/queries";
import { ROLE_LABEL, SUPPRESSION_REASON_LABEL, type CrmOrganisation, type CrmRole, type Suppression } from "../lib/types";

const DAYS = [
  [1, "Mon"],
  [2, "Tue"],
  [3, "Wed"],
  [4, "Thu"],
  [5, "Fri"],
  [6, "Sat"],
  [7, "Sun"],
] as const;

function SaveBar({ dirty, pending, onSave, onReset }: { dirty: boolean; pending: boolean; onSave: () => void; onReset: () => void }) {
  if (!dirty) return null;
  return (
    <div className="flex justify-end gap-2 border-t border-border/60 px-5 py-3">
      <Button size="sm" variant="ghost" className="rounded-full" onClick={onReset}>
        Undo
      </Button>
      <Button size="sm" className="rounded-full" onClick={onSave} disabled={pending}>
        {pending && <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />} Save
      </Button>
    </div>
  );
}

/** Local copy of some org fields with save/undo. */
function useOrgForm<T extends Partial<CrmOrganisation>>(pick: (o: CrmOrganisation) => T) {
  const org = useOrg();
  const save = useSaveOrg();
  const [v, setV] = useState<T | null>(null);
  const base = org.data ? pick(org.data) : null;
  useEffect(() => {
    if (org.data) setV(pick(org.data));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [org.data]);
  const dirty = !!v && !!base && JSON.stringify(v) !== JSON.stringify(base);
  const submit = (values: Partial<CrmOrganisation> = v ?? {}) =>
    org.data &&
    save.mutate({ id: org.data.id, values: values as Record<string, unknown> }, { onSuccess: () => toast.success("Saved"), onError: (e) => toast.error(e.message) });
  return { org: org.data, v, setV, dirty, reset: () => base && setV(base), submit, pending: save.isPending };
}

function SenderSettings({ readOnly }: { readOnly: boolean }) {
  const f = useOrgForm((o) => ({
    sender_name: o.sender_name ?? "",
    sender_business: o.sender_business ?? "",
    sender_email: o.sender_email ?? "",
    sender_phone: o.sender_phone ?? "",
    sender_signature: o.sender_signature ?? "",
  }));
  if (!f.v) return null;
  const v = f.v;
  const input = (k: keyof typeof v, label: string, type = "text") => (
    <Field label={label} htmlFor={`s-${k}`}>
      <Input id={`s-${k}`} type={type} readOnly={readOnly} value={v[k]} onChange={(e) => f.setV({ ...v, [k]: e.target.value })} className={inputClass} />
    </Field>
  );
  return (
    <Section title="Sender identity">
      <div className="space-y-4 p-5">
        <p className="text-sm text-muted-foreground">Every draft says who it's from. Use your real name and business; people should always know who's contacting them.</p>
        <div className="grid gap-4 sm:grid-cols-2">
          {input("sender_name", "Your name")}
          {input("sender_business", "Business name")}
          {input("sender_email", "Reply-to email", "email")}
          {input("sender_phone", "Phone", "tel")}
        </div>
        <Field label="Email sign-off" htmlFor="s-sig" hint="Leave blank to use the four fields above.">
          <Textarea id="s-sig" rows={4} readOnly={readOnly} value={v.sender_signature} onChange={(e) => f.setV({ ...v, sender_signature: e.target.value })} className="rounded-xl bg-background" />
        </Field>
      </div>
      {!readOnly && (
        <SaveBar
          dirty={f.dirty}
          pending={f.pending}
          onReset={f.reset}
          onSave={() =>
            f.submit(Object.fromEntries(Object.entries(v).map(([k, x]) => [k, (x as string).trim() || null])) as Partial<CrmOrganisation>)
          }
        />
      )}
    </Section>
  );
}

function SendingSettings({ readOnly }: { readOnly: boolean }) {
  const f = useOrgForm((o) => ({
    sending_mode: o.sending_mode,
    daily_send_limit: o.daily_send_limit,
    send_window_start: o.send_window_start.slice(0, 5),
    send_window_end: o.send_window_end.slice(0, 5),
    send_days: o.send_days,
  }));
  if (!f.v || !f.org) return null;
  const v = f.v;
  return (
    <Section title="Sending">
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-4 rounded-2xl bg-secondary/60 p-4">
          <div className="text-sm">
            <p className="flex items-center gap-2 font-medium">
              <Lock className="h-4 w-4" /> Sending from the CRM: off
            </p>
            <p className="text-muted-foreground">
              No email provider is connected, so nothing can be sent from here; the database refuses it too. You send from Gmail or WhatsApp and
              log it. Automation: drafts and reminders only.
            </p>
          </div>
          <Switch aria-label="Send from the CRM" checked={f.org.sending_enabled} disabled />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Approval">
            <SelectField
              label="Approval"
              disabled={readOnly}
              value={v.sending_mode}
              onChange={(x) => f.setV({ ...v, sending_mode: x as CrmOrganisation["sending_mode"] })}
              options={[
                { value: "manual_approval", label: "Approve each draft on its own" },
                { value: "batch_approval", label: "Allow batch approval (drafts without warnings)" },
              ]}
            />
          </Field>
          <Field label="Daily email limit" htmlFor="s-limit" hint="Applies once a provider is connected.">
            <Input
              id="s-limit"
              type="number"
              min={0}
              max={200}
              readOnly={readOnly}
              value={v.daily_send_limit}
              onChange={(e) => f.setV({ ...v, daily_send_limit: Math.max(0, Math.min(200, Number(e.target.value) || 0)) })}
              className={inputClass}
            />
          </Field>
          <Field label="Sending hours (Nairobi)">
            <div className="flex items-center gap-2">
              <Input type="time" aria-label="From" readOnly={readOnly} value={v.send_window_start} onChange={(e) => f.setV({ ...v, send_window_start: e.target.value })} className={inputClass} />
              <span className="text-sm text-muted-foreground">to</span>
              <Input type="time" aria-label="To" readOnly={readOnly} value={v.send_window_end} onChange={(e) => f.setV({ ...v, send_window_end: e.target.value })} className={inputClass} />
            </div>
          </Field>
          <Field label="Sending days">
            <div className="flex flex-wrap gap-1">
              {DAYS.map(([n, label]) => {
                const on = v.send_days.includes(n);
                return (
                  <button
                    key={n}
                    type="button"
                    disabled={readOnly}
                    aria-pressed={on}
                    onClick={() => f.setV({ ...v, send_days: on ? v.send_days.filter((d) => d !== n) : [...v.send_days, n].sort() })}
                    className={`rounded-full border px-3 py-1.5 text-xs ${on ? "border-primary/40 bg-tint font-medium text-on-tint" : "border-border text-muted-foreground"}`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </Field>
        </div>
      </div>
      {!readOnly && (
        <SaveBar
          dirty={f.dirty}
          pending={f.pending}
          onReset={f.reset}
          onSave={() => {
            if (v.send_window_start >= v.send_window_end) return toast.error("The start time must be before the end time.");
            f.submit(v);
          }}
        />
      )}
    </Section>
  );
}

function SequenceSettings({ readOnly }: { readOnly: boolean }) {
  const f = useOrgForm((o) => ({ follow_up_sequence: o.follow_up_sequence }));
  if (!f.v) return null;
  const steps = f.v.follow_up_sequence;
  return (
    <Section title="Follow-up sequence">
      <div className="space-y-3 p-5">
        <p className="text-sm text-muted-foreground">
          Reminders, not automatic sends. Each step counts business days from the one before. Suggested: 4 to 5, then 5 to 7.
        </p>
        {steps.map((s, i) => (
          <div key={i} className="flex flex-wrap items-center gap-3 text-sm">
            <span className="w-28 font-medium">Follow-up {i + 1}</span>
            <Input
              type="number"
              aria-label={`Business days before follow-up ${i + 1}`}
              min={1}
              max={30}
              readOnly={readOnly}
              value={s.business_days}
              onChange={(e) =>
                f.setV({
                  follow_up_sequence: steps.map((x, j) => (j === i ? { ...x, business_days: Math.max(1, Math.min(30, Number(e.target.value) || 1)) } : x)),
                })
              }
              className="h-10 w-20 rounded-xl"
            />
            <span className="text-muted-foreground">business days after {i === 0 ? "the first message" : `follow-up ${i}`}</span>
          </div>
        ))}
      </div>
      {!readOnly && <SaveBar dirty={f.dirty} pending={f.pending} onReset={f.reset} onSave={() => f.submit()} />}
    </Section>
  );
}

function FitWeightSettings({ readOnly }: { readOnly: boolean }) {
  const f = useOrgForm((o) => ({ fit_weights: { ...DEFAULT_FIT_WEIGHTS, ...o.fit_weights } as Record<string, number> }));
  if (!f.v) return null;
  const w = f.v.fit_weights;
  return (
    <Section title="Prospect-fit weights">
      <div className="space-y-2 p-5">
        <p className="mb-2 text-sm text-muted-foreground">How much each factor counts. Unknown factors are left out, so the score is only from what you've rated.</p>
        {FIT_FACTORS.map((factor) => (
          <div key={factor} className="flex items-center gap-3 text-sm">
            <span className="min-w-0 flex-1">{FIT_FACTOR_LABEL[factor]}</span>
            <Input
              type="number"
              aria-label={`Weight for ${FIT_FACTOR_LABEL[factor]}`}
              min={0}
              max={100}
              readOnly={readOnly}
              value={w[factor]}
              onChange={(e) => f.setV({ fit_weights: { ...w, [factor]: Math.max(0, Math.min(100, Number(e.target.value) || 0)) } })}
              className="h-9 w-20 rounded-lg"
            />
          </div>
        ))}
        <p className="pt-2 text-xs text-muted-foreground">Saved scores refresh the next time you rate a lead.</p>
      </div>
      {!readOnly && <SaveBar dirty={f.dirty} pending={f.pending} onReset={f.reset} onSave={() => f.submit()} />}
    </Section>
  );
}

function TeamSettings() {
  const members = useMembers();
  const add = useAddMember();
  const update = useUpdateMember();
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<CrmRole>("manager");
  return (
    <Section title="Team">
      <ul>
        {(members.data ?? []).map((m) => (
          <li key={m.user_id} className="flex flex-wrap items-center gap-3 border-b border-border/60 px-5 py-3">
            <span className="min-w-0 flex-1 truncate text-sm">{m.email}</span>
            <SelectField
              label={`Role for ${m.email}`}
              className="w-32"
              value={m.role}
              disabled={update.isPending}
              onChange={(r) => update.mutate({ userId: m.user_id, role: r }, { onError: (e) => toast.error(e.message) })}
              options={(Object.keys(ROLE_LABEL) as CrmRole[]).map((r) => ({ value: r, label: ROLE_LABEL[r] }))}
            />
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 rounded-lg"
              aria-label={`Remove ${m.email}`}
              onClick={() =>
                window.confirm(`Remove ${m.email} from the CRM?`) &&
                update.mutate({ userId: m.user_id, role: null }, { onError: (e) => toast.error(e.message) })
              }
            >
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </li>
        ))}
      </ul>
      <form
        className="flex flex-wrap items-end gap-2 px-5 py-4"
        onSubmit={(e) => {
          e.preventDefault();
          add.mutate(
            { email, role },
            {
              onSuccess: () => {
                toast.success("Added");
                setEmail("");
              },
              onError: (err) => toast.error(err.message),
            },
          );
        }}
      >
        <Field label="Add someone" htmlFor="m-email" className="min-w-[14rem] flex-1">
          <Input id="m-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="their@email.com" className={inputClass} />
        </Field>
        <SelectField label="Role" className="w-32" value={role} onChange={(r) => setRole(r as CrmRole)} options={(Object.keys(ROLE_LABEL) as CrmRole[]).map((r) => ({ value: r, label: ROLE_LABEL[r] }))} />
        <Button type="submit" className="h-10 rounded-full" disabled={add.isPending || !email.includes("@")}>
          Add
        </Button>
      </form>
      <p className="px-5 pb-4 text-xs text-muted-foreground">
        There's no public sign-up. Create their account first in Supabase (Authentication → Users → Add user), then add them here. Managers see
        and edit leads assigned to them; viewers only see leads you share with them.
      </p>
    </Section>
  );
}

function IndustrySettings() {
  const industries = useIndustries();
  const save = useSaveIndustry();
  const { orgId } = useCrm();
  const [name, setName] = useState("");
  return (
    <Section title="Industries">
      <div className="flex flex-wrap gap-2 p-5">
        {(industries.data ?? []).map((i) => (
          <Pill key={i.id} tone="outline">
            {i.name}
          </Pill>
        ))}
      </div>
      <form
        className="flex gap-2 px-5 pb-5"
        onSubmit={(e) => {
          e.preventDefault();
          const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_|_$/g, "");
          if (!slug) return;
          save.mutate({ values: { org_id: orgId, slug, name: name.trim() } }, { onSuccess: () => setName(""), onError: (err) => toast.error(err.message) });
        }}
      >
        <Input aria-label="New industry" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Hotels" className="h-10 max-w-xs rounded-xl" />
        <Button type="submit" variant="outline" className="h-10 rounded-full" disabled={!name.trim() || save.isPending}>
          Add
        </Button>
      </form>
    </Section>
  );
}

function SuppressionSettings({ canRemove }: { canRemove: boolean }) {
  const list = useSuppression();
  const add = useAddSuppression();
  const remove = useRemoveSuppression();
  const [kind, setKind] = useState<Suppression["kind"]>("email");
  const [value, setValue] = useState("");
  const [reason, setReason] = useState<Suppression["reason"]>("opted_out");
  return (
    <Section title="Do-not-contact list">
      <p className="px-5 pt-4 text-sm text-muted-foreground">
        Emails, numbers and domains here are never contacted, whatever lead they turn up on. Opt-outs and complaints also mark matching leads do
        not contact. Removing an entry doesn't undo that.
      </p>
      <form
        className="flex flex-wrap items-end gap-2 p-5"
        onSubmit={(e) => {
          e.preventDefault();
          add.mutate({ kind, value: value.trim(), reason }, { onSuccess: () => setValue(""), onError: (err) => toast.error(err.message) });
        }}
      >
        <SelectField
          label="Type"
          className="w-28"
          value={kind}
          onChange={(k) => setKind(k as Suppression["kind"])}
          options={[
            { value: "email", label: "Email" },
            { value: "phone", label: "Phone" },
            { value: "domain", label: "Domain" },
          ]}
        />
        <Input aria-label="Value" value={value} onChange={(e) => setValue(e.target.value)} placeholder={kind === "domain" ? "dealer.co.ke" : kind === "phone" ? "0722 000 000" : "name@dealer.co.ke"} className="h-10 min-w-[12rem] flex-1 rounded-xl" />
        <SelectField
          label="Reason"
          className="w-36"
          value={reason}
          onChange={(r) => setReason(r as Suppression["reason"])}
          options={(["opted_out", "complaint", "bounced", "manual"] as const).map((r) => ({ value: r, label: SUPPRESSION_REASON_LABEL[r] }))}
        />
        <Button type="submit" className="h-10 rounded-full" disabled={!value.trim() || add.isPending}>
          Add
        </Button>
      </form>
      {(list.data ?? []).length > 0 && (
        <ul className="border-t border-border/60">
          {(list.data ?? []).map((s) => (
            <li key={s.id} className="flex items-center gap-3 border-b border-border/60 px-5 py-2.5 text-sm last:border-b-0">
              <Pill tone="outline" className="w-16 justify-center">
                {s.kind}
              </Pill>
              <span className="min-w-0 flex-1 truncate">{s.value}</span>
              <span className="text-xs text-muted-foreground">
                {SUPPRESSION_REASON_LABEL[s.reason]} · {format(parseISO(s.created_at), "d MMM yyyy")}
              </span>
              {canRemove && (
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8 rounded-lg"
                  aria-label={`Remove ${s.value}`}
                  onClick={() => window.confirm(`Allow contacting ${s.value} again?`) && remove.mutate(s.id, { onError: (e) => toast.error(e.message) })}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

function DataSettings() {
  const f = useOrgForm((o) => ({ retention_months: o.retention_months }));
  const purge = usePurgeStale();
  if (!f.v) return null;
  return (
    <Section title="Data and retention">
      <div className="space-y-4 p-5 text-sm">
        <Field label="Keep closed leads for (months)" htmlFor="ret" hint="Lost, not interested and do-not-contact leads untouched for this long can be deleted. Suppression entries are kept.">
          <Input
            id="ret"
            type="number"
            min={1}
            max={120}
            value={f.v.retention_months}
            onChange={(e) => f.setV({ retention_months: Math.max(1, Math.min(120, Number(e.target.value) || 1)) })}
            className={`${inputClass} w-28`}
          />
        </Field>
        <Button
          variant="outline"
          className="rounded-full"
          disabled={purge.isPending || f.dirty}
          onClick={() =>
            window.confirm(`Permanently delete closed leads untouched for ${f.v!.retention_months} months?`) &&
            purge.mutate(undefined, { onSuccess: (n) => toast.success(`${n} leads deleted`), onError: (e) => toast.error(e.message) })
          }
        >
          Delete old closed leads now
        </Button>
        <p className="text-xs text-muted-foreground">
          Backups: Supabase keeps daily backups on paid plans (Database → Backups). Export leads from the Leads page before big changes.
        </p>
      </div>
      <SaveBar dirty={f.dirty} pending={f.pending} onReset={f.reset} onSave={() => f.submit()} />
    </Section>
  );
}

function AuditLogSection() {
  const log = useAuditLog(true);
  const who = useOwnerLabel();
  return (
    <Section title="Audit log">
      {(log.data ?? []).length === 0 ? (
        <p className="p-5 text-sm text-muted-foreground">Nothing yet.</p>
      ) : (
        <ul className="max-h-[28rem] overflow-y-auto">
          {(log.data ?? []).map((a) => (
            <li key={a.id} className="border-b border-border/60 px-5 py-2.5 text-sm last:border-b-0">
              <span className="font-medium">{a.action}</span>
              <span className="text-muted-foreground">
                {" "}
                · {a.actor_id ? who(a.actor_id) : "System"} · {format(parseISO(a.created_at), "d MMM yyyy, HH:mm")}
              </span>
              {Object.keys(a.details).length > 0 && (
                <span className="block truncate text-xs text-muted-foreground">
                  {Object.entries(a.details)
                    .filter(([k]) => k !== "filters")
                    .map(([k, v]) => `${k}: ${typeof v === "object" ? JSON.stringify(v) : String(v)}`)
                    .join(" · ")}
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold">{title}</h2>
      {children}
    </div>
  );
}

export default function SettingsPage() {
  const { isOwner, canEdit } = useCrm();
  return (
    <>
      <BlurFade>
        <PageHeader title="CRM settings" subtitle={isOwner ? "Only owners can change these." : "Read-only. Ask an owner to change settings."} />
      </BlurFade>
      <div className="space-y-10">
        <Group title="Outreach">
          <SenderSettings readOnly={!isOwner} />
          <SendingSettings readOnly={!isOwner} />
          <SequenceSettings readOnly={!isOwner} />
          <FitWeightSettings readOnly={!isOwner} />
        </Group>
        <Group title="Security">
          <MfaSettings />
          {isOwner && <TeamSettings />}
        </Group>
        {canEdit && (
          <Group title="Contact rules">
            <SuppressionSettings canRemove={isOwner} />
          </Group>
        )}
        {isOwner && (
          <Group title="Data">
            <IndustrySettings />
            <DataSettings />
            <AuditLogSection />
          </Group>
        )}
      </div>
    </>
  );
}
