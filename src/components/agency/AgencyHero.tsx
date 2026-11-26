import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { HeroCollage, HeroCollageMobile } from "@/components/HeroCollage";
import { CALENDLY_URL, trustNumbers as stats } from "@/data/services";

function HeroProofPanel() {
  return (
    <div className="relative mx-auto w-full max-w-sm" style={{ perspective: 1200 }}>
      <div
        aria-hidden
        className="absolute -top-10 -right-6 font-serif italic text-[10rem] leading-none text-primary/10 select-none pointer-events-none"
      >
        &rdquo;
      </div>

      <div className="relative z-10 rounded-2xl border border-border/60 bg-card/95 p-8 sm:p-10 shadow-2xl">
        <div className="relative flex items-center gap-2 mb-7">
          <span className="h-px w-6 bg-primary" />
          <span className="text-[11px] uppercase tracking-[0.2em] text-muted-foreground font-medium">Trusted by brands across Kenya</span>
        </div>

        <div className="relative space-y-5">
          {stats.map((s, i) => (
            <div key={s.label} className={i > 0 ? "pt-5 border-t border-border/60" : ""}>
              <p className="text-4xl font-display font-bold text-foreground tracking-tight">
                {s.prefix}{s.value}{s.suffix}
              </p>
              <p className="mt-1 text-sm text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export function AgencyHero({ whatsappUrl, showAuditLink = false, tagline }: {
  whatsappUrl: string;
  showAuditLink?: boolean;
  tagline?: ReactNode;
}) {
  return (
    <section
      data-track-location="hero"
      className="relative w-full overflow-hidden bg-background"
    >
      {/* Editorial background — theme-aware, so it never fights the site's light/dark mode */}
      <div aria-hidden className="pointer-events-none absolute inset-x-0 top-0 h-[34rem] md:hidden"
        style={{ background: "radial-gradient(ellipse at top right, hsl(var(--primary) / 0.09), transparent 70%)" }} />
      <div aria-hidden className="pointer-events-none absolute inset-0 z-0 hidden overflow-hidden md:block">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,hsl(var(--primary)/.09),transparent_70%)]" />
      </div>
      <div className="absolute inset-0 z-[1] dot-grid pointer-events-none [mask-image:radial-gradient(ellipse_90%_70%_at_50%_0%,black_40%,transparent_100%)]" />

      <div className="relative z-10 mx-auto grid max-w-7xl items-center gap-12 px-4 pb-12 pt-10 sm:px-6 md:pb-20 md:pt-16 lg:grid-cols-2 lg:gap-16 lg:px-10 lg:py-28">
        <div className="text-left">
          <div className="mb-5 flex items-center gap-3 sm:mb-7">
            <span aria-hidden className="h-px w-6 shrink-0 bg-primary" />
            <span className="text-xs uppercase tracking-[0.25em] text-muted-foreground font-medium">JM Marketing · Nairobi, Kenya</span>
          </div>

          <h1
            className="text-4xl sm:text-5xl lg:text-[3.75rem] font-display font-semibold tracking-tight text-foreground max-w-xl leading-[1.08]"
          >
            More leads and sales for{" "}
            <span className="font-serif italic font-normal text-primary">Kenyan businesses</span>
          </h1>

          {tagline && <p className="mt-4 text-base font-semibold text-foreground sm:text-lg">{tagline}</p>}

          <p
            className="mt-4 max-w-md text-base leading-relaxed text-muted-foreground sm:mt-6 sm:text-lg"
          >
            JM Marketing is a founder-led digital marketing agency in Nairobi. You work directly with me, Joseph Maina, on paid ads, SEO and content.
          </p>

          <div
            className="mt-6 flex flex-col gap-3 sm:mt-10 sm:flex-row sm:gap-4"
          >
            <Button size="lg" className="w-full sm:w-auto rounded-full" asChild>
              <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">
                <Calendar className="h-5 w-5" aria-hidden /> Book a Free Strategy Call
              </a>
            </Button>
            <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full" asChild><Link to="/agency/pricing">
              View Pricing
            </Link></Button>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-5">
            <a href={whatsappUrl} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center text-sm font-medium text-primary hover:underline">Message me on WhatsApp</a>
            {showAuditLink && (
              <a href="#audit" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-primary underline-offset-4 hover:underline">
                Book a Free Audit <ArrowRight className="h-4 w-4" aria-hidden />
              </a>
            )}
            <a href="#customer-journey" className="inline-flex min-h-11 items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary">
              Explore the customer journey <ArrowRight className="h-4 w-4" aria-hidden />
            </a>
          </div>
          <HeroCollageMobile loading="lazy" />
        </div>

        <div className="hidden lg:block">
          <HeroCollage loading="lazy">
            <HeroProofPanel />
          </HeroCollage>
        </div>
      </div>
    </section>
  );
}
