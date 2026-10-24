import { useEffect, useState } from "react";
import { format, parseISO } from "date-fns";
import { Pencil, Plus, Star, Trash2, UserRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, FormDialog, inputClass } from "../../../components/form";
import { Pill, Row, Section } from "../../../components/ui";
import { FIT_FACTOR_LABEL, computeFit } from "../../lib/fitScore";
import { externalUrl, instagramUrl } from "../../lib/links";
import {
  useCrm,
  useDeleteContact,
  useIndustries,
  useLeadContacts,
  useOrg,
  useSaveContact,
  useSaveLead,
  useSources,
} from "../../lib/queries";
import type { CrmLead, LeadContact } from "../../lib/types";
import { FitBadge, PriorityPill, SelectField, Unverified, Verified } from "../bits";
import { FitEditor } from "./FitEditor";

function LinkOrDash({ value, href }: { value: string | null; href: string | null }) {
  if (!value) return <span className="text-muted-foreground">Not found yet</span>;
  return href ? (
    <a href={href} target="_blank" rel="noopener noreferrer nofollow" className="break-all text-primary hover:underline">
      {value}
    </a>
  ) : (
    <span className="break-all">{value}</span>
  );
}

function ContactDialog({
  lead,
  contact,
  open,
  onOpenChange,
}: {
  lead: CrmLead;
  contact: LeadContact | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
}) {
  const save = useSaveContact();
  const [v, setV] = useState({ name: "", role_title: "", email: "", phone: "", is_decision_maker: false, verified: false, notes: "" });
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (!open) return;
    setError(null);
    setV({
      name: contact?.name ?? "",
      role_title: contact?.role_title ?? "",
      email: contact?.email ?? "",
      phone: contact?.phone ?? "",
      is_decision_maker: contact?.is_decision_maker ?? false,
      verified: contact?.verification === "verified",
      notes: contact?.notes ?? "",
    });
  }, [open, contact]);
  const clean = (s: string) => (s.trim() ? s.trim() : null);
  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={contact ? "Edit contact" : "Add a contact"}
      description="Tick Verified only once you've confirmed who they are and that the details reach them."
      pending={save.isPending}
      error={error}
      onSubmit={() => {
        if (!v.name.trim() && !v.email.trim() && !v.phone.trim()) {
          setError("Add a name, email or phone.");
          return;
        }
        const wasVerified = contact?.verification === "verified";
        save.mutate(
          {
            id: contact?.id,
            values: {
              ...(contact ? {} : { lead_id: lead.id, source: "manual" }),
              name: clean(v.name),
              role_title: clean(v.role_title),
              email: clean(v.email),
              phone: clean(v.phone),
              notes: clean(v.notes),
              is_decision_maker: v.is_decision_maker,
              verification: v.verified ? "verified" : "unverified",
              verified_at: v.verified ? (wasVerified ? contact?.verified_at : new Date().toISOString()) : null,
            },
          },
          { onSuccess: () => onOpenChange(false), onError: (e) => setError(e.message) },
        );
      }}
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor="c-name">
          <Input id="c-name" value={v.name} onChange={(e) => setV({ ...v, name: e.target.value })} className={inputClass} />
        </Field>
        <Field label="Role" htmlFor="c-role">
          <Input id="c-role" value={v.role_title} onChange={(e) => setV({ ...v, role_title: e.target.value })} placeholder="e.g. Managing Director" className={inputClass} />
        </Field>
        <Field label="Email" htmlFor="c-email">
          <Input id="c-email" type="email" value={v.email} onChange={(e) => setV({ ...v, email: e.target.value })} className={inputClass} />
        </Field>
        <Field label="Phone" htmlFor="c-phone">
          <Input id="c-phone" type="tel" value={v.phone} onChange={(e) => setV({ ...v, phone: e.target.value })} className={inputClass} />
        </Field>
      </div>
      <Field label="How you know" htmlFor="c-notes">
        <Input id="c-notes" value={v.notes} onChange={(e) => setV({ ...v, notes: e.target.value })} placeholder="e.g. Named on their About page, 20 Oct" className={inputClass} />
      </Field>
      <div className="flex flex-wrap gap-6">
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={v.is_decision_maker} onCheckedChange={(c) => setV({ ...v, is_decision_maker: c === true })} />
          Decision-maker
        </label>
        <label className="flex items-center gap-2 text-sm">
          <Checkbox checked={v.verified} onCheckedChange={(c) => setV({ ...v, verified: c === true })} />
          Verified
        </label>
      </div>
    </FormDialog>
  );
}

