import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { SupabaseClient } from "@supabase/supabase-js";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import { tableKey } from "./data";
import { unwrap } from "./queries";
import type { Task, TaskStatus } from "./types";

// Task board data. Every change is applied to the cache first so dragging and
// ticking feel instant, then saved; a failed save rolls the board back.

const raw = supabase as unknown as SupabaseClient;
const KEY = tableKey("tasks");

export type TasksResult = { status: "ok"; tasks: Task[] } | { status: "missing" };

export function useTasks() {
  return useQuery({
    queryKey: KEY,
    queryFn: async (): Promise<TasksResult> => {
      const { data, error } = await raw
        .from("tasks")
        .select("*")
        .is("archived_at", null)
        .order("position", { ascending: true });
      // Table not created yet (migration not applied).
      if (error?.code === "PGRST205" || error?.code === "42P01") return { status: "missing" };
      if (error) throw new Error(error.message);
      return { status: "ok", tasks: data as Task[] };
    },
  });
}

/** A position between two neighbours, so a move only rewrites the moved card. */
export function positionBetween(before: number | undefined, after: number | undefined) {
  if (before === undefined && after === undefined) return 1000;
  if (before === undefined) return (after as number) - 1000;
  if (after === undefined) return before + 1000;
  return (before + after) / 2;
}

export function sortByPosition(tasks: Task[]) {
  return [...tasks].sort((a, b) => a.position - b.position || a.created_at.localeCompare(b.created_at));
}

function useOptimistic<V>(
  apply: (tasks: Task[], vars: V) => Task[],
  save: (vars: V) => Promise<unknown>,
) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: save,
    onMutate: async (vars: V) => {
      await qc.cancelQueries({ queryKey: KEY });
      const previous = qc.getQueryData<TasksResult>(KEY);
      if (previous?.status === "ok") qc.setQueryData<TasksResult>(KEY, { status: "ok", tasks: apply(previous.tasks, vars) });
      return { previous };
    },
    onError: (_e, _v, ctx) => {
      if (ctx?.previous) qc.setQueryData(KEY, ctx.previous);
    },
    onSettled: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export type TaskPatch = Partial<Omit<Task, "id" | "created_at" | "updated_at">>;

/** Any change to one task: move, tick a checklist item, rename… */
export function useUpdateTask() {
  return useOptimistic<{ id: string; patch: TaskPatch }>(
    (tasks, { id, patch }) =>
      tasks.map((t) => {
        if (t.id !== id) return t;
        const next = { ...t, ...patch };
        // Mirror the database trigger so Done cards show their date straight away.
        if (patch.status) next.completed_at = patch.status === "done" ? (t.completed_at ?? new Date().toISOString()) : null;
        return next;
      }),
    async ({ id, patch }) => unwrap(await raw.from("tasks").update(patch).eq("id", id)),
  );
}

export type NewTask = Pick<Task, "title"> & Partial<Omit<Task, "id" | "created_at" | "updated_at">>;

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (task: NewTask) =>
      unwrap(await raw.from("tasks").insert(task).select().single()) as Task,
    onSuccess: (created) => {
      const current = qc.getQueryData<TasksResult>(KEY);
      if (current?.status === "ok") qc.setQueryData<TasksResult>(KEY, { status: "ok", tasks: [...current.tasks, created] });
      qc.invalidateQueries({ queryKey: KEY });
    },
  });
}

/** Archive (hide) tasks; used for delete and for clearing the Done column. */
export function useArchiveTasks() {
  return useOptimistic<string[]>(
    (tasks, ids) => tasks.filter((t) => !ids.includes(t.id)),
    async (ids) => unwrap(await raw.from("tasks").update({ archived_at: new Date().toISOString() }).in("id", ids)),
  );
}

/** Brings archived tasks back (the Undo on delete). */
export function useRestoreTasks() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (ids: string[]) => unwrap(await raw.from("tasks").update({ archived_at: null }).in("id", ids)),
    onSettled: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

const today = () => format(new Date(), "yyyy-MM-dd");

export function dueState(task: Pick<Task, "due_date" | "status">): "overdue" | "today" | "soon" | "later" | null {
  if (!task.due_date || task.status === "done") return null;
  const t = today();
  if (task.due_date < t) return "overdue";
  if (task.due_date === t) return "today";
  const inThree = format(new Date(Date.now() + 3 * 864e5), "yyyy-MM-dd");
  return task.due_date <= inThree ? "soon" : "later";
}

export const STATUS_HINT: Record<TaskStatus, string> = {
  todo: "Not started",
  in_progress: "Being worked on",
  review: "Waiting for a check or approval",
  done: "Finished",
};

export const newChecklistId = () => Math.random().toString(36).slice(2, 10);
