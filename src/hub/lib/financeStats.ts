import {
  differenceInCalendarDays,
  endOfMonth,
  format,
  parseISO,
  startOfMonth,
  startOfYear,
  subMonths,
  subYears,
} from "date-fns";
import { invoiceState, paidByInvoice, sumAmounts } from "./finance";
import type { Expense, ExpenseCategory, Invoice, Payment, PaymentMethod } from "./types";

// Numbers behind the finance dashboard. Pure functions so every chart reads
// from one place and the figures always agree with each other.

export type Period = "this_month" | "last_month" | "this_year" | "all";
export type Range = [string, string] | null;

export const PERIOD_LABEL: Record<Period, string> = {
  this_month: "This month",
  last_month: "Last month",
  this_year: "This year",
  all: "All time",
};

const COMPARE_LABEL: Record<Period, string | null> = {
  this_month: "vs same point last month",
  last_month: "vs the month before",
  this_year: "vs same point last year",
  all: null,
};

const iso = (d: Date) => format(d, "yyyy-MM-dd");

export function periodRange(period: Period, now = new Date()): Range {
  if (period === "this_month") return [iso(startOfMonth(now)), iso(endOfMonth(now))];
  if (period === "last_month") {
    const last = subMonths(now, 1);
    return [iso(startOfMonth(last)), iso(endOfMonth(last))];
  }
  if (period === "this_year") return [iso(startOfYear(now)), iso(now)];
  return null;
}

/** The comparison window: same length, one step back, so mid-month numbers compare fairly. */
export function previousRange(period: Period, now = new Date()): Range {
  if (period === "this_month") {
    const last = subMonths(now, 1);
    return [iso(startOfMonth(last)), iso(last)];
  }
  if (period === "last_month") {
    const before = subMonths(now, 2);
    return [iso(startOfMonth(before)), iso(endOfMonth(before))];
  }
  if (period === "this_year") {
    const lastYear = subYears(now, 1);
    return [iso(startOfYear(lastYear)), iso(lastYear)];
  }
  return null;
}

export const inRange = (date: string, range: Range) => !range || (date >= range[0] && date <= range[1]);

/** % change, or null when there's nothing to compare against. */
export function change(current: number, previous: number | null) {
  if (previous === null || previous === 0) return null;
  return Math.round(((current - previous) / Math.abs(previous)) * 100);
}

export type MonthPoint = {
  key: string;
  month: string;
  moneyIn: number;
  moneyOut: number;
  profit: number;
  margin: number | null;
};

export function monthlySeries(
  payments: Payment[],
  expenses: Expense[],
  months: number,
  now = new Date(),
): MonthPoint[] {
  const out: MonthPoint[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = format(d, "yyyy-MM");
    const moneyIn = sumAmounts(payments.filter((p) => p.paid_on.startsWith(key)));
    const moneyOut = sumAmounts(expenses.filter((e) => e.spent_on.startsWith(key)));
    out.push({
      key,
      month: format(d, months > 6 ? "MMM" : "MMM yy").replace(" ", " '"),
      moneyIn,
      moneyOut,
      profit: moneyIn - moneyOut,
      margin: moneyIn > 0 ? Math.round(((moneyIn - moneyOut) / moneyIn) * 100) : null,
    });
  }
  return out;
}

export type Ranked<K extends string = string> = { key: K; label: string; amount: number; share: number };

function rank<K extends string>(totals: Map<K, number>, label: (k: K) => string, limit: number): Ranked<K>[] {
  const all = [...totals.entries()].filter(([, v]) => v > 0).sort((a, b) => b[1] - a[1]);
  const total = all.reduce((s, [, v]) => s + v, 0);
  const top = all.slice(0, limit);
  const rest = all.slice(limit).reduce((s, [, v]) => s + v, 0);
  const rows: Ranked<K>[] = top.map(([key, amount]) => ({
    key,
    label: label(key),
    amount,
    share: total ? amount / total : 0,
  }));
  if (rest > 0)
    rows.push({ key: "__other" as K, label: "Everything else", amount: rest, share: total ? rest / total : 0 });
  return rows;
}

export type AgingBucket = { key: string; label: string; amount: number; count: number; overdue: boolean };

export type Dashboard = ReturnType<typeof buildDashboard>;

