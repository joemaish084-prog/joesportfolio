import { forwardRef, type CSSProperties, type HTMLAttributes } from "react";
import { format, parseISO } from "date-fns";
import { ArrowDown, ArrowUp, CalendarClock, CheckCircle2, Equal, Flame, ListChecks, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { dueState } from "../../lib/tasks";
import { TASK_PRIORITY_LABEL, type Task, type TaskPriority, type TaskStatus } from "../../lib/types";
import { ClientAvatar } from "../ui";

// Column accents. These mark the column, never the meaning of a number.
export const STATUS_COLOR: Record<TaskStatus, string> = {
  todo: "#94a3b8",
  in_progress: "hsl(var(--primary))",
  review: "#7c6cf0",
  done: "#16a34a",
};

export const PRIORITY_STYLE: Record<TaskPriority, { icon: LucideIcon; className: string }> = {
  urgent: { icon: Flame, className: "bg-warning-soft text-warning" },
  high: { icon: ArrowUp, className: "bg-tint text-on-tint" },
  medium: { icon: Equal, className: "bg-secondary text-muted-foreground" },
  low: { icon: ArrowDown, className: "bg-secondary text-muted-foreground/80" },
};

const DUE_STYLE = {
  overdue: "bg-warning-soft text-warning",
  today: "bg-tint text-on-tint",
  soon: "bg-secondary text-foreground",
  later: "bg-secondary text-muted-foreground",
} as const;

function dueLabel(task: Task) {
  const state = dueState(task);
  if (!task.due_date) return null;
  if (state === "today") return "Today";
  if (state === "overdue") return `Late · ${format(parseISO(task.due_date), "d MMM")}`;
  return format(parseISO(task.due_date), "d MMM");
}

export type TaskCardProps = HTMLAttributes<HTMLDivElement> & {
  task: Task;
  clientName?: string;
  /** Lifted copy that follows the pointer while dragging. */
  overlay?: boolean;
  /** The placeholder left behind in the column while its card is dragged. */
  ghost?: boolean;
  style?: CSSProperties;
};

export const TaskCard = forwardRef<HTMLDivElement, TaskCardProps>(function TaskCard(
  { task, clientName, overlay, ghost, className, ...rest },
  ref,
) {
  const p = PRIORITY_STYLE[task.priority];
  const done = task.status === "done";
  const checklistDone = task.checklist.filter((c) => c.done).length;
  const due = dueState(task);
  const label = dueLabel(task);

  return (
    <div
      ref={ref}
      {...rest}
      className={cn(
        "group relative cursor-grab touch-manipulation select-none rounded-2xl border border-border/70 bg-card p-3.5 text-left outline-none",
        "shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-[box-shadow,transform,opacity] duration-200",
        "hover:-translate-y-0.5 hover:shadow-hub focus-visible:ring-2 focus-visible:ring-ring",
        overlay && "rotate-[1.5deg] scale-[1.03] cursor-grabbing shadow-[0_24px_48px_-12px_rgba(0,0,0,0.35)] ring-1 ring-primary/30",
        ghost && "opacity-40 [&>*]:invisible",
        ghost && "border-dashed border-primary/50 bg-tint/30 shadow-none",
        className,
      )}
    >
      {/* Left edge in the priority's tone for urgent work, so it pops in a busy column. */}
      {task.priority === "urgent" && !done && (
        <span aria-hidden className="absolute inset-y-3 left-0 w-[3px] rounded-full bg-warning" />
      )}

      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <span
            className={cn("flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.6875rem] font-medium", p.className)}
          >
            <p.icon className="h-3 w-3" />
            {TASK_PRIORITY_LABEL[task.priority]}
          </span>
          {task.labels.slice(0, 2).map((l) => (
            <span
              key={l}
              className="max-w-28 truncate rounded-full bg-secondary px-2 py-0.5 text-[0.6875rem] text-muted-foreground"
            >
              {l}
            </span>
          ))}
          {task.labels.length > 2 && (
            <span className="text-[0.6875rem] text-muted-foreground">+{task.labels.length - 2}</span>
          )}
        </div>
        {clientName && (
          <ClientAvatar name={clientName} className="h-6 w-6 shrink-0 rounded-full text-[0.625rem]" />
        )}
      </div>

      <p
        className={cn(
          "mt-2 flex items-start gap-1.5 text-[0.9375rem] font-medium leading-snug",
          done && "text-muted-foreground line-through decoration-muted-foreground/50",
        )}
      >
        {done && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#16a34a]" />}
        <span className="min-w-0 break-words">{task.title}</span>
      </p>
      {task.notes && !done && (
        <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">{task.notes}</p>
      )}

      {task.checklist.length > 0 && !done && (
        <div className="mt-3 h-1 w-full overflow-hidden rounded-full bg-secondary">
          <div
            className="h-full rounded-full transition-[width] duration-300"
            style={{
              width: `${(checklistDone / task.checklist.length) * 100}%`,
              background: STATUS_COLOR[task.status],
            }}
          />
        </div>
      )}

      {(label || task.checklist.length > 0 || clientName) && (
        <div className="mt-3 flex flex-wrap items-center gap-1.5 text-[0.6875rem]">
          {label && (
            <span className={cn("flex items-center gap-1 rounded-full px-2 py-0.5 font-medium", done ? DUE_STYLE.later : DUE_STYLE[due ?? "later"])}>
              <CalendarClock className="h-3 w-3" />
              {done ? format(parseISO(task.due_date as string), "d MMM") : label}
            </span>
          )}
          {task.checklist.length > 0 && (
            <span className="hub-tabular flex items-center gap-1 rounded-full bg-secondary px-2 py-0.5 text-muted-foreground">
              <ListChecks className="h-3 w-3" />
              {checklistDone}/{task.checklist.length}
            </span>
          )}
          {clientName && <span className="ml-auto max-w-[9rem] truncate text-muted-foreground">{clientName}</span>}
        </div>
      )}
    </div>
  );
});
