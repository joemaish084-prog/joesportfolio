import { Link } from "react-router-dom";
import { format, parseISO } from "date-fns";
import {
  BellRing,
  CalendarCheck,
  FileSignature,
  Inbox,
  MessageSquareReply,
  Percent,
  Send,
  Smile,
  Sparkles,
  Trophy,
  Upload,
  Users,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { BlurFade } from "../../components/motion/blur-fade";
import { EmptyState, PageHeader, Pill, SkeletonBlock, StatTile } from "../../components/ui";
import { useKes } from "../../lib/privacy";
import { FilterBar, useMetricFilters } from "../components/FilterBar";
import { useCrm, useDrafts, useFollowUps, useLeads, useMetrics } from "../lib/queries";
import { followUpBucket } from "../lib/ranges";

const pct = (rate: number | null) => (rate === null ? "—" : `${Math.round(rate * 1000) / 10}%`);

export default function OverviewPage() {
  const kes = useKes();
  const { canEdit, isOwner, access } = useCrm();
  const { filters, state, days } = useMetricFilters();
  const metrics = useMetrics(filters);
  const leads = useLeads();
  const followUps = useFollowUps();
  const drafts = useDrafts();
  const m = metrics.data;

  const due = (followUps.data ?? []).filter((t) => {
    const b = followUpBucket(t);
    return b === "overdue" || b === "today";
  });
  const awaiting = (drafts.data ?? []).filter((d) => d.status === "draft").length;
  const ready = (drafts.data ?? []).filter((d) => d.status === "approved").length;
  const noLeads = leads.isSuccess && leads.data.length === 0;

  const tiles = m && [
    { label: "Total leads", icon: Users, value: m.total_leads, hint: "Current, with these filters" },
    { label: "Leads added", icon: Sparkles, value: m.leads_added, hint: "In this period" },
    { label: "Leads contacted", icon: Send, value: m.contacted, hint: "At least one message logged" },
    { label: "Replies received", icon: MessageSquareReply, value: m.replies },
    { label: "Positive replies", icon: Smile, value: m.positive_replies, hint: "Moved to Interested or further" },
    { label: "Meetings booked", icon: CalendarCheck, value: m.meetings_booked },
    { label: "Proposals sent", icon: FileSignature, value: m.proposals_sent },
    { label: "Clients won", icon: Trophy, value: m.clients_won },
    {
      label: "Revenue won",
      icon: Wallet,
      value: kes(m.revenue_won),
      hint:
        m.won_missing_value > 0
          ? `Monthly retainers. ${m.won_missing_value} won ${m.won_missing_value === 1 ? "deal has" : "deals have"} no value yet`
          : "Monthly retainers, not ad budgets",
      warn: m.won_missing_value > 0,
    },
    {
      label: "Response rate",
      icon: Percent,
      value: pct(m.response_rate),
      hint: m.response_rate === null ? "No one contacted in this period" : "Replies ÷ leads contacted",
    },
    {
      label: "Meeting conversion",
      icon: Percent,
      value: pct(m.meeting_rate),
      hint: m.meeting_rate === null ? "No one contacted in this period" : "Meetings ÷ leads contacted",
    },
  ];

  return (
    <>
      <BlurFade>
        <PageHeader
          title="Command Centre"
          subtitle={`${access?.org_name ?? "Outreach"} · ${format(parseISO(days.from), "d MMM")} to ${format(parseISO(days.to), "d MMM yyyy")}`}
          actions={
            isOwner && (
              <Button asChild variant="outline" className="rounded-full px-4">
                <Link to="/hub/crm/import">
                  <Upload className="mr-1.5 h-4 w-4" /> Import leads
                </Link>
              </Button>
            )
          }
        />
      </BlurFade>

      <FilterBar state={state} />

      {noLeads ? (
        <div className="hub-card mb-6">
          <EmptyState
            icon={Inbox}
            title="No leads yet"
            description={
              isOwner
                ? "Import your prospect spreadsheet to start. Nothing is saved until you've reviewed the preview."
                : "Leads assigned to you or shared with you will show up here."
            }
            action={
              isOwner && (
                <Button asChild size="sm" className="rounded-full">
                  <Link to="/hub/crm/import">Import a spreadsheet</Link>
                </Button>
              )
            }
          />
        </div>
      ) : null}

      {(due.length > 0 || awaiting > 0 || ready > 0) && canEdit && (
        <BlurFade delay={0.03} className="mb-6 grid gap-3 sm:grid-cols-3">
          <Link to="/hub/crm/follow-ups" className="hub-card hub-card-interactive flex items-center gap-3 p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-warning-soft text-warning">
              <BellRing className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold">{due.length} follow-ups due</span>
              <span className="block truncate text-xs text-muted-foreground">Today and overdue</span>
            </span>
          </Link>
          <Link to="/hub/crm/outreach" className="hub-card hub-card-interactive flex items-center gap-3 p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-tint text-on-tint">
              <FileSignature className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold">{awaiting} drafts to review</span>
              <span className="block truncate text-xs text-muted-foreground">Nothing goes out without your approval</span>
            </span>
          </Link>
          <Link to="/hub/crm/outreach?tab=approved" className="hub-card hub-card-interactive flex items-center gap-3 p-4">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-tint text-on-tint">
              <Send className="h-4 w-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-sm font-semibold">{ready} approved, not yet sent</span>
              <span className="block truncate text-xs text-muted-foreground">Open them in Gmail or WhatsApp</span>
            </span>
          </Link>
        </BlurFade>
      )}

      {metrics.isLoading ? (
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 8 }, (_, i) => (
            <SkeletonBlock key={i} className="h-28 rounded-[20px]" />
          ))}
        </div>
      ) : metrics.isError ? (
        <p role="alert" className="hub-card p-5 text-sm text-destructive">
          Couldn't load the numbers: {metrics.error.message}
        </p>
      ) : (
        tiles && (
          <BlurFade delay={0.06} className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {tiles.map((t) => (
              <StatTile key={t.label} label={t.label} icon={t.icon} hint={t.hint} warn={t.warn}>
                <span className="hub-tabular">{t.value}</span>
              </StatTile>
            ))}
          </BlurFade>
        )
      )}

      {m?.tracking_since && parseISO(m.tracking_since) > parseISO(filters.from) && (
        <p className="mt-4 text-xs text-muted-foreground">
          <Pill tone="outline" className="mr-2">
            Note
          </Pill>
          Activity tracking started {format(parseISO(m.tracking_since), "d MMM yyyy")}; nothing before that is counted.
        </p>
      )}
    </>
  );
}
