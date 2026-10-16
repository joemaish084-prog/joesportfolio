import { useState, type ReactNode } from "react";
import { Area, AreaChart, Bar, CartesianGrid, ComposedChart, Line, ReferenceLine, XAxis, YAxis } from "recharts";
import {
  AlertTriangle,
  ArrowDownRight,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Minus,
  PiggyBank,
  Receipt,
  Target,
  TrendingDown,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, type ChartConfig } from "@/components/ui/chart";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { cn } from "@/lib/utils";
import type { Dashboard, MonthPoint, Ranked } from "../../lib/financeStats";
import { toNumberOrNull } from "../../lib/format";
import { useKes, usePrivacy } from "../../lib/privacy";
import { useSaveSettings, useSettings } from "../../lib/settings";
import { MoneyInput } from "../form";
import { AnimatedCircularProgressBar } from "../motion/animated-circular-progress-bar";
import { BlurFade } from "../motion/blur-fade";
import { KesTicker } from "../motion/number-ticker";
import { PrivateBlur } from "../privacy";

// Finance dashboard. Every card answers one question in its title and says how
// to read it underneath. Colours (validated with the dataviz checker):
//   money in = --chart-in (orange), money out = --chart-out (blue),
//   profit = --chart-ink (neutral line), late money = status red, always labelled.

const reduceMotion = () => window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const compact = new Intl.NumberFormat("en-KE", { notation: "compact", maximumFractionDigits: 1 });
const GOAL_KEY = "hub:revenue-goal";

function readGoal() {
  try {
    const n = Number(localStorage.getItem(GOAL_KEY));
    return Number.isFinite(n) && n > 0 ? n : null;
  } catch {
    return null;
  }
}

// ---------------------------------------------------------------- building blocks

function Card({
  title,
  hint,
  action,
  children,
  className,
}: {
  title: string;
  hint?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("hub-card flex flex-col p-5", className)}>
      <header className="mb-4 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="font-semibold leading-snug">{title}</h3>
          {hint && <p className="mt-0.5 text-xs text-muted-foreground">{hint}</p>}
        </div>
        {action}
      </header>
      <div className="flex-1">{children}</div>
    </section>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return (
    <p className="flex h-full min-h-28 items-center justify-center text-center text-sm text-muted-foreground">
      {children}
    </p>
  );
}

/** Arrow + % change. Colour on the icon only; the words stay in text colour. */
function Delta({
  value,
  goodWhenUp = true,
  label,
}: {
  value: number | null;
  goodWhenUp?: boolean;
  label: string | null;
}) {
  if (value === null || label === null)
    return <span className="text-xs text-muted-foreground">{label ? "Nothing to compare yet" : " "}</span>;
  if (value === 0)
    return (
      <span className="flex items-center gap-1 text-xs text-muted-foreground">
        <Minus className="h-3.5 w-3.5" /> Same {label}
      </span>
    );
  const up = value > 0;
  const good = up === goodWhenUp;
  const Icon = up ? ArrowUpRight : ArrowDownRight;
  return (
    <span className="flex items-center gap-1 text-xs text-muted-foreground">
      <Icon className={cn("h-3.5 w-3.5", good ? "text-primary" : "text-warning")} />
      <span className="font-medium text-foreground">
        {up ? "+" : "−"}
        {Math.abs(value)}%
      </span>{" "}
      {label}
    </span>
  );
}

