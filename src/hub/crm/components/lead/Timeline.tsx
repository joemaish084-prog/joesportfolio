import { useState } from "react";
import { format, parseISO } from "date-fns";
import { History } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { EmptyState, Section } from "../../../components/ui";
import { useAddNote, useCrm, useLeadActivities } from "../../lib/queries";
import { STAGE_LABEL, type Activity, type CrmLead, type Stage } from "../../lib/types";
import { SelectField, useOwnerLabel } from "../bits";

function describe(a: Activity) {
  if (a.type === "stage_change") {
    const from = a.data.from as Stage | undefined;
    const to = a.data.to as Stage | undefined;
    return `Stage: ${from ? STAGE_LABEL[from] : "—"} → ${to ? STAGE_LABEL[to] : "—"}`;
  }
  return a.summary;
}

export function Timeline({ lead }: { lead: CrmLead }) {
  const { canEdit } = useCrm();
  const activities = useLeadActivities(lead.id);
  const addNote = useAddNote();
  const ownerLabel = useOwnerLabel();
  const [type, setType] = useState<"note" | "call" | "meeting">("note");
  const [text, setText] = useState("");

  return (
    <div className="space-y-6">
      {canEdit && (
        <Section title="Add to the timeline">
          <form
            className="space-y-3 p-5"
            onSubmit={(e) => {
              e.preventDefault();
              if (!text.trim()) return;
              addNote.mutate(
                { lead_id: lead.id, type, summary: text.trim().slice(0, 2000) },
                { onSuccess: () => setText(""), onError: (err) => toast.error(err.message) },
              );
            }}
          >
            <div className="flex flex-wrap gap-2">
              <SelectField
                label="Type"
                className="w-36"
                value={type}
                onChange={(v) => setType(v as typeof type)}
                options={[
                  { value: "note", label: "Note" },
                  { value: "call", label: "Call" },
                  { value: "meeting", label: "Meeting" },
                ]}
              />
            </div>
            <Textarea aria-label="What happened" rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="What happened?" className="rounded-xl bg-background" />
            <div className="flex justify-end">
              <Button type="submit" size="sm" className="rounded-full" disabled={!text.trim() || addNote.isPending}>
                Add
              </Button>
            </div>
          </form>
        </Section>
      )}

      <Section title="Activity">
        {(activities.data ?? []).length === 0 ? (
          <EmptyState icon={History} title="Nothing yet" />
        ) : (
          <ol>
            {(activities.data ?? []).map((a) => (
              <li key={a.id} className="flex gap-3 border-b border-border/60 px-5 py-3 last:border-b-0">
                <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-primary/50" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="whitespace-pre-line text-sm">{describe(a)}</p>
                  <p className="text-xs text-muted-foreground">
                    <span className="capitalize">{a.type.replace("_", " ")}</span> · {format(parseISO(a.occurred_at), "d MMM yyyy, HH:mm")}
                    {a.actor_id ? ` · ${ownerLabel(a.actor_id)}` : ""}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}
      </Section>
    </div>
  );
}
