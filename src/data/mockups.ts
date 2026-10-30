import jmStationery from "@/assets/mockups/jm-stationery.jpg";
import jmStationeryThumb from "@/assets/mockups/jm-stationery-thumb.jpg";
import jmMug from "@/assets/mockups/jm-mug.jpg";
import jmMugThumb from "@/assets/mockups/jm-mug-thumb.jpg";
import jmApparel from "@/assets/mockups/jm-apparel.jpg";
import jmApparelThumb from "@/assets/mockups/jm-apparel-thumb.jpg";
import duaraFlyers from "@/assets/mockups/duara-flyers.jpg";
import duaraFlyersThumb from "@/assets/mockups/duara-flyers-thumb.jpg";
import iclearCards from "@/assets/mockups/iclear-cards.jpg";
import iclearCardsThumb from "@/assets/mockups/iclear-cards-thumb.jpg";
import sidiStationery from "@/assets/mockups/sidi-stationery.jpg";
import sidiStationeryThumb from "@/assets/mockups/sidi-stationery-thumb.jpg";

export const MOCKUP_CATEGORIES = ["Stationery", "Apparel", "Drinkware"] as const;
export type MockupCategory = (typeof MOCKUP_CATEGORIES)[number];

export interface Mockup {
  id: string;
  title: string;
  brand: string;
  brandSlug: string;
  category: MockupCategory;
  description: string;
  alt: string;
  image: string;
  thumb: string;
  accent: string;
  kitHref?: string;
}

// Concept applications of the portfolio identities, not manufactured client deliverables.
// Keep full images separate from thumbnails so grids don't download lightbox assets.
export const mockups: Mockup[] = [
  {
    id: "jm-stationery", title: "A signature worth keeping.", brand: "JM Marketing", brandSlug: "jm-marketing",
    category: "Stationery", description: "The orange signature, carried across textured black cards and an ivory presentation folder.",
    alt: "JM Marketing orange monogram on black business cards and an ivory folder on dark stone",
    image: jmStationery, thumb: jmStationeryThumb, accent: "#FF6B00",
  },
  {
    id: "duara-flyers", title: "A little room to grow.", brand: "Duara Schools", brandSlug: "duara-schools",
    category: "Stationery", description: "Duara's warm greens, sunflower accents and flowing shapes translated into a printed flyer collection.",
    alt: "Duara Schools cream and green printed flyers with sunflower yellow details and leafy shadows",
    image: duaraFlyers, thumb: duaraFlyersThumb, accent: "#035C40", kitHref: "/work/branding/duara-schools",
  },
  {
    id: "jm-apparel", title: "Wear the signature.", brand: "JM Marketing", brandSlug: "jm-marketing",
    category: "Apparel", description: "Black cotton, orange embroidery. A hoodie and cap built around the JM signature.",
    alt: "Black JM Marketing hoodie and cap with orange embroidered circular monograms",
    image: jmApparel, thumb: jmApparelThumb, accent: "#FF6B00",
  },
  {
    id: "iclear-cards", title: "Clarity in every detail.", brand: "iClear", brandSlug: "iclear",
    category: "Stationery", description: "Aqua, deep blue and the water-drop mark give a pair of promotional cards a clean, recognisable finish.",
    alt: "Floating navy and white iClear promotional cards featuring the aqua water-drop logo",
    image: iclearCards, thumb: iclearCardsThumb, accent: "#0653B1", kitHref: "/work/branding/iclear",
  },
  {
    id: "jm-mug", title: "Good ideas start here.", brand: "JM Marketing", brandSlug: "jm-marketing",
    category: "Drinkware", description: "The JM monogram on matte black ceramic, with an orange interior and a warm studio setting.",
    alt: "Matte black JM Marketing mug with orange monogram and interior on an ivory studio plinth",
    image: jmMug, thumb: jmMugThumb, accent: "#FF6B00",
  },
  {
    id: "sidi-stationery", title: "A story you can hold.", brand: "Sidi Safari", brandSlug: "sidi-safari",
    category: "Stationery", description: "Navy, blush and gold bring the creator's media kit identity onto tactile printed covers and cards.",
    alt: "Sidi Safari navy and cream media kit covers and blush business card with gold wordmark details",
    image: sidiStationery, thumb: sidiStationeryThumb, accent: "#8D6B24", kitHref: "/work/branding/sidi-safari",
  },
];

export const mockupBrands = Array.from(new Map(mockups.map((item) => [item.brandSlug, item.brand])).entries())
  .map(([slug, name]) => ({ slug, name }));
