/**
 * Font pairings for the public agency pages.
 *
 * Each page and each service gets its own display + accent + body trio, loaded
 * from Google Fonts only on the page that uses it. The arrangement of every
 * headline (overlaps, outlines, drop caps, spaced captions) lives in
 * `src/styles/type-pairs.css`, keyed by `data-type-pair`.
 *
 * To audition a different pairing on any page, open it with `?typelab` in the
 * URL: a switcher appears in the corner and the choice is kept for that tab.
 */

export type TypePairId =
  | "sync"
  | "growth"
  | "revenue"
  | "couture"
  | "stroke"
  | "fresca"
  | "sweet"
  | "journal"
  | "beauty"
  | "mono"
  | "pairing"
  | "screen"
  | "retro"
  | "focus"
  | "ledger";

export interface TypePair {
  id: TypePairId;
  /** Short name shown in the type lab. */
  name: string;
  /** The reference style it is modelled on. */
  inspiredBy: string;
  display: string;
  accent: string;
  body: string;
  /** Google Fonts css2 `family=` values. */
  families: string[];
}

export const TYPE_PAIRS: Record<TypePairId, TypePair> = {
  sync: {
    id: "sync",
    name: "Team Sync",
    inspiredBy: "Times New Roman Condensed & Akzidenz-Grotesk",
    display: "Instrument Serif",
    accent: "Inter Tight Black",
    body: "Inter",
    families: ["Instrument+Serif:ital@0;1", "Inter+Tight:wght@600;700;800;900"],
  },
  growth: {
    id: "growth",
    name: "2X Growth",
    inspiredBy: "2X Revenue Growth (heavy extended grotesk & Work Sans)",
    display: "Archivo Black Expanded",
    accent: "Archivo Black Expanded",
    body: "Work Sans",
    families: ["Archivo:wdth,wght@62..125,300..900", "Work+Sans:wght@400;500;600;700"],
  },
  revenue: {
    id: "revenue",
    name: "Net Revenue",
    inspiredBy: "Lavonia Classy & August",
    display: "Italianno",
    accent: "Antonio",
    body: "Inter",
    families: ["Italianno", "Antonio:wght@400;500;600;700"],
  },
  couture: {
    id: "couture",
    name: "Couture",
    inspiredBy: "Essonnes & Parlare",
    display: "Playfair Display Black Italic",
    accent: "Parisienne",
    body: "Manrope",
    families: ["Playfair+Display:ital,wght@0,700;0,800;1,800;1,900", "Parisienne", "Manrope:wght@400;500;600;700"],
  },
  stroke: {
    id: "stroke",
    name: "Stroke",
    inspiredBy: "Bebas Neue & Gelato Luxe",
    display: "Bebas Neue (outlined)",
    accent: "Lobster",
    body: "Barlow",
    families: ["Bebas+Neue", "Lobster", "Barlow:wght@400;500;600;700"],
  },
  fresca: {
    id: "fresca",
    name: "Fresca",
    inspiredBy: "Norman & Ebony Light",
    display: "Bodoni Moda",
    accent: "Josefin Sans Light",
    body: "Karla",
    families: ["Bodoni+Moda:ital,opsz,wght@0,6..96,400..900;1,6..96,400..900", "Josefin+Sans:wght@300;400;600", "Karla:wght@400;500;600;700"],
  },
  sweet: {
    id: "sweet",
    name: "Sweet",
    inspiredBy: "Fields & Proxima Soft",
    display: "Fraunces Soft Black",
    accent: "Nunito ExtraBold",
    body: "Nunito",
    families: ["Fraunces:opsz,wght,SOFT,WONK@9..144,400..900,0..100,0..1", "Nunito:wght@400;600;700;800;900"],
  },
  journal: {
    id: "journal",
    name: "Journal",
    inspiredBy: "Editorial serif & handwritten note",
    display: "DM Serif Display",
    accent: "Caveat",
    body: "Source Serif 4",
    families: ["DM+Serif+Display:ital@0;1", "Caveat:wght@600;700", "Source+Serif+4:opsz,wght@8..60,400;8..60,600;8..60,700"],
  },
  beauty: {
    id: "beauty",
    name: "Beauty",
    inspiredBy: "Bickham Script & Helvetica",
    display: "Archivo Expanded",
    accent: "Pinyon Script",
    body: "Archivo",
    families: ["Archivo:wdth,wght@62..125,300..900", "Pinyon+Script"],
  },
  mono: {
    id: "mono",
    name: "Mono.",
    inspiredBy: "Filmotype Keynote & Helvetica",
    display: "Yellowtail",
    accent: "Montserrat (spaced caps)",
    body: "Work Sans",
    families: ["Yellowtail", "Montserrat:wght@500;600;700;800", "Work+Sans:wght@400;500;600;700"],
  },
  pairing: {
    id: "pairing",
    name: "Pairing",
    inspiredBy: "Futura & Sloop",
    display: "Jost",
    accent: "Mrs Saint Delafield",
    body: "Jost",
    families: ["Jost:wght@400;500;600;700;800", "Mrs+Saint+Delafield"],
  },
  screen: {
    id: "screen",
    name: "Screen",
    inspiredBy: "Bookmania Bold Italic & Domus",
    display: "Sansita Swashed",
    accent: "Syne (spaced caps)",
    body: "Figtree",
    families: ["Sansita+Swashed:wght@700;800;900", "Syne:wght@600;700;800", "Figtree:wght@400;500;600;700"],
  },
  retro: {
    id: "retro",
    name: "Retro",
    inspiredBy: "Espiritu Regular & Espiritu Script",
    display: "Bricolage Grotesque",
    accent: "Kaushan Script",
    body: "Bricolage Grotesque",
    families: ["Bricolage+Grotesque:opsz,wght@12..96,400..800", "Kaushan+Script"],
  },
  focus: {
    id: "focus",
    name: "Focus",
    inspiredBy: "Bodoni Std & Angela Heart",
    display: "Abril Fatface",
    accent: "Pacifico",
    body: "Libre Franklin",
    families: ["Abril+Fatface", "Pacifico", "Libre+Franklin:wght@400;500;600;700"],
  },
  ledger: {
    id: "ledger",
    name: "Ledger",
    inspiredBy: "Editorial serif & typewriter mono",
    display: "Instrument Serif",
    accent: "IBM Plex Mono",
    body: "IBM Plex Sans",
    families: ["Instrument+Serif:ital@0;1", "IBM+Plex+Mono:wght@400;500;600", "IBM+Plex+Sans:wght@400;500;600;700"],
  },
};

