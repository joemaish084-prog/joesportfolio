import { useEffect, useState } from "react";
import { animate, useReducedMotion } from "framer-motion";
import type { MetricUnit } from "./servicesContent";

function formatMetric(value: number, unit: MetricUnit, decimals = 0) {
  const text = decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString("en-US");
  if (unit === "kes") return `KES ${text}`;
  if (unit === "percent") return `${text}%`;
  return text;
}

interface PerformanceMetricProps {
  label: string;
  value: number;
  unit: MetricUnit;
  decimals?: number;
  /** Count up from zero on mount. Off for the first paint so the page and prerender show real values. */
  countUp?: boolean;
  className?: string;
}

/** One figure in the Campaign Snapshot. The number transition is skipped for reduced motion. */
export function PerformanceMetric({ label, value, unit, decimals = 0, countUp = false, className = "" }: PerformanceMetricProps) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState(countUp && !reduced ? 0 : value);

  useEffect(() => {
    if (!countUp || reduced) {
      setShown(value);
      return;
    }
    const controls = animate(0, value, { duration: 0.7, ease: "easeOut", onUpdate: setShown });
    return () => controls.stop();
  }, [value, countUp, reduced]);

  return (
    <div className={`rounded-xl border p-4 ${className}`} style={{ borderColor: "hsl(var(--panel-dark-border))", background: "hsl(0 0% 100% / 0.03)" }}>
      <dt className="text-xs" style={{ color: "hsl(var(--panel-dark-muted))" }}>{label}</dt>
      {/* The final value stays in the accessibility tree; the animated figure is decorative. */}
      <dd className="mt-1.5 font-display text-2xl font-semibold leading-none tracking-tight tabular-nums sm:text-[1.65rem]">
        <span className="sr-only">{formatMetric(value, unit, decimals)}</span>
        <span aria-hidden>{formatMetric(shown, unit, decimals)}</span>
      </dd>
    </div>
  );
}
