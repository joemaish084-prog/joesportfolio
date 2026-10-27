import { addMonths, format, isAfter, parseISO, startOfMonth } from "date-fns";
import { billing, kpiStories, revenueStory, type KpiStory } from "@/hub/lib/clientStory";
import { lowerIsBetter } from "@/hub/lib/format";
import type { ClientKpi, Invoice, Payment, Report, ReportMetric } from "@/hub/lib/types";
import type { PortalMilestone, PortalSnapshot, PortalUpdate } from "./types";

export const RANGES = [
  { id: "3m", label: "3 months", months: 3 },
  { id: "6m", label: "6 months", months: 6 },
  { id: "12m", label: "12 months", months: 12 },
  { id: "all", label: "All time", months: null },
] as const;
export type RangeId = (typeof RANGES)[number]["id"];

/** Reports whose period ends inside the range, oldest first. */
export function reportsInRange(snap: PortalSnapshot, range: RangeId, now = new Date()) {
  const months = RANGES.find((r) => r.id === range)?.months ?? null;
  const cutoff = months === null ? null : startOfMonth(addMonths(now, -(months - 1)));
  return [...snap.reports]
    .filter((r) => cutoff === null || !isAfter(cutoff, parseISO(r.period_end)))
    .sort((a, b) => a.period_end.localeCompare(b.period_end));
}

/** Spend and budget aren't good or bad on their own, so they never show as a warning to a client. */
const NEUTRAL_KPI = /(^|[^a-z])(spend|budget)([^a-z]|$)/i;

/** The hub's KPI stories (first, latest, change, target) over the chosen range. */

export function storiesFor(snap: PortalSnapshot, range: RangeId = "all"): KpiStory[] {
  const reports = reportsInRange(snap, range);
  const ids = new Set(reports.map((r) => r.id));
  return kpiStories(
    snap.kpis as unknown as ClientKpi[],
    reports as unknown as Report[],
    snap.report_metrics.filter((m) => ids.has(m.report_id)) as unknown as ReportMetric[],
  ).map((s) => (NEUTRAL_KPI.test(s.kpi.name) ? { ...s, improved: null } : s));
}

export const withData = (stories: KpiStory[]) => stories.filter((s) => s.points.length > 0);

/** The KPI to lead with: revenue/sales when there is one, otherwise the best-moving KPI. */
export function headlineStory(stories: KpiStory[]) {
  const data = withData(stories);
  return (
    revenueStory(data) ??
    data.find((s) => s.improved && s.change !== null) ??
    data[0] ??
    null
  );
}

/** One row per report period, one column per KPI: the month-by-month table. */
export function periodRows(snap: PortalSnapshot) {
  const value = new Map(snap.report_metrics.map((m) => [`${m.report_id}:${m.client_kpi_id}`, Number(m.value)]));
  const kpis = [...snap.kpis].sort((a, b) => a.sort_order - b.sort_order);
  return [...snap.reports]
    .sort((a, b) => b.period_end.localeCompare(a.period_end))
    .map((r) => ({
      id: r.id,
      period: periodLabel(r.period_start, r.period_end),
      period_end: r.period_end,
      values: Object.fromEntries(kpis.map((k) => [k.id, value.get(`${r.id}:${k.id}`) ?? null])) as Record<string, number | null>,
    }));
}

export function periodLabel(start: string, end: string) {
  const s = parseISO(start);
  const e = parseISO(end);
  return format(s, "yyyy-MM") === format(e, "yyyy-MM") ? format(s, "MMMM yyyy") : `${format(s, "d MMM")} – ${format(e, "d MMM yyyy")}`;
}

export function money(snap: PortalSnapshot) {
  return billing(snap.invoices as unknown as Invoice[], snap.payments as unknown as Payment[]);
}

/** Open action items first (newest first), then nothing else: what needs the client. */
export const openActions = (updates: PortalUpdate[]) => updates.filter((u) => u.kind === "action" && !u.resolved_at);

export const notes = (updates: PortalUpdate[]) => updates.filter((u) => u.kind === "update");

export function roadmapProgress(milestones: PortalMilestone[]) {
  const done = milestones.filter((m) => m.status === "done").length;
  return { done, total: milestones.length, pct: milestones.length ? Math.round((done / milestones.length) * 100) : 0 };
}

/** "Up 12%" wording that respects cost-type KPIs, where down is good. */
export function changeWord(story: KpiStory) {
  if (story.change === null) return null;
  const direction = story.change > 0 ? "up" : story.change < 0 ? "down" : "flat";
  return `${direction} ${Math.abs(story.change)}%`;
}

export { lowerIsBetter };

/** A short plain-English sentence about how the headline KPI is doing. */
export function headlineSentence(story: KpiStory | null) {
  if (!story || story.latest === null) return "Your first report will appear here once it's ready.";
  if (story.change === null) return `${story.kpi.name} is being tracked from ${story.points[0]?.label}.`;
  const word = changeWord(story);
  const tone = story.improved === false ? "Worth a look together" : story.improved ? "Moving the right way" : "Holding steady";
  return `${story.kpi.name} is ${word} since ${story.points[0]?.label}. ${tone}.`;
}
