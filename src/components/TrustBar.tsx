import { useId } from "react";

type TrustBarStat = {
  value: string;
  heading: string;
  description: string;
};

type TrustBarProps = {
  stats: readonly [TrustBarStat, TrustBarStat];
};

const partnerBadge = {
  src: "/logo/shopify-partner.png",
  alt: "",
  width: 1920,
  height: 1080,
};
const badgePosition = "absolute left-[46.5%] top-[69.5%] w-[226%] max-w-none -translate-x-1/2 -translate-y-1/2";

export function TrustBar({ stats }: TrustBarProps) {
  const badgeFilterId = useId();
  const badgeFilter = `url("#${badgeFilterId}")`;

  return (
    <div className="relative left-1/2 w-screen -translate-x-1/2 bg-white py-14 text-foreground dark:bg-background">
      <ul className="mx-auto grid max-w-[1200px] divide-y divide-[#e5e5e5] px-4 dark:divide-border md:grid-cols-3 md:divide-x md:divide-y-0">
        <li className="flex flex-col items-center justify-center gap-3 pb-6 text-center md:px-3 md:pb-0">
          {/* Frame the badge within the original PNG's padded canvas. */}
          <div className="relative aspect-[6/1] w-full max-w-96 overflow-hidden">
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
          <p className="text-sm font-medium text-[#555] dark:text-muted-foreground">Official Shopify Partner</p>
        </li>
        {stats.map(({ value, heading, description }) => (
          <li key={heading} className="min-w-0 py-6 text-left last:pb-0 md:px-4 md:py-0 lg:px-6">
            <h2 className="text-2xl font-semibold leading-tight">
              <span className="mb-2 block text-[3.5rem] font-extrabold leading-none tracking-tight [font-variation-settings:'wght'_800] md:text-[clamp(2.75rem,6vw,4.5rem)]">
                {value}
              </span>{" "}
              {heading}
            </h2>
            <p className="mt-2 text-lg text-[#555] dark:text-muted-foreground">{description}</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
