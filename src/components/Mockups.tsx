import { Link } from "react-router-dom";
import { ArrowUpRight, Box } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionLabel } from "@/components/SectionLabel";
import { ScrollReveal } from "@/components/ScrollReveal";
import { MockupSpotlight } from "@/components/MockupSpotlight";

export function Mockups() {
  return (
    <section id="mockups" className="scroll-mt-20 section-divider overflow-hidden bg-background py-20 sm:py-28 lg:scroll-mt-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="mb-10 flex flex-col justify-between gap-6 sm:mb-14 lg:flex-row lg:items-end">
            <div className="max-w-3xl">
              <SectionLabel>MOCKUPS / THE BRAND, IN CONTEXT</SectionLabel>
              <h2 className="mt-5 font-display text-4xl font-bold leading-[1.02] tracking-tight sm:text-6xl lg:text-7xl">Made to be seen.<br /><span className="text-gradient">Built to be felt.</span></h2>
            </div>
            <div className="max-w-sm"><p className="text-base leading-relaxed text-muted-foreground sm:text-lg">Paper. Fabric. Everyday objects. See what happens when an identity leaves the screen.</p><Link to="/work/mockups" className="mt-4 inline-flex min-h-11 items-center gap-3 text-sm font-bold hover:text-primary">The full collection <ArrowUpRight className="h-4 w-4" /></Link></div>
          </div>
        </ScrollReveal>
        <MockupSpotlight />
        <div className="mt-7 flex flex-col justify-between gap-5 rounded-2xl border border-border bg-muted/20 p-5 sm:mt-8 sm:p-6 md:flex-row md:items-center">
          <div className="flex items-start gap-4"><span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-primary/20 text-primary"><Box className="h-5 w-5" /></span><div><p className="font-display text-lg font-bold">Give it a different angle.</p><p className="mt-1 text-sm text-muted-foreground">Rotate selected mugs, bottles and cards. Get closer to the details.</p></div></div>
          <Button variant="outline" size="lg" asChild className="shrink-0"><Link to="/work/mockups?view=3d" className="gap-3">Explore the 3D collection <ArrowUpRight className="h-4 w-4" /></Link></Button>
        </div>
      </div>
    </section>
  );
}
