import { useEffect, useMemo, useState } from "react";
import { format, formatDistanceToNow, parseISO } from "date-fns";
import {
  AlertTriangle,
  Check,
  Copy,
  ExternalLink,
  Instagram,
  Loader2,
  Mail,
  MessageCircle,
  PenLine,
  RefreshCw,
  Send,
  Sparkles,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { checkDraft } from "../../../../../supabase/functions/_shared/crm/draftRules";
import { withinSendWindow } from "../../../../../supabase/functions/_shared/crm/sendGuards";
import { Field, FormDialog, inputClass } from "../../../components/form";
import { EmptyState, Pill, Section } from "../../../components/ui";
import { gmailComposeUrl, instagramUrl, mailtoUrl, whatsappUrl } from "../../lib/links";
import { emailKey } from "../../lib/normalize";
import {
  useAddSuppression,
  useCrm,
  useGenerateDraft,
  useLeadContacts,
  useLeadDrafts,
  useLeadMessages,
  useLogComposeOpened,
  useLogMessage,
  useOrg,
  useSaveDraft,
} from "../../lib/queries";
import {
  DRAFT_KINDS,
  DRAFT_KIND_CHANNEL,
  DRAFT_KIND_LABEL,
  MESSAGE_STATUS_LABEL,
  type CrmLead,
  type CrmOrganisation,
  type DraftKind,
  type OutreachDraft,
} from "../../lib/types";
import { SelectField } from "../bits";
import { FollowUpList } from "./FollowUpList";

const STATUS_TONE = { draft: "outline", approved: "accent", used: "muted", rejected: "muted", superseded: "muted" } as const;
const STATUS_LABEL = { draft: "Needs approval", approved: "Approved", used: "Sent", rejected: "Rejected", superseded: "Replaced" };

async function copy(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    toast.success("Copied");
  } catch {
    toast.error("Couldn't copy; select the text and copy it yourself.");
  }
}

