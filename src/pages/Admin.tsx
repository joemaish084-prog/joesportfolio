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
  Download,
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
const PIE_COLORS = ["hsl(25 100% 50%)", "hsl(0 0% 70%)", "hsl(25 60% 70%)", "hsl(0 0% 40%)", "hsl(25 30% 45%)"];
const RANGE_OPTIONS = [
  { days: 1, label: "24h" },
  { days: 7, label: "7d" },
  { days: 14, label: "14d" },
  { days: 30, label: "30d" },
  { days: 90, label: "90d" },
];

interface AnalyticsData {
  range_days: number;
  totals: {
    visitors: number;
    human_visitors: number;
    bot_visitors: number;
    pulses: number;
    page_views: number;
    clicks: number;
  };
  period: {
    page_views: number;
    prev_page_views: number;
    visitors: number;
    prev_visitors: number;
    clicks: number;
    prev_clicks: number;
  };
  visits_by_day: { day: string; page_views: number; unique_visitors: number }[];
  top_pages: { page_path: string; views: number }[];
  avg_time_on_page: { page_path: string; avg_duration_ms: number; sessions: number }[];
  device_breakdown: { device_type: string; count: number }[];
  browser_breakdown: { browser: string; count: number }[];
  referrers: { referrer: string; count: number }[];
  recent_activity: {
    created_at: string;
    event_type: string;
    page_path: string;
    element_text: string | null;
    is_bot: boolean;
    browser: string | null;
    device_type: string | null;
  }[];
}

function formatDuration(ms: number): string {
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
}

function computeDelta(current: number, prev: number): { pct: number | null; direction: "up" | "down" | "flat" } {
  if (prev === 0) return { pct: current > 0 ? null : 0, direction: current > 0 ? "up" : "flat" };
  const pct = Math.round(((current - prev) / prev) * 100);
  return { pct, direction: pct > 0 ? "up" : pct < 0 ? "down" : "flat" };
}

function DeltaBadge({ current, prev }: { current: number; prev: number }) {
  const { pct, direction } = computeDelta(current, prev);
  if (direction === "flat" && prev === 0 && current === 0) return null;
  const label = pct === null ? "New" : `${pct > 0 ? "+" : ""}${pct}%`;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[11px] font-medium ${
        direction === "up" ? "text-emerald-600 dark:text-emerald-500" : direction === "down" ? "text-red-500" : "text-muted-foreground"
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
      setDisplay(Math.round(from + (value - from) * p));
      if (p < 1) raf = requestAnimationFrame(tick);
      else prevValue.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  return <>{display.toLocaleString()}</>;
}

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "pages", label: "Pages", icon: FileText },
  { id: "devices", label: "Devices", icon: Monitor },
  { id: "activity", label: "Activity", icon: List },
];

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function downloadCsv(filename: string, rows: (string | number)[][]) {
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(","))
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

function StatCard({
  icon: Icon,
  label,
  value,
  current,
  prev,
}: {
  icon: typeof Users;
  label: string;
  value: number;
  current?: number;
  prev?: number;
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
          </p>
          {current !== undefined && prev !== undefined && <DeltaBadge current={current} prev={prev} />}
        </div>
      </CardContent>
    </Card>
  );
}

function SectionCard({
  title,
  icon: Icon,
  action,
  className,
  children,
}: {
  title: string;
  icon?: typeof Users;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className={`border-border/60 shadow-none ${className ?? ""}`}>
      <CardHeader className="py-4 px-5 border-b border-border/60 flex-row items-center justify-between space-y-0">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-foreground">
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />}
          {title}
        </CardTitle>
        {action}
      </CardHeader>
      <CardContent className="p-5">{children}</CardContent>
    </Card>
  );
}

