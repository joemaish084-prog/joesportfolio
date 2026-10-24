import { useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { format, parseISO } from "date-fns";
import { CalendarClock } from "lucide-react";
import { BlurFade } from "../../components/motion/blur-fade";
import { EmptyState, PageHeader, Pill, Section, SkeletonBlock } from "../../components/ui";
import { FollowUpActions } from "../components/lead/FollowUpList";
import { useCrm, useFollowUps, useLeads, useOrg } from "../lib/queries";
import { BUCKET_LABEL, followUpBucket, type FollowUpBucket } from "../lib/ranges";
import type { FollowUpTask } from "../lib/types";

const ORDER: FollowUpBucket[] = ["overdue", "today", "week", "later", "paused"];

export default function FollowUpsPage() {
  const navigate = useNavigate();
  const { canEdit } = useCrm();
  const org = useOrg();
  const tasks = useFollowUps();
  const leads = useLeads();
  const leadById = useMemo(() => new Map((leads.data ?? []).map((l) => [l.id, l])), [leads.data]);

  const groups = useMemo(() => {
    const g = new Map<FollowUpBucket, FollowUpTask[]>(ORDER.map((b) => [b, []]));
    for (const t of tasks.data ?? []) if (leadById.has(t.lead_id)) g.get(followUpBucket(t))!.push(t);
    return g;
  }, [tasks.data, leadById]);

  const sequence = org.data?.follow_up_sequence ?? [];

  return (
    <>
      <BlurFade>
        <PageHeader
          title="Follow-ups"
          subtitle={
            sequence.length
              ? `Sequence: first message, then ${sequence.map((s) => `+${s.business_days} business days`).join(", then ")}. Replies, opt-outs and closed stages cancel what's left.`
              : "Reminders for your next touch."
          }
        />
      </BlurFade>

      {tasks.isLoading ? (
        <SkeletonBlock className="h-64 rounded-[20px]" />
      ) : (tasks.data ?? []).length === 0 ? (
        <div className="hub-card">
          <EmptyState
            icon={CalendarClock}
            title="No follow-ups waiting"
            description="They're scheduled when you log a first message to a lead."
          />
        </div>
      ) : (
        <div className="space-y-6">
          {ORDER.filter((b) => groups.get(b)!.length > 0).map((b) => (
            <BlurFade key={b}>
              <Section
                title={
                  <span className="flex items-center gap-2">
                    {BUCKET_LABEL[b]} <span className="hub-tabular text-muted-foreground">{groups.get(b)!.length}</span>
                  </span>
                }
              >
                <ul>
                  {groups.get(b)!.map((t) => {
                    const lead = leadById.get(t.lead_id)!;
                    return (
                      <li key={t.id} className="flex flex-wrap items-center gap-3 border-b border-border/60 px-5 py-3 last:border-b-0">
                        <div className="min-w-0 flex-1">
                          <Link to={`/hub/crm/leads/${t.lead_id}?tab=outreach`} className="text-sm font-medium hover:underline">
                            {lead.name}
                          </Link>
                          <p className="text-xs text-muted-foreground">
                            {t.title} · {format(parseISO(t.due_on), "EEE d MMM")} · {t.channel}
                            {t.status_reason ? ` · ${t.status_reason}` : ""}
                          </p>
                        </div>
                        {b === "overdue" && <Pill tone="warning">Overdue</Pill>}
                        {canEdit && (
                          <FollowUpActions
                            task={t}
                            onWrite={(kind) => navigate(`/hub/crm/leads/${t.lead_id}?tab=outreach&kind=${kind}`)}
                          />
                        )}
                      </li>
                    );
                  })}
                </ul>
              </Section>
            </BlurFade>
          ))}
        </div>
      )}
    </>
  );
}
