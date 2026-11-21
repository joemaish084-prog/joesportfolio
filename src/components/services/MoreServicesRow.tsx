import { Link } from "react-router-dom";
import { AgencyPhoto } from "@/components/agency/AgencyPhoto";
import { serviceAnchorId, serviceHref, type Service } from "@/data/services";

/** Pricing links to these anchors, so each card keeps its service id. */
export function MoreServicesRow({ items }: { items: Service[] }) {
  return (
    <section className="mt-12" aria-labelledby="more-services-title">
      <h3 id="more-services-title" className="mb-4 font-display text-xl font-semibold sm:text-2xl">Also available</h3>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <li key={item.slug} id={serviceAnchorId(item.slug)} className="scroll-mt-24">
            <Link
              to={serviceHref(item)}
              className="surface-card group grid h-full grid-cols-[5rem_minmax(0,1fr)] items-center gap-3 p-3 transition-colors hover:border-primary/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:grid-cols-[6rem_minmax(0,1fr)] sm:gap-4"
            >
              <span className="aspect-square overflow-hidden rounded-lg">
                <AgencyPhoto name={item.slug} alt={item.imageAlt} sizes="(min-width: 640px) 96px, 80px" className="transition-transform duration-300 motion-safe:group-hover:scale-105" />
              </span>
              <span className="min-w-0">
                <span className="block font-display font-semibold text-foreground group-hover:text-primary">{item.tileName}</span>
                <span className="mt-1 block text-sm leading-snug text-muted-foreground">{item.scope}</span>
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
