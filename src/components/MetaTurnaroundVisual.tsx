import { useEffect, useRef, useState, type CSSProperties } from "react";
import { ArrowDown, ArrowRight, TrendingDown, TrendingUp } from "lucide-react";
import {
  formatKes,
  metaTurnaround,
  type MetaTurnaroundVisualKind,
  type TurnaroundFormat,
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

const card =
  "rounded-2xl border border-[color:var(--cs-border)] bg-[var(--cs-card)] transition-shadow duration-300 hover:shadow-[0_8px_30px_rgba(0,0,0,0.08)]";
const text = "text-[color:var(--cs-text)]";
const muted = "text-[color:var(--cs-muted)]";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/** True once the element has scrolled into view. Immediately true when motion is reduced. */
function useInView<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || prefersReducedMotion() || typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return { ref, inView };
}

const FORMATTERS: Record<TurnaroundFormat, (n: number) => string> = {
  kes: (n) => formatKes(Math.round(n)),
  kesM: (n) => `KES ${(n / 1_000_000).toFixed(2)}M`,
  x: (n) => `${n.toFixed(1)}x`,
  int: (n) => Math.round(n).toLocaleString("en-US"),
};

function CountUp({ value, format, active }: { value: number; format: TurnaroundFormat; active: boolean }) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    if (!active) return;
    if (prefersReducedMotion()) {
      setShown(value);
      return;
    }
    const duration = 1400;
    const start = performance.now();
    let frame = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      setShown(value * (1 - Math.pow(1 - t, 3)));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [active, value]);

  return (
    <>
      <span aria-hidden="true">{FORMATTERS[format](shown)}</span>
      <span className="sr-only">{FORMATTERS[format](value)}</span>
    </>
  );
}

