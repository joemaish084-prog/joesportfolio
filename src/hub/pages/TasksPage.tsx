import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { format, startOfWeek } from "date-fns";
import {
  ArrowDownWideNarrow, ArrowUpRight, CalendarDays, CalendarClock, CheckCheck,
  CircleAlert, Flame, LayoutList, Plus, Search, SlidersHorizontal, SquareKanban, Timer, X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { WeekStrip } from "../components/calendar/WeekStrip";
import { BlurFade } from "../components/motion/blur-fade";
import { NumberTicker } from "../components/motion/number-ticker";
import { Ring } from "../components/overview/visuals";
import { STATUS_COLOR } from "../components/tasks/TaskCard";
import { TaskBoard } from "../components/tasks/TaskBoard";
import { TaskList } from "../components/tasks/TaskList";
import { TaskSheet } from "../components/tasks/TaskSheet";
import { EmptyState, SkeletonBlock } from "../components/ui";
import { useClients } from "../lib/queries";
import { matchesTaskFocus, type TaskFocus } from "../lib/task-view";
import { sortByPosition, useTasks } from "../lib/tasks";
import { TASK_STATUSES, TASK_STATUS_LABEL, type Task, type TaskStatus } from "../lib/types";

const ALL = "__all";
const NONE = "__none";

export default function TasksPage() {
  const tasksQuery = useTasks();
  const clients = useClients();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [clientFilter, setClientFilter] = useState(ALL);
  const [hotOnly, setHotOnly] = useState(false);
  const [focus, setFocus] = useState<TaskFocus>("all");
  const [view, setView] = useState<"board" | "list">("board");
  const [sheet, setSheet] = useState<{ open: boolean; task: Task | null; status: TaskStatus }>({
    open: false, task: null, status: "todo",
  });

  const all = useMemo(() => (tasksQuery.data?.status === "ok" ? tasksQuery.data.tasks : []), [tasksQuery.data]);
  const missing = tasksQuery.data?.status === "missing";
  const today = format(new Date(), "yyyy-MM-dd");

  useEffect(() => {
    if (params.get("new") === "task") {
      setSheet({ open: true, task: null, status: "todo" });
      setParams((current) => {
        const next = new URLSearchParams(current);
        next.delete("new");
        return next;
      }, { replace: true });
    }
  }, [params, setParams]);

  const nameOf = useMemo(() => new Map((clients.data ?? []).map((c) => [c.id, c.name])), [clients.data]);
  const clientName = (id: string | null) => (id ? nameOf.get(id) : undefined);
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((t) => {
      if (!matchesTaskFocus(t, focus, today)) return false;
      if (clientFilter === NONE && t.client_id) return false;
      if (clientFilter !== ALL && clientFilter !== NONE && t.client_id !== clientFilter) return false;
      if (hotOnly && t.priority !== "urgent" && t.priority !== "high") return false;
      return !q || [t.title, t.notes ?? "", ...t.labels, nameOf.get(t.client_id ?? "") ?? ""]
        .some((value) => value.toLowerCase().includes(q));
    });
  }, [all, query, clientFilter, hotOnly, focus, today, nameOf]);

  const stats = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString();
    const open = all.filter((t) => t.status !== "done");
    return {
      total: all.length,
      done: all.length - open.length,
      open: open.length,
      inProgress: all.filter((t) => t.status === "in_progress").length,
      dueToday: open.filter((t) => matchesTaskFocus(t, "today", today)).length,
      overdue: open.filter((t) => matchesTaskFocus(t, "overdue", today)).length,
      doneThisWeek: all.filter((t) => t.status === "done" && t.completed_at && t.completed_at >= weekStart).length,
      byStatus: TASK_STATUSES.map((status) => ({ status, count: all.filter((t) => t.status === status).length })),
    };
  }, [all, today]);

  const allLabels = useMemo(() => [...new Set(all.flatMap((t) => t.labels))].sort(), [all]);
  const lastPosition = (status: TaskStatus) => sortByPosition(all.filter((t) => t.status === status)).at(-1)?.position;
  const clientOptions = useMemo(
    () => (clients.data ?? []).filter((c) => !c.archived_at).sort((a, b) => a.name.localeCompare(b.name)), [clients.data],
  );
  const filtering = Boolean(query.trim() || clientFilter !== ALL || hotOnly || focus !== "all");
  const resetFilters = () => { setQuery(""); setClientFilter(ALL); setHotOnly(false); setFocus("all"); };
  const openTask = (task: Task) => setSheet({ open: true, task, status: task.status });
  const newTask = () => setSheet({ open: true, task: null, status: "todo" });
  const focusOptions: { value: TaskFocus; label: string; count: number }[] = [
    { value: "all", label: "All tasks", count: stats.total },
    { value: "in_progress", label: "In progress", count: stats.inProgress },
    { value: "today", label: "Due today", count: stats.dueToday },
    { value: "overdue", label: "Overdue", count: stats.overdue },
    { value: "done", label: "Completed", count: stats.done },
  ];

  return (
    <div className="hub-tasks min-w-0">
      <BlurFade>
        <header className="mb-7 flex flex-wrap items-end justify-between gap-5">
          <div>
            <p className="mb-2 flex items-center gap-2 text-[0.6875rem] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" /> Workspace
            </p>
            <h1 className="text-4xl font-semibold tracking-[-0.045em] md:text-[2.75rem]">Tasks<span className="text-primary">.</span></h1>
            <p className="mt-2 text-sm text-muted-foreground">Plan the work. Keep it moving.</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden items-center gap-2 text-xs text-muted-foreground sm:flex">
              <CalendarDays className="h-4 w-4" /> {format(new Date(), "EEE, d MMM")}
            </span>
            <Button className="h-11 gap-2 rounded-xl px-5 text-sm shadow-hub" onClick={newTask} disabled={missing || tasksQuery.isError}>
              <Plus className="h-4 w-4" /> New task
            </Button>
          </div>
        </header>
      </BlurFade>

      {tasksQuery.isError ? (
        <div className="hub-card p-6" role="alert">
          <EmptyState icon={CircleAlert} title="Tasks couldn't be loaded" description="Check your connection and try again." />
          <Button variant="outline" className="mx-auto flex rounded-xl" onClick={() => void tasksQuery.refetch()} disabled={tasksQuery.isFetching}>
            {tasksQuery.isFetching ? "Trying again…" : "Try again"}
          </Button>
        </div>
      ) : missing ? (
        <div className="hub-card">
          <EmptyState icon={SquareKanban} title="Your task workspace is almost ready" description="Tasks will appear here once setup is complete." />
        </div>
      ) : !tasksQuery.data ? (
        <div className="space-y-6" role="status" aria-label="Loading tasks">
          <SkeletonBlock className="h-36 rounded-2xl" />
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[0, 1, 2, 3].map((i) => <SkeletonBlock key={i} className="h-80 rounded-2xl" />)}
          </div>
        </div>
      ) : (
        <>
          <BlurFade delay={0.04}>
            <section aria-label="Task overview" className="hub-card mb-7 grid overflow-hidden md:grid-cols-[1.35fr_2fr]">
              <div className="relative flex items-center gap-5 border-b border-border/60 p-5 md:border-b-0 md:border-r md:p-6">
                <Ring value={stats.done} total={stats.total} size={72} stroke={5} />
                <div className="min-w-0 flex-1">
                  <h2 className="text-xs font-medium text-muted-foreground">Board progress</h2>
                  <p className="mt-1 text-lg font-semibold tracking-tight">
                    <span className="hub-tabular">{stats.done}</span><span className="font-normal text-muted-foreground"> / {stats.total}</span> complete
                  </p>
                  <p className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <CheckCheck className="h-3.5 w-3.5 text-primary" /> {stats.doneThisWeek} finished this week
                  </p>
                  <div className="mt-3 flex h-1.5 gap-1 overflow-hidden rounded-full" role="img" aria-label={stats.byStatus.map((s) => `${TASK_STATUS_LABEL[s.status]}: ${s.count}`).join(", ")}>
                    {stats.total ? stats.byStatus.filter((s) => s.count).map((s) => (
                      <span key={s.status} className="rounded-full" style={{ flex: s.count, background: STATUS_COLOR[s.status] }} />
                    )) : <span className="w-full bg-secondary" />}
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 divide-x divide-border/60">
                {[
                  { label: "In progress", value: stats.inProgress, icon: Timer, focus: "in_progress" as const, note: "Work in motion", warn: false },
                  { label: "Due today", value: stats.dueToday, icon: CalendarClock, focus: "today" as const, note: "Today's priorities", warn: false },
                  { label: "Overdue", value: stats.overdue, icon: CircleAlert, focus: "overdue" as const, note: stats.overdue ? "Needs attention" : "All caught up", warn: stats.overdue > 0 },
                ].map((s) => (
                  <button key={s.label} type="button" onClick={() => setFocus((v) => v === s.focus ? "all" : s.focus)} aria-pressed={focus === s.focus}
                    className={cn("group flex flex-col items-start p-3 text-left transition-colors hover:bg-secondary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:p-5 md:p-6", focus === s.focus && "bg-secondary/50")}>
                    <span className={cn("mb-3 flex w-full items-center justify-between text-muted-foreground", s.warn && "text-warning")}>
                      <s.icon className="h-[18px] w-[18px]" strokeWidth={1.7} />
                      <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
                    </span>
                    <span className={cn("hub-tabular text-3xl font-semibold tracking-tight", s.warn && "text-warning")}><NumberTicker value={s.value} /></span>
                    <span className="mt-1 text-xs font-medium sm:text-sm">{s.label}</span>
                    <span className={cn("mt-1 hidden text-[0.6875rem] text-muted-foreground sm:block", s.warn && "text-warning")}>{s.note}</span>
                  </button>
                ))}
              </div>
            </section>
          </BlurFade>

          <BlurFade delay={0.08}>
            <div className="mb-4 flex flex-col gap-3 border-b border-border pb-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex min-w-0 gap-1 overflow-x-auto pb-1 sm:pb-0" role="group" aria-label="Focus tasks">
                {focusOptions.map((option) => (
                  <button key={option.value} type="button" aria-pressed={focus === option.value} onClick={() => setFocus(option.value)}
                    className={cn("flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", focus === option.value ? "bg-foreground text-background" : "text-muted-foreground hover:bg-secondary hover:text-foreground")}>
                    {option.label}<span className={cn("hub-tabular rounded px-1.5 py-0.5 text-[0.625rem]", focus === option.value ? "bg-background/15" : "bg-secondary")}>{option.count}</span>
                  </button>
                ))}
              </div>
              <div className="flex shrink-0 items-center gap-0.5 self-start rounded-xl border border-border/70 bg-card p-1" role="group" aria-label="Task view">
                {([{ value: "board", label: "Board", icon: SquareKanban }, { value: "list", label: "List", icon: LayoutList }] as const).map((option) => (
                  <button key={option.value} type="button" onClick={() => setView(option.value)} aria-pressed={view === option.value}
                    className={cn("flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", view === option.value ? "bg-secondary text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
                    <option.icon className="h-3.5 w-3.5" /> {option.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <div className="relative w-full sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input type="search" value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Find a task…" aria-label="Search tasks"
                  className="h-10 rounded-xl border-border/70 bg-card pl-9 text-sm shadow-none" />
              </div>
              <Select value={clientFilter} onValueChange={setClientFilter}>
                <SelectTrigger className="h-10 w-auto min-w-40 gap-2 rounded-xl border-border/70 bg-card text-xs shadow-none" aria-label="Filter by client">
                  <SlidersHorizontal className="h-3.5 w-3.5 shrink-0 text-muted-foreground" /><SelectValue />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value={ALL}>All clients</SelectItem>
                  <SelectItem value={NONE}>No client (my own work)</SelectItem>
                  {clientOptions.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                </SelectContent>
              </Select>
              <button type="button" aria-pressed={hotOnly} onClick={() => setHotOnly((v) => !v)}
                className={cn("flex h-10 items-center gap-1.5 rounded-xl border px-3 text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring", hotOnly ? "border-primary/25 bg-tint text-on-tint" : "border-border/70 bg-card text-muted-foreground hover:text-foreground")}>
                <Flame className="h-3.5 w-3.5" /> Urgent & high
              </button>
              {filtering && <button type="button" onClick={resetFilters} className="flex h-10 items-center gap-1 rounded-lg px-2 text-xs text-muted-foreground hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><X className="h-3.5 w-3.5" /> Clear filters</button>}
              <p className="ml-auto flex items-center gap-1.5 text-[0.6875rem] text-muted-foreground" aria-live="polite">
                {view === "list" && <ArrowDownWideNarrow className="h-3.5 w-3.5" />}
                {filtering ? `${shown.length} of ${all.length} tasks` : `${stats.open} open tasks`}
                {view === "list" && <span className="hidden sm:inline"> · Due date first</span>}
              </p>
            </div>
          </BlurFade>

          <BlurFade delay={0.12}>
            {all.length === 0 ? (
              <div className="hub-card flex min-h-80 flex-col items-center justify-center border-dashed p-6 text-center">
                <div className="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-tint text-primary"><SquareKanban className="h-7 w-7" strokeWidth={1.5} /></div>
                <h2 className="text-xl font-semibold tracking-tight">Good work starts with a task.</h2>
                <p className="mb-5 mt-2 max-w-sm text-sm leading-relaxed text-muted-foreground">Capture an idea, break it into steps, and move it forward. Your workspace starts here.</p>
                <Button onClick={newTask} className="gap-2 rounded-xl"><Plus className="h-4 w-4" /> Create your first task</Button>
              </div>
            ) : shown.length === 0 ? (
              <div className="hub-card flex min-h-64 flex-col items-center justify-center p-6 text-center">
                <Search className="mb-4 h-7 w-7 text-muted-foreground" strokeWidth={1.5} />
                <h2 className="text-lg font-semibold">No tasks in this view</h2>
                <p className="mb-4 mt-1 text-sm text-muted-foreground">Try another search or adjust your filters.</p>
                <Button variant="outline" onClick={resetFilters} className="rounded-xl">Clear filters</Button>
              </div>
            ) : view === "board" ? (
              <TaskBoard tasks={shown} clientName={clientName} onOpen={openTask} defaultClientId={clientFilter !== ALL && clientFilter !== NONE ? clientFilter : null} />
            ) : <TaskList tasks={shown} clientName={clientName} onOpen={openTask} />}
            {all.length > 0 && shown.length > 0 && view === "board" && (
              <p className="mt-2 text-center text-[0.6875rem] text-muted-foreground"><span className="xl:hidden">Swipe to explore columns. </span>Drag to move · Click to open · Space to pick up, arrows to move</p>
            )}
          </BlurFade>
          <BlurFade delay={0.16} className="mt-7"><WeekStrip tasks={shown} onOpenTask={openTask} /></BlurFade>
        </>
      )}
      <TaskSheet open={sheet.open} onOpenChange={(open) => setSheet((s) => ({ ...s, open }))} task={sheet.task} newStatus={sheet.status}
        newClientId={clientFilter !== ALL && clientFilter !== NONE ? clientFilter : null} allLabels={allLabels} lastPosition={lastPosition} />
    </div>
  );
}
