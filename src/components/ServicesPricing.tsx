import { Target, Search, Share2, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";
import { ScrollReveal } from "./ScrollReveal";
import { SectionLabel } from "@/components/SectionLabel";

const services = [
  {
    icon: Target,
    title: "Meta Ads",
    description: "From KES 40,000/mo + ad spend — Facebook & Instagram campaigns: strategy, audience research, creative direction, weekly optimization and monthly reporting.",
    className: "md:col-span-2",
  },
  {
    icon: Search,
    title: "Google Ads",
    description: "From KES 45,000/mo + ad spend — Search, Display & YouTube campaigns: keyword strategy, bid management, conversion tracking and monthly reporting.",
    className: "md:col-span-1",
  },
  {
    icon: Share2,
    title: "Social Media Management",
    description: "From KES 40,000/mo — Content planning, scheduling and community management for your social channels.",
    className: "md:col-span-1",
  },
  {
    icon: FileText,
    title: "SEO Optimization",
    description: "From KES 45,000/mo — Keyword research, on-page optimization, technical audits and local SEO to help customers find your business.",
    className: "md:col-span-1",
  },
];

export function ServicesPricing() {
  return (
    <section id="services" className="scroll-mt-20 lg:scroll-mt-24 dot-grid section-divider py-20 sm:py-32" aria-label="Digital Marketing Services & Pricing">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="text-center mb-14 space-y-4">
          <SectionLabel>SERVICES</SectionLabel>
          <h2 className="text-title-1 sm:text-large-title font-display">
            Services & Pricing
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Monthly retainers for brands in Nairobi and across Kenya. Management fees are separate from your advertising budget. Custom packages available on request.
          </p>
        </div>

        {/* Fixed 22rem rows only suit the desktop bento; stacked cards size to their content */}
        <BentoGrid className="grid-cols-1 md:grid-cols-3 auto-rows-auto md:auto-rows-[22rem] gap-4">
          {services.map((s, i) => (
            <ScrollReveal key={s.title} direction="up" delay={i * 0.1}>
              <BentoCard
                name={s.title}
                description={s.description}
                Icon={s.icon}
                href="/agency"
                cta={`Explore ${s.title} services`}
                className={s.className}
                background={
                  <s.icon className="pointer-events-none absolute -right-6 -top-6 h-40 w-40 text-primary/5" />
                }
              />
            </ScrollReveal>
          ))}
        </BentoGrid>

        <div className="mt-12 text-center">
          <Button asChild size="lg">
            <a href="/agency/contact" data-track="calendly_click">
              Book a Free Strategy Call
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <p className="mt-3 text-sm text-muted-foreground">
            See full packages on the{" "}
            <a href="/agency" className="text-primary underline underline-offset-4">Agency page</a>.
          </p>
        </div>
      </div>
    </section>
  );
}

export default ServicesPricing;
