import duaraLogoStacked from "@/assets/branding/duara/logo-stacked.png";
import duaraLogoHorizontal from "@/assets/branding/duara/logo-horizontal.png";
import duaraLogoMark from "@/assets/branding/duara/logo-mark.png";
import duara01 from "@/assets/branding/duara/poster-01.webp";
import duara02 from "@/assets/branding/duara/poster-02.webp";
import duara03 from "@/assets/branding/duara/poster-03.webp";
import duara04 from "@/assets/branding/duara/poster-04.webp";
import duara05 from "@/assets/branding/duara/poster-05.webp";
import duara06 from "@/assets/branding/duara/poster-06.webp";
import duara07 from "@/assets/branding/duara/poster-07.webp";
import duara08 from "@/assets/branding/duara/poster-08.webp";
import duara09 from "@/assets/branding/duara/poster-09.webp";
import duara10 from "@/assets/branding/duara/poster-10.webp";
import duara11 from "@/assets/branding/duara/poster-11.webp";
import duara12 from "@/assets/branding/duara/poster-12.webp";
import duara13 from "@/assets/branding/duara/poster-13.webp";
import duara14 from "@/assets/branding/duara/poster-14.webp";
import duara15 from "@/assets/branding/duara/poster-15.webp";

export interface BrandColor {
  name: string;
  hex: string;
  /** What the colour is for in the system. */
  role: string;
  /** Share of a typical layout, used for the proportion bar. */
  share: number;
  /** Text colour that reads on this swatch. */
  on: string;
}

export interface BrandFont {
  name: string;
  role: string;
  /** CSS font-family stack. */
  family: string;
  weight: number;
  italic?: boolean;
  sample: string;
}

export interface BrandPost {
  title: string;
  image: string;
  template: string;
}

export interface Brand {
  slug: string;
  name: string;
  tagline: string;
  sector: string;
  year: string;
  scope: string[];
  brief: string;
  approach: string[];
  /** Google Fonts css2 query, loaded only on the brand page. */
  fontsHref: string;
  colors: {
    background: string;
    ink: string;
    primary: string;
    accent: string;
    highlight: string;
  };
  palette: BrandColor[];
  fonts: BrandFont[];
  /** Transparent PNGs; `mark` is the sunflower without the wordmark. */
  logos: { stacked: string; horizontal: string; mark: string };
  templates: { name: string; description: string }[];
  posts: BrandPost[];
  /** Poster used for the annotated "anatomy" breakdown, with callouts in % of the image. */
  anatomy: { image: string; callouts: { x: number; y: number; label: string; note: string }[] };
  contact: { phone: string; web: string; handle: string };
}

