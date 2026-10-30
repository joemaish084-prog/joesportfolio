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
import duaraLogo from "@/assets/branding/duara/logo-horizontal.webp";
import iclearLogo from "@/assets/branding/iclear/logo-horizontal.webp";
import iclearWhiteLogo from "@/assets/branding/iclear/logo-horizontal-white.webp";
import sidiLogo from "@/assets/branding/sidi/logo-horizontal.webp";
import jmCap from "@/assets/mockups/jm-cap.jpg";
import jmCapThumb from "@/assets/mockups/jm-cap-thumb.jpg";
import jmHoodie from "@/assets/mockups/jm-hoodie.jpg";
import jmHoodieThumb from "@/assets/mockups/jm-hoodie-thumb.jpg";
import jmTote from "@/assets/mockups/jm-tote.jpg";
import jmToteThumb from "@/assets/mockups/jm-tote-thumb.jpg";
import jmBottle from "@/assets/mockups/jm-bottle.jpg";
import jmBottleThumb from "@/assets/mockups/jm-bottle-thumb.jpg";
import duaraMerch from "@/assets/mockups/duara-merch.jpg";
import duaraMerchThumb from "@/assets/mockups/duara-merch-thumb.jpg";
import duaraMug from "@/assets/mockups/duara-mug.jpg";
import duaraMugThumb from "@/assets/mockups/duara-mug-thumb.jpg";
import iclearBottle from "@/assets/mockups/iclear-bottle.jpg";
import iclearBottleThumb from "@/assets/mockups/iclear-bottle-thumb.jpg";
import iclearTote from "@/assets/mockups/iclear-tote.jpg";
import iclearToteThumb from "@/assets/mockups/iclear-tote-thumb.jpg";
import sidiTote from "@/assets/mockups/sidi-tote.jpg";
import sidiToteThumb from "@/assets/mockups/sidi-tote-thumb.jpg";
import sidiMug from "@/assets/mockups/sidi-mug.jpg";
import sidiMugThumb from "@/assets/mockups/sidi-mug-thumb.jpg";

export const MOCKUP_CATEGORIES = ["Stationery", "Apparel", "Drinkware", "Bags", "Kits"] as const;
export type MockupCategory = (typeof MOCKUP_CATEGORIES)[number];

export interface MockupModel {
  kind: "mug" | "bottle" | "card";
  logo: string;
  logoMode?: "jm-outline";
  body: string;
  accent: string;
  handle?: string;
}

const jmModel = (kind: MockupModel["kind"]): MockupModel => ({ kind, logo: "/logo/outline.png", logoMode: "jm-outline", body: "#191919", accent: "#ff6b00" });

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
  model?: MockupModel;
}

