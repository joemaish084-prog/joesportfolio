import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShopifyProjectVisual } from "@/components/shopify/ShopifyProjectVisual";
import { SHOPIFY_PATH, shopifyProject } from "@/data/shopify";

export function ShopifyPortfolio() {
  return (
    <section id="shopify" aria-labelledby="shopify-project-title" data-track-location="shopify_portfolio" className="shopify-premium scroll-mt-24 border-y border-border/60 bg-[var(--commerce-paper)] py-20 sm:py-28 lg:py-36">
      <div className="container mx-auto max-w-7xl px-5 sm:px-8 lg:px-12">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-foreground/15 pb-6"><p className="shopify-kicker">Selected Shopify work</p><span className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">Commerce / 01</span></div>
        <div className="mb-10 mt-9 flex flex-col justify-between gap-7 sm:mb-14 sm:mt-12 lg:flex-row lg:items-end">
          <h2 id="shopify-project-title" className="shopify-display">Babyshop<br /><span className="shopify-serif shopify-headline-cutout">Dansar.</span></h2>
          <div className="max-w-sm lg:pb-2"><p className="text-sm leading-relaxed text-muted-foreground">{shopifyProject.description}</p><a href={shopifyProject.url} target="_blank" rel="noopener noreferrer" data-track="shopify_store_visit" className="shopify-text-link mt-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Visit live store <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a></div>
        </div>
        <ShopifyProjectVisual showcase />
        <dl className="grid grid-cols-3 gap-4 border-b border-foreground/15 py-7 sm:gap-8 sm:py-9">
          {shopifyProject.details.map(detail => <div key={detail.label}><dt className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground">{detail.label}</dt><dd className="mt-2 text-xs font-medium sm:text-sm">{detail.value}</dd></div>)}
        </dl>
        <div className="mt-8 flex flex-col justify-between gap-6 sm:mt-10 sm:flex-row sm:items-center"><p className="font-display text-2xl font-medium tracking-tight sm:text-3xl">A new chapter for<br /><span className="shopify-serif">your store?</span></p><Button asChild size="lg" className="shopify-action self-start"><Link to={SHOPIFY_PATH}>Explore Shopify services <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link></Button></div>
        <p className="mt-7 text-[11px] text-muted-foreground">{shopifyProject.captured} · Based in Nairobi. Working in Kenya and worldwide.</p>
      </div>
    </section>
  );
}
