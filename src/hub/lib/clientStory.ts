import { differenceInCalendarMonths, format, parseISO } from "date-fns";
import { invoiceState, paidByInvoice } from "./finance";
import { lowerIsBetter } from "./format";
import type { ClientKpi, Invoice, Payment, Report, ReportMetric, WorkLogEntry } from "./types";

// The numbers behind the client presentation: where they started, where they
// are now, what was done, and where billing stands. Only things that are fine
// for the client to see in a meeting; profit, expenses and notes never come here.

export type KpiStory = {
  kpi: ClientKpi;
  points: { label: string; value: number; end: string }[];
  first: number | null;
  latest: number | null;
  /** % change from the first report to the latest, signed. */
  change: number | null;
  /** True when the change is an improvement (cost-type KPIs improve going down). */
  improved: boolean | null;
  /** Progress to target, 0–1, when a target is set. */
  toTarget: number | null;
};

const periodShort = (r: Pick<Report, "period_start" | "period_end">) => {
  const s = parseISO(r.period_start);
  const e = parseISO(r.period_end);
  return format(s, "yyyy-MM") === format(e, "yyyy-MM") ? format(s, "MMM yy") : format(e, "d MMM yy");
};

export function kpiStories(kpis: ClientKpi[], reports: Report[], metrics: ReportMetric[]): KpiStory[] {
  const ordered = [...reports].sort((a, b) => a.period_end.localeCompare(b.period_end));
  const value = new Map(metrics.map((m) => [`${m.report_id}:${m.client_kpi_id}`, Number(m.value)]));
  return [...kpis]
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((kpi) => {
      const points = ordered
        .filter((r) => value.has(`${r.id}:${kpi.id}`))
        .map((r) => ({ label: periodShort(r), value: value.get(`${r.id}:${kpi.id}`) as number, end: r.period_end }));
      const first = points[0]?.value ?? null;
      const latest = points.at(-1)?.value ?? null;
      const change =
        points.length >= 2 && first !== null && latest !== null && first !== 0
          ? Math.round(((latest - first) / Math.abs(first)) * 100)
          : null;
      const lower = lowerIsBetter(kpi.name);
      const improved = change === null || change === 0 ? null : lower ? change < 0 : change > 0;
      const toTarget =
        kpi.target && latest !== null
          ? Math.max(0, Math.min(1, lower ? Number(kpi.target) / Math.max(latest, 0.0001) : latest / Number(kpi.target)))
          : null;
      return { kpi, points, first, latest, change, improved, toTarget };
    });
}

/**
 * The KPI that says how much money the client's business brings in: a KES KPI
 * named like revenue/sales/income first, otherwise the first KES KPI with numbers.
 */
export function revenueStory(stories: KpiStory[]) {
  const money = stories.filter((s) => s.kpi.unit === "kes" && s.points.length > 0);
  return (
    money.find((s) => /revenue|sales|income|turnover|gmv|takings/i.test(s.kpi.name)) ??
    money.find((s) => !/cost|spend|cpa|cpl|budget/i.test(s.kpi.name)) ??
    null
  );
}

/** The single best improvement, for the headline. */
export function bestStory(stories: KpiStory[]) {
  return stories
    .filter((s) => s.improved && s.change !== null)
    .sort((a, b) => Math.abs(b.change as number) - Math.abs(a.change as number))[0];
}

/** Work log grouped by month, newest month first. Minutes stay out: they're for you, not the client. */
export function workByMonth(entries: WorkLogEntry[]) {
  const groups = new Map<string, WorkLogEntry[]>();
  for (const e of [...entries].sort((a, b) => b.worked_on.localeCompare(a.worked_on))) {
    const key = e.worked_on.slice(0, 7);
    groups.set(key, [...(groups.get(key) ?? []), e]);
  }
  return [...groups.entries()].map(([key, items]) => ({
    key,
    label: format(parseISO(`${key}-01`), "MMMM yyyy"),
    items,
  }));
}

/** Invoices the client has actually had (unsent drafts and voided ones stay out), with what's been paid. */
export function billing(invoices: Invoice[], payments: Payment[]) {
  const paid = paidByInvoice(payments);
  const sent = invoices
    .map((i) => {
      const got = Math.min(Number(i.amount), paid.get(i.id) ?? 0);
      const state = invoiceState(i, got);
      return { invoice: i, paid: got, balance: state === "paid" ? 0 : Math.max(0, Number(i.amount) - got), state };
    })
    // A paid invoice counts even if it was never moved out of draft (e.g. imported history).
    .filter((r) => r.state !== "draft" && r.state !== "void")
    .sort((a, b) => b.invoice.issue_date.localeCompare(a.invoice.issue_date));
  // Every payment counts, including ones recorded without an invoice.
  const received = payments.reduce((s, p) => s + Number(p.amount), 0);
  const year = String(new Date().getFullYear());
  const thisYear = payments.filter((p) => p.paid_on.startsWith(year)).reduce((s, p) => s + Number(p.amount), 0);
  const outstanding = sent.reduce((s, r) => s + r.balance, 0);
  const overdue = sent.filter((r) => r.state === "overdue").reduce((s, r) => s + r.balance, 0);
  return { rows: sent, received, thisYear, outstanding, overdue };
}

/** "7 months" since the start date (or since the first record we have). */
export function togetherFor(start: string | null, now = new Date()) {
  if (!start) return null;
  const months = differenceInCalendarMonths(now, parseISO(start));
  if (months < 1) return "less than a month";
  if (months < 12) return `${months} ${months === 1 ? "month" : "months"}`;
  const years = Math.floor(months / 12);
  const rest = months % 12;
  return `${years} ${years === 1 ? "year" : "years"}${rest ? ` ${rest} ${rest === 1 ? "month" : "months"}` : ""}`;
}
