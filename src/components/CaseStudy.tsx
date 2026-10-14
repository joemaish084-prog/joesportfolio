import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "./ScrollReveal";
import { SectionLabel } from "@/components/SectionLabel";
import { caseStudies } from "@/data/caseStudies";

// Only the newest few appear on the homepage; the rest are on the full page.
const preview = caseStudies.slice(0, 3);

// The homepage shows a short preview; the full breakdowns live at /work/case-studies.
export function CaseStudy() {
  return (
    <section
      id="case-study"
      className="scroll-mt-20 lg:scroll-mt-24 dot-grid section-divider on-dark py-20 sm:py-32"
      style={{ background: "hsl(var(--case-study-bg))" }}
      aria-label="Digital marketing case studies with campaign results from Nairobi, Kenya"
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <ScrollReveal>
          <div className="text-center mb-12 sm:mb-16 space-y-4">
            <SectionLabel>CASE STUDIES</SectionLabel>
            <h2
              className="text-3xl sm:text-4xl md:text-5xl font-display font-bold gradient-underline pb-4"
              style={{ color: "hsl(var(--case-study-text))" }}
            >
              Digital Marketing <span className="text-gradient">Case Studies</span> in Kenya
            </h2>
            <p className="text-lg max-w-3xl mx-auto" style={{ color: "hsl(var(--case-study-muted))" }}>
              Recent Meta Ads and Google Ads campaigns for Kenyan brands, with the strategy, tracked results and
              attribution details behind each one.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {preview.map((cs, i) => (
            <ScrollReveal key={cs.id} direction="up" delay={i * 0.12} className="h-full">
              <Link
                to={`/work/case-studies#${cs.id}`}
                className="group flex h-full flex-col overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1 hover:shadow-elegant"
                style={{ background: "hsl(var(--case-study-card))", borderColor: "hsl(var(--case-study-card-border))" }}
              >
                <div className="relative h-44 sm:h-56 overflow-hidden">
                  <img
                    src={cs.cover.src}
                    alt={cs.cover.alt}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(180deg, hsl(var(--case-study-card) / 0) 40%, hsl(var(--case-study-card)) 100%)",
                    }}
                  />
                </div>
                <div className="flex flex-1 flex-col p-6 pt-2 sm:p-8 sm:pt-2">
                <p className="flex flex-wrap items-center gap-x-3 gap-y-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                  <span>
                    {cs.tag} · {cs.period}
                  </span>
                  {i === 0 && (
                    <span className="rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold tracking-wider text-primary-foreground">
                      Latest
                    </span>
                  )}
                </p>
                <h3
                  className="mt-4 text-xl sm:text-2xl font-display font-bold leading-snug"
                  style={{ color: "hsl(var(--case-study-text))" }}
                >
                  {cs.title}
                </h3>
                <p className="mt-3 flex-1 text-sm sm:text-base leading-relaxed" style={{ color: "hsl(var(--case-study-muted))" }}>
                  {cs.summary}
                </p>

                <dl
                  className="mt-6 space-y-3 border-t pt-6"
                  style={{ borderColor: "hsl(var(--case-study-card-border))" }}
                >
                  {cs.stats.map((stat) => (
                    <div key={stat.label} className="flex items-baseline justify-between gap-4">
                      <dt className="text-sm leading-snug" style={{ color: "hsl(var(--case-study-muted))" }}>
                        {stat.label}
                      </dt>
                      <dd className="flex-shrink-0 text-xl sm:text-2xl font-display font-bold text-gradient">
                        {stat.value}
                      </dd>
                    </div>
                  ))}
                </dl>

                <span className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary">
                  View case study
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
                </div>
              </Link>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal direction="up">
          <div className="mt-10 sm:mt-12 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button variant="gradient" size="lg" asChild>
              <Link to="/work/case-studies" className="gap-2">
                View all {caseStudies.length} case studies
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <a href="#contact">Let's Work Together</a>
            </Button>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
