import {
  Children,
  memo,
  useEffect,
  useMemo,
  useState,
  type ComponentPropsWithoutRef,
  type ReactElement,
  type ReactNode,
} from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

// Magic UI Animated List: children reveal one at a time and each new item
// lands on top. Pass children oldest-first so the newest ends up first.

export function AnimatedListItem({ children }: { children: ReactNode }) {
  const animations = {
    initial: { scale: 0.96, opacity: 0 },
    animate: { scale: 1, opacity: 1, originY: 0 },
    exit: { scale: 0.96, opacity: 0 },
    transition: { type: "spring" as const, stiffness: 350, damping: 40 },
  };

  return (
    <motion.div {...animations} layout className="w-full">
      {children}
    </motion.div>
  );
}

interface AnimatedListProps extends ComponentPropsWithoutRef<"div"> {
  children: ReactNode;
  delay?: number;
}

export const AnimatedList = memo(({ children, className, delay = 120, ...props }: AnimatedListProps) => {
  const reduceMotion = useReducedMotion();
  const childrenArray = useMemo(() => Children.toArray(children), [children]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < childrenArray.length - 1) {
      const timeout = setTimeout(() => setIndex((prev) => prev + 1), delay);
      return () => clearTimeout(timeout);
    }
  }, [index, delay, childrenArray.length]);

  const shown = reduceMotion ? childrenArray.length - 1 : index;
  const itemsToShow = useMemo(() => childrenArray.slice(0, shown + 1).reverse(), [shown, childrenArray]);

  return (
    <div className={cn("flex flex-col items-center", className)} {...props}>
      <AnimatePresence initial={false}>
        {itemsToShow.map((item) => (
          <AnimatedListItem key={(item as ReactElement).key}>{item}</AnimatedListItem>
        ))}
      </AnimatePresence>
    </div>
  );
});

AnimatedList.displayName = "AnimatedList";
