import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  ArrowDown,
  ArrowUp,
  ArrowUpDown,
  Bot,
  ChevronLeft,
  ChevronRight,
  Download,
  Inbox,
  Search,
  type LucideIcon,
} from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  ACCENT,
  AXIS_TICK,
  DOW_LABELS,
  type Density,
  densityClasses,
  SERIES_COLORS,
  TOOLTIP_STYLE,
  compactNumber,
  computeDelta,
} from "./format";

export type { Density };

/* -------------------------------------------------------------------------- */
/*  Deltas and counters                                                       */
/* -------------------------------------------------------------------------- */

/** `invert` flips the colour for metrics where a rise is bad (bounce rate). */
export function DeltaBadge({
  current,
  prev,
  invert = false,
}: {
  current: number;
  prev: number;
  invert?: boolean;
}) {
  const { pct, direction } = computeDelta(current, prev);
  if (direction === "flat" && prev === 0 && current === 0) return null;
  const label = pct === null ? "New" : `${pct > 0 ? "+" : ""}${pct}%`;
  const good = invert ? direction === "down" : direction === "up";
  const bad = invert ? direction === "up" : direction === "down";
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-[10px] font-semibold tabular-nums ${
        good
          ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
          : bad
            ? "bg-red-500/10 text-red-600 dark:text-red-400"
            : "bg-muted text-muted-foreground"
      }`}
    >
      {direction === "up" && <ArrowUp className="h-2.5 w-2.5" />}
      {direction === "down" && <ArrowDown className="h-2.5 w-2.5" />}
      {label}
    </span>
  );
}

export function CountUp({ value, duration = 700 }: { value: number; duration?: number }) {
  const [display, setDisplay] = useState(0);
  const prevValue = useRef(0);

  useEffect(() => {
    const from = prevValue.current;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      // Ease-out so the number settles rather than stopping dead.
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(from + (value - from) * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
      else prevValue.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  const isFractional = !Number.isInteger(value);
  return <>{isFractional ? display.toFixed(2) : Math.round(display).toLocaleString()}</>;
}

/* -------------------------------------------------------------------------- */
/*  Sparkline                                                                 */
/* -------------------------------------------------------------------------- */

/** Inline SVG trend line for KPI tiles. Deliberately axis-free and unlabelled. */
export function Sparkline({
  values,
  className = "",
  stroke = ACCENT,
  height = 28,
}: {
  values: number[];
  className?: string;
  stroke?: string;
  height?: number;
}) {
  const path = useMemo(() => {
    if (values.length < 2) return null;
    const max = Math.max(...values);
    const min = Math.min(...values);
    const span = max - min || 1;
    const stepX = 100 / (values.length - 1);
    const points = values.map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / span) * (height - 4) - 2;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    });
    return {
      line: `M ${points.join(" L ")}`,
      area: `M ${points.join(" L ")} L 100,${height} L 0,${height} Z`,
    };
  }, [values, height]);

  if (!path) return null;
  const gradientId = `spark-${stroke.replace(/[^a-z0-9]/gi, "")}`;

  return (
    <svg
      viewBox={`0 0 100 ${height}`}
      preserveAspectRatio="none"
      className={`w-full ${className}`}
      style={{ height }}
      aria-hidden
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={stroke} stopOpacity={0.28} />
          <stop offset="100%" stopColor={stroke} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={path.area} fill={`url(#${gradientId})`} />
      <path d={path.line} fill="none" stroke={stroke} strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

/* -------------------------------------------------------------------------- */
/*  Cards                                                                     */
/* -------------------------------------------------------------------------- */

export function StatCard({
  icon: Icon,
  label,
  value,
  suffix,
  current,
  prev,
  invertDelta,
  hint,
  trend,
  accent = false,
}: {
  icon: LucideIcon;
  label: string;
  value: number;
  suffix?: string;
  current?: number;
  prev?: number;
  invertDelta?: boolean;
  hint?: string;
  trend?: number[];
  accent?: boolean;
}) {
  return (
    <Card
      className={`group relative overflow-hidden border-border/60 shadow-none transition-colors hover:border-border ${
        accent ? "bg-gradient-to-br from-primary/[0.07] to-transparent" : ""
      }`}
    >
      <CardContent className="p-4">
        <div className="mb-2.5 flex items-center justify-between gap-2">
          <span className="truncate text-[10.5px] font-semibold uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
          <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-muted/60 text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
            <Icon className="h-3.5 w-3.5" aria-hidden />
          </span>
        </div>
        <div className="flex items-end justify-between gap-2">
          <p className="text-[26px] font-semibold leading-none tracking-tight tabular-nums">
            <CountUp value={value} />
            {suffix && <span className="ml-0.5 text-sm font-normal text-muted-foreground">{suffix}</span>}
          </p>
          {current !== undefined && prev !== undefined && (
            <DeltaBadge current={current} prev={prev} invert={invertDelta} />
          )}
        </div>
        {trend && trend.length > 1 && (
          <div className="-mx-1 mt-2.5 opacity-70 transition-opacity group-hover:opacity-100">
            <Sparkline values={trend} height={24} />
          </div>
        )}
        {hint && <p className="mt-1.5 text-[10px] leading-snug text-muted-foreground">{hint}</p>}
      </CardContent>
    </Card>
  );
}

export function SectionCard({
  title,
  subtitle,
  icon: Icon,
  action,
  className,
  bodyClassName,
  children,
}: {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  action?: React.ReactNode;
  className?: string;
  bodyClassName?: string;
  children: React.ReactNode;
}) {
  return (
    <Card className={`flex flex-col border-border/60 shadow-none ${className ?? ""}`}>
      <CardHeader className="flex-row items-start justify-between gap-3 space-y-0 border-b border-border/60 px-5 py-3.5">
        <div className="min-w-0">
          <CardTitle className="flex items-center gap-2 text-sm font-semibold text-foreground">
            {Icon && <Icon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />}
            {title}
          </CardTitle>
          {subtitle && <p className="mt-0.5 text-[11px] leading-snug text-muted-foreground">{subtitle}</p>}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </CardHeader>
      <CardContent className={bodyClassName ?? "flex-1 p-5"}>{children}</CardContent>
    </Card>
  );
}

export function EmptyState({ label, icon: Icon = Inbox }: { label: string; icon?: LucideIcon }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-8 text-center">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/60 text-muted-foreground">
        <Icon className="h-4 w-4" aria-hidden />
      </span>
      <p className="max-w-xs text-xs leading-relaxed text-muted-foreground">{label}</p>
    </div>
  );
}

export function ExportButton({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="sm"
      className="h-7 shrink-0 gap-1.5 px-2 text-xs text-muted-foreground hover:text-foreground"
      onClick={onClick}
    >
      <Download className="h-3.5 w-3.5" /> Export
    </Button>
  );
}

/* -------------------------------------------------------------------------- */
/*  Segmented control                                                         */
/* -------------------------------------------------------------------------- */

export function Segmented<T extends string | number>({
  options,
  value,
  onChange,
  size = "sm",
}: {
  options: { value: T; label: string }[];
  value: T | T[];
  onChange: (v: T) => void;
  size?: "sm" | "xs";
}) {
  const isActive = (v: T) => (Array.isArray(value) ? value.includes(v) : value === v);
  return (
    <div className="inline-flex flex-wrap items-center gap-0.5 rounded-lg border border-border/60 bg-muted/30 p-0.5">
      {options.map((opt) => (
        <button
          key={String(opt.value)}
          onClick={() => onChange(opt.value)}
          className={`relative rounded-[6px] font-medium transition-all ${
            size === "xs" ? "px-2 py-1 text-[11px]" : "px-2.5 py-1 text-xs"
          } ${
            isActive(opt.value)
              ? "bg-background text-foreground shadow-sm ring-1 ring-border/60"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Ranked list                                                               */
/* -------------------------------------------------------------------------- */

export function RankedList({
  items,
  formatValue,
  emptyLabel = "No data in this range yet.",
}: {
  items: { label: string; value: number; sub?: string }[];
  formatValue?: (v: number) => string;
  emptyLabel?: string;
}) {
  const max = Math.max(1, ...items.map((i) => i.value));
  if (items.length === 0) return <EmptyState label={emptyLabel} />;
  return (
    <div className="space-y-1">
      {items.map((item, i) => (
        <div key={`${item.label}-${item.sub ?? ""}`} className="group relative rounded-md">
          <motion.div
            className="absolute inset-y-0 left-0 rounded-md bg-primary/[0.10] group-hover:bg-primary/[0.16]"
            initial={{ width: 0 }}
            animate={{ width: `${Math.max(3, (item.value / max) * 100)}%` }}
            transition={{ duration: 0.5, delay: i * 0.02, ease: [0.22, 1, 0.36, 1] }}
          />
          <div className="relative flex items-center justify-between gap-3 px-2 py-1.5 text-[13px]">
            <span className="truncate text-foreground" title={item.label}>
              {item.label}
              {item.sub && <span className="ml-1.5 text-[11px] text-muted-foreground">{item.sub}</span>}
            </span>
            <span className="shrink-0 font-semibold tabular-nums text-foreground">
              {formatValue ? formatValue(item.value) : item.value.toLocaleString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Donut                                                                     */
/* -------------------------------------------------------------------------- */

export function Donut({
  data,
  nameKey,
  label,
}: {
  data: Record<string, unknown>[];
  nameKey: string;
  label: string;
}) {
  const total = data.reduce((sum, d) => sum + Number(d.count ?? 0), 0);
  if (data.length === 0) return <EmptyState label={`No ${label} data in this range yet.`} />;
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-44 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              dataKey="count"
              nameKey={nameKey}
              outerRadius={68}
              innerRadius={46}
              paddingAngle={2}
              strokeWidth={2}
            >
              {data.map((_, i) => (
                <Cell key={i} fill={SERIES_COLORS[i % SERIES_COLORS.length]} stroke="hsl(var(--card))" />
              ))}
            </Pie>
            <Tooltip contentStyle={TOOLTIP_STYLE} />
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-semibold tabular-nums leading-none">{compactNumber(total)}</span>
          <span className="mt-0.5 text-[10px] uppercase tracking-wider text-muted-foreground">total</span>
        </div>
      </div>
      <div className="mt-3 flex w-full flex-col gap-1">
        {data.map((d, i) => (
          <div key={String(d[nameKey])} className="flex items-center justify-between gap-2 text-[11px]">
            <span className="flex min-w-0 items-center gap-1.5 text-muted-foreground">
              <span
                className="h-2 w-2 shrink-0 rounded-full"
                style={{ background: SERIES_COLORS[i % SERIES_COLORS.length] }}
              />
              <span className="truncate">{String(d[nameKey])}</span>
            </span>
            <span className="shrink-0 tabular-nums text-foreground">
              {Number(d.count).toLocaleString()}
              <span className="ml-1 text-muted-foreground">
                {total > 0 ? `${Math.round((Number(d.count) / total) * 100)}%` : ""}
              </span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Area chart                                                                */
/* -------------------------------------------------------------------------- */

export interface AreaSeries {
  key: string;
  label: string;
  color: string;
}

/** Gradient-filled multi-series area chart used for all time series. */
export function TrendChart({
  data,
  series,
  xKey,
  height = 280,
  xTickFormatter,
}: {
  data: Record<string, unknown>[];
  series: AreaSeries[];
  xKey: string;
  height?: number;
  xTickFormatter?: (v: string) => string;
}) {
  if (data.length === 0) return <EmptyState label="No traffic in this range yet." />;
  return (
    <div style={{ height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ left: -18, right: 6, top: 8, bottom: 0 }}>
          <defs>
            {series.map((s) => (
              <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={s.color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={s.color} stopOpacity={0.02} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" className="stroke-border/60" vertical={false} />
          <XAxis
            dataKey={xKey}
            tick={AXIS_TICK}
            axisLine={false}
            tickLine={false}
            tickMargin={8}
            tickFormatter={xTickFormatter}
          />
          <YAxis tick={AXIS_TICK} allowDecimals={false} axisLine={false} tickLine={false} width={44} />
          <Tooltip
            contentStyle={TOOLTIP_STYLE}
            labelFormatter={(v) => (xTickFormatter ? xTickFormatter(String(v)) : v)}
          />
          {series.map((s) => (
            <Area
              key={s.key}
              type="monotone"
              dataKey={s.key}
              name={s.label}
              stroke={s.color}
              strokeWidth={2}
              fill={`url(#grad-${s.key})`}
              dot={false}
              activeDot={{ r: 3.5, strokeWidth: 2, stroke: "hsl(var(--card))" }}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Heatmap                                                                   */
/* -------------------------------------------------------------------------- */

export function ActivityHeatmap({
  cells,
  timezone,
}: {
  cells: { dow: number; hour: number; page_views: number; sessions: number }[];
  timezone: string;
}) {
  const { map, max } = useMemo(() => {
    const m = new Map<string, { views: number; sessions: number }>();
    let mx = 0;
    cells.forEach((c) => {
      m.set(`${c.dow}-${c.hour}`, { views: c.page_views, sessions: c.sessions });
      if (c.page_views > mx) mx = c.page_views;
    });
    return { map: m, max: mx };
  }, [cells]);

  if (cells.length === 0) return <EmptyState label="Not enough traffic to build a heatmap yet." />;

  return (
    <div className="space-y-2">
      <div className="overflow-x-auto">
        <div className="min-w-[640px]">
          <div className="mb-1 grid grid-cols-[2.4rem_repeat(24,minmax(0,1fr))] gap-[3px]">
            <span />
            {Array.from({ length: 24 }).map((_, h) => (
              <span key={h} className="text-center text-[9px] tabular-nums text-muted-foreground">
                {h % 3 === 0 ? h : ""}
              </span>
            ))}
          </div>
          {DOW_LABELS.map((dayLabel, dow) => (
            <div key={dow} className="mb-[3px] grid grid-cols-[2.4rem_repeat(24,minmax(0,1fr))] gap-[3px]">
              <span className="text-[10px] leading-5 text-muted-foreground">{dayLabel}</span>
              {Array.from({ length: 24 }).map((_, hour) => {
                const cell = map.get(`${dow}-${hour}`);
                const intensity = cell && max > 0 ? cell.views / max : 0;
                return (
                  <motion.div
                    key={hour}
                    initial={{ opacity: 0, scale: 0.85 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.25, delay: (dow * 24 + hour) * 0.0015 }}
                    title={`${dayLabel} ${String(hour).padStart(2, "0")}:00 — ${cell?.views ?? 0} views, ${
                      cell?.sessions ?? 0
                    } sessions`}
                    className="h-5 rounded-[3px] ring-1 ring-inset ring-border/40"
                    style={{
                      background:
                        intensity > 0 ? `hsl(25 100% 50% / ${0.14 + intensity * 0.86})` : "hsl(var(--muted) / 0.5)",
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-between text-[10px] text-muted-foreground">
        <span>Hour of day — {timezone}</span>
        <span className="flex items-center gap-1.5">
          Low
          {[0.14, 0.35, 0.58, 0.8, 1].map((o) => (
            <span
              key={o}
              className="h-3 w-3.5 rounded-[3px] ring-1 ring-inset ring-border/40"
              style={{ background: `hsl(25 100% 50% / ${o})` }}
            />
          ))}
          High
        </span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sortable, searchable, paginated table                                     */
/* -------------------------------------------------------------------------- */

export interface Column<T> {
  key: string;
  label: string;
  align?: "left" | "right";
  /** Sort on something other than the raw field (e.g. a parsed date). */
  sortValue?: (row: T) => number | string;
  render?: (row: T) => React.ReactNode;
  cellClassName?: string;
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  rows,
  initialSortKey,
  initialSortDir = "desc",
  maxHeight = "26rem",
  emptyLabel = "No data in this range yet.",
  rowKey,
  density = "cosy",
  searchable = false,
  searchPlaceholder = "Search…",
  searchKeys,
  pageSize,
}: {
  columns: Column<T>[];
  rows: T[];
  initialSortKey?: string;
  initialSortDir?: "asc" | "desc";
  maxHeight?: string;
  emptyLabel?: string;
  rowKey?: (row: T, i: number) => string;
  density?: Density;
  searchable?: boolean;
  searchPlaceholder?: string;
  searchKeys?: string[];
  pageSize?: number;
}) {
  const [sortKey, setSortKey] = useState<string | undefined>(initialSortKey);
  const [sortDir, setSortDir] = useState<"asc" | "desc">(initialSortDir);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);
  const d = densityClasses(density);

  const searched = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return rows;
    const keys = searchKeys ?? columns.map((c) => c.key);
    return rows.filter((row) =>
      keys.some((k) => {
        const v = row[k];
        return v !== null && v !== undefined && String(v).toLowerCase().includes(q);
      }),
    );
  }, [rows, query, searchKeys, columns]);

  const sorted = useMemo(() => {
    if (!sortKey) return searched;
    const col = columns.find((c) => c.key === sortKey);
    const read = (row: T) => (col?.sortValue ? col.sortValue(row) : (row[sortKey] as number | string | null));
    return [...searched].sort((a, b) => {
      const av = read(a);
      const bv = read(b);
      if (av === bv) return 0;
      if (av === null || av === undefined) return 1;
      if (bv === null || bv === undefined) return -1;
      const cmp = typeof av === "number" && typeof bv === "number" ? av - bv : String(av).localeCompare(String(bv));
      return sortDir === "asc" ? cmp : -cmp;
    });
  }, [searched, sortKey, sortDir, columns]);

  const pageCount = pageSize ? Math.max(1, Math.ceil(sorted.length / pageSize)) : 1;
  const safePage = Math.min(page, pageCount - 1);
  const visible = pageSize ? sorted.slice(safePage * pageSize, safePage * pageSize + pageSize) : sorted;

  const toggle = (key: string) => {
    if (sortKey === key) {
      setSortDir((dir) => (dir === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("desc");
    }
  };

  return (
    <div className="space-y-2.5">
      {searchable && (
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setPage(0);
            }}
            placeholder={searchPlaceholder}
            className="h-8 pl-8 text-xs"
          />
        </div>
      )}

      {rows.length === 0 ? (
        <EmptyState label={emptyLabel} />
      ) : sorted.length === 0 ? (
        <EmptyState label={`Nothing matches “${query}”.`} icon={Search} />
      ) : (
        <div className="overflow-auto rounded-lg border border-border/50" style={{ maxHeight }}>
          <table className={`w-full ${d.text}`}>
            <thead>
              <tr className="sticky top-0 z-10 bg-muted/60 text-left text-[10.5px] uppercase tracking-wider text-muted-foreground backdrop-blur">
                {columns.map((c) => (
                  <th
                    key={c.key}
                    className={`whitespace-nowrap px-3 py-2 font-semibold ${
                      c.align === "right" ? "text-right" : ""
                    }`}
                  >
                    <button
                      onClick={() => toggle(c.key)}
                      className={`inline-flex items-center gap-1 transition-colors hover:text-foreground ${
                        sortKey === c.key ? "text-foreground" : ""
                      }`}
                    >
                      {c.label}
                      {sortKey === c.key ? (
                        sortDir === "asc" ? (
                          <ArrowUp className="h-3 w-3" />
                        ) : (
                          <ArrowDown className="h-3 w-3" />
                        )
                      ) : (
                        <ArrowUpDown className="h-3 w-3 opacity-25" />
                      )}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.map((row, i) => (
                <tr
                  key={rowKey ? rowKey(row, i) : i}
                  className="border-t border-border/40 transition-colors hover:bg-muted/40"
                >
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={`px-3 ${d.cell} ${
                        c.align === "right" ? "text-right tabular-nums" : ""
                      } ${c.cellClassName ?? "text-muted-foreground"}`}
                    >
                      {c.render ? c.render(row) : String(row[c.key] ?? "—")}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pageSize && sorted.length > pageSize && (
        <div className="flex items-center justify-between text-[11px] text-muted-foreground">
          <span className="tabular-nums">
            {safePage * pageSize + 1}–{Math.min(sorted.length, (safePage + 1) * pageSize)} of {sorted.length}
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6"
              disabled={safePage === 0}
              onClick={() => setPage(safePage - 1)}
              aria-label="Previous page"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <span className="px-1 tabular-nums">
              {safePage + 1} / {pageCount}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-6 w-6"
              disabled={safePage >= pageCount - 1}
              onClick={() => setPage(safePage + 1)}
              aria-label="Next page"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Misc cell renderers                                                       */
/* -------------------------------------------------------------------------- */

export function BotBadge({ isBot, fallback }: { isBot: boolean; fallback?: string | null }) {
  if (isBot)
    return (
      <span className="inline-flex items-center gap-1 text-muted-foreground">
        <Bot className="h-3 w-3" /> Bot
      </span>
    );
  return <>{fallback || "—"}</>;
}

export function Chip({ children }: { children: React.ReactNode }) {
  return (
    <Badge variant="secondary" className="rounded-md px-1.5 py-0 font-normal text-[10.5px]">
      {children}
    </Badge>
  );
}

export function MonoRef({ value }: { value: string | null | undefined }) {
  return <span className="font-mono text-[11px]">{value || "—"}</span>;
}
