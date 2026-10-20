import { addDays, addMonths, differenceInCalendarDays, differenceInCalendarMonths, format, parseISO } from "date-fns";
import type { Client, EngagementType } from "./types";

// How a client works with you: monthly retainer, fixed-term contract, or a
// one-off project (which can be as short as a few days).

export const ENGAGEMENT: Record<
  EngagementType,
  { label: string; short: string; description: string; endLabel: string }
> = {
  retainer: {
    label: "Monthly retainer",
    short: "Retainer",
    description: "Ongoing, billed every month",
    endLabel: "End date",
  },
  contract: {
    label: "Fixed-term contract",
    short: "Contract",
    description: "Monthly for a set period, e.g. 4 months",
    endLabel: "Contract ends",
  },
  project: {
    label: "One-off project",
    short: "Project",
    description: "A single job with one fee, from a few days up",
    endLabel: "Deadline",
  },
};

/** Retainers and contracts bill monthly; projects don't. */
export const isMonthly = (c: Pick<Client, "engagement_type">) => c.engagement_type !== "project";

/** Monthly clients still within their term on `on` (contracts past their end date drop off). */
export function billsMonthly(c: Pick<Client, "engagement_type" | "end_date">, on = new Date()) {
  if (!isMonthly(c)) return false;
  return !(c.engagement_type === "contract" && c.end_date && c.end_date < format(on, "yyyy-MM-dd"));
}

/** The fee to show: "per month" for retainers and contracts, the total for a project. */
export function feeOf(c: Pick<Client, "engagement_type" | "monthly_fee" | "project_fee">) {
  return isMonthly(c)
    ? { amount: c.monthly_fee, suffix: "/mo", label: "Monthly fee" }
    : { amount: c.project_fee, suffix: "", label: "Project fee" };
}

/** "3 days", "1 week", "2 weeks", "4 months"… between two ISO dates, inclusive of the last day. */
export function durationLabel(start: string | null, end: string | null) {
  if (!start || !end || end < start) return null;
  const s = parseISO(start);
  const e = parseISO(end);
  const days = differenceInCalendarDays(e, s) + 1;
  if (days < 7) return `${days} ${days === 1 ? "day" : "days"}`;
  if (days < 28) {
    const w = Math.round(days / 7);
    return days % 7 === 0 ? `${w} ${w === 1 ? "week" : "weeks"}` : `${days} days`;
  }
  const months = differenceInCalendarMonths(addDays(e, 1), s);
  return months >= 1 ? `${months} ${months === 1 ? "month" : "months"}` : `${days} days`;
}

/** Countdown to the contract end or project deadline. */
export function timeLeft(c: Pick<Client, "engagement_type" | "end_date" | "status">, now = new Date()) {
  if (!c.end_date || c.engagement_type === "retainer" || c.status === "ended") return null;
  const days = differenceInCalendarDays(parseISO(c.end_date), now);
  const what = c.engagement_type === "project" ? "Deadline" : "Ends";
  if (days < 0) return { days, tone: "late" as const, text: `${what} passed ${format(parseISO(c.end_date), "d MMM")}` };
  if (days === 0) return { days, tone: "soon" as const, text: `${what} today` };
  if (days === 1) return { days, tone: "soon" as const, text: `${what} tomorrow` };
  return {
    days,
    tone: days <= 7 ? ("soon" as const) : ("later" as const),
    text: `${days} days left`,
  };
}

/** Quick lengths offered when setting the end date. */
export const DURATION_PRESETS: Record<EngagementType, { label: string; apply: (start: Date) => Date }[]> = {
  retainer: [],
  contract: [
    { label: "3 months", apply: (s) => addDays(addMonths(s, 3), -1) },
    { label: "4 months", apply: (s) => addDays(addMonths(s, 4), -1) },
    { label: "6 months", apply: (s) => addDays(addMonths(s, 6), -1) },
    { label: "12 months", apply: (s) => addDays(addMonths(s, 12), -1) },
  ],
  project: [
    { label: "3 days", apply: (s) => addDays(s, 2) },
    { label: "1 week", apply: (s) => addDays(s, 6) },
    { label: "2 weeks", apply: (s) => addDays(s, 13) },
    { label: "1 month", apply: (s) => addDays(addMonths(s, 1), -1) },
  ],
};
