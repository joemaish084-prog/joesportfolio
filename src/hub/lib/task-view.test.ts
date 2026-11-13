import { describe, expect, it } from "vitest";
import { matchesTaskFocus, sortTaskList } from "./task-view";
import type { Task } from "./types";

const task = (id: string, extra: Partial<Task> = {}) => ({
  id, status: "todo", due_date: null, position: 1000, created_at: "2026-11-01", ...extra,
}) as Task;

describe("task focus views", () => {
  it("excludes completed and undated tasks from due and overdue views", () => {
    const today = "2026-11-13";
    expect(matchesTaskFocus(task("due", { due_date: today }), "today", today)).toBe(true);
    expect(matchesTaskFocus(task("late", { due_date: "2026-11-12" }), "overdue", today)).toBe(true);
    expect(matchesTaskFocus(task("future", { due_date: "2026-11-14" }), "overdue", today)).toBe(false);
    for (const focus of ["today", "overdue"] as const) {
      expect(matchesTaskFocus(task("undated"), focus, today)).toBe(false);
      expect(matchesTaskFocus(task("done", { status: "done", due_date: "2026-11-12" }), focus, today)).toBe(false);
    }
  });

  it("keeps status views independent of due dates", () => {
    expect(matchesTaskFocus(task("active", { status: "in_progress" }), "in_progress", "2026-11-13")).toBe(true);
    expect(matchesTaskFocus(task("todo"), "in_progress", "2026-11-13")).toBe(false);
    expect(matchesTaskFocus(task("done", { status: "done" }), "done", "2026-11-13")).toBe(true);
    expect(matchesTaskFocus(task("done", { status: "done" }), "all", "2026-11-13")).toBe(true);
  });

  it("sorts open tasks by due date, then board order, without mutating the board", () => {
    const tasks = [
      task("done", { status: "done", due_date: "2026-11-01" }),
      task("undated"),
      task("second", { due_date: "2026-11-13", position: 2000 }),
      task("first", { due_date: "2026-11-13" }),
      task("late", { due_date: "2026-11-12" }),
    ];
    expect(sortTaskList(tasks).map((t) => t.id)).toEqual(["late", "first", "second", "undated", "done"]);
    expect(tasks[0].id).toBe("done");
  });
});
