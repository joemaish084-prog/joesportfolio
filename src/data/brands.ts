/**
 * Brand identity case studies shown at /work/branding.
 *
 * Images live in src/assets/branding/<folder>/ and are picked up by the glob below:
 *   logo-*.webp                       transparent logo files
 *   poster-NN.webp                    1080px, only for the lightbox
 *   poster-NN-thumb.webp              540px, for grids and cards
 *   poster-NN-mini.webp               240px, for tiny tiles like the phone mockup
 * Visual pieces that differ per brand (elements, mockups, rules) live in
 * src/components/branding/kits/.
 */
const assets = import.meta.glob<string>("/src/assets/branding/*/*.webp", { eager: true, import: "default" });

function asset(folder: string, file: string) {
  const url = assets[`/src/assets/branding/${folder}/${file}.webp`];
  if (!url) throw new Error(`Missing brand asset: ${folder}/${file}.webp`);
  return url;
}

function post(folder: string, n: number, title: string, template: string): BrandPost {
  const base = `poster-${String(n).padStart(2, "0")}`;
  return {
    title,
    template,
    image: asset(folder, base),
    thumb: asset(folder, `${base}-thumb`),
    mini: asset(folder, `${base}-mini`),
  };
}

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
  /** Sample colour; defaults to the page ink. */
  color?: string;
  sample: string;
}

export interface BrandPost {
  title: string;
  /** Full size (1080px), only for the lightbox. */
  image: string;
  /** 540px, for grids and cards. */
  thumb: string;
  /** 240px, for tiny tiles like the phone mockup. */
  mini: string;
  template: string;
}

/** The page theme. Every brand book is painted in its own brand's colours. */
export interface BrandTheme {
  background: string;
  /** Cards sitting on the background. */
  surface: string;
  ink: string;
  primary: string;
  onPrimary: string;
  accent: string;
  onAccent: string;
  highlight: string;
  onHighlight: string;
  /** Small uppercase chapter labels. */
  label: string;
}

/** How the brand sets a two-part headline: a main line plus one accent phrase. */
export interface HeadlineStyle {
  lineFont: string;
  lineWeight: number;
  lineColor: string;
  accentFont: string;
  accentWeight: number;
  accentItalic: boolean;
  /** A colour, or a CSS gradient painted into the text. */
  accentPaint: string;
  /** Colour of the hand-drawn underline, if the brand uses one. */
  underline?: string;
  tracking: string;
  /** Background of the "try the headline" panel. */
  panel: string;
  sample: { line: string; accent: string };
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
  type: { display: string; displayWeight: number; displayTracking: string; body: string };
  colors: BrandTheme;
  palette: BrandColor[];
  fonts: BrandFont[];
  headline: HeadlineStyle;
  /** Page cover: the name set in the brand's headline style, and the logo on a disc. */
  cover: { line: string; accent: string; accentPaint: string; disc: string; logo: "color" | "white" };
  logos: { stacked: string; white: string; horizontal: string; horizontalWhite: string; mark: string };
  /** Background options for the interactive logo viewer. */
  logoStages: { label: string; bg: string; logo: "color" | "white"; filter?: string }[];
  /** Copy for each chapter of the brand book. */
  book: {
    logo: { title: string; intro: string; clearSpace: string };
    colour: { title: string; intro: string };
    type: { title: string; intro: string };
    elements: { title: string; intro: string };
    anatomy: { intro: string };
    templates: { title: string; intro: string };
    mockups: { title: string; intro: string };
    rules: { intro: string };
  };
  templates: { name: string; description: string }[];
  posts: BrandPost[];
  /** Poster used for the annotated "anatomy" breakdown, with callouts in % of the image. */
  anatomy: { image: string; callouts: { x: number; y: number; label: string; note: string }[] };
  instagram: { bio: string[]; avatarBg: string; avatarLogo: "color" | "white" };
  /** Phone is optional: a creator's personal number isn't republished here. */
  contact: { phone?: string; web: string; handle: string };
}

