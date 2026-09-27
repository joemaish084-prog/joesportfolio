import { useEffect, useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from "recharts";
import { Search, Target, Palette, TrendingUp, ArrowUpRight, Info } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SectionLabel } from "@/components/SectionLabel";
import { ScrollReveal } from "@/components/ScrollReveal";

const approachSteps = [
  {
    icon: Search,
    n: "01",
    title: "Audit & Research",
    desc: "Map the account, audience and competitive landscape before spending a shilling.",
    details: [
      "Review historical account data and past creative performance",
      "Competitor ad and offer research on the platform",
      "Define audience segments, offer and success metrics upfront",
    ],
  },
  {
    icon: Target,
    n: "02",
    title: "Structure & Targeting",
    desc: "Build a lean campaign structure aligned to how each platform's algorithm actually learns.",
    details: [
      "Consolidated structure — no budget fragmented across duplicate ad sets",
      "Targeting set broad enough for the algorithm to find signal fast",
      "Conversion tracking verified before launch, not after",
    ],
  },
  {
    icon: Palette,
    n: "03",
    title: "Creative Testing",
    desc: "Run multiple angles in parallel, kill the losers fast, double down on what converts.",
    details: [
      "3–5 creative angles tested simultaneously in the first 7–10 days",
      "Underperformers cut early based on CTR and cost-per-result, not gut feel",
      "Winning hooks reused to brief the next batch of creative",
    ],
  },
  {
    icon: TrendingUp,
    n: "04",
    title: "Scale & Optimize",
    desc: "Shift budget toward proven winners while protecting cost-per-result as spend grows.",
    details: [
      "Budget shifted incrementally toward winners to avoid resetting learning",
      "Weekly check-ins on CPA/ROAS trend, not just week-over-week snapshots",
      "Monthly report ties spend directly back to leads and revenue impact",
    ],
  },
];

type Stat = { label: string; value: number; prefix?: string; suffix?: string; decimals?: number };
type FunnelStage = { label: string; value: number; suffix?: string; decimals?: number };
type Creative = { name: string; ctr: number };

const platformData: Record<
  "google" | "meta",
  {
    label: string;
    dotColor: string;
    change: number;
    stats: Stat[];
    funnel: FunnelStage[];
    creatives: Creative[];
    trend: { week: string; value: number }[];
  }
