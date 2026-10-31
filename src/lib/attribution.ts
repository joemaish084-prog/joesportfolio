const STORAGE_KEY = "lead-attribution-v1";

export interface Attribution {
  source: string;
  medium?: string;
  campaign?: string;
  /** Path of the first page seen this visit. Never includes the query string. */
  landing: string;
}

const clean = (value: string | null) => value?.trim().slice(0, 80) || undefined;

function referrerHost(referrer: string, ownHost: string): string | undefined {
  try {
    const host = new URL(referrer).hostname.replace(/^www\./, "");
    return host && host !== ownHost.replace(/^www\./, "") ? host : undefined;
  } catch {
    return undefined;
  }
}

export function readAttribution(search: string, referrer: string, pathname: string, ownHost: string): Attribution {
  const params = new URLSearchParams(search);
  const gclid = params.has("gclid");
  return {
    source: clean(params.get("utm_source")) ?? clean(params.get("source")) ?? (gclid ? "google" : referrerHost(referrer, ownHost)) ?? "direct",
    medium: clean(params.get("utm_medium")) ?? (gclid ? "cpc" : undefined),
    campaign: clean(params.get("utm_campaign")),
    landing: pathname,
  };
}

/** Short enough to group by in the /admin "leads by source" chart. */
export const leadSource = ({ source, medium, campaign }: Attribution) =>
  [source, medium, campaign].filter(Boolean).join(" / ");

let current: Attribution | null = null;

/**
 * Remembers where this visit came from, because the query string is gone once
 * the visitor moves to another page. Tagged links replace an earlier untagged visit.
 */
export function captureAttribution() {
  const next = readAttribution(window.location.search, document.referrer, window.location.pathname, window.location.hostname);
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    const previous: Attribution | null = stored ? JSON.parse(stored) : null;
    current = previous && !window.location.search.match(/[?&](utm_source|source|gclid)=/) ? previous : next;
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(current));
  } catch {
    current = current ?? next;
  }
}

export function getAttribution(): Attribution {
  if (!current) captureAttribution();
  return current as Attribution;
}
