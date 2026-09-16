import { useEffect, useState } from "react";
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
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
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
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const PASSCODE_SESSION_KEY = "admin_passcode";
const PULSE_BASE_URL = import.meta.env.VITE_SUPABASE_URL;
const CHART_ACCENT = "hsl(25 100% 50%)";
const CHART_MUTED = "hsl(0 0% 55%)";
const PIE_COLORS = ["hsl(25 100% 50%)", "hsl(0 0% 70%)", "hsl(25 60% 70%)", "hsl(0 0% 40%)", "hsl(25 30% 45%)"];

interface AnalyticsData {
  totals: {
    visitors: number;
    human_visitors: number;
    bot_visitors: number;
    pulses: number;
    page_views: number;
    clicks: number;
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

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutGrid },
  { id: "pages", label: "Pages", icon: FileText },
  { id: "devices", label: "Devices", icon: Monitor },
  { id: "activity", label: "Activity", icon: List },
];

function scrollToSection(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function StatCard({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number | string }) {
  return (
    <Card className="border-border/60 shadow-none">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">{label}</span>
          <Icon className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
        </div>
        <p className="text-2xl font-semibold tabular-nums leading-none">{value}</p>
      </CardContent>
    </Card>
  );
}

function SectionCard({
  title,
  icon: Icon,
  className,
  children,
}: {
  title: string;
  icon?: typeof Users;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className={`border-border/60 shadow-none ${className ?? ""}`}>
      <CardHeader className="py-4 px-5 border-b border-border/60">
        <CardTitle className="text-sm font-medium flex items-center gap-2 text-foreground">
          {Icon && <Icon className="h-4 w-4 text-muted-foreground" aria-hidden />}
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-5">{children}</CardContent>
    </Card>
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

function Dashboard({ passcode, onAuthFailure }: { passcode: string; onAuthFailure: () => void }) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshedAt, setRefreshedAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);

  const load = () => {
    setLoading(true);
    fetch(`${PULSE_BASE_URL}/functions/v1/admin-analytics`, {
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
      })
      .catch((e) => setError(e.message || "Failed to load analytics"))
      .finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(load, [passcode]);

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
              {NAV_ITEMS.map((item, i) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton onClick={() => scrollToSection(item.id)} isActive={i === 0}>
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
        <header className="sticky top-0 z-10 flex items-center justify-between border-b border-border/60 bg-background/95 backdrop-blur px-4 sm:px-6 py-3">
          <div className="flex items-center gap-3">
            <SidebarTrigger className="-ml-1" />
            <h1 className="text-sm font-medium">Overview</h1>
          </div>
          <div className="flex items-center gap-3">
            {refreshedAt && (
              <span className="text-[11px] text-muted-foreground hidden sm:inline">
                Updated {refreshedAt.toLocaleTimeString()}
              </span>
            )}
            <Button variant="outline" size="sm" onClick={load} disabled={loading} className="h-8">
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">Refresh</span>
            </Button>
          </div>
        </header>

        <div className="px-4 sm:px-6 py-6 space-y-6 max-w-7xl">
          {error && <p className="text-sm text-destructive">{error}</p>}

          {data && (
            <>
              <section id="overview" className="space-y-6 scroll-mt-16">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
                  <StatCard icon={Users} label="Visitors" value={data.totals.visitors} />
                  <StatCard icon={Eye} label="Page Views" value={data.totals.page_views} />
                  <StatCard icon={MousePointerClick} label="Clicks" value={data.totals.clicks} />
                  <StatCard icon={Activity} label="Events" value={data.totals.pulses} />
                  <StatCard icon={Users} label="Human" value={data.totals.human_visitors} />
                  <StatCard icon={Bot} label="Bots" value={data.totals.bot_visitors} />
                </div>

                <SectionCard title="Traffic — last 14 days" icon={Activity}>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={data.visits_by_day} margin={{ left: -20 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" vertical={false} />
                        <XAxis dataKey="day" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
                        <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} axisLine={false} tickLine={false} />
                        <Tooltip
                          contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid hsl(var(--border))" }}
                        />
                        <Line type="monotone" dataKey="page_views" name="Page Views" stroke={CHART_ACCENT} strokeWidth={2} dot={false} />
                        <Line type="monotone" dataKey="unique_visitors" name="Unique Visitors" stroke={CHART_MUTED} strokeWidth={2} dot={false} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </SectionCard>
              </section>

              <section id="pages" className="grid lg:grid-cols-2 gap-6 scroll-mt-16">
                <SectionCard title="Top pages" icon={FileText}>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={data.top_pages} layout="vertical" margin={{ left: 8 }}>
                        <CartesianGrid strokeDasharray="3 3" className="stroke-border" horizontal={false} />
                        <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} allowDecimals={false} axisLine={false} tickLine={false} />
                        <YAxis type="category" dataKey="page_path" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} width={110} axisLine={false} tickLine={false} />
                        <Tooltip contentStyle={{ fontSize: 12, borderRadius: 6, border: "1px solid hsl(var(--border))" }} />
                        <Bar dataKey="views" fill={CHART_ACCENT} radius={[0, 3, 3, 0]} barSize={14} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
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
                  <div className="space-y-3">
                    {data.referrers.map((r) => (
                      <div key={r.referrer} className="flex items-center justify-between text-sm border-b border-border/40 pb-2 last:border-0 last:pb-0">
                        <span className="truncate max-w-[70%] text-foreground" title={r.referrer}>{r.referrer}</span>
                        <span className="font-medium tabular-nums text-muted-foreground">{r.count}</span>
                      </div>
                    ))}
                  </div>
                </SectionCard>
              </section>

              <section id="activity" className="scroll-mt-16">
                <SectionCard title="Recent activity" icon={List}>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="text-left text-[11px] uppercase tracking-wide text-muted-foreground border-b border-border/60">
                          <th className="pb-2 pr-4 font-medium">Event</th>
                          <th className="pb-2 pr-4 font-medium">Page</th>
                          <th className="pb-2 pr-4 font-medium">Detail</th>
                          <th className="pb-2 pr-4 font-medium">Source</th>
                          <th className="pb-2 font-medium text-right">Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.recent_activity.map((a, i) => (
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
