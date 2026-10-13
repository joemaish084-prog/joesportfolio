import { useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SectionLabel } from "@/components/SectionLabel";
import { ScrollReveal } from "./ScrollReveal";
import { HOME_PREVIEW_COUNT, LATEST_COUNT, designs, type Design } from "@/data/designs";

// The homepage shows only the newest work; the full gallery lives at /work/design.
const preview = designs.slice(0, HOME_PREVIEW_COUNT);

export function GraphicDesign() {
  const [selectedDesign, setSelectedDesign] = useState<Design | null>(null);

  return (
    <section id="graphic-design" className="scroll-mt-20 lg:scroll-mt-24 dot-grid section-divider py-20 sm:py-32 bg-muted/30 overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12 sm:mb-16 space-y-4">
            <SectionLabel>DESIGN</SectionLabel>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold gradient-underline pb-4">
              Graphic <span className="text-gradient">Design</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Creative visual designs for digital marketing campaigns, brand identity,
              social media content, and promotional materials that drive engagement and conversions.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid grid-cols-2 gap-3 sm:gap-5 lg:grid-cols-4">
          {preview.map((design, index) => (
            <ScrollReveal key={design.title} direction="up" delay={(index % 4) * 0.08}>
              <button
                onClick={() => setSelectedDesign(design)}
                aria-label={`View ${design.title}`}
                className="corner-brackets w-full group relative overflow-hidden rounded-lg border-2 border-border hover:border-primary/60 transition-all duration-300 bg-background shadow-soft hover:shadow-elegant cursor-pointer"
              >
                <div className="relative aspect-[3/4] overflow-hidden">
                  <img
                    src={design.image}
                    alt={`${design.title} - ${design.description}`}
                    width={500}
                    height={667}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 sm:p-6 text-left">
                    <h3 className="text-base sm:text-xl font-display font-bold text-white mb-1 sm:mb-2">
                      {design.title}
                    </h3>
                    <p className="text-white/90 text-sm hidden sm:block">{design.description}</p>
                  </div>
                  {index < LATEST_COUNT && (
                    <span className="absolute left-3 top-3 rounded-full bg-primary px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-foreground">
                      New
                    </span>
                  )}
                </div>
              </button>
            </ScrollReveal>
          ))}
        </div>

        <ScrollReveal direction="up">
          <div className="mt-10 sm:mt-12 flex flex-col items-center gap-3">
            <Button variant="gradient" size="lg" asChild>
              <Link to="/work/design" className="gap-2">
                View all {designs.length} designs
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <p className="text-sm text-muted-foreground">
              Showing the {preview.length} newest. The full gallery is organised by brand.
            </p>
          </div>
        </ScrollReveal>
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={!!selectedDesign} onOpenChange={(open) => !open && setSelectedDesign(null)}>
        <DialogContent className="max-w-4xl w-full p-0 overflow-hidden">
          <DialogTitle className="sr-only">
            {selectedDesign?.title}
          </DialogTitle>
          {selectedDesign && (
            <div className="relative">
              <img loading="lazy" decoding="async"
                src={selectedDesign.image}
                alt={selectedDesign.title}
                className="w-full h-auto"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent p-6">
                <h3 className="text-2xl font-display font-bold text-white mb-2">
                  {selectedDesign.title}
                </h3>
                <p className="text-white/90">{selectedDesign.description}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
