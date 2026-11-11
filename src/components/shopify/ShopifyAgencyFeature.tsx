import { Link } from "react-router-dom";
import { ArrowDownRight, ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShopifyProjectVisual } from "./ShopifyProjectVisual";
import { SHOPIFY_PATH, shopifyOffers, shopifyProject } from "@/data/shopify";

export function ShopifyAgencyFeature() {
  return (
    <section id="service-shopify-services" aria-labelledby="shopify-feature-heading" data-track-location="shopify_agency" className="container mx-auto scroll-mt-24 px-4 py-16 sm:py-20">
      <div className="mx-auto max-w-6xl border-y border-border/70 py-10 sm:py-14">
        <p className="mb-8 text-xs font-semibold uppercase tracking-[0.18em] text-primary">Shopify creation & management</p>
        <div className="grid items-center gap-10 lg:grid-cols-[5fr_7fr] lg:gap-14">
          <div>
            <h2 id="shopify-feature-heading" className="font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">Launch.<br />Migrate.<br /><span className="text-primary">Keep growing.</span></h2>
            <p className="mb-7 mt-5 max-w-md text-base leading-relaxed text-muted-foreground">I create, migrate, and manage Shopify stores for businesses in Kenya and worldwide. Find the support your store needs next.</p>
            <Button asChild size="lg" className="rounded-full text-[#1c140b]"><Link to={SHOPIFY_PATH}>Explore Shopify services <ArrowDownRight className="h-4 w-4" aria-hidden="true" /></Link></Button>
          </div>
          <div className="min-w-0"><ShopifyProjectVisual /><p className="mt-4 flex flex-wrap justify-between gap-2 text-xs text-muted-foreground"><span>Featured work: {shopifyProject.name}</span><a href={shopifyProject.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center gap-1 underline underline-offset-4 hover:text-foreground">Visit live store <ArrowUpRight className="h-3 w-3" aria-hidden="true" /></a></p></div>
        </div>
        <nav aria-label="Shopify service options" className="mt-10 divide-y divide-border border-y border-border sm:mt-12">
          {shopifyOffers.map(offer => <Link key={offer.id} to={`${SHOPIFY_PATH}#${offer.id}`} className="group grid min-h-20 grid-cols-[24px_1fr_20px] items-center gap-x-3 gap-y-1 py-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:grid-cols-[32px_110px_1fr_20px]"><span className="col-start-1 row-start-1 text-xs text-muted-foreground">{offer.number}</span><span className="col-start-2 row-start-1 font-display text-2xl font-medium transition-colors group-hover:text-primary">{offer.title}</span><span className="col-start-2 row-start-2 text-sm text-muted-foreground sm:col-start-3 sm:row-start-1">{offer.summary}</span><ArrowUpRight className="col-start-3 row-start-1 h-4 w-4 transition-transform motion-safe:group-hover:translate-x-0.5 sm:col-start-4" aria-hidden="true" /></Link>)}
        </nav>
      </div>
    </section>
  );
}
