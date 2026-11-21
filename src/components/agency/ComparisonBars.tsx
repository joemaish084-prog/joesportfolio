interface ComparisonRow {
  label: string;
  value: number;
  display: string;
  partial?: boolean;
}

/** The labels and values are readable in the initial markup and by assistive technology. */
export function ComparisonBars({ rows }: { rows: ComparisonRow[] }) {
  const max = Math.max(1, ...rows.map(({ value }) => value));
  return (
    <ul role="list" className="space-y-3">
      {rows.map(({ label, value, display, partial }) => (
        <li key={label}>
          <div className="flex items-baseline justify-between gap-3 text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="shrink-0 text-right font-semibold tabular-nums">{display}</span>
          </div>
          <div aria-hidden className="mt-1.5 h-2 overflow-hidden rounded-full bg-primary/10">
            <div
              className={`h-full rounded-full bg-primary ${partial ? "bg-[repeating-linear-gradient(135deg,transparent_0_3px,hsl(var(--card)/0.7)_3px_5px)]" : ""}`}
              style={{ width: `${value / max * 100}%` }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}
