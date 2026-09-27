import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from "recharts";
import { Search, Target, Palette, TrendingUp, ArrowUpRight, Info } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionLabel } from "@/components/SectionLabel";
import { ScrollReveal } from "@/components/ScrollReveal";

const approachSteps = [
  {
    icon: Search,
    title: "Audit & Research",
    desc: "Map the account, audience and competitive landscape before spending a shilling.",
  },
  {
    icon: Target,
    title: "Structure & Targeting",
    desc: "Build a lean campaign structure aligned to how each platform's algorithm actually learns.",
  },
  {
    icon: Palette,
    title: "Creative Testing",
    desc: "Run multiple angles in parallel, kill the losers fast, double down on what converts.",
  },
  {
    icon: TrendingUp,
    title: "Scale & Optimize",
    desc: "Shift budget toward proven winners while protecting cost-per-result as spend grows.",
  },
];

type Stat = { label: string; value: number; prefix?: string; suffix?: string; decimals?: number };

const platformData: Record<
  "google" | "meta",
  { label: string; dotColor: string; change: number; stats: Stat[]; trend: { week: string; value: number }[] }
> = {
  google: {
    label: "Google Ads",
    dotColor: "#EA4335",
    change: 18,
    stats: [
      { label: "Ad Spend", value: 180, prefix: "KES ", suffix: "K" },
      { label: "Avg. CTR", value: 4.8, suffix: "%", decimals: 1 },
      { label: "Cost / Lead", value: 640, prefix: "KES " },
      { label: "ROAS", value: 5.1, suffix: "x", decimals: 1 },
    ],
    trend: [
      { week: "W1", value: 38 },
      { week: "W2", value: 45 },
      { week: "W3", value: 52 },
      { week: "W4", value: 61 },
      { week: "W5", value: 68 },
      { week: "W6", value: 74 },
    ],
  },
  meta: {
    label: "Meta Ads",
    dotColor: "#1877F2",
    change: 24,
    stats: [
      { label: "Ad Spend", value: 150, prefix: "KES ", suffix: "K" },
      { label: "Avg. CTR", value: 3.6, suffix: "%", decimals: 1 },
      { label: "Cost / Lead", value: 520, prefix: "KES " },
      { label: "ROAS", value: 4.4, suffix: "x", decimals: 1 },
    ],
    trend: [
      { week: "W1", value: 30 },
      { week: "W2", value: 34 },
      { week: "W3", value: 44 },
      { week: "W4", value: 55 },
      { week: "W5", value: 66 },
      { week: "W6", value: 78 },
    ],
  },
};

function NumberTicker({ value, prefix = "", suffix = "", decimals = 0 }: Stat) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const duration = 1200;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setN(p * value);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);

  return (
    <span ref={ref}>
      {prefix}
      {n.toFixed(decimals)}
      {suffix}
    </span>
  );
}

