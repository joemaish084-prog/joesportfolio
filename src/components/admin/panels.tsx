import { useMemo, useState } from "react";
import {
  Activity,
  ArrowDownToLine,
  ArrowUpFromLine,
  Bot,
  CalendarClock,
  CheckCircle2,
  Clock,
  Compass,
  Eye,
  FileText,
  Inbox,
  Info,
  Layers,
  List,
  Megaphone,
  Monitor,
  MousePointerClick,
  Radio,
  Repeat,
  RotateCcw,
  Target,
  TrendingDown,
  TriangleAlert,
  Users,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import {
  ACCENT,
  ACCENT_SOFT,
  AXIS_TICK,
  NEUTRAL,
  NEUTRAL_DIM,
  TOOLTIP_STYLE,
  downloadCsv,
  formatDateTime,
  formatDayLabel,
  formatDuration,
  formatMetricValue,
  hostOf,
  today,
  truncate,
} from "./format";
import {
  PRIORITY_ORDER,
  buildInsights,
  type Confidence,
  type Insight,
  type InsightPriority,
} from "./insights";
import { statusFor, useBaselines, type Baseline, type StatusKind } from "./baselines";
import {
  ActivityHeatmap,
  BotBadge,
  Chip,
  type Column,
  DataTable,
  type Density,
  Donut,
  EmptyState,
  ExportButton,
  MonoRef,
  RankedList,
  SectionCard,
  Segmented,
  StatCard,
  TrendChart,
} from "./ui";
import type { ActivityRow, AnalyticsData, LeadRow, SessionRow, VisitorRow } from "./types";

export interface PanelProps {
  data: AnalyticsData;
  density: Density;
  rangeLabel: string;
  includeBots: boolean;
}

const TRAFFIC_SERIES = [
  { key: "page_views", label: "Page views", color: ACCENT },
  { key: "unique_visitors", label: "Visitors", color: NEUTRAL },
  { key: "sessions", label: "Sessions", color: ACCENT_SOFT },
  { key: "clicks", label: "Clicks", color: NEUTRAL_DIM },
] as const;

/* -------------------------------------------------------------------------- */
/*  Insights                                                                  */
/* -------------------------------------------------------------------------- */

const TONE_STYLES: Record<Insight["tone"], { icon: typeof Info; className: string }> = {
  good: { icon: CheckCircle2, className: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10" },
  warn: { icon: TriangleAlert, className: "text-amber-600 dark:text-amber-400 bg-amber-500/10" },
  info: { icon: Info, className: "text-muted-foreground bg-muted" },
};

const PRIORITY_STYLES: Record<
  InsightPriority,
  { label: string; badge: string; rail: string; blurb: string }
> = {
  critical: {
    label: "Critical",
    badge: "bg-red-500/12 text-red-600 dark:text-red-400 ring-1 ring-inset ring-red-500/25",
    rail: "border-l-red-500/60",
    blurb: "No leads, a capture path that looks broken, or tracking that has stopped reporting.",
  },
  high: {
    label: "High",
    badge: "bg-amber-500/12 text-amber-700 dark:text-amber-400 ring-1 ring-inset ring-amber-500/25",
    rail: "border-l-amber-500/60",
    blurb: "Readers arriving but not crossing from the blog into the agency pages.",
  },
  medium: {
    label: "Medium",
    badge: "bg-sky-500/12 text-sky-700 dark:text-sky-400 ring-1 ring-inset ring-sky-500/25",
    rail: "border-l-sky-500/60",
    blurb: "Bounce rate, return rate and pages that go nowhere.",
  },
  low: {
    label: "Low",
    badge: "bg-muted text-muted-foreground ring-1 ring-inset ring-border",
    rail: "border-l-border",
    blurb: "Thin samples and things already working — read, don't act.",
  },
};

const CONFIDENCE_STYLES: Record<Confidence, string> = {
  high: "text-emerald-600 dark:text-emerald-400",
  moderate: "text-amber-600 dark:text-amber-400",
  low: "text-red-600 dark:text-red-400",
};

const STATUS_STYLES: Record<StatusKind, string> = {
  untracked: "text-muted-foreground",
  improved: "text-emerald-600 dark:text-emerald-400",
  worsened: "text-red-600 dark:text-red-400",
  unchanged: "text-amber-600 dark:text-amber-400",
};

function PriorityBadge({ priority }: { priority: InsightPriority }) {
  return (
    <span
      className={`shrink-0 rounded px-1.5 py-0.5 text-[9.5px] font-semibold uppercase tracking-[0.08em] ${PRIORITY_STYLES[priority].badge}`}
    >
      {PRIORITY_STYLES[priority].label}
    </span>
  );
}

/** One labelled fact from an insight's evidence block. */
function Fact({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="min-w-0">
      <dt className="text-[9.5px] font-semibold uppercase tracking-[0.08em] text-muted-foreground/70">{label}</dt>
      <dd className="mt-0.5 text-[11.5px] leading-snug text-foreground">{children}</dd>
    </div>
  );
}

/**
 * Full insight card: the observation, the numbers it was read from, what the
 * figure does and does not cover, the change being proposed, and whether the
 * target metric has moved since that change was marked as made.
 */
function InsightCard({
  insight,
  rangeDays,
  baseline,
  onMark,
  onClear,
}: {
  insight: Insight;
  rangeDays: number;
  baseline: Baseline | undefined;
  onMark: () => void;
  onClear: () => void;
}) {
  const tone = TONE_STYLES[insight.tone];
  const Icon = tone.icon;
  const ev = insight.evidence;
  const status = statusFor(insight, baseline, rangeDays);

  return (
    <div className={`rounded-lg border border-l-2 bg-card/40 p-3.5 ${PRIORITY_STYLES[insight.priority].rail}`}>
      <div className="flex items-start gap-2.5">
        <span
          className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${tone.className}`}
        >
          <Icon className="h-3 w-3" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <PriorityBadge priority={insight.priority} />
            <p className="min-w-0 text-[13px] font-medium leading-snug text-foreground">{insight.title}</p>
          </div>
          <p className="mt-1 text-[11.5px] leading-relaxed text-muted-foreground">{insight.detail}</p>
        </div>
      </div>

      <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-2.5 border-t border-border/60 pt-3 sm:grid-cols-4">
        <Fact label="Sample size">
          {ev.sampleSize.toLocaleString()} <span className="text-muted-foreground">{ev.sampleLabel}</span>
        </Fact>
        <Fact label="Date range">{ev.rangeLabel}</Fact>
        <Fact label="Confidence">
          <span className={`font-medium capitalize ${CONFIDENCE_STYLES[ev.confidence]}`}>{ev.confidence}</span>
          <span className="text-muted-foreground"> — {ev.confidenceReason}</span>
        </Fact>
        <Fact label="Basis">
          <span className="flex flex-col gap-0.5">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3 shrink-0 text-muted-foreground" aria-hidden />
              {ev.humansOnly ? "Humans only" : "Humans and bots together"}
            </span>
            <span className="flex items-center gap-1">
              <Bot className="h-3 w-3 shrink-0 text-muted-foreground" aria-hidden />
              {ev.botsExcluded ? "Bots excluded" : "Bots not excluded"}
            </span>
          </span>
        </Fact>
      </dl>

      {ev.caveat && (
        <p className="mt-2.5 text-[11px] leading-relaxed text-muted-foreground">
          <span className="font-medium text-foreground">Caveat: </span>
          {ev.caveat}
        </p>
      )}

      <div className="mt-3 rounded-md bg-muted/40 p-3">
        <dl className="space-y-2.5">
          <Fact label="Recommended action">{insight.action.recommended}</Fact>
          <div className="grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-2">
            <Fact label="Target metric">
              <span className="flex items-center gap-1.5">
                <Target className="h-3 w-3 shrink-0 text-muted-foreground" aria-hidden />
                {insight.action.targetMetric}
                <span className="text-muted-foreground">
                  — now {formatMetricValue(insight.action.value, insight.action.unit)}, wants to be{" "}
                  {insight.action.better}
                </span>
              </span>
            </Fact>
            <Fact label="Status after the change">
              <span className={STATUS_STYLES[status.kind]}>{status.label}</span>
              {status.warning && (
                <span className="mt-0.5 block text-[10.5px] leading-snug text-amber-600 dark:text-amber-400">
                  {status.warning}
                </span>
              )}
            </Fact>
          </div>
        </dl>
        <div className="mt-2.5 flex items-center gap-3">
          <button
            onClick={onMark}
            className="text-[11px] font-medium text-primary transition-opacity hover:opacity-70"
          >
            {baseline ? "Re-baseline from today" : "Mark as actioned"}
          </button>
          {baseline && (
            <button
              onClick={onClear}
              className="flex items-center gap-1 text-[11px] font-medium text-muted-foreground transition-opacity hover:opacity-70"
            >
              <RotateCcw className="h-3 w-3" aria-hidden /> Clear baseline
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** Condensed row for the overview card, where space is tight. */
function InsightRow({ insight }: { insight: Insight }) {
  const tone = TONE_STYLES[insight.tone];
  const Icon = tone.icon;
  const ev = insight.evidence;

  return (
    <div className="flex gap-2.5">
      <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full ${tone.className}`}>
        <Icon className="h-3 w-3" aria-hidden />
      </span>
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-1.5">
          <PriorityBadge priority={insight.priority} />
          <p className="min-w-0 text-[13px] font-medium leading-snug text-foreground">{insight.title}</p>
        </div>
        <p className="mt-0.5 text-[11.5px] leading-relaxed text-muted-foreground">{insight.detail}</p>
        <p className="mt-1 text-[10.5px] leading-snug text-muted-foreground/80">
          n={ev.sampleSize.toLocaleString()} {ev.sampleLabel} · {ev.rangeLabel} ·{" "}
          <span className={CONFIDENCE_STYLES[ev.confidence]}>{ev.confidence} confidence</span> ·{" "}
          {ev.humansOnly ? "humans only" : "humans+bots"} · {ev.botsExcluded ? "bots excluded" : "bots included"}
        </p>
        <p className="mt-1 text-[10.5px] leading-snug text-muted-foreground">
          <span className="font-medium text-foreground">Do: </span>
          {insight.action.recommended}
        </p>
      </div>
    </div>
  );
}

/**
 * Triaged list. Insights arrive sorted by priority; this groups them under
 * headings so a critical item can never be buried under a dozen low ones.
 */
function InsightList({
  insights,
  rangeDays,
  limit,
}: {
  insights: Insight[];
  rangeDays: number;
  limit?: number;
}) {
  const [expanded, setExpanded] = useState(false);
  const { baselines, mark, clear } = useBaselines();

  if (insights.length === 0) return <EmptyState label="Not enough traffic to draw conclusions from yet." />;

  /* Compact mode: priority order is preserved, so a slice is still a triage. */
  if (limit) {
    const shown = expanded ? insights : insights.slice(0, limit);
    return (
      <div className="space-y-3">
        {shown.map((insight) => (
          <InsightRow key={insight.id} insight={insight} />
        ))}
        {insights.length > limit && (
          <button
            onClick={() => setExpanded((v) => !v)}
            className="text-[11px] font-medium text-primary transition-opacity hover:opacity-70"
          >
            {expanded ? "Show less" : `Show ${insights.length - limit} more`}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {PRIORITY_ORDER.map((priority) => {
        const group = insights.filter((i) => i.priority === priority);
        if (group.length === 0) return null;
        const style = PRIORITY_STYLES[priority];
        return (
          <section key={priority}>
            <div className="mb-2.5 flex flex-wrap items-baseline gap-2">
              <PriorityBadge priority={priority} />
              <span className="text-[11px] font-medium text-foreground">
                {group.length} item{group.length === 1 ? "" : "s"}
              </span>
              <span className="text-[11px] text-muted-foreground">{style.blurb}</span>
            </div>
            <div className="space-y-3">
              {group.map((insight) => (
                <InsightCard
                  key={insight.id}
                  insight={insight}
                  rangeDays={rangeDays}
                  baseline={baselines[insight.action.metricId]}
                  onMark={() =>
                    mark(insight.action.metricId, {
                      value: insight.action.value,
                      unit: insight.action.unit,
                      markedAt: new Date().toISOString(),
                      rangeDays,
                    })
                  }
                  onClear={() => clear(insight.action.metricId)}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Overview                                                                  */
/* -------------------------------------------------------------------------- */

export function OverviewPanel({ data, rangeLabel }: PanelProps) {
  const [series, setSeries] = useState<string[]>(["page_views", "unique_visitors"]);
  const insights = useMemo(() => buildInsights(data), [data]);

  const trend = (key: keyof AnalyticsData["visits_by_day"][number]) =>
    data.visits_by_day.map((d) => Number(d[key]));

  const toggleSeries = (key: string) =>
    setSeries((prev) =>
      prev.includes(key) ? (prev.length > 1 ? prev.filter((k) => k !== key) : prev) : [...prev, key],
    );

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
        <StatCard
          icon={Users}
          label="Visitors"
          value={data.period.visitors}
          current={data.period.visitors}
          prev={data.period.prev_visitors}
          trend={trend("unique_visitors")}
          hint={`${data.totals.visitors.toLocaleString()} all time`}
          accent
        />
        <StatCard
          icon={Layers}
          label="Sessions"
          value={data.period.sessions}
          current={data.period.sessions}
          prev={data.period.prev_sessions}
          trend={trend("sessions")}
          hint={`${data.engagement.human_sessions} human · ${data.engagement.bot_sessions} bot`}
        />
        <StatCard
          icon={Eye}
          label="Page Views"
          value={data.period.page_views}
          current={data.period.page_views}
          prev={data.period.prev_page_views}
          trend={trend("page_views")}
          hint={`${data.engagement.pages_per_session} per session`}
        />
        <StatCard
          icon={MousePointerClick}
          label="Clicks"
          value={data.period.clicks}
          current={data.period.clicks}
          prev={data.period.prev_clicks}
          trend={trend("clicks")}
          hint={`${data.engagement.clicks_per_session} per session`}
        />
        <StatCard
          icon={TrendingDown}
          label="Bounce Rate"
          value={data.engagement.bounce_rate}
          suffix="%"
          hint={`${data.engagement.engaged_sessions} engaged sessions`}
        />
        <StatCard
          icon={Clock}
          label="Median Session"
          value={Math.round(data.engagement.median_session_duration_ms / 1000)}
          suffix="s"
          hint={`avg ${formatDuration(data.engagement.avg_session_duration_ms)}, idle-tab skewed`}
        />
        <StatCard
          icon={Repeat}
          label="Repeat Visitors"
          value={data.engagement.repeat_visitors}
          hint={`${data.engagement.new_visitors} new this period`}
        />
        <StatCard
          icon={Target}
          label="Leads"
          value={data.period.leads}
          current={data.period.leads}
          prev={data.period.prev_leads}
          hint={`${data.leads.conversion_rate}% of sessions convert`}
          accent
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-3">
        <SectionCard
          title={`Traffic — ${rangeLabel}`}
          subtitle="Click a series to show or hide it."
          icon={Activity}
          className="xl:col-span-2"
          action={
            <Segmented
              options={TRAFFIC_SERIES.map((s) => ({ value: s.key as string, label: s.label }))}
              value={series}
              onChange={toggleSeries}
              size="xs"
            />
          }
        >
          <TrendChart
            data={data.visits_by_day as unknown as Record<string, unknown>[]}
            series={TRAFFIC_SERIES.filter((s) => series.includes(s.key)).map((s) => ({ ...s }))}
            xKey="day"
            xTickFormatter={formatDayLabel}
            height={296}
          />
        </SectionCard>

        <SectionCard
          title="What stands out"
          subtitle="Worst-first. Full evidence on the Insights tab."
          icon={Info}
          bodyClassName="p-5 max-h-[22rem] overflow-y-auto"
        >
          <InsightList insights={insights} rangeDays={data.range_days} limit={6} />
        </SectionCard>
      </div>

      <div className="grid gap-5 md:grid-cols-3">
        <SectionCard title="Top pages" subtitle="Query strings stripped." icon={FileText}>
          <RankedList
            items={data.top_pages_clean.slice(0, 6).map((p) => ({
              label: p.page_path,
              value: p.views,
              sub: `${p.unique_visitors} visitors`,
            }))}
          />
        </SectionCard>
        <SectionCard title="Channels" subtitle="How sessions arrived." icon={Compass}>
          <RankedList
            items={data.channels.slice(0, 6).map((c) => ({
              label: c.channel,
              value: c.sessions,
              sub: `${c.pages_per_session} pp/s`,
            }))}
          />
        </SectionCard>
        <SectionCard title="Most clicked" subtitle="Closest proxy for CTA pull." icon={MousePointerClick}>
          <RankedList
            items={data.top_clicks.slice(0, 6).map((c) => ({
              label: c.label,
              value: c.count,
              sub: `${c.sessions} sessions`,
            }))}
          />
        </SectionCard>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Acquisition                                                               */
/* -------------------------------------------------------------------------- */

export function AcquisitionPanel({ data, density }: PanelProps) {
  return (
    <div className="space-y-5">
      <div className="grid gap-5 lg:grid-cols-3">
        <SectionCard title="Channels" subtitle="Sessions grouped by how they arrived." icon={Compass}>
          <RankedList
            items={data.channels.map((c) => ({
              label: c.channel,
              value: c.sessions,
              sub: `${Math.round((c.engaged_sessions / Math.max(1, c.sessions)) * 100)}% engaged`,
            }))}
          />
        </SectionCard>

        <SectionCard
          title="External referrers"
          subtitle="In-app navigation and self-referrals removed."
          icon={Radio}
          action={
            <ExportButton
              onClick={() =>
                downloadCsv(`referrers-${today()}.csv`, [
                  ["Referrer", "Page views", "Sessions"],
                  ...data.external_referrers.map((r) => [r.referrer, r.count, r.sessions]),
                ])
              }
            />
          }
        >
          <RankedList
            items={data.external_referrers.map((r) => ({
              label: hostOf(r.referrer),
              value: r.count,
              sub: `${r.sessions} sessions`,
            }))}
            emptyLabel="No external referrers in this range — traffic is arriving direct."
          />
        </SectionCard>

        <SectionCard title="Ad clicks" subtitle="Arrivals carrying a paid click id." icon={Target}>
          <RankedList
            items={data.ad_clicks.map((a) => ({
              label: a.network,
              value: a.page_views,
              sub: `${a.sessions} sessions`,
            }))}
            emptyLabel="No fbclid, gclid, ttclid or msclkid arrivals in this range."
          />
        </SectionCard>
      </div>

      <SectionCard
        title="Campaigns"
        subtitle="Parsed from utm_* parameters on the landing URL — nothing extra to instrument."
        icon={Megaphone}
        action={
          <ExportButton
            onClick={() =>
              downloadCsv(`campaigns-${today()}.csv`, [
                ["Source", "Medium", "Campaign", "Content", "Landing page", "Page views", "Sessions", "Visitors"],
                ...data.campaigns.map((c) => [
                  c.utm_source,
                  c.utm_medium,
                  c.utm_campaign,
                  c.utm_content,
                  c.landing_page,
                  c.page_views,
                  c.sessions,
                  c.visitors,
                ]),
              ])
            }
          />
        }
      >
        <DataTable
          density={density}
          rows={data.campaigns as unknown as Record<string, unknown>[]}
          initialSortKey="page_views"
          emptyLabel="No utm-tagged traffic in this range. Add utm_source and utm_medium to links you share and they will appear here."
          columns={[
            { key: "utm_source", label: "Source", cellClassName: "text-foreground font-medium" },
            { key: "utm_medium", label: "Medium" },
            { key: "utm_campaign", label: "Campaign" },
            { key: "utm_content", label: "Content" },
            {
              key: "landing_page",
              label: "Landing",
              render: (r) => <span title={String(r.landing_page)}>{truncate(String(r.landing_page), 22)}</span>,
            },
            { key: "page_views", label: "Views", align: "right", cellClassName: "text-foreground" },
            { key: "sessions", label: "Sessions", align: "right" },
            { key: "visitors", label: "Visitors", align: "right" },
          ]}
        />
      </SectionCard>

      <SectionCard
        title="Raw referrer values"
        subtitle="Everything exactly as captured, including internal navigation."
        icon={List}
      >
        <RankedList items={data.referrers.map((r) => ({ label: r.referrer, value: r.count }))} />
      </SectionCard>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Timing                                                                    */
/* -------------------------------------------------------------------------- */

export function TimingPanel({ data }: PanelProps) {
  const peak = useMemo(
    () => [...data.activity_heatmap].sort((a, b) => b.page_views - a.page_views)[0],
    [data.activity_heatmap],
  );

  return (
    <div className="space-y-5">
      <SectionCard
        title="When people visit"
        subtitle={`Day of week against hour of day, bucketed in ${data.timezone}.`}
        icon={CalendarClock}
      >
        <ActivityHeatmap cells={data.activity_heatmap} timezone={data.timezone} />
      </SectionCard>

      <div className="grid gap-5 lg:grid-cols-3">
        <SectionCard title="Page views by hour" icon={Clock} className="lg:col-span-2">
          {data.visits_by_hour_of_day.length === 0 ? (
            <EmptyState label="No data in this range yet." />
          ) : (
            <div className="h-60">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.visits_by_hour_of_day} margin={{ left: -18, top: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" vertical={false} />
                  <XAxis dataKey="hour" tick={AXIS_TICK} axisLine={false} tickLine={false} tickMargin={8} />
                  <YAxis tick={AXIS_TICK} allowDecimals={false} axisLine={false} tickLine={false} width={40} />
                  <Tooltip
                    contentStyle={TOOLTIP_STYLE}
                    labelFormatter={(h) => `${String(h).padStart(2, "0")}:00`}
                  />
                  <Bar dataKey="page_views" name="Page views" fill={ACCENT} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </SectionCard>

        <SectionCard title="Best window" subtitle="Where to aim a launch or a post." icon={Target}>
          {peak ? (
            <div className="space-y-4">
              <div>
                <p className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
                  Busiest hour
                </p>
                <p className="mt-1 text-2xl font-semibold tracking-tight">
                  {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][peak.dow]}{" "}
                  {String(peak.hour).padStart(2, "0")}:00
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {peak.page_views} views, {peak.sessions} sessions in that hour.
                </p>
              </div>
              <div className="border-t border-border/50 pt-3">
                <p className="text-[11.5px] leading-relaxed text-muted-foreground">
                  Publishing shortly before this window puts new work in front of the largest audience. Times are in{" "}
                  {data.timezone}.
                </p>
              </div>
            </div>
          ) : (
            <EmptyState label="Not enough traffic to identify a peak window yet." />
          )}
        </SectionCard>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Pages                                                                     */
/* -------------------------------------------------------------------------- */

export function PagesPanel({ data, density }: PanelProps) {
  return (
    <div className="space-y-5">
      <SectionCard
        title="Page performance"
        subtitle="Every column sorts. Bounce rate is measured against the sessions that landed on that page."
        icon={FileText}
        action={
          <ExportButton
            onClick={() =>
              downloadCsv(`pages-${today()}.csv`, [
                [
                  "Page",
                  "Title",
                  "Views",
                  "Visitors",
                  "Sessions",
                  "Clicks",
                  "Avg time (ms)",
                  "Entries",
                  "Exits",
                  "Bounce rate %",
                ],
                ...data.page_detail.map((p) => [
                  p.page_path,
                  p.page_title,
                  p.views,
                  p.unique_visitors,
                  p.sessions,
                  p.clicks,
                  p.avg_duration_ms,
                  p.entries,
                  p.exits,
                  p.bounce_rate,
                ]),
              ])
            }
          />
        }
      >
        <DataTable
          density={density}
          rows={data.page_detail as unknown as Record<string, unknown>[]}
          initialSortKey="views"
          maxHeight="32rem"
          searchable
          searchPlaceholder="Filter pages by path or title…"
          searchKeys={["page_path", "page_title"]}
          pageSize={15}
          rowKey={(r) => String(r.page_path)}
          columns={[
            {
              key: "page_path",
              label: "Page",
              cellClassName: "text-foreground font-medium",
              render: (r) => (
                <span title={`${r.page_path}${r.page_title ? ` — ${r.page_title}` : ""}`}>
                  {truncate(String(r.page_path), 40)}
                </span>
              ),
            },
            { key: "views", label: "Views", align: "right", cellClassName: "text-foreground" },
            { key: "unique_visitors", label: "Visitors", align: "right" },
            { key: "sessions", label: "Sessions", align: "right" },
            { key: "clicks", label: "Clicks", align: "right" },
            {
              key: "avg_duration_ms",
              label: "Avg time",
              align: "right",
              render: (r) => formatDuration(Number(r.avg_duration_ms)),
            },
            { key: "entries", label: "Entries", align: "right" },
            { key: "exits", label: "Exits", align: "right" },
            {
              key: "bounce_rate",
              label: "Bounce",
              align: "right",
              render: (r) => <BounceCell value={r.bounce_rate as number | null} />,
            },
          ]}
        />
      </SectionCard>

      <div className="grid gap-5 lg:grid-cols-3">
        <SectionCard title="Top pages" subtitle="Query strings stripped." icon={FileText}>
          <RankedList
            items={data.top_pages_clean
              .slice(0, 10)
              .map((p) => ({ label: p.page_path, value: p.views, sub: `${p.unique_visitors} visitors` }))}
          />
        </SectionCard>
        <SectionCard title="Landing pages" subtitle="First page of a session." icon={ArrowDownToLine}>
          <RankedList items={data.entry_pages.map((p) => ({ label: p.page_path, value: p.count }))} />
        </SectionCard>
        <SectionCard title="Exit pages" subtitle="Last page of a session." icon={ArrowUpFromLine}>
          <RankedList items={data.exit_pages.map((p) => ({ label: p.page_path, value: p.count }))} />
        </SectionCard>
      </div>

      <SectionCard
        title="Longest average time on page"
        subtitle="Heartbeat-derived, so an idle open tab inflates these figures."
        icon={Clock}
      >
        <RankedList
          items={data.avg_time_on_page.map((p) => ({
            label: p.page_path,
            value: p.avg_duration_ms,
            sub: `${p.sessions} sessions`,
          }))}
          formatValue={formatDuration}
        />
      </SectionCard>
    </div>
  );
}

/** Colours a bounce rate by severity so the table scans at a glance. */
function BounceCell({ value }: { value: number | null }) {
  if (value === null) return <span className="text-muted-foreground">—</span>;
  const tone =
    value >= 70
      ? "text-red-600 dark:text-red-400"
      : value >= 50
        ? "text-amber-600 dark:text-amber-400"
        : "text-emerald-600 dark:text-emerald-400";
  return <span className={`font-medium ${tone}`}>{value}%</span>;
}

/* -------------------------------------------------------------------------- */
/*  Interaction                                                               */
/* -------------------------------------------------------------------------- */

export function InteractionPanel({ data, density }: PanelProps) {
  return (
    <div className="grid gap-5 lg:grid-cols-3">
      <SectionCard
        title="Most clicked elements"
        subtitle="The closest thing available to CTA performance."
        icon={MousePointerClick}
        className="lg:col-span-2"
        action={
          <ExportButton
            onClick={() =>
              downloadCsv(`clicks-${today()}.csv`, [
                ["Label", "Selector", "Clicks", "Sessions", "Last seen on"],
                ...data.top_clicks.map((c) => [c.label, c.element_selector, c.count, c.sessions, c.page_path]),
              ])
            }
          />
        }
      >
        <DataTable
          density={density}
          rows={data.top_clicks as unknown as Record<string, unknown>[]}
          initialSortKey="count"
          maxHeight="28rem"
          searchable
          searchPlaceholder="Filter by label, selector or page…"
          searchKeys={["label", "element_selector", "page_path"]}
          columns={[
            {
              key: "label",
              label: "Element",
              cellClassName: "text-foreground font-medium",
              render: (r) => <span title={String(r.label)}>{truncate(String(r.label), 38)}</span>,
            },
            {
              key: "element_selector",
              label: "Selector",
              render: (r) => (
                <span className="font-mono text-[11px]" title={String(r.element_selector ?? "")}>
                  {truncate(String(r.element_selector ?? "—"), 26)}
                </span>
              ),
            },
            {
              key: "page_path",
              label: "Page",
              render: (r) => <span title={String(r.page_path)}>{truncate(String(r.page_path), 22)}</span>,
            },
            { key: "count", label: "Clicks", align: "right", cellClassName: "text-foreground" },
            { key: "sessions", label: "Sessions", align: "right" },
          ]}
        />
      </SectionCard>

      <div className="space-y-5">
        <SectionCard title="Event mix" subtitle="What the tracker is recording." icon={Activity}>
          <RankedList items={data.event_mix.map((e) => ({ label: e.event_type, value: e.count }))} />
        </SectionCard>
        <SectionCard title="Engagement" icon={Target}>
          <dl className="space-y-3 text-[13px]">
            {[
              ["Pages per session", String(data.engagement.pages_per_session)],
              ["Clicks per session", String(data.engagement.clicks_per_session)],
              ["Engaged sessions", data.engagement.engaged_sessions.toLocaleString()],
              ["Bounce rate", `${data.engagement.bounce_rate}%`],
              ["Median session", formatDuration(data.engagement.median_session_duration_ms)],
            ].map(([k, v]) => (
              <div key={k} className="flex items-center justify-between border-b border-border/40 pb-2 last:border-0 last:pb-0">
                <dt className="text-muted-foreground">{k}</dt>
                <dd className="font-semibold tabular-nums text-foreground">{v}</dd>
              </div>
            ))}
          </dl>
        </SectionCard>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Audience                                                                  */
/* -------------------------------------------------------------------------- */

export function AudiencePanel({ data }: PanelProps) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <SectionCard title="Devices" icon={Monitor}>
        <Donut data={data.device_breakdown as unknown as Record<string, unknown>[]} nameKey="device_type" label="device" />
      </SectionCard>
      <SectionCard title="Browsers" icon={Monitor}>
        <Donut data={data.browser_breakdown as unknown as Record<string, unknown>[]} nameKey="browser" label="browser" />
      </SectionCard>
      <SectionCard title="Operating systems" icon={Monitor}>
        <Donut data={data.os_breakdown as unknown as Record<string, unknown>[]} nameKey="os" label="OS" />
      </SectionCard>
      <SectionCard title="New vs repeat" subtitle="Based on lifetime visit count." icon={Repeat}>
        <Donut data={data.visitor_mix as unknown as Record<string, unknown>[]} nameKey="label" label="visitor" />
      </SectionCard>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Visitors                                                                  */
/* -------------------------------------------------------------------------- */

export function VisitorsPanel({ data, density, rangeLabel, includeBots }: PanelProps) {
  const rows = useMemo(
    () => (includeBots ? data.visitor_detail : data.visitor_detail.filter((v) => !v.is_bot)),
    [data.visitor_detail, includeBots],
  );

  const columns: Column<Record<string, unknown>>[] = [
    {
      key: "visitor_ref",
      label: "Visitor",
      cellClassName: "text-foreground",
      render: (r) => (
        <span className="inline-flex items-center gap-1.5">
          {r.is_bot ? <Bot className="h-3 w-3 shrink-0 text-muted-foreground" /> : null}
          <MonoRef value={String(r.visitor_ref)} />
        </span>
      ),
    },
    { key: "page_views", label: "Views", align: "right", cellClassName: "text-foreground" },
    { key: "sessions", label: "Sessions", align: "right" },
    { key: "clicks", label: "Clicks", align: "right" },
    { key: "visit_count", label: "Lifetime", align: "right" },
    { key: "dur_ms", label: "Time", align: "right", render: (r) => formatDuration(Number(r.dur_ms)) },
    {
      key: "last_page",
      label: "Last page",
      render: (r) => <span title={String(r.last_page ?? "")}>{truncate(r.last_page as string, 22)}</span>,
    },
    { key: "device_type", label: "Device" },
    { key: "browser", label: "Browser" },
    { key: "os", label: "OS" },
    {
      key: "last_seen",
      label: "Last seen",
      align: "right",
      sortValue: (r) => new Date(String(r.last_seen)).getTime(),
      render: (r) => formatDateTime(String(r.last_seen)),
    },
  ];

  return (
    <SectionCard
      title="Visitors"
      subtitle={`Activity within ${rangeLabel}. Lifetime is the all-time visit count.${
        includeBots ? "" : " Bots hidden."
      }`}
      icon={Users}
      action={
        <ExportButton
          onClick={() =>
            downloadCsv(`visitors-${today()}.csv`, [
              [
                "Visitor",
                "First seen",
                "Last seen",
                "Lifetime visits",
                "Sessions",
                "Page views",
                "Clicks",
                "Time (ms)",
                "Last page",
                "Device",
                "Browser",
                "OS",
                "Bot",
              ],
              ...(rows as VisitorRow[]).map((v) => [
                v.visitor_ref,
                v.first_seen,
                v.last_seen,
                v.visit_count,
                v.sessions,
                v.page_views,
                v.clicks,
                v.dur_ms,
                v.last_page,
                v.device_type,
                v.browser,
                v.os,
                v.is_bot ? "yes" : "no",
              ]),
            ])
          }
        />
      }
    >
      <DataTable
        density={density}
        rows={rows as unknown as Record<string, unknown>[]}
        columns={columns}
        initialSortKey="page_views"
        maxHeight="34rem"
        searchable
        searchPlaceholder="Filter visitors by device, browser, OS or last page…"
        searchKeys={["visitor_ref", "device_type", "browser", "os", "last_page"]}
        pageSize={15}
        rowKey={(r) => String(r.visitor_ref)}
      />
    </SectionCard>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sessions                                                                  */
/* -------------------------------------------------------------------------- */

export function SessionsPanel({ data, density, rangeLabel, includeBots }: PanelProps) {
  const rows = useMemo(
    () => (includeBots ? data.recent_sessions : data.recent_sessions.filter((s) => !s.is_bot)),
    [data.recent_sessions, includeBots],
  );

  return (
    <SectionCard
      title="Recent sessions"
      subtitle={`Newest 60 sessions in ${rangeLabel}.${includeBots ? "" : " Bots hidden."}`}
      icon={Layers}
      action={
        <ExportButton
          onClick={() =>
            downloadCsv(`sessions-${today()}.csv`, [
              [
                "Session",
                "Started",
                "Ended",
                "Page views",
                "Distinct pages",
                "Clicks",
                "Duration (ms)",
                "Entry",
                "Exit",
                "Channel",
                "Device",
                "Browser",
                "OS",
                "Bot",
                "Engaged",
              ],
              ...(rows as SessionRow[]).map((s) => [
                s.session_ref,
                s.started_at,
                s.ended_at,
                s.page_views,
                s.distinct_pages,
                s.clicks,
                s.dur_ms,
                s.entry_page,
                s.exit_page,
                s.channel,
                s.device_type,
                s.browser,
                s.os,
                s.is_bot ? "yes" : "no",
                s.is_engaged ? "yes" : "no",
              ]),
            ])
          }
        />
      }
    >
      <DataTable
        density={density}
        rows={rows as unknown as Record<string, unknown>[]}
        initialSortKey="started_at"
        maxHeight="34rem"
        searchable
        searchPlaceholder="Filter sessions by channel, device or page…"
        searchKeys={["session_ref", "channel", "device_type", "browser", "os", "entry_page", "exit_page"]}
        pageSize={15}
        rowKey={(r, i) => `${r.session_ref}-${i}`}
        columns={[
          {
            key: "session_ref",
            label: "Session",
            cellClassName: "text-foreground",
            render: (r) => (
              <span className="inline-flex items-center gap-1.5">
                {r.is_bot ? <Bot className="h-3 w-3 shrink-0 text-muted-foreground" /> : null}
                <MonoRef value={String(r.session_ref)} />
              </span>
            ),
          },
          {
            key: "started_at",
            label: "Started",
            sortValue: (r) => new Date(String(r.started_at)).getTime(),
            render: (r) => formatDateTime(String(r.started_at)),
          },
          { key: "page_views", label: "Views", align: "right", cellClassName: "text-foreground" },
          { key: "distinct_pages", label: "Unique", align: "right" },
          { key: "clicks", label: "Clicks", align: "right" },
          { key: "dur_ms", label: "Duration", align: "right", render: (r) => formatDuration(Number(r.dur_ms)) },
          {
            key: "entry_page",
            label: "Entry",
            render: (r) => <span title={String(r.entry_page ?? "")}>{truncate(r.entry_page as string, 18)}</span>,
          },
          {
            key: "exit_page",
            label: "Exit",
            render: (r) => <span title={String(r.exit_page ?? "")}>{truncate(r.exit_page as string, 18)}</span>,
          },
          { key: "channel", label: "Channel", render: (r) => <Chip>{String(r.channel)}</Chip> },
          { key: "device_type", label: "Device" },
          {
            key: "is_engaged",
            label: "Engaged",
            align: "right",
            render: (r) =>
              r.is_engaged ? (
                <CheckCircle2 className="ml-auto h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
              ) : (
                <span className="text-muted-foreground">—</span>
              ),
          },
        ]}
      />
    </SectionCard>
  );
}

/* -------------------------------------------------------------------------- */
/*  Crawlers                                                                  */
/* -------------------------------------------------------------------------- */

export function CrawlersPanel({ data, density }: PanelProps) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      <SectionCard
        title="Crawlers"
        subtitle="Confirms search and AI bots are actually reaching your pages."
        icon={Bot}
      >
        <DataTable
          density={density}
          rows={data.bot_breakdown as unknown as Record<string, unknown>[]}
          initialSortKey="page_views"
          maxHeight="24rem"
          emptyLabel="No crawler traffic in this range."
          rowKey={(r) => String(r.bot)}
          columns={[
            { key: "bot", label: "Crawler", cellClassName: "text-foreground font-medium" },
            { key: "page_views", label: "Views", align: "right", cellClassName: "text-foreground" },
            { key: "visitors", label: "Identities", align: "right" },
            {
              key: "last_seen",
              label: "Last seen",
              align: "right",
              sortValue: (r) => new Date(String(r.last_seen)).getTime(),
              render: (r) => formatDateTime(String(r.last_seen)),
            },
          ]}
        />
      </SectionCard>

      <div className="space-y-5">
        <SectionCard title="Human vs bot" subtitle="Sessions in this range." icon={Users}>
          <RankedList
            items={[
              { label: "Human sessions", value: data.engagement.human_sessions },
              { label: "Bot sessions", value: data.engagement.bot_sessions },
            ]}
          />
        </SectionCard>
        <SectionCard title="All-time identities" icon={Users}>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">Humans</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">
                {data.totals.human_visitors.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">Bots</p>
              <p className="mt-1 text-2xl font-semibold tabular-nums tracking-tight">
                {data.totals.bot_visitors.toLocaleString()}
              </p>
            </div>
          </div>
          <p className="mt-4 border-t border-border/50 pt-3 text-[11.5px] leading-relaxed text-muted-foreground">
            Bot identities outnumbering humans is normal for a public site — crawlers rarely reuse a device id, so each
            visit tends to create a fresh row.
          </p>
        </SectionCard>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Leads                                                                     */
/* -------------------------------------------------------------------------- */

export function LeadsPanel({ data, density, rangeLabel }: PanelProps) {
  const noLeads = data.leads.by_day.every((d) => d.count === 0);

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard
          icon={Inbox}
          label="Leads"
          value={data.period.leads}
          current={data.period.leads}
          prev={data.period.prev_leads}
          trend={data.leads.by_day.map((d) => d.count)}
          hint={`${data.totals.leads} all time`}
          accent
        />
        <StatCard
          icon={Target}
          label="Conversion Rate"
          value={data.leads.conversion_rate}
          suffix="%"
          hint="leads ÷ sessions"
        />
        <StatCard icon={CalendarClock} label="Calls Booked" value={data.leads.booked} />
        <StatCard
          icon={Layers}
          label="Sessions"
          value={data.period.sessions}
          hint="the conversion denominator"
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <SectionCard title="By capture surface" icon={Inbox}>
          <RankedList
            items={data.leads.by_kind.map((k) => ({ label: k.kind, value: k.count }))}
            emptyLabel="No leads yet."
          />
        </SectionCard>
        <SectionCard title="By status" icon={List}>
          <RankedList
            items={data.leads.by_status.map((s) => ({ label: s.status, value: s.count }))}
            emptyLabel="No leads yet."
          />
        </SectionCard>
        <SectionCard title="By source" icon={Compass}>
          <RankedList
            items={data.leads.by_source.map((s) => ({ label: s.source, value: s.count }))}
            emptyLabel="No leads yet."
          />
        </SectionCard>
        <SectionCard title="Chat funnel" subtitle="Where each chat lead stalled." icon={TrendingDown}>
          <RankedList
            items={data.leads.chat_funnel.map((f) => ({
              label: f.step,
              value: f.count,
              sub: f.booked > 0 ? `${f.booked} booked` : undefined,
            }))}
            emptyLabel="No chat conversations captured yet."
          />
        </SectionCard>
      </div>

      <SectionCard title={`Leads — ${rangeLabel}`} icon={Activity}>
        {noLeads ? (
          <EmptyState label="No leads captured in this range yet. The chat agent, agency enquiry form and contact form all write here." />
        ) : (
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.leads.by_day} margin={{ left: -18, top: 8 }}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" vertical={false} />
                <XAxis
                  dataKey="day"
                  tick={AXIS_TICK}
                  axisLine={false}
                  tickLine={false}
                  tickMargin={8}
                  tickFormatter={formatDayLabel}
                />
                <YAxis tick={AXIS_TICK} allowDecimals={false} axisLine={false} tickLine={false} width={40} />
                <Tooltip contentStyle={TOOLTIP_STYLE} labelFormatter={(v) => formatDayLabel(String(v))} />
                <Bar dataKey="count" name="Leads" fill={ACCENT} radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </SectionCard>

      <SectionCard
        title="Recent leads"
        subtitle="Chat agent, agency enquiries and contact form in one stream."
        icon={Inbox}
        action={
          <ExportButton
            onClick={() =>
              downloadCsv(`leads-${today()}.csv`, [
                [
                  "Created",
                  "Surface",
                  "Name",
                  "Email",
                  "Phone",
                  "Business",
                  "Industry",
                  "Detail",
                  "Budget",
                  "Timeframe",
                  "Status",
                  "Step",
                  "Booked",
                  "Page",
                  "Source",
                ],
                ...data.leads.recent.map((l: LeadRow) => [
                  l.created_at,
                  l.kind,
                  l.name,
                  l.email,
                  l.phone,
                  l.business_name,
                  l.industry,
                  l.detail,
                  l.budget_range,
                  l.start_timeframe,
                  l.status,
                  l.step,
                  l.booked ? "yes" : "no",
                  l.page_path,
                  l.source,
                ]),
              ])
            }
          />
        }
      >
        <DataTable
          density={density}
          rows={data.leads.recent as unknown as Record<string, unknown>[]}
          initialSortKey="created_at"
          maxHeight="32rem"
          searchable
          searchPlaceholder="Filter leads by name, email, business or detail…"
          searchKeys={["name", "email", "business_name", "detail", "status", "source"]}
          pageSize={15}
          emptyLabel="No leads captured yet. Once the chat agent or a form captures someone, they appear here."
          columns={[
            {
              key: "created_at",
              label: "When",
              sortValue: (r) => new Date(String(r.created_at)).getTime(),
              render: (r) => formatDateTime(String(r.created_at)),
            },
            { key: "kind", label: "Surface", render: (r) => <Chip>{String(r.kind)}</Chip> },
            { key: "name", label: "Name", cellClassName: "text-foreground font-medium" },
            {
              key: "email",
              label: "Email",
              render: (r) =>
                r.email ? (
                  <a
                    className="underline-offset-2 hover:text-foreground hover:underline"
                    href={`mailto:${r.email}`}
                  >
                    {String(r.email)}
                  </a>
                ) : (
                  "—"
                ),
            },
            { key: "phone", label: "Phone" },
            { key: "business_name", label: "Business" },
            {
              key: "detail",
              label: "Detail",
              render: (r) => (
                <span className="italic" title={String(r.detail ?? "")}>
                  {truncate(r.detail as string, 40)}
                </span>
              ),
            },
            { key: "budget_range", label: "Budget" },
            { key: "status", label: "Status", render: (r) => (r.status ? <Chip>{String(r.status)}</Chip> : "—") },
            {
              key: "booked",
              label: "Booked",
              align: "right",
              render: (r) =>
                r.booked ? (
                  <CheckCircle2 className="ml-auto h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <span className="text-muted-foreground">—</span>
                ),
            },
          ]}
        />
      </SectionCard>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Raw event feed                                                            */
/* -------------------------------------------------------------------------- */

const ACTIVITY_FILTERS = [
  { value: "all", label: "All" },
  { value: "page_view", label: "Views" },
  { value: "click", label: "Clicks" },
  { value: "heartbeat", label: "Heartbeats" },
  { value: "page_exit", label: "Exits" },
  { value: "bot", label: "Bots" },
  { value: "human", label: "Humans" },
] as const;

export function FeedPanel({ data, density }: PanelProps) {
  const [filter, setFilter] = useState<string>("all");

  const rows = useMemo(() => {
    let r: ActivityRow[] = data.recent_activity;
    if (filter === "bot") r = r.filter((a) => a.is_bot);
    else if (filter === "human") r = r.filter((a) => !a.is_bot);
    else if (filter !== "all") r = r.filter((a) => a.event_type === filter);
    return r;
  }, [data.recent_activity, filter]);

  return (
    <SectionCard
      title="Event feed"
      subtitle={`Newest 250 events. Showing ${rows.length}.`}
      icon={List}
      action={
        <div className="flex flex-wrap items-center justify-end gap-2">
          <Segmented<string>
            options={ACTIVITY_FILTERS.map((f) => ({ value: f.value as string, label: f.label }))}
            value={filter}
            onChange={setFilter}
            size="xs"
          />
          <ExportButton
            onClick={() =>
              downloadCsv(`activity-${today()}.csv`, [
                [
                  "Time",
                  "Event",
                  "Page",
                  "Title",
                  "Detail",
                  "Selector",
                  "Duration (ms)",
                  "Referrer",
                  "Session",
                  "Visitor",
                  "Bot",
                  "Browser",
                  "Device",
                  "OS",
                ],
                ...rows.map((a) => [
                  a.created_at,
                  a.event_type,
                  a.page_path,
                  a.page_title,
                  a.element_text,
                  a.element_selector,
                  a.duration_ms,
                  a.referrer,
                  a.session_ref,
                  a.visitor_ref,
                  a.is_bot ? "yes" : "no",
                  a.browser,
                  a.device_type,
                  a.os,
                ]),
              ])
            }
          />
        </div>
      }
    >
      <DataTable
        density={density}
        rows={rows as unknown as Record<string, unknown>[]}
        initialSortKey="created_at"
        maxHeight="36rem"
        searchable
        searchPlaceholder="Search path, label, selector, referrer, session or visitor…"
        searchKeys={[
          "page_path",
          "element_text",
          "element_selector",
          "referrer",
          "browser",
          "os",
          "session_ref",
          "visitor_ref",
        ]}
        pageSize={25}
        emptyLabel="No matching activity."
        columns={[
          {
            key: "created_at",
            label: "Time",
            sortValue: (r) => new Date(String(r.created_at)).getTime(),
            render: (r) => formatDateTime(String(r.created_at)),
          },
          { key: "event_type", label: "Event", render: (r) => <Chip>{String(r.event_type)}</Chip> },
          {
            key: "page_path",
            label: "Page",
            cellClassName: "text-foreground",
            render: (r) => <span title={String(r.page_path)}>{truncate(String(r.page_path), 26)}</span>,
          },
          {
            key: "element_text",
            label: "Detail",
            render: (r) => (
              <span className="italic" title={String(r.element_text ?? "")}>
                {truncate(r.element_text as string, 28)}
              </span>
            ),
          },
          {
            key: "duration_ms",
            label: "Dwell",
            align: "right",
            render: (r) => (r.duration_ms ? formatDuration(Number(r.duration_ms)) : "—"),
          },
          {
            key: "referrer",
            label: "Referrer",
            render: (r) => (
              <span title={String(r.referrer ?? "")}>
                {r.referrer ? truncate(hostOf(String(r.referrer)), 20) : "—"}
              </span>
            ),
          },
          { key: "session_ref", label: "Session", render: (r) => <MonoRef value={r.session_ref as string} /> },
          { key: "visitor_ref", label: "Visitor", render: (r) => <MonoRef value={r.visitor_ref as string} /> },
          {
            key: "browser",
            label: "Source",
            align: "right",
            render: (r) => <BotBadge isBot={Boolean(r.is_bot)} fallback={r.browser as string} />,
          },
        ]}
      />
    </SectionCard>
  );
}

/* -------------------------------------------------------------------------- */
/*  Insights tab (full list)                                                  */
/* -------------------------------------------------------------------------- */

export function InsightsPanel({ data }: PanelProps) {
  const insights = useMemo(() => buildInsights(data), [data]);
  return (
    <SectionCard
      title="What stands out"
      subtitle="Triaged worst-first. Every observation is a direct reading of this range's numbers — no modelling or forecasting — and carries the sample, window and caveats it came from."
      icon={Info}
    >
      <InsightList insights={insights} rangeDays={data.range_days} />
    </SectionCard>
  );
}
