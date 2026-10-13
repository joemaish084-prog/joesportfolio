import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ScrollReveal";
import { MetaTurnaroundVisual } from "@/components/MetaTurnaroundVisual";
import { metaTurnaround } from "@/data/metaTurnaroundCaseStudy";

/** Full visual breakdown of the Meta Ads turnaround. Expects a dark case-study background. */
export function MetaTurnaroundDetail() {
  return (
    <div>
      <ScrollReveal direction="up">
        <MetaTurnaroundVisual kind="hero" tone="dark" />
      </ScrollReveal>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <ScrollReveal direction="up" delay={0.1}>
          <MetaTurnaroundVisual kind="monthly" tone="dark" />
        </ScrollReveal>
        <ScrollReveal direction="up" delay={0.15}>
          <MetaTurnaroundVisual kind="comparison" tone="dark" />
        </ScrollReveal>
      </div>

      <ScrollReveal direction="up" delay={0.1}>
        <MetaTurnaroundVisual kind="process" tone="dark" className="mt-6" />
      </ScrollReveal>

      <ScrollReveal direction="up" delay={0.1}>
        <MetaTurnaroundVisual kind="campaigns" tone="dark" className="mt-6" />
      </ScrollReveal>

      <p className="mt-5 text-xs leading-relaxed" style={{ color: "hsl(var(--case-study-muted))" }}>
        {metaTurnaround.attributionNote}
      </p>

      <div className="mt-8">
        <Button variant="outline" size="lg" asChild>
          <Link to={`/agency/blog/${metaTurnaround.slug}`} className="gap-2">
            Read the full write-up
            <ArrowRight className="h-5 w-5" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
