import { useRef, type ComponentPropsWithoutRef, type MouseEvent } from "react";
import { cn } from "@/lib/utils";

// React Bits Spotlight Card: a radial highlight that follows the pointer and
// fades in on hover or focus. The position goes through CSS variables instead
// of state so moving the mouse doesn't re-render the card's contents.

interface SpotlightCardProps extends ComponentPropsWithoutRef<"div"> {
  spotlightColor?: string;
}

export function SpotlightCard({
  children,
  className,
  spotlightColor = "hsl(var(--primary) / 0.12)",
  onMouseMove,
  ...props
}: SpotlightCardProps) {
  const divRef = useRef<HTMLDivElement>(null);

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    const el = divRef.current;
    if (el) {
      const rect = el.getBoundingClientRect();
      el.style.setProperty("--spot-x", `${e.clientX - rect.left}px`);
      el.style.setProperty("--spot-y", `${e.clientY - rect.top}px`);
    }
    onMouseMove?.(e);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      className={cn("group/spotlight relative overflow-hidden", className)}
      {...props}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0 opacity-0 transition-opacity duration-200 ease-in-out group-hover/spotlight:opacity-100 group-focus-within/spotlight:opacity-100 motion-reduce:hidden"
        style={{
          background: `radial-gradient(circle at var(--spot-x, 50%) var(--spot-y, 50%), ${spotlightColor}, transparent 80%)`,
        }}
      />
      <div className="relative z-[1] h-full">{children}</div>
    </div>
  );
}
