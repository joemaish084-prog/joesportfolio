import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { addDays, addWeeks, format, isSameDay, isSameMonth, startOfWeek, subWeeks } from "date-fns";
import { ArrowUpRight, CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Loader2, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { eventOnDay, eventTimeLabel, sortEvents, useGoogleEvents, useGoogleStatus, ymd, type CalendarEvent } from "../../lib/calendar";
import type { Task } from "../../lib/types";
import { STATUS_COLOR } from "../tasks/TaskCard";
import { EventSheet } from "./EventSheet";

// One week of the calendar for the Tasks page: Google events next to the tasks
// due that day, so planning the board and the diary happen in one place.

const COLLAPSED_KEY = "hub.tasks.weekCollapsed";
const PER_DAY = 4;

function readCollapsed() {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}

function AddButton({ day, onClick, className }: { day: Date; onClick: () => void; className: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Add an event on ${format(day, "EEEE d MMMM")}`}
      className={cn(
        "h-6 w-6 shrink-0 items-center justify-center rounded-md text-muted-foreground hover:bg-secondary hover:text-foreground",
        className,
      )}
    >
      <Plus className="h-3.5 w-3.5" />
    </button>
  );
}

export function WeekStrip({ tasks, onOpenTask }: { tasks: Task[]; onOpenTask: (task: Task) => void }) {
  const [weekStart, setWeekStart] = useState(() => startOfWeek(new Date(), { weekStartsOn: 1 }));
  const [collapsed, setCollapsed] = useState(readCollapsed);
  const [sheet, setSheet] = useState<{ open: boolean; event: CalendarEvent | null; day: Date }>({
    open: false,
    event: null,
    day: new Date(),
  });

  const status = useGoogleStatus();
  const connected = status.data?.connected === true;
  const weekEnd = addDays(weekStart, 7);
  const events = useGoogleEvents(weekStart, weekEnd, connected && !collapsed);

  const days = useMemo(() => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)), [weekStart]);
  const eventList = useMemo(() => [...(events.data ?? [])].sort(sortEvents), [events.data]);
  const tasksByDay = useMemo(() => {
    const map = new Map<string, Task[]>();
    for (const t of tasks) if (t.due_date) map.set(t.due_date, [...(map.get(t.due_date) ?? []), t]);
    return map;
  }, [tasks]);

  const toggle = () => {
    setCollapsed((c) => {
      try {
        localStorage.setItem(COLLAPSED_KEY, c ? "0" : "1");
      } catch {
        // Not remembered; the toggle still works for this visit.
      }
      return !c;
    });
  };

  const openNew = (day: Date) => setSheet({ open: true, event: null, day });
  const isThisWeek = isSameDay(weekStart, startOfWeek(new Date(), { weekStartsOn: 1 }));
  const range = isSameMonth(weekStart, addDays(weekStart, 6))
    ? `${format(weekStart, "d")} – ${format(addDays(weekStart, 6), "d MMM")}`
    : `${format(weekStart, "d MMM")} – ${format(addDays(weekStart, 6), "d MMM")}`;

  return (
    <section className="hub-card mb-5 overflow-hidden">
      <div className="flex flex-wrap items-center gap-2 px-4 py-3">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={!collapsed}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
        >
          <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" />
          <span className="font-semibold">{isThisWeek ? "This week" : "Week"}</span>
          <span className="hub-tabular truncate text-sm text-muted-foreground">{range}</span>
          <ChevronDown className={cn("h-4 w-4 shrink-0 text-muted-foreground transition-transform", collapsed && "-rotate-90")} />
        </button>
        {!collapsed && (
          <>
            {events.isFetching && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" aria-label="Syncing" />}
            {!isThisWeek && (
              <Button variant="ghost" size="sm" className="rounded-lg" onClick={() => setWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))}>
                Today
              </Button>
            )}
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" aria-label="Previous week" onClick={() => setWeekStart((w) => subWeeks(w, 1))}>
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" aria-label="Next week" onClick={() => setWeekStart((w) => addWeeks(w, 1))}>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </>
        )}
        <Link to="/hub/calendar" className="flex items-center gap-0.5 text-sm text-primary hover:underline">
          Calendar <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {!collapsed && (
        <>
          {status.data?.configured && !connected && (
            <p className="border-t border-border/60 px-4 py-2 text-sm text-muted-foreground">
              Showing task due dates only.{" "}
              <Link to="/hub/calendar" className="text-primary hover:underline">
                Connect Google Calendar
              </Link>{" "}
              to see your meetings here too.
            </p>
          )}
          {events.isError && (
            <p className="border-t border-border/60 bg-warning-soft px-4 py-2 text-sm text-warning">{events.error.message}</p>
          )}

          <div className="grid border-t border-border/60 md:grid-cols-7">
            {days.map((day) => {
              const dayEvents = eventList.filter((e) => eventOnDay(e, day));
              const dayTasks = tasksByDay.get(ymd(day)) ?? [];
              const total = dayEvents.length + dayTasks.length;
              const isToday = isSameDay(day, new Date());
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "group flex gap-3 border-b border-border/60 px-4 py-2.5 last:border-b-0 md:block md:min-h-[8.5rem] md:border-b-0 md:border-r md:px-2 md:py-2 md:last:border-r-0",
                    isToday && "bg-tint/40",
                  )}
                  onDoubleClick={() => connected && openNew(day)}
                >
                  <div className="flex w-14 shrink-0 items-center gap-1 md:mb-1.5 md:w-auto">
                    <span className="text-xs text-muted-foreground">{format(day, "EEE")}</span>
                    <span
                      className={cn(
                        "hub-tabular flex h-6 min-w-6 items-center justify-center rounded-full px-1 text-xs",
                        isToday && "bg-primary font-semibold text-primary-foreground",
                      )}
                    >
                      {format(day, "d")}
                    </span>
                    {connected && (
                      <AddButton day={day} onClick={() => openNew(day)} className="ml-auto hidden md:flex md:opacity-0 md:group-hover:opacity-100 md:focus-visible:opacity-100" />
                    )}
                  </div>

                  <ul className="min-w-0 flex-1 space-y-0.5">
                    {connected && events.isLoading && <li className="h-5 w-3/4 animate-pulse rounded-md bg-secondary" />}
                    {dayEvents.slice(0, PER_DAY).map((e) => (
                      <li key={e.id}>
                        <button
                          type="button"
                          onClick={() => setSheet({ open: true, event: e, day })}
                          className={cn(
                            "block w-full truncate rounded-md px-1.5 py-0.5 text-left text-xs leading-snug",
                            e.allDay ? "bg-primary text-primary-foreground" : "bg-tint text-on-tint hover:bg-tint/70",
                          )}
                        >
                          {!e.allDay && <span className="hub-tabular mr-1 opacity-70">{eventTimeLabel(e)}</span>}
                          {e.title}
                        </button>
                      </li>
                    ))}
                    {dayTasks.slice(0, Math.max(0, PER_DAY - dayEvents.length)).map((t) => (
                      <li key={t.id}>
                        <button
                          type="button"
                          onClick={() => onOpenTask(t)}
                          className={cn(
                            "flex w-full items-center gap-1.5 rounded-md px-1.5 py-0.5 text-left text-xs leading-snug hover:bg-secondary",
                            t.status === "done" && "text-muted-foreground line-through",
                          )}
                        >
                          <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: STATUS_COLOR[t.status] }} />
                          <span className="truncate">{t.title}</span>
                        </button>
                      </li>
                    ))}
                    {total > PER_DAY && (
                      <li>
                        <Link to="/hub/calendar" className="px-1.5 text-xs text-muted-foreground hover:text-foreground">
                          +{total - PER_DAY} more
                        </Link>
                      </li>
                    )}
                  </ul>
                  {connected && <AddButton day={day} onClick={() => openNew(day)} className="flex md:hidden" />}
                </div>
              );
            })}
          </div>
        </>
      )}

      <EventSheet
        open={sheet.open}
        onOpenChange={(open) => setSheet((s) => ({ ...s, open }))}
        event={sheet.event}
        day={sheet.day}
      />
    </section>
  );
}
