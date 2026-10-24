import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { Briefcase, Pencil, Plus, Trophy, UserPlus, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useHubAuth } from "../../../auth/HubAuthProvider";
import { Field, FormDialog, MoneyInput, inputClass } from "../../../components/form";
import { EmptyState, Pill, Section } from "../../../components/ui";
import { toNumberOrNull } from "../../../lib/format";
import { useKes } from "../../../lib/privacy";
import { useSaveClient } from "../../../lib/queries";
import { SERVICES } from "../../../lib/types";
import { useCrm, useLeadDeals, useSaveDeal } from "../../lib/queries";
import type { CrmLead, Deal } from "../../lib/types";
import { SelectField } from "../bits";

type Form = {
  proposed_service: string;
  quoted_management_fee: string;
  expected_monthly_retainer: string;
  expected_ad_budget: string;
  proposal_date: string;
  probability: string;
  expected_close_date: string;
  notes: string;
};

const toForm = (d?: Deal | null): Form => ({
  proposed_service: d?.proposed_service ?? "",
  quoted_management_fee: d?.quoted_management_fee?.toString() ?? "",
  expected_monthly_retainer: d?.expected_monthly_retainer?.toString() ?? "",
  expected_ad_budget: d?.expected_ad_budget?.toString() ?? "",
  proposal_date: d?.proposal_date ?? "",
  probability: d?.probability?.toString() ?? "",
  expected_close_date: d?.expected_close_date ?? "",
  notes: d?.notes ?? "",
});

