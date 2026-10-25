import { useState } from "react";
import { addDays, differenceInCalendarDays, format, parseISO, startOfDay } from "date-fns";
import { Bar, BarChart, CartesianGrid, Cell, Pie, PieChart, XAxis, YAxis } from "recharts";
import { ArrowDownLeft, ArrowUpRight, CalendarDays, CheckCheck, LockKeyhole, Plus, Target, Wallet } from "lucide-react";
import { useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { FUND_CATEGORIES, FUND_FREQUENCIES, type BusinessFund } from "../../lib/businessFunds";
import { formatDate } from "../../lib/format";
import { useKes, usePrivacy } from "../../lib/privacy";
import { Money } from "../privacy";
import { AnimatedCircularProgressBar } from "../motion/animated-circular-progress-bar";

const COLORS = ["#f97316", "#3b82f6", "#14b8a6", "#a78bfa", "#eab308"];
const compact = (n: number) => new Intl.NumberFormat("en-KE", { notation: "compact", maximumFractionDigits: 1 }).format(n);

export function BusinessFundsDashboard({ funds, onNew, onAdd }: {
  funds: BusinessFund[];
  onNew: () => void;
  onAdd: (fund: BusinessFund) => void;
}) {
  const [groupBy, setGroupBy] = useState<"category" | "fund">("category");
  const [horizon, setHorizon] = useState("30");
  const { hidden } = usePrivacy();
  const kes = useKes();
  const reducedMotion = useReducedMotion();
  const active = funds.filter((f) => !f.completed_at);
  const saved = active.reduce((sum, f) => sum + Number(f.saved_amount), 0);
  const target = active.reduce((sum, f) => sum + Number(f.target_amount), 0);
  const allocated = active.reduce((sum, f) => sum + Math.min(Number(f.saved_amount), Number(f.target_amount)), 0);
  const remaining = target - allocated;
  const pct = target ? Math.round(allocated / target * 100) : 0;
  const ready = active.filter((f) => Number(f.saved_amount) >= Number(f.target_amount)).length;
  const today = startOfDay(new Date());
  const cutoff = horizon === "all" ? null : format(addDays(today, Number(horizon)), "yyyy-MM-dd");
  const timeline = active.filter((f) => f.due_date && (!cutoff || f.due_date <= cutoff))
    .sort((a, b) => a.due_date!.localeCompare(b.due_date!));
  const undated = active.filter((f) => !f.due_date).length;
  const next = active.filter((f) => f.due_date && f.due_date >= format(today, "yyyy-MM-dd")).sort((a, b) => a.due_date!.localeCompare(b.due_date!))[0];
  const categories = FUND_CATEGORIES.map((name, index) => {
    const items = active.filter((f) => f.category === name);
    return {
      name, color: COLORS[index],
      saved: items.reduce((sum, f) => sum + Number(f.saved_amount), 0),
      funded: items.reduce((sum, f) => sum + Math.min(Number(f.saved_amount), Number(f.target_amount)), 0),
      remaining: items.reduce((sum, f) => sum + Math.max(0, Number(f.target_amount) - Number(f.saved_amount)), 0),
    };
  }).filter((c) => c.saved || c.remaining);
  const bars = groupBy === "category" ? categories : active.map((f) => ({
    name: f.name,
    funded: Math.min(Number(f.saved_amount), Number(f.target_amount)),
    remaining: Math.max(0, Number(f.target_amount) - Number(f.saved_amount)),
  }));
  const allocation = categories.filter((c) => c.saved > 0);

  return <div className="space-y-5">
    <div className="grid gap-4 lg:grid-cols-[1.65fr_1fr]">
      <section className="relative isolate overflow-hidden rounded-[28px] border border-white/10 bg-[#141a1a] p-6 text-white shadow-hub-lg sm:p-8">
        <div aria-hidden className="pointer-events-none absolute -right-24 -top-32 -z-10 h-96 w-96 rounded-full bg-teal-400/15 blur-3xl" />
        <div aria-hidden className="pointer-events-none absolute -bottom-32 -left-20 -z-10 h-72 w-72 rounded-full bg-orange-500/10 blur-3xl" />
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-xs font-medium uppercase tracking-[0.16em] text-white/70"><Wallet className="h-4 w-4" /> Business reserve</span>
          <span className="flex items-center gap-1.5 rounded-full border border-white/15 px-2.5 py-1 text-[11px] text-white/70"><LockKeyhole className="h-3 w-3" /> Admin only</span>
        </div>
        <div className="my-7"><p className="text-sm text-white/60">Total set aside</p><p className="mt-2 break-words text-3xl font-semibold tracking-tight sm:text-4xl xl:text-5xl"><Money value={saved} /></p><p className="mt-3 flex items-center gap-1.5 text-xs text-white/60"><span className="h-1.5 w-1.5 rounded-full bg-teal-300" />Across {active.length} active {active.length === 1 ? "fund" : "funds"} · KES</p></div>
        <div className="flex flex-wrap gap-2">
          <Button className="rounded-full" onClick={onNew}><Plus className="mr-2 h-4 w-4" />Create fund</Button>
          {active.length > 0 && <Button variant="outline" className="rounded-full border-white/20 bg-transparent text-white hover:bg-white/10 hover:text-white" onClick={() => document.getElementById("funds-collection")?.scrollIntoView({ behavior: reducedMotion ? "instant" : "smooth", block: "start" })}>Manage funds<ArrowUpRight className="ml-2 h-4 w-4" /></Button>}
        </div>
        <div className="mt-7 grid grid-cols-2 gap-4 border-t border-white/15 pt-5">
          <div><p className="flex items-center gap-1.5 text-xs text-white/60"><ArrowDownLeft className="h-3.5 w-3.5 text-teal-300" />Still to save</p><p className="mt-1.5 text-lg font-semibold"><Money value={remaining} /></p></div>
          <div><p className="flex items-center gap-1.5 text-xs text-white/60"><CheckCheck className="h-3.5 w-3.5 text-teal-300" />Ready to use</p><p className="mt-1.5 text-lg font-semibold">{ready} <span className="text-sm font-normal text-white/60">{ready === 1 ? "fund" : "funds"}</span></p></div>
        </div>
      </section>
      <section className="hub-card flex flex-col justify-between gap-5 !rounded-[28px] p-6">
        <div className="flex items-center justify-between"><h2 className="font-semibold">Your goals, in view</h2><Target className="h-4 w-4 text-muted-foreground" /></div>
        <div className="flex flex-wrap items-center gap-5">
          {hidden ? <div className="flex h-28 w-28 items-center justify-center rounded-full border-[10px] border-secondary text-sm text-muted-foreground">Hidden</div> : <AnimatedCircularProgressBar value={pct} label={`${pct}%`} className="!size-28 !text-2xl" />}
          <div className="min-w-0 flex-1"><p className="text-sm font-medium">{hidden ? "Goal progress hidden" : `${pct}% of targets funded`}</p><p className="mt-2 text-xs leading-relaxed text-muted-foreground">Small deposits. Bigger possibilities.</p><p className="mt-3 text-sm"><Money value={target} /><span className="block text-xs text-muted-foreground">combined target</span></p></div>
        </div>
        <div className="rounded-2xl bg-secondary/60 p-4"><p className="flex items-center gap-2 text-xs text-muted-foreground"><CalendarDays className="h-3.5 w-3.5" />Next on your calendar</p><p className="mt-2 truncate text-sm font-medium">{next?.name ?? "Room for your next goal"}</p><p className="mt-1 text-xs text-muted-foreground">{next ? formatDate(next.due_date) : "Add a target date to plan ahead."}</p></div>
      </section>
    </div>

    <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
      <section className="hub-card min-w-0 p-5 sm:p-6">
        <div className="mb-5 flex flex-wrap items-start justify-between gap-3"><div><h2 className="font-semibold">Funding overview</h2><p className="mt-1 text-xs text-muted-foreground">Current savings against your targets</p></div><div className="flex rounded-full bg-secondary p-1" aria-label="Chart grouping">{(["category", "fund"] as const).map((g) => <button key={g} type="button" aria-pressed={groupBy === g} onClick={() => setGroupBy(g)} className={cn("rounded-full px-3 py-1.5 text-xs capitalize", groupBy === g ? "bg-card font-medium shadow-sm" : "text-muted-foreground")}>By {g}</button>)}</div></div>
        {hidden ? <ChartEmpty text="Show amounts to view your funding chart." /> : !bars.length ? <ChartEmpty text="Your funding picture starts with your first goal." /> : <>
          <div className="mb-4 flex gap-4 text-xs text-muted-foreground"><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-sm bg-primary" />Funded</span><span className="flex items-center gap-2"><i className="h-2 w-2 rounded-sm bg-[#3b82f6]" />Remaining</span></div>
          <div className="max-h-96 overflow-y-auto">
            <ChartContainer config={{ funded: { label: "Funded", color: "hsl(var(--primary))" }, remaining: { label: "Remaining", color: "#3b82f6" } }} className="!aspect-auto w-full" style={{ height: Math.max(200, bars.length * 54) }} aria-label="Funded and remaining amounts by selected grouping">
              <BarChart accessibilityLayer data={bars} layout="vertical" margin={{ left: 0, right: 12, bottom: 0 }} barSize={14}>
                <CartesianGrid horizontal={false} strokeDasharray="3 4" />
                <XAxis type="number" tickFormatter={compact} tickLine={false} axisLine={false} fontSize={10} />
                <YAxis type="category" dataKey="name" width={110} tickLine={false} axisLine={false} tickFormatter={(v: string) => v.length > 16 ? `${v.slice(0, 15)}…` : v} fontSize={11} />
                <ChartTooltip cursor={false} content={<ChartTooltipContent formatter={(value, name) => <span>{name === "funded" ? "Funded" : "Remaining"}: {kes(Number(value))}</span>} />} />
                <Bar dataKey="funded" stackId="fund" fill="var(--color-funded)" radius={[4, 0, 0, 4]} isAnimationActive={!reducedMotion} />
                <Bar dataKey="remaining" stackId="fund" fill="var(--color-remaining)" radius={[0, 4, 4, 0]} isAnimationActive={!reducedMotion} />
              </BarChart>
            </ChartContainer>
          </div><p className="mt-3 text-[11px] text-muted-foreground">KES · Current balances. Surplus above a target is excluded.</p>
        </>}
      </section>
      <section className="hub-card min-w-0 p-5 sm:p-6"><h2 className="font-semibold">Where your savings live</h2><p className="mt-1 text-xs text-muted-foreground">Set aside by category</p>
        {hidden ? <ChartEmpty text="Show amounts to view your savings allocation." /> : !saved ? <ChartEmpty text="Add savings to see your category breakdown." /> : <>
          <ChartContainer config={{ saved: { label: "Saved" } }} className="mx-auto !aspect-square h-44 w-44" aria-label="Savings allocation by category">
            <PieChart><ChartTooltip content={<ChartTooltipContent formatter={(value, name) => <span>{name}: {kes(Number(value))}</span>} />} /><Pie data={allocation} dataKey="saved" nameKey="name" innerRadius={53} outerRadius={77} paddingAngle={allocation.length > 1 ? 4 : 0} stroke="none" isAnimationActive={!reducedMotion}>{allocation.map((c) => <Cell key={c.name} fill={c.color} />)}</Pie></PieChart>
          </ChartContainer>
          <ul className="space-y-2.5">{allocation.map((c) => <li key={c.name} className="flex items-center justify-between gap-2 text-xs"><span className="flex items-center gap-2"><i className="h-2 w-2 shrink-0 rounded-full" style={{ background: c.color }} />{c.name}</span><span className="hub-tabular text-muted-foreground">{Math.round(c.saved / saved * 100)}% <span className="ml-2 font-medium text-foreground">{kes(c.saved)}</span></span></li>)}</ul>
        </>}
      </section>
    </div>

    <section className="hub-card overflow-hidden">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-border/60 p-5 sm:p-6"><div><h2 className="flex items-center gap-2 font-semibold"><CalendarDays className="h-4 w-4 text-on-tint" />Your funding timeline</h2><p className="mt-1 text-xs text-muted-foreground">Upcoming goals and renewals, with overdue items first</p></div><select aria-label="Timeline date range" value={horizon} onChange={(e) => setHorizon(e.target.value)} className="rounded-full border border-border bg-background px-3 py-2 text-xs"><option value="30">Next 30 days</option><option value="90">Next 90 days</option><option value="all">All dates</option></select></div>
      {!timeline.length ? <div className="p-8 text-center text-sm text-muted-foreground">{active.length ? "No dated goals in this window. You're clear to plan ahead." : "Add a goal and a date to start your timeline."}</div> : <ol className="max-h-[440px] overflow-y-auto px-5 py-2 sm:px-6">{timeline.map((f, index) => {
        const days = differenceInCalendarDays(parseISO(f.due_date!), today);
        const ready = Number(f.saved_amount) >= Number(f.target_amount);
        const overdue = days < 0;
        const gap = Math.max(0, Number(f.target_amount) - Number(f.saved_amount));
        return <li key={f.id} className="relative flex gap-4 py-4">
          {index < timeline.length - 1 && <span aria-hidden className="absolute bottom-[-16px] left-[19px] top-12 w-px bg-border" />}
          <div className={cn("z-10 flex h-11 w-10 shrink-0 flex-col items-center justify-center rounded-xl text-[10px] uppercase", overdue && !ready ? "bg-warning-soft text-warning" : "bg-secondary text-muted-foreground")}><span>{format(parseISO(f.due_date!), "MMM")}</span><span className="text-base font-semibold leading-tight">{format(parseISO(f.due_date!), "d")}</span></div>
          <div className="flex min-w-0 flex-1 flex-wrap items-center justify-between gap-3"><div className="min-w-0"><h3 className="break-words text-sm font-medium">{f.name}</h3><p className="mt-1 text-xs text-muted-foreground">{FUND_FREQUENCIES[f.frequency]} · {days < 0 ? `${Math.abs(days)}d past date` : days === 0 ? "Today" : `In ${days}d`}</p></div><div className="flex items-center gap-3"><div className="text-right"><p className="text-sm font-medium"><Money value={Number(f.target_amount)} /></p><p className={cn("mt-1 text-xs", ready ? "text-on-tint" : "text-muted-foreground")}>{ready ? "Fully funded" : <><Money value={gap} /> to go</>}</p></div>{!ready && <Button variant="outline" size="icon" className="h-8 w-8 rounded-full" aria-label={`Add savings to ${f.name}`} onClick={() => onAdd(f)}><Plus className="h-3.5 w-3.5" /></Button>}</div></div>
        </li>;
      })}</ol>}
      {undated > 0 && <p className="border-t border-border/60 px-5 py-3 text-xs text-muted-foreground sm:px-6">{undated} active {undated === 1 ? "fund has" : "funds have"} no target date yet.</p>}
    </section>
  </div>;
}

function ChartEmpty({ text }: { text: string }) {
  return <div className="my-4 flex min-h-52 items-center justify-center rounded-2xl border border-dashed border-border bg-secondary/20 px-6 text-center text-sm text-muted-foreground">{text}</div>;
}
