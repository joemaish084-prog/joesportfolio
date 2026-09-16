import { useEffect, useState } from "react";
import { Lock, Users, Eye, MousePointerClick, Bot, Activity, Clock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
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
const PIE_COLORS = ["hsl(24 95% 53%)", "hsl(38 92% 50%)", "hsl(199 89% 48%)", "hsl(280 70% 55%)", "hsl(340 75% 55%)"];

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

function StatCard({ icon: Icon, label, value }: { icon: typeof Users; label: string; value: number | string }) {
  return (
    <Card>
      <CardContent className="p-5 flex items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
          <Icon className="h-5 w-5 text-primary" aria-hidden />
        </div>
        <div>
          <p className="text-2xl font-display font-bold leading-none">{value}</p>
          <p className="text-xs text-muted-foreground mt-1">{label}</p>
        </div>
      </CardContent>
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
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
          <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center mb-2">
            <Lock className="h-5 w-5 text-primary" aria-hidden />
          </div>
          <CardTitle className="text-xl">Site Analytics</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={submit} className="space-y-3">
            <div>
              <Label htmlFor="passcode">Passcode</Label>
              <Input
                id="passcode"
                type="password"
                autoFocus
                value={value}
                onChange={(e) => {
                  setValue(e.target.value);
                  setError(false);
                }}
              />
              {error && <p className="text-xs text-destructive mt-1">Incorrect passcode</p>}
            </div>
            <Button type="submit" className="w-full">Unlock</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function Dashboard({ passcode, onAuthFailure }: { passcode: string; onAuthFailure: () => void }) {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
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
      .then(setData)
      .catch((e) => setError(e.message || "Failed to load analytics"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [passcode]);

  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-destructive">{error}</div>;
  }
  if (!data) {
    return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading analytics…</div>;
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-7xl">
        <h1 className="text-2xl sm:text-3xl font-display font-bold mb-8">Site Analytics</h1>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
          <StatCard icon={Users} label="Visitors" value={data.totals.visitors} />
          <StatCard icon={Eye} label="Page Views" value={data.totals.page_views} />
          <StatCard icon={MousePointerClick} label="Clicks" value={data.totals.clicks} />
          <StatCard icon={Activity} label="Total Events" value={data.totals.pulses} />
          <StatCard icon={Users} label="Human Visitors" value={data.totals.human_visitors} />
          <StatCard icon={Bot} label="Bot Visitors" value={data.totals.bot_visitors} />
        </div>

        <div className="grid lg:grid-cols-2 gap-6 mb-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Traffic — Last 14 Days</CardTitle></CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.visits_by_day}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="day" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="page_views" name="Page Views" stroke="hsl(24 95% 53%)" strokeWidth={2} />
                  <Line type="monotone" dataKey="unique_visitors" name="Unique Visitors" stroke="hsl(199 89% 48%)" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Top Pages</CardTitle></CardHeader>
            <CardContent className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.top_pages} layout="vertical" margin={{ left: 24 }}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis type="number" tick={{ fontSize: 11 }} allowDecimals={false} />
                  <YAxis type="category" dataKey="page_path" tick={{ fontSize: 11 }} width={120} />
                  <Tooltip />
                  <Bar dataKey="views" fill="hsl(24 95% 53%)" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6 mb-6">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Clock className="h-4 w-4" /> Avg. Time on Page</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {data.avg_time_on_page.length === 0 && <p className="text-sm text-muted-foreground">No data yet.</p>}
              {data.avg_time_on_page.map((p) => (
                <div key={p.page_path} className="flex justify-between text-sm">
                  <span className="truncate max-w-[60%]" title={p.page_path}>{p.page_path}</span>
                  <span className="font-medium">{formatDuration(p.avg_duration_ms)}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Devices</CardTitle></CardHeader>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.device_breakdown} dataKey="count" nameKey="device_type" outerRadius={70} label>
                    {data.device_breakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle className="text-base">Browsers</CardTitle></CardHeader>
            <CardContent className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={data.browser_breakdown} dataKey="count" nameKey="browser" outerRadius={70} label>
                    {data.browser_breakdown.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base">Referrers</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {data.referrers.map((r) => (
                <div key={r.referrer} className="flex justify-between text-sm">
                  <span className="truncate max-w-[70%]" title={r.referrer}>{r.referrer}</span>
                  <span className="font-medium">{r.count}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader><CardTitle className="text-base">Recent Activity</CardTitle></CardHeader>
            <CardContent className="max-h-80 overflow-y-auto space-y-2">
              {data.recent_activity.map((a, i) => (
                <div key={i} className="flex items-center justify-between text-xs border-b border-border/50 pb-2 last:border-0">
                  <div className="min-w-0">
                    <span className="font-medium">{a.event_type}</span>{" "}
                    <span className="text-muted-foreground truncate">{a.page_path}</span>
                    {a.element_text && <span className="text-muted-foreground italic"> — "{a.element_text}"</span>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-3">
                    {a.is_bot && <Bot className="h-3.5 w-3.5 text-muted-foreground" />}
                    <span className="text-muted-foreground">{new Date(a.created_at).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
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
