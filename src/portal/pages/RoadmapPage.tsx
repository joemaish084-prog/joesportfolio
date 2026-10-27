import { format, isBefore, parseISO, startOfToday } from "date-fns";
import { CheckCircle2, Circle, CircleDot, Route } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePortal } from "../auth/PortalData";
import { roadmapProgress } from "../lib/derive";
import { BlurFade } from "../components/magic/magic";
import { EmptyState, PageHeader, Pill } from "../components/ui";
import type { MilestoneStatus } from "../lib/types";

const STATUS: Record<MilestoneStatus, { label: string; tone: "success" | "accent" | "muted"; icon: typeof Circle }> = {
  done: { label: "Done", tone: "success", icon: CheckCircle2 },
  in_progress: { label: "In progress", tone: "accent", icon: CircleDot },
  planned: { label: "Planned", tone: "muted", icon: Circle },
};

export default function RoadmapPage() {
  const { milestones } = usePortal();
  const progress = roadmapProgress(milestones);

  if (milestones.length === 0) {
    return (
      <>
        <PageHeader eyebrow="Roadmap" title="The plan" />
        <EmptyState icon={Route} title="Your roadmap is being drawn up">
          Milestones for your project will appear here, so you can see what's planned, under way and finished.
        </EmptyState>
      </>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Roadmap"
        title="The plan"
        description="What we're building together, in order. Updated as we go."
      />

      <BlurFade>
        <section className="portal-card p-5 md:p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="portal-display portal-tabular text-4xl font-bold">{progress.pct}%</p>
              <p className="text-sm text-muted-foreground">
                {progress.done} of {progress.total} milestones complete
              </p>
            </div>
            <div className="flex gap-2">
              <Pill tone="success">{milestones.filter((m) => m.status === "done").length} done</Pill>
              <Pill tone="accent">{milestones.filter((m) => m.status === "in_progress").length} in progress</Pill>
              <Pill tone="muted">{milestones.filter((m) => m.status === "planned").length} planned</Pill>
            </div>
          </div>
          <div className="mt-4 h-2.5 overflow-hidden rounded-full bg-secondary">
            <div className="h-full rounded-full bg-gradient-to-r from-primary to-[#ffb27a] transition-[width] duration-1000" style={{ width: `${progress.pct}%` }} />
          </div>
        </section>
      </BlurFade>

      <BlurFade delay={0.06}>
        <ol className="portal-card p-5 md:p-7">
          {milestones.map((m, i) => {
            const s = STATUS[m.status];
            const overdue = m.status !== "done" && m.due_date && isBefore(parseISO(m.due_date), startOfToday());
            return (
              <li key={m.id} className="relative flex gap-4 pb-8 last:pb-0">
                {i < milestones.length - 1 && (
                  <span aria-hidden className={cn("absolute bottom-0 left-[0.6875rem] top-7 w-px", m.status === "done" ? "bg-primary/50" : "bg-border")} />
                )}
                <s.icon
                  className={cn(
                    "relative z-10 mt-0.5 h-6 w-6 shrink-0 rounded-full bg-card",
                    m.status === "done" ? "text-success" : m.status === "in_progress" ? "text-primary" : "text-muted-foreground",
                  )}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className={cn("font-semibold", m.status === "done" && "text-muted-foreground")}>{m.title}</h3>
                    <Pill tone={s.tone}>{s.label}</Pill>
                    {overdue && <Pill tone="warning">Past target date</Pill>}
                  </div>
                  {m.description && <p className="mt-1 text-sm text-muted-foreground">{m.description}</p>}
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {m.status === "done" && m.completed_at
                      ? `Completed ${format(parseISO(m.completed_at), "d MMM yyyy")}`
                      : m.due_date
                        ? `Target ${format(parseISO(m.due_date), "d MMM yyyy")}`
                        : "No date set"}
                  </p>
                </div>
              </li>
            );
          })}
        </ol>
      </BlurFade>
    </div>
  );
}
