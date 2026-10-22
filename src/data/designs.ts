import beautySquareJoannaK from "@/assets/design-beauty-square-joanna-k.webp";
import fuelGrind from "@/assets/design-fuel.webp";
import standardPurifier from "@/assets/design-standard.webp";
import powwaterApp from "@/assets/design-powwater-app.webp";
import weekendBonanza from "@/assets/design-weekend.webp";
import heavyLifting from "@/assets/design-heavy-lifting.webp";
import freeFilterCampaign from "@/assets/design-free-filter-campaign.webp";
import iclearPurity from "@/assets/design-iclear-purity.webp";
import iclearFreshLiving from "@/assets/design-iclear-fresh-living.webp";
import iclearBoxingDay from "@/assets/design-iclear-boxing-day.webp";
import iclearNewyear from "@/assets/design-iclear-newyear.webp";
import schoolAdmission from "@/assets/design-school-admission.webp";
import schoolInnovative from "@/assets/design-school-innovative.webp";
import schoolChristmas from "@/assets/design-school-christmas.webp";
import christmasNewyear from "@/assets/design-christmas-newyear.webp";
import waterPurifiers from "@/assets/design-water-purifiers.webp";
import waterJourney from "@/assets/design-water-journey.webp";
import tecno1 from "@/assets/design-tecno-1.webp";
import tecno2 from "@/assets/design-tecno-2.webp";
import tecno3 from "@/assets/design-tecno-3.webp";
import podcastCover from "@/assets/design-podcast-cover.webp";
import iclearFacebook from "@/assets/design-iclear-facebook.webp";
import mkush from "@/assets/design-mkush.webp";
import iclearNewMonth from "@/assets/design-iclear-new-month.webp";
import iclearOct from "@/assets/design-iclear-oct.webp";
import iclearMonday from "@/assets/design-iclear-monday.webp";
import iclearHomes from "@/assets/design-iclear-homes.webp";
import iclearDecember from "@/assets/design-iclear-december.webp";
import iclearParachute from "@/assets/design-iclear-parachute.webp";
import iclearFilter from "@/assets/design-iclear-filter.webp";
import iclearEngineered from "@/assets/design-iclear-engineered.webp";
import iclearNakuru from "@/assets/design-iclear-nakuru.webp";
import iclearFilterPromo from "@/assets/design-iclear-filter-promo.webp";

export const DESIGN_GROUPS = ["iClear", "PowWater", "TECNO", "Education", "More"] as const;
export type DesignGroup = (typeof DESIGN_GROUPS)[number];

export interface Design {
  title: string;
  image: string;
  description: string;
  group: DesignGroup;
}

/**
 * NEWEST FIRST. Add new work at the TOP of this list: the homepage preview and
 * the /work/design page both show designs in this order, and the first
 * LATEST_COUNT entries carry the "New" badge.
 */
