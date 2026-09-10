import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";
import { ArrowRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollReveal } from "@/components/ScrollReveal";
import { SectionLabel } from "@/components/SectionLabel";

const proofPoints = [
  { value: 500, prefix: "KES ", suffix: "K+", label: "Ad budgets managed" },
  { value: 20, suffix: "+", label: "Campaigns launched" },
  { value: 3, suffix: "+", label: "Years experience" },
];

function Counter({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-50px" });
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const start = performance.now();
    const dur = 1200;
    let raf = 0;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setN(Math.floor(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);
  return <span ref={ref}>{prefix}{n}{suffix}</span>;
}

export function AgencyPromo() {
  return (
    <section id="agency-promo" className="scroll-mt-20 lg:scroll-mt-24 py-20 sm:py-28 relative overflow-hidden" aria-labelledby="agency-promo-heading">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <ScrollReveal>
          <div className="glass-thick rounded-3xl p-8 sm:p-12 lg:p-14 max-w-4xl mx-auto text-center">
            <SectionLabel>THE AGENCY</SectionLabel>
            <h2 id="agency-promo-heading" className="text-title-1 sm:text-large-title font-display mt-4 mb-4">
              Also Available: My Marketing Agency
            </h2>
            <p className="text-body sm:text-lg text-muted-foreground max-w-2xl mx-auto mb-10">
              Meta, Google and TikTok Ads managed end-to-end for Kenyan brands — strategy, creative, budget and reporting, handled by me directly.
            </p>

            <div className="grid grid-cols-3 gap-4 sm:gap-8 max-w-lg mx-auto mb-10">
              {proofPoints.map((p) => (
                <div key={p.label}>
                  <div className="text-title-2 font-display font-bold text-primary">
                    <Counter value={p.value} prefix={p.prefix} suffix={p.suffix} />
                  </div>
                  <p className="text-caption sm:text-sm text-muted-foreground mt-1">{p.label}</p>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button size="lg" asChild className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                <a href="/agency">
                  Explore the Agency <ArrowRight className="ml-2 h-4 w-4" />
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild className="rounded-full">
                <a href="/agency#booking">
                  <Calendar className="mr-2 h-4 w-4" /> Book a Free Call
                </a>
              </Button>
            </div>
          </div>
        </ScrollReveal>
      </div>
    </section>
  );
}
