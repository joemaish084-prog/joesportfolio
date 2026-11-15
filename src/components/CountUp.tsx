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
 * Shows the real figure from the first render, so the prerendered HTML and the
 * page before JS runs read "KES 180K", not "KES 0K". A counter that starts below
 * the fold resets to 0 and counts up when it scrolls into view. One already on
 * screen at load keeps its final value, so nothing flashes.
 * `index.css` shows the animated copy only when JS is on; without JS the static
 * copy (same figure) is shown instead.
 */
export function CountUp({ value, prefix = "", suffix = "", decimals = 0 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const reduceMotion = useReducedMotion();
  const [n, setN] = useState(value);
  const countsOnScroll = useRef(false);

  // Runs after mount. Off-screen counters are reset here, before anyone can see them.
  useEffect(() => {
    const el = ref.current;
    if (!el || reduceMotion) return;
    if (el.getBoundingClientRect().top >= window.innerHeight) {
      countsOnScroll.current = true;
      setN(0);
    }
  }, [reduceMotion]);

  useEffect(() => {
    if (!inView || reduceMotion || !countsOnScroll.current) return;
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
