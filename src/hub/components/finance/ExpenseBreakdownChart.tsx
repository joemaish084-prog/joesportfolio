import { Cell, Label, Pie, PieChart } from "recharts";
import { ChartContainer, ChartTooltip, ChartTooltipContent, type ChartConfig } from "@/components/ui/chart";
import { useKes } from "../../lib/privacy";

// shadcn donut chart: where the money went, by expense category. One accent:
// the biggest slice is full orange, the rest step down in opacity.

export type Slice = { key: string; label: string; amount: number };

const shade = (i: number) => `hsl(var(--primary) / ${Math.max(0.18, 1 - i * 0.18)})`;
const compact = new Intl.NumberFormat("en-KE", { notation: "compact", maximumFractionDigits: 1 });

export default function ExpenseBreakdownChart({ data }: { data: Slice[] }) {
  const kes = useKes();
  const total = data.reduce((s, d) => s + d.amount, 0);
  const config = Object.fromEntries(
    data.map((d, i) => [d.key, { label: d.label, color: shade(i) }]),
  ) satisfies ChartConfig;
  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <div className="flex flex-col items-center gap-4 sm:flex-row lg:flex-col xl:flex-row">
      <ChartContainer config={config} className="aspect-square h-44 shrink-0">
        <PieChart>
          <ChartTooltip
            cursor={false}
            content={
              <ChartTooltipContent
                hideLabel
                formatter={(value, name) => (
                  <div className="flex w-full items-center justify-between gap-4">
                    <span className="text-muted-foreground">{config[name as string]?.label ?? name}</span>
                    <span className="hub-tabular font-medium">{kes(Number(value))}</span>
                  </div>
                )}
              />
            }
          />
          <Pie
            data={data}
            dataKey="amount"
            nameKey="key"
            innerRadius={52}
            outerRadius={80}
            strokeWidth={3}
            stroke="hsl(var(--card))"
            isAnimationActive={!reduce}
            animationDuration={300}
          >
            {data.map((d, i) => (
              <Cell key={d.key} fill={shade(i)} />
            ))}
            <Label
              content={({ viewBox }) =>
                viewBox && "cx" in viewBox && "cy" in viewBox ? (
                  <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                    <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) - 6} className="fill-foreground text-base font-bold">
                      {compact.format(total)}
                    </tspan>
                    <tspan x={viewBox.cx} y={(viewBox.cy ?? 0) + 12} className="fill-muted-foreground text-[10px]">
                      KES spent
                    </tspan>
                  </text>
                ) : null
              }
            />
          </Pie>
        </PieChart>
      </ChartContainer>
      <ul className="w-full min-w-0 space-y-1.5 text-sm">
        {data.slice(0, 6).map((d, i) => (
          <li key={d.key} className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: shade(i) }} />
            <span className="min-w-0 flex-1 truncate">{d.label}</span>
            <span className="hub-tabular text-muted-foreground">{Math.round((d.amount / total) * 100)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
