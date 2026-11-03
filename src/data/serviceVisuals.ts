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
  /** Photo beside the "What's included" list. */
  included?: ServiceVisual;
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

/**
 * Unsplash stock photos. Each was viewed before use, because several existing
 * blog descriptions turned out not to match their photos. Captions describe
 * only what is in the photo and never present it as client work.
 */
const unsplash = (id: string, alt: string, caption: string, width = 1600, height = 1067): ServiceVisual => ({
  src: `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1600&q=80`,
  alt,
  caption,
  width,
  height,
});

const stock = {
  facebookApp: unsplash("photo-1675352162363-ac40c3bb8265", "Smartphone screen showing the Facebook app in the app store", "Facebook and Instagram advertising"),
  googleSearch: unsplash("photo-1586125674857-4eb86880905d", "Google search home page on a computer screen", "Search advertising on Google"),
  nairobiSkyline: unsplash("photo-1741991110666-88115e724741", "Nairobi city skyline with high-rise buildings under a bright sky", "Local search for Nairobi businesses"),
  nairobiStreet: unsplash("photo-1611144727915-ef30a08aaeb3", "High-rise buildings above a busy Nairobi street", "Businesses competing for attention in Nairobi"),
  nairobiExpressway: unsplash("photo-1669127300649-940337f1487e", "The Nairobi Expressway and city skyline in Westlands", "Marketing for businesses across Nairobi and Kenya"),
  filming: unsplash("photo-1758521540269-58fe43602d39", "Woman sitting on the floor filming herself with a camera on a tripod", "Short-form video content"),
  whatsapp: unsplash("photo-1754331732644-f7b381eccd9f", "Hand holding a phone showing a WhatsApp screen", "Enquiries arriving on WhatsApp"),
  chat: unsplash("photo-1519069060891-f8c50519bf39", "Hand holding a smartphone with a chat open on the screen", "An enquiry arriving in the chat"),
  phoneCall: unsplash("photo-1758876204260-bdb299fa4374", "Man talking on the phone at a desk", "A lead followed up by phone"),
  handshake: unsplash("photo-1758520144427-ddb02ac74e9d", "Two women shaking hands across a desk in an office", "A lead that turns into a customer"),
  dashboards: unsplash("photo-1551288049-bebda4e38f71", "Analytics dashboard with charts and graphs on a monitor", "Tracking and analytics"),
  barCharts: unsplash("photo-1746014601017-4e515ef51722", "Laptop on a wooden table showing bar charts, with a cup of coffee beside it", "Ad account performance"),
  laptopStats: unsplash("photo-1460925895917-afdab827c52f", "Laptop screen showing statistics and charts on a glass-top table", "Website and search visibility"),
  writing: unsplash("photo-1450101499163-c8848c66ca85", "Person writing notes on paper with a pen", "Findings written up in plain language"),
  checklist: unsplash("photo-1693045181229-3eddc1a2e242", "Printed checklist on a clipboard with pencils beside it", "A prioritised list of fixes"),
  meeting: unsplash("photo-1758873271772-6bbc792c1514", "Two colleagues talking across a table with a laptop in an office", "It starts with a free strategy call"),
};

/** Photo beside the shared five-step process on every service page. */
export const PROCESS_VISUAL = stock.meeting;

export const serviceVisuals: Record<string, ServiceVisuals> = {
  "meta-ads-management": {
    included: stock.facebookApp,
    hero: img.filterPromo,
    accent: img.facebook,
    heroLabel: "Creative for iClear Kenya",
    gallery: {
      title: "Ad creative from real campaigns",
      intro: "A selection of Meta ad and social creative made for iClear Kenya. Tap any image to see it full size.",
      items: [img.freeFilter, img.boxingDay, img.homes, img.newMonth],
    },
  },
  "google-ads-management": {
    included: stock.googleSearch,
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
    included: stock.nairobiSkyline,
    hero: img.beautySquare,
    accent: img.press,
    heroLabel: "Launch design for Beauty Square",
    gallery: {
      title: "Getting found in Nairobi",
      intro: "Local search, a strong Google Business Profile and earned press coverage all help a business get found. Tap any image to see it full size.",
      items: [stock.nairobiStreet, stock.googleSearch, img.beautySquare, stock.laptopStats],
    },
  },
  "social-media-management": {
    included: stock.filming,
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
    included: stock.whatsapp,
    hero: img.convey,
    heroLabel: "Convey Communications",
    gallery: {
      title: "From click to conversation",
      intro: "A lead campaign only works if the enquiry reaches someone who answers it. Tap any image to see it full size.",
      items: [stock.chat, stock.phoneCall, stock.handshake, img.convey],
    },
  },
  "digital-marketing-kenya": {
    included: stock.nairobiExpressway,
    hero: img.handover,
    accent: img.press,
    heroLabel: "iClear Kenya campaign",
    gallery: {
      title: "Online and on the ground",
      intro: "Campaign work for iClear Kenya, from ads to community events and national press. Tap any image to see it full size.",
      items: [img.community, img.handover, img.freeFilter, img.newMonth],
    },
  },
  "digital-marketing-audit": {
    included: stock.dashboards,
    hero: img.portrait,
    heroLabel: "Joseph Maina, Nairobi",
    gallery: {
      title: "What the audit looks at",
      intro: "The audit reviews your ads, website, search presence and tracking, then sets out what to fix first. Tap any image to see it full size.",
      items: [stock.barCharts, stock.laptopStats, stock.writing, stock.checklist],
    },
  },
};

export const getServiceVisuals = (slug: string): ServiceVisuals | undefined => serviceVisuals[slug];
