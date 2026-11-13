import { forwardRef, type CSSProperties, type HTMLAttributes } from "react";
import { format, parseISO } from "date-fns";
import { ArrowDown, ArrowUp, CalendarDays, CheckCircle2, Equal, Flame, GripVertical, ListChecks, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { dueState } from "../../lib/tasks";
import { TASK_PRIORITY_LABEL, type Task, type TaskPriority, type TaskStatus } from "../../lib/types";
import { ClientAvatar } from "../ui";

export const STATUS_COLOR: Record<TaskStatus, string> = {
  todo: "#94a3b8",
  in_progress: "hsl(var(--primary))",
  review: "#8b7cf6",
  done: "#22a06b",
};

export const PRIORITY_STYLE: Record<TaskPriority, { icon: LucideIcon; className: string }> = {
  urgent: { icon: Flame, className: "bg-warning-soft text-warning" },
  high: { icon: ArrowUp, className: "bg-tint text-on-tint" },
  medium: { icon: Equal, className: "bg-secondary text-muted-foreground" },
  low: { icon: ArrowDown, className: "bg-secondary text-muted-foreground" },
};

export function TaskDueDate({ task }: { task: Task }) {
  if (!task.due_date) return null;
  const due = dueState(task);
  const label = due === "today" ? "Today" : `${due === "overdue" ? "Overdue · " : ""}${format(parseISO(task.due_date), "d MMM")}`;
  return (
    <span className={cn("inline-flex shrink-0 items-center gap-1.5 text-[0.6875rem] font-medium", due === "overdue" ? "text-warning" : due === "today" ? "text-on-tint" : "text-muted-foreground")}>
      <CalendarDays className="h-3.5 w-3.5" strokeWidth={1.7} /> {label}
    </span>
  );
}

export type TaskCardProps = HTMLAttributes<HTMLDivElement> & {
  task: Task;
  clientName?: string;
  overlay?: boolean;
  ghost?: boolean;
  style?: CSSProperties;
};

export const TaskCard = forwardRef<HTMLDivElement, TaskCardProps>(function TaskCard(
  { task, clientName, overlay, ghost, className, ...rest }, ref,
) {
  const priority = PRIORITY_STYLE[task.priority];
  const done = task.status === "done";
  const checklistDone = task.checklist.filter((c) => c.done).length;
  const progress = task.checklist.length ? Math.round((checklistDone / task.checklist.length) * 100) : 0;

  return (
    <div ref={ref} {...rest}
      className={cn(
        "hub-task-card group relative cursor-grab touch-manipulation select-none rounded-2xl border border-border/70 bg-card p-4 text-left outline-none",
        "shadow-[0_2px_4px_-2px_hsl(var(--foreground)/0.06)] transition-[box-shadow,border-color,opacity] duration-200",
        "hover:border-border hover:shadow-hub focus-visible:ring-2 focus-visible:ring-ring",
        overlay && "rotate-[1.5deg] scale-[1.03] cursor-grabbing shadow-hub-lg ring-1 ring-primary/30",
        ghost && "border-dashed border-primary/50 bg-tint/30 opacity-40 shadow-none [&>*]:invisible",
        className,
      )}>
      {task.priority === "urgent" && !done && <span aria-hidden className="absolute inset-y-5 left-0 w-[3px] rounded-full bg-warning" />}
      <div className="flex items-center justify-between gap-2">
        <span className={cn("inline-flex items-center gap-1 rounded-md px-2 py-1 text-[0.625rem] font-semibold", priority.className)}>
          <priority.icon className="h-3 w-3" /> {TASK_PRIORITY_LABEL[task.priority]}
        </span>
        <GripVertical aria-hidden className="h-4 w-4 text-muted-foreground/40 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100" />
      </div>
      <p className={cn("mt-3 flex items-start gap-1.5 text-[0.9375rem] font-semibold leading-[1.45] tracking-[-0.015em]", done && "text-muted-foreground")}>
        {done && <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600 dark:text-emerald-400" />}
        <span className="min-w-0 break-words">{task.title}</span>
      </p>
      {task.notes && !done && <p className="mt-1.5 line-clamp-2 break-words text-xs leading-relaxed text-muted-foreground">{task.notes}</p>}
      {task.labels.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {task.labels.slice(0, 2).map((label) => <span key={label} className="max-w-32 truncate rounded-md border border-border/60 bg-secondary/40 px-2 py-0.5 text-[0.625rem] text-muted-foreground">{label}</span>)}
          {task.labels.length > 2 && <span className="py-0.5 text-[0.625rem] text-muted-foreground">+{task.labels.length - 2}</span>}
        </div>
      )}
      {task.checklist.length > 0 && (
        <div className="mt-4">
          <div className="mb-1.5 flex items-center justify-between text-[0.625rem] text-muted-foreground">
            <span className="flex items-center gap-1"><ListChecks className="h-3 w-3" /> Checklist</span>
            <span className="hub-tabular">{checklistDone}/{task.checklist.length}</span>
          </div>
          <div className="h-1 overflow-hidden rounded-full bg-secondary" role="progressbar" aria-label="Checklist completed" aria-valuemin={0} aria-valuemax={task.checklist.length} aria-valuenow={checklistDone}>
            <div className="h-full rounded-full transition-[width] duration-300 motion-reduce:transition-none" style={{ width: `${progress}%`, background: STATUS_COLOR[task.status] }} />
          </div>
        </div>
      )}
      {(task.due_date || clientName) && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-border/50 pt-3">
          <TaskDueDate task={task} />
          {clientName && (
            <span className="ml-auto flex min-w-0 items-center gap-1.5" title={clientName}>
              <ClientAvatar name={clientName} className="h-5 w-5 shrink-0 rounded-full text-[0.5rem]" />
              <span className="max-w-28 truncate text-[0.625rem] font-medium text-muted-foreground">{clientName}</span>
            </span>
          )}
        </div>
      )}
    </div>
  );
});
