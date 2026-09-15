import { Target, Search, Share2, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BentoGrid, BentoCard } from "@/components/ui/bento-grid";
import { ScrollReveal } from "./ScrollReveal";
import { SectionLabel } from "@/components/SectionLabel";

const services = [
  {
    icon: Target,
    title: "Meta Ads",
    description: "KES 35,000/mo + ad spend — Facebook & Instagram campaigns optimized for ROAS: creative, targeting, retargeting, A/B testing.",
    className: "md:col-span-2",
  },
  {
    icon: Search,
    title: "Google Ads",
    description: "KES 40,000/mo + ad spend — Search, Performance Max & YouTube campaigns: keyword strategy, conversion tracking, weekly optimization.",
    className: "md:col-span-1",
  },
  {
    icon: Share2,
    title: "Social Media Management",
    description: "KES 45,000/mo — Strategy, content calendar, posting, community management, monthly reporting across 3–4 platforms.",
    className: "md:col-span-1",
  },
  {
    icon: FileText,
    title: "SEO & Content",
    description: "KES 30,000/mo — Keyword research, on-page SEO, technical audits, blog content built to rank in Kenyan SERPs.",
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
            Transparent monthly retainers for brands in Nairobi & across Kenya. Custom packages available on request.
          </p>
        </div>

        <BentoGrid className="grid-cols-1 md:grid-cols-3 gap-4">
          {services.map((s, i) => (
            <ScrollReveal key={s.title} direction="up" delay={i * 0.1}>
              <BentoCard
                name={s.title}
                description={s.description}
                Icon={s.icon}
                href="/agency"
                cta="Learn more"
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
            <a href="/agency">
              Book Free Discovery Call
              <ArrowRight className="ml-2 h-4 w-4" />
            </a>
          </Button>
          <p className="mt-3 text-sm text-muted-foreground">
            See full packages on the{" "}
            <a href="/agency" className="text-primary hover:underline">Agency page</a>.
          </p>
        </div>
      </div>
    </section>
  );
}

export default ServicesPricing;
