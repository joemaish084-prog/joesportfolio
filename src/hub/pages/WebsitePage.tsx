import { useMemo, useState, type ReactNode } from "react";
import { Eye, Globe, Inbox, MousePointerClick, RefreshCw, Timer, Users, type LucideIcon } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { buildInsights } from "@/components/admin/insights";
import { BlurFade } from "../components/motion/blur-fade";
import { NumberTicker } from "../components/motion/number-ticker";
import { EmptyState, PageHeader, SkeletonBlock } from "../components/ui";
import {
  Change,
  InsightsBoard,
  Panel,
  RankedList,
  TrafficChart,
  VisitHeatmap,
  WebsiteLeads,
} from "../components/website/WebsiteParts";
import { useRows } from "../lib/data";
import { RANGE_DAYS, formatMs, pageName, pctChange, useSiteAnalytics, type RangeDays } from "../lib/website";

const RANGE_KEY = "hub:website-range";

function readRange(): RangeDays {
  try {
    const n = Number(localStorage.getItem(RANGE_KEY));
    return (RANGE_DAYS as readonly number[]).includes(n) ? (n as RangeDays) : 14;
  } catch {
    return 14;
  }
}

function Tile({
  label,
  icon: Icon,
  children,
  footer,
}: {
  label: string;
  icon: LucideIcon;
  children: ReactNode;
  footer: ReactNode;
}) {
  return (
    <div className="hub-card flex flex-col p-4 md:p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="hub-label">{label}</span>
        <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-tint text-on-tint">
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <div className="hub-tabular mt-2 text-[1.625rem] font-bold leading-tight tracking-tight md:text-[1.875rem]">
        {children}
      </div>
      <div className="mt-1 min-h-4">{footer}</div>
    </div>
  );
}

