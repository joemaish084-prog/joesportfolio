import { useState } from "react";
import { AnimatePresence, useReducedMotion } from "framer-motion";
import { filterServices, serviceFilters, type Service, type ServiceCategory } from "@/data/services";
import { ServiceFilterChips } from "./ServiceFilterChips";
import { ServiceTile, type ServiceTileSize } from "./ServiceTile";

/** The two lead services get the larger tiles, but only in the unfiltered view. */
const SIZE: Record<string, ServiceTileSize> = { "meta-ads": "large", "google-ads": "tall" };

/** Services grid: 1 column on phones, 2 on tablets, 3 on desktop, with filter chips above. */
export function ServicesBento({ services }: { services: Service[] }) {
  const [filter, setFilter] = useState<ServiceCategory | "all">("all");
  const reduced = useReducedMotion() ?? false;
  const shown = filterServices(services, filter);

  return (
    <>
      <ServiceFilterChips categories={serviceFilters} value={filter} onChange={setFilter} />
      {/* Screen readers hear the new count when the grid changes. */}
      <p className="sr-only" role="status">
        Showing {shown.length} of {services.length} services
      </p>
      <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence mode="popLayout" initial={false}>
          {shown.map((service) => (
            <ServiceTile
              key={service.slug}
              service={service}
              size={filter === "all" ? SIZE[service.slug] ?? "standard" : "standard"}
              filtered={filter !== "all"}
              reducedMotion={reduced}
            />
          ))}
        </AnimatePresence>
      </ul>
    </>
  );
}
