import { useMemo } from "react";
import { BlurFade } from "../../components/motion/blur-fade";
import { PageHeader, Section, SkeletonBlock } from "../../components/ui";
import { FilterBar, useMetricFilters } from "../components/FilterBar";
import { useLeadCampaigns, useLeads, useMessageFacts, useMetrics } from "../lib/queries";
import { STAGES, STAGE_LABEL } from "../lib/types";

const pct = (n: number, d: number) => (d === 0 ? "—" : `${Math.round((n / d) * 1000) / 10}%`);

function Bar({ label, value, max, sub }: { label: string; value: number; max: number; sub?: string }) {
  return (
    <div className="grid grid-cols-[minmax(0,9rem)_1fr_auto] items-center gap-3 py-1.5 text-sm">
      <span className="truncate">{label}</span>
      <span className="h-2 overflow-hidden rounded-full bg-secondary" aria-hidden>
        <span className="block h-full rounded-full bg-primary" style={{ width: max ? `${(value / max) * 100}%` : 0 }} />
      </span>
      <span className="hub-tabular w-24 text-right">
        {value}
        {sub && <span className="ml-1.5 text-xs text-muted-foreground">{sub}</span>}
      </span>
    </div>
  );
}

export default function AnalyticsPage() {
  const { filters, state } = useMetricFilters();
  const metrics = useMetrics(filters);
  const leads = useLeads();
  const messages = useMessageFacts();
  const links = useLeadCampaigns();
  const m = metrics.data;

  // Does the spreadsheet's priority predict replies? Same filters as the funnel.
  const byPriority = useMemo(() => {
    const inCampaign = filters.campaign
      ? new Set((links.data ?? []).filter((l) => l.campaign_id === filters.campaign).map((l) => l.lead_id))
      : null;
    const scope = (leads.data ?? []).filter(
      (l) =>
        !l.archived_at &&
        (!filters.industry || l.industry_id === filters.industry) &&
        (!filters.owner || l.owner_id === filters.owner) &&
        (!inCampaign || inCampaign.has(l.id)),
    );
    const from = new Date(filters.from).getTime();
    const to = new Date(filters.to).getTime();
    const inRange = (iso: string | null) => !!iso && new Date(iso).getTime() >= from && new Date(iso).getTime() < to;
    const contacted = new Set(
      (messages.data ?? []).filter((x) => x.direction === "outbound" && x.status !== "failed" && inRange(x.sent_at)).map((x) => x.lead_id),
    );
    const replied = new Set((messages.data ?? []).filter((x) => x.direction === "inbound" && inRange(x.created_at)).map((x) => x.lead_id));
    return ["A", "B", "C", null].map((p) => {
      const group = scope.filter((l) => (l.original_priority ?? null) === p);
      const c = group.filter((l) => contacted.has(l.id)).length;
      const r = group.filter((l) => replied.has(l.id)).length;
      return { label: p ? `Priority ${p}` : "No priority", leads: group.length, contacted: c, replied: r };
    });
  }, [leads.data, messages.data, links.data, filters]);

  const funnel = m
    ? [
        { label: "Contacted", value: m.contacted },
        { label: "Replied", value: m.replies },
        { label: "Positive", value: m.positive_replies },
        { label: "Meeting booked", value: m.meetings_booked },
        { label: "Proposal sent", value: m.proposals_sent },
        { label: "Won", value: m.clients_won },
      ]
    : [];
  const stageMax = m ? Math.max(1, ...Object.values(m.stages).map((n) => n ?? 0)) : 1;

  return (
    <>
      <BlurFade>
        <PageHeader title="Analytics" subtitle="Only what's been logged. Empty periods show a dash, not a zero rate." />
      </BlurFade>
      <FilterBar state={state} />

      {metrics.isLoading || !m ? (
        <SkeletonBlock className="h-80 rounded-[20px]" />
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Section title="Funnel in this period">
            <div className="p-5">
              {funnel.map((f, i) => (
                <Bar
                  key={f.label}
                  label={f.label}
                  value={f.value}
                  max={Math.max(1, funnel[0].value)}
                  sub={i === 0 ? undefined : pct(f.value, funnel[i - 1].value)}
                />
              ))}
              <p className="mt-3 text-xs text-muted-foreground">
                Percentages are of the step before. "Contacted" counts leads with a logged message; it doesn't mean they read it.
              </p>
            </div>
          </Section>

          <Section title="Where leads are now">
            <div className="p-5">
              {STAGES.filter((s) => (m.stages[s] ?? 0) > 0).map((s) => (
                <Bar key={s} label={STAGE_LABEL[s]} value={m.stages[s] ?? 0} max={stageMax} />
              ))}
              {Object.keys(m.stages).length === 0 && <p className="text-sm text-muted-foreground">No leads with these filters.</p>}
            </div>
          </Section>

          <Section title="Original priority vs. results" className="lg:col-span-2">
            <div className="overflow-x-auto p-5">
              <table className="w-full min-w-[480px] text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground">
                    <th className="pb-2 font-medium">Group</th>
                    <th className="pb-2 text-right font-medium">Leads</th>
                    <th className="pb-2 text-right font-medium">Contacted</th>
                    <th className="pb-2 text-right font-medium">Replied</th>
                    <th className="pb-2 text-right font-medium">Response rate</th>
                  </tr>
                </thead>
                <tbody>
                  {byPriority.map((r) => (
                    <tr key={r.label} className="border-t border-border/60">
                      <td className="py-2">{r.label}</td>
                      <td className="hub-tabular py-2 text-right">{r.leads}</td>
                      <td className="hub-tabular py-2 text-right">{r.contacted}</td>
                      <td className="hub-tabular py-2 text-right">{r.replied}</td>
                      <td className="hub-tabular py-2 text-right">{pct(r.replied, r.contacted)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
              <p className="mt-3 text-xs text-muted-foreground">
                Use this to check whether the spreadsheet's weakness-based priority actually predicts replies before trusting it.
              </p>
            </div>
          </Section>
        </div>
      )}
    </>
  );
}
