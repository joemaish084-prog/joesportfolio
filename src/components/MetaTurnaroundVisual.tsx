import type { CSSProperties } from "react";
import { TrendingDown, TrendingUp } from "lucide-react";
import {
  formatKes,
  metaTurnaround,
  type MetaTurnaroundVisualKind,
} from "@/data/metaTurnaroundCaseStudy";

type Tone = "light" | "dark";

// "light" matches the white blog pages, "dark" the portfolio case-study section.
const TONES: Record<Tone, CSSProperties> = {
  light: {
    "--cs-card": "#FAFAFA",
    "--cs-border": "#EAEAEA",
    "--cs-text": "#111111",
    "--cs-muted": "#666666",
    "--cs-track": "#EDEDED",
    "--cs-accent": "#F97316",
    "--cs-good": "#15803D",
    "--cs-warn": "#B45309",
  } as CSSProperties,
  dark: {
    "--cs-card": "hsl(var(--case-study-card))",
    "--cs-border": "hsl(var(--case-study-card-border))",
    "--cs-text": "hsl(var(--case-study-text))",
    "--cs-muted": "hsl(var(--case-study-muted))",
    "--cs-track": "hsl(var(--case-study-text) / 0.1)",
    "--cs-accent": "hsl(var(--primary))",
    "--cs-good": "#4ADE80",
    "--cs-warn": "#FBBF24",
  } as CSSProperties,
};

const card = "rounded-2xl border border-[color:var(--cs-border)] bg-[var(--cs-card)]";
const text = "text-[color:var(--cs-text)]";
const muted = "text-[color:var(--cs-muted)]";

function Stats() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
      {metaTurnaround.stats.map((s) => (
        <div key={s.label} className={`${card} p-4 sm:p-5`}>
          <p className="text-xl font-bold tracking-tight text-[color:var(--cs-accent)] sm:text-2xl">
            {s.value}
          </p>
          <p className={`mt-1.5 text-sm font-medium leading-snug ${text}`}>{s.label}</p>
          {s.note && <p className={`mt-1 text-xs leading-snug ${muted}`}>{s.note}</p>}
        </div>
      ))}
    </div>
  );
}

function Monthly() {
  const max = Math.max(...metaTurnaround.months.map((m) => m.revenue));
  return (
    <figure className={`${card} p-5 sm:p-7`}>
      <figcaption className={`text-sm font-semibold ${text}`}>
        Monthly revenue and return on ad spend
      </figcaption>
      <div className="mt-6 grid grid-cols-3 gap-3 sm:gap-6">
        {metaTurnaround.months.map((m) => (
          <div key={m.label} className="flex flex-col items-center">
            <p className={`text-xs font-semibold tabular-nums sm:text-sm ${text}`}>
              {(m.revenue / 1_000_000).toFixed(2)}M
            </p>
            <div className="mt-2 flex h-36 w-full items-end sm:h-44">
              <div
                className={`w-full rounded-t-lg ${
                  m.partial
                    ? "border-2 border-b-0 border-dashed border-[color:var(--cs-accent)]"
                    : "bg-[var(--cs-accent)]"
                }`}
                style={{ height: `${Math.round((m.revenue / max) * 100)}%` }}
              />
            </div>
            <p className={`mt-3 text-sm font-semibold ${text}`}>{m.label}</p>
            <p className="mt-1 text-sm font-bold tabular-nums text-[color:var(--cs-good)]">
              {m.roas.toFixed(1)}x
            </p>
            <p className={`mt-0.5 text-center text-xs tabular-nums ${muted}`}>
              {m.purchases} purchases
            </p>
          </div>
        ))}
      </div>
      <p className={`mt-6 text-xs leading-relaxed ${muted}`}>
        Revenue in KES, from the monthly report. October covers eight days only, so its bar is
        dashed. July is in the campaign log but not the monthly report.
      </p>
    </figure>
  );
}

