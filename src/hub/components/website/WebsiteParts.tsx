import { useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Area, CartesianGrid, ComposedChart, Line, XAxis, YAxis } from "recharts";
import { format, formatDistanceToNowStrict, parseISO } from "date-fns";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  Check,
  ChevronDown,
  Lightbulb,
  Mail,
  MessageCircle,
  Minus,
  Phone,
  Plus,
  Sparkles,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import type { AnalyticsData, LeadRow } from "@/components/admin/types";
import type { Insight, InsightPriority, InsightTone } from "@/components/admin/insights";
import type { Lead } from "../../lib/types";
import { matchingLead, useAddToPipeline } from "../../lib/website";

const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const compact = new Intl.NumberFormat("en-KE", { notation: "compact", maximumFractionDigits: 1 });

// ---------------------------------------------------------------- shared

export function Panel({
  title,
  hint,
  action,
  children,
  className,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("hub-card flex min-w-0 flex-col p-5", className)}>
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="font-semibold leading-snug">{title}</h2>
          {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
        </div>
        {action}
      </header>
      <div className="flex-1">{children}</div>
    </section>
  );
}

export function Change({ value, label = "vs previous period" }: { value: number | null; label?: string }) {
  if (value === null) return <span className="text-xs text-muted-foreground">New this period</span>;
  if (value === 0)
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Minus className="h-3.5 w-3.5" /> Same as before
      </span>
    );
  const Icon = value > 0 ? ArrowUpRight : ArrowDownRight;
  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground">
      <Icon className={cn("h-3.5 w-3.5", value > 0 ? "text-primary" : "text-warning")} />
      <span className="font-medium text-foreground">
        {value > 0 ? "+" : "−"}
        {Math.abs(value)}%
      </span>
      {label}
    </span>
  );
}

