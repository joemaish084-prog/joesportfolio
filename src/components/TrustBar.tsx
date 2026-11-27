import { useId } from "react";
import { cn } from "@/lib/utils";

type TrustBarStat = {
  value: string;
  heading: string;
  description: string;
};

type TrustBarProps = {
  stats: readonly [TrustBarStat, TrustBarStat];
  className?: string;
};

const partnerBadge = {
  src: "/logo/shopify-partner.png",
  alt: "",
  width: 1920,
  height: 1080,
};
const badgePosition = "absolute left-[46.5%] top-[69.5%] w-[226%] max-w-none -translate-x-1/2 -translate-y-1/2";

export function TrustBar({ stats, className }: TrustBarProps) {
  const badgeFilterId = useId();
  const badgeFilter = `url("#${badgeFilterId}")`;

  return (
    <ul className={cn("mx-auto grid max-w-[1200px] divide-y divide-border py-4 text-foreground md:grid-cols-3 md:divide-x md:divide-y-0 md:py-6", className)}>
      <li className="flex flex-col items-center justify-center gap-2 pb-4 text-center md:px-4 md:pb-0">
        {/* Frame the badge within the original PNG's padded canvas. */}
        <div className="relative aspect-[6/1] w-full max-w-52 overflow-hidden md:max-w-56">
          <svg className="pointer-events-none absolute h-0 w-0" aria-hidden="true">
            <defs>
              <filter id={badgeFilterId} colorInterpolationFilters="sRGB">
                {/* The pink canvas has 16 more blue than green levels. Fade it out while keeping the bag's white and green pixels. */}
                <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 17 -17 0 1" />
              </filter>
            </defs>
          </svg>
          <img
            {...partnerBadge}
            className={`${badgePosition} dark:[clip-path:inset(0_62.75%_0_0)]`}
            style={{ filter: badgeFilter }}
          />
          {/* Lighten the lettering to the right of the green bag in dark mode. */}
          <img
            {...partnerBadge}
            className={`${badgePosition} hidden [clip-path:inset(0_0_0_37.25%)] dark:block`}
            style={{ filter: `${badgeFilter} brightness(0) invert(1)` }}
          />
        </div>
        <p className="text-xs font-medium text-muted-foreground">Official Shopify Partner</p>
      </li>
      {stats.map(({ value, heading, description }) => (
        <li key={heading} className="min-w-0 py-4 text-left last:pb-0 md:px-6 md:py-0 lg:px-8">
          <h2 className="text-base font-semibold leading-tight">
            <span className="mb-1.5 block font-display text-3xl font-semibold leading-none tracking-tight md:text-4xl xl:text-5xl">
              {value}
            </span>{" "}
            {heading}
          </h2>
          <p className="mt-1 max-w-[32ch] text-sm leading-relaxed text-muted-foreground">{description}</p>
        </li>
      ))}
    </ul>
  );
}
