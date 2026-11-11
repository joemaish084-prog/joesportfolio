import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShopifyProjectVisual } from "./ShopifyProjectVisual";
import { SHOPIFY_PATH, shopifyOffers, shopifyProject } from "@/data/shopify";

export function ShopifyAgencyFeature() {
  return (
    <section id="service-shopify-services" aria-labelledby="shopify-feature-heading" data-track-location="shopify_agency" className="shopify-premium container mx-auto scroll-mt-24 px-4 py-16 sm:py-24">
      <div className="mx-auto max-w-6xl">
        <div className="shopify-hero-top"><p className="shopify-kicker">Shopify creation & management</p><span className="hidden text-[10px] uppercase tracking-[0.15em] text-muted-foreground sm:block">Kenya & worldwide</span></div>
        <div className="shopify-hero-grid">
          <div><h2 id="shopify-feature-heading" className="shopify-display">Your store.<br /><span className="shopify-serif shopify-headline-cutout">More character.</span></h2><p className="shopify-intro">Shopify stores shaped around your business. From a first launch to a considered migration and the work that comes after.</p><Button asChild size="lg" className="shopify-action mt-7"><Link to={SHOPIFY_PATH}>Explore Shopify services <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link></Button><p className="mt-5 text-xs text-muted-foreground">Based in Nairobi. Working in Kenya and worldwide.</p></div>
          <div className="min-w-0"><ShopifyProjectVisual /><div className="shopify-project-meta"><span>Featured work / {shopifyProject.name}</span><a href={shopifyProject.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-9 items-center gap-1 underline underline-offset-4 hover:text-foreground">Visit live store <ArrowUpRight className="h-3 w-3" aria-hidden="true" /></a></div></div>
        </div>
        <nav aria-label="Shopify service options" className="shopify-service-links">
          {shopifyOffers.map(offer => <Link key={offer.id} to={`${SHOPIFY_PATH}#${offer.id}`} className="shopify-service-link group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"><span className="col-span-2 text-[10px] text-muted-foreground">{offer.number}</span><span className="font-display text-2xl font-medium tracking-tight transition-colors group-hover:text-primary">{offer.title}</span><ArrowUpRight className="h-5 w-5 self-center transition-transform motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5" aria-hidden="true" /><span className="col-span-2 text-xs leading-relaxed text-muted-foreground">{offer.summary}</span></Link>)}
        </nav>
      </div>
    </section>
  );
}
