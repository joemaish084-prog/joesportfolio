import { addDays, differenceInCalendarDays, format, parseISO, startOfMonth, startOfYear, subDays } from "date-fns";
import type { FollowUpTask } from "./types";

// Date ranges for the dashboard and follow-up buckets. The agency works in
// Nairobi time; the browser's clock is close enough for picking days.

export const RANGE_PRESETS = ["this_month", "last_30", "last_90", "this_year", "all"] as const;
export type RangePreset = (typeof RANGE_PRESETS)[number] | "custom";

export const RANGE_LABEL: Record<RangePreset, string> = {
  this_month: "This month",
  last_30: "Last 30 days",
  last_90: "Last 90 days",
  this_year: "This year",
  all: "All time",
  custom: "Custom",
};

const iso = (d: Date) => format(d, "yyyy-MM-dd");

/** Inclusive from/to days for a preset. */
export function presetDays(preset: Exclude<RangePreset, "custom">, today = new Date()): { from: string; to: string } {
  switch (preset) {
    case "this_month":
      return { from: iso(startOfMonth(today)), to: iso(today) };
    case "last_30":
      return { from: iso(subDays(today, 29)), to: iso(today) };
    case "last_90":
      return { from: iso(subDays(today, 89)), to: iso(today) };
    case "this_year":
      return { from: iso(startOfYear(today)), to: iso(today) };
    case "all":
      return { from: "2000-01-01", to: iso(today) };
  }
}

/** Timestamps for the metrics RPC: start of the first day to the start of the day after the last, in Nairobi. */
export function rangeBounds(from: string, to: string) {
  return { from: `${from}T00:00:00+03:00`, to: `${iso(addDays(parseISO(to), 1))}T00:00:00+03:00` };
}

export type FollowUpBucket = "overdue" | "today" | "week" | "later" | "paused";

export const BUCKET_LABEL: Record<FollowUpBucket, string> = {
  overdue: "Overdue",
  today: "Due today",
  week: "Next 7 days",
  later: "Later",
  paused: "Paused",
};

export function followUpBucket(task: Pick<FollowUpTask, "due_on" | "status">, today = new Date()): FollowUpBucket {
  if (task.status === "paused") return "paused";
  const days = differenceInCalendarDays(parseISO(task.due_on), today);
  if (days < 0) return "overdue";
  if (days === 0) return "today";
  if (days <= 7) return "week";
  return "later";
}

/** Adds business days (Mon-Fri), like crm_add_business_days. */
export function addBusinessDays(fromIso: string, days: number) {
  let d = parseISO(fromIso);
  let n = 0;
  while (n < days) {
    d = addDays(d, 1);
    const dow = d.getDay();
    if (dow !== 0 && dow !== 6) n += 1;
  }
  return iso(d);
}
