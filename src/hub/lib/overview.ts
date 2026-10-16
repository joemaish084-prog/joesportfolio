import { addDays, endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import { invoiceState, paidByInvoice } from "./finance";
import type { Client, HubDocument, Invoice, Lead, OnboardingItem, Payment, Report, WorkLogEntry } from "./types";

// Data shaping for the Overview page: the agenda (what's coming up) and the
// activity feed (what just happened). Pure functions over rows already loaded.

export type AgendaKind = "step" | "invoice" | "followup" | "report";

export type AgendaItem = {
  id: string;
  kind: AgendaKind;
  title: string;
  detail: string;
  date: string | null;
  to: string;
  /** Money involved, shown through the privacy-aware formatter. */
  amount?: number;
};

export type AgendaGroups = { today: AgendaItem[]; week: AgendaItem[]; later: AgendaItem[]; todo: AgendaItem[] };

const OPEN_LEAD_STAGES = new Set(["new", "contacted", "meeting", "proposal"]);

/**
 * Upcoming work, not yet late (late items live in "Needs attention"):
 * onboarding steps, invoices falling due, lead follow-ups (next 30 days),
 * plus last month's missing reports as a to-do.
 */
export function buildAgenda({
  clients,
  items,
  invoices,
  payments,
  leads,
  reports,
  now = new Date(),
}: {
  clients: Client[];
  items: OnboardingItem[];
  invoices: Invoice[];
  payments: Payment[];
  leads: Lead[];
  reports: Report[];
  now?: Date;
}): AgendaGroups {
  const today = format(now, "yyyy-MM-dd");
  const weekEnd = format(addDays(now, 7), "yyyy-MM-dd");
  const horizon = format(addDays(now, 30), "yyyy-MM-dd");
  const live = new Map(clients.filter((c) => !c.archived_at).map((c) => [c.id, c]));
  const name = (id: string) => live.get(id)?.name ?? "Client";
  const paid = paidByInvoice(payments);
  const all: AgendaItem[] = [];

  for (const i of items) {
    if (i.is_done || !i.due_date || i.due_date < today || i.due_date > horizon || !live.has(i.client_id)) continue;
    all.push({
      id: `s-${i.id}`,
      kind: "step",
      title: i.title,
      detail: `${name(i.client_id)} · onboarding`,
      date: i.due_date,
      to: `/hub/clients/${i.client_id}?tab=onboarding`,
    });
  }
  for (const inv of invoices) {
    const got = paid.get(inv.id) ?? 0;
    const state = invoiceState(inv, got);
    // Only invoices that are out and not yet late; late ones are in "Needs attention".
    if (state !== "sent" && state !== "part_paid") continue;
    const balance = Number(inv.amount) - got;
    if (!inv.due_date || balance <= 0 || inv.due_date < today || inv.due_date > horizon) continue;
    all.push({
      id: `i-${inv.id}`,
      kind: "invoice",
      title: `${inv.number} falls due`,
      detail: name(inv.client_id),
      date: inv.due_date,
      to: `/hub/finance/invoices/${inv.id}`,
      amount: balance,
    });
  }
  for (const l of leads) {
    if (l.archived_at || !OPEN_LEAD_STAGES.has(l.stage) || !l.next_follow_up) continue;
    if (l.next_follow_up < today || l.next_follow_up > horizon) continue;
    all.push({
      id: `l-${l.id}`,
      kind: "followup",
      title: `Follow up with ${l.name}`,
      detail: l.contact_person ? `Lead · ${l.contact_person}` : "Lead",
      date: l.next_follow_up,
      to: "/hub/pipeline",
    });
  }

  // Active clients without a report covering last month.
  const last = subMonths(now, 1);
  const lastStart = format(startOfMonth(last), "yyyy-MM-dd");
  const lastEnd = format(endOfMonth(last), "yyyy-MM-dd");
  const todo: AgendaItem[] = [...live.values()]
    .filter((c) => c.status === "active")
    .filter((c) => !reports.some((r) => r.client_id === c.id && r.period_end >= lastStart && r.period_start <= lastEnd))
    .map((c) => ({
      id: `r-${c.id}`,
      kind: "report" as const,
      title: `${format(last, "MMMM")} report for ${c.name}`,
      detail: "Not added yet",
      date: null,
      to: `/hub/clients/${c.id}?tab=progress`,
    }));

  all.sort((a, b) => (a.date ?? "").localeCompare(b.date ?? ""));
  return {
    today: all.filter((a) => a.date === today),
    week: all.filter((a) => a.date! > today && a.date! <= weekEnd),
    later: all.filter((a) => a.date! > weekEnd),
    todo,
  };
}

export type ActivityKind = "payment" | "invoice" | "work" | "document" | "lead" | "client" | "report" | "step";

export type ActivityItem = {
  id: string;
  kind: ActivityKind;
  /** Sentence start before the subject, e.g. "Payment from". */
  text: string;
  subject: string;
  at: string;
  to: string;
  amount?: number;
};

/** The latest things that happened across the hub, newest first. */
export function buildActivity(
  {
    clients,
    items,
    invoices,
    payments,
    leads,
    reports,
    work,
    documents,
  }: {
    clients: Client[];
    items: OnboardingItem[];
    invoices: Invoice[];
    payments: Payment[];
    leads: Lead[];
    reports: Report[];
    work: WorkLogEntry[];
    documents: HubDocument[];
  },
  limit = 8,
): ActivityItem[] {
  const names = new Map(clients.map((c) => [c.id, c.name]));
  const name = (id: string | null) => (id ? (names.get(id) ?? "a client") : "general");
  const out: ActivityItem[] = [];

  for (const p of payments)
    out.push({
      id: `p-${p.id}`,
      kind: "payment",
      text: "Payment received from",
      subject: name(p.client_id),
      at: p.created_at,
      to: "/hub/finance",
      amount: Number(p.amount),
    });
  for (const i of invoices)
    out.push({
      id: `i-${i.id}`,
      kind: "invoice",
      text: `Invoice ${i.number} created for`,
      subject: name(i.client_id),
      at: i.created_at,
      to: `/hub/finance/invoices/${i.id}`,
      amount: Number(i.amount),
    });
  for (const w of work)
    out.push({
      id: `w-${w.id}`,
      kind: "work",
      text: `Logged "${w.title}" for`,
      subject: name(w.client_id),
      at: w.created_at,
      to: `/hub/clients/${w.client_id}?tab=worklog`,
    });
  for (const d of documents)
    out.push({
      id: `d-${d.id}`,
      kind: "document",
      text: d.is_template ? `Template "${d.title}" added` : `Uploaded "${d.title}" for`,
      subject: d.is_template ? "" : name(d.client_id),
      at: d.created_at,
      to: d.client_id ? `/hub/clients/${d.client_id}?tab=documents` : "/hub/documents",
    });
  for (const l of leads)
    out.push({
      id: `l-${l.id}`,
      kind: "lead",
      text: "New lead:",
      subject: l.name,
      at: l.created_at,
      to: "/hub/pipeline",
    });
  for (const c of clients)
    out.push({
      id: `c-${c.id}`,
      kind: "client",
      text: "Added client",
      subject: c.name,
      at: c.created_at,
      to: `/hub/clients/${c.id}`,
    });
  for (const r of reports)
    out.push({
      id: `r-${r.id}`,
      kind: "report",
      text: `${r.title} added for`,
      subject: name(r.client_id),
      at: r.created_at,
      to: `/hub/clients/${r.client_id}?tab=progress`,
    });
  for (const i of items)
    if (i.is_done && i.done_at)
      out.push({
        id: `s-${i.id}`,
        kind: "step",
        text: `Completed "${i.title}" for`,
        subject: name(i.client_id),
        at: i.done_at,
        to: `/hub/clients/${i.client_id}?tab=onboarding`,
      });

  return out.sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit);
}

/** Money received per month, oldest first, for the mini chart. */
export function moneyInByMonth(payments: Payment[], months = 6, now = new Date()) {
  const out: { key: string; label: string; amount: number }[] = [];
  for (let i = months - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = format(d, "yyyy-MM");
    out.push({
      key,
      label: format(d, "MMM"),
      amount: payments.filter((p) => p.paid_on.startsWith(key)).reduce((s, p) => s + Number(p.amount), 0),
    });
  }
  return out;
}