function CampaignSnapshotPanel() {
  const [platform, setPlatform] = useState<"google" | "meta">("google");
  const data = platformData[platform];

  return (
    <Card
      className="corner-brackets p-6 sm:p-7 border relative overflow-hidden lg:sticky lg:top-24"
      style={{
        background: "hsl(var(--panel-dark-card))",
        borderColor: "hsl(var(--panel-dark-border))",
        color: "hsl(var(--panel-dark-text))",
      }}
    >
      <div className="absolute inset-0 dot-grid opacity-40 pointer-events-none [mask-image:radial-gradient(ellipse_80%_70%_at_50%_0%,black_30%,transparent_100%)]" />

      <div className="relative">
        <div className="flex items-start justify-between gap-3 mb-5">
          <div>
            <h3 className="font-display text-lg font-semibold">Campaign Snapshot</h3>
            <p className="text-xs mt-0.5" style={{ color: "hsl(var(--panel-dark-muted))" }}>
              Sample workflow output
            </p>
          </div>
          <Badge variant="outline" className="text-[10px] tracking-wide shrink-0 border-white/20 bg-white/5 text-white/80">
            SAMPLE DATA
          </Badge>
        </div>

        <Tabs value={platform} onValueChange={(v) => setPlatform(v as "google" | "meta")}>
          <TabsList className="bg-white/5 border border-white/10 mb-6">
            {(Object.keys(platformData) as Array<"google" | "meta">).map((key) => (
              <TabsTrigger
                key={key}
                value={key}
                className="gap-2 data-[state=active]:bg-white/10 data-[state=active]:text-white text-white/60"
              >
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ background: platformData[key].dotColor }}
                  aria-hidden
                />
                {platformData[key].label}
              </TabsTrigger>
            ))}
          </TabsList>

          {(Object.keys(platformData) as Array<"google" | "meta">).map((key) => (
            <TabsContent key={key} value={key} className="mt-0 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {platformData[key].stats.map((s) => (
                  <div key={s.label}>
                    <p className="text-2xl font-display font-bold">
                      <NumberTicker {...s} />
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "hsl(var(--panel-dark-muted))" }}>
                      {s.label}
                    </p>
                  </div>
                ))}
              </div>

              <div className="flex items-center gap-1.5 text-xs">
                <ArrowUpRight className="h-3.5 w-3.5 text-green-500" aria-hidden />
                <span className="text-green-500 font-medium">+{platformData[key].change}%</span>
                <span style={{ color: "hsl(var(--panel-dark-muted))" }}>vs. baseline (illustrative)</span>
              </div>

              <div className="h-28 -mx-2">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={platformData[key].trend} margin={{ top: 4, right: 8, left: 8, bottom: 0 }}>
                    <defs>
                      <linearGradient id={`trend-${key}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis
                      dataKey="week"
                      tick={{ fill: "hsl(var(--panel-dark-muted))", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      cursor={{ stroke: "hsl(var(--primary))", strokeOpacity: 0.3 }}
                      contentStyle={{
                        background: "hsl(var(--panel-dark-bg))",
                        border: "1px solid hsl(var(--panel-dark-border))",
                        borderRadius: 8,
                        fontSize: 12,
                        color: "hsl(var(--panel-dark-text))",
                      }}
                      labelStyle={{ color: "hsl(var(--panel-dark-muted))" }}
                      formatter={(value: number) => [`${value} (sample index)`, "Performance"]}
                    />
                    <Area
                      type="monotone"
                      dataKey="value"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fill={`url(#trend-${key})`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[11px] leading-relaxed" style={{ color: "hsl(var(--panel-dark-muted))" }}>
                Illustrative performance index over a 6-week sample period — not tied to a real account or client.
              </p>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </Card>
  );
}

export function PaidMediaApproachSection() {
  return (
    <section className="container mx-auto px-4 py-20">
      <div className="text-center mb-4 space-y-4">
        <SectionLabel>MY APPROACH</SectionLabel>
        <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold">
          How I Approach <span className="text-gradient">Paid Media</span>
        </h2>
        <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
          A look at the process and reporting style behind every campaign I run.
        </p>
      </div>

      <div className="flex items-start gap-2 max-w-2xl mx-auto mb-16 text-xs text-muted-foreground bg-muted/50 border border-border/60 rounded-lg px-4 py-3">
        <Info className="h-4 w-4 text-primary mt-0.5 shrink-0" aria-hidden />
        <p>
          <strong className="text-foreground">This is a capability showcase, not a case study.</strong>{" "}
          The Campaign Snapshot uses illustrative sample data to demonstrate how campaigns are structured and
          reported — it is not a real client, account or result. For real results, see the{" "}
          <a href="#results" className="text-primary underline underline-offset-2">
            Results
          </a>{" "}
          section below.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 max-w-6xl mx-auto items-start">
        <div className="space-y-8">
          {approachSteps.map((step, i) => (
            <ScrollReveal key={step.title} direction="left" delay={i * 0.08}>
              <div className="flex gap-4">
                <div className="h-11 w-11 rounded-full bg-primary/10 flex items-center justify-center ring-1 ring-primary/20 shrink-0">
                  <step.icon className="h-5 w-5 text-primary" aria-hidden />
                </div>
                <div>
                  <h3 className="font-display text-lg font-semibold mb-1">{step.title}</h3>
                  <p className="text-sm text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal direction="right" delay={0.1}>
          <CampaignSnapshotPanel />
        </ScrollReveal>
      </div>
    </section>
  );
}

export default PaidMediaApproachSection;
