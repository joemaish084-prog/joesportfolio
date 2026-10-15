import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SectionLabel } from "@/components/SectionLabel";
import { ScrollReveal } from "./ScrollReveal";
import { BrandCard } from "./BrandCard";
import { brands } from "@/data/brands";

export function BrandIdentity() {
  return (
    <section id="branding" className="scroll-mt-20 lg:scroll-mt-24 section-divider py-20 sm:py-32 bg-background">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <ScrollReveal>
          <div className="text-center mb-12 sm:mb-16 space-y-4">
            <SectionLabel>BRANDING</SectionLabel>
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold gradient-underline pb-4">
              Brand <span className="text-gradient">Identity</span>
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Complete brand systems: logo, colour, typography and the templates that keep every post on-brand.
            </p>
          </div>
        </ScrollReveal>

        <div className="mx-auto max-w-6xl space-y-8">
          {brands.map((b) => (
            <ScrollReveal key={b.slug} direction="up">
              <BrandCard brand={b} />
            </ScrollReveal>
          ))}
        </div>

        {brands.length > 1 && (
          <div className="mt-10 flex justify-center">
            <Button variant="gradient" size="lg" asChild>
              <Link to="/work/branding" className="gap-2">
                All brand identities
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
