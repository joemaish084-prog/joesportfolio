import { ArrowRight, Calendar, ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { SectionLabel } from "@/components/SectionLabel";
import { Button } from "@/components/ui/button";
import { caseStudies } from "@/data/caseStudies";
import { CALENDLY_URL, trustNumbers } from "@/data/services";
import { HeroResultCard } from "./HeroResultCard";
import { TrustNumbers } from "./TrustNumbers";

/** The published study shown beside the headline. */
const HERO_STUDY_ID = "meta-google-combined";

/** Page header for /agency/services. Replaces the generic inner-page header there. */
export function ServicesHero() {
  const study = caseStudies.find((cs) => cs.id === HERO_STUDY_ID);
  return (
    <header data-track-location="services-hero" className="relative overflow-hidden border-b border-border/50">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 right-[-10%] h-[28rem] w-[28rem] rounded-full bg-primary/[0.07] blur-[120px]" />
        <div className="absolute inset-0 dot-grid [mask-image:radial-gradient(ellipse_80%_90%_at_70%_0%,black_30%,transparent_100%)]" />
      </div>

      <div className="container relative mx-auto px-4 pb-12 pt-8 sm:pb-16 sm:pt-12">
        <div className="mx-auto max-w-6xl">
          <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted-foreground">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li><Link to="/agency" className="transition-colors hover:text-primary">Agency</Link></li>
              <li aria-hidden="true"><ChevronRight className="h-3.5 w-3.5" /></li>
              <li><span aria-current="page" className="text-foreground">Services</span></li>
            </ol>
          </nav>

          <div className="grid gap-10 lg:grid-cols-[1.3fr_1fr] lg:items-center lg:gap-14">
            <div>
              <SectionLabel>JOSEPH MAINA MARKETING · NAIROBI</SectionLabel>
              <h1 className="mt-4 text-balance font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
                Digital marketing services in Nairobi that{" "}
                <span className="font-serif font-normal italic text-primary">pay back in KES.</span>
              </h1>
              <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground">
                Paid ads, SEO, social media and Shopify stores. Pick one channel or combine them, and work directly with me.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Button size="lg" className="w-full rounded-full sm:w-auto" asChild>
                  <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">
                    <Calendar className="mr-2 h-5 w-5" aria-hidden /> Book a Free Strategy Call
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="w-full rounded-full sm:w-auto" asChild>
                  <Link to="/agency/results">
                    See results <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                  </Link>
                </Button>
              </div>

              <div className="mt-10 border-t border-border/60 pt-6">
                <TrustNumbers items={trustNumbers} />
              </div>
            </div>

            {study && <HeroResultCard study={study} />}
          </div>
        </div>
      </div>
    </header>
  );
}