const duaraPosts = [
  post("duara", 1, "Education for the world", "Admissions"),
  post("duara", 2, "Come visit our school", "Admissions"),
  post("duara", 3, "Quality education. Within reach.", "Admissions"),
  post("duara", 4, "Teachers you can trust", "Admissions"),
  post("duara", 5, "I feel at peace. I feel safe.", "Parent Voices"),
  post("duara", 6, "My daughter comes home singing", "Parent Voices"),
  post("duara", 7, "Tomorrow's problem-solvers start here", "Admissions"),
  post("duara", 8, "Duara School Gathiga", "Admissions"),
  post("duara", 9, "Community Day", "Events"),
  post("duara", 10, "Little steps. Big milestones.", "Events"),
  post("duara", 11, "A school your family can trust", "Admissions"),
  post("duara", 12, "Big ideas begin here", "Admissions"),
  post("duara", 13, "Intentional teachers. Inspired learning.", "Admissions"),
  post("duara", 14, "A school that feels like home", "Admissions"),
  post("duara", 15, "Meet the teachers. Discover Duara.", "Admissions"),
];

const iclearPosts = [
  post("iclear", 1, "Desktop water purifier, 20% off", "Promotions"),
  post("iclear", 2, "A healthier home starts here", "Product"),
  post("iclear", 3, "Your workout water buddy", "Lifestyle"),
  post("iclear", 4, "Ditch the bottles. Drink iClear.", "Lifestyle"),
  post("iclear", 5, "Fuel your grind with iClear", "Lifestyle"),
  post("iclear", 6, "Unveil a better way to drink", "Product"),
  post("iclear", 7, "Roll-up banners", "Print"),
  post("iclear", 8, "Ramadhan special package", "Promotions"),
  post("iclear", 9, "iClear, water is sweet", "Product"),
];

const sidiPosts = [
  post("sidi", 1, "Cover: sidi Safari", "Story"),
  post("sidi", 2, "Beauty. With a story.", "Story"),
  post("sidi", 3, "Real routines. Personal stories.", "Story"),
  post("sidi", 4, "My world. Five ways in.", "Story"),
  post("sidi", 5, "Beauty with personality.", "Story"),
  post("sidi", 6, "Instagram, in focus.", "Performance"),
  post("sidi", 7, "Content, that connects.", "Performance"),
  post("sidi", 8, "50 Questions With Sidi", "50 Questions"),
  post("sidi", 9, "One format. Endless stories.", "50 Questions"),
  post("sidi", 10, "The people. The perspective.", "50 Questions"),
  post("sidi", 11, "More voices. More stories.", "50 Questions"),
  post("sidi", 12, "The series, on screen.", "50 Questions"),
  post("sidi", 13, "Conversations. With momentum.", "Performance"),
  post("sidi", 14, "Sidi's platforms, at a glance.", "Performance"),
  post("sidi", 15, "Join the conversation.", "50 Questions"),
  post("sidi", 16, "Partner with 50 Questions.", "Rates"),
  post("sidi", 17, "Considered content. Natural brand fit.", "Rates"),
  post("sidi", 18, "Shared stories. Thoughtful partnerships.", "Story"),
  post("sidi", 19, "Ways to work together.", "Rates"),
];