function DraftCard({
  draft,
  lead,
  org,
  onRegenerate,
  regenerating,
}: {
  draft: OutreachDraft;
  lead: CrmLead;
  org: CrmOrganisation | undefined;
  onRegenerate: () => void;
  regenerating: boolean;
}) {
  const { canEdit } = useCrm();
  const save = useSaveDraft();
  const logMessage = useLogMessage();
  const logOpened = useLogComposeOpened();
  const contacts = useLeadContacts(lead.id);
  const [subject, setSubject] = useState(draft.subject ?? "");
  const [body, setBody] = useState(draft.body);
  const [confirmSent, setConfirmSent] = useState(false);

  useEffect(() => {
    setSubject(draft.subject ?? "");
    setBody(draft.body);
  }, [draft.subject, draft.body]);

  const dirty = subject !== (draft.subject ?? "") || body !== draft.body;
  const editable = canEdit && (draft.status === "draft" || draft.status === "approved");
  const isNotes = draft.channel === "notes";
  const warnings = checkDraft(draft.kind, { subject, body }, { leadName: lead.name, senderName: org?.sender_name });

  // Email addresses and phones on the lead and its contacts, minus opted-out contacts.
  const emails = useMemo(() => {
    const list = [lead.email, ...(contacts.data ?? []).filter((c) => !c.opted_out).map((c) => c.email)].filter(
      (e): e is string => !!e && !!emailKey(e),
    );
    return [...new Set(list)];
  }, [lead.email, contacts.data]);
  const phones = useMemo(
    () => [...new Set([lead.phone, ...(contacts.data ?? []).filter((c) => !c.opted_out).map((c) => c.phone)].filter((p): p is string => !!p))],
    [lead.phone, contacts.data],
  );
  const [to, setTo] = useState("");
  useEffect(() => {
    if (!to) setTo(draft.channel === "email" ? (emails[0] ?? "") : (phones.find((p) => whatsappUrl(p, "")) ?? phones[0] ?? ""));
  }, [emails, phones, draft.channel, to]);

  const saveText = () =>
    save.mutate(
      { id: draft.id, values: { subject: draft.channel === "email" ? subject : null, body } },
      {
        onSuccess: () => toast.success(draft.status === "approved" ? "Saved. It needs approving again." : "Saved"),
        onError: (e) => toast.error(e.message),
      },
    );

  const setStatus = (status: "approved" | "rejected") => {
    if (status === "approved" && warnings.length && !window.confirm(`Approve with ${warnings.length} warning(s)?\n\n- ${warnings.join("\n- ")}`)) return;
    save.mutate(
      { id: draft.id, values: { status } },
      { onSuccess: () => toast.success(status === "approved" ? "Approved" : "Rejected"), onError: (e) => toast.error(e.message) },
    );
  };

  const opened = (type: "whatsapp_opened" | "email_compose_opened" | "instagram_opened") => {
    logOpened.mutate({ lead_id: lead.id, type });
    setConfirmSent(true);
  };

  const markSent = () =>
    logMessage.mutate(
      {
        lead_id: lead.id,
        draft_id: draft.id,
        campaign_id: draft.campaign_id,
        channel: draft.channel === "notes" ? "other" : draft.channel,
        direction: "outbound",
        to_address: to || null,
        subject: draft.channel === "email" ? subject : null,
        body,
      },
      {
        onSuccess: () => {
          toast.success("Logged as sent by you");
          setConfirmSent(false);
        },
        onError: (e) => toast.error(e.message),
      },
    );

  const outsideHours = org && !withinSendWindow(org, new Date());
  const wa = draft.channel === "whatsapp" ? whatsappUrl(to, body) : null;
  const ig = draft.channel === "instagram" ? instagramUrl(lead.instagram) : null;

  return (
    <article className="border-b border-border/60 p-5 last:border-b-0">
      <header className="mb-3 flex flex-wrap items-center gap-2">
        <h3 className="text-sm font-semibold">{DRAFT_KIND_LABEL[draft.kind]}</h3>
        {!isNotes && <Pill tone={STATUS_TONE[draft.status]}>{STATUS_LABEL[draft.status]}</Pill>}
        <span className="text-xs text-muted-foreground">
          {formatDistanceToNow(parseISO(draft.created_at), { addSuffix: true })}
          {draft.model ? ` · AI draft` : ""}
        </span>
        {canEdit && draft.status === "draft" && (
          <Button size="sm" variant="ghost" className="ml-auto h-8 rounded-lg" onClick={onRegenerate} disabled={regenerating}>
            {regenerating ? <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="mr-1 h-3.5 w-3.5" />}
            Regenerate
          </Button>
        )}
      </header>

      {draft.assumptions.length > 0 && (
        <div className="mb-3 rounded-xl bg-warning-soft px-3 py-2 text-xs text-warning">
          <p className="font-semibold">Leans on things that aren't verified:</p>
          <ul className="mt-1 list-disc space-y-0.5 pl-4">
            {draft.assumptions.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </div>
      )}

      {draft.channel === "email" && (
        <Field label="Subject" htmlFor={`subject-${draft.id}`} className="mb-3">
          <Input
            id={`subject-${draft.id}`}
            value={subject}
            readOnly={!editable}
            onChange={(e) => setSubject(e.target.value.slice(0, 200))}
            className={inputClass}
          />
        </Field>
      )}
      <Field label={isNotes ? "Notes" : "Message"} htmlFor={`body-${draft.id}`}>
        <Textarea
          id={`body-${draft.id}`}
          value={body}
          readOnly={!editable}
          onChange={(e) => setBody(e.target.value.slice(0, 20000))}
          rows={isNotes ? 14 : draft.channel === "email" ? 11 : 6}
          className="rounded-xl bg-background text-[0.9375rem] leading-relaxed"
        />
      </Field>
      <p className="mt-1 text-right text-[0.6875rem] text-muted-foreground">{body.length} characters</p>

      {warnings.length > 0 && !isNotes && (
        <ul className="mt-2 space-y-1">
          {warnings.map((w) => (
            <li key={w} className="flex items-start gap-1.5 text-xs text-warning">
              <AlertTriangle className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {w}
            </li>
          ))}
        </ul>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {isNotes ? (
          <Button size="sm" variant="outline" className="rounded-full" onClick={() => copy(body)}>
            <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy notes
          </Button>
        ) : (
          <>
            {editable && dirty && (
              <Button size="sm" variant="outline" className="rounded-full" onClick={saveText} disabled={save.isPending}>
                Save changes
              </Button>
            )}
            {canEdit && draft.status === "draft" && !dirty && (
              <>
                <Button size="sm" className="rounded-full" onClick={() => setStatus("approved")} disabled={save.isPending || lead.do_not_contact}>
                  <Check className="mr-1.5 h-3.5 w-3.5" /> Approve
                </Button>
                <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setStatus("rejected")} disabled={save.isPending}>
                  <X className="mr-1.5 h-3.5 w-3.5" /> Reject
                </Button>
              </>
            )}
            {draft.status === "draft" && dirty && <span className="text-xs text-muted-foreground">Save your changes before approving.</span>}
          </>
        )}
      </div>

      {draft.status === "approved" && canEdit && !dirty && !lead.do_not_contact && (
        <div className="mt-4 rounded-2xl bg-secondary/60 p-4">
          <p className="mb-3 text-sm font-medium">Send it yourself</p>
          {outsideHours && (
            <p className="mb-3 text-xs text-warning">
              It's outside your sending hours ({org?.send_window_start.slice(0, 5)} to {org?.send_window_end.slice(0, 5)}, weekdays). Consider
              sending later.
            </p>
          )}
          <div className="flex flex-wrap items-end gap-2">
            {draft.channel !== "instagram" && (
              <SelectField
                label={draft.channel === "email" ? "Send to" : "WhatsApp number"}
                className="w-64"
                value={to}
                onChange={setTo}
                options={
                  (draft.channel === "email" ? emails : phones).length
                    ? (draft.channel === "email" ? emails : phones).map((v) => ({ value: v, label: v }))
                    : [{ value: "", label: draft.channel === "email" ? "No valid email on file" : "No phone on file" }]
                }
              />
            )}
            {draft.channel === "email" && to && (
              <>
                <Button asChild size="sm" className="rounded-full">
                  <a href={gmailComposeUrl(to, subject, body)} target="_blank" rel="noopener noreferrer" onClick={() => opened("email_compose_opened")}>
                    <Mail className="mr-1.5 h-3.5 w-3.5" /> Open in Gmail
                  </a>
                </Button>
                <Button asChild size="sm" variant="outline" className="rounded-full">
                  <a href={mailtoUrl(to, subject, body)} onClick={() => opened("email_compose_opened")}>
                    <ExternalLink className="mr-1.5 h-3.5 w-3.5" /> Email app
                  </a>
                </Button>
              </>
            )}
            {draft.channel === "whatsapp" &&
              (wa ? (
                <Button asChild size="sm" className="rounded-full">
                  <a href={wa} target="_blank" rel="noopener noreferrer" onClick={() => opened("whatsapp_opened")}>
                    <MessageCircle className="mr-1.5 h-3.5 w-3.5" /> Open WhatsApp
                  </a>
                </Button>
              ) : (
                <span className="text-xs text-muted-foreground">That number can't take a WhatsApp link (a landline?). Copy the text instead.</span>
              ))}
            {draft.channel === "instagram" && (
              <Button
                size="sm"
                className="rounded-full"
                disabled={!ig}
                onClick={() => {
                  void copy(body);
                  if (ig) window.open(ig, "_blank", "noopener,noreferrer");
                  opened("instagram_opened");
                }}
              >
                <Instagram className="mr-1.5 h-3.5 w-3.5" /> {ig ? "Copy and open Instagram" : "No Instagram on file"}
              </Button>
            )}
            <Button size="sm" variant="ghost" className="rounded-full" onClick={() => copy(draft.channel === "email" ? `${subject}\n\n${body}` : body)}>
              <Copy className="mr-1.5 h-3.5 w-3.5" /> Copy
            </Button>
          </div>
          <div className={cn("mt-4 flex flex-wrap items-center gap-2 border-t border-border/60 pt-3", confirmSent && "rounded-xl bg-tint p-3")}>
            <p className="text-xs text-muted-foreground">
              {confirmSent ? "Did you press Send?" : "Once you've sent it:"} Logging records that you sent it, not that it was delivered or read.
            </p>
            <Button size="sm" variant={confirmSent ? "default" : "outline"} className="rounded-full" onClick={markSent} disabled={logMessage.isPending}>
              <Send className="mr-1.5 h-3.5 w-3.5" /> I've sent it
            </Button>
          </div>
        </div>
      )}
    </article>
  );
}

function ReplyDialog({ lead, open, onOpenChange }: { lead: CrmLead; open: boolean; onOpenChange: (o: boolean) => void }) {
  const logMessage = useLogMessage();
  const [channel, setChannel] = useState<"email" | "whatsapp" | "instagram" | "phone">("email");
  const [body, setBody] = useState("");
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (open) {
      setBody("");
      setError(null);
    }
  }, [open]);
  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title="Log a reply"
      description="Pending follow-ups stop, and the lead moves to Replied if it was earlier in the pipeline."
      submitLabel="Log reply"
      pending={logMessage.isPending}
      error={error}
      onSubmit={() =>
        logMessage.mutate(
          { lead_id: lead.id, channel, direction: "inbound", body: body.trim() || null },
          {
            onSuccess: () => {
              onOpenChange(false);
              toast.success("Reply logged");
            },
            onError: (e) => setError(e.message),
          },
        )
      }
    >
      <Field label="Came in by">
        <SelectField
          label="Came in by"
          value={channel}
          onChange={(v) => setChannel(v as typeof channel)}
          options={[
            { value: "email", label: "Email" },
            { value: "whatsapp", label: "WhatsApp" },
            { value: "instagram", label: "Instagram" },
            { value: "phone", label: "Phone call" },
          ]}
        />
      </Field>
      <Field label="What they said (optional)" htmlFor="reply-body">
        <Textarea id="reply-body" rows={5} value={body} onChange={(e) => setBody(e.target.value.slice(0, 5000))} className="rounded-xl bg-background" />
      </Field>
    </FormDialog>
  );
}