export function buildDashboard({
  invoices,
  payments,
  expenses,
  period,
  clientName,
  categoryLabel,
  methodLabel,
  now = new Date(),
}: {
  invoices: Invoice[];
  payments: Payment[];
  expenses: Expense[];
  period: Period;
  clientName: (id: string) => string;
  categoryLabel: (c: ExpenseCategory) => string;
  methodLabel: (m: PaymentMethod) => string;
  now?: Date;
}) {
  const range = periodRange(period, now);
  const prev = previousRange(period, now);
  const today = iso(now);
  const paid = paidByInvoice(payments);

  const moneyIn = sumAmounts(payments.filter((p) => inRange(p.paid_on, range)));
  const moneyOut = sumAmounts(expenses.filter((e) => inRange(e.spent_on, range)));
  const prevIn = prev ? sumAmounts(payments.filter((p) => inRange(p.paid_on, prev))) : null;
  const prevOut = prev ? sumAmounts(expenses.filter((e) => inRange(e.spent_on, prev))) : null;
  const profit = moneyIn - moneyOut;
  const prevProfit = prevIn !== null && prevOut !== null ? prevIn - prevOut : null;

  // Receivables: what's owed on sent invoices right now, by how late it is.
  const buckets: AgingBucket[] = [
    { key: "current", label: "Not due yet", amount: 0, count: 0, overdue: false },
    { key: "1-30", label: "1–30 days late", amount: 0, count: 0, overdue: true },
    { key: "31-60", label: "31–60 days late", amount: 0, count: 0, overdue: true },
    { key: "60+", label: "Over 60 days late", amount: 0, count: 0, overdue: true },
  ];
  let owed = 0;
  for (const inv of invoices) {
    if (inv.status !== "sent") continue;
    const balance = Number(inv.amount) - (paid.get(inv.id) ?? 0);
    if (balance <= 0) continue;
    owed += balance;
    const late = inv.due_date ? differenceInCalendarDays(now, parseISO(inv.due_date)) : 0;
    const b = late <= 0 ? buckets[0] : late <= 30 ? buckets[1] : late <= 60 ? buckets[2] : buckets[3];
    b.amount += balance;
    b.count += 1;
  }
  const overdueAmount = buckets.filter((b) => b.overdue).reduce((s, b) => s + b.amount, 0);
  const overdueCount = buckets.filter((b) => b.overdue).reduce((s, b) => s + b.count, 0);

  // Invoices issued in the period, split by where the money stands.
  const issued = invoices.filter((i) => i.status !== "void" && i.status !== "draft" && inRange(i.issue_date, range));
  const health = { paid: 0, awaiting: 0, overdue: 0, invoiced: 0, count: issued.length };
  for (const inv of issued) {
    const amount = Number(inv.amount);
    const got = Math.min(amount, paid.get(inv.id) ?? 0);
    health.invoiced += amount;
    health.paid += got;
    const left = amount - got;
    if (left > 0) {
      if (invoiceState(inv, got) === "overdue") health.overdue += left;
      else health.awaiting += left;
    }
  }
  const collectionRate = health.invoiced > 0 ? Math.round((health.paid / health.invoiced) * 100) : null;

  // Average days from issue to full payment, for invoices fully paid in the period.
  const daysToPay: number[] = [];
  for (const inv of invoices) {
    const ps = payments.filter((p) => p.invoice_id === inv.id).sort((a, b) => a.paid_on.localeCompare(b.paid_on));
    let running = 0;
    for (const p of ps) {
      running += Number(p.amount);
      if (running >= Number(inv.amount)) {
        if (inRange(p.paid_on, range))
          daysToPay.push(differenceInCalendarDays(parseISO(p.paid_on), parseISO(inv.issue_date)));
        break;
      }
    }
  }
  const avgDaysToPay = daysToPay.length ? Math.round(daysToPay.reduce((s, d) => s + d, 0) / daysToPay.length) : null;

  const byCategory = new Map<ExpenseCategory, number>();
  for (const e of expenses)
    if (inRange(e.spent_on, range)) byCategory.set(e.category, (byCategory.get(e.category) ?? 0) + Number(e.amount));

  const byClient = new Map<string, number>();
  for (const p of payments)
    if (inRange(p.paid_on, range)) byClient.set(p.client_id, (byClient.get(p.client_id) ?? 0) + Number(p.amount));

  const byMethod = new Map<PaymentMethod, number>();
  for (const p of payments)
    if (inRange(p.paid_on, range)) byMethod.set(p.method, (byMethod.get(p.method) ?? 0) + Number(p.amount));

  const thisMonthKey = format(now, "yyyy-MM");
  const monthIn = sumAmounts(payments.filter((p) => p.paid_on.startsWith(thisMonthKey)));

  return {
    range,
    today,
    compareLabel: COMPARE_LABEL[period],
    moneyIn,
    moneyOut,
    profit,
    margin: moneyIn > 0 ? Math.round((profit / moneyIn) * 100) : null,
    inChange: prevIn === null ? null : change(moneyIn, prevIn),
    outChange: prevOut === null ? null : change(moneyOut, prevOut),
    profitChange: change(profit, prevProfit),
    owed,
    overdueAmount,
    overdueCount,
    aging: buckets,
    health,
    collectionRate,
    avgDaysToPay,
    categories: rank(byCategory, categoryLabel, 5),
    clients: rank(byClient, clientName, 5),
    methods: rank(byMethod, methodLabel, 4),
    monthIn,
  };
}