const jakarta = "'Plus Jakarta Sans', sans-serif";
const lato = "'Lato', sans-serif";
const abril = "'Abril Fatface', serif";
const poppins = "'Poppins', sans-serif";
const dmSans = "'DM Sans', sans-serif";
const cormorant = "'Cormorant Garamond', serif";

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
      "https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,700;0,800;1,800&family=Lato:wght@400;700&family=Oswald:wght@600&display=swap",
    type: { display: jakarta, displayWeight: 800, displayTracking: "-0.035em", body: lato },
    colors: {
      background: "#FDFAEE",
      surface: "#FFFFFF",
      ink: "#05321E",
      primary: "#035C40",
      onPrimary: "#FDFAEE",
      accent: "#EE850B",
      onAccent: "#FFFFFF",
      highlight: "#F9C71D",
      onHighlight: "#05321E",
      label: "#035C40",
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
      { name: "Plus Jakarta Sans ExtraBold", role: "Headlines", family: jakarta, weight: 800, sample: "Teachers you" },
      { name: "Plus Jakarta Sans ExtraBold Italic", role: "Accent phrase", family: jakarta, weight: 800, italic: true, color: "#EE850B", sample: "can trust." },
      { name: "Lato", role: "Subheads, quotes and contact details", family: lato, weight: 700, sample: "Kind. Patient. Encouraging." },
      { name: "Oswald SemiBold", role: "Event dates and times", family: "'Oswald', sans-serif", weight: 600, sample: "THURSDAY, 31 JULY" },
    ],
    headline: {
      lineFont: jakarta,
      lineWeight: 800,
      lineColor: "#05321E",
      accentFont: jakarta,
      accentWeight: 800,
      accentItalic: true,
      accentPaint: "#EE850B",
      underline: "#EE850B",
      tracking: "-0.035em",
      panel: "#FDFAEE",
      sample: { line: "A school that", accent: "feels like home." },
    },
    cover: { line: "Duara", accent: "Schools.", accentPaint: "#EE850B", disc: "#FFFFFF", logo: "color" },
    logos: {
      stacked: asset("duara", "logo-stacked"),
      // Duara's reversed logo is drawn with a CSS filter, so the white slots reuse the colour files.
      white: asset("duara", "logo-stacked"),
      horizontal: asset("duara", "logo-horizontal"),
      horizontalWhite: asset("duara", "logo-horizontal"),
      mark: asset("duara", "logo-mark"),
    },
    logoStages: [
      { label: "Full colour", bg: "#FDFAEE", logo: "color" },
      { label: "On white", bg: "#FFFFFF", logo: "color" },
      { label: "Reversed", bg: "#035C40", logo: "color", filter: "brightness(0) invert(1)" },
      { label: "One colour", bg: "#F9C71D", logo: "color", filter: "brightness(0)" },
    ],
    book: {
      logo: {
        title: "The sunflower mark",
        intro: "The dotted spiral grows outward like a sunflower head: many small parts becoming one community. It keeps its colours wherever the background allows.",
        clearSpace: "Clear space: keep one dot-ring (x) free on every side",
      },
      colour: {
        title: "Pulled from the logo",
        intro: "Every colour comes from the sunflower mark, so posts feel related to the logo even before you see it. Tap a swatch to copy its code.",
      },
      type: {
        title: "One loud voice, one warm accent",
        intro: "Headlines are heavy and tightly set in Forest Ink. One phrase per headline switches to the italic in Marigold. That one phrase is where the feeling goes.",
      },
      elements: {
        title: "Pieces that repeat everywhere",
        intro: "A small kit of shapes that shows up on every post. They are what make the feed read as one family.",
      },
      anatomy: { intro: "Every Admissions post is built on the same skeleton. Tap a number to see what each part does." },
      templates: {
        title: "One system, three templates",
        intro: "Admissions, Parent Voices and Events. Each has its own job, and all of them are built from the same parts.",
      },
      mockups: {
        title: "Beyond the feed",
        intro: "The same system carried onto the profile, print and uniforms, so the brand looks the same online and at the school gate.",
      },
      rules: { intro: "A few rules that keep the system intact when the school's own team makes posts." },
    },
    templates: [
      { name: "Admissions", description: "Headline, wave-framed photo, green footer with a pill button." },
      { name: "Parent Voices", description: "A real parent quote set big, framed by the logo bar and footer." },
      { name: "Events", description: "Date-led layouts for open days and celebrations." },
    ],
    posts: duaraPosts,
    anatomy: {
      image: duaraPosts[3].image,
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
    instagram: {
      bio: ["Community microschools. Quality learning, affordably.", "CBC • IB • Montessori"],
      avatarBg: "#FDFAEE",
      avatarLogo: "color",
    },
    contact: { phone: "0758 013970", web: "duara.education", handle: "@duaraschools" },
  },
  {
    slug: "iclear",
    name: "iClear",
    tagline: "A clean, premium look for home water purification.",
    sector: "Home water purification",
    year: "2025",
    scope: ["Social campaigns", "Product promos", "Seasonal campaigns", "Roll-up banners", "9 designs"],
    brief:
      "iClear sells home and office water purifiers in Nairobi and Nakuru. The brand needed social and print work that makes a technical product feel premium and easy to trust, and stays recognisable across promotions, lifestyle posts and in-store print.",
    approach: [
      "Built the look on deep navy and aqua, taken straight from the drop logo.",
      "Paired a heavy, high-contrast serif for headlines with light Poppins for details: premium, but easy to read.",
      "Lit every purifier like a hero product, with a spotlight glow behind the white unit.",
      "Fixed the logo top left and the same contact strip at the bottom of every post, then carried the system onto roll-up banners.",
    ],
    fontsHref:
      "https://fonts.googleapis.com/css2?family=Abril+Fatface&family=Poppins:ital,wght@0,300;0,400;0,600;1,800&family=Great+Vibes&display=swap",
    type: { display: abril, displayWeight: 400, displayTracking: "-0.01em", body: poppins },
    colors: {
      background: "#021A47",
      surface: "#08296A",
      ink: "#EEF5FF",
      primary: "#0653B1",
      onPrimary: "#FFFFFF",
      accent: "#08E6BE",
      onAccent: "#021A47",
      highlight: "#60D4E3",
      onHighlight: "#021A47",
      label: "#60D4E3",
    },
    palette: [
      { name: "Midnight", hex: "#022967", role: "Backgrounds of hero and product posts", share: 34, on: "#FFFFFF" },
      { name: "Royal Blue", hex: "#0653B1", role: "Gradients, sky and depth", share: 18, on: "#FFFFFF" },
      { name: "Sky Cyan", hex: "#60D4E3", role: "Spotlight glow and gradient start", share: 12, on: "#021A47" },
      { name: "Aqua Drop", hex: "#08E6BE", role: "The logo mark, checks and highlights", share: 8, on: "#021A47" },
      { name: "Mist", hex: "#EAF2FA", role: "Canvas for lifestyle posts", share: 20, on: "#01227B" },
      { name: "Pure White", hex: "#FFFFFF", role: "Headlines on dark, the product itself", share: 8, on: "#01227B" },
    ],
    fonts: [
      { name: "Abril Fatface", role: "Headlines", family: abril, weight: 400, sample: "A healthier home" },
      { name: "Poppins Light", role: "Subheads, details and contact strip", family: poppins, weight: 300, sample: "Trusted purification for homes that care." },
      { name: "Poppins ExtraBold Italic", role: "Punchy lifestyle lines", family: poppins, weight: 800, italic: true, color: "#60D4E3", sample: "Ditch The Bottles" },
      { name: "Great Vibes", role: "Seasonal campaigns", family: "'Great Vibes', cursive", weight: 400, color: "#60D4E3", sample: "Ramadhan" },
    ],
    headline: {
      lineFont: abril,
      lineWeight: 400,
      lineColor: "#FFFFFF",
      accentFont: abril,
      accentWeight: 400,
      accentItalic: false,
      accentPaint: "linear-gradient(90deg, #60D4E3, #FFFFFF)",
      tracking: "-0.01em",
      panel: "radial-gradient(ellipse at 50% 120%, #1E7BD8 0%, #0A3A8C 45%, #022967 80%)",
      sample: { line: "A healthier home", accent: "starts here." },
    },
    cover: {
      line: "iClear,",
      accent: "water is sweet.",
      accentPaint: "linear-gradient(90deg, #60D4E3, #08E6BE)",
      disc: "radial-gradient(circle, #2C8FE0 0%, #0A3A8C 50%, #021A47 72%)",
      logo: "white",
    },
    logos: {
      stacked: asset("iclear", "logo-stacked"),
      white: asset("iclear", "logo-white"),
      horizontal: asset("iclear", "logo-horizontal"),
      horizontalWhite: asset("iclear", "logo-horizontal-white"),
      mark: asset("iclear", "logo-mark"),
    },
    logoStages: [
      { label: "Full colour", bg: "#EAF2FA", logo: "color" },
      { label: "On white", bg: "#FFFFFF", logo: "color" },
      { label: "Reversed", bg: "#022967", logo: "white" },
      { label: "On blue", bg: "#0653B1", logo: "white" },
    ],
    book: {
      logo: {
        title: "The living drop",
        intro: "A water drop that curls into itself. On light backgrounds it's an aqua mark with a navy wordmark. On the deep navy posts it turns all white.",
        clearSpace: "Clear space: keep the inner drop's height (x) free on every side",
      },
      colour: {
        title: "Deep water, clear light",
        intro: "Midnight navy carries the premium feel. Aqua and sky cyan bring the freshness of clean water. Tap a swatch to copy its code.",
      },
      type: {
        title: "A heavy serif, a light sans",
        intro: "Headlines use a fat, high-contrast serif that feels premium. Everything else is light Poppins, so the details stay calm and readable.",
      },
      elements: {
        title: "Pieces that repeat everywhere",
        intro: "The parts that make a post recognisably iClear: the spotlight, the feature bar, the price line and the contact strip.",
      },
      anatomy: { intro: "Promotion posts follow one skeleton. Tap a number to see what each part does." },
      templates: {
        title: "One system, four formats",
        intro: "Promotions, product, lifestyle and print. Different jobs, built from the same parts.",
      },
      mockups: {
        title: "Beyond the feed",
        intro: "The same system carried onto the profile, stationery and in-store print.",
      },
      rules: { intro: "A few rules that keep iClear posts consistent from one campaign to the next." },
    },
    templates: [
      { name: "Promotions", description: "Offer-led: serif headline, feature bar, then-and-now price, deadline." },
      { name: "Product", description: "The purifier as hero, lit by a spotlight on deep navy." },
      { name: "Lifestyle", description: "People and moments: workouts, commutes, everyday hydration." },
      { name: "Print", description: "Roll-up banners for shops and events, same colours and type." },
    ],
    posts: iclearPosts,
    anatomy: {
      image: iclearPosts[0].image,
      callouts: [
        { x: 18, y: 4, label: "Logo", note: "Stacked lockup in white, always top left." },
        { x: 80, y: 5, label: "Anniversary badge", note: "The 4-year mark sits top right during the campaign." },
        { x: 13, y: 18, label: "Headline", note: "One heavy serif word carries the post." },
        { x: 25, y: 23, label: "Subline", note: "Light Poppins underneath names the product." },
        { x: 86, y: 32, label: "Feature bar", note: "Three short benefits, the middle one filled." },
        { x: 74, y: 40.5, label: "Price line", note: "Then struck through, now in large type." },
        { x: 95, y: 47, label: "Offer", note: "Big silver numerals for the discount." },
        { x: 27, y: 62, label: "Hero product", note: "The white unit lit by a soft spotlight." },
        { x: 20, y: 91, label: "Contact strip", note: "Website, phone and handle on every post." },
      ],
    },
    instagram: {
      bio: ["Home & office water purifiers.", "Nairobi • Nakuru  #Waterissweet"],
      avatarBg: "#022967",
      avatarLogo: "white",
    },
    contact: { phone: "+254 768 488 274", web: "iclear.co.ke", handle: "@iclear_water" },
  },
  {
    slug: "sidi-safari",
    name: "Sidi Safari",
    tagline: "A warm, editorial media kit for a Kenyan beauty and lifestyle creator.",
    sector: "Creator & media host",
    year: "2026",
    scope: ["Media kit", "Personal brand", "Series identity", "Rate cards", "20 pages"],
    brief:
      "Sidi Safari is a Kenya-based beauty and lifestyle creator and the host of 50 Questions With Sidi, an interview series with Kenyan personalities. She needed a media kit to pitch to brands: who she is, how her content performs and what a partnership costs, presented as personally as her content.",
    approach: [
      "Built a two-voice wordmark and headline system: a bold DM Sans statement, then a light Cormorant italic line.",
      "Took the palette from her own world: ink navy, blush and cream, with gold kept for arrows, rules and tape.",
      "Turned Instagram and TikTok insights into clear data pages, with every figure labelled by source and reporting window.",
      "Gave 50 Questions With Sidi its own chapter and sponsorship packages, next to her creator rate cards.",
    ],
    fontsHref:
      "https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,500;9..40,700&family=Cormorant+Garamond:ital,wght@0,300;1,300&display=swap",
    type: { display: dmSans, displayWeight: 700, displayTracking: "-0.045em", body: dmSans },
    colors: {
      background: "#F7F3EE",
      surface: "#FFFFFF",
      ink: "#1F2940",
      primary: "#1F2940",
      onPrimary: "#F7F3EE",
      accent: "#8D6B24",
      onAccent: "#FFFFFF",
      highlight: "#C9A24A",
      onHighlight: "#1F2940",
      label: "#8D6B24",
    },
    palette: [
      { name: "Cream", hex: "#F7F3EE", role: "Canvas for story and data pages", share: 38, on: "#1F2940" },
      { name: "Ink Navy", hex: "#1F2940", role: "Headlines, text and dark chapters", share: 26, on: "#F7F3EE" },
      { name: "Blush", hex: "#E9D7D7", role: "Cards, arches and the italic on navy", share: 18, on: "#1F2940" },
      { name: "Sand", hex: "#ECE4D6", role: "Second card colour beside Blush", share: 8, on: "#1F2940" },
      { name: "Gold", hex: "#C9A24A", role: "Arrows, rules and tape only", share: 6, on: "#1F2940" },
      { name: "Deep Gold", hex: "#8D6B24", role: "Small labels and numerals on light", share: 4, on: "#F7F3EE" },
    ],
    fonts: [
      { name: "DM Sans Bold", role: "Headlines", family: dmSans, weight: 700, sample: "Real routines." },
      { name: "Cormorant Garamond Light Italic", role: "The second line", family: cormorant, weight: 300, italic: true, sample: "Personal stories." },
      { name: "DM Sans Regular", role: "Body copy and figures", family: dmSans, weight: 400, sample: "1,223,934 views in 90 days" },
      { name: "Cormorant Garamond Light", role: "Numerals and names", family: cormorant, weight: 300, color: "#8D6B24", sample: "01  02  03  04  05" },
    ],
    headline: {
      lineFont: dmSans,
      lineWeight: 700,
      lineColor: "#1F2940",
      accentFont: cormorant,
      accentWeight: 300,
      accentItalic: true,
      accentPaint: "#1F2940",
      underline: "#C9A24A",
      tracking: "-0.04em",
      panel: "#E9D7D7",
      sample: { line: "Beauty.", accent: "With a story." },
    },
    cover: { line: "Sidi", accent: "Safari.", accentPaint: "#8D6B24", disc: "#E9D7D7", logo: "color" },
    logos: {
      stacked: asset("sidi", "logo-stacked"),
      white: asset("sidi", "logo-white"),
      horizontal: asset("sidi", "logo-horizontal"),
      horizontalWhite: asset("sidi", "logo-horizontal-white"),
      mark: asset("sidi", "logo-mark"),
    },
    logoStages: [
      { label: "Full colour", bg: "#F7F3EE", logo: "color" },
      { label: "On blush", bg: "#E9D7D7", logo: "color" },
      { label: "Reversed", bg: "#1F2940", logo: "white" },
      { label: "On white", bg: "#FFFFFF", logo: "color" },
    ],
    book: {
      logo: {
        title: "A name in two voices",
        intro: "There's no symbol: the name is the logo. \"sidi\" is set in heavy, tight DM Sans and \"Safari\" in a light Cormorant italic. It's confident and soft at once, like her content.",
        clearSpace: "Clear space: keep the height of the i's dot (x) free on every side",
      },
      colour: {
        title: "Navy, blush and a little gold",
        intro: "Ink navy brings the authority. Blush and cream keep it warm and personal. Gold is used sparingly, for arrows, rules and tape. Tap a swatch to copy its code.",
      },
      type: {
        title: "A strong line, then a soft one",
        intro: "Every chapter opens with a bold DM Sans statement followed by a light Cormorant italic line. The first says what the page is; the second says how it feels.",
      },
      elements: {
        title: "Pieces that repeat on every page",
        intro: "Arrows, tape, running headers and data cards: small parts that make twenty pages read as one kit.",
      },
      anatomy: { intro: "The About page uses almost every part of the system. Tap a number to see what each part does." },
      templates: {
        title: "One kit, four kinds of page",
        intro: "Story pages, performance pages, the 50 Questions series and the rate cards, all built from the same parts.",
      },
      mockups: {
        title: "Beyond the PDF",
        intro: "The same system carried onto her profile, a business card and the pages brands spend the most time on.",
      },
      rules: { intro: "A few rules that keep the kit consistent as the numbers and packages are updated." },
    },
    templates: [
      { name: "Story", description: "Cover, about, brand essence, content pillars and past partners." },
      { name: "Performance", description: "Instagram and TikTok insights, each figure with its source and window." },
      { name: "50 Questions", description: "The interview series: format, guests, artwork and integrations." },
      { name: "Rates", description: "Creator packages, series sponsorships and services, all in KES." },
    ],
    posts: sidiPosts,
    anatomy: {
      // The A4 page sits at x 91–989, y 40–1310 inside the 1080×1350 poster.
      image: sidiPosts[1].image,
      callouts: [
        { x: 17, y: 7.5, label: "Running header", note: "Small spaced caps: name on the left, chapter on the right." },
        { x: 50, y: 15.5, label: "Statement", note: "DM Sans Bold in Ink Navy, tracked tight." },
        { x: 69, y: 23, label: "Italic line", note: "Cormorant Light Italic carries the feeling." },
        { x: 28.5, y: 31.5, label: "Gold swoosh", note: "A hand-drawn gold underline and arrow lead into the copy." },
        { x: 13.5, y: 35.5, label: "Paper tag", note: "A cream label, slightly rotated, names the section." },
        { x: 38, y: 66, label: "Sign-off", note: "One italic line closes the page: Warm. Honest. Always personal." },
        { x: 67, y: 38.5, label: "Taped photo", note: "A real photo in a cream border, held on with gold tape." },
        { x: 89, y: 61, label: "Navy arch", note: "A large shape behind the photo adds depth without clutter." },
        { x: 58, y: 92.8, label: "Footer", note: "A navy rule, the chapter's topics and the page number." },
      ],
    },
    instagram: {
      bio: ["Beauty. With a story. Kenya-based creator & host.", "Skincare • Body care • 50 Questions With Sidi"],
      avatarBg: "#E9D7D7",
      avatarLogo: "color",
    },
    contact: { web: "tiktok.com/@sidisafari", handle: "@sidi_safari" },
  },
];

export const getBrand = (slug: string | undefined) => brands.find((b) => b.slug === slug);
