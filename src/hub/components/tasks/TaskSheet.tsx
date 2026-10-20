import { useEffect, useState, type KeyboardEvent } from "react";
import { format, formatDistanceToNowStrict, parseISO } from "date-fns";
import { Check, Plus, Tag, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import {
  newChecklistId,
  positionBetween,
  useArchiveTasks,
  useCreateTask,
  useRestoreTasks,
  useUpdateTask,
} from "../../lib/tasks";
import {
  TASK_PRIORITIES,
  TASK_PRIORITY_LABEL,
  TASK_STATUSES,
  TASK_STATUS_LABEL,
  type ChecklistItem,
  type Task,
  type TaskPriority,
  type TaskStatus,
} from "../../lib/types";
import { Field } from "../form";
import { ClientPicker, DatePicker } from "../pickers";
import { PRIORITY_STYLE, STATUS_COLOR } from "./TaskCard";

type Draft = {
  title: string;
  notes: string;
  status: TaskStatus;
  priority: TaskPriority;
  client_id: string | null;
  due_date: string | null;
  labels: string[];
  checklist: ChecklistItem[];
};

const blank = (status: TaskStatus, clientId: string | null): Draft => ({
  title: "",
  notes: "",
  status,
  priority: "medium",
  client_id: clientId,
  due_date: null,
  labels: [],
  checklist: [],
});

const fromTask = (t: Task): Draft => ({
  title: t.title,
  notes: t.notes ?? "",
  status: t.status,
  priority: t.priority,
  client_id: t.client_id,
  due_date: t.due_date,
  labels: t.labels,
  checklist: t.checklist,
});

/** Edit or create a task. `task` null with `open` creates one in `newStatus`. */
export function TaskSheet({
  open,
  onOpenChange,
  task,
  newStatus = "todo",
  newClientId = null,
  allLabels,
  lastPosition,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task | null;
  newStatus?: TaskStatus;
  newClientId?: string | null;
  allLabels: string[];
  /** Position of the last card per column, to add new ones at the bottom. */
  lastPosition: (status: TaskStatus) => number | undefined;
}) {
  const update = useUpdateTask();
  const create = useCreateTask();
  const archive = useArchiveTasks();
  const restore = useRestoreTasks();
  const [draft, setDraft] = useState<Draft>(() => blank(newStatus, newClientId));
  const [labelDraft, setLabelDraft] = useState("");
  const [stepDraft, setStepDraft] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setDraft(task ? fromTask(task) : blank(newStatus, newClientId));
    setLabelDraft("");
    setStepDraft("");
    setError(null);
  }, [open, task, newStatus, newClientId]);

  const set = <K extends keyof Draft>(k: K, v: Draft[K]) => setDraft((d) => ({ ...d, [k]: v }));

  const addLabel = (raw: string) => {
    const l = raw.trim().replace(/,$/, "");
    if (l && !draft.labels.some((x) => x.toLowerCase() === l.toLowerCase())) set("labels", [...draft.labels, l]);
    setLabelDraft("");
  };
  const addStep = () => {
    const text = stepDraft.trim();
    if (text) set("checklist", [...draft.checklist, { id: newChecklistId(), text, done: false }]);
    setStepDraft("");
  };
  /** Runs `fn` on Enter (and on comma, for labels). */
  const enter =
    (fn: () => void, onComma = false) =>
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === "Enter" || (onComma && e.key === ",")) {
        e.preventDefault();
        fn();
      }
    };

  const save = () => {
    if (!draft.title.trim()) return setError("Give the task a title.");
    // Typed but not added yet: keep them.
    const labels = labelDraft.trim() ? [...draft.labels, labelDraft.trim()] : draft.labels;
    const checklist = stepDraft.trim()
      ? [...draft.checklist, { id: newChecklistId(), text: stepDraft.trim(), done: false }]
      : draft.checklist;
    const values = { ...draft, title: draft.title.trim(), notes: draft.notes.trim() || null, labels, checklist };
    if (task) {
      const moved = values.status !== task.status;
      update.mutate(
        {
          id: task.id,
          patch: moved ? { ...values, position: positionBetween(lastPosition(values.status), undefined) } : values,
        },
        { onError: (e) => toast.error(e.message) },
      );
      onOpenChange(false);
    } else {
      create.mutate(
        { ...values, position: positionBetween(lastPosition(values.status), undefined) },
        {
          onSuccess: () => {
            toast.success("Task added");
            onOpenChange(false);
          },
          onError: (e) => setError(e.message),
        },
      );
    }
  };

  const remove = () => {
    if (!task) return;
    archive.mutate([task.id], {
      onSuccess: () =>
        toast("Task deleted", { action: { label: "Undo", onClick: () => restore.mutate([task.id]) } }),
    });
    onOpenChange(false);
  };

  const suggestions = allLabels.filter(
    (l) => !draft.labels.includes(l) && (!labelDraft || l.toLowerCase().includes(labelDraft.toLowerCase())),
  );
  const stepsDone = draft.checklist.filter((c) => c.done).length;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 border-border/70 bg-card p-0 sm:max-w-[30rem]"
      >
        <SheetHeader className="space-y-1 border-b border-border/60 px-6 pb-4 pt-6 text-left">
          <SheetTitle className="sr-only">{task ? "Edit task" : "New task"}</SheetTitle>
          <SheetDescription className="flex items-center gap-2 text-xs">
            <span className="h-2 w-2 rounded-full" style={{ background: STATUS_COLOR[draft.status] }} />
            {task ? TASK_STATUS_LABEL[draft.status] : "New task"}
            {task?.completed_at && (
              <span> · finished {formatDistanceToNowStrict(parseISO(task.completed_at), { addSuffix: true })}</span>
            )}
          </SheetDescription>
          <input
            value={draft.title}
            onChange={(e) => set("title", e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && save()}
            placeholder="Task title"
            autoFocus={!task}
            aria-label="Title"
            className="w-full bg-transparent text-2xl font-bold tracking-tight outline-none placeholder:text-muted-foreground/60"
          />
        </SheetHeader>

        <div className="flex-1 space-y-6 overflow-y-auto px-6 py-5">
          <Field label="Status">
            <div className="grid grid-cols-2 gap-1.5 sm:grid-cols-4">
              {TASK_STATUSES.map((s) => (
                <button
                  key={s}
                  type="button"
                  aria-pressed={draft.status === s}
                  onClick={() => set("status", s)}
                  className={cn(
                    "flex h-10 items-center justify-center gap-1.5 rounded-xl border text-xs font-medium transition-colors duration-150",
                    draft.status === s
                      ? "border-foreground/20 bg-foreground text-background"
                      : "border-border bg-background text-muted-foreground hover:text-foreground",
                  )}
                >
                  <span className="h-2 w-2 rounded-full" style={{ background: STATUS_COLOR[s] }} />
                  {TASK_STATUS_LABEL[s]}
                </button>
              ))}
            </div>
          </Field>

          <Field label="Priority">
            <div className="grid grid-cols-4 gap-1.5">
              {TASK_PRIORITIES.map((p) => {
                const st = PRIORITY_STYLE[p];
                const on = draft.priority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    aria-pressed={on}
                    onClick={() => set("priority", p)}
                    className={cn(
                      "flex h-10 items-center justify-center gap-1 rounded-xl border text-xs font-medium transition-colors duration-150",
                      on ? cn("border-transparent", st.className) : "border-border bg-background text-muted-foreground hover:text-foreground",
                    )}
                  >
                    <st.icon className="h-3.5 w-3.5" />
                    {TASK_PRIORITY_LABEL[p]}
                  </button>
                );
              })}
            </div>
          </Field>

          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Client" htmlFor="task-client">
              <ClientPicker id="task-client" value={draft.client_id} onChange={(v) => set("client_id", v)} allowNone noneLabel="No client" />
            </Field>
            <Field label="Due" htmlFor="task-due">
              <DatePicker id="task-due" value={draft.due_date} onChange={(v) => set("due_date", v)} placeholder="No due date" />
            </Field>
          </div>

          <Field label={`Checklist${draft.checklist.length ? ` · ${stepsDone}/${draft.checklist.length}` : ""}`}>
            {draft.checklist.length > 0 && (
              <ul className="mb-2 space-y-1">
                {draft.checklist.map((c) => (
                  <li key={c.id} className="group flex items-center gap-2.5 rounded-xl px-2 py-1.5 hover:bg-secondary/60">
                    <Checkbox
                      checked={c.done}
                      onCheckedChange={(v) =>
                        set(
                          "checklist",
                          draft.checklist.map((x) => (x.id === c.id ? { ...x, done: v === true } : x)),
                        )
                      }
                      aria-label={c.text}
                      className="h-[18px] w-[18px] rounded-md"
                    />
                    <span className={cn("flex-1 text-sm", c.done && "text-muted-foreground line-through")}>{c.text}</span>
                    <button
                      type="button"
                      onClick={() => set("checklist", draft.checklist.filter((x) => x.id !== c.id))}
                      aria-label={`Remove ${c.text}`}
                      className="flex h-6 w-6 items-center justify-center rounded-md text-muted-foreground opacity-0 transition-opacity hover:bg-secondary hover:text-foreground group-hover:opacity-100 focus-visible:opacity-100"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
            <div className="flex items-center gap-2 rounded-xl border border-dashed border-border px-3">
              <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
              <input
                value={stepDraft}
                onChange={(e) => setStepDraft(e.target.value)}
                onKeyDown={enter(addStep)}
                placeholder="Add a step, press Enter"
                aria-label="New checklist step"
                className="h-10 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
          </Field>

          <Field label="Labels" hint="Group work, e.g. Meta Ads, Content, Admin.">
            <div className="flex min-h-11 flex-wrap items-center gap-1.5 rounded-xl border border-input bg-background px-2.5 py-2">
              <Tag className="h-4 w-4 text-muted-foreground" />
              {draft.labels.map((l) => (
                <span key={l} className="flex items-center gap-1 rounded-full bg-secondary py-0.5 pl-2.5 pr-1 text-xs font-medium">
                  {l}
                  <button
                    type="button"
                    onClick={() => set("labels", draft.labels.filter((x) => x !== l))}
                    aria-label={`Remove ${l}`}
                    className="flex h-4 w-4 items-center justify-center rounded-full hover:bg-background"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
              <input
                value={labelDraft}
                onChange={(e) => setLabelDraft(e.target.value)}
                onKeyDown={enter(() => addLabel(labelDraft), true)}
                placeholder={draft.labels.length ? "" : "Add a label"}
                aria-label="New label"
                className="min-w-24 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              />
            </div>
            {suggestions.length > 0 && (
              <div className="mt-1.5 flex flex-wrap gap-1.5">
                {suggestions.slice(0, 8).map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => addLabel(l)}
                    className="rounded-full border border-border px-2.5 py-0.5 text-xs text-muted-foreground hover:text-foreground"
                  >
                    + {l}
                  </button>
                ))}
              </div>
            )}
          </Field>

          <Field label="Notes" htmlFor="task-notes">
            <Textarea
              id="task-notes"
              value={draft.notes}
              onChange={(e) => set("notes", e.target.value)}
              placeholder="Details, links, what 'done' looks like…"
              className="min-h-28 rounded-xl bg-background"
            />
          </Field>

          {task && (
            <p className="text-xs text-muted-foreground">
              Created {format(parseISO(task.created_at), "d MMM yyyy")}
              {task.updated_at !== task.created_at &&
                ` · updated ${formatDistanceToNowStrict(parseISO(task.updated_at), { addSuffix: true })}`}
            </p>
          )}
          {error && (
            <p role="alert" className="rounded-xl bg-destructive/10 px-3 py-2 text-sm text-destructive">
              {error}
            </p>
          )}
        </div>

        <footer className="flex items-center gap-2 border-t border-border/60 px-6 py-4">
          {task && (
            <Button
              type="button"
              variant="ghost"
              className="mr-auto rounded-full bg-none text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={remove}
            >
              <Trash2 className="mr-1.5 h-4 w-4" /> Delete
            </Button>
          )}
          <Button type="button" variant="ghost" className={cn("rounded-full", !task && "ml-auto")} onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" className="min-w-24 rounded-full" onClick={save} disabled={create.isPending}>
            <Check className="mr-1.5 h-4 w-4" />
            {task ? "Save" : "Add task"}
          </Button>
        </footer>
      </SheetContent>
    </Sheet>
  );
}
