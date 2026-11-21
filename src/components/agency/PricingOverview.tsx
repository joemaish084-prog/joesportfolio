import { AgencyPhoto } from "./AgencyPhoto";
import { ComparisonBars } from "./ComparisonBars";
import { agencyHeroPhotos } from "@/data/agencyPageMedia";
import { priceLabel, retainerPackages } from "@/data/services";
import { localizePrice, marketFee, type Market } from "@/lib/market";

export function PricingOverview({ market }: { market: Market }) {
  const rows = retainerPackages.map(({ name, price }) => ({
    label: name[0] + name.slice(1).toLowerCase(),
    value: marketFee(price.kes, market),
    display: localizePrice(priceLabel(price, { short: true }), market),
  }));

  return (
    <figure className="surface-card overflow-hidden">
      <div className="aspect-[2/1] overflow-hidden">
        <AgencyPhoto {...agencyHeroPhotos.pricing} sizes="(min-width: 1280px) 470px, (min-width: 1024px) 44vw, 100vw" priority />
      </div>
      <figcaption className="p-5 sm:p-6">
        <span className="block font-display text-lg font-semibold">Starting monthly management fees</span>
        <div className="mt-4"><ComparisonBars rows={rows} /></div>
        <p className="mt-4 border-t border-border/60 pt-3 text-sm text-muted-foreground">Advertising spend is billed separately.</p>
      </figcaption>
    </figure>
  );
}
