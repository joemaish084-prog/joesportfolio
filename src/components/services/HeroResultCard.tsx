import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import type { CaseStudySummary } from "@/data/caseStudies";
import { proofDisclaimer } from "@/data/services";
import { trackSpotlight } from "@/lib/spotlight";

/** One published case study as an HTML card, so the hero carries no image weight. */
export function HeroResultCard({ study }: { study: CaseStudySummary }) {
  const [lead, ...rest] = study.stats;
  return (
    <Link
      to={`/work/case-studies#${study.id}`}
      onMouseMove={trackSpotlight}
      className="spotlight surface-card group block w-full max-w-md p-6 shadow-elegant hover:border-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background sm:p-8 lg:ml-auto"
    >
      <p className="mono-accent text-[11px] font-semibold uppercase tracking-[0.16em] text-primary">
        {study.tag} · {study.period}
      </p>
      <p className="mt-5 font-display text-5xl font-bold tracking-tight text-gradient tabular-nums sm:text-6xl">{lead.value}</p>
      <p className="mt-1 text-sm text-muted-foreground">{lead.label}</p>

      <dl className="mt-6 grid grid-cols-2 gap-4 border-t border-border/60 pt-5">
        {rest.map((stat) => (
          <div key={stat.label} className="flex flex-col-reverse">
            <dt className="mt-1 text-xs leading-snug text-muted-foreground">{stat.label}</dt>
            <dd className="font-display text-2xl font-bold tabular-nums">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <p className="mt-5 text-xs text-muted-foreground">Client not named. {proofDisclaimer}</p>
      <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
        Read the case study
        <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-1" aria-hidden />
      </span>
    </Link>
  );
}
