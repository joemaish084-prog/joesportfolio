import { useRef, type ReactNode } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
  type UseInViewOptions,
  type Variants,
} from "framer-motion";

// Magic UI Blur Fade, tuned shorter for a work tool: 6px travel, 6px blur, 250ms.

interface BlurFadeProps {
  children: ReactNode;
  className?: string;
  variant?: { hidden: { y: number }; visible: { y: number } };
  duration?: number;
  delay?: number;
  offset?: number;
  direction?: "up" | "down" | "left" | "right";
  inView?: boolean;
  inViewMargin?: UseInViewOptions["margin"];
  blur?: string;
}

export function BlurFade({
  children,
  className,
  variant,
  duration = 0.25,
  delay = 0,
  offset = 6,
  direction = "down",
  inView = false,
  inViewMargin = "-50px",
  blur = "6px",
}: BlurFadeProps) {
  const ref = useRef(null);
  const inViewResult = useInView(ref, { once: true, margin: inViewMargin });
  const isInView = !inView || inViewResult;
  const reduceMotion = useReducedMotion();

  if (reduceMotion) return <div className={className}>{children}</div>;

  const axis = direction === "left" || direction === "right" ? "x" : "y";
  const sign = direction === "right" || direction === "down" ? -1 : 1;
  const defaultVariants: Variants = {
    hidden: { [axis]: sign * offset, opacity: 0, filter: `blur(${blur})` },
    visible: { [axis]: 0, opacity: 1, filter: "blur(0px)" },
  };
  const combinedVariants = variant || defaultVariants;

  return (
    <AnimatePresence>
      <motion.div
        ref={ref}
        initial="hidden"
        animate={isInView ? "visible" : "hidden"}
        exit="hidden"
        variants={combinedVariants}
        transition={{ delay: 0.04 + delay, duration, ease: "easeOut" }}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
