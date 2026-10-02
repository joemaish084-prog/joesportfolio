import { useCallback, useEffect, useState } from "react";
import { formatMetricValue } from "./format";
import type { Insight, MetricUnit } from "./insights";

/**
 * "Status after the change" needs a point in time to measure from, and the
 * analytics payload has no record of when you edited a page. So the admin
 * records it: marking an insight as actioned snapshots its target metric, and
 * every later render compares the live figure against that snapshot.
 *
 * Baselines live in localStorage — they are a note-to-self about this browser,
 * not shared state. Cleared storage loses the baselines and the status falls
 * back to "not measured yet", which is the honest answer at that point.
 */
const STORAGE_KEY = "joe-admin-insight-baselines";

export interface Baseline {
  value: number;
  unit: MetricUnit;
  /** ISO timestamp of the moment the change was marked as made. */
  markedAt: string;
  /** Range the baseline was taken over, so mismatched windows can be flagged. */
  rangeDays: number;
  /** What the admin says they changed, when they bothered to type it. */
  note?: string;
}

export type BaselineMap = Record<string, Baseline>;

function read(): BaselineMap {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw) as BaselineMap;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function write(map: BaselineMap) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(map));
  } catch {
    /* private window or storage disabled — the dashboard still works without it */
  }
}

export function useBaselines() {
  const [baselines, setBaselines] = useState<BaselineMap>({});

  useEffect(() => {
    setBaselines(read());
  }, []);

  const mark = useCallback((metricId: string, baseline: Baseline) => {
    setBaselines((prev) => {
      const next = { ...prev, [metricId]: baseline };
      write(next);
      return next;
    });
  }, []);

  const clear = useCallback((metricId: string) => {
    setBaselines((prev) => {
      const next = { ...prev };
      delete next[metricId];
      write(next);
      return next;
    });
  }, []);

  return { baselines, mark, clear };
}

export type StatusKind = "untracked" | "improved" | "worsened" | "unchanged";

export interface Status {
  kind: StatusKind;
  label: string;
  /** Set when the live range and the baseline range are not comparable. */
  warning?: string;
}

/**
 * Compares the live figure against the snapshot taken when the change was
 * marked. Deliberately does not claim causation — it reports that the metric
 * moved since a dated change, which is all the data supports.
 */
export function statusFor(insight: Insight, baseline: Baseline | undefined, rangeDays: number): Status {
  const { value, unit, better, targetMetric } = insight.action;

  if (!baseline) {
    return {
      kind: "untracked",
      label: `Not measured yet. ${targetMetric} is ${formatMetricValue(value, unit)} now — mark this as actioned to set that as the baseline.`,
    };
  }

  const markedOn = new Date(baseline.markedAt).toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
  const from = formatMetricValue(baseline.value, baseline.unit);
  const to = formatMetricValue(value, unit);
  const movement = `${from} → ${to} since ${markedOn}`;

  const warning =
    baseline.rangeDays !== rangeDays
      ? `Baseline was taken over a ${baseline.rangeDays}-day range and you are viewing ${rangeDays} days — switch the range to ${baseline.rangeDays}d for a like-for-like comparison.`
      : undefined;

  if (value === baseline.value) {
    return { kind: "unchanged", label: `No movement: ${to}, unchanged since ${markedOn}.`, warning };
  }

  const rose = value > baseline.value;
  const improved = better === "higher" ? rose : !rose;

  return {
    kind: improved ? "improved" : "worsened",
    label: `${improved ? "Improved" : "Moved the wrong way"}: ${movement}.`,
    warning,
  };
}
