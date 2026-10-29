import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { format, startOfWeek } from "date-fns";
import { AlertTriangle, CalendarClock, CheckCircle2, Flame, Plus, Search, SquareKanban, Timer } from "lucide-react";
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
import { TaskSheet } from "../components/tasks/TaskSheet";
import { EmptyState, PageHeader, SkeletonBlock } from "../components/ui";
import { useClients } from "../lib/queries";
import { dueState, sortByPosition, useTasks } from "../lib/tasks";
import { TASK_STATUSES, TASK_STATUS_LABEL, type Task, type TaskStatus } from "../lib/types";

const ALL = "__all";
const NONE = "__none";

export default function TasksPage() {
  const tasksQuery = useTasks();
  const clients = useClients();
  const [params, setParams] = useSearchParams();
  const [query, setQuery] = useState("");
  const [clientFilter, setClientFilter] = useState<string>(ALL);
  const [hotOnly, setHotOnly] = useState(false);
  const [sheet, setSheet] = useState<{ open: boolean; task: Task | null; status: TaskStatus }>({
    open: false,
    task: null,
    status: "todo",
  });

  const all = useMemo(() => (tasksQuery.data?.status === "ok" ? tasksQuery.data.tasks : []), [tasksQuery.data]);
  const missing = tasksQuery.data?.status === "missing";

  // /hub/tasks?new=task opens the new-task panel (Overview and the command palette link here).
  useEffect(() => {
    if (params.get("new") === "task") {
      setSheet({ open: true, task: null, status: "todo" });
      setParams({}, { replace: true });
    }
  }, [params, setParams]);

  const nameOf = useMemo(() => new Map((clients.data ?? []).map((c) => [c.id, c.name])), [clients.data]);
  const clientName = (id: string | null) => (id ? nameOf.get(id) : undefined);

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    return all.filter((t) => {
      if (clientFilter === NONE && t.client_id) return false;
      if (clientFilter !== ALL && clientFilter !== NONE && t.client_id !== clientFilter) return false;
      if (hotOnly && t.priority !== "urgent" && t.priority !== "high") return false;
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        (t.notes ?? "").toLowerCase().includes(q) ||
        t.labels.some((l) => l.toLowerCase().includes(q)) ||
        (clientName(t.client_id) ?? "").toLowerCase().includes(q)
      );
    });
    // clientName reads nameOf
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [all, query, clientFilter, hotOnly, nameOf]);

  const stats = useMemo(() => {
    const weekStart = startOfWeek(new Date(), { weekStartsOn: 1 }).toISOString();
    const open = all.filter((t) => t.status !== "done");
    return {
      total: all.length,
      done: all.length - open.length,
      open: open.length,
      inProgress: all.filter((t) => t.status === "in_progress").length,
      dueToday: open.filter((t) => dueState(t) === "today").length,
      overdue: open.filter((t) => dueState(t) === "overdue").length,
      urgent: open.filter((t) => t.priority === "urgent").length,
      doneThisWeek: all.filter((t) => t.completed_at && t.completed_at >= weekStart).length,
      byStatus: TASK_STATUSES.map((s) => ({ status: s, count: all.filter((t) => t.status === s).length })),
    };
  }, [all]);

  const allLabels = useMemo(() => [...new Set(all.flatMap((t) => t.labels))].sort(), [all]);
  const lastPosition = (status: TaskStatus) => sortByPosition(all.filter((t) => t.status === status)).at(-1)?.position;
  const clientOptions = useMemo(
    () => (clients.data ?? []).filter((c) => !c.archived_at).sort((a, b) => a.name.localeCompare(b.name)),
    [clients.data],
  );
  const filtering = query || clientFilter !== ALL || hotOnly;

  return (
    <>
      <BlurFade>
        <PageHeader
          title="Tasks"
          subtitle={
            stats.total
              ? `${stats.open} open · ${format(new Date(), "EEEE d MMMM")}`
              : "Everything you need to do, from to-do to done."
          }
          actions={
            <Button className="h-10 rounded-full px-4" onClick={() => setSheet({ open: true, task: null, status: "todo" })} disabled={missing}>
              <Plus className="mr-1.5 h-4 w-4" /> New task
            </Button>
          }
        />
      </BlurFade>

      {missing ? (
        <div className="hub-card">
          <EmptyState
            icon={SquareKanban}
            title="The task board isn't set up yet"
            description="One database update adds it. Ask Claude to apply the hub_tasks migration."
          />
        </div>
      ) : !tasksQuery.data ? (
        <div className="grid gap-3 lg:grid-cols-4">
          {[0, 1, 2, 3].map((i) => (
            <SkeletonBlock key={i} className="h-80 rounded-[22px]" />
          ))}
        </div>
      ) : (
        <>
          {/* ---- summary */}
          <BlurFade delay={0.04}>
            <section className="hub-card relative mb-5 overflow-hidden p-5 md:p-6">
              <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
              <div className="relative flex flex-col gap-5 lg:flex-row lg:items-center">
                <div className="flex items-center gap-4">
                  <Ring value={stats.done} total={stats.total || 1} size={68} stroke={6} label={stats.total ? undefined : "0%"} />
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">Board complete</p>
                    <p className="hub-tabular text-2xl font-bold tracking-tight">
                      <NumberTicker value={stats.doneThisWeek} />{" "}
                      <span className="text-base font-medium text-muted-foreground">done this week</span>
                    </p>
                  </div>
                </div>

                <dl className="grid flex-1 grid-cols-2 gap-2 sm:grid-cols-4 lg:ml-4">
                  {[
                    { label: "Open", value: stats.open, icon: CheckCircle2, warn: false },
                    { label: "In progress", value: stats.inProgress, icon: Timer, warn: false },
                    { label: "Due today", value: stats.dueToday, icon: CalendarClock, warn: false },
                    { label: "Overdue", value: stats.overdue, icon: AlertTriangle, warn: stats.overdue > 0 },
                  ].map((s) => (
                    <div
                      key={s.label}
                      className={cn("rounded-2xl p-3", s.warn ? "bg-warning-soft" : "bg-secondary/60")}
                    >
                      <dt className={cn("flex items-center gap-1.5 text-xs", s.warn ? "text-warning" : "text-muted-foreground")}>
                        <s.icon className="h-3.5 w-3.5" /> {s.label}
                      </dt>
                      <dd className={cn("hub-tabular mt-0.5 text-xl font-bold", s.warn && "text-warning")}>{s.value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              {stats.total > 0 && (
                <div className="relative mt-5">
                  <div className="flex h-2 gap-[2px] overflow-hidden rounded-full" role="img" aria-label="Tasks per column">
                    {stats.byStatus
                      .filter((s) => s.count)
                      .map((s) => (
                        <div
                          key={s.status}
                          className="h-full first:rounded-l-full last:rounded-r-full"
                          style={{ width: `${(s.count / stats.total) * 100}%`, background: STATUS_COLOR[s.status] }}
                          title={`${TASK_STATUS_LABEL[s.status]}: ${s.count}`}
                        />
                      ))}
                  </div>
                  <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                    {stats.byStatus.map((s) => (
                      <span key={s.status} className="flex items-center gap-1.5">
                        <span className="h-2 w-2 rounded-full" style={{ background: STATUS_COLOR[s.status] }} />
                        {TASK_STATUS_LABEL[s.status]} <span className="hub-tabular font-medium text-foreground">{s.count}</span>
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </section>
          </BlurFade>

          {/* ---- filters */}
          <BlurFade delay={0.08} className="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center">
            <div className="relative sm:w-72">
              <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search tasks, labels, clients"
                aria-label="Search tasks"
                className="h-10 rounded-xl border-transparent bg-card pl-10 shadow-hub focus-visible:bg-card"
              />
            </div>
            <Select value={clientFilter} onValueChange={setClientFilter}>
              <SelectTrigger className="h-10 rounded-xl border-transparent bg-card shadow-hub sm:w-52" aria-label="Filter by client">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value={ALL}>All clients</SelectItem>
                <SelectItem value={NONE}>No client (my own work)</SelectItem>
                {clientOptions.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <button
              type="button"
              aria-pressed={hotOnly}
              onClick={() => setHotOnly((v) => !v)}
              className={cn(
                "flex h-10 items-center gap-1.5 rounded-xl px-3.5 text-sm font-medium shadow-hub transition-colors duration-150",
                hotOnly ? "bg-foreground text-background" : "bg-card text-muted-foreground hover:text-foreground",
              )}
            >
              <Flame className="h-4 w-4" /> Urgent & high
              {stats.urgent > 0 && !hotOnly && (
                <span className="hub-tabular rounded-full bg-warning-soft px-1.5 text-xs text-warning">{stats.urgent}</span>
              )}
            </button>
            {filtering && (
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setClientFilter(ALL);
                  setHotOnly(false);
                }}
                className="h-10 px-2 text-sm text-primary hover:underline sm:ml-1"
              >
                Clear filters
              </button>
            )}
            <p className="hidden text-xs text-muted-foreground lg:ml-auto lg:block">
              Drag cards between columns · click to open
            </p>
          </BlurFade>

          <BlurFade delay={0.1}>
            <WeekStrip tasks={shown} onOpenTask={(task) => setSheet({ open: true, task, status: task.status })} />
          </BlurFade>

          <BlurFade delay={0.12}>
            <TaskBoard
              tasks={shown}
              clientName={clientName}
              onOpen={(task) => setSheet({ open: true, task, status: task.status })}
              defaultClientId={clientFilter !== ALL && clientFilter !== NONE ? clientFilter : null}
            />
          </BlurFade>
        </>
      )}

      <TaskSheet
        open={sheet.open}
        onOpenChange={(open) => setSheet((s) => ({ ...s, open }))}
        task={sheet.task}
        newStatus={sheet.status}
        newClientId={clientFilter !== ALL && clientFilter !== NONE ? clientFilter : null}
        allLabels={allLabels}
        lastPosition={lastPosition}
      />
    </>
  );
}
