import type { CSSProperties } from "react";
import { cn } from "@/lib/utils";

// Magic UI Animated Circular Progress Bar. Same two-arc SVG and CSS-variable
// geometry; colours default to the mint primary and the neutral track, and
// the arc transition is 300ms instead of 1s.

interface AnimatedCircularProgressBarProps {
  max?: number;
  min?: number;
  value: number;
  gaugePrimaryColor?: string;
  gaugeSecondaryColor?: string;
  className?: string;
  /** Text in the middle; defaults to the percentage. */
  label?: string;
}

export function AnimatedCircularProgressBar({
  max = 100,
  min = 0,
  value = 0,
  gaugePrimaryColor = "hsl(var(--primary))",
  gaugeSecondaryColor = "hsl(var(--secondary))",
  className,
  label,
}: AnimatedCircularProgressBarProps) {
  const circumference = 2 * Math.PI * 45;
  const percentPx = circumference / 100;
  const currentPercent = Math.round(((value - min) / (max - min || 1)) * 100);

  return (
    <div
      className={cn("relative size-40 text-2xl font-semibold", className)}
      style={
        {
          "--circle-size": "100px",
          "--circumference": circumference,
          "--percent-to-px": `${percentPx}px`,
          "--gap-percent": "5",
          "--offset-factor": "0",
          "--transition-length": "300ms",
          "--transition-step": "200ms",
          "--delay": "0s",
          "--percent-to-deg": "3.6deg",
          transform: "translateZ(0)",
        } as CSSProperties
      }
      role="progressbar"
      aria-valuenow={currentPercent}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg fill="none" className="size-full" strokeWidth="2" viewBox="0 0 100 100">
        {currentPercent <= 90 && currentPercent >= 0 && (
          <circle
            cx="50"
            cy="50"
            r="45"
            strokeWidth="10"
            strokeDashoffset="0"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="opacity-100 motion-reduce:!transition-none"
            style={
              {
                stroke: gaugeSecondaryColor,
                "--stroke-percent": 90 - currentPercent,
                "--offset-factor-secondary": "calc(1 - var(--offset-factor))",
                strokeDasharray: "calc(var(--stroke-percent) * var(--percent-to-px)) var(--circumference)",
                transform:
                  "rotate(calc(1turn - 90deg - (var(--gap-percent) * var(--percent-to-deg) * var(--offset-factor-secondary)))) scaleY(-1)",
                transition: "all var(--transition-length) ease var(--delay)",
                transformOrigin: "calc(var(--circle-size) / 2) calc(var(--circle-size) / 2)",
              } as CSSProperties
            }
          />
        )}
        <circle
          cx="50"
          cy="50"
          r="45"
          strokeWidth="10"
          strokeDashoffset="0"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={cn("opacity-100 motion-reduce:!transition-none", currentPercent <= 0 && "opacity-0")}
          style={
            {
              stroke: gaugePrimaryColor,
              "--stroke-percent": currentPercent,
              strokeDasharray: "calc(var(--stroke-percent) * var(--percent-to-px)) var(--circumference)",
              transition:
                "var(--transition-length) ease var(--delay),stroke var(--transition-length) ease var(--delay)",
              transitionProperty: "stroke-dasharray,transform",
              transform: "rotate(calc(-90deg + var(--gap-percent) * var(--offset-factor) * var(--percent-to-deg)))",
              transformOrigin: "calc(var(--circle-size) / 2) calc(var(--circle-size) / 2)",
            } as CSSProperties
          }
        />
      </svg>
      <span
        data-current-value={currentPercent}
        className="absolute inset-0 m-auto size-fit animate-in fade-in delay-[var(--delay)] duration-[var(--transition-length)] ease-linear"
      >
        {label ?? currentPercent}
      </span>
    </div>
  );
}
