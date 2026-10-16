import { useState, type FormEvent } from "react";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import { useDeleteRow, useRows, useSaveRow } from "../../lib/data";
import { useClientTypes } from "../../lib/queries";
import type { OnboardingTemplate } from "../../lib/types";
import { SkeletonBlock } from "../ui";

function StepRow({
  step,
  first,
  last,
  onMove,
}: {
  step: OnboardingTemplate;
  first: boolean;
  last: boolean;
  onMove: (dir: -1 | 1) => void;
}) {
  const save = useSaveRow("onboarding_templates");
  const remove = useDeleteRow("onboarding_templates");
  const [title, setTitle] = useState(step.title);

  const commit = () => {
    const next = title.trim();
    if (!next) return setTitle(step.title);
    if (next !== step.title)
      save.mutate({ id: step.id, values: { title: next } }, { onError: (e) => toast.error(e.message) });
  };

  return (
    <li className={cn("flex items-center gap-2 px-3 py-2", !step.is_active && "opacity-50")}>
      <Switch
        checked={step.is_active}
        onCheckedChange={(v) => save.mutate({ id: step.id, values: { is_active: v } })}
        aria-label={step.is_active ? `Turn off ${step.title}` : `Turn on ${step.title}`}
      />
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => e.key === "Enter" && (e.target as HTMLInputElement).blur()}
        className="h-9 flex-1 border-transparent bg-transparent shadow-none hover:bg-secondary/60 focus-visible:bg-background"
        aria-label="Step title"
      />
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        disabled={first}
        onClick={() => onMove(-1)}
        aria-label="Move up"
      >
        <ArrowUp className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        disabled={last}
        onClick={() => onMove(1)}
        aria-label="Move down"
      >
        <ArrowDown className="h-4 w-4" />
      </Button>
      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 text-muted-foreground hover:text-destructive"
        onClick={() =>
          remove.mutate(step.id, {
            onSuccess: () => toast.success("Step removed"),
            onError: (e) => toast.error(e.message),
          })
        }
        aria-label={`Delete ${step.title}`}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </li>
  );
}

function StepGroup({
  title,
  hint,
  typeId,
  steps,
}: {
  title: string;
  hint: string;
  typeId: string | null;
  steps: OnboardingTemplate[];
}) {
  const save = useSaveRow("onboarding_templates");
  const [draft, setDraft] = useState("");

  const add = (e: FormEvent) => {
    e.preventDefault();
    if (!draft.trim()) return;
    const sort = Math.max(0, ...steps.map((s) => s.sort_order)) + 10;
    save.mutate(
      { values: { client_type_id: typeId, title: draft.trim(), sort_order: sort, is_active: true } },
      { onSuccess: () => setDraft(""), onError: (err) => toast.error(err.message) },
    );
  };

  // Swap sort_order with the neighbour.
  const move = (i: number, dir: -1 | 1) => {
    const a = steps[i];
    const b = steps[i + dir];
    if (!a || !b) return;
    const aOrder = a.sort_order === b.sort_order ? a.sort_order + dir : b.sort_order;
    save.mutate({ id: a.id, values: { sort_order: aOrder } });
    save.mutate({ id: b.id, values: { sort_order: a.sort_order } });
  };

  return (
    <section>
      <div className="flex items-baseline justify-between px-1 pb-2">
        <h3 className="hub-section-title p-0">{title}</h3>
        <span className="text-xs text-muted-foreground">{hint}</span>
      </div>
      <div className="hub-card overflow-hidden">
        {steps.length > 0 && (
          <ul className="divide-y divide-border/60">
            {steps.map((s, i) => (
              <StepRow key={s.id} step={s} first={i === 0} last={i === steps.length - 1} onMove={(d) => move(i, d)} />
            ))}
          </ul>
        )}
        <form onSubmit={add} className="flex items-center gap-2 border-t border-border/60 px-3 py-2 first:border-t-0">
          <Plus className="h-4 w-4 shrink-0 text-muted-foreground" />
          <Input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Add a step"
            className="h-9 border-transparent bg-transparent px-1 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
            aria-label={`New step for ${title}`}
          />
          {draft.trim() && (
            <Button type="submit" size="sm" className="rounded-full" disabled={save.isPending}>
              Add
            </Button>
          )}
        </form>
      </div>
    </section>
  );
}

/** The checklist new clients start with: default steps plus extra steps per client type. */
export function OnboardingSettings() {
  const templates = useRows("onboarding_templates", "sort_order", true);
  const types = useClientTypes();

  if (templates.isLoading || types.isLoading) return <SkeletonBlock className="h-80 rounded-[20px]" />;

  const all = [...(templates.data ?? [])].sort(
    (a, b) => a.sort_order - b.sort_order || a.created_at.localeCompare(b.created_at),
  );
  const forType = (id: string | null) => all.filter((t) => t.client_type_id === id);

  return (
    <div className="space-y-6">
      <p className="text-sm text-muted-foreground">
        New clients get these steps automatically. Changes apply to clients you add from now on; for existing clients
        use “Add any missing template steps” on their onboarding tab. Switched-off steps aren't added.
      </p>
      <StepGroup title="Every client" hint={`${forType(null).length} steps`} typeId={null} steps={forType(null)} />
      {(types.data ?? []).map((t) => (
        <StepGroup
          key={t.id}
          title={`Extra for ${t.name}`}
          hint={`${forType(t.id).length} steps`}
          typeId={t.id}
          steps={forType(t.id)}
        />
      ))}
    </div>
  );
}