function NotesEditor({ lead, field, label, hint }: { lead: CrmLead; field: "notes" | "research_notes"; label: string; hint?: string }) {
  const { canEdit } = useCrm();
  const save = useSaveLead();
  const [value, setValue] = useState(lead[field] ?? "");
  useEffect(() => setValue(lead[field] ?? ""), [lead, field]);
  const dirty = value !== (lead[field] ?? "");
  return (
    <Section title={label}>
      <div className="p-5">
        {hint && <p className="mb-2 text-xs text-muted-foreground">{hint}</p>}
        <Textarea
          aria-label={label}
          value={value}
          readOnly={!canEdit}
          onChange={(e) => setValue(e.target.value.slice(0, 10000))}
          rows={5}
          className="rounded-xl bg-background"
        />
        {canEdit && dirty && (
          <div className="mt-2 flex justify-end gap-2">
            <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setValue(lead[field] ?? "")}>
              Undo
            </Button>
            <Button
              size="sm"
              className="rounded-full"
              disabled={save.isPending}
              onClick={() =>
                save.mutate({ id: lead.id, values: { [field]: value.trim() || null } }, { onSuccess: () => toast.success("Saved"), onError: (e) => toast.error(e.message) })
              }
            >
              Save
            </Button>
          </div>
        )}
      </div>
    </Section>
  );
}

