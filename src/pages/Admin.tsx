import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useTheme } from "next-themes";
import {
  Activity,
  Bot,
  CalendarClock,
  Command as CommandIcon,
  Compass,
  FileText,
  Inbox,
  Keyboard,
  Layers,
  LayoutGrid,
  List,
  Lock,
  LogOut,
  Monitor,
  MousePointerClick,
  Moon,
  Pause,
  Play,
  RefreshCw,
  Rows3,
  Sparkles,
  Sun,
  Users,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { useToast } from "@/hooks/use-toast";
import { RANGE_OPTIONS, relativeTime } from "@/components/admin/format";
import { Segmented, type Density } from "@/components/admin/ui";
import {
  AcquisitionPanel,
  AudiencePanel,
  CrawlersPanel,
  FeedPanel,
  InsightsPanel,
  InteractionPanel,
  LeadsPanel,
  OverviewPanel,
  PagesPanel,
  SessionsPanel,
  TimingPanel,
  VisitorsPanel,
  type PanelProps,
} from "@/components/admin/panels";
import type { AnalyticsData } from "@/components/admin/types";

const PASSCODE_SESSION_KEY = "admin_passcode";
const PREFS_KEY = "admin_prefs_v1";
const PULSE_BASE_URL = import.meta.env.VITE_SUPABASE_URL;

/* -------------------------------------------------------------------------- */
/*  Tabs                                                                      */
/* -------------------------------------------------------------------------- */

interface TabDef {
  id: string;
  label: string;
  icon: LucideIcon;
  group: string;
  /** Shown under the page title in the header. */
  blurb: string;
  Panel: (props: PanelProps) => JSX.Element;
}

const TABS: TabDef[] = [
  {
    id: "overview",
    label: "Overview",
    icon: LayoutGrid,
    group: "Traffic",
    blurb: "Headline numbers and the trend behind them",
    Panel: OverviewPanel,
  },
  {
    id: "insights",
    label: "Insights",
    icon: Sparkles,
    group: "Traffic",
    blurb: "Everything worth noticing in this range",
    Panel: InsightsPanel,
  },
  {
    id: "acquisition",
    label: "Acquisition",
    icon: Compass,
    group: "Traffic",
    blurb: "Where your traffic actually comes from",
    Panel: AcquisitionPanel,
  },
  {
    id: "timing",
    label: "Timing",
    icon: CalendarClock,
    group: "Traffic",
    blurb: "When people show up, by day and hour",
    Panel: TimingPanel,
  },
  {
    id: "pages",
    label: "Pages",
    icon: FileText,
    group: "Content",
    blurb: "Per-page traffic, dwell time and drop-off",
    Panel: PagesPanel,
  },
  {
    id: "interaction",
    label: "Interaction",
    icon: MousePointerClick,
    group: "Content",
    blurb: "What visitors click and how deep they go",
    Panel: InteractionPanel,
  },
  {
    id: "audience",
    label: "Audience",
    icon: Monitor,
    group: "People",
    blurb: "Devices, browsers, systems and loyalty",
    Panel: AudiencePanel,
  },
  {
    id: "visitors",
    label: "Visitors",
    icon: Users,
    group: "People",
    blurb: "Individual visitors and their activity",
    Panel: VisitorsPanel,
  },
  {
    id: "sessions",
    label: "Sessions",
    icon: Layers,
    group: "People",
    blurb: "Individual visits, entry to exit",
    Panel: SessionsPanel,
  },
  {
    id: "crawlers",
    label: "Crawlers",
    icon: Bot,
    group: "People",
    blurb: "Search and AI bots reaching your pages",
    Panel: CrawlersPanel,
  },
  {
    id: "leads",
    label: "Leads",
    icon: Inbox,
    group: "Business",
    blurb: "Captured enquiries and how they convert",
    Panel: LeadsPanel,
  },
  {
    id: "feed",
    label: "Event feed",
    icon: List,
    group: "Raw",
    blurb: "The raw event stream, unaggregated",
    Panel: FeedPanel,
  },
];

const TAB_GROUPS = ["Traffic", "Content", "People", "Business", "Raw"];

const AUTO_REFRESH_OPTIONS = [
  { value: 0, label: "Off" },
  { value: 30, label: "30s" },
  { value: 60, label: "1m" },
  { value: 300, label: "5m" },
];

/* -------------------------------------------------------------------------- */
/*  Preferences                                                               */
/* -------------------------------------------------------------------------- */

interface Prefs {
  tab: string;
  rangeDays: number;
  density: Density;
  includeBots: boolean;
  autoRefresh: number;
}

const DEFAULT_PREFS: Prefs = {
  tab: "overview",
  rangeDays: 14,
  density: "cosy",
  includeBots: true,
  autoRefresh: 0,
};

/** Survives reloads so the dashboard opens where you left it. */
function usePrefs() {
  const [prefs, setPrefs] = useState<Prefs>(() => {
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      if (!raw) return DEFAULT_PREFS;
      const parsed = JSON.parse(raw) as Partial<Prefs>;
      return { ...DEFAULT_PREFS, ...parsed };
    } catch {
      return DEFAULT_PREFS;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
    } catch {
      // Preferences are a convenience; never let storage failures break the page.
    }
  }, [prefs]);

  const update = useCallback(<K extends keyof Prefs>(key: K, value: Prefs[K]) => {
    setPrefs((p) => ({ ...p, [key]: value }));
  }, []);

  return { prefs, update };
}

