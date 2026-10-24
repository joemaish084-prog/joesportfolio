import { differenceInCalendarDays, parseISO } from "date-fns";
import type { FitInput } from "./types";

// Prospect-fit score: how good a fit a lead is for the agency, separate from
// the spreadsheet's weakness score. Each factor is rated 0-4 by hand. A factor
// nobody has rated is unknown and left out of the score; it never counts as a
// zero. Recency is worked out from when verified factors were last checked.

export const FIT_FACTORS = [
  "contact_quality",
  "decision_maker",
  "business_fit",
  "ad_opportunity",
  "activity_signals",
  "affordability",
  "recency",
] as const;
export type FitFactor = (typeof FIT_FACTORS)[number];

export const FIT_FACTOR_LABEL: Record<FitFactor, string> = {
  contact_quality: "Contact information quality",
  decision_maker: "Verified decision-maker",
  business_fit: "Business fit",
  ad_opportunity: "Advertising opportunity",
  activity_signals: "Inventory and activity signals",
  affordability: "Can afford the service",
  recency: "How recently verified",
};

export const FIT_FACTOR_HINT: Partial<Record<FitFactor, string>> = {
  contact_quality: "0 = only a generic line; 4 = verified direct email and phone.",
  decision_maker: "0 = unknown; 4 = owner or MD named and confirmed.",
  business_fit: "Does the business match who you serve well?",
  ad_opportunity: "Evidence you've seen yourself, e.g. no ads running, weak listings. Not the spreadsheet's guess.",
  activity_signals: "Fresh stock posts, active listings, recent reviews.",
  affordability: "Size, stock level, location. Your own judgement, labelled as such.",
};

export const DEFAULT_FIT_WEIGHTS: Record<FitFactor, number> = {
  contact_quality: 15,
  decision_maker: 15,
  business_fit: 20,
  ad_opportunity: 20,
  activity_signals: 10,
  affordability: 10,
  recency: 10,
};

/** 4 within a month, 2 within three months, 1 after that; unknown if nothing's verified. */
export function recencyRating(inputs: Partial<Record<string, FitInput>>, today: Date): number | null {
  const dates = Object.values(inputs)
    .filter((i): i is FitInput => !!i && i.verified && !!i.checked_on)
    .map((i) => parseISO(i.checked_on as string));
  if (dates.length === 0) return null;
  const days = differenceInCalendarDays(today, new Date(Math.max(...dates.map((d) => d.getTime()))));
  if (days <= 30) return 4;
  if (days <= 90) return 2;
  return 1;
}

export type FitResult = {
  /** 0-100, or null when nothing has been rated. */
  score: number | null;
  known: number;
  verified: number;
  total: number;
  breakdown: { factor: FitFactor; rating: number | null; verified: boolean; weight: number }[];
};

export function computeFit(
  inputs: Partial<Record<string, FitInput>>,
  weights: Partial<Record<string, number>> = {},
  today = new Date(),
): FitResult {
  const w = (f: FitFactor) => {
    const v = weights[f];
    return typeof v === "number" && v >= 0 ? v : DEFAULT_FIT_WEIGHTS[f];
  };
  const breakdown = FIT_FACTORS.map((factor) => {
    if (factor === "recency") {
      const rating = recencyRating(inputs, today);
      return { factor, rating, verified: rating !== null, weight: w(factor) };
    }
    const input = inputs[factor];
    const rating = input && typeof input.rating === "number" ? Math.min(4, Math.max(0, input.rating)) : null;
    return { factor, rating, verified: !!input?.verified && rating !== null, weight: w(factor) };
  });

  const rated = breakdown.filter((b) => b.rating !== null && b.weight > 0);
  const weightSum = rated.reduce((s, b) => s + b.weight, 0);
  const score =
    weightSum === 0
      ? null
      : Math.round((rated.reduce((s, b) => s + b.weight * ((b.rating as number) / 4), 0) / weightSum) * 1000) / 10;
  return {
    score,
    known: rated.length,
    verified: rated.filter((b) => b.verified).length,
    total: FIT_FACTORS.length,
    breakdown,
  };
}
