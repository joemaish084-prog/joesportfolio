import { describe, expect, it } from "vitest";
import { agencyDate, eligibleTimeClient, parseTimer, timeRange, timeSummary, timerMinutes, type TimeEntry } from "./time";
import type { Client } from "./types";

const client = (id: string, fee: number | null, extra: Partial<Client> = {}) => ({
  id, name: id, monthly_fee: fee, currency: "KES", status: "active", engagement_type: "retainer",
  archived_at: null, start_date: null, end_date: null, ...extra,
}) as Client;
const entry = (clientId: string, minutes: number, date = "2026-11-04") => ({
  client_id: clientId, minutes, entry_date: date,
}) as TimeEntry;
const timer = { id: "00000000-0000-4000-8000-000000000001", clientId: "00000000-0000-4000-8000-000000000002", note: "Work", startedAt: 1_000_000, stoppedAt: 1_090_000 };

describe("agency time calculations", () => {
  it("uses Nairobi dates, Monday weeks, and inclusive elapsed days", () => {
    expect(agencyDate(new Date("2026-11-03T21:30:00Z"))).toBe("2026-11-04");
    expect(timeRange("week", "2026-11-04")).toMatchObject({ start: "2026-11-02", end: "2026-11-04", days: 3 });
    expect(timeRange("week", "2026-11-08").days).toBe(7);
    expect(timeRange("month", "2026-11-04").days).toBe(4);
    expect(timeRange("month", "2028-02-29").feeFraction).toBeCloseTo(1);
  });
  it("prorates cross-month and cross-year weeks by actual calendar days", () => {
    expect(timeRange("week", "2026-11-01").feeFraction).toBeCloseTo(6 / 31 + 1 / 30);
    expect(timeRange("week", "2027-01-01")).toMatchObject({ start: "2026-12-28", days: 5 });
  });
  it("compares a single set of hours, fees, budgets and rates for the selected period", () => {
    const result = timeSummary([client("A", 30000), client("B", 10000)],
      [entry("A", 60), entry("B", 180), entry("B", 999, "2026-11-01"), entry("B", 999, "2026-11-05")], [], 14, "week", "2026-11-04");
    expect(result.totalMinutes).toBe(240);
    expect(result.worst?.client.id).toBe("B");
    expect(result.worst).toMatchObject({ hours: 3, fair: 1.5, feeShare: 0.25, timeShare: 0.75, status: "Over time" });
    expect(result.worst?.rate).toBeCloseTo(10000 / 30);
    expect(result.scale).toBe(4.5);
  });
  it("uses strict 125%, 60% and ten-point thresholds", () => {
    const rows = (minutes: number) => timeSummary([client("A", 1000)], [entry("A", minutes, "2026-11-02")], [], 7, "week", "2026-11-02").rows[0];
    expect(rows(75).status).toBe("On track");
    expect(rows(76).status).toBe("Over time");
    expect(rows(36).status).toBe("On track");
    expect(rows(35).status).toBe("Under");
    const exact = timeSummary([client("A", 1000), client("B", 1000)], [entry("A", 60), entry("B", 40)], [], 15, "week", "2026-11-04");
    expect(exact.worst).toBeNull();
  });
  it("handles no logs and missing/zero fees without dividing by zero", () => {
    const empty = timeSummary([client("A", null)], [], [], 15, "month", "2026-11-04");
    expect(empty.rows[0]).toMatchObject({ fair: 0, rate: null, status: "No time yet" });
    expect(empty.worst).toBeNull();
    const zero = timeSummary([client("A", 0)], [entry("A", 60)], [], 15, "month", "2026-11-04");
    expect(zero.rows[0]).toMatchObject({ fair: 0, rate: null, status: "No fee set" });
    expect(zero.worst).toBeNull();
  });
  it("excludes projects, foreign currencies, future/expired contracts, and inactive clients", () => {
    for (const extra of [
      { engagement_type: "project" }, { currency: "USD" }, { status: "paused" }, { archived_at: "2026-11-01" },
      { start_date: "2026-11-05" }, { engagement_type: "contract", end_date: "2026-11-03" },
    ] as Partial<Client>[]) expect(eligibleTimeClient(client("A", 1000, extra), "2026-11-04")).toBe(false);
    expect(eligibleTimeClient(client("A", 1000, { engagement_type: "contract", end_date: "2026-11-04" }), "2026-11-04")).toBe(true);
  });
  it("preserves logged client history after personal archiving", () => {
    const clients = [client("A", 1000), client("B", 2000)];
    const preferences = [{ client_id: "B", archived: true }];
    expect(timeSummary(clients, [], preferences, 15, "week", "2026-11-04").rows.map((r) => r.client.id)).toEqual(["A"]);
    const history = timeSummary(clients, [entry("B", 60)], preferences, 15, "week", "2026-11-04");
    expect(history.totalMinutes).toBe(60);
    expect(history.totalFees).toBe(3000);
    expect(history.rows).toHaveLength(2);
  });
  it("keeps history outside the monthly model without skewing its fee/hour shares", () => {
    const result = timeSummary([client("A", 1000), client("B", 1000, { currency: "USD" })],
      [entry("A", 60), entry("B", 120)], [], 15, "week", "2026-11-04");
    expect(result.totalMinutes).toBe(60);
    expect(result.rows.find((r) => r.client.id === "B")).toMatchObject({ status: "Outside comparison", rate: null, timeShare: 0 });
    expect(result.worst).toBeNull();
  });
});

describe("persistent timer", () => {
  it("recovers the UUID and frozen stop time for retrying the same save", () => {
    const recovered = parseTimer(JSON.stringify(timer));
    expect(recovered).toEqual(timer);
    expect(timerMinutes(recovered!)).toBe(2);
    expect(timerMinutes({ ...timer, stoppedAt: timer.startedAt + 500 })).toBe(1);
    expect(parseTimer(null)).toBeNull();
  });
  it("rejects invalid browser data instead of silently losing it", () => {
    for (const value of ["broken", "null", "{}", JSON.stringify({ ...timer, startedAt: Date.now() + 100000 }),
      JSON.stringify({ ...timer, stoppedAt: 5 }), JSON.stringify({ ...timer, clientId: "unknown" })]) {
      expect(() => parseTimer(value)).toThrow();
    }
  });
});