/* -------------------------------------------------------------------------- */
/*  Gate                                                                      */
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
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      {/* Soft accent wash so the gate feels part of the site rather than a bare form. */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[110px]"
      />
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-sm"
      >
        <Card className="border-border/60 shadow-none">
          <CardHeader className="pb-3">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl border border-border/60 bg-muted/40">
              <Lock className="h-4 w-4 text-primary" aria-hidden />
            </div>
            <CardTitle className="text-base font-semibold">Site Analytics</CardTitle>
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
                {error && <p className="mt-1.5 text-xs text-destructive">Incorrect passcode</p>}
              </div>
              <Button type="submit" size="sm" className="w-full">
                Unlock
              </Button>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
        {Array.from({ length: 8 }).map((_, i) => (
          <Skeleton key={i} className="h-[118px] rounded-xl" />
        ))}
      </div>
      <div className="grid gap-5 xl:grid-cols-3">
        <Skeleton className="h-[380px] rounded-xl xl:col-span-2" />
        <Skeleton className="h-[380px] rounded-xl" />
      </div>
      <div className="grid gap-5 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-56 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Shortcuts dialog                                                          */
/* -------------------------------------------------------------------------- */

const SHORTCUTS: [string, string][] = [
  ["⌘K / Ctrl K", "Open the command palette"],
  ["1 – 5", "Switch range (24h, 7d, 14d, 30d, 90d)"],
  ["R", "Refresh now"],
  ["B", "Toggle bot traffic"],
  ["D", "Toggle row density"],
  ["T", "Toggle light and dark"],
  ["J / K", "Next or previous tab"],
  ["?", "Show this list"],
];

function ShortcutsDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (v: boolean) => void }) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-base">
            <Keyboard className="h-4 w-4" /> Keyboard shortcuts
          </DialogTitle>
        </DialogHeader>
        <dl className="space-y-2">
          {SHORTCUTS.map(([keys, desc]) => (
            <div key={keys} className="flex items-center justify-between gap-4 text-[13px]">
              <dt className="text-muted-foreground">{desc}</dt>
              <dd>
                <kbd className="rounded border border-border/60 bg-muted px-1.5 py-0.5 font-mono text-[10.5px] text-foreground">
                  {keys}
                </kbd>
              </dd>
            </div>
          ))}
        </dl>
      </DialogContent>
    </Dialog>
  );
}

/* -------------------------------------------------------------------------- */
/*  Dashboard                                                                 */
/* -------------------------------------------------------------------------- */

