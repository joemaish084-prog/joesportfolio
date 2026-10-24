import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { trackSpotlight } from "@/lib/spotlight";
import { CtaLink } from "./CtaLink";
import type { SecondaryService } from "./servicesContent";

/** Deliberately lighter than the primary cards: no badge, checklist or proof. */
export function SecondaryServiceCard({ service, index }: { service: SecondaryService; index: number }) {
  const Icon = service.icon;
  return (
    <motion.article
      id={service.anchorId}
      onMouseMove={trackSpotlight}
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="spotlight surface-card group flex scroll-mt-24 flex-col p-5 transition-[border-color] duration-300 hover:border-primary/40"
    >
      <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 ring-1 ring-primary/20">
        <Icon className="h-5 w-5 text-primary" aria-hidden />
      </span>
      <h3 className="mt-4 font-display text-lg font-semibold tracking-tight">{service.title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{service.desc}</p>
      <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
        <span className="font-semibold uppercase tracking-[0.12em] text-foreground/80">Best for: </span>
        {service.bestFor}
      </p>
      <CtaLink
        to={service.link.to}
        className="mt-auto inline-flex min-h-11 items-center gap-1.5 pt-4 text-sm font-semibold text-primary underline-offset-4 hover:underline focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        {service.link.label}
        <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-1" aria-hidden />
      </CtaLink>
    </motion.article>
  );
}
