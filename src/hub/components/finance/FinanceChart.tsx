import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { formatKES } from "../../lib/format";

// shadcn bar chart: money in vs money out per month. Separate file so recharts
// loads only with the finance screens.

const config = {
  revenue: { label: "Received", color: "hsl(var(--primary))" },
  expenses: { label: "Expenses", color: "hsl(var(--muted-foreground) / 0.45)" },
} satisfies ChartConfig;

const compact = new Intl.NumberFormat("en-KE", { notation: "compact", maximumFractionDigits: 1 });

export default function FinanceChart({ data }: { data: { month: string; revenue: number; expenses: number }[] }) {
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  return (
    <ChartContainer config={config} className="aspect-auto h-64 w-full">
      <BarChart data={data} margin={{ top: 8, right: 4, bottom: 0, left: 0 }} barGap={4}>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
        <YAxis
          tickLine={false}
          axisLine={false}
          width={48}
          fontSize={11}
          tickFormatter={(v: number) => compact.format(v)}
        />
        <ChartTooltip
          cursor={{ fill: "hsl(var(--secondary))", radius: 8 }}
          content={
            <ChartTooltipContent
              formatter={(value, name) => (
                <div className="flex w-full items-center justify-between gap-4">
                  <span className="text-muted-foreground">{config[name as keyof typeof config]?.label ?? name}</span>
                  <span className="hub-tabular font-medium">{formatKES(Number(value))}</span>
                </div>
              )}
            />
          }
        />
        <ChartLegend content={<ChartLegendContent />} />
        <Bar
          dataKey="revenue"
          fill="var(--color-revenue)"
          radius={[6, 6, 0, 0]}
          maxBarSize={28}
          isAnimationActive={!reduce}
          animationDuration={300}
        />
        <Bar
          dataKey="expenses"
          fill="var(--color-expenses)"
          radius={[6, 6, 0, 0]}
          maxBarSize={28}
          isAnimationActive={!reduce}
          animationDuration={300}
        />
      </BarChart>
    </ChartContainer>
  );
}
