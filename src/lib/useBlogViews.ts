import { useEffect, useState } from "react";

const BLOG_VIEWS_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/blog-views`;

let cache: Record<string, number> | null = null;
let inFlight: Promise<Record<string, number>> | null = null;

function fetchViews(): Promise<Record<string, number>> {
  if (cache) return Promise.resolve(cache);
  if (inFlight) return inFlight;

  inFlight = fetch(BLOG_VIEWS_URL)
    .then((res) => (res.ok ? res.json() : { views: {} }))
    .then((data) => {
      cache = data.views || {};
      return cache;
    })
    .catch(() => ({}) as Record<string, number>)
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}

/** View counts for every blog post, keyed by slug. Fetched once and shared across the page. */
export function useBlogViews(): Record<string, number> {
  const [views, setViews] = useState<Record<string, number>>(cache || {});

  useEffect(() => {
    let cancelled = false;
    fetchViews().then((v) => {
      if (!cancelled) setViews(v);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return views;
}

/** Formats a view count compactly, e.g. 1234 -> "1.2K". */
export function formatViews(n: number | undefined): string {
  const count = n || 0;
  if (count < 1000) return String(count);
  return `${(count / 1000).toFixed(count < 10000 ? 1 : 0)}K`;
}
