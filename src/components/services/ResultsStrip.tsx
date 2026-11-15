import { CountUp } from "@/components/CountUp";
import type { ResultStat } from "@/data/services";

/** Four published headline figures. The real value is in the HTML; it counts up when scrolled into view. */
export function ResultsStrip({ items }: { items: ResultStat[] }) {
  return (
    <dl className="grid grid-cols-2 gap-x-6 gap-y-8 border-y border-border/60 py-8 lg:grid-cols-4 lg:gap-x-8">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col-reverse justify-end">
          <dt className="mt-2 text-sm leading-snug text-muted-foreground">{item.label}</dt>
          <dd className="font-display text-4xl font-bold tracking-tight text-gradient tabular-nums sm:text-5xl">
            <CountUp value={item.value} decimals={item.decimals} suffix={item.suffix} />
          </dd>
        </div>
      ))}
    </dl>
  );
}
