import { useMemo, useState, type DragEvent } from "react";
import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { CalendarClock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { BlurFade } from "../../components/motion/blur-fade";
import { PageHeader, Pill, SkeletonBlock } from "../../components/ui";
import { useKes } from "../../lib/privacy";
import { PriorityPill } from "../components/bits";
import { useCrm, useDeals, useLeads, useSaveLead } from "../lib/queries";
import { CLOSED_STAGES, STAGES, STAGE_LABEL, type CrmLead, type Stage } from "../lib/types";

const OPEN = STAGES.filter((s) => !CLOSED_STAGES.includes(s));

export default function PipelinePage() {
  const kes = useKes();
  const { canEdit } = useCrm();
  const leads = useLeads();
  const deals = useDeals();
  const save = useSaveLead();
  const [over, setOver] = useState<Stage | null>(null);

  const live = useMemo(() => (leads.data ?? []).filter((l) => !l.archived_at), [leads.data]);
  const byStage = useMemo(() => {
    const m = new Map<Stage, CrmLead[]>(STAGES.map((s) => [s, []]));
    for (const l of live) m.get(l.stage)!.push(l);
    return m;
  }, [live]);
  const openValue = useMemo(() => {
    const m = new Map<string, number>();
    for (const d of deals.data ?? []) if (d.status === "open") m.set(d.lead_id, (m.get(d.lead_id) ?? 0) + Number(d.expected_monthly_retainer ?? 0));
    return m;
  }, [deals.data]);

  const move = (lead: CrmLead, stage: Stage) => {
    if (lead.stage === stage) return;
    save.mutate(
      { id: lead.id, values: { stage } },
      {
        onSuccess: () => toast.success(`${lead.name} → ${STAGE_LABEL[stage]}`),
        onError: (e) => toast.error(e.message.includes("0 rows") || e.message.includes("JSON") ? "You can't edit this lead." : e.message),
      },
    );
  };

  const onDrop = (stage: Stage) => (e: DragEvent) => {
    e.preventDefault();
    setOver(null);
    const lead = live.find((l) => l.id === e.dataTransfer.getData("text/crm-lead"));
    if (lead) move(lead, stage);
  };

  return (
    <>
      <BlurFade>
        <PageHeader title="Pipeline" subtitle="Open conversations by stage. Drag a card to move it. Values are open monthly retainers." />
      </BlurFade>

      {leads.isLoading ? (
        <SkeletonBlock className="h-96 rounded-[20px]" />
      ) : (
        <>
          <BlurFade delay={0.04} className="mb-4 flex flex-wrap gap-2">
            {CLOSED_STAGES.map((s) => (
              <Pill key={s} tone={s === "won" ? "accent" : "outline"} className="gap-1.5">
                {STAGE_LABEL[s]} <span className="hub-tabular">{byStage.get(s)!.length}</span>
              </Pill>
            ))}
          </BlurFade>
          <BlurFade delay={0.08}>
            <div className="-mx-4 flex snap-x gap-3 overflow-x-auto px-4 pb-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0">
              {OPEN.map((stage) => {
                const list = byStage.get(stage)!;
                const value = list.reduce((s, l) => s + (openValue.get(l.id) ?? 0), 0);
                return (
                  <section
                    key={stage}
                    aria-label={STAGE_LABEL[stage]}
                    onDragOver={(e) => {
                      if (!canEdit) return;
                      e.preventDefault();
                      setOver(stage);
                    }}
                    onDragLeave={(e) => !e.currentTarget.contains(e.relatedTarget as Node) && setOver(null)}
                    onDrop={onDrop(stage)}
                    className={cn(
                      "flex w-[15rem] shrink-0 snap-start flex-col rounded-[20px] bg-secondary/60 p-2 transition-colors duration-150",
                      over === stage && "bg-tint ring-2 ring-primary/40",
                    )}
                  >
                    <header className="flex items-center justify-between px-2 pb-2 pt-1">
                      <h2 className="text-sm font-semibold">
                        {STAGE_LABEL[stage]} <span className="hub-tabular text-xs font-normal text-muted-foreground">{list.length}</span>
                      </h2>
                      {value > 0 && <span className="hub-tabular text-xs text-muted-foreground">{kes(value)}</span>}
                    </header>
                    <div className="flex min-h-24 flex-col gap-2">
                      {list.map((l) => (
                        <div
                          key={l.id}
                          draggable={canEdit}
                          onDragStart={(e) => {
                            e.dataTransfer.setData("text/crm-lead", l.id);
                            e.dataTransfer.effectAllowed = "move";
                          }}
                          className={cn("hub-card rounded-2xl p-3", canEdit && "cursor-grab active:cursor-grabbing")}
                        >
                          <Link to={`/hub/crm/leads/${l.id}`} className="block truncate text-sm font-medium hover:underline">
                            {l.name}
                          </Link>
                          <div className="mt-1.5 flex items-center gap-1.5 text-xs text-muted-foreground">
                            <PriorityPill priority={l.original_priority} />
                            <span className="truncate">{l.area}</span>
                          </div>
                          {l.next_follow_up_on && (
                            <p className="mt-1.5 flex items-center gap-1 text-xs text-muted-foreground">
                              <CalendarClock className="h-3.5 w-3.5" /> {format(parseISO(l.next_follow_up_on), "d MMM")}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </section>
                );
              })}
            </div>
          </BlurFade>
        </>
      )}
    </>
  );
}
