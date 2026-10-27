import { AreaChart, BarChart, DonutChart, SparkAreaChart } from "@tremor/react";
import { formatKES } from "@/hub/lib/format";
import type { KpiUnit } from "@/hub/lib/types";

// Thin wrappers around Tremor so every chart in the portal formats numbers
// the same way and carries the same look.

const nf = new Intl.NumberFormat("en-KE", { maximumFractionDigits: 2 });
const compact = new Intl.NumberFormat("en-KE", { notation: "compact", maximumFractionDigits: 1 });

export function unitFormatter(unit: KpiUnit) {
  return (v: number) => (unit === "kes" ? formatKES(v) : unit === "percent" ? `${nf.format(v)}%` : nf.format(v));
}

/** Short axis labels: 1.2M instead of KES 1,200,000. */
export function axisFormatter(unit: KpiUnit) {
  return (v: number) => (unit === "percent" ? `${compact.format(v)}%` : compact.format(v));
}

export type Point = { label: string; value: number };

/** The main area chart for one KPI over time. */
export function TrendChart({
  name,
  unit,
  points,
  color = "orange",
  height = "h-72",
}: {
  name: string;
  unit: KpiUnit;
  points: Point[];
  color?: "orange" | "sky" | "emerald" | "violet" | "amber" | "rose";
  height?: string;
}) {
  const data = points.map((p) => ({ label: p.label, [name]: p.value }));
  return (
    <AreaChart
      className={height}
      data={data}
      index="label"
      categories={[name]}
      colors={[color]}
      valueFormatter={unitFormatter(unit)}
      showLegend={false}
      showGradient
      curveType="monotone"
      yAxisWidth={unit === "kes" ? 116 : 52}
      showAnimation
      animationDuration={700}
      autoMinValue
      customTooltip={undefined}
      aria-label={`${name} over time`}
    />
  );
}

/** A grouped-bar comparison of one KPI by period. */
export function BarsChart({ name, unit, points, height = "h-72" }: { name: string; unit: KpiUnit; points: Point[]; height?: string }) {
  const data = points.map((p) => ({ label: p.label, [name]: p.value }));
  return (
    <BarChart
      className={height}
      data={data}
      index="label"
      categories={[name]}
      colors={["orange"]}
      valueFormatter={unitFormatter(unit)}
      showLegend={false}
      yAxisWidth={unit === "kes" ? 116 : 52}
      showAnimation
      animationDuration={600}
      aria-label={`${name} by period`}
    />
  );
}

/** A tiny trend line for cards. */
export function Spark({ points, good = true }: { points: Point[]; good?: boolean | null }) {
  const data = points.map((p) => ({ label: p.label, value: p.value }));
  return (
    <SparkAreaChart
      data={data}
      index="label"
      categories={["value"]}
      colors={[good === false ? "rose" : "orange"]}
      className="h-10 w-full"
      curveType="monotone"
    />
  );
}

export function Donut({ data, valueFormatter }: { data: { name: string; value: number }[]; valueFormatter?: (n: number) => string }) {
  return (
    <DonutChart
      className="h-44"
      data={data}
      category="value"
      index="name"
      colors={["orange", "amber", "sky", "emerald", "violet", "rose", "slate"]}
      valueFormatter={valueFormatter ?? ((n) => String(n))}
      showAnimation
      variant="donut"
    />
  );
}
