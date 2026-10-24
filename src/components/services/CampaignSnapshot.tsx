import { useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Activity, ArrowRight, Calendar, Check, FlaskConical, Target as TargetIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CtaLink } from "./CtaLink";
import { PerformanceMetric } from "./PerformanceMetric";
import { primaryServices, snapshotLabels, snapshots, type PlatformKey } from "./servicesContent";

const muted = { color: "hsl(var(--panel-dark-muted))" };

function SnapshotBody({ platform, animateIn }: { platform: PlatformKey; animateIn: boolean }) {
  const reduced = useReducedMotion();
  const snap = snapshots[platform];
  const service = primaryServices.find((s) => s.key === platform)!;
  const chartSummary = snap.weekly.map((w) => `${w.week}: ${w.leads}`).join(", ");

  return (
    <motion.div
      initial={animateIn && !reduced ? { opacity: 0, y: 8 } : false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
      className="grid gap-8 lg:grid-cols-[1.1fr_1fr]"
    >
      <div>
        {/* Campaign identity */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
          <span className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium" style={{ borderColor: "hsl(var(--panel-dark-border))" }}>
            <span className="h-2 w-2 rounded-full" style={{ background: service.indicator }} aria-hidden />
            {service.platformLabel}
          </span>
          <span className="inline-flex items-center gap-1.5 text-xs font-medium text-[#22C55E]">
            <Activity className="h-3.5 w-3.5" aria-hidden />
            {snap.status}
          </span>
        </div>
        <h4 className="mt-4 font-display text-xl font-semibold tracking-tight sm:text-2xl">{snap.campaignName}</h4>
        <dl className="mt-4 grid gap-x-8 gap-y-3 text-sm sm:grid-cols-2">
          <div><dt className="flex items-center gap-1.5 text-xs" style={muted}><TargetIcon className="h-3.5 w-3.5" aria-hidden />Objective</dt><dd className="mt-1 font-medium">{snap.objective}</dd></div>
          <div><dt className="flex items-center gap-1.5 text-xs" style={muted}><Calendar className="h-3.5 w-3.5" aria-hidden />Date range</dt><dd className="mt-1 font-medium">{snap.dateRange}</dd></div>
        </dl>

        {/* Metrics: two columns on phones, three from sm up */}
        <dl className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {snap.metrics.map((m, i) => (
            <PerformanceMetric
              key={m.key}
              label={m.label}
              value={m.value}
              unit={m.unit}
              decimals={m.decimals}
              countUp={animateIn}
              className={i === snap.metrics.length - 1 ? "max-sm:col-span-2" : ""}
            />
          ))}
        </dl>
      </div>

      <div className="flex flex-col">
        {/* Trend chart, with a text alternative carrying the same numbers */}
        <p className="text-sm font-medium">{snapshotLabels.chartTitle}</p>
        <div role="img" aria-label={`${snapshotLabels.chartTitle}. ${chartSummary}.`} className="mt-3 h-44 sm:h-52">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={snap.weekly} margin={{ top: 8, right: 12, left: -8, bottom: 0 }}>
              <defs>
                <linearGradient id={`snapshot-fill-${platform}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.45} />
                  <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="hsl(var(--panel-dark-border))" strokeDasharray="3 4" />
              <XAxis dataKey="week" tickFormatter={(w: string) => w.replace("Week ", "W")} tick={{ fill: "hsl(var(--panel-dark-muted))", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis width={40} tick={{ fill: "hsl(var(--panel-dark-muted))", fontSize: 12 }} axisLine={false} tickLine={false} domain={[0, (max: number) => Math.ceil((max * 1.15) / 10) * 10]} />
              <Tooltip
                cursor={{ stroke: "hsl(var(--primary))", strokeOpacity: 0.35 }}
                contentStyle={{ background: "hsl(var(--panel-dark-bg))", border: "1px solid hsl(var(--panel-dark-border))", borderRadius: 12, fontSize: 13, color: "hsl(var(--panel-dark-text))" }}
                labelStyle={muted}
                formatter={(value: number) => [`${value} leads (sample)`, ""]}
                separator=""
              />
              <Area type="monotone" dataKey="leads" stroke="hsl(var(--primary))" strokeWidth={2.5} fill={`url(#snapshot-fill-${platform})`} isAnimationActive={!reduced} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Strategy explanation */}
        <div className="mt-6 rounded-xl border p-5" style={{ borderColor: "hsl(var(--panel-dark-border))", background: "hsl(0 0% 100% / 0.03)" }}>
          <h4 className="text-sm font-semibold">{snap.strategyHeading}</h4>
          <p className="mt-2 text-sm leading-relaxed" style={muted}>{snap.strategy}</p>
          <ul className="mt-3 space-y-1.5">
            {snap.focus.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm">
                <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
          <CtaLink to={snap.approach.to} className="group mt-4 inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
            {snap.approach.label}
            <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-1" aria-hidden />
          </CtaLink>
        </div>
      </div>
    </motion.div>
  );
}

/**
 * An illustrative campaign view, not an account integration. Every screen of it
 * carries the sample-data label. Figures live in servicesContent.ts.
 */
export function CampaignSnapshot() {
  const [platform, setPlatform] = useState<PlatformKey>("google");
  // The first paint shows final values (and prerenders). Motion starts only after a tab change.
  const [interacted, setInteracted] = useState(false);

  return (
    <section aria-labelledby="campaign-snapshot-title" className="mt-20 sm:mt-24">
      <div
        className="relative overflow-hidden rounded-[1.75rem] border"
        style={{
          background: "linear-gradient(180deg, hsl(var(--panel-dark-card)) 0%, hsl(var(--panel-dark-bg)) 100%)",
          borderColor: "hsl(var(--panel-dark-border))",
          color: "hsl(var(--panel-dark-text))",
          boxShadow: "0 30px 60px -20px rgb(0 0 0 / 0.45)",
        }}
      >
        <div aria-hidden className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full" style={{ background: "hsl(var(--primary) / 0.14)", filter: "blur(90px)" }} />

        <div className="relative p-6 sm:p-8 lg:p-10">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h2 id="campaign-snapshot-title" className="font-display text-2xl font-bold tracking-tight sm:text-3xl">{snapshotLabels.heading}</h2>
              <p className="mt-2 max-w-xl text-sm leading-relaxed" style={muted}>{snapshotLabels.note}</p>
            </div>
            <p className="inline-flex shrink-0 items-center gap-2 self-start rounded-full border border-primary/40 bg-primary/10 px-3.5 py-1.5 text-xs font-semibold tracking-wide text-primary">
              <FlaskConical className="h-3.5 w-3.5" aria-hidden />
              {snapshotLabels.badge}
            </p>
          </div>

          <Tabs
            value={platform}
            onValueChange={(v) => { setPlatform(v as PlatformKey); setInteracted(true); }}
            className="mt-7"
          >
            <TabsList aria-label="Choose a platform" className="grid h-auto w-full max-w-sm grid-cols-2 gap-1 rounded-full border p-1" style={{ borderColor: "hsl(var(--panel-dark-border))", background: "hsl(0 0% 100% / 0.05)" }}>
              {primaryServices.map((s) => (
                <TabsTrigger
                  key={s.key}
                  value={s.key}
                  className="min-h-11 gap-2 rounded-full px-4 text-sm font-semibold text-white/70 data-[state=active]:bg-white/[0.14] data-[state=active]:text-white data-[state=active]:shadow-none"
                >
                  <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.indicator }} aria-hidden />
                  {s.platformLabel}
                </TabsTrigger>
              ))}
            </TabsList>

            {primaryServices.map((s) => (
              <TabsContent key={s.key} value={s.key} className="mt-7 focus-visible:ring-offset-0">
                <SnapshotBody platform={s.key} animateIn={interacted} />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </section>
  );
}
