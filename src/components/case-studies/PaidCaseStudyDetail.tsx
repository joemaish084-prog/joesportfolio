import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ScrollReveal";
import { MetaTurnaroundVisual } from "@/components/MetaTurnaroundVisual";
import type { PaidCaseStudy } from "@/data/metaTurnaroundCaseStudy";

/** Full visual breakdown of a paid-media case study. Expects a dark case-study background. */
export function PaidCaseStudyDetail({ data }: { data: PaidCaseStudy }) {
  return (
    <div>
      <ScrollReveal direction="up">
        <MetaTurnaroundVisual kind="hero" tone="dark" data={data} />
      </ScrollReveal>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ScrollReveal direction="up" delay={0.1}>
          <MetaTurnaroundVisual kind="monthly" tone="dark" data={data} />
        </ScrollReveal>
        <ScrollReveal direction="up" delay={0.15}>
          <MetaTurnaroundVisual kind="comparison" tone="dark" data={data} />
        </ScrollReveal>
      </div>

      <ScrollReveal direction="up" delay={0.1}>
        <MetaTurnaroundVisual kind="process" tone="dark" className="mt-6" data={data} />
      </ScrollReveal>

      <ScrollReveal direction="up" delay={0.1}>
        <MetaTurnaroundVisual kind="campaigns" tone="dark" className="mt-6" data={data} />
      </ScrollReveal>

      {data.slug && (
        <div className="mt-8">
          <Button variant="outline" size="lg" asChild>
            <Link to={`/agency/blog/${data.slug}`} className="gap-2">
              Read the full write-up
              <ArrowRight className="h-5 w-5" />
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
