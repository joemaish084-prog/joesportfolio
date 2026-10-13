import { ArrowDown, ArrowRight } from "lucide-react";
import { ScrollReveal } from "@/components/ScrollReveal";
import { useInView } from "@/components/MetaTurnaroundVisual";
import type { InsightCaseStudy } from "@/data/insightCaseStudies";

const cardStyle = {
  background: "hsl(var(--case-study-card))",
  borderColor: "hsl(var(--case-study-card-border))",
};
const textColor = { color: "hsl(var(--case-study-text))" };
const mutedColor = { color: "hsl(var(--case-study-muted))" };

function Bars({ data }: { data: InsightCaseStudy }) {
  const { ref, inView } = useInView<HTMLElement>();
  const max = Math.max(...data.bars.map((b) => b.value));
  return (
    <figure ref={ref} className="h-full rounded-2xl border p-5 sm:p-7" style={cardStyle}>
      <figcaption className="text-sm font-semibold" style={textColor}>
        {data.barsTitle}
      </figcaption>
      <ol className="mt-5 space-y-4">
        {data.bars.map((bar, i) => (
          <li key={bar.label}>
            <div className="flex items-baseline justify-between gap-4">
              <p className="text-sm font-semibold" style={textColor}>
                {bar.label}
                {bar.detail && (
                  <span className="ml-2 text-xs font-normal" style={mutedColor}>
                    {bar.detail}
                  </span>
                )}
              </p>
              <p
                className={`flex-shrink-0 text-sm font-bold tabular-nums ${bar.highlight ? "text-primary" : ""}`}
                style={bar.highlight ? undefined : textColor}
              >
                {bar.display}
              </p>
            </div>
            <div
              className="mt-2 h-2.5 w-full overflow-hidden rounded-full"
              style={{ background: "hsl(var(--case-study-text) / 0.1)" }}
            >
              <div
                className="h-full rounded-full transition-[width] duration-1000 ease-out motion-reduce:transition-none"
                style={{
                  // a floor keeps the smallest bars visible next to a very large one
                  width: inView ? `${Math.max(2, Math.round((bar.value / max) * 100))}%` : "0%",
                  transitionDelay: `${i * 60}ms`,
                  background: bar.highlight ? "hsl(var(--primary))" : "hsl(var(--case-study-text) / 0.45)",
                }}
              />
            </div>
            {bar.sub && (
              <p className="mt-1.5 text-xs tabular-nums" style={mutedColor}>
                {bar.sub}
              </p>
            )}
          </li>
        ))}
      </ol>
      <p className="mt-5 text-xs leading-relaxed" style={mutedColor}>
        {data.barsNote}
      </p>
    </figure>
  );
}

/** Banner, bar chart and takeaways for a reach or attention case study. Expects a dark case-study background. */
export function InsightCaseStudyDetail({ data }: { data: InsightCaseStudy }) {
  return (
    <div>
      <ScrollReveal direction="up">
        <div
          className="relative overflow-hidden rounded-3xl border border-white/10 p-6 text-white sm:p-10"
          style={{
            background:
              "radial-gradient(120% 90% at 100% 0%, rgba(249,115,22,0.35) 0%, rgba(249,115,22,0) 55%), #0F1115",
          }}
        >
          <p className="inline-flex items-center rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/80">
            {data.chip}
          </p>

          <div className="mt-7 flex flex-col gap-5 sm:flex-row sm:items-end sm:gap-8">
            {data.before && (
              <>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/50">Before</p>
                  <p className="mt-2 text-xl font-bold tracking-tight text-white/70 sm:text-2xl">
                    {data.before.value}
                  </p>
                  <p className="mt-1 max-w-[14rem] text-sm leading-snug text-white/50">{data.before.label}</p>
                </div>
                <ArrowDown className="h-6 w-6 text-[#F97316] sm:hidden" aria-hidden="true" />
                <ArrowRight className="mb-9 hidden h-7 w-7 flex-shrink-0 text-[#F97316] sm:block" aria-hidden="true" />
              </>
            )}
            <div>
              {data.headlineTag && (
                <p className="text-xs font-semibold uppercase tracking-wider text-[#FDBA74]">{data.headlineTag}</p>
              )}
              <p className="mt-2 text-4xl font-bold leading-none tracking-tight tabular-nums sm:text-6xl">
                {data.headline.value}
              </p>
              <p className="mt-2 max-w-xs text-sm leading-snug text-white/60">{data.headline.label}</p>
            </div>
          </div>

          <dl className="mt-9 grid grid-cols-1 gap-5 border-t border-white/10 pt-7 sm:grid-cols-3 sm:gap-6">
            {data.stats.map((s) => (
              <div key={s.label} className="flex flex-col-reverse">
                <dt className="mt-1.5 text-sm font-medium text-white/85">
                  {s.label}
                  {s.note && <span className="mt-0.5 block text-xs font-normal text-white/50">{s.note}</span>}
                </dt>
                <dd className="text-2xl font-bold tracking-tight tabular-nums text-[#FDBA74] sm:text-3xl">
                  {s.value}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-7 text-xs leading-relaxed text-white/45">{data.note}</p>
        </div>
      </ScrollReveal>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ScrollReveal direction="up" delay={0.1} className="h-full">
          <Bars data={data} />
        </ScrollReveal>

        <div className="grid content-start gap-4">
          {data.points.map((point, i) => (
            <ScrollReveal key={point.title} direction="up" delay={0.1 + i * 0.08}>
              <div className="flex gap-4 rounded-2xl border p-5" style={cardStyle}>
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                  {i + 1}
                </span>
                <div>
                  <p className="text-base font-semibold leading-snug" style={textColor}>
                    {point.title}
                  </p>
                  <p className="mt-1.5 text-sm leading-relaxed" style={mutedColor}>
                    {point.body}
                  </p>
                </div>
              </div>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </div>
  );
}