export function LeadOverview({ lead }: { lead: CrmLead }) {
  const { canEdit } = useCrm();
  const industries = useIndustries();
  const sources = useSources();
  const contacts = useLeadContacts(lead.id);
  const org = useOrg();
  const save = useSaveLead();
  const removeContact = useDeleteContact();
  const [fitOpen, setFitOpen] = useState(false);
  const [contactDialog, setContactDialog] = useState<{ open: boolean; contact: LeadContact | null }>({ open: false, contact: null });
  const [tagInput, setTagInput] = useState("");

  const source = sources.data?.find((s) => s.id === lead.source_id);
  const fit = computeFit(lead.fit_inputs, org.data?.fit_weights);
  const imports = lead.source_data.imports ?? [];

  const update = (values: Partial<CrmLead>, message = "Saved") =>
    save.mutate({ id: lead.id, values }, { onSuccess: () => toast.success(message), onError: (e) => toast.error(e.message) });

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="space-y-6">
        <Section title="Company">
          <dl>
            <Row label="Industry">{industries.data?.find((i) => i.id === lead.industry_id)?.name ?? "—"}</Row>
            <Row label="Business type">{lead.business_type ?? "—"}</Row>
            <Row label="Area">{lead.area ?? "—"}</Row>
            <Row label="Google listing">
              {lead.google_rating != null ? (
                <span className="inline-flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-current text-primary" /> {lead.google_rating}
                  </span>
                  <span className="text-muted-foreground">{lead.google_reviews ?? "?"} reviews</span>
                  <Unverified>As researched; may have changed</Unverified>
                </span>
              ) : (
                "—"
              )}
            </Row>
            <Row label="Source">
              {source ? (
                <span>
                  {source.filename ?? source.name}
                  {source.imported_at && <span className="text-muted-foreground"> · imported {format(parseISO(source.imported_at), "d MMM yyyy")}</span>}
                </span>
              ) : (
                "Added by hand"
              )}
            </Row>
          </dl>
        </Section>

        <Section
          title="Contact details"
          action={
            canEdit && (
              <Button size="sm" variant="ghost" className="h-8 rounded-full" onClick={() => setContactDialog({ open: true, contact: null })}>
                <Plus className="mr-1 h-3.5 w-3.5" /> Add person
              </Button>
            )
          }
        >
          <dl>
            <Row label="Business email">
              <span className="flex flex-wrap items-center gap-2">
                <span className="break-all">{lead.email ?? <span className="text-muted-foreground">Not found yet</span>}</span>
                {lead.email &&
                  (canEdit ? (
                    <SelectField
                      label="Email status"
                      className="w-36"
                      value={lead.email_status}
                      onChange={(v) => update({ email_status: v as CrmLead["email_status"] })}
                      options={[
                        { value: "unverified", label: "Not verified" },
                        { value: "verified", label: "Verified" },
                        { value: "invalid", label: "Wrong address" },
                        { value: "bounced", label: "Bounced" },
                      ]}
                    />
                  ) : lead.email_status === "verified" ? (
                    <Verified />
                  ) : (
                    <Unverified />
                  ))}
              </span>
            </Row>
            <Row label="Business phone">
              <span className="flex flex-wrap items-center gap-2">
                {lead.phone ? (
                  <a href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`} className="hover:underline">
                    {lead.phone}
                  </a>
                ) : (
                  <span className="text-muted-foreground">Not found yet</span>
                )}
                {lead.phone &&
                  (canEdit ? (
                    <SelectField
                      label="Phone status"
                      className="w-36"
                      value={lead.phone_status}
                      onChange={(v) => update({ phone_status: v as CrmLead["phone_status"] })}
                      options={[
                        { value: "unverified", label: "Not verified" },
                        { value: "verified", label: "Verified" },
                        { value: "invalid", label: "Wrong number" },
                      ]}
                    />
                  ) : lead.phone_status === "verified" ? (
                    <Verified />
                  ) : (
                    <Unverified />
                  ))}
              </span>
            </Row>
          </dl>
          {(contacts.data ?? []).map((c) => (
            <div key={c.id} className="flex items-start gap-3 border-t border-border/60 px-5 py-3">
              <UserRound className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
              <div className="min-w-0 flex-1 text-sm">
                <p className="flex flex-wrap items-center gap-2 font-medium">
                  {c.name ?? "Unnamed"}
                  {c.role_title && <span className="font-normal text-muted-foreground">{c.role_title}</span>}
                  {c.is_decision_maker && <Pill tone="accent">Decision-maker</Pill>}
                  {c.verification === "verified" ? <Verified /> : <Unverified />}
                  {c.opted_out && <Pill tone="warning">Opted out</Pill>}
                </p>
                <p className="break-all text-muted-foreground">{[c.email, c.phone].filter(Boolean).join(" · ") || "No details"}</p>
                {c.notes && <p className="text-xs text-muted-foreground">{c.notes}</p>}
              </div>
              {canEdit && (
                <div className="flex">
                  <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg" aria-label="Edit contact" onClick={() => setContactDialog({ open: true, contact: c })}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-lg"
                    aria-label="Remove contact"
                    onClick={() => window.confirm("Remove this contact?") && removeContact.mutate(c.id, { onError: (e) => toast.error(e.message) })}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              )}
            </div>
          ))}
        </Section>

        <Section title="Online presence">
          <dl>
            <Row label="Website">
              <LinkOrDash value={lead.website} href={externalUrl(lead.website)} />
            </Row>
            <Row label="Instagram">
              <LinkOrDash value={lead.instagram} href={instagramUrl(lead.instagram)} />
            </Row>
            <Row label="Facebook">
              <LinkOrDash value={lead.facebook} href={/^https?:\/\//i.test(lead.facebook ?? "") ? externalUrl(lead.facebook) : null} />
            </Row>
            <Row label="TikTok">
              <LinkOrDash value={lead.tiktok} href={/^https?:\/\//i.test(lead.tiktok ?? "") ? externalUrl(lead.tiktok) : null} />
            </Row>
          </dl>
          <div className="flex flex-wrap items-center gap-3 border-t border-border/60 px-5 py-3 text-xs text-muted-foreground">
            {canEdit ? (
              <label className="flex items-center gap-2 text-sm text-foreground">
                <Checkbox checked={lead.socials_verified} onCheckedChange={(v) => update({ socials_verified: v === true })} />
                I've checked these by hand
              </label>
            ) : lead.socials_verified ? (
              <Verified />
            ) : (
              <Unverified />
            )}
            <span>Blank means not found yet. Imported socials were only found when the website linked to them.</span>
          </div>
        </Section>
      </div>

      <div className="space-y-6">
        <Section
          title="Scores"
          action={
            canEdit && (
              <Button size="sm" variant="ghost" className="h-8 rounded-full" onClick={() => setFitOpen(true)}>
                Rate fit
              </Button>
            )
          }
        >
          <div className="grid gap-px bg-border/60 sm:grid-cols-2">
            <div className="bg-card p-5">
              <p className="hub-label">Original priority and weakness</p>
              <div className="mt-2 flex items-baseline gap-3">
                <PriorityPill priority={lead.original_priority} />
                <span className="hub-tabular text-2xl font-bold">{lead.weakness_score ?? "—"}</span>
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                From the spreadsheet. It scores missing channels as weaknesses, but those channels may simply not have been found.
              </p>
            </div>
            <div className="bg-card p-5">
              <p className="hub-label">Prospect fit</p>
              <div className="mt-2">
                <FitBadge score={fit.score} known={fit.known} />
              </div>
              <p className="mt-2 text-xs text-muted-foreground">
                {fit.known === 0 ? "Not rated yet." : `${fit.known} of ${fit.total} factors known, ${fit.verified} verified.`}
              </p>
            </div>
          </div>
          {fit.known > 0 && (
            <ul className="border-t border-border/60 px-5 py-3 text-sm">
              {fit.breakdown
                .filter((b) => b.rating !== null)
                .map((b) => (
                  <li key={b.factor} className="flex items-center justify-between gap-3 py-1">
                    <span className="min-w-0 truncate">{FIT_FACTOR_LABEL[b.factor]}</span>
                    <span className="flex items-center gap-2">
                      <span className="hub-tabular">{b.rating}/4</span>
                      {b.verified ? <Verified /> : <Unverified />}
                    </span>
                  </li>
                ))}
            </ul>
          )}
          {source && source.methodology.length > 0 && (
            <details className="border-t border-border/60 px-5 py-3 text-xs text-muted-foreground">
              <summary className="cursor-pointer font-medium text-foreground">How the original score was worked out</summary>
              <ul className="mt-2 space-y-1">
                {source.methodology.map((line, i) => (
                  <li key={i}>{line}</li>
                ))}
              </ul>
            </details>
          )}
        </Section>

        <NotesEditor
          lead={lead}
          field="research_notes"
          label="Research notes"
          hint="What you've found and where. Anything here is treated as unverified in AI drafts; rate fit factors for verified facts."
        />
        <NotesEditor lead={lead} field="notes" label="Notes" />

        <Section title="Tags">
          <div className="flex flex-wrap items-center gap-2 p-5">
            {lead.tags.length === 0 && <span className="text-sm text-muted-foreground">No tags</span>}
            {lead.tags.map((t) => (
              <Pill key={t} tone="outline" className="gap-1">
                {t}
                {canEdit && (
                  <button type="button" aria-label={`Remove tag ${t}`} onClick={() => update({ tags: lead.tags.filter((x) => x !== t) })} className="ml-1 hover:text-foreground">
                    ×
                  </button>
                )}
              </Pill>
            ))}
            {canEdit && (
              <form
                className="flex items-center gap-1"
                onSubmit={(e) => {
                  e.preventDefault();
                  const t = tagInput.trim().toLowerCase().slice(0, 40);
                  if (t && !lead.tags.includes(t)) update({ tags: [...lead.tags, t] });
                  setTagInput("");
                }}
              >
                <Input aria-label="New tag" value={tagInput} onChange={(e) => setTagInput(e.target.value)} placeholder="Add tag" className="h-8 w-28 rounded-lg" />
              </form>
            )}
          </div>
        </Section>

        {imports.length > 0 && (
          <details className="hub-card">
            <summary className="cursor-pointer px-5 py-3 text-sm font-medium">Original source rows ({imports.length})</summary>
            {imports.map((imp, i) => (
              <div key={i} className="border-t border-border/60 px-5 py-3 text-xs">
                <p className="mb-2 text-muted-foreground">
                  {imp.filename}, row {imp.row}
                </p>
                <dl className="grid grid-cols-[minmax(0,10rem)_1fr] gap-x-3 gap-y-1">
                  {Object.entries(imp.raw ?? {}).map(([k, v]) => (
                    <div key={k} className="contents">
                      <dt className="truncate text-muted-foreground">{k}</dt>
                      <dd className="break-words">{String(v)}</dd>
                    </div>
                  ))}
                </dl>
              </div>
            ))}
          </details>
        )}
      </div>

      <FitEditor lead={lead} open={fitOpen} onOpenChange={setFitOpen} />
      <ContactDialog lead={lead} contact={contactDialog.contact} open={contactDialog.open} onOpenChange={(o) => setContactDialog((s) => ({ ...s, open: o }))} />
    </div>
  );
}
