import { ArrowRight, ClipboardList, TrendingUp } from "lucide-react";
import { Link } from "react-router-dom";
import { priceLabel, serviceAnchorId, serviceFilters, serviceHref, type Service } from "@/data/services";
import { localizePrice, useMarket } from "@/lib/market";
import { trackSpotlight } from "@/lib/spotlight";
import { ServiceImagePlaceholder } from "./ServiceImagePlaceholder";

export type ServiceTileSize = "large" | "tall" | "standard";

/** Grid footprint. Large spans two columns; the accent tile fills the odd slot on tablets. */
const SPAN: Record<ServiceTileSize, string> = {
  large: "md:col-span-2",
  tall: "",
  standard: "",
};

/** Image box per size. Standard tiles use a thumbnail beside the text on phones. */
const IMAGE: Record<ServiceTileSize, string> = {
  large: "aspect-[16/10] w-full",
  tall: "aspect-[16/10] w-full lg:aspect-[4/5]",
  standard: "m-4 mr-0 aspect-square w-24 shrink-0 self-start rounded-xl sm:w-36 md:m-0 md:aspect-[4/3] md:w-full md:rounded-none",
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
}

/**
 * One service in the bento grid. The whole tile is a single link: the CTA at
 * the bottom is stretched over the card, so there is one tab stop per tile.
 * A service with no image slot (the free audit) renders as the accent tile.
 */
export function ServiceTile({ service, size }: ServiceTileProps) {
  const accent = service.imageSlot === null;
  const large = size === "large";
  const quiet = accent ? "text-primary-foreground/85" : "text-muted-foreground";

  return (
    <li
      id={serviceAnchorId(service.slug)}
      onMouseMove={accent ? undefined : trackSpotlight}
      className={[
        "group relative flex scroll-mt-24 overflow-hidden rounded-2xl transition-all duration-300 motion-safe:hover:-translate-y-1",
        "has-[a:focus-visible]:ring-2 has-[a:focus-visible]:ring-ring has-[a:focus-visible]:ring-offset-2 has-[a:focus-visible]:ring-offset-background",
        accent
          ? "flex-col border border-primary bg-primary text-primary-foreground md:col-span-2 lg:col-span-1"
          : "spotlight surface-card hover:border-primary/40",
        size === "standard" && !accent ? "flex-row md:flex-col" : "flex-col",
        SPAN[size],
      ].join(" ")}
    >
      {service.imageSlot && <ServiceImagePlaceholder slot={service.imageSlot} className={IMAGE[size]} thumbOnMobile={size === "standard"} />}

      <div className={`flex min-w-0 flex-1 flex-col p-4 sm:p-5 ${large ? "lg:p-7" : ""}`}>
        {accent && (
          <span className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary-foreground/10 ring-1 ring-primary-foreground/20">
            <ClipboardList className="h-5 w-5" aria-hidden />
          </span>
        )}
        <p className={`mono-accent text-[11px] font-semibold uppercase tracking-[0.16em] ${accent ? quiet : "text-primary"}`}>
          {categoryLabel(service)}
        </p>
        <h3 className={`mt-1.5 font-display font-semibold tracking-tight ${large ? "text-2xl sm:text-3xl" : "text-xl"}`}>
          {service.tileName}
        </h3>
        <p className={`mt-2 leading-relaxed ${large ? "max-w-xl text-base" : "text-sm"} ${accent ? "" : "text-foreground/90"}`}>
          {service.outcome}
        </p>
        {service.whoFor && (
          <p className={`mt-2 text-sm leading-relaxed ${large ? "max-w-xl" : ""} ${quiet}`}>
            <span className={`font-medium ${accent ? "text-primary-foreground" : "text-foreground"}`}>For:</span> {service.whoFor}
          </p>
        )}
        {service.proof && (
          <p className="mt-4 flex items-start gap-2 rounded-lg bg-primary/[0.08] px-3 py-2 text-sm font-medium leading-snug">
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
    </li>
  );
}