function RankedList({ items }: { items: { label: string; value: number }[] }) {
  const max = Math.max(1, ...items.map((i) => i.value));
  if (items.length === 0) return <p className="text-sm text-muted-foreground">No data yet.</p>;
  return (
    <div className="space-y-2.5">
      {items.map((item) => (
        <div key={item.label} className="relative">
          <div
            className="absolute inset-y-0 left-0 bg-muted rounded"
            style={{ width: `${Math.max(4, (item.value / max) * 100)}%` }}
          />
          <div className="relative flex items-center justify-between text-sm px-2 py-1.5">
            <span className="truncate max-w-[70%] text-foreground" title={item.label}>{item.label}</span>
            <span className="font-medium tabular-nums text-foreground">{item.value.toLocaleString()}</span>
          </div>
        </div>
      ))}
    </div>
  );
}

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
              <Label htmlFor="passcode" className="text-xs">Passcode</Label>
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
            <Button type="submit" size="sm" className="w-full">Unlock</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {Array.from({ length: 6 }).map((_, i) => (
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

const ACTIVITY_FILTERS = [
  { value: "all", label: "All" },
  { value: "page_view", label: "Views" },
  { value: "click", label: "Clicks" },
  { value: "bot", label: "Bots" },
] as const;

function Dashboard({ passcode, onAuthFailure }: { passcode: string; onAuthFailure: () => void }) {
  const { toast } = useToast();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshedAt, setRefreshedAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [rangeDays, setRangeDays] = useState(14);
  const [activeSection, setActiveSection] = useState("overview");
  const [activityFilter, setActivityFilter] = useState<(typeof ACTIVITY_FILTERS)[number]["value"]>("all");
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
    NAV_ITEMS.forEach((item) => {
      const el = document.getElementById(item.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [data]);

  const filteredActivity = useMemo(() => {
    if (!data) return [];
    if (activityFilter === "all") return data.recent_activity;
    if (activityFilter === "bot") return data.recent_activity.filter((a) => a.is_bot);
    return data.recent_activity.filter((a) => a.event_type === activityFilter);
  }, [data, activityFilter]);

  const exportActivity = () => {
    if (!data) return;
    downloadCsv(
      `activity-${new Date().toISOString().slice(0, 10)}.csv`,
      [
        ["Time", "Event", "Page", "Detail", "Bot", "Browser", "Device"],
        ...filteredActivity.map((a) => [
          a.created_at,
          a.event_type,
          a.page_path,
          a.element_text || "",
          a.is_bot ? "yes" : "no",
          a.browser || "",
          a.device_type || "",
        ]),
      ],
    );
  };

  const exportTopPages = () => {
    if (!data) return;
    downloadCsv(
      `top-pages-${new Date().toISOString().slice(0, 10)}.csv`,
      [["Page", "Views"], ...data.top_pages.map((p) => [p.page_path, p.views])],
    );
  };

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
          <SidebarGroup>
            <SidebarGroupLabel>Dashboard</SidebarGroupLabel>
            <SidebarMenu>
              {NAV_ITEMS.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton onClick={() => scrollToSection(item.id)} isActive={activeSection === item.id}>
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter className="border-t border-border/60 p-3">
          <Button variant="ghost" size="sm" className="w-full justify-start text-muted-foreground" onClick={onAuthFailure}>
            <LogOut className="h-4 w-4" /> Lock dashboard
          </Button>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border/60 bg-background/95 backdrop-blur px-4 sm:px-6 py-3 gap-3 flex-wrap">
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
            <div className="flex items-center rounded-md border border-border/60 p-0.5">
              {RANGE_OPTIONS.map((opt) => (
                <button
                  key={opt.days}
                  onClick={() => setRangeDays(opt.days)}
                  className={`px-2.5 py-1 text-xs rounded font-medium transition-colors ${
                    rangeDays === opt.days ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {refreshedAt && (
              <span className="text-[11px] text-muted-foreground hidden lg:inline">
                Updated {refreshedAt.toLocaleTimeString()}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={() => load()} disabled={loading} className="h-8">
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </header>

        <div className="px-4 sm:px-6 py-6 space-y-6 max-w-7xl">
          {error && <p className="text-sm text-destructive">{error}</p>}

          {!data && !error && <DashboardSkeleton />}

          {data && (
            <>
              <section id="overview" className="space-y-6 scroll-mt-16">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <StatCard icon={Users} label="Visitors" value={data.totals.visitors} current={data.period.visitors} prev={data.period.prev_visitors} />
                  <StatCard icon={Eye} label="Page Views" value={data.totals.page_views} current={data.period.page_views} prev={data.period.prev_page_views} />
                  <StatCard icon={MousePointerClick} label="Clicks" value={data.totals.clicks} current={data.period.clicks} prev={data.period.prev_clicks} />
                  <StatCard icon={Activity} label="Events" value={data.totals.pulses} />
                  <StatCard icon={Users} label="Human" value={data.totals.human_visitors} />
                  <StatCard icon={Bot} label="Bots" value={data.totals.bot_visitors} />
                </div>

                <SectionCard title={`Traffic — last ${rangeDays === 1 ? "24 hours" : `${rangeDays} days`}`} icon={Activity}>
                  {data.visits_by_day.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No traffic in this range yet.</p>
                  ) : (
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={data.visits_by_day} margin={{ left: -20 }}>
                          <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                          <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                          <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} axisLine={false} tickLine={false} />
                          <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid hsl(var(--border))" }} />
                          <Line type="monotone" dataKey="page_views" name="Page Views" stroke={CHART_ACCENT} strokeWidth={2} dot={false} />
                          <Line type="monotone" dataKey="unique_visitors" name="Unique Visitors" stroke={CHART_MUTED} strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                  )}
                </SectionCard>
              </section>

              <section id="pages" className="grid lg:grid-cols-2 gap-6 scroll-mt-16">
                <SectionCard
                  title="Top pages"
                  icon={FileText}
                  action={
                    <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={exportTopPages}>
                      <Download className="h-3.5 w-3.5" /> Export
                    </Button>
                  }
                >
                  <RankedList items={data.top_pages.map((p) => ({ label: p.page_path, value: p.views }))} />
                </SectionCard>

                <SectionCard title="Avg. time on page" icon={Clock}>
                  {data.avg_time_on_page.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No data yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {data.avg_time_on_page.map((p) => (
                        <div key={p.page_path} className="flex items-center justify-between text-sm border-b border-border/40 pb-2 last:border-0 last:pb-0">
                          <span className="truncate max-w-[60%] text-foreground" title={p.page_path}>{p.page_path}</span>
                          <span className="font-medium tabular-nums text-muted-foreground">{formatDuration(p.avg_duration_ms)}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </SectionCard>
              </section>

              <section id="devices" className="grid lg:grid-cols-3 gap-6 scroll-mt-16">
                <SectionCard title="Devices" icon={Monitor}>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={data.device_breakdown} dataKey="count" nameKey="device_type" outerRadius={64} innerRadius={40} paddingAngle={2}>
                          {data.device_breakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="hsl(var(--card))" strokeWidth={2} />)}
                        </Pie>
                        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid hsl(var(--border))" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                    {data.device_breakdown.map((d, i) => (
                      <div key={d.device_type} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        {d.device_type} ({d.count})
                      </div>
                    ))}
                  </div>
                </SectionCard>

                <SectionCard title="Browsers" icon={Monitor}>
                  <div className="h-52">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={data.browser_breakdown} dataKey="count" nameKey="browser" outerRadius={64} innerRadius={40} paddingAngle={2}>
                          {data.browser_breakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} stroke="hsl(var(--card))" strokeWidth={2} />)}
                        </Pie>
                        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid hsl(var(--border))" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2">
                    {data.browser_breakdown.map((b, i) => (
                      <div key={b.browser} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <span className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        {b.browser} ({b.count})
                      </div>
                    ))}
                  </div>
                </SectionCard>

                <SectionCard title="Referrers" icon={List}>
                  <RankedList items={data.referrers.map((r) => ({ label: r.referrer, value: r.count }))} />
                </SectionCard>
              </section>

              <section id="activity" className="scroll-mt-16">
                <SectionCard
                  title="Recent activity"
                  icon={List}
                  action={
                    <div className="flex items-center gap-2">
                      <div className="flex items-center rounded-md border border-border/60 p-0.5">
                        {ACTIVITY_FILTERS.map((f) => (
                          <button
                            key={f.value}
                            onClick={() => setActivityFilter(f.value)}
                            className={`px-2 py-1 text-[11px] rounded font-medium transition-colors ${
                              activityFilter === f.value ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"
                            }`}
                          >
                            {f.label}
                          </button>
                        ))}
                      </div>
                      <Button variant="ghost" size="sm" className="h-7 text-xs text-muted-foreground" onClick={exportActivity}>
                        <Download className="h-3.5 w-3.5" /> Export
                      </Button>
                    </div>
                  }
                >
                  <div className="overflow-x-auto max-h-96">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground border-b border-border/60 sticky top-0 bg-card">
                          <th className="pb-2 pr-4 font-medium">Event</th>
                          <th className="pb-2 pr-4 font-medium">Page</th>
                          <th className="pb-2 pr-4 font-medium">Detail</th>
                          <th className="pb-2 pr-4 font-medium">Source</th>
                          <th className="pb-2 font-medium text-right">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredActivity.length === 0 && (
                          <tr>
                            <td colSpan={5} className="py-6 text-center text-muted-foreground">No matching activity.</td>
                          </tr>
                        )}
                        {filteredActivity.map((a, i) => (
                          <tr key={i} className="border-b border-border/40 last:border-0">
                            <td className="py-2 pr-4">
                              <Badge variant="secondary" className="font-normal text-[11px]">{a.event_type}</Badge>
                            </td>
                            <td className="py-2 pr-4 text-muted-foreground max-w-[160px] truncate" title={a.page_path}>{a.page_path}</td>
                            <td className="py-2 pr-4 text-muted-foreground max-w-[220px] truncate italic">{a.element_text || "—"}</td>
                            <td className="py-2 pr-4 text-muted-foreground">
                              <span className="inline-flex items-center gap-1">
                                {a.is_bot && <Bot className="h-3 w-3" />}
                                {a.is_bot ? "Bot" : a.browser || "—"}
                              </span>
                            </td>
                            <td className="py-2 text-right text-muted-foreground tabular-nums">
                              {new Date(a.created_at).toLocaleTimeString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </SectionCard>
              </section>
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