function Campaigns() {
  const max = Math.max(...metaTurnaround.campaigns.map((c) => c.roas));
  return (
    <figure className={`${card} p-5 sm:p-7`}>
      <figcaption className={`text-sm font-semibold ${text}`}>
        Sales campaigns by type, ranked by return on ad spend
      </figcaption>
      <ul className="mt-5 divide-y divide-[color:var(--cs-border)]">
        {metaTurnaround.campaigns.map((c) => {
          const weak = c.roas < 30;
          return (
            <li key={c.label} className="py-4 first:pt-0 last:pb-0">
              <div className="flex items-baseline justify-between gap-4">
                <p className={`text-sm font-semibold sm:text-base ${text}`}>
                  {c.label}
                  <span className={`ml-2 text-xs font-normal ${muted}`}>{c.detail}</span>
                </p>
                <p
                  className={`flex-shrink-0 text-base font-bold tabular-nums ${
                    weak ? "text-[color:var(--cs-warn)]" : "text-[color:var(--cs-good)]"
                  }`}
                >
                  {c.roas.toFixed(1)}x
                </p>
              </div>
              <div className="mt-2.5 h-2 w-full overflow-hidden rounded-full bg-[var(--cs-track)]">
                <div
                  className={`h-full rounded-full ${
                    weak ? "bg-[var(--cs-warn)]" : "bg-[var(--cs-accent)]"
                  }`}
                  style={{ width: `${Math.round((c.roas / max) * 100)}%` }}
                />
              </div>
              <p className={`mt-2 text-xs leading-relaxed tabular-nums ${muted}`}>
                {formatKes(c.spend)} spent · {formatKes(c.revenue)} revenue · {c.purchases}{" "}
                purchases · {formatKes(c.costPerPurchase)} per purchase
              </p>
            </li>
          );
        })}
      </ul>
      <p className={`mt-5 text-xs leading-relaxed ${muted}`}>
        Campaign names are replaced with generic descriptions. Amber marks a return under 30x.
      </p>
    </figure>
  );
}

function Comparison() {
  const sides = [
    { ...metaTurnaround.best, good: true },
    { ...metaTurnaround.weakest, good: false },
  ];
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {sides.map((s) => {
        const Icon = s.good ? TrendingUp : TrendingDown;
        const tone = s.good ? "text-[color:var(--cs-good)]" : "text-[color:var(--cs-warn)]";
        return (
          <div key={s.label} className={`${card} p-5 sm:p-6`}>
            <p className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${tone}`}>
              <Icon className="h-4 w-4" aria-hidden="true" />
              {s.label}
            </p>
            <p className={`mt-3 text-base font-semibold ${text}`}>{s.name}</p>
            <p className={`mt-1 text-3xl font-bold tracking-tight tabular-nums ${tone}`}>
              {s.roas.toFixed(1)}x
            </p>
            <dl className={`mt-4 space-y-1.5 text-sm tabular-nums ${muted}`}>
              <div className="flex justify-between gap-4">
                <dt>Spend</dt>
                <dd className={`font-medium ${text}`}>{formatKes(s.spend)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Revenue</dt>
                <dd className={`font-medium ${text}`}>{formatKes(s.revenue)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt>Cost per purchase</dt>
                <dd className={`font-medium ${text}`}>{formatKes(s.costPerPurchase)}</dd>
              </div>
            </dl>
          </div>
        );
      })}
    </div>
  );
}

const VISUALS: Record<MetaTurnaroundVisualKind, () => JSX.Element> = {
  stats: Stats,
  monthly: Monthly,
  campaigns: Campaigns,
  comparison: Comparison,
};

export function MetaTurnaroundVisual({
  kind,
  tone = "light",
  className = "",
}: {
  kind: MetaTurnaroundVisualKind;
  tone?: Tone;
  className?: string;
}) {
  const Visual = VISUALS[kind];
  return (
    <div className={className} style={TONES[tone]}>
      <Visual />
    </div>
  );
}
