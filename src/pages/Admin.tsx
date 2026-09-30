import { useEffect, useMemo, useRef, useState } from "react";
import {
  Lock,
  Users,
  Eye,
  MousePointerClick,
  Bot,
  Activity,
  Clock,
  LayoutGrid,
  FileText,
  Monitor,
  List,
  LogOut,
  RefreshCw,
  ArrowUp,
  ArrowDown,
  ArrowUpDown,
  Download,
  Radio,
  Target,
  Inbox,
  Repeat,
  Compass,
  CalendarClock,
  Megaphone,
  Search,
  TrendingDown,
  Layers,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const PASSCODE_SESSION_KEY = "admin_passcode";
const PULSE_BASE_URL = import.meta.env.VITE_SUPABASE_URL;
const CHART_ACCENT = "hsl(25 100% 50%)";
const CHART_MUTED = "hsl(0 0% 55%)";
const CHART_THIRD = "hsl(25 60% 70%)";
const CHART_FOURTH = "hsl(0 0% 35%)";
const PIE_COLORS = ["hsl(25 100% 50%)", "hsl(0 0% 70%)", "hsl(25 60% 70%)", "hsl(0 0% 40%)", "hsl(25 30% 45%)"];
const TOOLTIP_STYLE = { fontSize: 12, borderRadius: 6, border: "1px solid hsl(var(--border))" } as const;
const AXIS_TICK = { fontSize: 11, fill: "hsl(var(--muted-foreground))" } as const;

const RANGE_OPTIONS = [
  { days: 1, label: "24h" },
  { days: 7, label: "7d" },
  { days: 14, label: "14d" },
  { days: 30, label: "30d" },
  { days: 90, label: "90d" },
];

const DOW_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* -------------------------------------------------------------------------- */
/*  Payload shape                                                             */
/* -------------------------------------------------------------------------- */

interface Totals {
  visitors: number;
  human_visitors: number;
  bot_visitors: number;
  pulses: number;
  page_views: number;
  clicks: number;
  sessions: number;
  leads: number;
}

interface Period {
  page_views: number;
  prev_page_views: number;
  visitors: number;
  prev_visitors: number;
  clicks: number;
  prev_clicks: number;
  sessions: number;
  prev_sessions: number;
  leads: number;
  prev_leads: number;
}

interface Engagement {
  sessions: number;
  prev_sessions: number;
  bounce_rate: number;
  engaged_sessions: number;
  pages_per_session: number;
  avg_session_duration_ms: number;
  median_session_duration_ms: number;
  clicks_per_session: number;
  new_visitors: number;
  repeat_visitors: number;
  first_time_visitors: number;
  bot_sessions: number;
  human_sessions: number;
}

interface PageDetailRow {
  page_path: string;
  page_title: string;
  views: number;
  unique_visitors: number;
  sessions: number;
  clicks: number;
  avg_duration_ms: number;
  entries: number;
  exits: number;
  bounce_rate: number | null;
}

interface SessionRow {
  session_ref: string;
  started_at: string;
  ended_at: string;
  page_views: number;
  distinct_pages: number;
  clicks: number;
  dur_ms: number;
  entry_page: string | null;
  exit_page: string | null;
  channel: string;
  device_type: string;
  browser: string;
  os: string;
  is_bot: boolean;
  is_engaged: boolean;
}

interface VisitorRow {
  visitor_ref: string;
  first_seen: string;
  last_seen: string;
  visit_count: number;
  device_type: string;
  browser: string;
  os: string;
  is_bot: boolean;
  sessions: number;
  page_views: number;
  clicks: number;
  dur_ms: number;
  last_page: string | null;
}

interface LeadRow {
  created_at: string;
  kind: string;
  name: string | null;
  email: string | null;
  business_name: string | null;
  detail: string | null;
  budget_range: string | null;
  status: string | null;
  page_path: string | null;
  source: string | null;
  booked: boolean;
  step: string | null;
  phone: string | null;
  industry: string | null;
  start_timeframe: string | null;
}

interface ActivityRow {
  created_at: string;
  event_type: string;
  page_path: string;
  page_title: string | null;
  element_text: string | null;
  element_selector: string | null;
  duration_ms: number | null;
  referrer: string | null;
  session_ref: string | null;
  visitor_ref: string | null;
  is_bot: boolean;
  browser: string | null;
  device_type: string | null;
  os: string | null;
}

interface AnalyticsData {
  range_days: number;
  generated_at: string;
  timezone: string;
  totals: Totals;
  period: Period;
  engagement: Engagement;
  visits_by_day: {
    day: string;
    page_views: number;
    unique_visitors: number;
    clicks: number;
    sessions: number;
    new_visitors: number;
  }[];
  visits_by_hour_of_day: { hour: number; page_views: number; sessions: number }[];
  activity_heatmap: { dow: number; hour: number; page_views: number; sessions: number }[];
  top_pages: { page_path: string; views: number }[];
  top_pages_clean: {
    page_path: string;
    views: number;
    sessions: number;
    unique_visitors: number;
    clicks: number;
  }[];
  avg_time_on_page: { page_path: string; avg_duration_ms: number; sessions: number }[];
  page_detail: PageDetailRow[];
  entry_pages: { page_path: string; count: number }[];
  exit_pages: { page_path: string; count: number }[];
  campaigns: {
    utm_source: string;
    utm_medium: string;
    utm_campaign: string;
    utm_content: string;
    page_views: number;
    sessions: number;
    visitors: number;
    landing_page: string;
  }[];
  ad_clicks: { network: string; page_views: number; sessions: number }[];
  device_breakdown: { device_type: string; count: number }[];
  browser_breakdown: { browser: string; count: number }[];
  os_breakdown: { os: string; count: number }[];
  visitor_mix: { label: string; count: number }[];
  referrers: { referrer: string; count: number }[];
  external_referrers: { referrer: string; count: number; sessions: number }[];
  channels: {
    channel: string;
    sessions: number;
    engaged_sessions: number;
    pages_per_session: number;
  }[];
  top_clicks: {
    label: string;
    element_selector: string | null;
    count: number;
    sessions: number;
    page_path: string;
  }[];
  event_mix: { event_type: string; count: number }[];
  recent_sessions: SessionRow[];
  visitor_detail: VisitorRow[];
  bot_breakdown: { bot: string; visitors: number; page_views: number; last_seen: string }[];
  leads: {
    period_total: number;
    conversion_rate: number;
    booked: number;
    by_kind: { kind: string; count: number }[];
    by_status: { status: string; count: number }[];
    by_source: { source: string; count: number }[];
    chat_funnel: { step: string; count: number; booked: number }[];
    by_day: { day: string; count: number }[];
    recent: LeadRow[];
  };
  recent_activity: ActivityRow[];
}

/* -------------------------------------------------------------------------- */
/*  Formatting                                                                */
/* -------------------------------------------------------------------------- */

function formatDuration(ms: number): string {
  if (!ms || ms < 0) return "—";
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })} ${d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function shortPath(path: string | null, max = 34): string {
  if (!path) return "—";
  return path.length > max ? `${path.slice(0, max)}…` : path;
}

function hostOf(referrer: string): string {
  try {
    return new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return referrer;
  }
}

function computeDelta(current: number, prev: number): { pct: number | null; direction: "up" | "down" | "flat" } {
  if (prev === 0) return { pct: current > 0 ? null : 0, direction: current > 0 ? "up" : "flat" };
  const pct = Math.round(((current - prev) / prev) * 100);
  return { pct, direction: pct > 0 ? "up" : pct < 0 ? "down" : "flat" };
}

/** `invert` flips the colour, for metrics where a rise is bad (bounce rate). */
function DeltaBadge({ current, prev, invert = false }: { current: number; prev: number; invert?: boolean }) {
  const { pct, direction } = computeDelta(current, prev);
  if (direction === "flat" && prev === 0 && current === 0) return null;
  const label = pct === null ? "New" : `${pct > 0 ? "+" : ""}${pct}%`;
  const good = invert ? direction === "down" : direction === "up";
  const bad = invert ? direction === "up" : direction === "down";
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[11px] font-medium ${
        good ? "text-emerald-600 dark:text-emerald-500" : bad ? "text-red-500" : "text-muted-foreground"
      }`}
    >
      {direction === "up" && <ArrowUp className="h-3 w-3" />}
      {direction === "down" && <ArrowDown className="h-3 w-3" />}
      {label}
    </span>
  );
}

function CountUp({ value, duration = 600 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(0);

  useEffect(() => {
    const from = prevValue.current;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setDisplay(from + (value - from) * p);
      if (p < 1) raf = requestAnimationFrame(tick);
      else prevValue.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const isFractional = !Number.isInteger(value);
  return <>{isFractional ? display.toFixed(2) : Math.round(display).toLocaleString()}</>;
}

function downloadCsv(filename: string, rows: (string | number | null)[][]) {
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const today = () => new Date().toISOString().slice(0, 10);

/* -------------------------------------------------------------------------- */
/*  Building blocks                                                           */
/* -------------------------------------------------------------------------- */

function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
  current,
  prev,
  invertDelta,
  hint,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  suffix?: string;
  current?: number;
  prev?: number;
  invertDelta?: boolean;
  hint?: string;
}) {
  return (
    <Card className="border-border/60 shadow-none">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
          <Icon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
        </div>
        <div className="flex items-end justify-between gap-2">
          <p className="text-2xl font-semibold tabular-nums leading-none">
            <CountUp value={value} />
            {suffix && <span className="text-sm font-normal text-muted-foreground ml-0.5">{suffix}</span>}
          </p>
          {current !== undefined && prev !== undefined && (
            <DeltaBadge current={current} prev={prev} invert={invertDelta} />
          )}
        </div>
        {hint && <p className="text-[10px] text-muted-foreground mt-1.5 leading-snug">{hint}</p>}
      </CardContent>
    </Card>
  );
}

function SectionCard({
  title,
  subtitle,
  icon: Icon,
  action,
  className,
  bodyClassName,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: typeof Users;
  action?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className={`border-border/60 shadow-none ${className ?? ""}`}>
      <CardHeader className="py-3.5 px-5 border-b border-border/60 flex-row items-center justify-between space-y-0 gap-3">
        <div className="min-w-0">
          <CardTitle className="text-sm font-medium flex items-center gap-2 text-foreground">
            {Icon && <Icon className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden />}
            {title}
          </CardTitle>
          {subtitle && <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </CardHeader>
      <CardContent className={bodyClassName ?? "p-5"}>{children}</CardContent>
    </Card>
  );
}

function EmptyState({ label }: { label: string }) {
  return <p className="text-sm text-muted-foreground">{label}</p>;
}

function ExportButton({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground shrink-0" onClick={onClick}>
      <Download className="h-3.5 w-3.5" /> Export
    </Button>
  );
}

function RankedList({
  items,
  formatValue,
}: {
  items: { label: string; value: number; sub?: string }[];
  formatValue?: (v: number) => string;
}) {
  const max = Math.max(1, ...items.map((i) => i.value));
  if (items.length === 0) return <EmptyState label="No data yet." />;
  return (
    <div className="space-y-2.5">
      {items.map((item) => (
        <div key={`${item.label}-${item.sub ?? ""}`} className="relative">
          <div
            className="absolute inset-y-0 left-0 bg-muted rounded"
            style={{ width: `${Math.max(4, (item.value / max) * 100)}%` }}
          />
          <div className="relative flex items-center justify-between text-sm px-2 py-1.5 gap-3">
            <span className="truncate text-foreground" title={item.label}>
              {item.label}
              {item.sub && <span className="text-muted-foreground text-xs ml-1.5">{item.sub}</span>}
            </span>
            <span className="font-medium tabular-nums text-foreground shrink-0">
              {formatValue ? formatValue(item.value) : item.value.toLocaleString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function DonutWithLegend({
  data,
  nameKey,
  label,
}: {
  data: Record<string, unknown>[];
  nameKey: string;
  label: string;
}) {
  if (data.length === 0) return <EmptyState label={`No ${label} data yet.`} />;
  return (
    <>
      <div className="h-52">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="count" nameKey={nameKey} outerRadius={64} innerRadius={40} paddingAngle={2}>
              {data.map((_, i) => (
                <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="hsl(var(--card))" strokeWidth={2} />
              ))}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
        {data.map((d, i) => (
          <div key={String(d[nameKey])} className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <span className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
            {String(d[nameKey])} ({String(d.count)})
          </div>
        ))}
      </div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sortable table                                                            */
/* -------------------------------------------------------------------------- */

interface Column<T> {
  key: string;
  label: string;
  align?: "left" | "right";
  numeric?: boolean;
  /** Sort on something other than the raw field (e.g. a parsed date). */
  sortValue?: (row: T) => number | string;
  render?: (row: T) => React.ReactNode;
  cellClassName?: string;
}

function DataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  initialSortKey,
  initialSortDir = "desc",
  maxHeight = "24rem",
  emptyLabel = "No data yet.",
  rowKey,
}: {
  columns: Column<T>[];
  rows: T[];
  initialSortKey?: string;
  initialSortDir?: "asc" | "desc";
  maxHeight?: string;
  emptyLabel?: string;
  rowKey?: (row: T, i: number) => string;
}) {
  const [sortKey, setSortKey] = useState<string | undefined>(initialSortKey);
  const [sortDir, setSortDir] = useState<"asc" | "desc">(initialSortDir);

  const sorted = useMemo(() => {
    if (!sortKey) return rows;
    const col = columns.find((c) => c.key === sortKey);
    const read = (row: T) => (col?.sortValue ? col.sortValue(row) : (row[sortKey] as number | string | null));
    return [...rows].sort((a, b) => {
      const av = read(a);
      const bv = read(b);
      if (av === bv) return 0;
      if (av === null || av === undefined) return 1;
      if (bv === null || bv === undefined) return -1;
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [rows, sortKey, sortDir, columns]);

  const toggle = (key: string) => {
    if (sortKey === key) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  if (rows.length === 0) return <EmptyState label={emptyLabel} />;

  return (
    <div className="overflow-auto" style={{ maxHeight }}>
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground border-b border-border/60 sticky top-0 bg-card z-10">
            {columns.map((c) => (
              <th
                key={c.key}
                className={`pb-2 pt-1 font-medium whitespace-nowrap ${c.align === "right" ? "text-right" : ""} ${
                  c.key === columns[columns.length - 1].key ? "" : "pr-4"
                }`}
              >
                <button
                  onClick={() => toggle(c.key)}
                  className={`inline-flex items-center gap-1 hover:text-foreground transition-colors ${
                    sortKey === c.key ? "text-foreground" : ""
                  }`}
                >
                  {c.label}
                  {sortKey === c.key ? (
                    sortDir === "asc" ? (
                      <ArrowUp className="h-3 w-3" />
                    ) : (
                      <ArrowDown className="h-3 w-3" />
                    )
                  ) : (
                    <ArrowUpDown className="h-3 w-3 opacity-30" />
                  )}
                </button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr key={rowKey ? rowKey(row, i) : i} className="border-b border-border/40 last:border-0">
              {columns.map((c) => (
                <td
                  key={c.key}
                  className={`py-2 ${c.align === "right" ? "text-right tabular-nums" : ""} ${
                    c.key === columns[columns.length - 1].key ? "" : "pr-4"
                  } ${c.cellClassName ?? "text-muted-foreground"}`}
                >
                  {c.render ? c.render(row) : String(row[c.key] ?? "—")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Day x hour heatmap                                                        */
/* -------------------------------------------------------------------------- */

function ActivityHeatmap({
  cells,
  timezone,
}: {
  cells: { dow: number; hour: number; page_views: number; sessions: number }[];
  timezone: string;
}) {
  const { map, max } = useMemo(() => {
    const m = new Map<string, { views: number; sessions: number }>();
    let mx = 0;
    cells.forEach((c) => {
      m.set(`${c.dow}-${c.hour}`, { views: c.page_views, sessions: c.sessions });
      if (c.page_views > mx) mx = c.page_views;
    });
    return { map: m, max: mx };
  }, [cells]);

  if (cells.length === 0) return <EmptyState label="Not enough traffic to build a heatmap yet." />;

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <div className="min-w-[620px]">
          <div className="grid grid-cols-[2.2rem_repeat(24,minmax(0,1fr))] gap-[2px] mb-1">
            <span />
            {Array.from({ length: 24 }).map((_, h) => (
              <span key={h} className="text-[9px] text-muted-foreground text-center tabular-nums">
                {h % 3 === 0 ? h : ""}
              </span>
            ))}
          </div>
          {DOW_LABELS.map((dayLabel, dow) => (
            <div key={dow} className="grid grid-cols-[2.2rem_repeat(24,minmax(0,1fr))] gap-[2px] mb-[2px]">
              <span className="text-[10px] text-muted-foreground leading-5">{dayLabel}</span>
              {Array.from({ length: 24 }).map((_, hour) => {
                const cell = map.get(`${dow}-${hour}`);
                const intensity = cell && max > 0 ? cell.views / max : 0;
                return (
                  <div
                    key={hour}
                    title={`${dayLabel} ${String(hour).padStart(2, "0")}:00 — ${cell?.views ?? 0} views, ${
                      cell?.sessions ?? 0
                    } sessions`}
                    className="h-5 rounded-[2px] border border-border/30"
                    style={{
                      background: intensity > 0 ? `hsl(25 100% 50% / ${0.12 + intensity * 0.88})` : "hsl(var(--muted))",
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>Hour of day — {timezone}</span>
        <span className="flex items-center gap-1.5">
          Low
          {[0.12, 0.35, 0.58, 0.8, 1].map((o) => (
            <span
              key={o}
              className="w-3.5 h-3 rounded-[2px] border border-border/30"
              style={{ background: `hsl(25 100% 50% / ${o})` }}
            />
          ))}
          High
        </span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Gate + skeleton                                                           */
/* -------------------------------------------------------------------------- */

function PasscodeGate({ onUnlock }: { onUnlock: (passcode: string) => void }) {
  const [value, setValue] = useState("");
  const [error, setError] = useState(false);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const expected = import.meta.env.VITE_APP_PASSCODE;
    if (value === expected) {
      onUnlock(value);
    } else {
      setError(true);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-sm border-border/60 shadow-none">
        <CardHeader className="pb-2">
          <div className="w-9 h-9 rounded-md border border-border/60 flex items-center justify-center mb-3">
            <Lock className="h-4 w-4 text-muted-foreground" aria-hidden />
          </div>
          <CardTitle className="text-base font-medium">Site Analytics</CardTitle>
          <p className="text-xs text-muted-foreground">Enter your passcode to continue.</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <Label htmlFor="passcode" className="text-xs">
                Passcode
              </Label>
              <Input
                id="passcode"
                type="password"
                autoFocus
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  setError(false);
                }}
                className="mt-1"
              />
              {error && <p className="text-xs text-destructive mt-1.5">Incorrect passcode</p>}
            </div>
            <Button type="submit" size="sm" className="w-full">
              Unlock
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-[76px] rounded-lg" />
        ))}
      </div>
      <Skeleton className="h-80 rounded-lg" />
      <div className="grid lg:grid-cols-2 gap-6">
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Navigation                                                                */
/* -------------------------------------------------------------------------- */

const NAV_GROUPS: { label: string; items: { id: string; label: string; icon: typeof Users }[] }[] = [
  {
    label: "Traffic",
    items: [
      { id: "overview", label: "Overview", icon: LayoutGrid },
      { id: "acquisition", label: "Acquisition", icon: Compass },
      { id: "timing", label: "Timing", icon: CalendarClock },
    ],
  },
  {
    label: "Content",
    items: [
      { id: "pages", label: "Pages", icon: FileText },
      { id: "interaction", label: "Interaction", icon: MousePointerClick },
    ],
  },
  {
    label: "People",
    items: [
      { id: "audience", label: "Audience", icon: Monitor },
      { id: "visitors", label: "Visitors", icon: Users },
      { id: "sessions", label: "Sessions", icon: Layers },
      { id: "crawlers", label: "Crawlers", icon: Bot },
    ],
  },
  {
    label: "Business",
    items: [{ id: "leads", label: "Leads", icon: Inbox }],
  },
  {
    label: "Raw",
    items: [{ id: "activity", label: "Event feed", icon: List }],
  },
];

const ALL_NAV_IDS = NAV_GROUPS.flatMap((g) => g.items.map((i) => i.id));

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

const ACTIVITY_FILTERS = [
  { value: "all", label: "All" },
  { value: "page_view", label: "Views" },
  { value: "click", label: "Clicks" },
  { value: "heartbeat", label: "Heartbeats" },
  { value: "page_exit", label: "Exits" },
  { value: "bot", label: "Bots" },
  { value: "human", label: "Humans" },
] as const;

const TRAFFIC_SERIES = [
  { key: "page_views", label: "Page views", color: CHART_ACCENT },
  { key: "unique_visitors", label: "Visitors", color: CHART_MUTED },
  { key: "sessions", label: "Sessions", color: CHART_THIRD },
  { key: "clicks", label: "Clicks", color: CHART_FOURTH },
] as const;

/** Small segmented control used for ranges, filters and series toggles. */
function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  size = "sm",
}: {
  options: { value: T; label: string }[];
  value: T | T[];
  onChange: (v: T) => void;
  size?: "sm" | "xs";
}) {
  const isActive = (v: T) => (Array.isArray(value) ? value.includes(v) : value === v);
  return (
    <div className="flex items-center rounded-md border border-border/60 p-0.5 flex-wrap">
      {options.map((opt) => (
        <button
          key={String(opt.value)}
          onClick={() => onChange(opt.value)}
          className={`rounded font-medium transition-colors ${
            size === "xs" ? "px-2 py-1 text-[11px]" : "px-2.5 py-1 text-xs"
          } ${isActive(opt.value) ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Dashboard                                                                 */
/* -------------------------------------------------------------------------- */

function Dashboard({ passcode, onAuthFailure }: { passcode: string; onAuthFailure: () => void }) {
  const { toast } = useToast();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshedAt, setRefreshedAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [rangeDays, setRangeDays] = useState(14);
  const [activeSection, setActiveSection] = useState("overview");
  const [activityFilter, setActivityFilter] = useState<(typeof ACTIVITY_FILTERS)[number]["value"]>("all");
  const [activitySearch, setActivitySearch] = useState("");
  const [series, setSeries] = useState<string[]>(["page_views", "unique_visitors"]);
  const [includeBots, setIncludeBots] = useState(true);
  const isFirstLoad = useRef(true);

  const load = (opts?: { silent?: boolean }) => {
    setLoading(true);
    fetch(`${PULSE_BASE_URL}/functions/v1/admin-analytics?days=${rangeDays}`, {
      headers: { "x-admin-passcode": passcode },
    })
      .then(async (res) => {
        if (res.status === 401) {
          onAuthFailure();
          throw new Error("Unauthorized");
        }
        if (!res.ok) throw new Error((await res.json().catch(() => null))?.error || "Failed to load analytics");
        return res.json();
      })
      .then((d) => {
        setData(d);
        setRefreshedAt(new Date());
        setError(null);
        if (!opts?.silent && !isFirstLoad.current) {
          toast({ title: "Analytics refreshed" });
        }
        isFirstLoad.current = false;
      })
      .catch((e) => {
        setError(e.message || "Failed to load analytics");
        if (!opts?.silent) toast({ title: "Refresh failed", description: e.message, variant: "destructive" });
      })
      .finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => load({ silent: true }), [passcode, rangeDays]);

  // Scrollspy: highlight the sidebar item for the section currently in view.
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { rootMargin: "-15% 0px -70% 0px" },
    );
    ALL_NAV_IDS.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [data]);

  const toggleSeries = (key: string) =>
    setSeries((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key]));

  const filteredActivity = useMemo(() => {
    if (!data) return [];
    let rows = data.recent_activity;
    if (activityFilter === "bot") rows = rows.filter((a) => a.is_bot);
    else if (activityFilter === "human") rows = rows.filter((a) => !a.is_bot);
    else if (activityFilter !== "all") rows = rows.filter((a) => a.event_type === activityFilter);
    const q = activitySearch.trim().toLowerCase();
    if (q) {
      rows = rows.filter((a) =>
        [a.page_path, a.element_text, a.element_selector, a.referrer, a.browser, a.os, a.session_ref, a.visitor_ref]
          .filter(Boolean)
          .some((v) => String(v).toLowerCase().includes(q)),
      );
    }
    return rows;
  }, [data, activityFilter, activitySearch]);

  const visibleSessions = useMemo(() => {
    if (!data) return [];
    return includeBots ? data.recent_sessions : data.recent_sessions.filter((s) => !s.is_bot);
  }, [data, includeBots]);

  const visibleVisitors = useMemo(() => {
    if (!data) return [];
    return includeBots ? data.visitor_detail : data.visitor_detail.filter((v) => !v.is_bot);
  }, [data, includeBots]);

  const rangeLabel = rangeDays === 1 ? "last 24 hours" : `last ${rangeDays} days`;

  return (
    <SidebarProvider>
      <Sidebar className="border-r border-border/60">
        <SidebarHeader className="px-3 py-3.5 border-b border-border/60">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-md bg-foreground text-background flex items-center justify-center text-xs font-semibold">
              JM
            </div>
            <div className="leading-tight">
              <p className="text-sm font-medium">Analytics</p>
              <p className="text-[11px] text-muted-foreground">josephmaina.co.ke</p>
            </div>
          </div>
        </SidebarHeader>
        <SidebarContent>
          {NAV_GROUPS.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.id}>
                    <SidebarMenuButton onClick={() => scrollToSection(item.id)} isActive={activeSection === item.id}>
                      <item.icon />
                      <span>{item.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          ))}
        </SidebarContent>
        <SidebarFooter className="border-t border-border/60 p-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground"
            onClick={onAuthFailure}
          >
            <LogOut className="h-4 w-4" /> Lock dashboard
          </Button>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-20 flex items-center justify-between border-b border-border/60 bg-background/95 backdrop-blur px-4 sm:px-6 py-3 gap-3 flex-wrap">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="-ml-1" />
            <h1 className="text-sm font-medium">Overview</h1>
            <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
              <span className="relative flex h-1.5 w-1.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-500 opacity-75" />
                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
              </span>
              Live
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Segmented<number>
              options={RANGE_OPTIONS.map((o) => ({ value: o.days, label: o.label }))}
              value={rangeDays}
              onChange={setRangeDays}
            />
            <Segmented
              options={[
                { value: "with", label: "All traffic" },
                { value: "without", label: "Humans only" },
              ]}
              value={includeBots ? "with" : "without"}
              onChange={(v) => setIncludeBots(v === "with")}
              size="xs"
            />
            {refreshedAt && (
              <span className="text-[11px] text-muted-foreground hidden xl:inline">
                Updated {refreshedAt.toLocaleTimeString()}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={() => load()} disabled={loading} className="h-8">
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </header>

        <div className="px-4 sm:px-6 py-6 space-y-6 max-w-[1600px]">
          {error && <p className="text-sm text-destructive">{error}</p>}

          {!data && !error && <DashboardSkeleton />}

          {data && (
            <>
              {/* ---------------------------------------------- Overview */}
              <section id="overview" className="space-y-6 scroll-mt-16">
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
                  <StatCard
                    icon={Users}
                    label="Visitors"
                    value={data.period.visitors}
                    current={data.period.visitors}
                    prev={data.period.prev_visitors}
                    hint={`${data.totals.visitors.toLocaleString()} all time`}
                  />
                  <StatCard
                    icon={Layers}
                    label="Sessions"
                    value={data.period.sessions}
                    current={data.period.sessions}
                    prev={data.period.prev_sessions}
                    hint={`${data.engagement.human_sessions} human · ${data.engagement.bot_sessions} bot`}
                  />
                  <StatCard
                    icon={Eye}
                    label="Page Views"
                    value={data.period.page_views}
                    current={data.period.page_views}
                    prev={data.period.prev_page_views}
                    hint={`${data.engagement.pages_per_session} per session`}
                  />
                  <StatCard
                    icon={MousePointerClick}
                    label="Clicks"
                    value={data.period.clicks}
                    current={data.period.clicks}
                    prev={data.period.prev_clicks}
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
                    hint={`avg ${formatDuration(data.engagement.avg_session_duration_ms)} (idle-tab skewed)`}
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
                  />
                </div>

                <SectionCard
                  title={`Traffic — ${rangeLabel}`}
                  subtitle="Toggle any series on or off."
                  icon={Activity}
                  action={
                    <Segmented
                      options={TRAFFIC_SERIES.map((s) => ({ value: s.key as string, label: s.label }))}
                      value={series}
                      onChange={toggleSeries}
                      size="xs"
                    />
                  }
                >
                  {data.visits_by_day.length === 0 ? (
                    <EmptyState label="No traffic in this range yet." />
                  ) : (
                    <div className="h-72">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.visits_by_day} margin={{ left: -20, top: 6 }}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                          <XAxis dataKey="day" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                          <YAxis tick={AXIS_TICK} allowDecimals={false} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={TOOLTIP_STYLE} />
                          {TRAFFIC_SERIES.filter((s) => series.includes(s.key)).map((s) => (
                            <Line
                              key={s.key}
                              type="monotone"
                              dataKey={s.key}
                              name={s.label}
                              stroke={s.color}
                              strokeWidth={2}
                              dot={false}
                            />
                          ))}
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </SectionCard>
              </section>

              {/* ---------------------------------------------- Acquisition */}
              <section id="acquisition" className="space-y-6 scroll-mt-16">
                <div className="grid lg:grid-cols-3 gap-6">
                  <SectionCard
                    title="Channels"
                    subtitle="Sessions grouped by where they came from."
                    icon={Compass}
                  >
                    <RankedList
                      items={data.channels.map((c) => ({
                        label: c.channel,
                        value: c.sessions,
                        sub: `${c.pages_per_session} pp/s`,
                      }))}
                    />
                  </SectionCard>

                  <SectionCard
                    title="External referrers"
                    subtitle="In-app navigation and self-referrals excluded."
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
                    />
                  </SectionCard>

                  <SectionCard
                    title="Raw referrer values"
                    subtitle="Everything as captured, internal paths included."
                    icon={List}
                  >
                    <RankedList items={data.referrers.map((r) => ({ label: r.referrer, value: r.count }))} />
                  </SectionCard>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                  <SectionCard
                    title="Campaigns"
                    subtitle="Parsed from utm_* tags on the landing URL."
                    icon={Megaphone}
                    className="lg:col-span-2"
                    bodyClassName="px-5 pb-5 pt-3"
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
                      rows={data.campaigns as unknown as Record<string, unknown>[]}
                      initialSortKey="page_views"
                      emptyLabel="No utm-tagged traffic in this range. Tag your links to see campaigns here."
                      columns={[
                        { key: "utm_source", label: "Source", cellClassName: "text-foreground" },
                        { key: "utm_medium", label: "Medium" },
                        { key: "utm_campaign", label: "Campaign" },
                        { key: "utm_content", label: "Content" },
                        {
                          key: "landing_page",
                          label: "Landing",
                          render: (r) => (
                            <span title={String(r.landing_page)}>{shortPath(String(r.landing_page), 22)}</span>
                          ),
                        },
                        { key: "page_views", label: "Views", align: "right", cellClassName: "text-foreground" },
                        { key: "sessions", label: "Sessions", align: "right" },
                        { key: "visitors", label: "Visitors", align: "right" },
                      ]}
                    />
                  </SectionCard>

                  <SectionCard
                    title="Ad clicks"
                    subtitle="Sessions arriving with a paid click id."
                    icon={Target}
                  >
                    <RankedList
                      items={data.ad_clicks.map((a) => ({
                        label: a.network,
                        value: a.page_views,
                        sub: `${a.sessions} sessions`,
                      }))}
                    />
                  </SectionCard>
                </div>
              </section>

              {/* ---------------------------------------------- Timing */}
              <section id="timing" className="space-y-6 scroll-mt-16">
                <SectionCard
                  title="When people visit"
                  subtitle={`Day of week against hour of day, in ${data.timezone}.`}
                  icon={CalendarClock}
                >
                  <ActivityHeatmap cells={data.activity_heatmap} timezone={data.timezone} />
                </SectionCard>

                <SectionCard title="Page views by hour" icon={Clock}>
                  {data.visits_by_hour_of_day.length === 0 ? (
                    <EmptyState label="No data yet." />
                  ) : (
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.visits_by_hour_of_day} margin={{ left: -20, top: 6 }}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                          <XAxis dataKey="hour" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                          <YAxis tick={AXIS_TICK} allowDecimals={false} axisLine={false} tickLine={false} />
                          <Tooltip
                            contentStyle={TOOLTIP_STYLE}
                            labelFormatter={(h) => `${String(h).padStart(2, "0")}:00`}
                          />
                          <Bar dataKey="page_views" name="Page views" fill={CHART_ACCENT} radius={[2, 2, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </SectionCard>
              </section>

              {/* ---------------------------------------------- Pages */}
              <section id="pages" className="space-y-6 scroll-mt-16">
                <SectionCard
                  title="Page performance"
                  subtitle="Every column sorts. Bounce rate is measured against sessions that landed on the page."
                  icon={FileText}
                  bodyClassName="px-5 pb-5 pt-3"
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
                    rows={data.page_detail as unknown as Record<string, unknown>[]}
                    initialSortKey="views"
                    maxHeight="30rem"
                    rowKey={(r) => String(r.page_path)}
                    columns={[
                      {
                        key: "page_path",
                        label: "Page",
                        cellClassName: "text-foreground",
                        render: (r) => (
                          <span title={`${r.page_path}${r.page_title ? ` — ${r.page_title}` : ""}`}>
                            {shortPath(String(r.page_path), 40)}
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
                        render: (r) => (r.bounce_rate === null ? "—" : `${r.bounce_rate}%`),
                      },
                    ]}
                  />
                </SectionCard>

                <div className="grid lg:grid-cols-3 gap-6">
                  <SectionCard
                    title="Top pages"
                    subtitle="Query strings stripped, so one page counts once."
                    icon={FileText}
                  >
                    <RankedList
                      items={data.top_pages_clean
                        .slice(0, 10)
                        .map((p) => ({ label: p.page_path, value: p.views, sub: `${p.unique_visitors} visitors` }))}
                    />
                  </SectionCard>

                  <SectionCard title="Landing pages" subtitle="First page of a session." icon={ArrowDown}>
                    <RankedList items={data.entry_pages.map((p) => ({ label: p.page_path, value: p.count }))} />
                  </SectionCard>

                  <SectionCard title="Exit pages" subtitle="Last page of a session." icon={ArrowUp}>
                    <RankedList items={data.exit_pages.map((p) => ({ label: p.page_path, value: p.count }))} />
                  </SectionCard>
                </div>

                <SectionCard
                  title="Longest average time on page"
                  subtitle="Derived from heartbeats, so an idle open tab inflates this."
                  icon={Clock}
                >
                  {data.avg_time_on_page.length === 0 ? (
                    <EmptyState label="No data yet." />
                  ) : (
                    <div className="space-y-3">
                      {data.avg_time_on_page.map((p) => (
                        <div
                          key={p.page_path}
                          className="flex items-center justify-between text-sm border-b border-border/40 pb-2 last:border-0 last:pb-0 gap-3"
                        >
                          <span className="truncate text-foreground" title={p.page_path}>
                            {p.page_path}
                          </span>
                          <span className="font-medium tabular-nums text-muted-foreground shrink-0">
                            {formatDuration(p.avg_duration_ms)}
                            <span className="text-xs ml-1.5">({p.sessions})</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </SectionCard>
              </section>

              {/* ---------------------------------------------- Interaction */}
              <section id="interaction" className="grid lg:grid-cols-3 gap-6 scroll-mt-16">
                <SectionCard
                  title="Most clicked elements"
                  subtitle="Closest thing to CTA performance."
                  icon={MousePointerClick}
                  className="lg:col-span-2"
                  bodyClassName="px-5 pb-5 pt-3"
                  action={
                    <ExportButton
                      onClick={() =>
                        downloadCsv(`clicks-${today()}.csv`, [
                          ["Label", "Selector", "Clicks", "Sessions", "Last seen on"],
                          ...data.top_clicks.map((c) => [
                            c.label,
                            c.element_selector,
                            c.count,
                            c.sessions,
                            c.page_path,
                          ]),
                        ])
                      }
                    />
                  }
                >
                  <DataTable
                    rows={data.top_clicks as unknown as Record<string, unknown>[]}
                    initialSortKey="count"
                    maxHeight="26rem"
                    columns={[
                      {
                        key: "label",
                        label: "Element",
                        cellClassName: "text-foreground",
                        render: (r) => <span title={String(r.label)}>{shortPath(String(r.label), 40)}</span>,
                      },
                      {
                        key: "element_selector",
                        label: "Selector",
                        render: (r) => (
                          <span className="font-mono text-[11px]" title={String(r.element_selector ?? "")}>
                            {shortPath(String(r.element_selector ?? "—"), 28)}
                          </span>
                        ),
                      },
                      {
                        key: "page_path",
                        label: "Page",
                        render: (r) => <span title={String(r.page_path)}>{shortPath(String(r.page_path), 24)}</span>,
                      },
                      { key: "count", label: "Clicks", align: "right", cellClassName: "text-foreground" },
                      { key: "sessions", label: "Sessions", align: "right" },
                    ]}
                  />
                </SectionCard>

                <SectionCard title="Event mix" subtitle="What the tracker is recording." icon={Activity}>
                  <RankedList items={data.event_mix.map((e) => ({ label: e.event_type, value: e.count }))} />
                </SectionCard>
              </section>

              {/* ---------------------------------------------- Audience */}
              <section id="audience" className="grid lg:grid-cols-4 gap-6 scroll-mt-16">
                <SectionCard title="Devices" icon={Monitor}>
                  <DonutWithLegend
                    data={data.device_breakdown as unknown as Record<string, unknown>[]}
                    nameKey="device_type"
                    label="device"
                  />
                </SectionCard>
                <SectionCard title="Browsers" icon={Monitor}>
                  <DonutWithLegend
                    data={data.browser_breakdown as unknown as Record<string, unknown>[]}
                    nameKey="browser"
                    label="browser"
                  />
                </SectionCard>
                <SectionCard title="Operating systems" icon={Monitor}>
                  <DonutWithLegend
                    data={data.os_breakdown as unknown as Record<string, unknown>[]}
                    nameKey="os"
                    label="OS"
                  />
                </SectionCard>
                <SectionCard title="New vs repeat" subtitle="Based on lifetime visit count." icon={Repeat}>
                  <DonutWithLegend
                    data={data.visitor_mix as unknown as Record<string, unknown>[]}
                    nameKey="label"
                    label="visitor"
                  />
                </SectionCard>
              </section>

              {/* ---------------------------------------------- Visitors */}
              <section id="visitors" className="scroll-mt-16">
                <SectionCard
                  title="Visitors"
                  subtitle={`Activity within the ${rangeLabel}. Visit count is lifetime.${
                    includeBots ? "" : " Bots hidden."
                  }`}
                  icon={Users}
                  bodyClassName="px-5 pb-5 pt-3"
                  action={
                    <ExportButton
                      onClick={() =>
                        downloadCsv(`visitors-${today()}.csv`, [
                          [
                            "Visitor",
                            "First seen",
                            "Last seen",
                            "Visit count",
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
                          ...visibleVisitors.map((v) => [
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
                    rows={visibleVisitors as unknown as Record<string, unknown>[]}
                    initialSortKey="page_views"
                    maxHeight="30rem"
                    rowKey={(r) => String(r.visitor_ref)}
                    columns={[
                      {
                        key: "visitor_ref",
                        label: "Visitor",
                        cellClassName: "text-foreground",
                        render: (r) => (
                          <span className="inline-flex items-center gap-1.5 font-mono text-[11px]">
                            {r.is_bot ? <Bot className="h-3 w-3 shrink-0" /> : null}
                            {String(r.visitor_ref)}
                          </span>
                        ),
                      },
                      { key: "page_views", label: "Views", align: "right", cellClassName: "text-foreground" },
                      { key: "sessions", label: "Sessions", align: "right" },
                      { key: "clicks", label: "Clicks", align: "right" },
                      { key: "visit_count", label: "Lifetime visits", align: "right" },
                      {
                        key: "dur_ms",
                        label: "Time",
                        align: "right",
                        render: (r) => formatDuration(Number(r.dur_ms)),
                      },
                      {
                        key: "last_page",
                        label: "Last page",
                        render: (r) => (
                          <span title={String(r.last_page ?? "")}>{shortPath(r.last_page as string, 24)}</span>
                        ),
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
                    ]}
                  />
                </SectionCard>
              </section>

              {/* ---------------------------------------------- Sessions */}
              <section id="sessions" className="scroll-mt-16">
                <SectionCard
                  title="Recent sessions"
                  subtitle={`Newest 60 sessions in the ${rangeLabel}.${includeBots ? "" : " Bots hidden."}`}
                  icon={Layers}
                  bodyClassName="px-5 pb-5 pt-3"
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
                          ...visibleSessions.map((s) => [
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
                    rows={visibleSessions as unknown as Record<string, unknown>[]}
                    initialSortKey="started_at"
                    maxHeight="30rem"
                    rowKey={(r, i) => `${r.session_ref}-${i}`}
                    columns={[
                      {
                        key: "session_ref",
                        label: "Session",
                        cellClassName: "text-foreground",
                        render: (r) => (
                          <span className="inline-flex items-center gap-1.5 font-mono text-[11px]">
                            {r.is_bot ? <Bot className="h-3 w-3 shrink-0" /> : null}
                            {String(r.session_ref)}
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
                      {
                        key: "dur_ms",
                        label: "Duration",
                        align: "right",
                        render: (r) => formatDuration(Number(r.dur_ms)),
                      },
                      {
                        key: "entry_page",
                        label: "Entry",
                        render: (r) => (
                          <span title={String(r.entry_page ?? "")}>{shortPath(r.entry_page as string, 20)}</span>
                        ),
                      },
                      {
                        key: "exit_page",
                        label: "Exit",
                        render: (r) => (
                          <span title={String(r.exit_page ?? "")}>{shortPath(r.exit_page as string, 20)}</span>
                        ),
                      },
                      { key: "channel", label: "Channel" },
                      { key: "device_type", label: "Device" },
                      {
                        key: "is_engaged",
                        label: "Engaged",
                        align: "right",
                        render: (r) =>
                          r.is_engaged ? (
                            <Badge variant="secondary" className="font-normal text-[11px]">
                              yes
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          ),
                      },
                    ]}
                  />
                </SectionCard>
              </section>

              {/* ---------------------------------------------- Crawlers */}
              <section id="crawlers" className="grid lg:grid-cols-2 gap-6 scroll-mt-16">
                <SectionCard
                  title="Crawlers"
                  subtitle="Confirms search and AI bots are reaching your pages."
                  icon={Bot}
                  bodyClassName="px-5 pb-5 pt-3"
                >
                  <DataTable
                    rows={data.bot_breakdown as unknown as Record<string, unknown>[]}
                    initialSortKey="page_views"
                    maxHeight="22rem"
                    emptyLabel="No crawler traffic in this range."
                    rowKey={(r) => String(r.bot)}
                    columns={[
                      { key: "bot", label: "Crawler", cellClassName: "text-foreground" },
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

                <SectionCard title="Human vs bot" subtitle="Sessions in this range." icon={Users}>
                  <RankedList
                    items={[
                      { label: "Human sessions", value: data.engagement.human_sessions },
                      { label: "Bot sessions", value: data.engagement.bot_sessions },
                    ]}
                  />
                  <div className="mt-4 pt-4 border-t border-border/40 grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Human visitors</p>
                      <p className="text-lg font-semibold tabular-nums">
                        {data.totals.human_visitors.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">Bot visitors</p>
                      <p className="text-lg font-semibold tabular-nums">
                        {data.totals.bot_visitors.toLocaleString()}
                      </p>
                    </div>
                  </div>
                </SectionCard>
              </section>

              {/* ---------------------------------------------- Leads */}
              <section id="leads" className="space-y-6 scroll-mt-16">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <StatCard
                    icon={Inbox}
                    label="Leads"
                    value={data.period.leads}
                    current={data.period.leads}
                    prev={data.period.prev_leads}
                    hint={`${data.totals.leads} all time`}
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
                    hint="denominator for conversion"
                  />
                </div>

                <div className="grid lg:grid-cols-4 gap-6">
                  <SectionCard title="By capture surface" icon={Inbox}>
                    <RankedList items={data.leads.by_kind.map((k) => ({ label: k.kind, value: k.count }))} />
                  </SectionCard>
                  <SectionCard title="By status" icon={List}>
                    <RankedList items={data.leads.by_status.map((s) => ({ label: s.status, value: s.count }))} />
                  </SectionCard>
                  <SectionCard title="By source" icon={Compass}>
                    <RankedList items={data.leads.by_source.map((s) => ({ label: s.source, value: s.count }))} />
                  </SectionCard>
                  <SectionCard title="Chat funnel" subtitle="Where each chat lead stalled." icon={TrendingDown}>
                    <RankedList
                      items={data.leads.chat_funnel.map((f) => ({
                        label: f.step,
                        value: f.count,
                        sub: f.booked > 0 ? `${f.booked} booked` : undefined,
                      }))}
                    />
                  </SectionCard>
                </div>

                <SectionCard title={`Leads — ${rangeLabel}`} icon={Activity}>
                  {data.leads.by_day.every((d) => d.count === 0) ? (
                    <EmptyState label="No leads captured in this range yet." />
                  ) : (
                    <div className="h-56">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data.leads.by_day} margin={{ left: -20, top: 6 }}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                          <XAxis dataKey="day" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                          <YAxis tick={AXIS_TICK} allowDecimals={false} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={TOOLTIP_STYLE} />
                          <Bar dataKey="count" name="Leads" fill={CHART_ACCENT} radius={[2, 2, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </SectionCard>

                <SectionCard
                  title="Recent leads"
                  subtitle="Chat agent, agency enquiries and contact form in one stream."
                  icon={Inbox}
                  bodyClassName="px-5 pb-5 pt-3"
                  action={
                    <ExportButton
                      onClick={() =>
                        downloadCsv(`leads-${today()}.csv`, [
                          [
                            "Created",
                            "Kind",
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
                          ...data.leads.recent.map((l) => [
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
                    rows={data.leads.recent as unknown as Record<string, unknown>[]}
                    initialSortKey="created_at"
                    maxHeight="30rem"
                    emptyLabel="No leads captured yet. The chat agent and contact forms write here."
                    columns={[
                      {
                        key: "created_at",
                        label: "When",
                        sortValue: (r) => new Date(String(r.created_at)).getTime(),
                        render: (r) => formatDateTime(String(r.created_at)),
                      },
                      {
                        key: "kind",
                        label: "Surface",
                        render: (r) => (
                          <Badge variant="secondary" className="font-normal text-[11px]">
                            {String(r.kind)}
                          </Badge>
                        ),
                      },
                      { key: "name", label: "Name", cellClassName: "text-foreground" },
                      {
                        key: "email",
                        label: "Email",
                        render: (r) =>
                          r.email ? (
                            <a className="hover:text-foreground underline-offset-2 hover:underline" href={`mailto:${r.email}`}>
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
                            {shortPath(r.detail as string, 44)}
                          </span>
                        ),
                      },
                      { key: "budget_range", label: "Budget" },
                      { key: "status", label: "Status" },
                      {
                        key: "booked",
                        label: "Booked",
                        align: "right",
                        render: (r) => (r.booked ? "yes" : "—"),
                      },
                    ]}
                  />
                </SectionCard>
              </section>

              {/* ---------------------------------------------- Raw feed */}
              <section id="activity" className="scroll-mt-16">
                <SectionCard
                  title="Event feed"
                  subtitle={`Newest 250 events. Showing ${filteredActivity.length}.`}
                  icon={List}
                  bodyClassName="px-5 pb-5 pt-3"
                  action={
                    <div className="flex items-center gap-2 flex-wrap justify-end">
                      <div className="relative">
                        <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
                        <Input
                          value={activitySearch}
                          onChange={(e) => setActivitySearch(e.target.value)}
                          placeholder="Search path, label, referrer…"
                          className="h-7 w-48 pl-8 text-xs"
                        />
                      </div>
                      <Segmented
                        options={ACTIVITY_FILTERS.map((f) => ({ value: f.value as string, label: f.label }))}
                        value={activityFilter}
                        onChange={(v) => setActivityFilter(v as typeof activityFilter)}
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
                            ...filteredActivity.map((a) => [
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
                    rows={filteredActivity as unknown as Record<string, unknown>[]}
                    initialSortKey="created_at"
                    maxHeight="34rem"
                    emptyLabel="No matching activity."
                    columns={[
                      {
                        key: "created_at",
                        label: "Time",
                        sortValue: (r) => new Date(String(r.created_at)).getTime(),
                        render: (r) => formatDateTime(String(r.created_at)),
                      },
                      {
                        key: "event_type",
                        label: "Event",
                        render: (r) => (
                          <Badge variant="secondary" className="font-normal text-[11px]">
                            {String(r.event_type)}
                          </Badge>
                        ),
                      },
                      {
                        key: "page_path",
                        label: "Page",
                        cellClassName: "text-foreground",
                        render: (r) => <span title={String(r.page_path)}>{shortPath(String(r.page_path), 28)}</span>,
                      },
                      {
                        key: "element_text",
                        label: "Detail",
                        render: (r) => (
                          <span className="italic" title={String(r.element_text ?? "")}>
                            {shortPath(r.element_text as string, 30)}
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
                            {r.referrer ? shortPath(hostOf(String(r.referrer)), 22) : "—"}
                          </span>
                        ),
                      },
                      {
                        key: "session_ref",
                        label: "Session",
                        render: (r) => <span className="font-mono text-[11px]">{String(r.session_ref ?? "—")}</span>,
                      },
                      {
                        key: "visitor_ref",
                        label: "Visitor",
                        render: (r) => <span className="font-mono text-[11px]">{String(r.visitor_ref ?? "—")}</span>,
                      },
                      {
                        key: "browser",
                        label: "Source",
                        align: "right",
                        render: (r) => (
                          <span className="inline-flex items-center gap-1 justify-end">
                            {r.is_bot ? <Bot className="h-3 w-3" /> : null}
                            {r.is_bot ? "Bot" : String(r.browser ?? "—")}
                          </span>
                        ),
                      },
                    ]}
                  />
                </SectionCard>
              </section>

              <p className="text-[11px] text-muted-foreground pt-2">
                Generated {new Date(data.generated_at).toLocaleString()} · times bucketed in {data.timezone} ·
                dwell times are heartbeat-derived and count time an open tab spends idle.
              </p>
            </>
          )}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

export default function Admin() {
  const [passcode, setPasscode] = useState<string | null>(null);

  useEffect(() => {
    try {
      const stored = sessionStorage.getItem(PASSCODE_SESSION_KEY);
      if (stored) setPasscode(stored);
    } catch {
      // ignore
    }
  }, []);

  const unlock = (code: string) => {
    try {
      sessionStorage.setItem(PASSCODE_SESSION_KEY, code);
    } catch {
      // ignore
    }
    setPasscode(code);
  };

  const lock = () => {
    try {
      sessionStorage.removeItem(PASSCODE_SESSION_KEY);
    } catch {
      // ignore
    }
    setPasscode(null);
  };

  if (!passcode) return <PasscodeGate onUnlock={unlock} />;
  return <Dashboard passcode={passcode} onAuthFailure={lock} />;
}
