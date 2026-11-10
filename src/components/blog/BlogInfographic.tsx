import { Check, Minus, X } from "lucide-react";
import { useInView } from "@/components/MetaTurnaroundVisual";
import type { BlogInfographic as Graphic } from "@/data/blogPosts";

const TONE_ICON = { good: Check, bad: X, neutral: Minus } as const;
const TONE_STYLE = {
  good: "text-[hsl(var(--chart-good))]",
  bad: "text-destructive",
  neutral: "text-muted-foreground",
} as const;

/**
 * Themed infographics drawn in HTML and CSS. The numbers and labels are real
 * text, so crawlers and screen readers get them; only the bar widths animate,
 * and not at all when the visitor prefers reduced motion.
 */
export function BlogInfographic({ graphic, className = "" }: { graphic: Graphic; className?: string }) {
  const { ref, inView } = useInView<HTMLElement>();
  const illustrative = "illustrative" in graphic && graphic.illustrative;

  return (
    <figure
      ref={ref}
      className={`rounded-2xl border border-border bg-card p-5 sm:p-7 ${className}`}
    >
      <figcaption className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="text-base font-semibold text-foreground sm:text-lg">{graphic.title}</span>
        {illustrative && (
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
            Illustrative figures
          </span>
        )}
      </figcaption>

      {graphic.kind === "steps" && (
        <ol className="mt-6 grid gap-5 sm:grid-cols-[repeat(auto-fit,minmax(11rem,1fr))]">
          {graphic.items.map((item, i) => (
            <li key={item.label} className="relative flex gap-4 sm:block">
              <span
                aria-hidden="true"
                className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-white"
              >
                {i + 1}
              </span>
              <div className="sm:mt-3">
                <p className="font-semibold leading-snug text-foreground">{item.label}</p>
                {item.detail && <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{item.detail}</p>}
              </div>
            </li>
          ))}
        </ol>
      )}

      {graphic.kind === "bars" && (
        <ol className="mt-6 space-y-4">
          {(() => {
            const max = Math.max(...graphic.items.map((item) => item.value));
            return graphic.items.map((item, i) => (
              <li key={item.label}>
                <div className="flex items-baseline justify-between gap-4">
                  <p className="text-sm font-semibold text-foreground">{item.label}</p>
                  <p
                    className={`flex-shrink-0 text-sm font-bold tabular-nums ${item.highlight ? "text-primary" : "text-foreground"}`}
                  >
                    {item.display}
                  </p>
                </div>
                <div aria-hidden="true" className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-foreground/10">
                  <div
                    className={`h-full rounded-full transition-[width] duration-1000 ease-out motion-reduce:transition-none ${item.highlight ? "bg-primary" : "bg-foreground/45"}`}
                    style={{
                      width: inView ? `${Math.max(2, Math.round((item.value / max) * 100))}%` : "0%",
                      transitionDelay: `${i * 60}ms`,
                    }}
                  />
                </div>
                {item.note && <p className="mt-1.5 text-xs text-muted-foreground">{item.note}</p>}
              </li>
            ));
          })()}
        </ol>
      )}

      {graphic.kind === "funnel" && (
        <ol className="mt-6 space-y-2.5">
          {(() => {
            const max = Math.max(...graphic.stages.map((stage) => stage.value));
            return graphic.stages.map((stage, i) => {
              const previous = graphic.stages[i - 1];
              const share = previous && previous.value > 0 ? Math.round((stage.value / previous.value) * 100) : null;
              return (
                <li key={stage.label} className="flex flex-col items-center">
                  {share !== null && (
                    <p className="mb-1.5 text-xs text-muted-foreground">{share}% of the step above</p>
                  )}
                  <div
                    className={`flex w-full items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm transition-[width] duration-1000 ease-out motion-reduce:transition-none ${i === graphic.stages.length - 1 ? "bg-primary text-white" : "bg-foreground/10 text-foreground"}`}
                    style={{ width: inView ? `${Math.max(34, Math.round((stage.value / max) * 100))}%` : "34%" }}
                  >
                    <span className="font-semibold leading-snug">{stage.label}</span>
                    <span className="flex-shrink-0 font-bold tabular-nums">{stage.display}</span>
                  </div>
                </li>
              );
            });
          })()}
        </ol>
      )}

      {graphic.kind === "compare" && (
        <div className="mt-6 grid gap-4 sm:grid-cols-[repeat(auto-fit,minmax(14rem,1fr))]">
          {graphic.columns.map((column) => {
            const tone = column.tone ?? "neutral";
            const Icon = TONE_ICON[tone];
            return (
              <div key={column.heading} className="rounded-xl border border-border bg-background/60 p-4">
                <p className="font-semibold text-foreground">{column.heading}</p>
                <ul className="mt-3 space-y-2.5">
                  {column.points.map((point) => (
                    <li key={point} className="flex gap-2.5 text-sm leading-relaxed text-foreground/80">
                      <Icon className={`mt-0.5 h-4 w-4 flex-shrink-0 ${TONE_STYLE[tone]}`} aria-hidden="true" />
                      <span>{point}</span>
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      {graphic.kind === "stats" && (
        <dl className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-[repeat(auto-fit,minmax(10.5rem,1fr))]">
          {graphic.items.map((item) => (
            <div key={item.label} className="rounded-xl border border-border bg-background/60 p-4">
              <dd className="font-display whitespace-nowrap text-xl font-bold tabular-nums text-primary sm:text-2xl">{item.value}</dd>
              <dt className="mt-1 text-sm leading-snug text-muted-foreground">{item.label}</dt>
            </div>
          ))}
        </dl>
      )}

      {graphic.note && <p className="mt-5 text-xs leading-relaxed text-muted-foreground">{graphic.note}</p>}
    </figure>
  );
}
