import { useEffect, useRef, type CSSProperties, type ReactNode } from "react";
import { animate, motion, useInView, useMotionValue, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

// Small visual-polish pieces in the style of Magic UI. Each one is subtle,
// respects reduced-motion, and costs nothing when the effect is off.

/** A light that travels around the edge of a card. The parent needs `relative` and a border radius. */
export function BorderBeam({
  size = 220,
  duration = 14,
  delay = 0,
  radius = 22,
  from = "#ff6a00",
  to = "#ffc08a",
  className,
}: {
  size?: number;
  duration?: number;
  delay?: number;
  radius?: number;
  from?: string;
  to?: string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  if (reduce) return null;
  return (
    <div
      aria-hidden
      style={
        {
          "--size": `${size}px`,
          "--duration": duration,
          "--delay": `${-delay}s`,
          "--radius": `${radius}px`,
          "--from": from,
          "--to": to,
        } as CSSProperties
      }
      className={cn(
        "pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent",
        "[mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]",
        "after:absolute after:aspect-square after:w-[var(--size)] after:animate-border-beam",
        "after:[animation-delay:var(--delay)] after:[background:linear-gradient(to_left,var(--from),var(--to),transparent)]",
        "after:[offset-anchor:90%_50%] after:[offset-path:rect(0_auto_auto_0_round_var(--radius))]",
        className,
      )}
    />
  );
}

/** A faint dotted grid for hero panels. */
export function DotPattern({ className, size = 22 }: { className?: string; size?: number }) {
  return (
    <div
      aria-hidden
      className={cn("pointer-events-none absolute inset-0", className)}
      style={{
        backgroundImage: "radial-gradient(currentColor 1px, transparent 1px)",
        backgroundSize: `${size}px ${size}px`,
      }}
    />
  );
}

/** Counts up to a value the first time it scrolls into view. */
export function NumberTicker({
  value,
  format,
  className,
  duration = 1.4,
}: {
  value: number;
  format: (n: number) => string;
  className?: string;
  duration?: number;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const reduce = useReducedMotion();
  const motionValue = useMotionValue(0);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(motionValue, value, { duration, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [inView, reduce, value, duration, motionValue]);

  useEffect(
    () =>
      motionValue.on("change", (latest) => {
        if (ref.current) ref.current.textContent = format(latest);
      }),
    [motionValue, format],
  );

  // Server-style first paint and reduced motion both show the real number.
  return (
    <span ref={ref} className={cn("portal-tabular", className)}>
      {format(reduce ? value : inView ? 0 : value)}
    </span>
  );
}

/** Fades and un-blurs its children in as they scroll into view. */
export function BlurFade({
  children,
  delay = 0,
  className,
  y = 10,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
  y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-30px" });
  const reduce = useReducedMotion();
  if (reduce) return <div className={className}>{children}</div>;
  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y, filter: "blur(6px)" }}
      animate={inView ? { opacity: 1, y: 0, filter: "blur(0px)" } : undefined}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/** A card with a soft spotlight that follows the pointer. */
export function SpotlightCard({
  children,
  className,
  glow = "hsl(25 100% 50% / 0.14)",
}: {
  children: ReactNode;
  className?: string;
  glow?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  return (
    <div
      ref={ref}
      onPointerMove={(e) => {
        const el = ref.current;
        if (!el || reduce || e.pointerType === "touch") return;
        const r = el.getBoundingClientRect();
        el.style.setProperty("--mx", `${e.clientX - r.left}px`);
        el.style.setProperty("--my", `${e.clientY - r.top}px`);
      }}
      className={cn("group portal-card overflow-hidden", className)}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{ background: `radial-gradient(320px circle at var(--mx, 50%) var(--my, 50%), ${glow}, transparent 65%)` }}
      />
      <div className="relative">{children}</div>
    </div>
  );
}