function DealDialog({ lead, deal, open, onOpenChange }: { lead: CrmLead; deal: Deal | null; open: boolean; onOpenChange: (o: boolean) => void }) {
  const save = useSaveDeal();
  const [f, setF] = useState<Form>(toForm(deal));
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (open) {
      setF(toForm(deal));
      setError(null);
    }
  }, [open, deal]);
  const set = (k: keyof Form) => (v: string) => setF((s) => ({ ...s, [k]: v }));

  return (
    <FormDialog
      open={open}
      onOpenChange={onOpenChange}
      title={deal ? "Edit deal" : "New deal"}
      description="Agency revenue only. The client's ad budget is tracked separately and never counted as your revenue."
      pending={save.isPending}
      error={error}
      wide
      onSubmit={() => {
        if (!f.proposed_service.trim()) {
          setError("Say what you're proposing.");
          return;
        }
        const probability = toNumberOrNull(f.probability);
        if (probability !== null && (probability < 0 || probability > 100)) {
          setError("Probability is 0 to 100.");
          return;
        }
        save.mutate(
          {
            id: deal?.id,
            values: {
              ...(deal ? {} : { lead_id: lead.id }),
              proposed_service: f.proposed_service.trim(),
              quoted_management_fee: toNumberOrNull(f.quoted_management_fee),
              expected_monthly_retainer: toNumberOrNull(f.expected_monthly_retainer),
              expected_ad_budget: toNumberOrNull(f.expected_ad_budget),
              proposal_date: f.proposal_date || null,
              probability: probability === null ? null : Math.round(probability),
              expected_close_date: f.expected_close_date || null,
              notes: f.notes.trim() || null,
            },
          },
          { onSuccess: () => onOpenChange(false), onError: (e) => setError(e.message) },
        );
      }}
    >
      <Field label="Proposed service" htmlFor="deal-service">
        <Input id="deal-service" list="deal-services" value={f.proposed_service} onChange={(e) => set("proposed_service")(e.target.value)} className={inputClass} />
        <datalist id="deal-services">
          {SERVICES.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </Field>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Monthly retainer" hint="Counted as revenue when won">
          <MoneyInput value={f.expected_monthly_retainer} onChange={set("expected_monthly_retainer")} />
        </Field>
        <Field label="Quoted management fee" hint="What you quoted">
          <MoneyInput value={f.quoted_management_fee} onChange={set("quoted_management_fee")} />
        </Field>
        <Field label="Client's ad budget" hint="Their media spend. Not revenue.">
          <MoneyInput value={f.expected_ad_budget} onChange={set("expected_ad_budget")} />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Field label="Proposal date" htmlFor="deal-proposal">
          <Input id="deal-proposal" type="date" value={f.proposal_date} onChange={(e) => set("proposal_date")(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Probability %" htmlFor="deal-prob">
          <Input id="deal-prob" inputMode="numeric" value={f.probability} onChange={(e) => set("probability")(e.target.value)} className={inputClass} />
        </Field>
        <Field label="Expected close" htmlFor="deal-close">
          <Input id="deal-close" type="date" value={f.expected_close_date} onChange={(e) => set("expected_close_date")(e.target.value)} className={inputClass} />
        </Field>
      </div>
      <Field label="Notes" htmlFor="deal-notes">
        <Textarea id="deal-notes" rows={3} value={f.notes} onChange={(e) => set("notes")(e.target.value)} className="rounded-xl bg-background" />
      </Field>
    </FormDialog>
  );
}

export function DealsPanel({ lead }: { lead: CrmLead }) {
  const kes = useKes();
  const navigate = useNavigate();
  const { canEdit } = useCrm();
  const hubAdmin = useHubAuth().status === "admin";
  const deals = useLeadDeals(lead.id);
  const save = useSaveDeal();
  const saveClient = useSaveClient();
  const [dialog, setDialog] = useState<{ open: boolean; deal: Deal | null }>({ open: false, deal: null });

  const setStatus = (deal: Deal, status: Deal["status"]) => {
    let lost_reason = deal.lost_reason;
    if (status === "lost") {
      const reason = window.prompt("Why was it lost? (optional)", deal.lost_reason ?? "");
      if (reason === null) return;
      lost_reason = reason.trim() || null;
    }
    save.mutate(
      { id: deal.id, values: { status, lost_reason } },
      { onSuccess: () => toast.success(status === "won" ? "Won. Nicely done." : status === "lost" ? "Marked lost" : "Reopened"), onError: (e) => toast.error(e.message) },
    );
  };

  // Hands a won deal to the Client Hub as a new client in onboarding.
  const convert = (deal: Deal) =>
    saveClient.mutate(
      {
        client: {
          client_type_id: null,
          name: lead.name,
          business_name: lead.name,
          contact_person: null,
          email: lead.email,
          phone: lead.phone,
          website: lead.website,
          industry: null,
          status: "onboarding",
          start_date: format(new Date(), "yyyy-MM-dd"),
          monthly_fee: deal.expected_monthly_retainer,
          services: SERVICES.filter((s) => deal.proposed_service.toLowerCase().includes(s.toLowerCase())),
          main_goal: null,
          notes: deal.notes,
          custom_fields: {},
        },
        kpis: [],
      },
      {
        onSuccess: async (client) => {
          await save.mutateAsync({ id: deal.id, values: { converted_client_id: client.id } });
          toast.success(`${client.name} is now a client`);
          navigate(`/hub/clients/${client.id}`);
        },
        onError: (e) => toast.error(e.message),
      },
    );

  return (
    <Section
      title="Deals"
      action={
        canEdit && (
          <Button size="sm" variant="ghost" className="h-8 rounded-full" onClick={() => setDialog({ open: true, deal: null })}>
            <Plus className="mr-1 h-3.5 w-3.5" /> New deal
          </Button>
        )
      }
    >
      {(deals.data ?? []).length === 0 ? (
        <EmptyState icon={Briefcase} title="No deals yet" description="Open one when a proposal is on the table." />
      ) : (
        <ul>
          {(deals.data ?? []).map((d) => (
            <li key={d.id} className="border-b border-border/60 px-5 py-4 last:border-b-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-medium">{d.proposed_service}</p>
                <Pill tone={d.status === "won" ? "accent" : d.status === "lost" ? "muted" : "neutral"}>
                  {d.status === "won" ? "Won" : d.status === "lost" ? "Lost" : "Open"}
                </Pill>
                {d.probability != null && d.status === "open" && <span className="text-xs text-muted-foreground">{d.probability}% likely</span>}
                {canEdit && (
                  <Button size="icon" variant="ghost" className="ml-auto h-8 w-8 rounded-lg" aria-label="Edit deal" onClick={() => setDialog({ open: true, deal: d })}>
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                )}
              </div>
              <dl className="mt-2 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-3">
                <div>
                  <dt className="hub-label">Retainer / month</dt>
                  <dd className="hub-tabular">{kes(d.expected_monthly_retainer)}</dd>
                </div>
                <div>
                  <dt className="hub-label">Management fee</dt>
                  <dd className="hub-tabular">{kes(d.quoted_management_fee)}</dd>
                </div>
                <div>
                  <dt className="hub-label">Client's ad budget</dt>
                  <dd className="hub-tabular text-muted-foreground">{kes(d.expected_ad_budget)}</dd>
                </div>
                <div>
                  <dt className="hub-label">Proposal</dt>
                  <dd>{d.proposal_date ? format(parseISO(d.proposal_date), "d MMM yyyy") : "—"}</dd>
                </div>
                <div>
                  <dt className="hub-label">{d.status === "won" ? "Won on" : "Expected close"}</dt>
                  <dd>
                    {d.status === "won" && d.won_on
                      ? format(parseISO(d.won_on), "d MMM yyyy")
                      : d.expected_close_date
                        ? format(parseISO(d.expected_close_date), "d MMM yyyy")
                        : "—"}
                  </dd>
                </div>
                {d.lost_reason && (
                  <div>
                    <dt className="hub-label">Lost because</dt>
                    <dd>{d.lost_reason}</dd>
                  </div>
                )}
              </dl>
              {d.notes && <p className="mt-2 text-sm text-muted-foreground">{d.notes}</p>}
              {canEdit && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {d.status === "open" ? (
                    <>
                      <Button size="sm" className="rounded-full" onClick={() => setStatus(d, "won")} disabled={save.isPending}>
                        <Trophy className="mr-1.5 h-3.5 w-3.5" /> Won
                      </Button>
                      <Button size="sm" variant="outline" className="rounded-full" onClick={() => setStatus(d, "lost")} disabled={save.isPending}>
                        <XCircle className="mr-1.5 h-3.5 w-3.5" /> Lost
                      </Button>
                    </>
                  ) : (
                    <Button size="sm" variant="ghost" className="rounded-full" onClick={() => setStatus(d, "open")} disabled={save.isPending}>
                      Reopen
                    </Button>
                  )}
                  {d.status === "won" && hubAdmin && !d.converted_client_id && (
                    <Button size="sm" variant="outline" className="rounded-full" onClick={() => convert(d)} disabled={saveClient.isPending}>
                      <UserPlus className="mr-1.5 h-3.5 w-3.5" /> Add to Client Hub
                    </Button>
                  )}
                  {d.converted_client_id && hubAdmin && (
                    <Button size="sm" variant="ghost" className="rounded-full" onClick={() => navigate(`/hub/clients/${d.converted_client_id}`)}>
                      Open client
                    </Button>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
      <DealDialog lead={lead} deal={dialog.deal} open={dialog.open} onOpenChange={(o) => setDialog((s) => ({ ...s, open: o }))} />
    </Section>
  );
}
