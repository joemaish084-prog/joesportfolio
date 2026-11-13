import { ArrowUpRight, ListChecks } from "lucide-react";
import { cn } from "@/lib/utils";
import { sortTaskList } from "../../lib/task-view";
import { TASK_PRIORITY_LABEL, TASK_STATUS_LABEL, type Task } from "../../lib/types";
import { ClientAvatar } from "../ui";
import { PRIORITY_STYLE, STATUS_COLOR, TaskDueDate } from "./TaskCard";

export function TaskList({ tasks, clientName, onOpen }: {
  tasks: Task[];
  clientName: (id: string | null) => string | undefined;
  onOpen: (task: Task) => void;
}) {
  return (
    <div className="hub-card overflow-hidden">
      <div aria-hidden className="hidden grid-cols-[minmax(0,1fr)_9rem_7rem_8rem_1rem] items-center gap-4 border-b border-border/70 bg-secondary/30 px-5 py-3 text-[0.6875rem] font-medium text-muted-foreground lg:grid">
        <span>Task</span><span>Status</span><span>Priority</span><span>Due date</span><span />
      </div>
      <ul className="divide-y divide-border/60">
        {sortTaskList(tasks).map((task) => {
          const client = clientName(task.client_id);
          const priority = PRIORITY_STYLE[task.priority];
          return (
            <li key={task.id}>
              <button type="button" onClick={() => onOpen(task)} className="group grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-4 text-left transition-colors hover:bg-secondary/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring sm:px-5 lg:grid-cols-[minmax(0,1fr)_9rem_7rem_8rem_1rem] lg:gap-4">
                <span className="min-w-0">
                  <span className={cn("block truncate text-sm font-medium", task.status === "done" && "text-muted-foreground")}>{task.title}</span>
                  <span className="mt-1.5 flex min-w-0 flex-wrap items-center gap-2 text-[0.6875rem] text-muted-foreground">
                    {client ? <span className="flex min-w-0 items-center gap-1.5"><ClientAvatar name={client} className="h-4 w-4 rounded-full text-[0.4375rem]" /><span className="max-w-40 truncate">{client}</span></span> : <span>Personal</span>}
                    {task.labels.slice(0, 2).map((label) => <span key={label} className="max-w-28 truncate rounded bg-secondary px-1.5 py-0.5 text-[0.625rem]">{label}</span>)}
                    {task.checklist.length > 0 && <span className="hub-tabular flex items-center gap-1"><ListChecks className="h-3 w-3" />{task.checklist.filter((c) => c.done).length}/{task.checklist.length}</span>}
                  </span>
                </span>
                <span className="flex items-center gap-2 text-[0.6875rem] text-muted-foreground">
                  <span className="h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: STATUS_COLOR[task.status] }} />{TASK_STATUS_LABEL[task.status]}
                </span>
                <span className={cn("flex w-fit items-center gap-1 rounded-md px-2 py-1 text-[0.625rem] font-medium", priority.className)}><priority.icon className="h-3 w-3" />{TASK_PRIORITY_LABEL[task.priority]}</span>
                <span className="justify-self-end lg:justify-self-start">{task.due_date ? <TaskDueDate task={task} /> : <span className="text-[0.6875rem] text-muted-foreground">No due date</span>}</span>
                <ArrowUpRight aria-hidden className="hidden h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 lg:block" />
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