> = {
  google: {
    label: "Google Ads",
    dotColor: "#EA4335",
    change: 18,
    stats: [
      { label: "Ad Spend", value: 180, prefix: "KES ", suffix: "K" },
      { label: "Avg. CTR", value: 4.8, suffix: "%", decimals: 1 },
      { label: "Cost / Lead", value: 643, prefix: "KES " },
      { label: "ROAS", value: 5.1, suffix: "x", decimals: 1 },
    ],
    funnel: [
      { label: "Impressions", value: 240, suffix: "K" },
      { label: "Clicks", value: 11.5, suffix: "K", decimals: 1 },
      { label: "Leads", value: 280 },
    ],
    creatives: [
      { name: "Variant A", ctr: 5.6 },
      { name: "Variant B", ctr: 4.8 },
      { name: "Variant C", ctr: 3.2 },
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
      { label: "Cost / Lead", value: 517, prefix: "KES " },
      { label: "ROAS", value: 4.4, suffix: "x", decimals: 1 },
    ],
    funnel: [
      { label: "Impressions", value: 300, suffix: "K" },
      { label: "Clicks", value: 10.8, suffix: "K", decimals: 1 },
      { label: "Leads", value: 290 },
    ],
    creatives: [
      { name: "Variant A", ctr: 4.5 },
      { name: "Variant B", ctr: 3.6 },
      { name: "Variant C", ctr: 2.4 },
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

function FunnelRow({ stages }: { stages: FunnelStage[] }) {
  return (
    <div className="flex items-center">
      {stages.map((stage, i) => (
        <div key={stage.label} className="flex items-center flex-1 last:flex-none">
          <div className="text-center px-1">
            <p className="text-xl font-display font-semibold tracking-tight whitespace-nowrap">
              <NumberTicker {...stage} />
            </p>
            <p className="text-[10px] uppercase tracking-[0.12em] mt-0.5" style={{ color: "hsl(var(--panel-dark-muted))" }}>
              {stage.label}
            </p>
          </div>
          {i < stages.length - 1 && (
            <div className="flex-1 h-px mx-2 bg-gradient-to-r from-white/15 via-white/5 to-white/15" aria-hidden />
          )}
        </div>
      ))}
    </div>
  );
}

function CreativeBars({ creatives }: { creatives: Creative[] }) {
  const max = Math.max(...creatives.map((c) => c.ctr));
  return (
    <div className="space-y-2.5">
      {creatives.map((c, i) => {
        const pct = (c.ctr / max) * 100;
        const isBest = c.ctr === max;
        return (
          <div key={c.name} className="flex items-center gap-3">
            <span className="text-xs w-16 shrink-0" style={{ color: "hsl(var(--panel-dark-muted))" }}>
              {c.name}
            </span>
            <div className="flex-1 h-1.5 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full rounded-full"
                style={{ background: "hsl(var(--primary))" }}
                initial={{ width: 0, opacity: isBest ? 1 : 0.4 }}
                whileInView={{ width: `${pct}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
            <span className={`text-xs w-10 text-right shrink-0 font-medium ${isBest ? "text-primary" : ""}`} style={!isBest ? { color: "hsl(var(--panel-dark-muted))" } : undefined}>
              {c.ctr}%
            </span>
          </div>
        );
      })}
    </div>
  );
}

function CampaignSnapshotPanel() {
  const [platform, setPlatform] = useState<"google" | "meta">("google");

  return (
    <div
      className="relative rounded-[1.75rem] overflow-hidden border lg:sticky lg:top-24"
      style={{
        background: "linear-gradient(180deg, hsl(var(--panel-dark-card)) 0%, hsl(var(--panel-dark-bg)) 100%)",
        borderColor: "hsl(var(--panel-dark-border))",
        color: "hsl(var(--panel-dark-text))",
        boxShadow: "0 30px 60px -20px rgb(0 0 0 / 0.45)",
      }}
    >
      {/* Ambient glow + texture */}
      <div
        className="absolute -top-24 -right-16 w-72 h-72 rounded-full pointer-events-none"
        style={{ background: "hsl(var(--primary) / 0.16)", filter: "blur(90px)" }}
        aria-hidden
      />
      <div className="absolute inset-0 dot-grid opacity-[0.15] pointer-events-none [mask-image:radial-gradient(ellipse_80%_60%_at_50%_0%,black_20%,transparent_100%)]" />
      <div
        className="absolute inset-x-0 top-0 h-px"
        style={{ background: "linear-gradient(90deg, transparent, hsl(0 0% 100% / 0.25), transparent)" }}
        aria-hidden
      />

      <div className="relative p-6 sm:p-8">
        <div className="flex items-start justify-between gap-3 mb-6">
          <div>
            <h3 className="font-display text-xl font-semibold tracking-tight">Campaign Snapshot</h3>
            <p className="text-xs mt-1" style={{ color: "hsl(var(--panel-dark-muted))" }}>
              Sample workflow output
            </p>
          </div>
          <Badge variant="outline" className="text-[10px] tracking-wide shrink-0 border-white/15 bg-white/[0.06] text-white/70 font-normal">
            SAMPLE DATA
          </Badge>
        </div>

        <Tabs value={platform} onValueChange={(v) => setPlatform(v as "google" | "meta")}>
          <TabsList className="bg-white/[0.06] border border-white/10 rounded-full p-1 h-auto mb-7">
            {(Object.keys(platformData) as Array<"google" | "meta">).map((key) => (
              <TabsTrigger
                key={key}
                value={key}
                className="gap-2 rounded-full px-4 py-1.5 text-xs data-[state=active]:bg-white/[0.12] data-[state=active]:text-white data-[state=active]:shadow-none text-white/50 transition-colors"
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
            <TabsContent key={key} value={key} className="mt-0 space-y-7 focus-visible:outline-none">
              <FunnelRow stages={platformData[key].funnel} />

              <div className="h-px" style={{ background: "hsl(var(--panel-dark-border))" }} />

              <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                {platformData[key].stats.map((s) => (
                  <div key={s.label}>
                    <p className="text-[1.75rem] leading-none font-display font-semibold tracking-tight">
                      <NumberTicker {...s} />
                    </p>
                    <p className="text-xs mt-1.5" style={{ color: "hsl(var(--panel-dark-muted))" }}>
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
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.45} />
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
                        borderRadius: 12,
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
                      strokeWidth={2.5}
                      fill={`url(#trend-${key})`}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[11px] -mt-3" style={{ color: "hsl(var(--panel-dark-muted))" }}>
                6-week performance index (sample)
              </p>

              <div className="h-px" style={{ background: "hsl(var(--panel-dark-border))" }} />

              <div>
                <div className="flex items-center justify-between mb-3">
                  <p className="text-[10px] uppercase tracking-[0.12em]" style={{ color: "hsl(var(--panel-dark-muted))" }}>
                    Creative Test — CTR by Variant
                  </p>
                  <span className="text-[10px] font-medium text-primary">Winner: Variant A</span>
                </div>
                <CreativeBars creatives={platformData[key].creatives} />
              </div>

              <p className="text-[11px] leading-relaxed pt-1" style={{ color: "hsl(var(--panel-dark-muted))" }}>
                All figures on this panel are illustrative sample data for demonstration — not a real account,
                client or result.
              </p>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
}

export function PaidMediaApproachSection() {
  return (
    <section className="relative overflow-hidden">
      {/* Ambient background glow — same visual language as the hero */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[10%] left-[-8%] w-[28rem] h-[28rem] rounded-full bg-primary/[0.05] blur-[130px]" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[26rem] h-[26rem] rounded-full bg-primary/[0.04] blur-[130px]" />
      </div>

      <div className="relative container mx-auto px-4 py-20 sm:py-28">
        <div className="text-center mb-6 space-y-5">
          <SectionLabel>MY APPROACH</SectionLabel>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-semibold tracking-tight">
            How I Approach <span className="font-serif italic font-normal text-primary">Paid Media</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">
            A detailed look at the process and reporting style behind every campaign I run.
          </p>
        </div>

        <div className="flex justify-center mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 max-w-xl text-xs text-muted-foreground rounded-full border border-border/60 bg-muted/40 backdrop-blur-sm px-4 py-2">
            <Info className="h-3.5 w-3.5 text-primary shrink-0" aria-hidden />
            <span>
              <strong className="text-foreground font-medium">Capability showcase, not a case study</strong> — the
              Campaign Snapshot uses illustrative sample data.{" "}
              <a href="#results" className="text-primary underline underline-offset-2">
                See real results
              </a>
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-x-16 gap-y-14 max-w-6xl mx-auto items-start">
          <div>
            {approachSteps.map((step, i) => (
              <ScrollReveal key={step.title} direction="up" delay={i * 0.08}>
                <div className={`flex gap-5 py-7 ${i > 0 ? "border-t border-border/50" : ""}`}>
                  <span className="font-serif italic text-3xl sm:text-4xl text-primary/25 leading-none shrink-0 w-12 sm:w-14">
                    {step.n}
                  </span>
                  <div>
                    <div className="flex items-center gap-2 mb-1.5">
                      <step.icon className="h-4 w-4 text-primary shrink-0" aria-hidden />
                      <h3 className="font-display text-lg font-semibold tracking-tight">{step.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3 leading-relaxed">{step.desc}</p>
                    <ul className="space-y-1.5">
                      {step.details.map((d) => (
                        <li key={d} className="flex items-start gap-2 text-sm text-muted-foreground">
                          <span className="h-1 w-1 rounded-full bg-primary/60 mt-2 shrink-0" aria-hidden />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </ScrollReveal>
            ))}
          </div>

          <ScrollReveal direction="right" delay={0.1}>
            <CampaignSnapshotPanel />
          </ScrollReveal>
        </div>
      </div>
    </section>
  );
}

export default PaidMediaApproachSection;
