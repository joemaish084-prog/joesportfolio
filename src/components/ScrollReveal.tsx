import { useEffect, useRef, useState } from "react";
import { motion, useInView, useReducedMotion, type Variant } from "framer-motion";

type Direction = "up" | "down" | "left" | "right" | "fade" | "scale";

const hidden: Record<Direction, Variant> = {
  up: { opacity: 0, y: 40 },
  down: { opacity: 0, y: -40 },
  left: { opacity: 0, x: -40 },
  right: { opacity: 0, x: 40 },
  fade: { opacity: 0 },
  scale: { opacity: 0, scale: 0.95 },
};

const visible: Variant = { opacity: 1, x: 0, y: 0, scale: 1 };

// If the observer has not revealed an element this long after it reaches the
// viewport (slow device, starved main thread, observer quirk), show it anyway.
const FALLBACK_MS = 1500;

interface Props {
  children: React.ReactNode;
  direction?: Direction;
  delay?: number;
  duration?: number;
  className?: string;
  rotate?: number;
}

export function ScrollReveal({
  children,
  direction = "up",
  delay = 0,
  duration = 0.6,
  className = "",
  rotate,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-20% 0px" });
  const reduceMotion = useReducedMotion();
  const [forced, setForced] = useState(false);
  // Reduced motion: show straight away. Keep the same element as the
  // prerendered HTML so hydration updates its inline opacity instead of
  // leaving the server's hidden style behind.
  const show = inView || forced || Boolean(reduceMotion);

  useEffect(() => {
    const node = ref.current;
    if (!node || show) return;
    let timer = 0;
    const check = () => {
      const rect = node.getBoundingClientRect();
      const onScreen = rect.top < window.innerHeight && rect.bottom > 0;
      if (onScreen && !timer) timer = window.setTimeout(() => setForced(true), FALLBACK_MS);
    };
    check();
    const interval = window.setInterval(check, 500);
    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timer);
    };
  }, [show]);

  const initial = {
    ...hidden[direction],
    ...(rotate !== undefined ? { rotate } : {}),
  };

  return (
    <motion.div
      ref={ref}
      data-scroll-reveal={show ? "shown" : "waiting"}
      initial={initial}
      animate={show ? { ...visible, rotate: 0 } : initial}
      transition={{
        duration: reduceMotion ? 0 : duration,
        delay: reduceMotion ? 0 : delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
