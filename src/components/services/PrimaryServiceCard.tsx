import { motion } from "framer-motion";
import { ArrowRight, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { trackSpotlight } from "@/lib/spotlight";
import { CtaLink } from "./CtaLink";
import { ProofPanel } from "./ProofPanel";
import type { PrimaryService } from "./servicesContent";

/**
 * One of the two lead offers. The platform colour appears only in the small
 * badge dot; the name is always spelled out, so colour is never the only cue.
 */
export function PrimaryServiceCard({ service, index }: { service: PrimaryService; index: number }) {
  const Icon = service.icon;
  const headingId = `${service.anchorId}-title`;
  return (
    <motion.article
      id={service.anchorId}
      aria-labelledby={headingId}
      onMouseMove={trackSpotlight}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      className="spotlight surface-card group relative flex scroll-mt-24 flex-col p-6 transition-[border-color,transform] duration-300 hover:border-primary/40 motion-safe:hover:-translate-y-1 sm:p-8"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <Badge variant="outline" className="gap-2 rounded-full border-border/80 bg-background/60 px-3 py-1 text-xs font-medium">
            <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: service.indicator }} aria-hidden />
            {service.platformLabel}
          </Badge>
          <p className="mt-3 text-xs font-semibold uppercase tracking-[0.14em] text-primary">{service.eyebrow}</p>
        </div>
        <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-orange shadow-[var(--shadow-orange-glow)]">
          <Icon className="h-6 w-6 text-white" aria-hidden />
        </span>
      </div>

      <h3 id={headingId} className="mt-5 font-display text-3xl font-bold tracking-tight sm:text-4xl">{service.title}</h3>
      <p className="mt-3 text-lg font-medium leading-snug text-foreground">{service.short}</p>
      <p className="mt-3 leading-relaxed text-muted-foreground">{service.expanded}</p>

      <div className="mt-6">
        <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">Best for</h4>
        <ul className="mt-3 flex flex-wrap gap-2">
          {service.bestFor.map((item) => (
            <li key={item} className="rounded-full border border-border/70 bg-background/50 px-3 py-1.5 text-sm text-foreground/90">{item}</li>
          ))}
        </ul>
      </div>

      <div className="mt-6 border-t border-border/60 pt-6">
        <h4 className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">What is included</h4>
        <ul className="mt-3 grid gap-x-6 gap-y-2.5 sm:grid-cols-2">
          {service.included.map((item) => (
            <li key={item} className="flex items-start gap-2 text-sm leading-snug text-muted-foreground">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </div>

      <ul aria-label={`${service.title} focus areas`} className="mt-6 flex flex-wrap gap-1.5">
        {service.tags.map((tag) => (
          <li key={tag} className="rounded-md bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary">{tag}</li>
        ))}
      </ul>

      <div className="mt-6"><ProofPanel proof={service.proof} /></div>

      <div className="mt-auto flex flex-col gap-3 pt-7 sm:flex-row sm:items-center sm:justify-between">
        <CtaLink
          to={service.cta.to}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-primary px-6 text-sm font-semibold text-primary-foreground transition-[filter] hover:brightness-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
        >
          {service.cta.label}
          <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-1" aria-hidden />
        </CtaLink>
        <p className="text-sm text-muted-foreground">{service.price}</p>
      </div>
    </motion.article>
  );
}