// Concept applications of the portfolio identities, not manufactured client deliverables.
// Keep full images separate from thumbnails so grids don't download lightbox assets.
export const mockups: Mockup[] = [
  {
    id: "jm-stationery", title: "A signature worth keeping.", brand: "JM Marketing", brandSlug: "jm-marketing",
    category: "Stationery", description: "The orange signature, carried across textured black cards and an ivory presentation folder.",
    alt: "JM Marketing orange monogram on black business cards and an ivory folder on dark stone",
    image: jmStationery, thumb: jmStationeryThumb, accent: "#FF6B00",
    model: jmModel("card"),
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
    model: { kind: "card", logo: iclearWhiteLogo, body: "#022967", accent: "#00dcc3" },
  },
  {
    id: "jm-mug", title: "Good ideas start here.", brand: "JM Marketing", brandSlug: "jm-marketing",
    category: "Drinkware", description: "The JM monogram on matte black ceramic, with an orange interior and a warm studio setting.",
    alt: "Matte black JM Marketing mug with orange monogram and interior on an ivory studio plinth",
    image: jmMug, thumb: jmMugThumb, accent: "#FF6B00",
    model: jmModel("mug"),
  },
  {
    id: "sidi-stationery", title: "A story you can hold.", brand: "Sidi Safari", brandSlug: "sidi-safari",
    category: "Stationery", description: "Navy, blush and gold bring the creator's media kit identity onto tactile printed covers and cards.",
    alt: "Sidi Safari navy and cream media kit covers and blush business card with gold wordmark details",
    image: sidiStationery, thumb: sidiStationeryThumb, accent: "#8D6B24", kitHref: "/work/branding/sidi-safari",
    model: { kind: "card", logo: sidiLogo, body: "#ece4d6", accent: "#c9a24a" },
  },
  {
    id: "jm-cap", title: "A mark above the rest.", brand: "JM Marketing", brandSlug: "jm-marketing", category: "Apparel",
    description: "A closer look at the JM cap: orange signature embroidery, black cotton and a precise stitched finish.",
    alt: "Black JM Marketing baseball cap with orange monogram embroidery and visor stitching on a stone plinth",
    image: jmCap, thumb: jmCapThumb, accent: "#FF6B00",
  },
  {
    id: "jm-hoodie", title: "Comfort, with character.", brand: "JM Marketing", brandSlug: "jm-marketing", category: "Apparel",
    description: "The signature hoodie on its own, with a small orange chest mark and a heavyweight cotton finish.",
    alt: "Individual black JM Marketing hoodie with an orange chest signature against a warm grey studio backdrop",
    image: jmHoodie, thumb: jmHoodieThumb, accent: "#FF6B00",
  },
  {
    id: "jm-tote", title: "Take the brand with you.", brand: "JM Marketing", brandSlug: "jm-marketing", category: "Bags",
    description: "A bold signature on black canvas, turning a simple carryall into an everyday brand impression.",
    alt: "Black canvas JM Marketing tote bag with a large orange circular signature and relaxed handles",
    image: jmTote, thumb: jmToteThumb, accent: "#FF6B00",
  },
  {
    id: "jm-bottle", title: "Keep the ideas flowing.", brand: "JM Marketing", brandSlug: "jm-marketing", category: "Drinkware",
    description: "A reusable bottle concept with a matte black body, orange signature and matching base detail.",
    alt: "Matte black JM Marketing reusable bottle with orange circular logo and orange base ring",
    image: jmBottle, thumb: jmBottleThumb, accent: "#FF6B00", model: jmModel("bottle"),
  },
  {
    id: "duara-merch", title: "Ready for a new school day.", brand: "Duara Schools", brandSlug: "duara-schools", category: "Kits",
    description: "A backpack, cap and tote collection carrying Duara's sunflower identity across school-day essentials.",
    alt: "Duara Schools forest green backpack, cap and cream tote featuring the dotted sunflower logo",
    image: duaraMerch, thumb: duaraMerchThumb, accent: "#035C40", kitHref: "/work/branding/duara-schools",
  },
  {
    id: "duara-mug", title: "A warm welcome, every day.", brand: "Duara Schools", brandSlug: "duara-schools", category: "Drinkware",
    description: "A cream and forest green mug brings the Duara identity into the staffroom and everyday moments.",
    alt: "Cream Duara Schools mug with forest green interior and handle beside a branded notebook",
    image: duaraMug, thumb: duaraMugThumb, accent: "#035C40", kitHref: "/work/branding/duara-schools",
    model: { kind: "mug", logo: duaraLogo, body: "#fdfaee", accent: "#035c40", handle: "#035c40" },
  },
  {
    id: "iclear-bottle", title: "Fresh thinking, on the move.", brand: "iClear", brandSlug: "iclear", category: "Drinkware",
    description: "The aqua drop and navy wordmark on a reusable bottle. An everyday merchandise concept for iClear.",
    alt: "White iClear reusable water bottle with navy cap and aqua water-drop logo on a pale blue podium",
    image: iclearBottle, thumb: iclearBottleThumb, accent: "#0653B1", kitHref: "/work/branding/iclear",
    model: { kind: "bottle", logo: iclearLogo, body: "#f5f6fa", accent: "#022967" },
  },
  {
    id: "iclear-tote", title: "A clearer kind of carryall.", brand: "iClear", brandSlug: "iclear", category: "Bags",
    description: "A navy tote with aqua detailing translates the iClear colour system into campaign merchandise.",
    alt: "Navy iClear canvas tote with aqua side panel and branded campaign leaflet",
    image: iclearTote, thumb: iclearToteThumb, accent: "#0653B1", kitHref: "/work/branding/iclear",
  },
  {
    id: "sidi-tote", title: "Stories, carried along.", brand: "Sidi Safari", brandSlug: "sidi-safari", category: "Bags",
    description: "The navy and gold wordmark on warm cream canvas, finished with navy handles and a blush accent.",
    alt: "Cream Sidi Safari canvas tote with navy handles and navy and gold wordmark",
    image: sidiTote, thumb: sidiToteThumb, accent: "#8D6B24", kitHref: "/work/branding/sidi-safari",
  },
  {
    id: "sidi-mug", title: "Pause for a good story.", brand: "Sidi Safari", brandSlug: "sidi-safari", category: "Drinkware",
    description: "An ivory and navy mug, paired with blush stationery, carries the creator's identity into a quieter setting.",
    alt: "Ivory Sidi Safari mug with navy interior and gold wordmark beside a blush notebook",
    image: sidiMug, thumb: sidiMugThumb, accent: "#8D6B24", kitHref: "/work/branding/sidi-safari",
    model: { kind: "mug", logo: sidiLogo, body: "#f5eee2", accent: "#1f2940", handle: "#1f2940" },
  },
];

export const mockupBrands = Array.from(new Map(mockups.map((item) => [item.brandSlug, item.brand])).entries())
  .map(([slug, name]) => ({ slug, name }));
