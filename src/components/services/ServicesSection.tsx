import { Link } from "react-router-dom";
import { ArrowRight, Calculator } from "lucide-react";
import { trackSpotlight } from "@/lib/spotlight";
import { getLiveServicePages } from "@/data/servicePages";
import { alsoAvailableServices, bentoServices, packageFeeNote, serviceAnchorId, serviceHref } from "@/data/services";
import { MoreServicesRow } from "./MoreServicesRow";
import { PlatformDecision } from "./PlatformDecision";
import { PricingNotes } from "./PricingNotes";
import { ProcessTimeline } from "./ProcessTimeline";
import { ServicesBento } from "./ServicesBento";
import { ServicesCTA } from "./ServicesCTA";
import { ServicesHero } from "./ServicesHero";

const moreServices = alsoAvailableServices.map((s) => ({
  anchorId: serviceAnchorId(s.slug),
  label: s.tileName,
  to: serviceHref(s),
}));

/** The /agency/services page: hero, then every service in one bento grid. */
export function ServicesSection() {
  const servicePages = getLiveServicePages();
  return (
    <>
      <ServicesHero />

      <section id="services" className="container mx-auto scroll-mt-20 px-4 py-14 sm:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex flex-col gap-3 sm:mb-10 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
            <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">What I can run for you</h2>
            <p className="max-w-md text-sm text-muted-foreground lg:text-right">{packageFeeNote}</p>
          </div>

          <ServicesBento services={bentoServices} />
          <MoreServicesRow items={moreServices} />

          {/* Every dedicated service page stays one click away. scripts/check-agency.mjs matches this list to the JSON-LD catalog. */}
          <nav aria-label="Full service pages" className="mt-6 border-t border-border/60 pt-5">
            <ul className="flex flex-wrap items-center gap-x-5 text-sm">
              <li className="text-muted-foreground" aria-hidden>Read more:</li>
              {servicePages.map((page) => (
                <li key={page.slug}>
                  <Link to={`/agency/${page.slug}`} className="inline-flex min-h-11 items-center font-medium text-foreground/90 hover:text-primary focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    {page.navLabel}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <PlatformDecision />
          <ProcessTimeline />
          <PricingNotes />

          {/* Free tool, kept from the previous page */}
          <Link
            to="/agency/ad-budget-calculator"
            onMouseMove={trackSpotlight}
            className="spotlight surface-card group mt-10 flex flex-col gap-5 p-6 transition-colors duration-300 hover:border-primary/40 sm:flex-row sm:items-center sm:p-8"
          >
            <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-orange">
              <Calculator className="h-7 w-7 text-white" aria-hidden />
            </span>
            <span className="flex-1">
              <span className="block text-xs font-semibold uppercase tracking-[0.18em] text-primary">Free tool</span>
              <span className="mt-1 block font-display text-xl font-semibold transition-colors group-hover:text-primary">Will your ad budget pay for itself?</span>
              <span className="mt-1 block text-sm text-muted-foreground">
                Enter your budget, sale value and close rate to see the leads, customers and profit to expect, and the cost per lead you can afford.
              </span>
            </span>
            <span className="inline-flex items-center gap-2 text-sm font-semibold text-primary">
              Try the calculator <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-1" aria-hidden />
            </span>
          </Link>

          <ServicesCTA />
        </div>
      </section>
    </>
  );
}