function Dashboard({ passcode, onAuthFailure }: { passcode: string; onAuthFailure: () => void }) {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const { prefs, update } = usePrefs();

  const [data, setData] = useState<AnalyticsData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [refreshedAt, setRefreshedAt] = useState<Date | null>(null);
  const [loading, setLoading] = useState(false);
  const [paletteOpen, setPaletteOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [secondsToRefresh, setSecondsToRefresh] = useState<number | null>(null);
  const isFirstLoad = useRef(true);

  const activeTab = useMemo(
    () => TABS.find((t) => t.id === prefs.tab) ?? TABS[0],
    [prefs.tab],
  );

  const load = useCallback(
    (opts?: { silent?: boolean }) => {
      setLoading(true);
      fetch(`${PULSE_BASE_URL}/functions/v1/admin-analytics?days=${prefs.rangeDays}`, {
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
          if (!opts?.silent && !isFirstLoad.current) toast({ title: "Analytics refreshed" });
          isFirstLoad.current = false;
        })
        .catch((e) => {
          setError(e.message || "Failed to load analytics");
          if (!opts?.silent) toast({ title: "Refresh failed", description: e.message, variant: "destructive" });
        })
        .finally(() => setLoading(false));
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [passcode, prefs.rangeDays],
  );

  useEffect(() => load({ silent: true }), [load]);

  // Auto-refresh with a visible countdown, so a stale dashboard is obvious.
  useEffect(() => {
    if (!prefs.autoRefresh) {
      setSecondsToRefresh(null);
      return;
    }
    setSecondsToRefresh(prefs.autoRefresh);
    const tick = setInterval(() => {
      setSecondsToRefresh((s) => {
        if (s === null) return null;
        if (s <= 1) {
          load({ silent: true });
          return prefs.autoRefresh;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [prefs.autoRefresh, load]);

  const goToTab = useCallback(
    (offset: number) => {
      const i = TABS.findIndex((t) => t.id === prefs.tab);
      const next = TABS[(i + offset + TABS.length) % TABS.length];
      update("tab", next.id);
    },
    [prefs.tab, update],
  );

  // Keyboard shortcuts. Ignored while typing so table filters keep working.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const el = e.target as HTMLElement | null;
      const typing =
        el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
        return;
      }
      if (typing || e.metaKey || e.ctrlKey || e.altKey) return;

      if (e.key >= "1" && e.key <= "5") {
        const opt = RANGE_OPTIONS[Number(e.key) - 1];
        if (opt) update("rangeDays", opt.days);
        return;
      }
      switch (e.key.toLowerCase()) {
        case "r":
          load();
          break;
        case "b":
          update("includeBots", !prefs.includeBots);
          break;
        case "d":
          update("density", prefs.density === "cosy" ? "compact" : "cosy");
          break;
        case "t":
          setTheme(theme === "dark" ? "light" : "dark");
          break;
        case "j":
          goToTab(1);
          break;
        case "k":
          goToTab(-1);
          break;
        case "?":
          setShortcutsOpen(true);
          break;
        default:
          break;
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prefs.includeBots, prefs.density, theme, setTheme, update, load, goToTab]);

  const rangeLabel = prefs.rangeDays === 1 ? "the last 24 hours" : `the last ${prefs.rangeDays} days`;
  const ActivePanel = activeTab.Panel;

  return (
    <SidebarProvider>
      <Sidebar className="border-r border-border/60">
        <SidebarHeader className="border-b border-border/60 px-3 py-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-[hsl(33_100%_58%)] text-[11px] font-bold text-white shadow-sm">
              JM
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold">Analytics</p>
              <p className="text-[11px] text-muted-foreground">josephmaina.co.ke</p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          {TAB_GROUPS.map((group) => (
            <SidebarGroup key={group}>
              <SidebarGroupLabel>{group}</SidebarGroupLabel>
              <SidebarMenu>
                {TABS.filter((t) => t.group === group).map((tab) => (
                  <SidebarMenuItem key={tab.id}>
                    <SidebarMenuButton onClick={() => update("tab", tab.id)} isActive={prefs.tab === tab.id}>
                      <tab.icon />
                      <span>{tab.label}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarFooter className="gap-1 border-t border-border/60 p-3">
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground"
            onClick={() => setPaletteOpen(true)}
          >
            <CommandIcon className="h-4 w-4" /> Command palette
            <kbd className="ml-auto rounded border border-border/60 bg-muted px-1 font-mono text-[10px]">⌘K</kbd>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground"
            onClick={() => setShortcutsOpen(true)}
          >
            <Keyboard className="h-4 w-4" /> Shortcuts
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground"
            onClick={onAuthFailure}
          >
            <LogOut className="h-4 w-4" /> Lock dashboard
          </Button>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        {/* Indeterminate top bar — the only loading signal once data is on screen. */}
        <div className="pointer-events-none fixed left-0 right-0 top-0 z-50 h-[2px]">
          <AnimatePresence>
            {loading && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="h-full overflow-hidden"
              >
                <motion.div
                  className="h-full w-1/3 bg-gradient-to-r from-transparent via-primary to-transparent"
                  animate={{ x: ["-100%", "400%"] }}
                  transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <header className="sticky top-0 z-20 border-b border-border/60 bg-background/80 backdrop-blur-xl">
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
            <div className="flex min-w-0 items-center gap-3">
              <SidebarTrigger className="-ml-1" />
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="truncate text-sm font-semibold">{activeTab.label}</h1>
                  <span className="inline-flex items-center gap-1.5 text-[11px] text-muted-foreground">
                    <span className="relative flex h-1.5 w-1.5">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-500 opacity-75" />
                      <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    </span>
                    Live
                  </span>
                </div>
                <p className="hidden truncate text-[11px] text-muted-foreground sm:block">{activeTab.blurb}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <Segmented<number>
                options={RANGE_OPTIONS.map((o) => ({ value: o.days, label: o.label }))}
                value={prefs.rangeDays}
                onChange={(v) => update("rangeDays", v)}
              />
              <Segmented
                options={[
                  { value: "with", label: "All" },
                  { value: "without", label: "Humans" },
                ]}
                value={prefs.includeBots ? "with" : "without"}
                onChange={(v) => update("includeBots", v === "with")}
                size="xs"
              />

              <IconToggle
                label={prefs.density === "cosy" ? "Switch to compact rows" : "Switch to comfortable rows"}
                onClick={() => update("density", prefs.density === "cosy" ? "compact" : "cosy")}
              >
                <Rows3 className="h-3.5 w-3.5" />
              </IconToggle>

              <IconToggle
                label={theme === "dark" ? "Switch to light" : "Switch to dark"}
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                {theme === "dark" ? <Sun className="h-3.5 w-3.5" /> : <Moon className="h-3.5 w-3.5" />}
              </IconToggle>

              <Tooltip>
                <TooltipTrigger asChild>
                  <div className="flex items-center gap-1 rounded-lg border border-border/60 bg-muted/30 p-0.5">
                    <span className="flex h-6 w-6 items-center justify-center text-muted-foreground">
                      {prefs.autoRefresh ? <Play className="h-3 w-3" /> : <Pause className="h-3 w-3" />}
                    </span>
                    {AUTO_REFRESH_OPTIONS.map((o) => (
                      <button
                        key={o.value}
                        onClick={() => update("autoRefresh", o.value)}
                        className={`rounded-[6px] px-1.5 py-1 text-[11px] font-medium transition-all ${
                          prefs.autoRefresh === o.value
                            ? "bg-background text-foreground shadow-sm ring-1 ring-border/60"
                            : "text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {o.label}
                      </button>
                    ))}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="bottom">
                  {prefs.autoRefresh
                    ? `Auto-refreshing every ${prefs.autoRefresh}s${
                        secondsToRefresh !== null ? ` — next in ${secondsToRefresh}s` : ""
                      }`
                    : "Auto-refresh is off"}
                </TooltipContent>
              </Tooltip>

              {refreshedAt && (
                <span className="hidden text-[11px] tabular-nums text-muted-foreground 2xl:inline">
                  {relativeTime(refreshedAt.toISOString())}
                </span>
              )}

              <Button variant="outline" size="sm" onClick={() => load()} disabled={loading} className="h-8">
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                <span className="hidden sm:inline">Refresh</span>
              </Button>
            </div>
          </div>
        </header>

        <div className="mx-auto w-full max-w-[1700px] px-4 py-5 sm:px-6">
          {error && (
            <div className="mb-5 rounded-xl border border-destructive/40 bg-destructive/5 px-4 py-3 text-sm text-destructive">
              {error}
            </div>
          )}

          {!data && !error && <DashboardSkeleton />}

          {data && (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab.id}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              >
                <ActivePanel
                  data={data}
                  density={prefs.density}
                  rangeLabel={rangeLabel}
                  includeBots={prefs.includeBots}
                />
              </motion.div>
            </AnimatePresence>
          )}

          {data && (
            <p className="pt-6 text-[11px] leading-relaxed text-muted-foreground">
              Generated {new Date(data.generated_at).toLocaleString()} · hour-of-day figures bucketed in{" "}
              {data.timezone} · dwell times are heartbeat-derived and include time an open tab spends idle.
            </p>
          )}
        </div>
      </SidebarInset>

      <CommandDialog open={paletteOpen} onOpenChange={setPaletteOpen}>
        <CommandInput placeholder="Jump to a tab, change the range, or run an action…" />
        <CommandList>
          <CommandEmpty>Nothing matches.</CommandEmpty>
          {TAB_GROUPS.map((group) => (
            <CommandGroup key={group} heading={group}>
              {TABS.filter((t) => t.group === group).map((tab) => (
                <CommandItem
                  key={tab.id}
                  value={`${tab.label} ${tab.blurb}`}
                  onSelect={() => {
                    update("tab", tab.id);
                    setPaletteOpen(false);
                  }}
                >
                  <tab.icon className="mr-2 h-4 w-4" />
                  {tab.label}
                  <span className="ml-2 truncate text-xs text-muted-foreground">{tab.blurb}</span>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
          <CommandSeparator />
          <CommandGroup heading="Range">
            {RANGE_OPTIONS.map((o, i) => (
              <CommandItem
                key={o.days}
                value={`range ${o.label}`}
                onSelect={() => {
                  update("rangeDays", o.days);
                  setPaletteOpen(false);
                }}
              >
                <CalendarClock className="mr-2 h-4 w-4" />
                Last {o.label}
                <CommandShortcut>{i + 1}</CommandShortcut>
              </CommandItem>
            ))}
          </CommandGroup>
          <CommandSeparator />
          <CommandGroup heading="Actions">
            <CommandItem
              value="refresh reload"
              onSelect={() => {
                load();
                setPaletteOpen(false);
              }}
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh now
              <CommandShortcut>R</CommandShortcut>
            </CommandItem>
            <CommandItem
              value="toggle bots traffic"
              onSelect={() => {
                update("includeBots", !prefs.includeBots);
                setPaletteOpen(false);
              }}
            >
              <Bot className="mr-2 h-4 w-4" /> {prefs.includeBots ? "Hide bot traffic" : "Show bot traffic"}
              <CommandShortcut>B</CommandShortcut>
            </CommandItem>
            <CommandItem
              value="density rows compact"
              onSelect={() => {
                update("density", prefs.density === "cosy" ? "compact" : "cosy");
                setPaletteOpen(false);
              }}
            >
              <Rows3 className="mr-2 h-4 w-4" />
              {prefs.density === "cosy" ? "Compact rows" : "Comfortable rows"}
              <CommandShortcut>D</CommandShortcut>
            </CommandItem>
            <CommandItem
              value="theme dark light"
              onSelect={() => {
                setTheme(theme === "dark" ? "light" : "dark");
                setPaletteOpen(false);
              }}
            >
              {theme === "dark" ? <Sun className="mr-2 h-4 w-4" /> : <Moon className="mr-2 h-4 w-4" />}
              Switch to {theme === "dark" ? "light" : "dark"}
              <CommandShortcut>T</CommandShortcut>
            </CommandItem>
            <CommandItem
              value="keyboard shortcuts help"
              onSelect={() => {
                setShortcutsOpen(true);
                setPaletteOpen(false);
              }}
            >
              <Keyboard className="mr-2 h-4 w-4" /> Keyboard shortcuts
              <CommandShortcut>?</CommandShortcut>
            </CommandItem>
            <CommandItem
              value="lock sign out"
              onSelect={() => {
                setPaletteOpen(false);
                onAuthFailure();
              }}
            >
              <LogOut className="mr-2 h-4 w-4" /> Lock dashboard
            </CommandItem>
          </CommandGroup>
        </CommandList>
      </CommandDialog>

      <ShortcutsDialog open={shortcutsOpen} onOpenChange={setShortcutsOpen} />
    </SidebarProvider>
  );
}

function IconToggle({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button variant="outline" size="icon" className="h-8 w-8" onClick={onClick} aria-label={label}>
          {children}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{label}</TooltipContent>
    </Tooltip>
  );
}

/* -------------------------------------------------------------------------- */

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
