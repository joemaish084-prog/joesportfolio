import { createContext, useContext, useRef, type ComponentPropsWithoutRef, type ReactNode } from "react";
import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type MotionProps,
  type MotionValue,
} from "framer-motion";
import { cn } from "@/lib/utils";

// Magic UI Dock: icons grow as the pointer nears them, sized by distance along
// the dock through a spring. Adds a vertical orientation for the desktop
// sidebar. Magnification is milder than stock (40 → 50) with more damping so
// it settles without wobble, and is off for reduced motion and touch.

const DEFAULT_SIZE = 40;
const DEFAULT_MAGNIFICATION = 50;
const DEFAULT_DISTANCE = 120;

type Orientation = "horizontal" | "vertical";

type DockContextValue = {
  pointer: MotionValue<number>;
  orientation: Orientation;
  size: number;
  magnification: number;
  distance: number;
};

const DockContext = createContext<DockContextValue | null>(null);

interface DockProps extends Omit<ComponentPropsWithoutRef<"div">, keyof MotionProps> {
  iconSize?: number;
  iconMagnification?: number;
  iconDistance?: number;
  orientation?: Orientation;
  children: ReactNode;
}

export function Dock({
  className,
  children,
  iconSize = DEFAULT_SIZE,
  iconMagnification = DEFAULT_MAGNIFICATION,
  iconDistance = DEFAULT_DISTANCE,
  orientation = "horizontal",
  ...props
}: DockProps) {
  const pointer = useMotionValue(Infinity);
  const reduceMotion = useReducedMotion();
  const vertical = orientation === "vertical";

  return (
    <DockContext.Provider
      value={{
        pointer,
        orientation,
        size: iconSize,
        magnification: reduceMotion ? iconSize : iconMagnification,
        distance: iconDistance,
      }}
    >
      <motion.div
        onMouseMove={(e) => pointer.set(vertical ? e.pageY : e.pageX)}
        onMouseLeave={() => pointer.set(Infinity)}
        className={cn(
          "flex w-max items-center justify-center gap-2 rounded-2xl border border-border/70 p-2 backdrop-blur-md",
          vertical ? "flex-col" : "h-[58px]",
          className,
        )}
        {...props}
      >
        {children}
      </motion.div>
    </DockContext.Provider>
  );
}

interface DockIconProps extends Omit<ComponentPropsWithoutRef<"div">, keyof MotionProps> {
  children?: ReactNode;
}

export function DockIcon({ className, children, ...props }: DockIconProps) {
  const ctx = useContext(DockContext);
  if (!ctx) throw new Error("DockIcon must be used inside Dock");
  const { pointer, orientation, size, magnification, distance } = ctx;
  const ref = useRef<HTMLDivElement>(null);
  const padding = Math.max(6, size * 0.2);

  const distanceCalc = useTransform(pointer, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect();
    if (!bounds) return Infinity;
    return orientation === "vertical"
      ? val - (bounds.top + window.scrollY) - bounds.height / 2
      : val - (bounds.left + window.scrollX) - bounds.width / 2;
  });

  const sizeTransform = useTransform(distanceCalc, [-distance, 0, distance], [size, magnification, size]);
  const scaleSize = useSpring(sizeTransform, { mass: 0.1, stiffness: 170, damping: 18 });

  return (
    <motion.div
      ref={ref}
      style={{ width: scaleSize, height: scaleSize, padding }}
      className={cn("flex aspect-square shrink-0 items-center justify-center rounded-full", className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}

export function DockSeparator({ className }: { className?: string }) {
  const ctx = useContext(DockContext);
  return (
    <div
      aria-hidden
      className={cn(ctx?.orientation === "vertical" ? "my-1 h-px w-8" : "mx-1 h-8 w-px", "bg-border", className)}
    />
  );
}
