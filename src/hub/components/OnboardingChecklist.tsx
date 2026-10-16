import { useState, type FormEvent } from "react";
import { CalendarDays, ChevronDown, PartyPopper, Plus, RotateCcw, StickyNote, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { formatDate, isOverdue } from "../lib/format";
import { summariseOnboarding, useOnboardingMutations, useUpdateClient, type OnboardingItemPatch } from "../lib/queries";
import type { Client, OnboardingItem } from "../lib/types";
import { ProgressBar } from "./ui";

// React Bits Stepper, laid out vertically: each step has an indicator
// (inactive / active / complete, with the drawn check) and a connector to the
// next step that fills in mint once the step is done.

type StepStatus = "inactive" | "active" | "complete";

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24" aria-hidden>
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ delay: 0.05, type: "tween", ease: "easeOut", duration: 0.25 }}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M5 13l4 4L19 7"
      />
    </svg>
  );
}

function StepIndicator({
  step,
  status,
  label,
  onToggle,
}: {
  step: number;
  status: StepStatus;
  label: string;
  onToggle: () => void;
}) {
  return (
    <motion.button
      type="button"
      role="checkbox"
      aria-checked={status === "complete"}
      aria-label={status === "complete" ? `Mark "${label}" as not done` : `Mark "${label}" as done`}
      onClick={onToggle}
      animate={status}
      initial={false}
      whileTap={{ scale: 0.9 }}
      className="relative shrink-0 rounded-full outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-card"
    >
      <motion.div
        variants={{ inactive: { scale: 1 }, active: { scale: 1.06 }, complete: { scale: 1 } }}
        transition={{ duration: 0.2 }}
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-colors duration-200",
          status === "inactive" && "bg-secondary text-muted-foreground hover:bg-secondary/70",
          status === "active" && "bg-tint text-on-tint ring-2 ring-primary/50",
          status === "complete" && "bg-primary text-primary-foreground",
        )}
      >
        {status === "complete" ? (
          <CheckIcon className="h-4 w-4" />
        ) : status === "active" ? (
          <span className="h-2.5 w-2.5 rounded-full bg-primary" />
        ) : (
          <span className="hub-tabular text-xs">{step}</span>
        )}
      </motion.div>
    </motion.button>
  );
}

