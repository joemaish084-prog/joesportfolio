import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { getProofItem, proofCardIds, proofDisclaimer, resultsStrip } from "@/data/services";
import { CaseStudyCard } from "./CaseStudyCard";
import { ResultsStrip } from "./ResultsStrip";

const cards = proofCardIds.map(getProofItem);

/**
 * Results strip and three case study cards. The hero's "See results" button lands here (#results).
 * Testimonials: none are confirmed for reuse on this page. TODO(joseph): add a real one here, or leave it out.
 */
export function ProofSection() {
  return (
    <section id="results" aria-labelledby="results-heading" className="mt-16 scroll-mt-20 sm:mt-24">
      <div className="mb-8 flex flex-col gap-3 sm:mb-10 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
        <h2 id="results-heading" className="font-display text-3xl font-bold tracking-tight sm:text-4xl">What the numbers looked like</h2>
        <p className="max-w-md text-sm text-muted-foreground lg:text-right">
          Figures are copied from the published case studies. {proofDisclaimer}
        </p>
      </div>

      <ResultsStrip items={resultsStrip} />

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {cards.map((study) => (
          <CaseStudyCard key={study.id} study={study} />
        ))}
      </div>

      <div className="mt-6 flex justify-end">
        <Link
          to="/agency/results"
          className="group inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-primary focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          See all results
          <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-1" aria-hidden />
        </Link>
      </div>
    </section>
  );
}
