import { useEffect, useRef, useState } from "react";
import { useInView, useReducedMotion } from "framer-motion";

interface CountUpProps {
  value: number;
  prefix?: string;
  suffix?: string;
  /** Decimal places shown, for figures such as 41.3. */
  decimals?: number;
}

/**
 * Counts up when it scrolls into view. The real value is always in the HTML
 * (`agency-counter-static`); `index.css` swaps in the animated copy only when JS
 * is on, so crawlers and no-JS visitors read the final number. With reduced
 * motion the animated copy starts at the final number and does not move.
 */
export function CountUp({ value, prefix = "", suffix = "", decimals = 0 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduceMotion = useReducedMotion();
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!inView || reduceMotion) return;
    const duration = 1500;
    const start = performance.now();
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / duration);
      setN(p * value);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, reduceMotion, value]);

  const shown = reduceMotion ? value : n;
  // Integers floor so the count never overshoots; decimals are rounded to the shown places.
  const text = decimals > 0 ? shown.toFixed(decimals) : String(Math.floor(shown));

  return (
    <span ref={ref}>
      {prefix}
      <span className="agency-counter-animated" aria-hidden="true">{text}</span>
      <span className="agency-counter-static">{value.toFixed(decimals)}</span>
      {suffix}
    </span>
  );
}
