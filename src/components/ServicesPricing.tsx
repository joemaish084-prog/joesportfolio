import { motion } from "framer-motion";
import { Target, Search, Share2, FileText, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    <section id="services" className="py-20 sm:py-32" aria-label="Digital Marketing Services & Pricing">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <div className="text-center mb-14 space-y-4">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-display font-bold">
            Services & <span className="text-gradient">Pricing</span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transparent monthly retainers for brands in Nairobi & across Kenya. Custom packages available on request.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {services.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="rounded-2xl border border-border bg-card p-6 flex flex-col hover:border-primary/40 hover:-translate-y-1 transition-all duration-300"
              >
                <div className="h-12 w-12 rounded-xl bg-gradient-orange flex items-center justify-center mb-4 shadow-[var(--shadow-orange-glow)]">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-display font-semibold mb-2">{s.title}</h3>
                <p className="text-sm text-muted-foreground flex-1">{s.description}</p>
                <div className="mt-5">
                  <p className="text-2xl font-display font-bold text-gradient">
                    {s.price}
                    <span className="text-xs font-medium text-muted-foreground ml-1">{s.unit}</span>
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

        <div className="mt-12 text-center">
          <Button asChild size="lg" className="shadow-elegant">
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