/** Ranked bars in one colour, value written on each row. */
export function RankedList({
  rows,
  unit,
  empty,
}: {
  rows: { key: string; label: string; value: number; sub?: string }[];
  unit?: string;
  empty: string;
}) {
  if (!rows.length) return <p className="py-6 text-center text-sm text-muted-foreground">{empty}</p>;
  const max = Math.max(1, ...rows.map((r) => r.value));
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.key} title={`${r.label}: ${r.value.toLocaleString()}${unit ? " " + unit : ""}`}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate">{r.label}</span>
            <span className="hub-tabular shrink-0 text-muted-foreground">
              <span className="font-medium text-foreground">{r.value.toLocaleString()}</span>
              {r.sub && ` · ${r.sub}`}
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full"
              style={{ width: `${Math.max(2, (r.value / max) * 100)}%`, background: "var(--chart-in)" }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

// ---------------------------------------------------------------- traffic

const trafficConfig = {
  visitors: { label: "Visitors", color: "var(--chart-in)" },
  views: { label: "Page views", color: "var(--chart-out)" },
} satisfies ChartConfig;

export function TrafficChart({ data }: { data: AnalyticsData }) {
  const leadsByDay = useMemo(() => new Map(data.leads.by_day.map((d) => [d.day.slice(0, 10), d.count])), [data]);
  const points = data.visits_by_day.map((d) => ({
    day: d.day.slice(0, 10),
    label: format(parseISO(d.day.slice(0, 10)), data.visits_by_day.length > 31 ? "d MMM" : "EEE d"),
    visitors: d.unique_visitors,
    views: d.page_views,
    leads: leadsByDay.get(d.day.slice(0, 10)) ?? 0,
  }));
  const best = points.reduce((a, b) => (b.visitors > a.visitors ? b : a), points[0] ?? null);

  if (!points.length) return <p className="py-16 text-center text-sm text-muted-foreground">No visits in this range yet.</p>;

  return (
    <div>
      <ChartContainer config={trafficConfig} className="aspect-auto h-72 w-full">
        <ComposedChart data={points} margin={{ top: 12, right: 8, bottom: 0, left: 0 }}>
          <defs>
            <linearGradient id="site-visitors" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--chart-in)" stopOpacity={0.32} />
              <stop offset="100%" stopColor="var(--chart-in)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            fontSize={11}
            minTickGap={16}
          />
          <YAxis
            tickLine={false}
            axisLine={false}
            width={36}
            fontSize={11}
            allowDecimals={false}
            tickFormatter={(v: number) => compact.format(v)}
          />
          <ChartTooltip
            cursor={{ stroke: "hsl(var(--muted-foreground))", strokeWidth: 1, strokeDasharray: "3 3" }}
            content={({ active, payload }) => {
              const p = payload?.[0]?.payload as (typeof points)[number] | undefined;
              return active && p ? (
                <div className="min-w-40 rounded-xl border border-border/70 bg-popover px-3 py-2 text-xs shadow-hub-lg">
                  <p className="mb-1.5 font-medium">{format(parseISO(p.day), "EEEE d MMM")}</p>
                  {(["visitors", "views"] as const).map((k) => (
                    <div key={k} className="flex items-center justify-between gap-4 py-0.5">
                      <span className="flex items-center gap-1.5 text-muted-foreground">
                        <span className="h-2.5 w-2.5 rounded-sm" style={{ background: trafficConfig[k].color }} />
                        {trafficConfig[k].label}
                      </span>
                      <span className="hub-tabular font-medium">{p[k].toLocaleString()}</span>
                    </div>
                  ))}
                  {p.leads > 0 && (
                    <p className="mt-1.5 border-t border-border/60 pt-1.5 font-medium text-on-tint">
                      {p.leads} {p.leads === 1 ? "enquiry" : "enquiries"} this day
                    </p>
                  )}
                </div>
              ) : null;
            }}
          />
          <Area
            dataKey="visitors"
            type="monotone"
            stroke="var(--color-visitors)"
            strokeWidth={2}
            fill="url(#site-visitors)"
            activeDot={{ r: 5, strokeWidth: 2, fill: "hsl(var(--card))" }}
            dot={(props: { cx?: number; cy?: number; index?: number }) => {
              const p = points[props.index ?? 0];
              // Days with an enquiry get a marker on the visitors line.
              return p?.leads ? (
                <circle
                  key={`lead-${props.index}`}
                  cx={props.cx}
                  cy={props.cy}
                  r={5}
                  fill="var(--chart-in)"
                  stroke="hsl(var(--card))"
                  strokeWidth={2}
                />
              ) : (
                <g key={`none-${props.index}`} />
              );
            }}
            isAnimationActive={!reduceMotion()}
            animationDuration={500}
          />
          <Line
            dataKey="views"
            type="monotone"
            stroke="var(--color-views)"
            strokeWidth={2}
            strokeDasharray="5 4"
            dot={false}
            activeDot={{ r: 4 }}
            isAnimationActive={!reduceMotion()}
            animationDuration={500}
          />
        </ComposedChart>
      </ChartContainer>
      <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "var(--chart-in)" }} /> Visitors
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-0.5 w-3 rounded-full" style={{ background: "var(--chart-out)" }} /> Page views
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="h-2.5 w-2.5 rounded-full ring-2 ring-card"
            style={{ background: "var(--chart-in)" }}
          />{" "}
          Day with an enquiry
        </span>
        {best && best.visitors > 0 && (
          <span>
            Best day: <span className="font-medium text-foreground">{format(parseISO(best.day), "EEE d MMM")}</span> (
            {best.visitors} visitors)
          </span>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- when people visit

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DOW_ORDER = [1, 2, 3, 4, 5, 6, 0];

export function VisitHeatmap({ data }: { data: AnalyticsData }) {
  const cells = useMemo(() => {
    const m = new Map<string, number>();
    data.activity_heatmap.forEach((c) => m.set(`${c.dow}-${c.hour}`, c.page_views));
    return m;
  }, [data]);
  const max = Math.max(1, ...data.activity_heatmap.map((c) => c.page_views));
  const peak = data.activity_heatmap.reduce<(typeof data.activity_heatmap)[number] | null>(
    (a, b) => (!a || b.page_views > a.page_views ? b : a),
    null,
  );
  // Five steps of one hue, light to dark; empty hours stay neutral.
  const step = (v: number) => (v ? Math.min(4, Math.floor((v / max) * 4.999)) : -1);
  const OPACITY = [0.18, 0.36, 0.56, 0.78, 1];

  return (
    <div>
      <div className="overflow-x-auto pb-1">
        <div className="min-w-[34rem]">
          {DOW_ORDER.map((d) => (
            <div key={d} className="flex items-center gap-[3px] py-[1.5px]">
              <span className="w-9 shrink-0 text-[0.6875rem] text-muted-foreground">{DOW[d]}</span>
              {Array.from({ length: 24 }, (_, h) => {
                const v = cells.get(`${d}-${h}`) ?? 0;
                const s = step(v);
                return (
                  <div
                    key={h}
                    title={`${DOW[d]} ${String(h).padStart(2, "0")}:00 · ${v} page ${v === 1 ? "view" : "views"}`}
                    className="h-5 flex-1 rounded-[4px] transition-transform duration-150 hover:scale-110"
                    style={{
                      background: s < 0 ? "hsl(var(--secondary))" : "var(--chart-in)",
                      opacity: s < 0 ? 1 : OPACITY[s],
                    }}
                  />
                );
              })}
            </div>
          ))}
          <div className="mt-1 flex gap-[3px] pl-9">
            {Array.from({ length: 24 }, (_, h) => (
              <span key={h} className="flex-1 text-center text-[0.625rem] text-muted-foreground">
                {h % 6 === 0 ? `${String(h).padStart(2, "0")}h` : ""}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
        <span>
          {peak && peak.page_views > 0 ? (
            <>
              Busiest: <span className="font-medium text-foreground">{DOW[peak.dow]}s around {String(peak.hour).padStart(2, "0")}:00</span>{" "}
              (Nairobi time). Post and run ads just before then.
            </>
          ) : (
            "Not enough visits yet."
          )}
        </span>
        <span className="flex items-center gap-1">
          Fewer
          {OPACITY.map((o) => (
            <span key={o} className="h-2.5 w-2.5 rounded-[3px]" style={{ background: "var(--chart-in)", opacity: o }} />
          ))}
          More
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------- insights

const TONE: Record<InsightTone, { icon: LucideIcon; chip: string; label: string }> = {
  warn: { icon: AlertTriangle, chip: "bg-warning-soft text-warning", label: "Needs action" },
  good: { icon: TrendingUp, chip: "bg-tint text-on-tint", label: "Good news" },
  info: { icon: Lightbulb, chip: "bg-secondary text-foreground", label: "Worth knowing" },
};

const PRIORITY_LABEL: Record<InsightPriority, string> = {
  critical: "Urgent",
  high: "High",
  medium: "Medium",
  low: "Low",
};

const CONFIDENCE_DOTS = { high: 3, moderate: 2, low: 1 } as const;

type Filter = "all" | InsightTone;

export function InsightsBoard({ insights }: { insights: Insight[] }) {
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  const counts = {
    all: insights.length,
    warn: insights.filter((i) => i.tone === "warn").length,
    good: insights.filter((i) => i.tone === "good").length,
    info: insights.filter((i) => i.tone === "info").length,
  };
  const shown = filter === "all" ? insights : insights.filter((i) => i.tone === filter);
  const [lead, ...rest] = shown;

  if (!insights.length)
    return (
      <p className="py-10 text-center text-sm text-muted-foreground">
        Not enough visits yet to say anything useful. Check back once more people have found the site.
      </p>
    );

  return (
    <div>
      <div className="-mx-1 mb-4 flex gap-1.5 overflow-x-auto px-1">
        {(["all", "warn", "good", "info"] as const).map((f) =>
          counts[f] || f === "all" ? (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              className={cn(
                "flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3 text-xs font-medium transition-colors duration-150",
                filter === f ? "bg-foreground text-background" : "bg-secondary text-muted-foreground hover:text-foreground",
              )}
            >
              {f === "all" ? "All" : TONE[f].label}
              <span className="hub-tabular opacity-70">{counts[f]}</span>
            </button>
          ) : null,
        )}
      </div>

      {lead && <InsightCard insight={lead} featured open={open === lead.id} onToggle={setOpen} />}
      {rest.length > 0 && (
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {(showAll ? rest : rest.slice(0, 6)).map((i) => (
            <InsightCard key={i.id} insight={i} open={open === i.id} onToggle={setOpen} />
          ))}
        </div>
      )}
      {rest.length > 6 && (
        <div className="mt-4 text-center">
          <Button variant="secondary" size="sm" className="rounded-full" onClick={() => setShowAll((s) => !s)}>
            {showAll ? "Show fewer" : `Show all ${shown.length}`}
            <ChevronDown className={cn("ml-1 h-4 w-4 transition-transform duration-150", showAll && "rotate-180")} />
          </Button>
        </div>
      )}
    </div>
  );
}

function InsightCard({
  insight,
  featured,
  open,
  onToggle,
}: {
  insight: Insight;
  featured?: boolean;
  open: boolean;
  onToggle: (id: string | null) => void;
}) {
  const tone = TONE[insight.tone];
  const Icon = tone.icon;
  const dots = CONFIDENCE_DOTS[insight.evidence.confidence];
  return (
    <article
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/70 bg-card p-4 transition-shadow duration-200 hover:shadow-hub",
        featured && "p-5 md:p-6",
      )}
    >
      {featured && (
        <div
          aria-hidden
          className={cn(
            "pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl",
            insight.tone === "warn" ? "bg-warning/10" : "bg-primary/10",
          )}
        />
      )}
      <div className="relative flex items-start gap-3">
        <span className={cn("flex shrink-0 items-center justify-center rounded-xl", tone.chip, featured ? "h-10 w-10" : "h-8 w-8")}>
          <Icon className={featured ? "h-5 w-5" : "h-4 w-4"} />
        </span>
        <div className="min-w-0 flex-1">
          <div className="mb-1 flex flex-wrap items-center gap-1.5 text-[0.6875rem] font-medium">
            <span className={cn("rounded-full px-2 py-0.5", tone.chip)}>{tone.label}</span>
            <span className="rounded-full bg-secondary px-2 py-0.5 text-muted-foreground">
              {PRIORITY_LABEL[insight.priority]} priority
            </span>
            {featured && (
              <span className="flex items-center gap-1 text-muted-foreground">
                <Sparkles className="h-3 w-3" /> Top insight
              </span>
            )}
          </div>
          <h3 className={cn("font-semibold leading-snug", featured ? "text-lg" : "text-[0.9375rem]")}>{insight.title}</h3>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{insight.detail}</p>
          <div className="mt-3 rounded-xl bg-secondary/60 px-3 py-2.5 text-sm">
            <span className="font-medium">Try this: </span>
            {insight.action.recommended}
            <span className="mt-0.5 block text-xs text-muted-foreground">Watch: {insight.action.targetMetric}</span>
          </div>
          <button
            type="button"
            onClick={() => onToggle(open ? null : insight.id)}
            className="mt-2.5 flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground"
            aria-expanded={open}
          >
            <span className="flex gap-0.5" aria-label={`${insight.evidence.confidence} confidence`}>
              {[1, 2, 3].map((n) => (
                <span key={n} className={cn("h-1.5 w-3 rounded-full", n <= dots ? "bg-foreground/70" : "bg-border")} />
              ))}
            </span>
            {insight.evidence.confidence === "high"
              ? "Solid numbers"
              : insight.evidence.confidence === "moderate"
                ? "Fairly sure"
                : "Early signal"}{" "}
            · {insight.evidence.sampleSize.toLocaleString()} {insight.evidence.sampleLabel}
            <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-150", open && "rotate-180")} />
          </button>
          {open && (
            <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
              {insight.evidence.rangeLabel}. {insight.evidence.confidenceReason}
              {insight.evidence.caveat && ` ${insight.evidence.caveat}`}
            </p>
          )}
        </div>
      </div>
    </article>
  );
}

// ---------------------------------------------------------------- website leads

const KIND_ICON: Record<string, LucideIcon> = { chat: MessageCircle, contact: Mail, agency: Phone };

export function WebsiteLeads({ rows, leads }: { rows: LeadRow[]; leads: Lead[] | undefined }) {
  const add = useAddToPipeline();
  const [added, setAdded] = useState<Set<string>>(new Set());

  if (!rows.length) return <p className="py-8 text-center text-sm text-muted-foreground">No enquiries in this range.</p>;

  return (
    <ul className="divide-y divide-border/60">
      {rows.slice(0, 12).map((row) => {
        const key = `${row.created_at}-${row.email ?? row.phone ?? row.name}`;
        const existing = leads ? matchingLead(row, leads) : undefined;
        const Icon = KIND_ICON[row.kind] ?? Mail;
        const done = !!existing || added.has(key);
        const canAdd = !!(row.email || row.phone);
        return (
          <li key={key} className="flex items-center gap-3 py-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-tint text-on-tint">
              <Icon className="h-4 w-4" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {row.name || row.business_name || row.email || "Anonymous visitor"}
                {row.business_name && row.name && (
                  <span className="font-normal text-muted-foreground"> · {row.business_name}</span>
                )}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {[row.kind === "chat" ? "Chat" : row.kind === "agency" ? "Agency form" : "Contact form", row.budget_range, row.email ?? row.phone]
                  .filter(Boolean)
                  .join(" · ")}
              </p>
            </div>
            <span className="hidden shrink-0 text-xs text-muted-foreground sm:block">
              {formatDistanceToNowStrict(parseISO(row.created_at), { addSuffix: true })}
            </span>
            {done ? (
              existing ? (
                <Link
                  to="/hub/pipeline"
                  className="flex shrink-0 items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-xs font-medium text-muted-foreground hover:text-foreground"
                >
                  <Check className="h-3.5 w-3.5" /> In pipeline
                </Link>
              ) : (
                <span className="flex shrink-0 items-center gap-1 rounded-full bg-tint px-2.5 py-1 text-xs font-medium text-on-tint">
                  <Check className="h-3.5 w-3.5" /> Added
                </span>
              )
            ) : (
              <Button
                size="sm"
                variant="secondary"
                className="h-8 shrink-0 rounded-full px-3 text-xs"
                disabled={!canAdd || add.isPending}
                title={canAdd ? "Add to your pipeline as a new lead" : "No email or phone to follow up with"}
                onClick={() =>
                  add.mutate(row, {
                    onSuccess: () => {
                      setAdded((s) => new Set(s).add(key));
                      toast.success("Added to your pipeline");
                    },
                    onError: (e) => toast.error(e.message),
                  })
                }
              >
                <Plus className="mr-1 h-3.5 w-3.5" /> Pipeline
              </Button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
