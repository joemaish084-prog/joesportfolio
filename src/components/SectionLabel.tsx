interface SectionLabelProps {
  children: string;
  className?: string;
}

/** Small mono uppercase orange label rendered above a section heading. */
export function SectionLabel({ children, className = "" }: SectionLabelProps) {
  return (
    <p className={`section-label ${className}`}>
      <span className="slashes" aria-hidden>//</span> {children}
    </p>
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
