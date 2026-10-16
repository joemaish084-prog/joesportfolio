import { useEffect, useRef, type ComponentPropsWithoutRef } from "react";
import { useInView, useMotionValue, useReducedMotion, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";
import { MASK, usePrivacy } from "../../lib/privacy";

// Magic UI Number Ticker. Same structure: a motion value set once in view, a
// spring following it, and textContent written on change so React doesn't
// re-render per frame. The spring is stiffer than stock so it settles in ~0.4s.

interface NumberTickerProps extends ComponentPropsWithoutRef<"span"> {
  value: number;
  startValue?: number;
  direction?: "up" | "down";
  delay?: number;
  decimalPlaces?: number;
}

const format = (n: number, decimalPlaces: number) =>
  Intl.NumberFormat("en-KE", {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  }).format(Number(n.toFixed(decimalPlaces)));

export function NumberTicker({
  value,
  startValue = 0,
  direction = "up",
  delay = 0,
  className,
  decimalPlaces = 0,
  ...props
}: NumberTickerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const reduceMotion = useReducedMotion();
  const motionValue = useMotionValue(direction === "down" ? value : startValue);
  const springValue = useSpring(motionValue, { damping: 40, stiffness: 320 });
  const isInView = useInView(ref, { once: true, margin: "0px" });

  useEffect(() => {
    if (!isInView) return;
    const target = direction === "down" ? startValue : value;
    if (reduceMotion) {
      motionValue.jump(target);
      springValue.jump(target);
      return;
    }
    const timer = setTimeout(() => motionValue.set(target), delay * 1000);
    return () => clearTimeout(timer);
  }, [motionValue, springValue, isInView, delay, value, direction, startValue, reduceMotion]);

  useEffect(
    () =>
      springValue.on("change", (latest) => {
        if (ref.current) ref.current.textContent = format(latest, decimalPlaces);
      }),
    [springValue, decimalPlaces],
  );

  return (
    <span ref={ref} className={cn("inline-block tabular-nums tracking-tight", className)} {...props}>
      {format(reduceMotion ? value : direction === "down" ? value : startValue, decimalPlaces)}
    </span>
  );
}

/** "KES 45,000" that counts up. Null renders a dash, like formatKES. */
export function KesTicker({
  value,
  className,
  delay,
}: {
  value: number | null | undefined;
  className?: string;
  delay?: number;
}) {
  const { hidden } = usePrivacy();
  if (value === null || value === undefined || Number.isNaN(value)) return <span className={className}>—</span>;
  if (hidden) return <span className={cn("hub-tabular whitespace-nowrap", className)}>{MASK}</span>;
  return (
    <span className={cn("hub-tabular whitespace-nowrap", className)}>
      KES <NumberTicker value={value} delay={delay} className="tracking-normal" />
    </span>
  );
}
