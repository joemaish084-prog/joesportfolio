import type { CSSProperties, FC, ReactNode } from "react";
import type { Brand } from "@/data/brands";

/**
 * The brand page sets --brand-display / --brand-body (see WorkBrand), so these styles
 * pick up whichever brand is being shown.
 */
export const displayFont: CSSProperties = {
  fontFamily: "var(--brand-display)",
  fontWeight: "var(--brand-display-weight)",
  letterSpacing: "var(--brand-display-tracking)",
};

export const bodyFont: CSSProperties = { fontFamily: "var(--brand-body)" };

/** A solid colour, or a CSS gradient clipped to the text. */
export function paintText(paint: string): CSSProperties {
  return paint.includes("gradient(")
    ? { backgroundImage: paint, WebkitBackgroundClip: "text", backgroundClip: "text", color: "transparent" }
    : { color: paint };
}

export interface Rule {
  ok: boolean;
  caption: string;
  art: ReactNode;
}

/** The parts of a brand book that are drawn differently for each brand. */
export interface BrandKit {
  /** Band between the cover and the brief, and above the closing call to action. */
  Divider: FC<{ brand: Brand; className?: string }>;
  Elements: FC<{ brand: Brand }>;
  Mockups: FC<{ brand: Brand }>;
  rules: (brand: Brand) => Rule[];
}
