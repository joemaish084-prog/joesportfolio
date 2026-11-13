import type { Client } from "./types";

export type TimeEntry = {
  id: string;
  client_id: string;
  minutes: number;
  note: string;
  entry_date: string;
  created_at: string;
};
export type TimeSettings = { id: boolean; owner_user_id: string; weekly_agency_hours: number };
export type TimeClient = { client_id: string; archived: boolean };
export type TimePeriod = "week" | "month";
export type RunningTimer = {
  id: string;
  clientId: string;
  note: string;
  startedAt: number;
  stoppedAt?: number;
};

/** Agency dates always use Nairobi, including when the browser is abroad. */
export function agencyDate(now = new Date()): string {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Africa/Nairobi", year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(now);
  const get = (type: string) => parts.find((part) => part.type === type)!.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function timeRange(period: TimePeriod, today = agencyDate()) {
  const date = new Date(`${today}T00:00:00Z`);
  const start = new Date(date);
  if (period === "month") start.setUTCDate(1);
  else start.setUTCDate(start.getUTCDate() - (start.getUTCDay() + 6) % 7);
  const startDate = start.toISOString().slice(0, 10);
  const days = Math.round((date.getTime() - start.getTime()) / 86_400_000) + 1;
  // Sum day-by-day so a week crossing month/year boundaries uses each month's length.
  let feeFraction = 0;
  for (let offset = 0; offset < days; offset++) {
    const day = new Date(start.getTime() + offset * 86_400_000);
    const daysInMonth = new Date(Date.UTC(day.getUTCFullYear(), day.getUTCMonth() + 1, 0)).getUTCDate();
    feeFraction += 1 / daysInMonth;
  }
  return { start: startDate, end: today, days, feeFraction };
}

export function eligibleTimeClient(client: Client, today = agencyDate()) {
  return !client.archived_at && client.status === "active" && client.engagement_type !== "project"
    && client.currency === "KES" && (!client.start_date || client.start_date <= today)
    && (client.engagement_type !== "contract" || !client.end_date || client.end_date >= today);
}

export type TimeStatus = "No time yet" | "No fee set" | "Over time" | "Under" | "On track" | "Outside comparison";

// Trials can be timed (to see what a trial costs you) but have no fee to compare against.
const monthlyKes = (client: Client) =>
  client.currency === "KES" && client.engagement_type !== "project" && client.engagement_type !== "trial";

export function timeSummary(
  clients: Client[], entries: TimeEntry[], preferences: TimeClient[], weeklyHours: number,
  period: TimePeriod, today = agencyDate(),
) {
  const range = timeRange(period, today);
  const minutes = new Map<string, number>();
  for (const entry of entries) {
    if (entry.entry_date >= range.start && entry.entry_date <= range.end) {
      minutes.set(entry.client_id, (minutes.get(entry.client_id) ?? 0) + entry.minutes);
    }
  }
  const archived = new Set(preferences.filter((p) => p.archived).map((p) => p.client_id));
  // Keep clients with recorded time visible for this period after archiving.
  const included = clients.filter((c) => (eligibleTimeClient(c, today) && !archived.has(c.id)) || minutes.has(c.id));
  const totalFees = included.reduce((sum, c) => sum + (monthlyKes(c) ? Number(c.monthly_fee ?? 0) : 0), 0);
  const totalMinutes = included.reduce((sum, c) => sum + (monthlyKes(c) ? minutes.get(c.id) ?? 0 : 0), 0);
  const rows = included.map((client) => {
    const comparable = monthlyKes(client);
    const fee = comparable ? Number(client.monthly_fee ?? 0) : 0;
    const hours = (minutes.get(client.id) ?? 0) / 60;
    const feeShare = totalFees > 0 ? fee / totalFees : 0;
    const timeShare = comparable && totalMinutes > 0 ? hours * 60 / totalMinutes : 0;
    const fair = weeklyHours * range.days / 7 * feeShare;
    const rate = hours > 0 && fee > 0 ? fee * range.feeFraction / hours : null;
    const status: TimeStatus = !comparable ? "Outside comparison" : !hours ? "No time yet" : !fee ? "No fee set"
      : hours > fair * 1.25 ? "Over time" : hours < fair * 0.6 ? "Under" : "On track";
    return { client, comparable, hours, fair, rate, feeShare, timeShare, gap: timeShare - feeShare, status };
  }).sort((a, b) => b.gap - a.gap || a.client.name.localeCompare(b.client.name));
  const scale = Math.max(1, ...rows.flatMap((row) => [row.hours, row.fair]));
  const worst = totalFees > 0 && totalMinutes > 0 && rows[0]?.gap > 0.1 + 1e-9 ? rows[0] : null;
  return { range, rows, scale, totalFees, totalMinutes, worst };
}

export function timerMinutes(timer: RunningTimer) {
  return Math.max(1, Math.round(((timer.stoppedAt ?? Date.now()) - timer.startedAt) / 60_000));
}

export type ClientTimeRow = ReturnType<typeof timeSummary>["rows"][number];

export function parseTimer(raw: string | null): RunningTimer | null {
  if (!raw) return null;
  const timer = JSON.parse(raw) as RunningTimer;
  const uuid = /^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/i;
  if (!timer || !uuid.test(timer.id) || !uuid.test(timer.clientId) || typeof timer.note !== "string"
    || timer.note.length > 2000 || !Number.isFinite(timer.startedAt) || timer.startedAt <= 0
    || timer.startedAt > Date.now() || (timer.stoppedAt !== undefined
      && (!Number.isFinite(timer.stoppedAt) || timer.stoppedAt < timer.startedAt))) {
    throw new Error("The saved timer could not be read. Your browser copy has been kept.");
  }
  return timer;
}
