/** Shared formatting, colour tokens and CSV helpers for the admin dashboard. */

export const ACCENT = "hsl(25 100% 50%)";
export const ACCENT_SOFT = "hsl(33 100% 58%)";
export const NEUTRAL = "hsl(0 0% 55%)";
export const NEUTRAL_DIM = "hsl(0 0% 38%)";

/** Donut / categorical series colours — accent first, then neutrals. */
export const SERIES_COLORS = [
  "hsl(25 100% 50%)",
  "hsl(0 0% 62%)",
  "hsl(33 100% 66%)",
  "hsl(0 0% 40%)",
  "hsl(25 55% 58%)",
  "hsl(0 0% 78%)",
  "hsl(15 70% 52%)",
  "hsl(0 0% 28%)",
];

export const TOOLTIP_STYLE = {
  fontSize: 12,
  borderRadius: 10,
  border: "1px solid hsl(var(--border))",
  background: "hsl(var(--popover))",
  color: "hsl(var(--popover-foreground))",
  boxShadow: "0 8px 24px hsl(0 0% 0% / 0.12)",
} as const;

export const AXIS_TICK = { fontSize: 11, fill: "hsl(var(--muted-foreground))" } as const;

export const DOW_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const RANGE_OPTIONS = [
  { days: 1, label: "24h" },
  { days: 7, label: "7d" },
  { days: 14, label: "14d" },
  { days: 30, label: "30d" },
  { days: 90, label: "90d" },
];

/** 1_234 -> "1.2k". Keeps KPI tiles narrow without losing the magnitude. */
export function compactNumber(n: number): string {
  if (Math.abs(n) < 1000) return Number.isInteger(n) ? String(n) : n.toFixed(2);
  if (Math.abs(n) < 1_000_000) return `${(n / 1000).toFixed(n < 10_000 ? 1 : 0)}k`;
  return `${(n / 1_000_000).toFixed(1)}m`;
}

export function formatDuration(ms: number): string {
  if (!ms || ms < 0) return "—";
  const seconds = Math.round(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ${seconds % 60}s`;
  const hours = Math.floor(minutes / 60);
  return `${hours}h ${minutes % 60}m`;
}

export function formatDateTime(iso: string): string {
  const d = new Date(iso);
  return `${d.toLocaleDateString(undefined, { month: "short", day: "numeric" })} ${d.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

/** "Sep 24" — for chart axes, where the year is noise. */
export function formatDayLabel(day: string): string {
  const d = new Date(`${day}T00:00:00`);
  if (Number.isNaN(d.getTime())) return day;
  return d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.round(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.round(hours / 24)}d ago`;
}

export function truncate(value: string | null | undefined, max = 34): string {
  if (!value) return "—";
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

/** Strips protocol and www so referrer lists stay readable. */
export function hostOf(referrer: string): string {
  try {
    return new URL(referrer).hostname.replace(/^www\./, "");
  } catch {
    return referrer;
  }
}

export function computeDelta(
  current: number,
  prev: number,
): { pct: number | null; direction: "up" | "down" | "flat" } {
  if (prev === 0) return { pct: current > 0 ? null : 0, direction: current > 0 ? "up" : "flat" };
  const pct = Math.round(((current - prev) / prev) * 100);
  return { pct, direction: pct > 0 ? "up" : pct < 0 ? "down" : "flat" };
}

export function downloadCsv(filename: string, rows: (string | number | null)[][]) {
  const csv = rows
    .map((row) => row.map((cell) => `"${String(cell ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export const today = () => new Date().toISOString().slice(0, 10);

/* -------------------------------------------------------------------------- */
/*  Table density                                                             */
/* -------------------------------------------------------------------------- */

export type Density = "compact" | "cosy";

/** Row padding and font size for tables, driven by the density preference. */
export function densityClasses(density: Density) {
  return density === "compact"
    ? { cell: "py-1.5", text: "text-[13px]" }
    : { cell: "py-2.5", text: "text-sm" };
}
