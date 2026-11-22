import { useEffect, useRef, type ReactNode } from "react";
import { useInView, useReducedMotion } from "framer-motion";
import { annotate } from "rough-notation";

type AnnotationAction = "highlight" | "underline" | "box" | "circle" | "strike-through" | "crossed-off" | "bracket";

interface HighlighterProps {
  children: ReactNode;
  action?: AnnotationAction;
  color?: string;
  strokeWidth?: number;
  animationDuration?: number;
  iterations?: number;
  padding?: number;
  multiline?: boolean;
  /** Wait until the text scrolls into view before drawing. */
  isView?: boolean;
  /** Extra delay (ms) after the text is in view, to stagger several marks. */
  delay?: number;
}

/** Hand-drawn text annotation (Magic UI Highlighter pattern, built on rough-notation). */
export function Highlighter({
  children,
  action = "highlight",
  color = "#ffd1dc",
  strokeWidth = 1.5,
  animationDuration = 600,
  iterations = 2,
  padding = 2,
  multiline = true,
  isView = false,
  delay = 0,
}: HighlighterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-10%" });
  const reduceMotion = useReducedMotion();
  const shouldShow = !isView || inView;

  useEffect(() => {
    const element = ref.current;
    if (!shouldShow || !element) return;

    const annotation = annotate(element, {
      type: action, color, strokeWidth, animationDuration, iterations, padding, multiline,
      animate: !reduceMotion,
    });
    const timer = window.setTimeout(() => annotation.show(), delay);

    // Redraw when the text reflows so the mark stays aligned.
    let first = true;
    const observer = new ResizeObserver(() => {
      if (first) { first = false; return; }
      annotation.hide();
      annotation.show();
    });
    observer.observe(element);

    return () => {
      window.clearTimeout(timer);
      observer.disconnect();
      annotation.remove();
    };
  }, [shouldShow, action, color, strokeWidth, animationDuration, iterations, padding, multiline, delay, reduceMotion]);

  return <span ref={ref} className="relative inline-block bg-transparent">{children}</span>;
}
