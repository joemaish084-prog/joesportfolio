import { motion } from "framer-motion";
import { Target, Search, Share2, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BentoGrid } from "@/components/ui/bento-grid";
import { SectionLabel } from "@/components/SectionLabel";
import { cn } from "@/lib/utils";

const services = [
  {
    icon: Target,
    title: "Meta Ads",
    description: "Facebook & Instagram campaigns optimized for ROAS — creative, targeting, retargeting, A/B testing.",
    price: "KES 35,000",
    unit: "/mo + ad spend",
  },
  {
    icon: Search,
    title: "Google Ads",
    description: "Search, Performance Max & YouTube campaigns — keyword strategy, conversion tracking, weekly optimization.",
    price: "KES 40,000",
    unit: "/mo + ad spend",
  },
  {
    icon: Share2,
    title: "Social Media Management",
    description: "Strategy, content calendar, posting, community management, monthly reporting across 3–4 platforms.",
    price: "KES 45,000",
    unit: "/mo",
  },
  {
    icon: FileText,
    title: "SEO & Content",
    description: "Keyword research, on-page SEO, technical audits, blog content built to rank in Kenyan SERPs.",
    price: "KES 30,000",
    unit: "/mo",
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

        <BentoGrid className="grid-cols-1 md:grid-cols-3 auto-rows-fr gap-5">
          {services.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className={cn(
                  "glass hover:border-primary/40 hover-lift p-6 flex flex-col",
                  s.title === "Meta Ads" && "md:col-span-2"
                )}
              >
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <Icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-xl font-display font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground flex-1">{s.description}</p>
                <div className="mt-5">
                  <p className="text-title-2 font-display font-bold text-foreground">
                    {s.price}
                    <span className="text-xs font-medium text-muted-foreground ml-1">{s.unit}</span>
                  </p>
                </div>
              </motion.div>
            );
          })}
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
