import type { Task } from "./types";

export type TaskFocus = "all" | "in_progress" | "today" | "overdue" | "done";

export function matchesTaskFocus(task: Task, focus: TaskFocus, today: string) {
  if (focus === "all") return true;
  if (focus === "in_progress" || focus === "done") return task.status === focus;
  if (task.status === "done" || !task.due_date) return false;
  return focus === "today" ? task.due_date === today : task.due_date < today;
}

/** Keep unfinished, dated work first; preserve board order for matching dates. */
export function sortTaskList(tasks: Task[]) {
  return [...tasks].sort((a, b) =>
    Number(a.status === "done") - Number(b.status === "done") ||
    (a.due_date ?? "9999").localeCompare(b.due_date ?? "9999") ||
    a.position - b.position || a.created_at.localeCompare(b.created_at),
  );
}
