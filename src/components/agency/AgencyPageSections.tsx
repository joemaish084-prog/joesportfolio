import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronRight, Star } from "lucide-react";
import { Footer } from "@/components/Footer";
import { SectionLabel } from "@/components/SectionLabel";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { AgencySectionLinks } from "./AgencyNavigation";
import { PairedTitle } from "@/components/type/TypePair";
import { splitHeadline } from "@/lib/typePairs";

export function SubHeading({ eyebrow, title, children, aside }: { eyebrow?: string; title: ReactNode; children?: ReactNode; aside?: ReactNode }) {
  return <div className="mb-8 flex flex-col gap-4 border-b border-border/60 pb-5 sm:flex-row sm:items-end sm:justify-between">
    <div className="max-w-2xl">
      {eyebrow && <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">{eyebrow}</p>}
      <h2 className="font-display text-2xl font-semibold tracking-tight sm:text-3xl">{title}</h2>
      {children && <p className="mt-2 text-sm text-muted-foreground sm:text-base">{children}</p>}
    </div>
    {aside}
  </div>;
}

export function AgencyPageHeader({ page, visual, children, pairMain }: {
  page: { label: string; heading: string; intro: string };
  visual?: ReactNode;
  children?: ReactNode;
  /** Opening words set in the page's display face; the rest take the accent face. */
  pairMain?: string;
}) {
  const [main, accent] = splitHeadline(page.heading, pairMain);
  return (
    <header className="relative overflow-hidden border-b border-border/50">
      <div aria-hidden className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 right-[-10%] h-[28rem] w-[28rem] rounded-full bg-primary/[0.07] blur-[120px]" />
        <div className="absolute inset-0 dot-grid [mask-image:radial-gradient(ellipse_80%_90%_at_70%_0%,black_30%,transparent_100%)]" />
      </div>
      <div className="relative container mx-auto px-4 pt-10 pb-12 sm:pt-16 sm:pb-16">
        <div className="mx-auto max-w-6xl">
          <nav aria-label="Breadcrumb" className="mb-8 text-sm text-muted-foreground">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li><Link to="/" className="hover:text-primary transition-colors">Agency</Link></li>
              <li aria-hidden="true"><ChevronRight className="h-3.5 w-3.5" /></li>
              <li><span aria-current="page" className="text-foreground">{page.label}</span></li>
            </ol>
          </nav>
          <div className={visual ? "grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)] lg:items-center lg:gap-12 xl:gap-16" : undefined}>
            <div className="min-w-0">
              <SectionLabel>JOSEPH MAINA MARKETING</SectionLabel>
              {pairMain
                ? <PairedTitle className="mt-5 max-w-4xl" main={main} accent={accent} />
                : <h1 className="mt-4 max-w-4xl text-balance text-4xl font-display font-bold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">{page.heading}</h1>}
              <p className="mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground">{page.intro}</p>
              {children}
            </div>
            {visual}
          </div>
        </div>
      </div>
    </header>
  );
}

export function AgencyPageCta({ showPricing = true }: { showPricing?: boolean }) {
  return (
    <section className="container mx-auto px-4 pb-20">
      <Card className="relative max-w-4xl mx-auto overflow-hidden rounded-3xl p-8 md:p-14 text-center border-primary/40 bg-gradient-to-br from-primary/[0.08] via-transparent to-transparent">
        <div aria-hidden className="pointer-events-none absolute inset-0 dot-grid [mask-image:radial-gradient(ellipse_70%_80%_at_50%_0%,black_20%,transparent_100%)]" />
        <div className="relative">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium mb-4">
            <Star className="h-3 w-3 fill-primary" /> Work Together
          </div>
          <h2 className="text-balance text-3xl md:text-4xl font-display font-bold mb-3">Find the right next step for your brand</h2>
          <p className="text-muted-foreground mb-8 max-w-lg mx-auto">I take on a limited number of clients to ensure quality and attention to detail.</p>
          <div className="flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" className="rounded-full" asChild><Link to="/agency/contact">Book a Free Strategy Call <ArrowRight className="h-4 w-4" aria-hidden /></Link></Button>
            {showPricing && <Button size="lg" variant="outline" className="rounded-full" asChild><Link to="/agency/pricing">View Pricing</Link></Button>}
          </div>
        </div>
      </Card>
    </section>
  );
}

/** Agency section links, then the same site-wide footer the portfolio uses. */
export function AgencyPageFooter() {
  return <>
    <div className="container mx-auto px-4 pb-10"><AgencySectionLinks className="justify-center text-muted-foreground" /></div>
    <Footer />
  </>;
}
