import iclearFacebook from "@/assets/design-iclear-facebook.webp";
import iclearFilterPromo from "@/assets/design-iclear-filter-promo.webp";
import freeFilterCampaign from "@/assets/design-free-filter-campaign.webp";
import iclearBoxingDay from "@/assets/design-iclear-boxing-day.webp";
import iclearHomes from "@/assets/design-iclear-homes.webp";
import waterPurifiers from "@/assets/design-water-purifiers.webp";
import iclearMonday from "@/assets/design-iclear-monday.webp";
import iclearNewMonth from "@/assets/design-iclear-new-month.webp";
import iclearEngineered from "@/assets/design-iclear-engineered.webp";
import iclearDishwash from "@/assets/short-iclear-dishwash.webp";
import majiNiUhai from "@/assets/short-maji-ni-uhai.webp";
import conveyPodcast from "@/assets/convey-podcast-thumbnail.webp";
import beautySquare from "@/assets/design-beauty-square-joanna-k.webp";
import communityEvent from "@/assets/agency/iclear-community-event.webp";
import handover from "@/assets/agency/iclear-handover.webp";
import pressDailyNation from "@/assets/press-daily-nation.webp";
import portrait from "@/assets/joseph-maina-portrait.webp";

/**
 * Real work shown on each service page. Every image is already published
 * elsewhere on the site and was checked by eye against its caption.
 * Captions describe the work only; results belong in the case study copy.
 */
export interface ServiceVisual {
  src: string;
  alt: string;
  caption: string;
  width: number;
  height: number;
}

export interface ServiceVisuals {
  /** Main hero image, plus an optional smaller image layered over its corner. */
  hero: ServiceVisual;
  accent?: ServiceVisual;
  /** Short label on the hero image, e.g. which client the work is from. */
  heroLabel: string;
  gallery?: { title: string; intro: string; items: ServiceVisual[] };
}

const img = {
  facebook: { src: iclearFacebook, alt: "iClear 'Water is Sweet' Facebook campaign banner", caption: "Facebook campaign banner for iClear Kenya", width: 1600, height: 703 },
  filterPromo: { src: iclearFilterPromo, alt: "iClear 'Buy standard, get a free filter' ad showing a family with water filters", caption: "'Buy standard, get a free filter' offer ad for iClear Kenya", width: 1400, height: 1750 },
  freeFilter: { src: freeFilterCampaign, alt: "iClear 'Get free filter' campaign creative with a man holding a filter cartridge", caption: "Free-filter offer creative for iClear Kenya", width: 1400, height: 1750 },
  boxingDay: { src: iclearBoxingDay, alt: "iClear Boxing Day creative with a gift-wrapped water purifier", caption: "Boxing Day seasonal creative for iClear Kenya", width: 1400, height: 1750 },
  homes: { src: iclearHomes, alt: "iClear 'Built for homes that don't compromise' creative with a man holding a purifier", caption: "Product creative for iClear Kenya", width: 1400, height: 1750 },
  purifiers: { src: waterPurifiers, alt: "iClear household water purifiers price list showing Standard, Premier and Desktop models", caption: "Product and price creative for iClear's purifier range", width: 1600, height: 2272 },
  monday: { src: iclearMonday, alt: "iClear 'Kill your glow' social post with a man laughing", caption: "Weekly social post for iClear Kenya", width: 1400, height: 1750 },
  newMonth: { src: iclearNewMonth, alt: "iClear 'It's a new month' social post with a smiling man in yellow", caption: "New-month social post for iClear Kenya", width: 1400, height: 1750 },
  engineered: { src: iclearEngineered, alt: "iClear 'Engineered for your home' product creative", caption: "Product launch creative for iClear Kenya", width: 1400, height: 1750 },
  dishwash: { src: iclearDishwash, alt: "Still from an iClear short-form installation video", caption: "Short-form installation video for iClear Kenya", width: 1600, height: 2134 },
  maji: { src: majiNiUhai, alt: "Still from the iClear 'Maji ni Uhai' short video, a presenter holding a purifier", caption: "'Maji ni Uhai' short-form video for iClear Kenya", width: 1400, height: 2489 },
  convey: { src: conveyPodcast, alt: "Convey with Caroline podcast cover artwork", caption: "Podcast cover for Convey Communications", width: 1400, height: 1400 },
  beautySquare: { src: beautySquare, alt: "Beauty Square 'Are you guys ready' launch teaser design", caption: "Launch teaser design for Beauty Square", width: 1080, height: 1350 },
  community: { src: communityEvent, alt: "iClear team with pupils at a school water initiative event", caption: "iClear community water initiative", width: 1100, height: 1100 },
  handover: { src: handover, alt: "iClear team handing over water purifiers to a family", caption: "iClear purifier handover, part of a community campaign", width: 900, height: 900 },
  press: { src: pressDailyNation, alt: "Daily Nation article 'The business of water: Firm rides on growing demand in Kenya'", caption: "Daily Nation coverage of iClear Kenya", width: 1901, height: 907 },
  portrait: { src: portrait, alt: "Joseph Maina, digital marketing specialist in Nairobi", caption: "Joseph Maina, digital marketing specialist in Nairobi", width: 900, height: 900 },
} satisfies Record<string, ServiceVisual>;

export const serviceVisuals: Record<string, ServiceVisuals> = {
  "meta-ads-management": {
    hero: img.filterPromo,
    accent: img.facebook,
    heroLabel: "Creative for iClear Kenya",
    gallery: {
      title: "Ad creative from real campaigns",
      intro: "A selection of Meta ad and social creative made for iClear Kenya. Tap any image to see it full size.",
      items: [img.facebook, img.freeFilter, img.boxingDay, img.homes],
    },
  },
  "google-ads-management": {
    hero: img.purifiers,
    accent: img.filterPromo,
    heroLabel: "Product creative for iClear Kenya",
    gallery: {
      title: "Product and display creative",
      intro: "Product, price and offer creative of the kind used in Display, Performance Max and Shopping campaigns. Tap any image to see it full size.",
      items: [img.purifiers, img.filterPromo, img.engineered],
    },
  },
  "seo-services-nairobi": {
    hero: img.beautySquare,
    accent: img.press,
    heroLabel: "Launch design for Beauty Square",
  },
  "social-media-management": {
    hero: img.monday,
    accent: img.maji,
    heroLabel: "Social content for iClear Kenya",
    gallery: {
      title: "Posts and short-form video",
      intro: "Social posts and video made for iClear Kenya. Tap any image to see it full size.",
      items: [img.monday, img.newMonth, img.engineered, img.dishwash, img.maji],
    },
  },
  "lead-generation": {
    hero: img.convey,
    heroLabel: "Convey Communications",
  },
  "digital-marketing-kenya": {
    hero: img.handover,
    accent: img.press,
    heroLabel: "iClear Kenya campaign",
    gallery: {
      title: "Online and on the ground",
      intro: "Campaign work for iClear Kenya, from ads to community events and national press. Tap any image to see it full size.",
      items: [img.facebook, img.community, img.handover, img.press],
    },
  },
  "digital-marketing-audit": {
    hero: img.portrait,
    heroLabel: "Reviewed by Joseph Maina",
  },
};

export const getServiceVisuals = (slug: string): ServiceVisuals | undefined => serviceVisuals[slug];
