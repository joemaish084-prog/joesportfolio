import { useRef } from "react";
import { motion, useInView, type Variant } from "framer-motion";

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

  const initial = {
    ...hidden[direction],
    ...(rotate !== undefined ? { rotate } : {}),
  };

  return (
    <motion.div
      ref={ref}
      initial={initial}
      animate={inView ? { ...visible, rotate: 0 } : initial}
      transition={{
        duration,
        delay,
        ease: [0.22, 1, 0.36, 1],
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}
