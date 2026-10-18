import { useId } from "react";
import { Link } from "react-router-dom";
import { Target } from "lucide-react";
import { cn } from "@/lib/utils";
import { PrivateBlur } from "../privacy";
import { ClientAvatar } from "../ui";

// Small visuals that sit beside the big numbers on the Overview cards.
// One series colour (--chart-in) throughout, like the rest of the hub's charts.

/** Six months of money in as a soft area line; the last point is marked. */
export function Sparkline({ values, className }: { values: number[]; className?: string }) {
  const gradient = useId();
  const w = 112;
  const h = 44;
  const pad = 4;
  const max = Math.max(1, ...values);
  const points = values.map((v, i) => [
    pad + (i * (w - pad * 2)) / Math.max(1, values.length - 1),
    h - pad - (v / max) * (h - pad * 2),
  ]);
  const line = points.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const [lx, ly] = points[points.length - 1];
  return (
    <PrivateBlur quiet className={className}>
      <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} role="img" aria-label="Money in, last 6 months">
        <defs>
          <linearGradient id={gradient} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--chart-in)" stopOpacity={0.28} />
            <stop offset="100%" stopColor="var(--chart-in)" stopOpacity={0} />
          </linearGradient>
        </defs>
        <path d={`${line} L${lx},${h} L${points[0][0]},${h} Z`} fill={`url(#${gradient})`} />
        <path d={line} fill="none" stroke="var(--chart-in)" strokeWidth={2} strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={lx} cy={ly} r={3.5} fill="var(--chart-in)" stroke="hsl(var(--card))" strokeWidth={2} />
      </svg>
    </PrivateBlur>
  );
}

/** A ring that fills to `value` of `total`, with the percentage inside. */
export function Ring({
  value,
  total,
  size = 52,
  stroke = 5,
  label,
  className,
}: {
  value: number;
  total: number;
  size?: number;
  stroke?: number;
  label?: string;
  className?: string;
}) {
  const pct = total > 0 ? Math.min(1, value / total) : 0;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  return (
    <div className={cn("relative shrink-0", className)} style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="hsl(var(--secondary))" strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="var(--chart-in)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - pct)}
          className="transition-[stroke-dashoffset] duration-700 ease-out motion-reduce:transition-none"
        />
      </svg>
      <span className="hub-tabular absolute inset-0 flex items-center justify-center text-xs font-semibold">
        {label ?? `${Math.round(pct * 100)}%`}
      </span>
    </div>
  );
}

/** Up to four client initials, overlapping, plus a "+n". */
export function AvatarStack({ names, max = 4 }: { names: string[]; max?: number }) {
  if (!names.length) return null;
  const shown = names.slice(0, max);
  const extra = names.length - shown.length;
  return (
    <div className="flex items-center" aria-label={names.join(", ")}>
      {shown.map((name, i) => (
        <ClientAvatar
          key={name + i}
          name={name}
          className={cn("h-9 w-9 rounded-full text-xs ring-2 ring-card", i > 0 && "-ml-2.5")}
        />
      ))}
      {extra > 0 && (
        <span className="-ml-2.5 flex h-9 w-9 items-center justify-center rounded-full bg-secondary text-xs font-semibold ring-2 ring-card">
          +{extra}
        </span>
      )}
    </div>
  );
}

/** One slim column per open stage, tallest stage full height. */
export function StageColumns({ stages }: { stages: { label: string; count: number }[] }) {
  const max = Math.max(1, ...stages.map((s) => s.count));
  return (
    <div className="flex h-11 items-end gap-1.5" role="img" aria-label="Open leads by stage">
      {stages.map((s) => (
        <div
          key={s.label}
          title={`${s.label}: ${s.count}`}
          className="w-3.5 rounded-t-[3px]"
          style={{
            height: `${s.count ? Math.max(12, (s.count / max) * 100) : 6}%`,
            background: "var(--chart-in)",
            opacity: s.count ? 0.85 : 0.2,
          }}
        />
      ))}
    </div>
  );
}

/** This month's money in against the goal from Settings. */
export function GoalCard({
  received,
  goal,
  daysLeft,
  kes,
}: {
  received: number | null;
  goal: number | null;
  daysLeft: number;
  kes: (v: number) => string;
}) {
  if (!goal) {
    return (
      <Link
        to="/hub/settings"
        className="hub-card flex items-center gap-3 px-4 py-3 text-sm transition-colors duration-150 hover:bg-secondary/60"
      >
        <span className="flex h-10 w-10 items-center justify-center rounded-full bg-tint text-on-tint">
          <Target className="h-5 w-5" />
        </span>
        <span>
          <span className="block font-medium">Set a monthly goal</span>
          <span className="block text-xs text-muted-foreground">Track money in against a target</span>
        </span>
      </Link>
    );
  }
  const got = received ?? 0;
  const left = Math.max(0, goal - got);
  return (
    <Link
      to="/hub/finance"
      className="hub-card flex items-center gap-4 px-4 py-3 transition-colors duration-150 hover:bg-secondary/60"
    >
      <PrivateBlur quiet>
        <Ring value={got} total={goal} size={56} />
      </PrivateBlur>
      <span className="min-w-0 text-sm">
        <span className="block text-xs font-medium text-muted-foreground">Monthly goal</span>
        <span className="hub-tabular block font-semibold">
          {kes(got)} <span className="font-normal text-muted-foreground">of {kes(goal)}</span>
        </span>
        <span className="block text-xs text-muted-foreground">
          {left === 0
            ? "Goal reached. Nice work."
            : `${kes(left)} to go · ${daysLeft} ${daysLeft === 1 ? "day" : "days"} left`}
        </span>
      </span>
    </Link>
  );
}
