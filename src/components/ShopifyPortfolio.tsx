import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ShopifyProjectVisual } from "@/components/shopify/ShopifyProjectVisual";
import { SHOPIFY_PATH, shopifyProject } from "@/data/shopify";

export function ShopifyPortfolio() {
  return (
    <section id="shopify" aria-labelledby="shopify-project-title" data-track-location="shopify_portfolio" className="scroll-mt-24 border-y border-border/60 bg-muted/25 py-20 sm:py-28">
      <div className="container mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <p className="flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden="true" />Selected Shopify work</p>
        <div className="mb-10 mt-6 flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <h2 id="shopify-project-title" className="font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">Babyshop<br />Dansar<span className="text-primary">.</span></h2>
          <p className="max-w-xs text-sm leading-relaxed text-muted-foreground">Baby and maternity retail.<br />A real store, in the details.</p>
        </div>
        <ShopifyProjectVisual />
        <div className="mt-6 flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
          <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">{shopifyProject.description}</p>
          <a href={shopifyProject.url} target="_blank" rel="noopener noreferrer" data-track="shopify_store_visit" className="inline-flex min-h-11 shrink-0 items-center gap-2 self-start border-b border-primary/70 text-sm font-medium hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Visit live store <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></a>
        </div>
        <dl className="my-8 grid grid-cols-3 gap-4 border-y border-border py-6 sm:my-10 sm:gap-8">
          {shopifyProject.details.map(detail => <div key={detail.label}><dt className="text-[10px] uppercase tracking-[0.15em] text-muted-foreground sm:text-xs">{detail.label}</dt><dd className="mt-2 text-xs font-medium sm:text-sm">{detail.value}</dd></div>)}
        </dl>
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <p className="font-display text-2xl font-medium tracking-tight sm:text-3xl">Your store could<br />be the next story.</p>
          <Button asChild size="lg" className="self-start rounded-full text-[#1c140b]"><Link to={SHOPIFY_PATH}>Explore Shopify services <ArrowUpRight className="h-4 w-4" aria-hidden="true" /></Link></Button>
        </div>
        <p className="mt-6 text-xs text-muted-foreground">{shopifyProject.captured} · Based in Nairobi. Working in Kenya and worldwide.</p>
      </div>
    </section>
  );
}
