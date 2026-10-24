import { ArrowRight, Calendar } from "lucide-react";
import { ShineBorder } from "@/components/ui/shine-border";
import { CtaLink } from "./CtaLink";
import { ctaContent } from "./servicesContent";

export function ServicesCTA() {
  return (
    <section aria-labelledby="services-cta-title" data-track-location="services-cta" className="relative mt-20 overflow-hidden rounded-3xl border border-primary/30 bg-card/60 p-8 text-center sm:mt-24 sm:p-14">
      <ShineBorder shineColor={["hsl(25 100% 50%)", "hsl(38 92% 50%)"]} borderWidth={1} duration={16} />
      <div aria-hidden className="pointer-events-none absolute left-1/2 top-0 h-48 w-96 -translate-x-1/2 rounded-full bg-primary/15 blur-[90px]" />
      <div className="relative">
        <h2 id="services-cta-title" className="mx-auto max-w-2xl text-balance font-display text-3xl font-bold tracking-tight sm:text-4xl">{ctaContent.heading}</h2>
        <p className="mx-auto mt-4 max-w-xl text-lg leading-relaxed text-muted-foreground">{ctaContent.body}</p>
        <div className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
          <CtaLink
            to={ctaContent.primary.to}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-7 text-base font-semibold text-primary-foreground transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Calendar className="h-5 w-5" aria-hidden />
            {ctaContent.primary.label}
          </CtaLink>
          <CtaLink
            to={ctaContent.secondary.to}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full border border-border bg-background/60 px-7 text-base font-semibold transition-colors hover:border-primary/50 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            {ctaContent.secondary.label}
            <ArrowRight className="h-5 w-5" aria-hidden />
          </CtaLink>
        </div>
      </div>
    </section>
  );
}
