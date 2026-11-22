// Adapted from Magic UI's Animated Theme Toggler (https://magicui.design/docs/components/animated-theme-toggler).
// Changes: always controlled by next-themes (which writes a `light` or `dark` class), honours
// prefers-reduced-motion, and the reveal CSS lives in src/index.css.
import { useCallback, useEffect, useRef, type ComponentPropsWithoutRef } from "react";
import { Moon, Sun } from "lucide-react";
import { flushSync } from "react-dom";

import { cn } from "@/lib/utils";

export type TransitionVariant = "circle" | "square" | "triangle" | "diamond" | "hexagon" | "rectangle" | "star";
type Theme = "light" | "dark";

interface AnimatedThemeTogglerProps extends Omit<ComponentPropsWithoutRef<"button">, "onClick"> {
  /** Current theme. */
  theme: Theme;
  /** Called with the new theme on toggle; the parent owns persistence. */
  onThemeChange: (theme: Theme) => void;
  duration?: number;
  variant?: TransitionVariant;
  /** Expand from the viewport centre instead of the button. */
  fromCenter?: boolean;
  iconClassName?: string;
}

function polygonCollapsed(point: string, vertexCount: number) {
  return `polygon(${Array.from({ length: vertexCount }, () => point).join(", ")})`;
}

// Coordinates are percentages of the snapshot box: Chrome can render px clip-paths on
// ::view-transition-new(root) unscaled on fractional display scales (e.g. Windows 150%).
function getClipPaths(variant: TransitionVariant, cx: number, cy: number, maxRadius: number, vw: number, vh: number): [string, string] {
  const point = (x: number, y: number) => `${(x / vw) * 100}% ${(y / vh) * 100}%`;
  // circle() percentage radii resolve against hypot(w, h) / sqrt(2) of the reference box.
  const toRadius = (r: number) => `${(r / (Math.hypot(vw, vh) / Math.SQRT2)) * 100}%`;
  const polygon = (pts: [number, number][]) => `polygon(${pts.map(([x, y]) => point(x, y)).join(", ")})`;
  const regular = (sides: number, R: number) =>
    polygon(Array.from({ length: sides }, (_, i) => {
      const a = -Math.PI / 2 + (i * 2 * Math.PI) / sides;
      return [cx + R * Math.cos(a), cy + R * Math.sin(a)] as [number, number];
    }));
  const halfW = Math.max(cx, vw - cx);
  const halfH = Math.max(cy, vh - cy);

  switch (variant) {
    case "square": {
      const s = Math.max(halfW, halfH) * 1.05;
      return [polygonCollapsed(point(cx, cy), 4), polygon([[cx - s, cy - s], [cx + s, cy - s], [cx + s, cy + s], [cx - s, cy + s]])];
    }
    case "rectangle":
      return [polygonCollapsed(point(cx, cy), 4), polygon([[cx - halfW, cy - halfH], [cx + halfW, cy - halfH], [cx + halfW, cy + halfH], [cx - halfW, cy + halfH]])];
    case "triangle": {
      const s = maxRadius * 2.2;
      const dx = (Math.sqrt(3) / 2) * s;
      return [polygonCollapsed(point(cx, cy), 3), polygon([[cx, cy - s], [cx + dx, cy + 0.5 * s], [cx - dx, cy + 0.5 * s]])];
    }
    case "diamond":
      return [polygonCollapsed(point(cx, cy), 4), regular(4, maxRadius * Math.SQRT2)];
    case "hexagon":
      return [polygonCollapsed(point(cx, cy), 6), regular(6, maxRadius * Math.SQRT2)];
    case "star": {
      const star = (R: number) =>
        polygon(Array.from({ length: 10 }, (_, i) => {
          const a = -Math.PI / 2 + (i * Math.PI) / 5;
          const r = i % 2 === 0 ? R : R * 0.42;
          return [cx + r * Math.cos(a), cy + r * Math.sin(a)] as [number, number];
        }));
      const R = maxRadius * Math.SQRT2 * 1.03;
      return [star(Math.max(2, R * 0.025)), star(R)];
    }
    default:
      return [`circle(0% at ${point(cx, cy)})`, `circle(${toRadius(maxRadius)} at ${point(cx, cy)})`];
  }
}

export function AnimatedThemeToggler({
  theme,
  onThemeChange,
  duration = 450,
  variant = "circle",
  fromCenter = false,
  className,
  iconClassName,
  ...props
}: AnimatedThemeTogglerProps) {
  const buttonRef = useRef<HTMLButtonElement>(null);
  const busyRef = useRef(false);
  const animRef = useRef<Animation | null>(null);
  const isDark = theme === "dark";

  useEffect(() => () => {
    animRef.current?.cancel();
    const root = document.documentElement;
    delete root.dataset.themeVt;
    root.style.removeProperty("--theme-vt-duration");
    root.style.removeProperty("--theme-vt-clip-from");
  }, []);

  const toggle = useCallback(() => {
    const button = buttonRef.current;
    const root = document.documentElement;
    if (!button || busyRef.current) return;

    const next: Theme = isDark ? "light" : "dark";
    const apply = () => {
      // Swap the class synchronously so the view transition snapshots the new theme;
      // next-themes then persists the choice and keeps its subscribers in sync.
      root.classList.remove("light", "dark");
      root.classList.add(next);
      root.style.colorScheme = next;
      onThemeChange(next);
    };

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (typeof document.startViewTransition !== "function" || reduced) {
      apply();
      return;
    }

    const vw = window.innerWidth;
    const vh = window.innerHeight;
    let x = vw / 2;
    let y = vh / 2;
    if (!fromCenter) {
      const box = button.getBoundingClientRect();
      x = box.left + box.width / 2;
      y = box.top + box.height / 2;
    }
    const maxRadius = Math.hypot(Math.max(x, vw - x), Math.max(y, vh - y));
    const clipPath = getClipPaths(variant, x, y, maxRadius, vw, vh);

    root.dataset.themeVt = "active";
    root.style.setProperty("--theme-vt-duration", `${duration}ms`);
    // Pin the collapsed shape in CSS so the new theme never flashes unclipped before the animation starts.
    root.style.setProperty("--theme-vt-clip-from", clipPath[0]);
    busyRef.current = true;

    const transition = document.startViewTransition(() => flushSync(apply));
    transition.finished
      .finally(() => {
        busyRef.current = false;
        delete root.dataset.themeVt;
        root.style.removeProperty("--theme-vt-duration");
        root.style.removeProperty("--theme-vt-clip-from");
        animRef.current?.cancel();
        animRef.current = null;
      })
      .catch(() => {});
    transition.ready
      .then(() => {
        animRef.current = root.animate(
          { clipPath },
          {
            duration,
            easing: variant === "star" ? "linear" : "ease-in-out",
            fill: "forwards",
            pseudoElement: "::view-transition-new(root)",
          },
        );
      })
      .catch(() => {});
  }, [isDark, onThemeChange, fromCenter, variant, duration]);

  return (
    <button type="button" ref={buttonRef} onClick={toggle} className={cn(className)} {...props}>
      {isDark ? <Sun className={iconClassName} aria-hidden /> : <Moon className={iconClassName} aria-hidden />}
    </button>
  );
}
