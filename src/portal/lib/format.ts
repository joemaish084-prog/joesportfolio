import { differenceInCalendarDays, format, formatDistanceToNowStrict, isToday, isYesterday, parseISO } from "date-fns";
import type { KpiUnit } from "@/hub/lib/types";

const compact = new Intl.NumberFormat("en-KE", { notation: "compact", maximumFractionDigits: 2 });
const plain = new Intl.NumberFormat("en-KE", { maximumFractionDigits: 2 });
const whole = new Intl.NumberFormat("en-KE", { maximumFractionDigits: 0 });

/** Big-number display for hero cards: KES 1.46M, 4.8, 3.5%. */
export function formatBig(value: number, unit: KpiUnit) {
  if (unit === "kes") return Math.abs(value) >= 100000 ? `KES ${compact.format(value)}` : `KES ${whole.format(value)}`;
  if (unit === "percent") return `${plain.format(value)}%`;
  return Math.abs(value) >= 100000 ? compact.format(value) : plain.format(value);
}

export function formatMoney(value: number, currency = "KES") {
  return `${currency} ${whole.format(value)}`;
}

/** "Today", "Yesterday", "3 days ago", then a date. */
export function friendlyDate(iso: string) {
  const d = parseISO(iso);
  if (isToday(d)) return "Today";
  if (isYesterday(d)) return "Yesterday";
  if (differenceInCalendarDays(new Date(), d) < 7) return `${formatDistanceToNowStrict(d)} ago`;
  return format(d, "d MMM yyyy");
}

export function greetingFor(date = new Date()) {
  const h = nairobiHour(date);
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export function fileSize(bytes: number | null) {
  if (!bytes) return "";
  if (bytes < 1024 * 1024) return `${Math.max(1, Math.round(bytes / 1024))} KB`;
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`;
}

// Kenya time. Clients and the agency are in Nairobi, so greetings and dates
// follow East Africa Time whatever the device clock says.
const NAIROBI = "Africa/Nairobi";

export function nairobiHour(date = new Date()) {
  const h = new Intl.DateTimeFormat("en-GB", { hour: "numeric", hourCycle: "h23", timeZone: NAIROBI }).format(date);
  return Number(h) % 24;
}

/** "Tuesday, 28 October" in Nairobi. */
export function nairobiDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-GB", { weekday: "long", day: "numeric", month: "long", timeZone: NAIROBI }).format(date);
}

/** The Swahili greeting for the time of day: asubuhi (morning), mchana (afternoon), jioni (evening). */
export function swahiliGreeting(date = new Date()) {
  const h = nairobiHour(date);
  return h < 12 ? "Habari za asubuhi" : h < 17 ? "Habari za mchana" : "Habari za jioni";
}
