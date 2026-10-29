import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import {
  addDays,
  addMonths,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
  subMonths,
} from "date-fns";
import { CalendarDays, CheckSquare, ChevronLeft, ChevronRight, Loader2, Plus, RefreshCw, Unplug, Video } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { EventSheet } from "../components/calendar/EventSheet";
import { BlurFade } from "../components/motion/blur-fade";
import { STATUS_COLOR } from "../components/tasks/TaskCard";
import { TaskSheet } from "../components/tasks/TaskSheet";
import { EmptyState, PageHeader, SkeletonBlock } from "../components/ui";
import {
  useConnectGoogle,
  useDisconnectGoogle,
  useGoogleEvents,
  useGoogleStatus,
  type CalendarEvent,
} from "../lib/calendar";
import { useTasks } from "../lib/tasks";
import type { Task } from "../lib/types";

// Month view of Google Calendar, with hub tasks shown on their due dates.
// Events are read and written through the google-calendar Edge Function.

const ymd = (d: Date) => format(d, "yyyy-MM-dd");
const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const GOOGLE_RESULT: Record<string, { ok: boolean; message: string }> = {
  connected: { ok: true, message: "Google Calendar connected" },
  cancelled: { ok: false, message: "Google Calendar wasn't connected" },
  scope: { ok: false, message: "Tick the calendar permission on Google's screen to connect" },
  error: { ok: false, message: "Couldn't connect Google Calendar. Try again." },
};

/** Does this event cover any part of the given day? */
function onDay(e: CalendarEvent, day: Date) {
  if (e.allDay) return e.start <= ymd(day) && ymd(day) < e.end;
  const s = parseISO(e.start).getTime();
  const f = parseISO(e.end).getTime();
  const d0 = startOfDay(day).getTime();
  return s < d0 + 864e5 && f > d0;
}

const timeLabel = (e: CalendarEvent) => (e.allDay ? "All day" : format(parseISO(e.start), "HH:mm"));

const sortEvents = (a: CalendarEvent, b: CalendarEvent) =>
  Number(b.allDay) - Number(a.allDay) || a.start.localeCompare(b.start);