export const designs: Design[] = [
  {
    title: "Beauty Square x Joanna K Teaser",
    image: beautySquareJoannaK,
    description: "Product launch countdown campaign design",
    group: "More",
  },
  {
    title: "Fuel Your Grind",
    image: fuelGrind,
    description: "iClear lifestyle hydration campaign",
    group: "iClear",
  },
  {
    title: "Standard Water Purifier",
    image: standardPurifier,
    description: "iClear 4-year anniversary product feature",
    group: "iClear",
  },
  {
    title: "Download PowWater Today",
    image: powwaterApp,
    description: "PowWater mobile app promo creative",
    group: "PowWater",
  },
  {
    title: "Weekend Basket Bonanza",
    image: weekendBonanza,
    description: "iClear weekend promotional campaign",
    group: "iClear",
  },
  {
    title: "We Handle The Heavy Lifting",
    image: heavyLifting,
    description: "PowWater bulk delivery campaign",
    group: "PowWater",
  },
  {
    title: "Free Filter Campaign",
    image: freeFilterCampaign,
    description: "Buy standard get free filter promotional campaign",
    group: "iClear",
  },
  {
    title: "Unmatched Purity",
    image: iclearPurity,
    description: "iClear effortless hydration campaign",
    group: "iClear",
  },
  {
    title: "Fresh Living",
    image: iclearFreshLiving,
    description: "Walk your way into healthy lifestyle",
    group: "iClear",
  },
  {
    title: "Happy Boxing Day",
    image: iclearBoxingDay,
    description: "Festive celebration promotional design",
    group: "iClear",
  },
  {
    title: "Happy New Year 2025",
    image: iclearNewyear,
    description: "New year celebration campaign",
    group: "iClear",
  },
  {
    title: "School Admission 2026",
    image: schoolAdmission,
    description: "NorthGate School enrollment campaign",
    group: "Education",
  },
  {
    title: "Innovative Learning",
    image: schoolInnovative,
    description: "Educational campaign design",
    group: "Education",
  },
  {
    title: "School Christmas Greeting",
    image: schoolChristmas,
    description: "Festive school greeting design",
    group: "Education",
  },
  {
    title: "Christmas & New Year",
    image: christmasNewyear,
    description: "Holiday season greeting card",
    group: "More",
  },
  {
    title: "iClear Water Purifiers Campaign",
    image: waterPurifiers,
    description: "Product showcase design with pricing tiers",
    group: "iClear",
  },
  {
    title: "iClear Brand Campaign",
    image: waterJourney,
    description: "Lifestyle marketing creative",
    group: "iClear",
  },
  {
    title: "TECNO x iClear Collaboration",
    image: tecno1,
    description: "Cross-brand promotional design",
    group: "TECNO",
  },
  {
    title: "TECNO Product Campaign",
    image: tecno2,
    description: "Digital marketing creative with call-to-action",
    group: "TECNO",
  },
  {
    title: "TECNO Mobile Promotion",
    image: tecno3,
    description: "E-commerce promotional design",
    group: "TECNO",
  },
  {
    title: "Convey with Caroline Podcast",
    image: podcastCover,
    description: "Podcast branding and cover art",
    group: "More",
  },
  {
    title: "iClear Water Facebook Campaign",
    image: iclearFacebook,
    description: "Social media header design for brand awareness",
    group: "iClear",
  },
  {
    title: "MKUSH Music Album Cover",
    image: mkush,
    description: "Hip-hop album artwork and branding",
    group: "More",
  },
  {
    title: "iClear New Month Campaign",
    image: iclearNewMonth,
    description: "Monthly engagement post design",
    group: "iClear",
  },
  {
    title: "iClear October Campaign",
    image: iclearOct,
    description: "Seasonal social media content",
    group: "iClear",
  },
  {
    title: "iClear Monday Motivation",
    image: iclearMonday,
    description: "Weekly engagement post series",
    group: "iClear",
  },
  {
    title: "iClear Built for Homes",
    image: iclearHomes,
    description: "Christmas promotional campaign",
    group: "iClear",
  },
  {
    title: "iClear Happy December",
    image: iclearDecember,
    description: "Festive new month celebration design",
    group: "iClear",
  },
  {
    title: "iClear Filter Delivery",
    image: iclearParachute,
    description: "Creative product visualization",
    group: "iClear",
  },
  {
    title: "iClear December Promo",
    image: iclearFilter,
    description: "Free filter promotional campaign",
    group: "iClear",
  },
  {
    title: "iClear Engineered for Home",
    image: iclearEngineered,
    description: "Holiday season product showcase design",
    group: "iClear",
  },
  {
    title: "iClear Nakuru Location",
    image: iclearNakuru,
    description: "City expansion promotional campaign",
    group: "iClear",
  },
  {
    title: "iClear Free Filter Promo",
    image: iclearFilterPromo,
    description: "Buy standard get free filter campaign",
    group: "iClear",
  },
];

/** How many of the newest designs get the "New" badge. */
export const LATEST_COUNT = 6;

/** How many designs the homepage preview shows before linking to the full page. */
export const HOME_PREVIEW_COUNT = 8;