export default function WebsitePage() {
  const [days, setDays] = useState<RangeDays>(readRange);
  const site = useSiteAnalytics(days);
  const leads = useRows("leads", "position", true);

  const changeRange = (v: string) => {
    const n = Number(v) as RangeDays;
    if (!n) return;
    setDays(n);
    try {
      localStorage.setItem(RANGE_KEY, String(n));
    } catch {
      // just this visit
    }
  };

  const data = site.data?.status === "ok" ? site.data.data : null;
  const insights = useMemo(() => (data ? buildInsights(data) : []), [data]);

  const p = data?.period;
  const conversion = p && p.visitors ? (p.leads / p.visitors) * 100 : 0;
  const prevConversion = p && p.prev_visitors ? (p.prev_leads / p.prev_visitors) * 100 : 0;

  return (
    <>
      <BlurFade>
        <PageHeader
          title="Website"
          subtitle="Who's visiting josephmaina.co.ke, what they look at, and who gets in touch."
          actions={
            <>
              <ToggleGroup
                type="single"
                value={String(days)}
                onValueChange={changeRange}
                className="rounded-xl bg-secondary p-1"
              >
                {RANGE_DAYS.map((d) => (
                  <ToggleGroupItem
                    key={d}
                    value={String(d)}
                    className="h-8 rounded-lg px-3 text-xs data-[state=on]:bg-card data-[state=on]:shadow-hub"
                    aria-label={`Last ${d} days`}
                  >
                    {d}d
                  </ToggleGroupItem>
                ))}
              </ToggleGroup>
              <Button
                variant="secondary"
                size="icon"
                className="h-10 w-10 rounded-xl bg-card shadow-hub"
                onClick={() => site.refetch()}
                aria-label="Refresh"
              >
                <RefreshCw className={cn("h-4 w-4", site.isFetching && "animate-spin")} />
              </Button>
            </>
          }
        />
      </BlurFade>

      {site.isError && (
        <p className="mb-6 rounded-2xl bg-destructive/10 px-4 py-3 text-sm text-destructive">
          Couldn't load website stats: {(site.error as Error).message}
        </p>
      )}

      {site.data?.status === "missing" ? (
        <div className="hub-card">
          <EmptyState
            icon={Globe}
            title="Website stats aren't connected yet"
            description="One database update connects your site analytics to the hub. Ask Claude to apply the hub_site_analytics migration."
          />
        </div>
      ) : (
        <>
          <BlurFade delay={0.04} className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {!p ? (
              [0, 1, 2, 3].map((i) => <SkeletonBlock key={i} className="h-28 rounded-[20px]" />)
            ) : (
              <>
                <Tile label="Visitors" icon={Users} footer={<Change value={pctChange(p.visitors, p.prev_visitors)} />}>
                  <NumberTicker value={p.visitors} />
                </Tile>
                <Tile label="Page views" icon={Eye} footer={<Change value={pctChange(p.page_views, p.prev_page_views)} />}>
                  <NumberTicker value={p.page_views} />
                </Tile>
                <Tile label="Enquiries" icon={Inbox} footer={<Change value={pctChange(p.leads, p.prev_leads)} />}>
                  <NumberTicker value={p.leads} />
                </Tile>
                <Tile
                  label="Visitors who enquire"
                  icon={MousePointerClick}
                  footer={
                    <Change
                      value={prevConversion ? Math.round(((conversion - prevConversion) / prevConversion) * 100) : null}
                    />
                  }
                >
                  {conversion.toFixed(1)}%
                </Tile>
              </>
            )}
          </BlurFade>

          <BlurFade delay={0.08} className="mt-4 grid gap-4 lg:grid-cols-3">
            <Panel
              title="Traffic"
              hint={`Visitors and page views per day, last ${days} days.`}
              className="lg:col-span-2"
            >
              {!data ? <SkeletonBlock className="h-72" /> : <TrafficChart data={data} />}
            </Panel>
            <Panel title="How visits go" hint="Quality of an average visit.">
              {!data ? (
                <SkeletonBlock className="h-72" />
              ) : (
                <dl className="grid grid-cols-2 gap-3">
                  {[
                    { label: "Avg. visit", value: formatMs(data.engagement.avg_session_duration_ms), icon: Timer },
                    { label: "Pages per visit", value: data.engagement.pages_per_session.toFixed(1), icon: Eye },
                    { label: "Left after 1 page", value: `${Math.round(data.engagement.bounce_rate)}%`, icon: MousePointerClick },
                    { label: "Came back", value: data.engagement.repeat_visitors.toLocaleString(), icon: Users },
                  ].map((s) => (
                    <div key={s.label} className="rounded-2xl bg-secondary/60 p-3.5">
                      <s.icon className="mb-2 h-4 w-4 text-muted-foreground" />
                      <dd className="hub-tabular text-xl font-bold tracking-tight">{s.value}</dd>
                      <dt className="text-xs text-muted-foreground">{s.label}</dt>
                    </div>
                  ))}
                  <div className="col-span-2 mt-1">
                    <p className="mb-2 text-xs font-semibold text-muted-foreground">Devices</p>
                    <RankedList
                      empty="No visits yet."
                      rows={data.device_breakdown
                        .slice(0, 3)
                        .map((d) => ({ key: d.device_type, label: d.device_type || "Unknown", value: d.count }))}
                    />
                  </div>
                </dl>
              )}
            </Panel>
          </BlurFade>

          <BlurFade delay={0.12} className="mt-4">
            <Panel title="Insights" hint="What the numbers are saying, most important first, with one thing to try for each.">
              {!data ? <SkeletonBlock className="h-48" /> : <InsightsBoard insights={insights} />}
            </Panel>
          </BlurFade>

          <BlurFade delay={0.16} className="mt-4 grid gap-4 lg:grid-cols-3">
            <Panel title="When people visit" hint="Page views by day and hour." className="lg:col-span-2">
              {!data ? <SkeletonBlock className="h-48" /> : <VisitHeatmap data={data} />}
            </Panel>
            <Panel title="Where they come from" hint="Visits by source.">
              {!data ? (
                <SkeletonBlock className="h-48" />
              ) : (
                <RankedList
                  empty="No visits yet."
                  rows={data.channels
                    .slice(0, 6)
                    .map((c) => ({ key: c.channel, label: c.channel, value: c.sessions, sub: "visits" }))}
                />
              )}
            </Panel>
          </BlurFade>

          <BlurFade delay={0.2} className="mt-4 grid gap-4 lg:grid-cols-3">
            <Panel title="Top pages" hint="Most viewed, with average time spent.">
              {!data ? (
                <SkeletonBlock className="h-48" />
              ) : (
                <RankedList
                  empty="No page views yet."
                  rows={[...data.page_detail]
                    .sort((a, b) => b.views - a.views)
                    .slice(0, 6)
                    .map((pg) => ({
                      key: pg.page_path,
                      label: pageName(pg.page_path),
                      value: pg.views,
                      sub: formatMs(pg.avg_duration_ms),
                    }))}
                />
              )}
            </Panel>
            <Panel
              title="Website enquiries"
              hint="People who got in touch. Add the good ones to your pipeline."
              className="lg:col-span-2"
            >
              {!data ? <SkeletonBlock className="h-48" /> : <WebsiteLeads rows={data.leads.recent} leads={leads.data} />}
            </Panel>
          </BlurFade>
        </>
      )}
    </>
  );
}