function Sparkline({
  data,
  dataKey,
  color,
}: {
  data: MonthPoint[];
  dataKey: "moneyIn" | "moneyOut" | "profit";
  color: string;
}) {
  return (
    <ChartContainer config={{ [dataKey]: { label: dataKey, color } }} className="aspect-auto h-10 w-full">
      <AreaChart data={data} margin={{ top: 4, right: 0, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={`spark-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.25} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <Area
          dataKey={dataKey}
          type="monotone"
          stroke={color}
          strokeWidth={2}
          fill={`url(#spark-${dataKey})`}
          isAnimationActive={!reduceMotion()}
          animationDuration={300}
        />
      </AreaChart>
    </ChartContainer>
  );
}

function KpiTile({
  label,
  icon: Icon,
  children,
  footer,
  chart,
  warn,
}: {
  label: string;
  icon: LucideIcon;
  children: ReactNode;
  footer: ReactNode;
  chart?: ReactNode;
  warn?: boolean;
}) {
  return (
    <div className="hub-card flex flex-col p-4 md:p-5">
      <div className="flex items-center justify-between gap-2">
        <span className="hub-label">{label}</span>
        <span
          className={cn(
            "flex h-7 w-7 items-center justify-center rounded-lg",
            warn ? "bg-warning-soft text-warning" : "bg-tint text-on-tint",
          )}
        >
          <Icon className="h-3.5 w-3.5" />
        </span>
      </div>
      <div
        className={cn(
          "mt-2 text-[1.375rem] font-bold leading-tight tracking-tight md:text-[1.625rem]",
          warn && "text-warning",
        )}
      >
        {children}
      </div>
      <div className="mt-1 min-h-4">{footer}</div>
      {chart && <div className="mt-3">{chart}</div>}
    </div>
  );
}

/** Ranked horizontal bars in one colour, with the value and share written on each row. */
function RankedBars({ rows, color, total }: { rows: Ranked[]; color: string; total: number }) {
  const kes = useKes();
  const max = Math.max(...rows.map((r) => r.amount), 1);
  return (
    <ul className="space-y-3">
      {rows.map((r) => (
        <li key={r.key} className="group" title={`${r.label}: ${kes(r.amount)} (${Math.round(r.share * 100)}%)`}>
          <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
            <span className="min-w-0 truncate">{r.label}</span>
            <span className="hub-tabular shrink-0 text-muted-foreground">
              <span className="font-medium text-foreground">{kes(r.amount)}</span> · {Math.round(r.share * 100)}%
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
            <div
              className="h-full rounded-full transition-[width,opacity] duration-300 group-hover:opacity-80"
              style={{
                width: `${Math.max(2, (r.amount / max) * 100)}%`,
                background: r.key === "__other" ? "hsl(var(--muted-foreground) / 0.5)" : color,
              }}
            />
          </div>
        </li>
      ))}
      <li className="hub-tabular pt-1 text-right text-xs text-muted-foreground">Total {kes(total)}</li>
    </ul>
  );
}

// ---------------------------------------------------------------- cards

function CashFlowCard({ series6, series12 }: { series6: MonthPoint[]; series12: MonthPoint[] }) {
  const kes = useKes();
  const [months, setMonths] = useState("6");
  const data = months === "12" ? series12 : series6;
  const config = {
    moneyIn: { label: "Money in", color: "var(--chart-in)" },
    moneyOut: { label: "Money out", color: "var(--chart-out)" },
    profit: { label: "Profit", color: "var(--chart-ink)" },
  } satisfies ChartConfig;
  const empty = data.every((m) => !m.moneyIn && !m.moneyOut);

  return (
    <Card
      title="Cash flow"
      hint="Money in vs money out each month. The line is what you kept."
      className="lg:col-span-2"
      action={
        <ToggleGroup
          type="single"
          value={months}
          onValueChange={(v) => v && setMonths(v)}
          className="rounded-lg bg-secondary p-0.5"
        >
          {["6", "12"].map((m) => (
            <ToggleGroupItem
              key={m}
              value={m}
              className="h-7 rounded-md px-2.5 text-xs data-[state=on]:bg-card data-[state=on]:shadow-hub"
              aria-label={`Last ${m} months`}
            >
              {m}M
            </ToggleGroupItem>
          ))}
        </ToggleGroup>
      }
    >
      {empty ? (
        <Empty>Record payments and expenses to see your cash flow.</Empty>
      ) : (
        <PrivateBlur>
          <ChartContainer config={config} className="aspect-auto h-64 w-full">
            <ComposedChart
              data={data}
              margin={{ top: 8, right: 4, bottom: 0, left: 0 }}
              barGap={2}
              barCategoryGap="28%"
            >
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
              <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} interval={0} />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={44}
                fontSize={11}
                tickFormatter={(v: number) => compact.format(v)}
              />
              <ReferenceLine y={0} className="stroke-border" />
              <ChartTooltip
                cursor={{ fill: "hsl(var(--secondary))", radius: 6 }}
                content={({ active, payload, label }) =>
                  active && payload?.length ? (
                    <div className="min-w-44 rounded-xl border border-border/70 bg-popover px-3 py-2 text-xs shadow-hub-lg">
                      <p className="mb-1.5 font-medium">{label}</p>
                      {(["moneyIn", "moneyOut", "profit"] as const).map((k) => {
                        const v = Number(payload[0]?.payload?.[k] ?? 0);
                        return (
                          <div key={k} className="flex items-center justify-between gap-4 py-0.5">
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                              <span
                                className={cn(
                                  "h-2.5 w-2.5 shrink-0",
                                  k === "profit" ? "h-0.5 w-3 rounded-full" : "rounded-sm",
                                )}
                                style={{ background: config[k].color }}
                              />
                              {config[k].label}
                            </span>
                            <span className="hub-tabular font-medium">{kes(v)}</span>
                          </div>
                        );
                      })}
                    </div>
                  ) : null
                }
              />
              <Bar
                dataKey="moneyIn"
                fill="var(--color-moneyIn)"
                radius={[4, 4, 0, 0]}
                maxBarSize={22}
                isAnimationActive={!reduceMotion()}
                animationDuration={300}
              />
              <Bar
                dataKey="moneyOut"
                fill="var(--color-moneyOut)"
                radius={[4, 4, 0, 0]}
                maxBarSize={22}
                isAnimationActive={!reduceMotion()}
                animationDuration={300}
              />
              <Line
                dataKey="profit"
                type="monotone"
                stroke="var(--color-profit)"
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2, fill: "hsl(var(--card))" }}
                activeDot={{ r: 5 }}
                isAnimationActive={!reduceMotion()}
                animationDuration={300}
              />
            </ComposedChart>
          </ChartContainer>
          <div className="mt-3 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "var(--chart-in)" }} /> Money in
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm" style={{ background: "var(--chart-out)" }} /> Money out
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-0.5 w-3 rounded-full" style={{ background: "var(--chart-ink)" }} /> Profit
            </span>
          </div>
        </PrivateBlur>
      )}
    </Card>
  );
}

function MarginCard({ series }: { series: MonthPoint[] }) {
  const points = series.map((m) => ({ ...m, margin: m.margin }));
  const has = points.filter((p) => p.margin !== null).length >= 2;
  const latest = [...points].reverse().find((p) => p.margin !== null);
  return (
    <Card title="Profit margin" hint="Of every KES 100 received, how much you kept.">
      {!has ? (
        <Empty>Shows once you have two months with payments.</Empty>
      ) : (
        <PrivateBlur>
          <p className="hub-tabular mb-2 text-2xl font-bold tracking-tight">
            {latest?.margin}%
            <span className="ml-1.5 text-xs font-normal text-muted-foreground">in {latest?.month}</span>
          </p>
          <ChartContainer
            config={{ margin: { label: "Margin", color: "var(--chart-in)" } }}
            className="aspect-auto h-36 w-full"
          >
            <AreaChart data={points} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id="fill-margin" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="var(--chart-in)" stopOpacity={0.22} />
                  <stop offset="100%" stopColor="var(--chart-in)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} strokeDasharray="3 3" className="stroke-border" />
              <XAxis
                dataKey="month"
                tickLine={false}
                axisLine={false}
                tickMargin={6}
                fontSize={10}
                interval="preserveStartEnd"
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                width={34}
                fontSize={10}
                tickFormatter={(v: number) => `${v}%`}
              />
              <ChartTooltip
                cursor={{ stroke: "hsl(var(--border))" }}
                content={({ active, payload, label }) =>
                  active && payload?.length && payload[0].value != null ? (
                    <div className="rounded-xl border border-border/70 bg-popover px-3 py-2 text-xs shadow-hub-lg">
                      <span className="text-muted-foreground">{label}</span> ·{" "}
                      <span className="hub-tabular font-medium">{payload[0].value}% kept</span>
                    </div>
                  ) : null
                }
              />
              <Area
                dataKey="margin"
                type="monotone"
                stroke="var(--chart-in)"
                strokeWidth={2}
                fill="url(#fill-margin)"
                connectNulls
                dot={{ r: 3, fill: "var(--chart-in)" }}
                isAnimationActive={!reduceMotion()}
                animationDuration={300}
              />
            </AreaChart>
          </ChartContainer>
        </PrivateBlur>
      )}
    </Card>
  );
}

function InvoiceHealthCard({ dash, periodLabel }: { dash: Dashboard; periodLabel: string }) {
  const kes = useKes();
  const { health, collectionRate, avgDaysToPay } = dash;
  const parts = [
    { key: "paid", label: "Paid", amount: health.paid, color: "var(--chart-in)" },
    {
      key: "awaiting",
      label: "Waiting (not due)",
      amount: health.awaiting,
      color: "hsl(var(--muted-foreground) / 0.45)",
    },
    { key: "overdue", label: "Overdue", amount: health.overdue, color: "hsl(var(--hub-warning))" },
  ];
  return (
    <Card title="Getting paid" hint={`Invoices sent ${periodLabel.toLowerCase()}, and where the money stands.`}>
      {health.count === 0 ? (
        <Empty>No invoices sent in this period.</Empty>
      ) : (
        <div className="space-y-4">
          <div className="flex items-end gap-6">
            <div>
              <p className="hub-tabular text-2xl font-bold tracking-tight">{collectionRate ?? 0}%</p>
              <p className="text-xs text-muted-foreground">collected</p>
            </div>
            {avgDaysToPay !== null && (
              <div>
                <p className="hub-tabular text-2xl font-bold tracking-tight">{avgDaysToPay}d</p>
                <p className="text-xs text-muted-foreground">avg. time to pay</p>
              </div>
            )}
          </div>
          {/* 100% bar with 2px gaps between segments */}
          <div
            className="flex h-3 w-full gap-0.5 overflow-hidden rounded-full"
            role="img"
            aria-label="Invoice amounts by status"
          >
            {parts
              .filter((p) => p.amount > 0)
              .map((p) => (
                <div
                  key={p.key}
                  className="h-full first:rounded-l-full last:rounded-r-full"
                  style={{ width: `${(p.amount / health.invoiced) * 100}%`, background: p.color }}
                  title={`${p.label}: ${kes(p.amount)}`}
                />
              ))}
          </div>
          <ul className="space-y-1.5 text-sm">
            {parts.map((p) => (
              <li key={p.key} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2">
                  {p.key === "overdue" ? (
                    <AlertTriangle className="h-3.5 w-3.5 text-warning" />
                  ) : (
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: p.color }} />
                  )}
                  {p.label}
                </span>
                <span className="hub-tabular text-muted-foreground">{kes(p.amount)}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  );
}

function AgingCard({ dash }: { dash: Dashboard }) {
  const kes = useKes();
  const max = Math.max(...dash.aging.map((b) => b.amount), 1);
  return (
    <Card title="Who owes you" hint="Unpaid balances on sent invoices, by how late they are.">
      {dash.owed === 0 ? (
        <Empty>
          <span className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-primary" /> Nothing outstanding.
          </span>
        </Empty>
      ) : (
        <ul className="space-y-3">
          {dash.aging.map((b) => (
            <li key={b.key} title={`${b.label}: ${kes(b.amount)} on ${b.count} invoice${b.count === 1 ? "" : "s"}`}>
              <div className="mb-1 flex items-baseline justify-between gap-3 text-sm">
                <span className="flex items-center gap-1.5">
                  {b.overdue && b.amount > 0 && <AlertTriangle className="h-3.5 w-3.5 text-warning" />}
                  {b.label}
                  {b.count > 0 && <span className="text-xs text-muted-foreground">({b.count})</span>}
                </span>
                <span className="hub-tabular font-medium">{b.amount ? kes(b.amount) : "—"}</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-secondary">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${b.amount ? Math.max(2, (b.amount / max) * 100) : 0}%`,
                    background: b.overdue ? "hsl(var(--hub-warning))" : "var(--chart-out)",
                  }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

function GoalCard({ monthIn }: { monthIn: number }) {
  const kes = useKes();
  const { hidden } = usePrivacy();
  // Saved in Settings (same on every device); this device only until the settings table exists.
  const { settings } = useSettings();
  const saveSettings = useSaveSettings();
  const [localGoal, setLocalGoal] = useState<number | null>(readGoal);
  const goal = settings.revenueGoal ?? localGoal;
  const [draft, setDraft] = useState("");
  const [open, setOpen] = useState(false);
  const pct = goal ? Math.min(100, Math.round((monthIn / goal) * 100)) : 0;

  const save = () => {
    const n = toNumberOrNull(draft);
    const next = n && n > 0 ? n : null;
    if (settings.available) {
      saveSettings.mutate({ revenue_goal: next });
      try {
        localStorage.removeItem(GOAL_KEY);
      } catch {
        // ignore
      }
    } else {
      setLocalGoal(next);
      try {
        if (next) localStorage.setItem(GOAL_KEY, String(next));
        else localStorage.removeItem(GOAL_KEY);
      } catch {
        // not remembered
      }
    }
    setOpen(false);
  };

  return (
    <Card
      title="Monthly goal"
      hint="Money received this month against your target."
      action={
        <Popover
          open={open}
          onOpenChange={(o) => {
            setOpen(o);
            if (o) setDraft(goal ? String(goal) : "");
          }}
        >
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="h-7 rounded-full px-2.5 text-xs text-primary">
              {goal ? "Change" : "Set goal"}
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-64 rounded-2xl">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                save();
              }}
              className="space-y-3"
            >
              <p className="text-sm font-medium">Monthly revenue goal</p>
              <MoneyInput value={draft} onChange={setDraft} placeholder="e.g. 300,000" />
              <p className="text-xs text-muted-foreground">
                {settings.available ? "Saved to your settings." : "Saved on this device."} Leave empty to remove.
              </p>
              <Button type="submit" size="sm" className="w-full rounded-full">
                Save
              </Button>
            </form>
          </PopoverContent>
        </Popover>
      }
    >
      {!goal ? (
        <Empty>
          <span className="flex flex-col items-center gap-2">
            <Target className="h-6 w-6 text-muted-foreground" />
            Set a target to track the month at a glance.
          </span>
        </Empty>
      ) : (
        <div className="flex items-center gap-5">
          <AnimatedCircularProgressBar
            value={monthIn}
            max={goal}
            gaugePrimaryColor="var(--chart-in)"
            className="size-28 shrink-0 text-xl font-bold"
            label={`${pct}%`}
          />
          <div className="min-w-0 space-y-1 text-sm">
            <p>
              <span className="hub-tabular font-semibold">{kes(monthIn)}</span>
            </p>
            <p className="text-muted-foreground">
              of <span className="hub-tabular">{kes(goal)}</span>
            </p>
            <p className="text-xs text-muted-foreground">
              {pct >= 100 ? "Goal reached. Nice." : hidden ? `${100 - pct}% to go` : `${kes(goal - monthIn)} to go`}
            </p>
          </div>
        </div>
      )}
    </Card>
  );
}

// ---------------------------------------------------------------- insights

export type Insight = { icon: LucideIcon; text: ReactNode; tone?: "good" | "bad" };

function InsightsCard({ insights }: { insights: Insight[] }) {
  return (
    <Card title="In plain words" hint="What the numbers are saying.">
      <ul className="space-y-3">
        {insights.map((it, i) => (
          <li key={i} className="flex gap-3 text-sm leading-relaxed">
            <span
              className={cn(
                "mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg",
                it.tone === "bad" ? "bg-warning-soft text-warning" : "bg-tint text-on-tint",
              )}
            >
              <it.icon className="h-3.5 w-3.5" />
            </span>
            <span>{it.text}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}

// ---------------------------------------------------------------- dashboard

export default function FinanceDashboard({
  dash,
  series6,
  series12,
  periodLabel,
  insights,
  showClients,
}: {
  dash: Dashboard;
  series6: MonthPoint[];
  series12: MonthPoint[];
  periodLabel: string;
  insights: Insight[];
  showClients: boolean;
}) {
  return (
    <div className="space-y-4">
      <BlurFade className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <KpiTile
          label="Money in"
          icon={Wallet}
          footer={<Delta value={dash.inChange} label={dash.compareLabel} />}
          chart={
            <PrivateBlur quiet>
              <Sparkline data={series6} dataKey="moneyIn" color="var(--chart-in)" />
            </PrivateBlur>
          }
        >
          <KesTicker value={dash.moneyIn} />
        </KpiTile>
        <KpiTile
          label="Money out"
          icon={Receipt}
          footer={<Delta value={dash.outChange} goodWhenUp={false} label={dash.compareLabel} />}
          chart={
            <PrivateBlur quiet>
              <Sparkline data={series6} dataKey="moneyOut" color="var(--chart-out)" />
            </PrivateBlur>
          }
        >
          <KesTicker value={dash.moneyOut} />
        </KpiTile>
        <KpiTile
          label="Profit"
          icon={dash.profit < 0 ? TrendingDown : PiggyBank}
          warn={dash.profit < 0}
          footer={
            dash.margin !== null ? (
              <span className="text-xs text-muted-foreground">
                <span className="font-medium text-foreground">{dash.margin}%</span> margin
                {dash.profitChange !== null && dash.compareLabel && (
                  <>
                    {" · "}
                    {dash.profitChange > 0 ? "+" : "−"}
                    {Math.abs(dash.profitChange)}%
                  </>
                )}
              </span>
            ) : (
              <span className="text-xs text-muted-foreground">No money in yet</span>
            )
          }
          chart={
            <PrivateBlur quiet>
              <Sparkline data={series6} dataKey="profit" color="var(--chart-ink)" />
            </PrivateBlur>
          }
        >
          {dash.profit < 0 && "−"}
          <KesTicker value={Math.abs(dash.profit)} />
        </KpiTile>
        <KpiTile
          label="Owed to you"
          icon={dash.overdueCount ? AlertTriangle : Clock}
          warn={dash.overdueCount > 0}
          footer={
            <span className="text-xs text-muted-foreground">
              {dash.overdueCount ? (
                <>
                  <span className="font-medium text-warning">{dash.overdueCount} overdue</span> invoice
                  {dash.overdueCount === 1 ? "" : "s"}
                </>
              ) : (
                "Nothing overdue"
              )}
            </span>
          }
          chart={
            dash.owed > 0 ? (
              <div className="flex h-2 gap-0.5 overflow-hidden rounded-full" role="img" aria-label="Not due vs overdue">
                <div
                  className="h-full rounded-l-full"
                  style={{
                    width: `${((dash.owed - dash.overdueAmount) / dash.owed) * 100}%`,
                    background: "var(--chart-out)",
                  }}
                />
                <div
                  className="h-full rounded-r-full"
                  style={{ width: `${(dash.overdueAmount / dash.owed) * 100}%`, background: "hsl(var(--hub-warning))" }}
                />
              </div>
            ) : undefined
          }
        >
          <KesTicker value={dash.owed} />
        </KpiTile>
      </BlurFade>

      <BlurFade delay={0.04} className="grid gap-4 lg:grid-cols-3">
        <InsightsCard insights={insights} />
        <CashFlowCard series6={series6} series12={series12} />
      </BlurFade>

      <BlurFade delay={0.08} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {showClients ? <GoalCard monthIn={dash.monthIn} /> : <MarginCard series={series6} />}
        <InvoiceHealthCard dash={dash} periodLabel={periodLabel} />
        <AgingCard dash={dash} />
      </BlurFade>

      <BlurFade delay={0.12} className={cn("grid gap-4 md:grid-cols-2", showClients && "xl:grid-cols-4")}>
        {showClients && (
          <Card title="Top clients" hint={`Who paid you the most, ${periodLabel.toLowerCase()}.`}>
            {dash.clients.length ? (
              <RankedBars rows={dash.clients} color="var(--chart-in)" total={dash.moneyIn} />
            ) : (
              <Empty>No payments in this period.</Empty>
            )}
          </Card>
        )}
        <Card title="Where the money went" hint={`Your costs by type, ${periodLabel.toLowerCase()}.`}>
          {dash.categories.length ? (
            <RankedBars rows={dash.categories} color="var(--chart-out)" total={dash.moneyOut} />
          ) : (
            <Empty>No expenses in this period.</Empty>
          )}
        </Card>
        <Card title="How clients pay" hint={`Money in by payment method, ${periodLabel.toLowerCase()}.`}>
          {dash.methods.length ? (
            <RankedBars rows={dash.methods} color="var(--chart-in)" total={dash.moneyIn} />
          ) : (
            <Empty>No payments in this period.</Empty>
          )}
        </Card>
        {showClients && <MarginCard series={series6} />}
      </BlurFade>
    </div>
  );
}