function StepConnector({ isComplete }: { isComplete: boolean }) {
  return (
    <div aria-hidden className="absolute bottom-0 left-[35px] top-11 w-0.5 overflow-hidden rounded bg-border">
      <motion.div
        className="absolute left-0 top-0 w-full bg-primary"
        initial={false}
        animate={{ height: isComplete ? "100%" : "0%" }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
    </div>
  );
}

function ItemRow({
  item,
  step,
  isCurrent,
  isLast,
}: {
  item: OnboardingItem;
  step: number;
  isCurrent: boolean;
  isLast: boolean;
}) {
  const { update, remove } = useOnboardingMutations();
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState(item.note ?? "");
  const overdue = isOverdue(item.due_date, item.is_done);

  const save = (patch: OnboardingItemPatch) =>
    update.mutate({ id: item.id, patch }, { onError: (e) => toast.error(`Couldn't save: ${e.message}`) });

  return (
    <li className="relative">
      {!isLast && <StepConnector isComplete={item.is_done} />}
      <div
        className={cn("flex items-center gap-3 px-5 py-3 transition-colors duration-200", isCurrent && "bg-tint/40")}
      >
        <StepIndicator
          step={step}
          status={item.is_done ? "complete" : isCurrent ? "active" : "inactive"}
          label={item.title}
          onToggle={() => save({ is_done: !item.is_done })}
        />
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="flex min-w-0 flex-1 items-center gap-2 text-left"
          aria-expanded={open}
        >
          <span
            className={cn(
              "min-w-0 flex-1 text-[0.9375rem] transition-colors duration-150",
              item.is_done && "text-muted-foreground line-through decoration-muted-foreground/40",
            )}
          >
            {item.title}
          </span>
          {item.note && !open && (
            <StickyNote className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-label="Has note" />
          )}
          {item.due_date && (
            <span
              className={cn(
                "hub-tabular shrink-0 rounded-full px-2 py-0.5 text-[0.6875rem]",
                overdue ? "bg-warning-soft font-medium text-warning" : "bg-secondary text-muted-foreground",
              )}
            >
              {overdue ? "Overdue · " : ""}
              {formatDate(item.due_date, "d MMM")}
            </span>
          )}
          <ChevronDown
            className={cn(
              "h-4 w-4 shrink-0 text-muted-foreground/60 transition-transform duration-200",
              open && "rotate-180",
            )}
          />
        </button>
      </div>

      {open && (
        <div className="space-y-3 px-5 pb-4 pl-[4.25rem] pt-1">
          <div className="flex flex-wrap items-center gap-2">
            <label className="hub-label flex items-center gap-1.5" htmlFor={`due-${item.id}`}>
              <CalendarDays className="h-3.5 w-3.5" /> Due date
            </label>
            <Input
              id={`due-${item.id}`}
              type="date"
              value={item.due_date ?? ""}
              onChange={(e) => save({ due_date: e.target.value || null })}
              className="h-9 w-auto rounded-lg bg-background"
            />
            {item.due_date && (
              <button
                type="button"
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={() => save({ due_date: null })}
              >
                Clear
              </button>
            )}
          </div>
          <Textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            onBlur={() => note !== (item.note ?? "") && save({ note: note.trim() || null })}
            placeholder="Add a note"
            rows={2}
            className="resize-y rounded-xl bg-background text-sm"
            aria-label={`Note for ${item.title}`}
          />
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">
              {item.is_done && item.done_at ? `Done ${formatDate(item.done_at, "d MMM yyyy")}` : " "}
            </span>
            <button
              type="button"
              onClick={() => remove.mutate(item.id, { onError: (e) => toast.error(`Couldn't remove: ${e.message}`) })}
              className="flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs text-destructive transition-colors duration-150 hover:bg-destructive/10"
            >
              <Trash2 className="h-3.5 w-3.5" /> Remove step
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

export function OnboardingChecklist({ client, items }: { client: Client; items: OnboardingItem[] }) {
  const { add, applyTemplate } = useOnboardingMutations();
  const updateClient = useUpdateClient();
  const [title, setTitle] = useState("");
  const progress = summariseOnboarding(items);
  const allDone = progress.total > 0 && progress.done === progress.total;

  const onAdd = (e: FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    const sortOrder = Math.max(0, ...items.map((i) => i.sort_order)) + 10;
    add.mutate(
      { clientId: client.id, title, sortOrder },
      { onSuccess: () => setTitle(""), onError: (err) => toast.error(`Couldn't add: ${err.message}`) },
    );
  };

  const onApplyTemplate = () =>
    applyTemplate.mutate(client.id, {
      onSuccess: (count) =>
        toast.success(
          count ? `Added ${count} template ${count === 1 ? "step" : "steps"}` : "All template steps are already here",
        ),
      onError: (err) => toast.error(err.message),
    });

  const markActive = () =>
    updateClient.mutate(
      { id: client.id, patch: { status: "active" } },
      {
        onSuccess: () => toast.success(`${client.name} is now Active`),
        onError: (err) => toast.error(err.message),
      },
    );

  return (
    <div className="space-y-4">
      {allDone && client.status !== "active" && !client.archived_at && (
        <div className="hub-card flex flex-col gap-3 border-primary/30 bg-tint p-5 sm:flex-row sm:items-center">
          <div className="flex flex-1 items-center gap-3">
            <PartyPopper className="h-5 w-5 shrink-0 text-on-tint" />
            <div>
              <p className="font-semibold text-on-tint">Onboarding complete</p>
              <p className="text-sm text-on-tint/80">All steps are done. Change {client.name} to Active?</p>
            </div>
          </div>
          <Button onClick={markActive} disabled={updateClient.isPending} className="rounded-full">
            Mark as Active
          </Button>
        </div>
      )}

      <div className="hub-card overflow-hidden">
        <div className="border-b border-border/60 px-5 py-4">
          <ProgressBar done={progress.done} total={progress.total} />
        </div>

        {items.length === 0 ? (
          <div className="px-5 py-8 text-center">
            <p className="text-sm text-muted-foreground">No onboarding steps yet.</p>
            <Button
              variant="secondary"
              size="sm"
              className="mt-3 rounded-full"
              onClick={onApplyTemplate}
              disabled={applyTemplate.isPending}
            >
              Add steps from template
            </Button>
          </div>
        ) : (
          <ul className="py-2">
            {items.map((item, i) => (
              <ItemRow
                key={item.id}
                item={item}
                step={i + 1}
                isCurrent={item.id === progress.next?.id}
                isLast={i === items.length - 1}
              />
            ))}
          </ul>
        )}

        <form onSubmit={onAdd} className="flex items-center gap-2 border-t border-border/60 px-5 py-3">
          <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Add a step"
            className="h-9 border-transparent bg-transparent px-1 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            aria-label="New onboarding step"
          />
          {title.trim() && (
            <Button type="submit" size="sm" className="rounded-full" disabled={add.isPending}>
              Add
            </Button>
          )}
        </form>
      </div>

      {items.length > 0 && (
        <button
          type="button"
          onClick={onApplyTemplate}
          disabled={applyTemplate.isPending}
          className="flex items-center gap-1.5 px-1 text-xs text-muted-foreground transition-colors duration-150 hover:text-foreground"
        >
          <RotateCcw className="h-3 w-3" /> Add any missing template steps
        </button>
      )}
    </div>
  );
}
