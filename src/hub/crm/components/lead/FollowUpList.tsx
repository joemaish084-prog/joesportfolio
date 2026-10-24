import { useState } from "react";
import { format, parseISO } from "date-fns";
import { CalendarPlus, Check, PenLine, X } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Field, FormDialog, inputClass } from "../../../components/form";
import { Pill, Section } from "../../../components/ui";
import { useCrm, useLeadFollowUps, useSaveFollowUp } from "../../lib/queries";
import { BUCKET_LABEL, addBusinessDays, followUpBucket } from "../../lib/ranges";
import type { CrmLead, DraftKind, FollowUpTask } from "../../lib/types";

export function FollowUpActions({ task, onWrite }: { task: FollowUpTask; onWrite?: (kind: DraftKind) => void }) {
  const save = useSaveFollowUp();
  const set = (values: Partial<FollowUpTask>, message: string) =>
    save.mutate({ id: task.id, values }, { onSuccess: () => toast.success(message), onError: (e) => toast.error(e.message) });
  return (
    <div className="flex flex-wrap gap-1">
      {onWrite && task.kind !== "custom" && task.status === "pending" && (
        <Button size="sm" variant="outline" className="h-8 rounded-full" onClick={() => onWrite(task.kind as DraftKind)}>
          <PenLine className="mr-1 h-3.5 w-3.5" /> Write it
        </Button>
      )}
      {task.status === "pending" && (
        <>
          <Button size="sm" variant="ghost" className="h-8 rounded-full" onClick={() => set({ status: "done", status_reason: "Marked done" }, "Done")}>
            <Check className="mr-1 h-3.5 w-3.5" /> Done
          </Button>
          <Button
            size="sm"
            variant="ghost"
            className="h-8 rounded-full"
            onClick={() => set({ due_on: addBusinessDays(task.due_on < format(new Date(), "yyyy-MM-dd") ? format(new Date(), "yyyy-MM-dd") : task.due_on, 2) }, "Moved 2 business days")}
          >
            +2 days
          </Button>
          <Button size="sm" variant="ghost" className="h-8 rounded-full" onClick={() => set({ status: "cancelled", status_reason: "Skipped by hand" }, "Skipped")}>
            <X className="mr-1 h-3.5 w-3.5" /> Skip
          </Button>
        </>
      )}
    </div>
  );
}

export function FollowUpList({ lead, onWrite }: { lead: CrmLead; onWrite: (kind: DraftKind) => void }) {
  const { canEdit } = useCrm();
  const tasks = useLeadFollowUps(lead.id);
  const save = useSaveFollowUp();
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [due, setDue] = useState(() => addBusinessDays(format(new Date(), "yyyy-MM-dd"), 3));
  const [error, setError] = useState<string | null>(null);

  const list = (tasks.data ?? []).slice().sort((a, b) => a.due_on.localeCompare(b.due_on));
  const open = list.filter((t) => t.status === "pending" || t.status === "paused");
  const closed = list.filter((t) => t.status === "done" || t.status === "cancelled");

  return (
    <Section
      title="Follow-ups"
      action={
        canEdit &&
        !lead.do_not_contact && (
          <Button size="sm" variant="ghost" className="h-8 rounded-full" onClick={() => setAdding(true)}>
            <CalendarPlus className="mr-1 h-3.5 w-3.5" /> Add reminder
          </Button>
        )
      }
    >
      {list.length === 0 ? (
        <p className="p-5 text-sm text-muted-foreground">
          None yet. When you log the first message, follow-ups are scheduled from your sequence in Settings.
        </p>
      ) : (
        <ul>
          {[...open, ...closed].map((t) => {
            const bucket = t.status === "pending" || t.status === "paused" ? followUpBucket(t) : null;
            return (
              <li key={t.id} className={cn("flex flex-wrap items-center gap-3 border-b border-border/60 px-5 py-3 last:border-b-0", !bucket && "opacity-60")}>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">{t.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {format(parseISO(t.due_on), "EEE d MMM")} · {t.channel}
                    {t.status_reason ? ` · ${t.status_reason}` : ""}
                  </p>
                </div>
                {bucket ? (
                  <Pill tone={bucket === "overdue" ? "warning" : bucket === "today" ? "accent" : "outline"}>{BUCKET_LABEL[bucket]}</Pill>
                ) : (
                  <Pill tone="muted">{t.status === "done" ? "Done" : "Cancelled"}</Pill>
                )}
                {canEdit && <FollowUpActions task={t} onWrite={onWrite} />}
              </li>
            );
          })}
        </ul>
      )}

      <FormDialog
        open={adding}
        onOpenChange={setAdding}
        title="Add a reminder"
        submitLabel="Add"
        pending={save.isPending}
        error={error}
        onSubmit={() => {
          if (!title.trim()) {
            setError("Say what to do.");
            return;
          }
          save.mutate(
            { values: { lead_id: lead.id, kind: "custom", title: title.trim().slice(0, 200), due_on: due, assigned_to: lead.owner_id } },
            {
              onSuccess: () => {
                setAdding(false);
                setTitle("");
                setError(null);
              },
              onError: (e) => setError(e.message),
            },
          );
        }}
      >
        <Field label="What to do" htmlFor="fu-title">
          <Input id="fu-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Call the showroom manager" className={inputClass} />
        </Field>
        <Field label="Due" htmlFor="fu-due">
          <Input id="fu-due" type="date" value={due} onChange={(e) => e.target.value && setDue(e.target.value)} className={`${inputClass} w-48`} />
        </Field>
      </FormDialog>
    </Section>
  );
}
