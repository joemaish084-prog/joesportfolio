import { useSyncExternalStore } from "react";

/**
 * Two price lists, not one price in two currencies. Kenyan visitors see the KES
 * fees; everyone else sees hand-set USD fees that are not a live conversion.
 * Prerendered HTML and structured data stay in KES, so the default is "KE" and
 * the real market is only read on the client.
 */
export type Market = "KE" | "INTL";

const STORAGE_KEY = "pricing-market";
const CHANGE_EVENT = "pricing-market-change";

/** KES fee -> USD fee. Edit here to change every international price on the site. */
const USD_FOR_KES: Record<number, number> = {
  40_000: 900,
  45_000: 1_200,
  50_000: 1_200,
  60_000: 1_500,
  70_000: 1_800,
  120_000: 3_000,
};

/** Fallback for a fee not listed above: roughly 3x the shilling value, rounded to $50. */
const KES_PER_USD = 129;
function usdForKes(kes: number): number {
  return USD_FOR_KES[kes] ?? Math.round((kes * 3) / KES_PER_USD / 50) * 50;
}

export const formatUsd = (n: number) => `$${n.toLocaleString("en-US")}`;

/**
 * Rewrites the KES/KSh fees in a price string to USD, e.g.
 * "From KES 40,000/month" -> "From $900/month". Use for fees only; ad-spend
 * thresholds are not fees and have their own international wording.
 */
export function localizePrice(text: string, market: Market): string {
  if (market === "KE") return text;
  return text.replace(/\b(?:KES|KSh)\s?([\d,]+)/gi, (_, amount: string) =>
    formatUsd(usdForKes(Number(amount.replace(/,/g, "")))),
  );
}

/** Picks the Kenyan or international wording for text that is not a plain fee. */
export const pick = <T,>(market: Market, ke: T, intl: T): T => (market === "KE" ? ke : intl);

function detectMarket(): Market {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    if (stored === "KE" || stored === "INTL") return stored;
  } catch {
    // Storage can be blocked (private windows, in-app browsers); fall through to detection.
  }
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    // A device with no timezone gets the Kenyan list rather than guessing.
    if (tz && tz !== "Africa/Nairobi") return "INTL";
  } catch {
    // Intl can be missing in very old WebViews.
  }
  return "KE";
}

let cached: Market | null = null;

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

function getSnapshot(): Market {
  cached ??= detectMarket();
  return cached;
}

export function setMarket(next: Market) {
  cached = next;
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // Choice still applies for this visit without storage.
  }
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

export function useMarket(): Market {
  return useSyncExternalStore(subscribe, getSnapshot, () => "KE");
}
