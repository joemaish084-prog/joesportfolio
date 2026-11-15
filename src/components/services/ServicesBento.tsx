import type { Service } from "@/data/services";
import { ServiceTile, type ServiceTileSize } from "./ServiceTile";

/** The two lead services get the larger tiles; everything else is standard. */
const SIZE: Record<string, ServiceTileSize> = { "meta-ads": "large", "google-ads": "tall" };

/** Services grid: 1 column on phones, 2 on tablets, 3 on desktop. */
export function ServicesBento({ services }: { services: Service[] }) {
  return (
    <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {services.map((service) => (
        <ServiceTile key={service.slug} service={service} size={SIZE[service.slug] ?? "standard"} />
      ))}
    </ul>
  );
}