export const brands: Brand[] = [
  {
    slug: "duara-schools",
    name: "Duara Schools",
    tagline: "A warm, confident identity for a network of community microschools.",
    sector: "Early-years education",
    year: "2025",
    scope: ["Brand refresh", "Typography", "Colour system", "Social templates", "15+ posts"],
    brief:
      "Duara runs affordable community microschools in Kamirithu, Gathiga, Riruta and Kitengela. The school wanted a total revamp of its brand so its social media would look attractive to parents and be recognisable as Duara at a glance.",
    approach: [
      "Kept the dotted sunflower logo and built the palette out of its greens, yellows and oranges.",
      "Set one headline voice: heavy dark green, with a single italic orange phrase carrying the emotion.",
      "Designed a wave frame, pill button and contact strip that repeat on every post, so the feed reads as one family.",
      "Made three templates (Admissions, Parent Voices, Events) that the school can reuse for every campus.",
    ],
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,500;0,700;0,800;1,800&family=Lato:wght@400;700;900&family=Oswald:wght@600&display=swap",
    colors: {
      background: "#FDFAEE",
      ink: "#05321E",
      primary: "#035C40",
      accent: "#EE850B",
      highlight: "#F9C71D",
    },
    palette: [
      { name: "Chalk Cream", hex: "#FDFAEE", role: "Canvas for every post", share: 44, on: "#05321E" },
      { name: "Forest Ink", hex: "#05321E", role: "Headlines and body text", share: 10, on: "#FDFAEE" },
      { name: "Duara Green", hex: "#035C40", role: "Footer band and wave", share: 24, on: "#FDFAEE" },
      { name: "Sunflower", hex: "#F9C71D", role: "Buttons, icons, wave edge", share: 12, on: "#05321E" },
      { name: "Marigold", hex: "#EE850B", role: "The italic accent phrase", share: 7, on: "#05321E" },
      { name: "Earth", hex: "#6D3920", role: "Logo wordmark only", share: 3, on: "#FDFAEE" },
    ],
    fonts: [
      {
        name: "Plus Jakarta Sans ExtraBold",
        role: "Headlines",
        family: "'Plus Jakarta Sans', sans-serif",
        weight: 800,
        sample: "Teachers you",
      },
      {
        name: "Plus Jakarta Sans ExtraBold Italic",
        role: "Accent phrase",
        family: "'Plus Jakarta Sans', sans-serif",
        weight: 800,
        italic: true,
        sample: "can trust.",
      },
      {
        name: "Lato",
        role: "Subheads, quotes and contact details",
        family: "'Lato', sans-serif",
        weight: 700,
        sample: "Kind. Patient. Encouraging.",
      },
      {
        name: "Oswald SemiBold",
        role: "Event dates and times",
        family: "'Oswald', sans-serif",
        weight: 600,
        sample: "THURSDAY, 31 JULY",
      },
    ],
    logos: { stacked: duaraLogoStacked, horizontal: duaraLogoHorizontal, mark: duaraLogoMark },
    templates: [
      { name: "Admissions", description: "Headline, wave-framed photo, green footer with a pill button." },
      { name: "Parent Voices", description: "A real parent quote set big, framed by the logo bar and footer." },
      { name: "Events", description: "Date-led layouts for open days and celebrations." },
    ],
    posts: [
      { title: "Education for the world", image: duara01, template: "Admissions" },
      { title: "Come visit our school", image: duara02, template: "Admissions" },
      { title: "Quality education. Within reach.", image: duara03, template: "Admissions" },
      { title: "Teachers you can trust", image: duara04, template: "Admissions" },
      { title: "I feel at peace. I feel safe.", image: duara05, template: "Parent Voices" },
      { title: "My daughter comes home singing", image: duara06, template: "Parent Voices" },
      { title: "Tomorrow's problem-solvers start here", image: duara07, template: "Admissions" },
      { title: "Duara School Gathiga", image: duara08, template: "Admissions" },
      { title: "Community Day", image: duara09, template: "Events" },
      { title: "Little steps. Big milestones.", image: duara10, template: "Events" },
      { title: "A school your family can trust", image: duara11, template: "Admissions" },
      { title: "Big ideas begin here", image: duara12, template: "Admissions" },
      { title: "Intentional teachers. Inspired learning.", image: duara13, template: "Admissions" },
      { title: "A school that feels like home", image: duara14, template: "Admissions" },
      { title: "Meet the teachers. Discover Duara.", image: duara15, template: "Admissions" },
    ],
    anatomy: {
      image: duara04,
      callouts: [
        { x: 30, y: 7, label: "Logo", note: "Stacked lockup, always top left on cream." },
        { x: 68, y: 11, label: "Headline", note: "ExtraBold in Forest Ink, tight tracking." },
        { x: 53, y: 26, label: "Accent", note: "One italic Marigold phrase with a hand-drawn underline." },
        { x: 94, y: 14, label: "Doodle", note: "Line icons (book, bulb, cap) add a classroom feel." },
        { x: 93, y: 40, label: "Wave frame", note: "Sunflower edge over a Duara Green wave holds the photo." },
        { x: 58, y: 88, label: "Pill button", note: "Sunflower pill with a dark arrow: the call to action." },
        { x: 66, y: 96, label: "Contact strip", note: "Phone, web and handle, divided by thin rules." },
      ],
    },
    contact: { phone: "0758 013970", web: "duara.education", handle: "@duaraschools" },
  },
];

export const getBrand = (slug: string | undefined) => brands.find((b) => b.slug === slug);
