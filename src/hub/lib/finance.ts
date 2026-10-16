import { format, isBefore, parseISO, startOfToday } from "date-fns";
import type { PillTone } from "../components/ui";
import type { Expense, Invoice, Payment } from "./types";

/** Shown on printed invoices. Edit to change your letterhead. */
export const BUSINESS = {
  name: "Joseph Maina",
  tagline: "Digital Marketing",
  location: "Nairobi, Kenya",
  website: "josephmaina.co.ke",
};

export type InvoiceState = "draft" | "sent" | "part_paid" | "paid" | "overdue" | "void";

export const INVOICE_STATE: Record<InvoiceState, { label: string; tone: PillTone }> = {
  draft: { label: "Draft", tone: "muted" },
  sent: { label: "Sent", tone: "neutral" },
  part_paid: { label: "Part-paid", tone: "neutral" },
  paid: { label: "Paid", tone: "accent" },
  overdue: { label: "Overdue", tone: "warning" },
  void: { label: "Void", tone: "outline" },
};

/** Sums payments per invoice id. */
export function paidByInvoice(payments: Payment[]) {
  const map = new Map<string, number>();
  for (const p of payments) if (p.invoice_id) map.set(p.invoice_id, (map.get(p.invoice_id) ?? 0) + Number(p.amount));
  return map;
}

export function invoiceState(invoice: Invoice, paid: number): InvoiceState {
  if (invoice.status === "void") return "void";
  if (Number(invoice.amount) > 0 && paid >= Number(invoice.amount)) return "paid";
  if (invoice.status === "draft") return "draft";
  if (invoice.due_date && isBefore(parseISO(invoice.due_date), startOfToday())) return "overdue";
  return paid > 0 ? "part_paid" : "sent";
}

/** What's still owed on invoices that have gone out. */
export function outstanding(invoice: Invoice, paid: number) {
  if (invoice.status !== "sent") return 0;
  return Math.max(0, Number(invoice.amount) - paid);
}

/** INV-2026-001, INV-2026-002… continuing from the highest number used this year. */
export function nextInvoiceNumber(invoices: Invoice[], date = new Date()) {
  const prefix = `INV-${format(date, "yyyy")}-`;
  const used = invoices
    .map((i) => (i.number.startsWith(prefix) ? Number(i.number.slice(prefix.length)) : NaN))
    .filter((n) => Number.isFinite(n));
  const next = (used.length ? Math.max(...used) : 0) + 1;
  return `${prefix}${String(next).padStart(3, "0")}`;
}

export const sumAmounts = (rows: { amount: number }[]) => rows.reduce((s, r) => s + Number(r.amount), 0);

/** Revenue (payments received) and expenses per month for the last `months` months, oldest first. */
export function monthlyTotals(payments: Payment[], expenses: Expense[], months = 6, now = new Date()) {
  const keys: string[] = [];
  for (let i = months - 1; i >= 0; i--)
    keys.push(format(new Date(now.getFullYear(), now.getMonth() - i, 1), "yyyy-MM"));
  return keys.map((key) => {
    const revenue = sumAmounts(payments.filter((p) => p.paid_on.startsWith(key)));
    const spent = sumAmounts(expenses.filter((e) => e.spent_on.startsWith(key)));
    return { month: format(parseISO(`${key}-01`), "MMM"), key, revenue, expenses: spent, profit: revenue - spent };
  });
}
