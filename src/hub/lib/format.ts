import { format, isBefore, parseISO, startOfToday } from "date-fns";

const kesFormatter = new Intl.NumberFormat("en-KE", { maximumFractionDigits: 0 });

/** "KES 45,000" */
export function formatKES(value: number | null | undefined) {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  return `KES ${kesFormatter.format(value)}`;
}

export function formatDate(value: string | null | undefined, pattern = "d MMM yyyy") {
  if (!value) return "—";
  return format(parseISO(value), pattern);
}

export function isOverdue(dueDate: string | null, isDone: boolean) {
  return !!dueDate && !isDone && isBefore(parseISO(dueDate), startOfToday());
}

export function greeting(date = new Date()) {
  const hour = date.getHours();
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]!.toUpperCase())
    .join("");
}

export function toNumberOrNull(value: string) {
  const cleaned = value.replace(/[,\s]/g, "");
  if (cleaned === "") return null;
  const n = Number(cleaned);
  return Number.isFinite(n) ? n : null;
}

const kpiNumber = new Intl.NumberFormat("en-KE", { maximumFractionDigits: 2 });

/** A KPI value in its unit: "4.2", "KES 12,000", "3.5%". */
export function formatKpi(value: number | null | undefined, unit: "number" | "kes" | "percent") {
  if (value === null || value === undefined || Number.isNaN(value)) return "—";
  if (unit === "kes") return formatKES(value);
  if (unit === "percent") return `${kpiNumber.format(value)}%`;
  return kpiNumber.format(value);
}

/** Cost-type KPIs (cost per lead, CPA…) improve when they go down. */
export function lowerIsBetter(kpiName: string) {
  return /\b(cost|cpa|cpl|cpc|cpm|cost per|spend|bounce|churn)\b/i.test(kpiName);
}
