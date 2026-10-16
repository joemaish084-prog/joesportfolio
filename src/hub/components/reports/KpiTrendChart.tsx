import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { formatKpi } from "../../lib/format";
import type { KpiUnit } from "../../lib/types";

// shadcn area chart for one KPI across report periods. Lives in its own file so
// recharts only loads when a progress chart is actually on screen.

const config = {
  value: { label: "Value", color: "hsl(var(--primary))" },
} satisfies ChartConfig;

const compact = new Intl.NumberFormat("en-KE", { notation: "compact", maximumFractionDigits: 1 });

export default function KpiTrendChart({
  data,
  unit,
  id,
}: {
  data: { label: string; value: number }[];
  unit: KpiUnit;
  id: string;
}) {
  const gradientId = `fill-${id}`;
  return (
    <ChartContainer config={config} className="aspect-auto h-36 w-full">
      <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-value)" stopOpacity={0.25} />
            <stop offset="95%" stopColor="var(--color-value)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={44}
          fontSize={11}
          tickFormatter={(v: number) => (unit === "percent" ? `${v}%` : compact.format(v))}
        />
        <ChartTooltip
          cursor={false}
          content={<ChartTooltipContent indicator="line" formatter={(v) => formatKpi(Number(v), unit)} />}
        />
        <Area
          dataKey="value"
          type="monotone"
          stroke="var(--color-value)"
          strokeWidth={2}
          fill={`url(#${gradientId})`}
          dot={{ r: 3, fill: "var(--color-value)" }}
          isAnimationActive={!window.matchMedia("(prefers-reduced-motion: reduce)").matches}
          animationDuration={300}
        />
      </AreaChart>
    </ChartContainer>
  );
}
