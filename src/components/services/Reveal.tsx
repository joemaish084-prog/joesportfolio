import type { ReactNode } from "react";
import { motion } from "framer-motion";

interface RevealProps {
  children: ReactNode;
  className?: string;
  /** Seconds to wait, for staggering siblings. */
  delay?: number;
}

/**
 * Fades a block up once as it scrolls into view. Opacity and transform only.
 * Reduced motion is handled by the page's `MotionConfig reducedMotion="user"`,
 * and `index.css` shows the content to visitors without JavaScript.
 * Keep it off anything above the fold.
 */
export function Reveal({ children, className, delay = 0 }: RevealProps) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -80px 0px" }}
      transition={{ duration: 0.5, delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}