/** Results banner. Always dark, so it reads as the headline on both page styles. */
function Hero() {
  const { ref, inView } = useInView<HTMLDivElement>();
  const { before, after, stats, period, attributionNote } = metaTurnaround;
  return (
    <div
      ref={ref}
      className="relative overflow-hidden rounded-3xl border border-white/10 p-6 text-white sm:p-10"
      style={{
        background:
          "radial-gradient(120% 90% at 100% 0%, rgba(249,115,22,0.35) 0%, rgba(249,115,22,0) 55%), #0F1115",
      }}
    >
      <p className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/80">
        Meta Ads · {period}
      </p>

      <div className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:gap-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-white/50">Before</p>
          <p className="mt-2 text-xl font-bold tracking-tight text-white/70 sm:text-2xl">{before.value}</p>
          <p className="mt-1 max-w-[14rem] text-sm leading-snug text-white/50">{before.label}</p>
        </div>

        <ArrowDown className="h-6 w-6 text-[#F97316] sm:hidden" aria-hidden="true" />
        <ArrowRight className="mb-9 hidden h-7 w-7 flex-shrink-0 text-[#F97316] sm:block" aria-hidden="true" />

        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-[#FDBA74]">After</p>
          <p className="mt-2 text-4xl font-bold leading-none tracking-tight tabular-nums sm:text-6xl">
            <CountUp value={after.value} format={after.format} active={inView} />
          </p>
          <p className="mt-2 max-w-xs text-sm leading-snug text-white/60">{after.label}</p>
        </div>
      </div>

      <dl className="mt-9 grid grid-cols-1 gap-5 border-t border-white/10 pt-7 sm:grid-cols-3 sm:gap-6">
        {stats.map((s) => (
          <div key={s.label} className="flex flex-col-reverse">
            <dt className="mt-1.5 text-sm font-medium text-white/85">
              {s.label}
              {s.note && <span className="mt-0.5 block text-xs font-normal text-white/50">{s.note}</span>}
            </dt>
            <dd className="text-2xl font-bold tracking-tight tabular-nums text-[#FDBA74] sm:text-3xl">
              <CountUp value={s.value} format={s.format} active={inView} />
            </dd>
          </div>
        ))}
      </dl>

      <p className="mt-7 text-xs leading-relaxed text-white/45">{attributionNote}</p>
    </div>
  );
}

function Process() {
  const { ref, inView } = useInView<HTMLOListElement>();
  return (
    <ol ref={ref} className="grid gap-4 sm:grid-cols-2">
      {metaTurnaround.steps.map((step, i) => (
        <li
          key={step.title}
          className={`${card} p-5 transition-all duration-500 ease-out motion-reduce:transition-none ${
            inView ? "translate-y-0 opacity-100" : "translate-y-3 opacity-0"
          }`}
          style={{ transitionDelay: `${i * 110}ms` }}
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[var(--cs-accent)] text-sm font-bold text-white">
            {i + 1}
          </span>
          <p className={`mt-4 text-base font-semibold leading-snug ${text}`}>{step.title}</p>
          <p className={`mt-2 text-sm leading-relaxed ${muted}`}>{step.body}</p>
        </li>
      ))}
    </ol>
  );
}

function Monthly() {
  const { ref, inView } = useInView<HTMLElement>();
  const max = Math.max(...metaTurnaround.months.map((m) => m.revenue));
  return (
    <figure ref={ref} className={`${card} p-5 sm:p-7`}>
      <figcaption className={`text-sm font-semibold ${text}`}>
        Monthly revenue and return on ad spend
      </figcaption>

      <div className="relative mt-8 h-40 sm:h-48">
        {[0, 1, 2, 3].map((line) => (
          <span
            key={line}
            aria-hidden="true"
            className="absolute inset-x-0 border-t border-dashed border-[color:var(--cs-border)]"
            style={{ top: `${line * 25}%` }}
          />
        ))}
        <div className="absolute inset-0 grid grid-cols-3 items-end gap-4 border-b border-[color:var(--cs-border)] px-2 sm:gap-10 sm:px-8">
          {metaTurnaround.months.map((m, i) => (
            <div
              key={m.label}
              className={`relative w-full rounded-t-xl transition-[height] duration-1000 ease-out motion-reduce:transition-none ${
                m.partial ? "border-2 border-b-0 border-dashed border-[color:var(--cs-accent)]" : ""
              }`}
              style={{
                height: inView ? `${Math.round((m.revenue / max) * 100)}%` : "0%",
                transitionDelay: `${i * 150}ms`,
                background: m.partial
                  ? undefined
                  : "linear-gradient(180deg, var(--cs-accent) 0%, #FDBA74 140%)",
              }}
            >
              <span
                className={`absolute -top-6 left-0 right-0 text-center text-xs font-semibold tabular-nums sm:text-sm ${text}`}
              >
                {(m.revenue / 1_000_000).toFixed(2)}M
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-4 px-2 sm:gap-10 sm:px-8">
        {metaTurnaround.months.map((m) => (
          <div key={m.label} className="text-center">
            <p className={`text-sm font-semibold ${text}`}>{m.label}</p>
            <p className="mt-1 text-sm font-bold tabular-nums text-[color:var(--cs-good)]">
              {m.roas.toFixed(1)}x
            </p>
            <p className={`mt-0.5 text-xs tabular-nums ${muted}`}>{m.purchases} purchases</p>
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
  const { ref, inView } = useInView<HTMLElement>();
  const max = Math.max(...metaTurnaround.campaigns.map((c) => c.roas));
  return (
    <figure ref={ref} className={`${card} p-5 sm:p-7`}>
      <figcaption className={`text-sm font-semibold ${text}`}>
        Sales campaigns by type, ranked by return on ad spend
      </figcaption>
      <ol className="mt-5 divide-y divide-[color:var(--cs-border)]">
        {metaTurnaround.campaigns.map((c, i) => {
          const weak = c.roas < 30;
          return (
            <li key={c.label} className="flex gap-4 py-4 first:pt-0 last:pb-0">
              <span
                aria-hidden="true"
                className={`mt-0.5 w-5 flex-shrink-0 text-sm font-bold tabular-nums ${muted}`}
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="min-w-0 flex-1">
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
                <div className="mt-2.5 h-2.5 w-full overflow-hidden rounded-full bg-[var(--cs-track)]">
                  <div
                    className={`h-full rounded-full transition-[width] duration-1000 ease-out motion-reduce:transition-none ${
                      weak ? "bg-[var(--cs-warn)]" : "bg-[var(--cs-accent)]"
                    }`}
                    style={{
                      width: inView ? `${Math.round((c.roas / max) * 100)}%` : "0%",
                      transitionDelay: `${i * 70}ms`,
                    }}
                  />
                </div>
                <p className={`mt-2 text-xs leading-relaxed tabular-nums ${muted}`}>
                  {formatKes(c.spend)} spent · {formatKes(c.revenue)} revenue · {c.purchases}{" "}
                  purchases · {formatKes(c.costPerPurchase)} per purchase
                </p>
              </div>
            </li>
          );
        })}
      </ol>
      <p className={`mt-5 text-xs leading-relaxed ${muted}`}>
        Campaign names are replaced with generic descriptions. Amber marks a return under 30x.
      </p>
    </figure>
  );
}

function Comparison() {
  const { best, weakest } = metaTurnaround;
  const sides = [
    { ...best, good: true },
    { ...weakest, good: false },
  ];
  const multiple = Math.round(best.roas / weakest.roas);
  const spendShare = Math.round((best.spend / weakest.spend) * 100);
  return (
    <div>
      <div className="grid gap-4 sm:grid-cols-2">
        {sides.map((s) => {
          const Icon = s.good ? TrendingUp : TrendingDown;
          const tone = s.good ? "text-[color:var(--cs-good)]" : "text-[color:var(--cs-warn)]";
          return (
            <div
              key={s.label}
              className={`${card} border-t-4 p-5 sm:p-6 ${
                s.good ? "border-t-[color:var(--cs-good)]" : "border-t-[color:var(--cs-warn)]"
              }`}
            >
              <p className={`inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider ${tone}`}>
                <Icon className="h-4 w-4" aria-hidden="true" />
                {s.label}
              </p>
              <p className={`mt-3 text-base font-semibold ${text}`}>{s.name}</p>
              <p className={`mt-1 text-4xl font-bold tracking-tight tabular-nums ${tone}`}>
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
      <p className={`mt-4 text-sm leading-relaxed ${muted}`}>
        <strong className={text}>{multiple}x the return</strong> on about {spendShare}% of the spend.
      </p>
    </div>
  );
}

const VISUALS: Record<MetaTurnaroundVisualKind, () => JSX.Element> = {
  hero: Hero,
  process: Process,
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