export function OutreachPanel({ lead, initialKind }: { lead: CrmLead; initialKind?: DraftKind | null }) {
  const { canEdit } = useCrm();
  const org = useOrg();
  const drafts = useLeadDrafts(lead.id);
  const messages = useLeadMessages(lead.id);
  const contacts = useLeadContacts(lead.id);
  const generate = useGenerateDraft();
  const saveDraft = useSaveDraft();
  const suppress = useAddSuppression();
  const [kind, setKind] = useState<DraftKind>(initialKind ?? "initial_email");
  const [contactId, setContactId] = useState("");
  const [instructions, setInstructions] = useState("");
  const [replyOpen, setReplyOpen] = useState(false);
  const [regenerating, setRegenerating] = useState<string | null>(null);

  useEffect(() => {
    if (initialKind) setKind(initialKind);
  }, [initialKind]);

  const visible = (drafts.data ?? []).filter((d) => d.status !== "superseded" && d.status !== "rejected");
  const open = visible.filter((d) => d.status === "draft" || d.status === "approved");
  const used = visible.filter((d) => d.status === "used");
  const blocked = lead.do_not_contact && kind !== "discovery_prep";

  // A hand-written draft: same approval and hand-off as an AI one, starting
  // from a greeting, the sender's name and (for email) the opt-out line.
  const writeMyself = () => {
    const sender = org.data?.sender_name ?? "";
    const contact = (contacts.data ?? []).find((c) => c.id === contactId);
    const greeting = contact?.name ? `Hi ${contact.name.split(/\s+/)[0]},` : `Hi ${lead.name} team,`;
    const channel = DRAFT_KIND_CHANNEL[kind];
    const optOut = channel === "email" ? `\n\nIf you'd rather not hear from me, just reply "no thanks" and I won't contact you again.` : "";
    const body =
      channel === "notes"
        ? `What we know (verified):\n- \n\nWhat we're assuming:\n- \n\nQuestions to ask:\n- `
        : `${greeting}\n\n${channel === "email" ? "" : `This is ${sender}${org.data?.sender_business ? ` from ${org.data.sender_business}` : ""}. `}\n${optOut}\n\n${sender}`;
    saveDraft.mutate(
      {
        values: {
          lead_id: lead.id,
          contact_id: contactId || null,
          kind,
          channel,
          subject: channel === "email" ? "" : null,
          body,
        },
      },
      { onSuccess: () => toast.success("Blank draft added. Write it, save, then approve."), onError: (e) => toast.error(e.message) },
    );
  };

  const run = (k: DraftKind, draftId?: string) => {
    if (draftId) setRegenerating(draftId);
    generate.mutate(
      { lead_id: lead.id, kind: k, contact_id: contactId || null, instructions: instructions.trim() || undefined },
      {
        onSuccess: () => toast.success("Draft ready. Review it before approving."),
        onError: (e) => toast.error(e.message),
        onSettled: () => setRegenerating(null),
      },
    );
  };

  const optOut = () => {
    if (!window.confirm(`Mark ${lead.name} as opted out? Their email and phone go on the suppression list and follow-ups stop.`)) return;
    const entries = [
      lead.email && { kind: "email" as const, value: lead.email },
      lead.phone && { kind: "phone" as const, value: lead.phone },
    ].filter(Boolean) as { kind: "email" | "phone"; value: string }[];
    if (entries.length === 0) {
      toast.error("No email or phone on file to suppress; mark the lead Do not contact instead.");
      return;
    }
    Promise.all(entries.map((e) => suppress.mutateAsync({ ...e, reason: "opted_out", lead_id: lead.id })))
      .then(() => toast.success("Opted out. Nothing more will go to them."))
      .catch((e: Error) => toast.error(e.message));
  };

  return (
    <div className="space-y-6">
      {lead.do_not_contact && (
        <p className="rounded-2xl bg-warning-soft px-4 py-3 text-sm text-warning">
          This lead is marked do not contact. Drafting and sending are switched off; only an owner can lift it.
        </p>
      )}
      {org.data && !org.data.sender_name && canEdit && (
        <p className="rounded-2xl bg-warning-soft px-4 py-3 text-sm text-warning">Add your sender name in CRM settings before writing drafts.</p>
      )}

      {canEdit && (
        <Section title="Write with AI">
          <div className="space-y-4 p-5">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="What to write">
                <SelectField
                  label="What to write"
                  value={kind}
                  onChange={(v) => setKind(v as DraftKind)}
                  options={DRAFT_KINDS.map((k) => ({ value: k, label: DRAFT_KIND_LABEL[k] }))}
                />
              </Field>
              <Field label="Addressed to">
                <SelectField
                  label="Addressed to"
                  value={contactId}
                  onChange={setContactId}
                  options={[
                    { value: "", label: "The business (no named person)" },
                    ...(contacts.data ?? [])
                      .filter((c) => !c.opted_out && c.name)
                      .map((c) => ({ value: c.id, label: `${c.name}${c.verification === "verified" ? "" : " (not verified)"}` })),
                  ]}
                />
              </Field>
            </div>
            <Field label="Extra instructions (optional)" htmlFor="draft-instructions" hint="e.g. 'mention we met at the Karen expo'. Only say true things.">
              <Input
                id="draft-instructions"
                value={instructions}
                onChange={(e) => setInstructions(e.target.value.slice(0, 800))}
                className={inputClass}
              />
            </Field>
            <div className="flex flex-wrap items-center gap-3">
              <Button className="rounded-full" onClick={() => run(kind)} disabled={generate.isPending || blocked || !org.data?.sender_name}>
                {generate.isPending && !regenerating ? <Loader2 className="mr-1.5 h-4 w-4 animate-spin" /> : <Sparkles className="mr-1.5 h-4 w-4" />}
                Write draft
              </Button>
              <Button variant="outline" className="rounded-full" onClick={writeMyself} disabled={saveDraft.isPending || blocked || !org.data?.sender_name}>
                <PenLine className="mr-1.5 h-4 w-4" /> Write it myself
              </Button>
              <p className="text-xs text-muted-foreground">
                Nothing is sent: you review, approve and send it yourself.
              </p>
            </div>
          </div>
        </Section>
      )}

      <Section
        title="Drafts"
        action={
          canEdit && (
            <div className="flex gap-1">
              <Button size="sm" variant="ghost" className="h-8 rounded-full" onClick={() => setReplyOpen(true)}>
                Log a reply
              </Button>
              {!lead.do_not_contact && (
                <Button size="sm" variant="ghost" className="h-8 rounded-full text-warning" onClick={optOut}>
                  They opted out
                </Button>
              )}
            </div>
          )
        }
      >
        {open.length === 0 ? (
          <EmptyState icon={Sparkles} title="No open drafts" description="Write one above, or check Sent below." />
        ) : (
          open.map((d) => (
            <DraftCard
              key={d.id}
              draft={d}
              lead={lead}
              org={org.data}
              onRegenerate={() => run(d.kind, d.id)}
              regenerating={regenerating === d.id}
            />
          ))
        )}
      </Section>

      <FollowUpList lead={lead} onWrite={(k) => setKind(k)} />

      <Section title="Messages">
        {(messages.data ?? []).length === 0 ? (
          <p className="p-5 text-sm text-muted-foreground">Nothing sent or received yet.</p>
        ) : (
          <ul>
            {(messages.data ?? []).map((m) => (
              <li key={m.id} className="border-b border-border/60 px-5 py-3 last:border-b-0">
                <div className="flex flex-wrap items-center gap-2 text-sm">
                  <Pill tone={m.direction === "inbound" ? "accent" : "neutral"}>{MESSAGE_STATUS_LABEL[m.status]}</Pill>
                  <span className="capitalize text-muted-foreground">{m.channel}</span>
                  {m.to_address && <span className="truncate text-muted-foreground">to {m.to_address}</span>}
                  <span className="ml-auto text-xs text-muted-foreground">
                    {format(parseISO(m.sent_at ?? m.created_at), "d MMM yyyy, HH:mm")}
                  </span>
                </div>
                {m.subject && <p className="mt-1 text-sm font-medium">{m.subject}</p>}
                {m.body && <p className="mt-1 line-clamp-3 whitespace-pre-line text-sm text-muted-foreground">{m.body}</p>}
              </li>
            ))}
          </ul>
        )}
      </Section>

      {used.length > 0 && (
        <details className="hub-card">
          <summary className="cursor-pointer px-5 py-3 text-sm font-medium">Sent drafts ({used.length})</summary>
          {used.map((d) => (
            <div key={d.id} className="border-t border-border/60 px-5 py-3">
              <p className="text-xs text-muted-foreground">
                {DRAFT_KIND_LABEL[d.kind]} · approved {d.approved_at ? format(parseISO(d.approved_at), "d MMM, HH:mm") : ""}
              </p>
              {d.subject && <p className="mt-1 text-sm font-medium">{d.subject}</p>}
              <p className="mt-1 whitespace-pre-line text-sm text-muted-foreground">{d.body}</p>
            </div>
          ))}
        </details>
      )}

      <ReplyDialog lead={lead} open={replyOpen} onOpenChange={setReplyOpen} />
    </div>
  );
}
