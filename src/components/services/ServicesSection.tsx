import { Link } from "react-router-dom";
import { ArrowRight, Calculator } from "lucide-react";
import { SectionLabel } from "@/components/SectionLabel";
import { trackSpotlight } from "@/lib/spotlight";
import { getLiveServicePages } from "@/data/servicePages";
import { CampaignSnapshot } from "./CampaignSnapshot";
import { PlatformDecision } from "./PlatformDecision";
import { PricingNotes } from "./PricingNotes";
import { PrimaryServiceCard } from "./PrimaryServiceCard";
import { ProcessTimeline } from "./ProcessTimeline";
import { SecondaryServiceCard } from "./SecondaryServiceCard";
import { ServicesCTA } from "./ServicesCTA";
import { moreServices, primaryServices, secondaryHeading, secondaryServices, servicesHeader } from "./servicesContent";

/** The /agency/services body: Google Ads and Meta Ads lead, everything else supports them. */
export function ServicesSection() {
  const servicePages = getLiveServicePages();
  return (
    <section id="services" className="container mx-auto scroll-mt-20 px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="max-w-3xl space-y-4">
          <SectionLabel>{servicesHeader.label}</SectionLabel>
          <h2 className="text-balance font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">{servicesHeader.heading}</h2>
          <p className="text-lg leading-relaxed text-muted-foreground">{servicesHeader.intro}</p>
          <p className="border-l-2 border-primary pl-4 font-medium text-foreground">{servicesHeader.statement}</p>
        </div>

        {/* Lead offers */}
        <div className="mt-12 grid items-stretch gap-6 lg:grid-cols-2">
          {primaryServices.map((service, i) => (
            <PrimaryServiceCard key={service.key} service={service} index={i} />
          ))}
        </div>

        <PlatformDecision />
        <CampaignSnapshot />
        <ProcessTimeline />

        {/* Supporting services */}
        <section aria-labelledby="secondary-title" className="mt-20 sm:mt-24">
          <h2 id="secondary-title" className="max-w-2xl font-display text-2xl font-bold tracking-tight sm:text-3xl">{secondaryHeading}</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {secondaryServices.map((service, i) => (
              <SecondaryServiceCard key={service.anchorId} service={service} index={i} />
            ))}
          </div>

          {/* Services without a card of their own. Pricing still links to these anchors. */}
          <div className="mt-8 flex flex-wrap items-center gap-x-2 gap-y-2 text-sm text-muted-foreground">
            <span>Also available:</span>
            <ul className="flex flex-wrap gap-2">
              {moreServices.map((item) => (
                <li key={item.anchorId} id={item.anchorId} className="scroll-mt-24">
                  <Link to="/agency/contact" className="inline-flex min-h-9 items-center rounded-full border border-border/70 px-3.5 text-foreground/90 transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Every dedicated service page stays one click away. */}
          <nav aria-label="Full service pages" className="mt-8 border-t border-border/60 pt-6">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Full service pages</p>
            <ul className="mt-3 grid gap-x-8 gap-y-1 sm:grid-cols-2 lg:grid-cols-4">
              {servicePages.map((page) => (
                <li key={page.slug}>
                  <Link to={`/agency/${page.slug}`} className="group inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-foreground/90 hover:text-primary focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    {page.navLabel}
                    <ArrowRight className="h-3.5 w-3.5 transition-transform motion-safe:group-hover:translate-x-0.5" aria-hidden />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </section>

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
  );
}