export const TYPE_PAIR_IDS = Object.keys(TYPE_PAIRS) as TypePairId[];

export function typePairFontUrl(id: TypePairId): string {
  const families = TYPE_PAIRS[id].families.map((f) => `family=${f}`).join("&");
  return `https://fonts.googleapis.com/css2?${families}&display=swap`;
}

/** Which pairing each page uses, and where its headline splits into
 * the main words and the accent words. */
export interface PageTypeSetting {
  pair: TypePairId;
  /** The opening words of the headline that take the display face. */
  main?: string;
}

export const PAGE_TYPE_PAIRS = {
  services: { pair: "sync" },
  results: { pair: "growth", main: "The work behind" },
  pricing: { pair: "revenue", main: "Clear pricing," },
  contact: { pair: "sweet", main: "Let's talk" },
  blog: { pair: "journal", main: "Digital marketing," },
} satisfies Record<string, PageTypeSetting>;

export function pageTypePair(key: string): PageTypeSetting | undefined {
  return (PAGE_TYPE_PAIRS as Record<string, PageTypeSetting>)[key];
}

export const SERVICE_TYPE_PAIRS: Record<string, PageTypeSetting> = {
  "digital-marketing-kenya": { pair: "beauty", main: "Digital Marketing" },
  "meta-ads-management": { pair: "mono", main: "Meta Ads" },
  "google-ads-management": { pair: "pairing", main: "Google Ads" },
  "seo-services-nairobi": { pair: "screen", main: "SEO" },
  "social-media-management": { pair: "retro", main: "Social Media Management" },
  "lead-generation": { pair: "focus", main: "Lead Generation" },
  "digital-marketing-audit": { pair: "ledger", main: "Digital Marketing Audit" },
};

/** Splits a headline into [main, accent]. If `main` is not the opening of the
 * text, the whole headline is treated as main, so a copy edit never hides words. */
export function splitHeadline(text: string, main?: string): [string, string] {
  if (!main || !text.startsWith(main)) return [text, ""];
  return [main, text.slice(main.length).trim()];
}
