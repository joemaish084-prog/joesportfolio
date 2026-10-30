import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionLabel } from "@/components/SectionLabel";
import { ScrollReveal } from "@/components/ScrollReveal";
import { MockupCard } from "@/components/MockupCard";
import { MockupLightbox } from "@/components/MockupLightbox";
import { mockups } from "@/data/mockups";

const preview = mockups.slice(0, 3);

export function Mockups() {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  return (
    <section id="mockups" className="scroll-mt-20 section-divider overflow-hidden bg-muted/20 py-20 sm:py-32 lg:scroll-mt-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-10 flex flex-col justify-between gap-6 sm:mb-14 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <SectionLabel>MOCKUPS / BRAND APPLICATIONS</SectionLabel>
              <h2 className="mt-5 font-display text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl">Design, out<br />in <span className="text-gradient">the world.</span></h2>
            </div>
            <p className="max-w-sm text-lg leading-relaxed text-muted-foreground">From the first impression to the everyday object. Familiar identities, imagined in a different dimension.</p>
          </div>
        </ScrollReveal>
        <div className="grid items-start gap-5 md:grid-cols-[1.35fr_1fr] lg:gap-8">
          <ScrollReveal><MockupCard item={preview[0]} featured onOpen={() => setSelectedId(preview[0].id)} /></ScrollReveal>
          <div className="space-y-5 lg:space-y-8 md:pt-16">
            <ScrollReveal delay={0.08}><MockupCard item={preview[1]} onOpen={() => setSelectedId(preview[1].id)} /></ScrollReveal>
            <div className="border-l-2 border-primary/60 py-1 pl-5">
              <p className="font-display text-xl font-semibold">One identity. Many possibilities.</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">Print, apparel and everyday pieces, each carrying the same visual language.</p>
            </div>
          </div>
          <div className="md:-mt-6"><ScrollReveal><MockupCard item={preview[2]} onOpen={() => setSelectedId(preview[2].id)} /></ScrollReveal></div>
          <div className="flex flex-col items-start justify-center py-5 md:self-center md:pl-6">
            <p className="mb-5 max-w-xs text-muted-foreground">Explore the collection, or follow an application back to the brand kit that shaped it.</p>
            <Button variant="gradient" size="lg" asChild><Link to="/work/mockups" className="gap-2">Explore all mockups <ArrowRight className="h-5 w-5" /></Link></Button>
            <p className="mt-4 text-xs text-muted-foreground">Concept applications of portfolio brand identities.</p>
          </div>
        </div>
      </div>
      <MockupLightbox items={preview} selectedId={selectedId} onSelect={setSelectedId} />
    </section>
  );
}
