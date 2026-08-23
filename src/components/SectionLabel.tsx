import { motion } from "framer-motion";

interface SectionLabelProps {
  children: string;
  className?: string;
}

/** Small mono uppercase orange label rendered above a section heading. */
export function SectionLabel({ children, className = "" }: SectionLabelProps) {
  return (
    <motion.p
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, ease: [0.2, 0, 0, 1] }}
      className={`section-label ${className}`}
    >
      <span className="slashes">//</span> {children}
    </motion.p>
  );
}

/** Shared stagger variants for section content. */
export const staggerContainer = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
};

export const staggerItem = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: [0.2, 0, 0, 1] as const },
  },
};

export default SectionLabel;
