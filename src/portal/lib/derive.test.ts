import { describe, expect, it } from "vitest";
import { demoSnapshot } from "./demo";
import { headlineStory, openActions, periodRows, reportsInRange, roadmapProgress, storiesFor, withData } from "./derive";

describe("storiesFor", () => {
  const stories = storiesFor(demoSnapshot, "all");
  const byName = (name: string) => stories.find((s) => s.kpi.name === name)!;

  it("reads first, latest and change from the shared reports", () => {
    const revenue = byName("Revenue");
    expect(revenue.first).toBe(620000);
    expect(revenue.latest).toBe(1460000);
    expect(revenue.change).toBe(135);
    expect(revenue.improved).toBe(true);
  });

  it("treats a falling cost as an improvement", () => {
    const cpp = byName("Cost per purchase");
    expect(cpp.change).toBeLessThan(0);
    expect(cpp.improved).toBe(true);
  });

  it("never marks spend or budget as good or bad", () => {
    const spend = byName("Ad spend");
    expect(spend.change).toBe(18);
    expect(spend.improved).toBeNull();
  });
});

describe("ranges and headline", () => {
  it("limits the reports to the chosen range", () => {
    const now = new Date(2026, 9, 27);
    expect(reportsInRange(demoSnapshot, "3m", now)).toHaveLength(3);
    expect(reportsInRange(demoSnapshot, "all", now)).toHaveLength(demoSnapshot.reports.length);
  });

  it("leads with revenue when the client has it", () => {
    expect(headlineStory(storiesFor(demoSnapshot))?.kpi.name).toBe("Revenue");
  });

  it("skips KPIs without numbers", () => {
    const empty = { ...demoSnapshot, report_metrics: [], reports: [] };
    expect(withData(storiesFor(empty))).toEqual([]);
    expect(headlineStory(storiesFor(empty))).toBeNull();
  });

  it("builds one row per report, newest first, with a value per KPI", () => {
    const rows = periodRows(demoSnapshot);
    expect(rows).toHaveLength(demoSnapshot.reports.length);
    expect(rows[0]!.period_end > rows[1]!.period_end).toBe(true);
    expect(Object.keys(rows[0]!.values)).toHaveLength(demoSnapshot.kpis.length);
  });
});

describe("roadmap and actions", () => {
  it("counts finished milestones", () => {
    expect(roadmapProgress(demoSnapshot.milestones)).toEqual({ done: 4, total: 7, pct: 57 });
    expect(roadmapProgress([])).toEqual({ done: 0, total: 0, pct: 0 });
  });

  it("lists only unresolved action items", () => {
    expect(openActions(demoSnapshot.updates)).toHaveLength(1);
    const resolved = demoSnapshot.updates.map((u) => ({ ...u, resolved_at: "2026-10-26T00:00:00Z" }));
    expect(openActions(resolved)).toHaveLength(0);
  });
});
