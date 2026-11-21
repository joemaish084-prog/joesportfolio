import { ArrowRight, ClipboardList, TrendingUp } from "lucide-react";
import { forwardRef } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { priceLabel, serviceAnchorId, serviceFilters, serviceHref, type Service } from "@/data/services";
import { localizePrice, useMarket } from "@/lib/market";
import { trackSpotlight } from "@/lib/spotlight";
import { AgencyPhoto } from "@/components/agency/AgencyPhoto";

export type ServiceTileSize = "large" | "tall" | "standard";

/** Grid footprint. Large spans two columns; the accent tile fills the odd slot on tablets. */
const SPAN: Record<ServiceTileSize, string> = {
  large: "md:col-span-2",
  tall: "",
  standard: "",
};

/** Keep the photography visible at each breakpoint. */
const IMAGE: Record<ServiceTileSize, string> = {
  large: "aspect-[16/10] w-full",
  tall: "aspect-[16/10] w-full lg:aspect-[4/5]",
  standard: "aspect-[3/2] w-full",
};

/** Rendered width per size, for the `sizes` attribute. */
const SIZES: Record<ServiceTileSize, string> = {
  large: "(min-width: 1280px) 760px, (min-width: 1024px) 65vw, 100vw",
  tall: "(min-width: 1280px) 374px, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw",
  standard: "(min-width: 1280px) 374px, (min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw",
};

const categoryLabel = (service: Service) =>
  serviceFilters.find((f) => f.key === service.categories[0])?.label ?? "";

/** "From KES 40,000/month" -> qualifier, amount, period. Labels such as "Free for now" stay whole. */
function Price({ service, accent }: { service: Service; accent: boolean }) {
  const text = localizePrice(priceLabel(service.price), useMarket());
  const [, from, amount, per] = text.match(/^(From\s+)?(.*?)(\/\w+)?$/) ?? ["", "", text, ""];
  const quiet = accent ? "text-primary-foreground/80" : "text-muted-foreground";
  return (
    <p className="font-display leading-tight">
      {from && <span className={`block text-[11px] font-medium uppercase tracking-wider ${quiet}`}>From</span>}
      <span className="text-lg font-bold tabular-nums">{amount}</span>
      {per && <span className={`text-xs ${quiet}`}>{per}</span>}
    </p>
  );
}

interface ServiceTileProps {
  service: Service;
  size: ServiceTileSize;
  /** From `useReducedMotion`: no reflow or fade, tiles just appear. */
  reducedMotion?: boolean;
  /** A filter chip is active. The accent tile then keeps to one column, so it never strands a gap. */
  filtered?: boolean;
}

/**
 * One service in the bento grid. The whole tile is a single link: the CTA at
 * the bottom is stretched over the card, so there is one tab stop per tile.
 * The free audit renders as the accent tile.
 */
export const ServiceTile = forwardRef<HTMLLIElement, ServiceTileProps>(function ServiceTile({ service, size, reducedMotion = false, filtered = false }, ref) {
  const accent = service.slug === "digital-marketing-audit";
  const large = size === "large";
  const quiet = accent ? "text-primary-foreground/85" : "text-muted-foreground";

  return (
    <motion.li
      ref={ref}
      // "position" slides tiles to their new spot without stretching them when the size changes.
      layout={reducedMotion ? false : "position"}
      initial={reducedMotion ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={reducedMotion ? undefined : { opacity: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      id={serviceAnchorId(service.slug)}
      onMouseMove={accent ? undefined : trackSpotlight}
      className={[
        "group relative flex flex-col scroll-mt-24 overflow-hidden rounded-2xl transition-all duration-300 motion-safe:hover:-translate-y-1",
        "has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-ring has-[a:focus-visible]:ring-offset-2 has-[a:focus-visible]:ring-offset-background",
        accent
          ? `border border-primary bg-primary text-primary-foreground ${filtered ? "" : "md:col-span-2 lg:col-span-1"}`
          : "spotlight surface-card hover:border-primary/40",
        SPAN[size],
      ].join(" ")}
    >
      <div className={`relative overflow-hidden ${IMAGE[size]} ${accent && !filtered ? "md:max-lg:aspect-[3/1]" : ""}`}>
        <AgencyPhoto
          name={service.slug}
          alt={service.imageAlt}
          sizes={accent && !filtered ? SIZES.large : SIZES[size]}
          className="transition-transform duration-500 motion-safe:group-hover:scale-[1.04] motion-safe:group-focus-within:scale-[1.04]"
        />
      </div>

      <div className={`flex min-w-0 flex-1 flex-col p-4 sm:p-5 ${large ? "lg:p-7" : ""}`}>
        <div className="flex items-center gap-3">
          {accent && <ClipboardList className="h-6 w-6 shrink-0" aria-hidden />}
          <div className="min-w-0">
            <p className={`mono-accent text-[11px] font-semibold uppercase tracking-[0.16em] ${accent ? quiet : "text-primary"}`}>
              {categoryLabel(service)}
            </p>
            <h3 className={`mt-1 font-display font-semibold tracking-tight ${large ? "text-2xl sm:text-3xl" : accent ? "text-xl lg:text-2xl" : "text-xl"}`}>
              {service.tileName}
            </h3>
          </div>
        </div>
        <p className={`mt-3 leading-relaxed ${large ? "max-w-xl text-base" : accent ? "text-sm lg:text-base" : "text-sm"} ${accent ? "" : "text-foreground/90"}`}>
          {service.outcome}
        </p>
        {service.whoFor && (
          <p className={`mt-2 text-sm leading-relaxed ${large ? "max-w-xl" : ""} ${quiet}`}>
            <span className={`font-medium ${accent ? "text-primary-foreground" : "text-foreground"}`}>For:</span> {service.whoFor}
          </p>
        )}
        {service.proof && (
          // Fades in on hover or focus where a mouse is in use. Touch and reduced motion always see it.
          <p className="mt-4 flex items-start gap-2 rounded-lg bg-primary/[0.08] px-3 py-2 text-sm font-medium leading-snug transition-opacity duration-300 [@media(hover:hover)_and_(prefers-reduced-motion:no-preference)]:opacity-0 group-hover:opacity-100 group-focus-within:opacity-100">
            <TrendingUp className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden />
            {service.proof.line}
          </p>
        )}

        {/* Pinned to the bottom, so prices line up across a row. Only the large tile has room for one line. */}
        <div className="mt-auto pt-4">
          <div className={`flex border-t pt-3 ${large ? "flex-col sm:flex-row sm:items-end sm:justify-between sm:gap-6" : "flex-col"} ${accent ? "border-primary-foreground/20" : "border-border/60"}`}>
            <Price service={service} accent={accent} />
            <Link
              to={serviceHref(service)}
              className={`inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold after:absolute after:inset-0 focus-visible:outline-none ${large ? "" : "justify-between"} ${accent ? "" : "text-primary"}`}
            >
              {service.cta}
              <ArrowRight className="h-4 w-4 transition-transform motion-safe:group-hover:translate-x-1" aria-hidden />
            </Link>
          </div>
        </div>
      </div>
    </motion.li>
  );
});
