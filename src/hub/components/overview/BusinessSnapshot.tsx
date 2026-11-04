import { Link } from "react-router-dom";
import { ArrowUpRight, CheckCircle2, CircleDot, Target, UserCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { KesTicker, NumberTicker } from "../motion/number-ticker";
import { PrivateBlur } from "../privacy";
import { SkeletonBlock } from "../ui";
import { AvatarStack } from "./visuals";

type SnapshotStats = {
  active: number;
  activeNames: string[];
  retainer: number;
  projects: number;
  onboarding: number;
};

export function BusinessSnapshot({ stats, received, delta, goal, daysLeft, month, kes }: {
  stats: SnapshotStats | null;
  received: number | null;
  delta: number | null;
  goal: number | null;
  daysLeft: number;
  month: string;
  kes: (value: number) => string;
}) {
  const progress = goal && received !== null ? Math.min(100, Math.round(received / goal * 100)) : 0;
  return (
    <section aria-label="Business snapshot" className="relative overflow-hidden rounded-[24px] border border-white/10 p-5 text-white shadow-hub-lg md:p-7"
      style={{ background: "linear-gradient(120deg, #241c16 0%, #110e0c 55%, #28170c 100%)" }}>
      <div aria-hidden className="pointer-events-none absolute -right-24 -top-32 h-96 w-96 rounded-full bg-[#ff6a00]/20 blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute inset-0 opacity-[0.07]"
        style={{ backgroundImage: "radial-gradient(white 1px, transparent 1px)", backgroundSize: "18px 18px" }} />
      <div className="relative grid gap-7 lg:grid-cols-2 lg:gap-10">
        <div className="flex min-w-0 flex-col">
          <p className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.14em] text-white/60">
            <CircleDot className="h-3.5 w-3.5" /> Your business at a glance
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-4">
            <Link to="/hub/clients?status=active" className="group flex items-baseline gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400">
              {stats ? <NumberTicker value={stats.active} className="text-6xl font-bold leading-none md:text-7xl" /> : <SkeletonBlock className="h-16 w-16 bg-white/10" />}
              <span className="text-lg font-medium text-white/80 group-hover:text-white">active clients</span>
              <ArrowUpRight className="h-4 w-4 text-white/40 transition-colors group-hover:text-orange-300" />
            </Link>
            {stats && <AvatarStack names={stats.activeNames} />}
          </div>
          <p className="mt-3 text-sm text-white/60">
            {stats ? <><span className="hub-tabular font-medium text-white/90">{kes(stats.retainer)}</span> / month in recurring revenue</> : "Loading your client summary…"}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            <Link to="/hub/clients" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-xs text-white/75 hover:bg-white/10">
              <span className="h-1.5 w-1.5 rounded-full bg-orange-400" />{stats ? stats.projects : "—"} projects running
            </Link>
            <Link to="/hub/onboarding" className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.06] px-3 py-2 text-xs text-white/75 hover:bg-white/10">
              <UserCheck className="h-3.5 w-3.5" />{stats ? stats.onboarding : "—"} clients onboarding
            </Link>
          </div>
        </div>

        <div className="min-w-0 border-t border-white/10 pt-6 lg:border-l lg:border-t-0 lg:pl-10 lg:pt-0">
          <div className="flex items-center justify-between gap-3 text-xs text-white/60">
            <span className="font-medium uppercase tracking-[0.14em]">Money in · {month}</span>
            <Link to="/hub/finance" className="flex items-center gap-1 rounded text-white/75 hover:text-white">Finance <ArrowUpRight className="h-3.5 w-3.5" /></Link>
          </div>
          <div className="mt-4 text-[clamp(1.75rem,3.5vw,2.75rem)] font-bold leading-none tracking-tight">
            {received === null ? <SkeletonBlock className="h-11 w-44 bg-white/10" /> : <KesTicker value={received} />}
          </div>
          <p className="mt-3 text-xs text-white/60">
            {delta !== null ? <><span className={cn("font-medium", delta >= 0 ? "text-orange-300" : "text-red-300")}>{delta > 0 ? "+" : ""}{delta}%</span> compared with the same point last month</> : "Payments received this month"}
          </p>
          {goal ? (
            received === null ? <SkeletonBlock className="mt-6 h-12 bg-white/10" /> : (
              <div className="mt-6">
                <div className="mb-2 flex items-center justify-between gap-3 text-xs text-white/65">
                  <span className="flex items-center gap-1.5"><Target className="h-3.5 w-3.5" /> Monthly goal</span>
                  <span>{kes(goal)}</span>
                </div>
                <PrivateBlur quiet>
                  <div role="progressbar" aria-label="Monthly revenue goal" aria-valuemin={0} aria-valuemax={100} aria-valuenow={progress} className="h-1.5 overflow-hidden rounded-full bg-white/10">
                    <div className="h-full rounded-full bg-orange-400 transition-[width] duration-500 motion-reduce:transition-none" style={{ width: `${progress}%` }} />
                  </div>
                  <p className="mt-2 flex items-center justify-between gap-3 text-xs text-white/60">
                    <span>{progress >= 100 ? <span className="flex items-center gap-1 text-orange-300"><CheckCircle2 className="h-3.5 w-3.5" /> Goal reached</span> : `${kes(Math.max(0, goal - received))} to go`}</span>
                    <span>{daysLeft} {daysLeft === 1 ? "day" : "days"} left</span>
                  </p>
                </PrivateBlur>
              </div>
            )
          ) : (
            <Link to="/hub/settings" className="mt-5 flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 text-xs text-white/75 hover:bg-white/10">
              <span className="flex items-center gap-2"><Target className="h-4 w-4 text-orange-300" /> Set a monthly revenue goal</span><ArrowUpRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