export default function CalendarPage() {
  const [params, setParams] = useSearchParams();
  const [month, setMonth] = useState(() => startOfMonth(new Date()));
  const [selected, setSelected] = useState(() => startOfDay(new Date()));
  const [eventSheet, setEventSheet] = useState<{ open: boolean; event: CalendarEvent | null; day: Date }>({
    open: false,
    event: null,
    day: new Date(),
  });
  const [taskSheet, setTaskSheet] = useState<{ open: boolean; task: Task | null }>({ open: false, task: null });

  const status = useGoogleStatus();
  const connect = useConnectGoogle();
  const disconnect = useDisconnectGoogle();
  const connected = status.data?.connected === true;

  const gridStart = startOfWeek(startOfMonth(month), { weekStartsOn: 1 });
  const gridEnd = addDays(endOfWeek(endOfMonth(month), { weekStartsOn: 1 }), 1);
  const events = useGoogleEvents(gridStart, gridEnd, connected);
  const tasksQuery = useTasks();

  // Google sends the browser back here with ?google=connected|cancelled|scope|error.
  useEffect(() => {
    const result = params.get("google");
    if (!result) return;
    const r = GOOGLE_RESULT[result] ?? GOOGLE_RESULT.error;
    if (r.ok) toast.success(r.message);
    else toast.error(r.message);
    setParams({}, { replace: true });
  }, [params, setParams]);

  const days = useMemo(() => {
    const out: Date[] = [];
    for (let d = gridStart; d < gridEnd; d = addDays(d, 1)) out.push(d);
    return out;
    // gridStart/gridEnd derive from month
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month]);

  const allTasks = useMemo(() => (tasksQuery.data?.status === "ok" ? tasksQuery.data.tasks : []), [tasksQuery.data]);
  const tasksByDay = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of allTasks) {
      if (!t.due_date) continue;
      map.set(t.due_date, [...(map.get(t.due_date) ?? []), t]);
    }
    return map;
  }, [allTasks]);
  const allLabels = useMemo(() => [...new Set(allTasks.flatMap((t) => t.labels))].sort(), [allTasks]);

  const eventList = useMemo(() => [...(events.data ?? [])].sort(sortEvents), [events.data]);
  const eventsOn = (day: Date) => eventList.filter((e) => onDay(e, day));
  const tasksOn = (day: Date) => tasksByDay.get(ymd(day)) ?? [];

  const openNew = (day: Date) => {
    if (!connected) return toast.error("Connect Google Calendar to add events");
    setEventSheet({ open: true, event: null, day });
  };
  const openEvent = (event: CalendarEvent) => setEventSheet({ open: true, event, day: parseISO(event.start) });
  const openTask = (task: Task) => setTaskSheet({ open: true, task });

  const goTo = (d: Date) => {
    setMonth(startOfMonth(d));
    setSelected(startOfDay(d));
  };

  const selectedEvents = eventsOn(selected);
  const selectedTasks = tasksOn(selected);

  return (
    <>
      <BlurFade>
        <PageHeader
          title="Calendar"
          subtitle={
            connected
              ? `Synced with ${status.data?.email ?? "Google Calendar"}. Tasks show on their due dates.`
              : "Your Google Calendar and task due dates in one place."
          }
          actions={
            <>
              {connected && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" className="rounded-xl">
                      <CalendarDays className="mr-1.5 h-4 w-4" /> Google
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-60">
                    <DropdownMenuLabel className="truncate font-normal text-muted-foreground">
                      {status.data?.email ?? "Connected"}
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onSelect={() => void events.refetch()}>
                      <RefreshCw className="mr-2 h-4 w-4" /> Refresh now
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className="text-destructive focus:text-destructive"
                      onSelect={() => {
                        if (!window.confirm("Disconnect Google Calendar? Your events stay in Google.")) return;
                        disconnect.mutate(undefined, {
                          onSuccess: () => toast.success("Google Calendar disconnected"),
                          onError: (e) => toast.error(e.message),
                        });
                      }}
                    >
                      <Unplug className="mr-2 h-4 w-4" /> Disconnect
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
              <Button className="rounded-xl" onClick={() => openNew(selected)} disabled={!connected}>
                <Plus className="mr-1.5 h-4 w-4" /> New event
              </Button>
            </>
          }
        />
      </BlurFade>

      {status.isLoading ? (
        <SkeletonBlock className="mb-6 h-20 rounded-[20px]" />
      ) : status.isError ? (
        <div className="hub-card mb-6 p-5 text-sm text-muted-foreground">{status.error.message}</div>
      ) : status.data && !status.data.configured ? (
        <div className="hub-card mb-6 p-5 text-sm">
          <p className="font-medium">Google isn't set up on the server yet</p>
          <p className="mt-1 text-muted-foreground">
            Add GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET to the Supabase Edge Function secrets, then come back to connect.
          </p>
        </div>
      ) : (
        !connected && (
          <div className="hub-card mb-6 flex flex-wrap items-center gap-4 p-5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-tint text-on-tint">
              <CalendarDays className="h-5 w-5" strokeWidth={1.75} />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">Connect Google Calendar</p>
              <p className="text-sm text-muted-foreground">
                See your meetings here and add, move or delete them from the hub.
              </p>
            </div>
            <Button className="rounded-xl" onClick={() => connect.mutate(undefined, { onError: (e) => toast.error(e.message) })} disabled={connect.isPending}>
              {connect.isPending && <Loader2 className="mr-1.5 h-4 w-4 animate-spin" />}
              Connect
            </Button>
          </div>
        )
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
        <section className="hub-card overflow-hidden">
          <div className="flex items-center gap-2 border-b border-border/60 px-4 py-3">
            <h2 className="flex-1 text-lg font-semibold">{format(month, "MMMM yyyy")}</h2>
            {events.isFetching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-label="Syncing" />}
            <Button variant="ghost" size="sm" className="rounded-lg" onClick={() => goTo(new Date())}>
              Today
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" aria-label="Previous month" onClick={() => setMonth((m) => subMonths(m, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" aria-label="Next month" onClick={() => setMonth((m) => addMonths(m, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {events.isError && (
            <p className="border-b border-border/60 bg-warning-soft px-4 py-2 text-sm text-warning">{events.error.message}</p>
          )}

          <div className="grid grid-cols-7 border-b border-border/60 text-center text-xs font-medium text-muted-foreground">
            {WEEKDAYS.map((d) => (
              <div key={d} className="py-2">
                <span className="sm:hidden">{d[0]}</span>
                <span className="hidden sm:inline">{d}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {days.map((day) => {
              const dayEvents = eventsOn(day);
              const dayTasks = tasksOn(day);
              const items = dayEvents.length + dayTasks.length;
              const inMonth = isSameMonth(day, month);
              const isSelected = isSameDay(day, selected);
              const isToday = isSameDay(day, new Date());
              return (
                <div
                  key={day.toISOString()}
                  role="button"
                  tabIndex={0}
                  aria-label={`${format(day, "EEEE d MMMM")}, ${items} item${items === 1 ? "" : "s"}`}
                  aria-pressed={isSelected}
                  onClick={() => setSelected(day)}
                  onDoubleClick={() => openNew(day)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      setSelected(day);
                    }
                  }}
                  className={cn(
                    "min-h-[3.5rem] cursor-pointer border-b border-r border-border/60 p-1 text-left outline-none transition-colors [&:nth-child(7n)]:border-r-0 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:min-h-[6.5rem] sm:p-1.5",
                    !inMonth && "bg-secondary/30 text-muted-foreground",
                    isSelected ? "bg-tint/50" : "hover:bg-secondary/50",
                  )}
                >
                  <span
                    className={cn(
                      "hub-tabular flex h-6 w-6 items-center justify-center rounded-full text-xs",
                      isToday && "bg-primary font-semibold text-primary-foreground",
                    )}
                  >
                    {format(day, "d")}
                  </span>

                  {/* Phones: dots. Larger screens: titles. */}
                  {items > 0 && (
                    <div className="mt-1 flex flex-wrap gap-0.5 sm:hidden">
                      {dayEvents.slice(0, 3).map((e) => (
                        <span key={e.id} className="h-1.5 w-1.5 rounded-full bg-primary" />
                      ))}
                      {dayTasks.slice(0, 2).map((t) => (
                        <span key={t.id} className="h-1.5 w-1.5 rounded-full" style={{ background: STATUS_COLOR[t.status] }} />
                      ))}
                    </div>
                  )}
                  <ul className="mt-1 hidden space-y-0.5 sm:block">
                    {dayEvents.slice(0, 3).map((e) => (
                      <li key={e.id}>
                        <button
                          type="button"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            openEvent(e);
                          }}
                          className={cn(
                            "block w-full truncate rounded-md px-1.5 py-0.5 text-left text-[0.6875rem] leading-tight",
                            e.allDay ? "bg-primary text-primary-foreground" : "bg-tint text-on-tint hover:bg-tint/70",
                          )}
                        >
                          {!e.allDay && <span className="hub-tabular mr-1 opacity-70">{timeLabel(e)}</span>}
                          {e.title}
                        </button>
                      </li>
                    ))}
                    {dayTasks.slice(0, Math.max(0, 3 - dayEvents.length)).map((t) => (
                      <li key={t.id}>
                        <button
                          type="button"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            openTask(t);
                          }}
                          className={cn(
                            "flex w-full items-center gap-1 truncate rounded-md px-1.5 py-0.5 text-left text-[0.6875rem] leading-tight hover:bg-secondary",
                            t.status === "done" && "text-muted-foreground line-through",
                          )}
                        >
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: STATUS_COLOR[t.status] }} />
                          <span className="truncate">{t.title}</span>
                        </button>
                      </li>
                    ))}
                    {items > 3 && <li className="px-1.5 text-[0.6875rem] text-muted-foreground">+{items - 3} more</li>}
                  </ul>
                </div>
              );
            })}
          </div>
        </section>

        <aside className="hub-card self-start p-5">
          <div className="mb-4 flex items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-semibold">{format(selected, "EEEE")}</h2>
              <p className="text-sm text-muted-foreground">{format(selected, "d MMMM yyyy")}</p>
            </div>
            {connected && (
              <Button variant="outline" size="sm" className="rounded-xl" onClick={() => openNew(selected)}>
                <Plus className="mr-1 h-4 w-4" /> Add
              </Button>
            )}
          </div>

          {connected && events.isLoading ? (
            <div className="space-y-2">
              <SkeletonBlock className="h-12" />
              <SkeletonBlock className="h-12" />
            </div>
          ) : selectedEvents.length === 0 && selectedTasks.length === 0 ? (
            <EmptyState
              icon={CalendarDays}
              title="Nothing on this day"
              description={connected ? "Double-click a day, or use Add, to create an event." : undefined}
              className="py-6"
            />
          ) : (
            <ul className="space-y-2">
              {selectedEvents.map((e) => (
                <li key={e.id}>
                  <button
                    type="button"
                    onClick={() => openEvent(e)}
                    className="flex w-full gap-3 rounded-xl border border-border/70 px-3 py-2.5 text-left transition-colors hover:bg-secondary/60"
                  >
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{e.title}</span>
                      <span className="block text-xs text-muted-foreground">
                        {e.allDay ? "All day" : `${format(parseISO(e.start), "HH:mm")} – ${format(parseISO(e.end), "HH:mm")}`}
                        {e.location && ` · ${e.location}`}
                      </span>
                    </span>
                    {e.meetLink && <Video className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-label="Has a Meet link" />}
                  </button>
                </li>
              ))}
              {selectedTasks.map((t) => (
                <li key={t.id}>
                  <button
                    type="button"
                    onClick={() => openTask(t)}
                    className="flex w-full gap-3 rounded-xl border border-dashed border-border px-3 py-2.5 text-left transition-colors hover:bg-secondary/60"
                  >
                    <CheckSquare className="mt-0.5 h-4 w-4 shrink-0" style={{ color: STATUS_COLOR[t.status] }} />
                    <span className="min-w-0 flex-1">
                      <span className={cn("block truncate text-sm font-medium", t.status === "done" && "text-muted-foreground line-through")}>
                        {t.title}
                      </span>
                      <span className="block text-xs text-muted-foreground">Task due</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </aside>
      </div>

      <EventSheet
        open={eventSheet.open}
        onOpenChange={(open) => setEventSheet((s) => ({ ...s, open }))}
        event={eventSheet.event}
        day={eventSheet.day}
      />
      <TaskSheet
        open={taskSheet.open}
        onOpenChange={(open) => setTaskSheet((s) => ({ ...s, open }))}
        task={taskSheet.task}
        allLabels={allLabels}
        lastPosition={(s) => {
          const col = allTasks.filter((t) => t.status === s);
          return col.length ? Math.max(...col.map((t) => t.position)) : undefined;
        }}
      />
    </>
  );
}
