/**
 * Single source of truth for the agency services: prices, packages, proof, FAQ,
 * process and trust numbers.
 *
 * Rules:
 *  - This file imports nothing from the app, so any other data file may import it.
 *  - A price is written ONCE, here. Everything else (homepage tiles, /agency,
 *    /agency/services, /agency/pricing, service pages) formats it with
 *    `priceLabel`. Never type "KES 40,000" into a component again.
 *  - Only facts already published on the site go in. Anything unknown is `null`
 *    with a `TODO` comment, and is listed in PROGRESS.md.
 */

export const CALENDLY_URL = "https://calendly.com/joemaish084/30min";

/* -------------------------------------------------------------------------- */
/* Prices                                                                      */
/* -------------------------------------------------------------------------- */

export type PriceUnit = "month" | "project" | "session";

export type Price =
  /** A KES fee. `from` adds the "From" qualifier. */
  | { kes: number; unit?: PriceUnit; from?: boolean }
  /** Not a number: "Quoted for your scope", "Free for now". */
  | { label: string };

const UNIT_SHORT: Record<PriceUnit, string> = { month: "mo", project: "project", session: "session" };

/** 40000 -> "40,000". Manual, so server and browser always print the same thing. */
export function formatKes(amount: number): string {
  return String(amount).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}

/**
 * "From KES 40,000/month". This is the form `localizePrice` and the `PriceTag`
 * parser expect. `short` gives the compact table form: "from KES 40,000/mo".
 */
export function priceLabel(price: Price, opts: { short?: boolean } = {}): string {
  if ("label" in price) return price.label;
  const unit = price.unit ? `/${opts.short ? UNIT_SHORT[price.unit] : price.unit}` : "";
  const lead = price.from ? (opts.short ? "from " : "From ") : "";
  return `${lead}KES ${formatKes(price.kes)}${unit}`;
}

/* -------------------------------------------------------------------------- */
/* Services                                                                    */
/* -------------------------------------------------------------------------- */

export type ServiceCategory = "paid" | "seo" | "social" | "stores";

/** Image slots. Files arrive in Step 5; until then the page shows a placeholder. */
export type ImageSlot =
  | "svc-meta-ads"
  | "svc-google-ads"
  | "svc-seo"
  | "svc-social"
  | "svc-tiktok-ads"
  | "svc-lead-gen"
  | "svc-shopify";

export interface ServiceProof {
  /** One short line, shown on the tile. */
  line: string;
  /** `caseStudies.ts` id or blog slug this figure comes from. */
  source: string;
}

export interface Service {
  /** Pricing-table row key. The page anchor is `service-${slug}`. Do not rename. */
  slug: string;
  /** Name used on the pricing table and the brief form. */
  name: string;
  /** Short name for a bento tile. */
  tileName: string;
  /** Any of these may match a filter chip. */
  categories: ServiceCategory[];
  /** Outcome line. Restates copy already on the site. */
  outcome: string;
  /** Who it is for. `null` = TODO(joseph): no published line exists. */
  whoFor: string | null;
  price: Price;
  /** Scope line for the pricing table. */
  scope: string;
  /** The service's own page. `null` = no page yet. */
  pagePath: string | null;
  /** One verified proof line. `null` = TODO(joseph): nothing published for this service. */
  proof: ServiceProof | null;
  /** `null` = the tile uses an icon, not an image. */
  imageSlot: ImageSlot | null;
  /** Where the tile CTA goes when `pagePath` is null. */
  fallbackPath: string;
  cta: string;
  /** In the bento grid, or only in the "also available" row and the pricing table. */
  bento: boolean;
  /** Shown in the pricing-table "single services" list. */
  inPricingTable: boolean;
}

export const services: Service[] = [
  {
    slug: "meta-ads",
    name: "Meta Ads Management",
    tileName: "Meta Ads",
    categories: ["paid"],
    outcome: "Create demand with better creative, sharper targeting, and continuous testing.",
    whoFor: "Consumer brands, beauty and aesthetics, restaurants, e-commerce and local businesses",
    price: { kes: 40000, unit: "month", from: true },
    scope: "Campaign strategy and setup, Audience research, Creative direction, Weekly optimization, Monthly reporting",
    pagePath: "/agency/meta-ads-management",
    // Published case study. Client not named. Brief question Q1: show it on the tile.
    proof: { line: "KES 5.33M attributed revenue at 41.3x ROAS (client not named)", source: "meta-ads-turnaround" },
    imageSlot: "svc-meta-ads",
    fallbackPath: "/agency/meta-ads-management",
    cta: "Explore Meta Ads",
    bento: true,
    inPricingTable: true,
  },
  {
    slug: "google-ads",
    name: "Google Ads Management",
    tileName: "Google Ads",
    categories: ["paid"],
    outcome: "Capture demand when people are already searching for what you sell.",
    whoFor: "Service businesses, professional practices, repairs and local services, and B2B companies",
    price: { kes: 45000, unit: "month", from: true },
    scope: "Search, Display and YouTube campaigns, Keyword research and strategy, Bid management, Conversion tracking, Monthly reporting",
    pagePath: "/agency/google-ads-management",
    proof: { line: "KES 1.94M attributed revenue at 15.5x ROAS (client not named)", source: "google-ads-launch" },
    imageSlot: "svc-google-ads",
    fallbackPath: "/agency/google-ads-management",
    cta: "Explore Google Ads",
    bento: true,
    inPricingTable: true,
  },
  {
    slug: "tiktok-ads",
    name: "TikTok Ads Management",
    tileName: "TikTok Ads",
    categories: ["paid", "social"],
    // TikTok has no outcome line of its own on the site; this restates its feature list.
    outcome: "Short-form video campaigns with creative direction, audience targeting and weekly optimization.",
    whoFor: null, // TODO(joseph): who is TikTok Ads for? Nothing published.
    price: { kes: 40000, unit: "month", from: true },
    scope: "Campaign strategy, Creative direction, Audience targeting, Weekly optimization, Performance reporting",
    pagePath: null, // No TikTok service page exists yet.
    proof: { line: "4M TikTok video views across a full year of social content", source: "social-media-2025" },
    imageSlot: "svc-tiktok-ads",
    fallbackPath: "/agency/contact#brief",
    cta: "Discuss TikTok Ads",
    bento: true,
    inPricingTable: true,
  },
  {
    slug: "seo-optimization",
    name: "SEO Optimization",
    tileName: "SEO",
    categories: ["seo"],
    outcome: "Build long-term visibility for the searches your customers make.",
    whoFor: "Businesses that want leads that do not stop when the ad budget does",
    price: { kes: 45000, unit: "month", from: true },
    scope: "On-page, technical and local SEO.",
    pagePath: "/agency/seo-services-nairobi",
    proof: { line: "Search rankings improved from position 20 to 14, then 9 (Beauty Square Kenya)", source: "seo-services-nairobi" },
    imageSlot: "svc-seo",
    fallbackPath: "/agency/seo-services-nairobi",
    cta: "Learn about SEO",
    bento: true,
    inPricingTable: true,
  },
  {
    slug: "social-media-management",
    name: "Social Media Management",
    tileName: "Social Media",
    categories: ["social"],
    outcome: "Create a consistent presence with content people actually stop to notice.",
    whoFor: "Brands getting reach but few enquiries from social",
    price: { kes: 40000, unit: "month", from: true },
    scope: "Content, scheduling and community management.",
    pagePath: "/agency/social-media-management",
    proof: { line: "336 pieces of content and 4M TikTok video views in one year", source: "social-media-2025" },
    imageSlot: "svc-social",
    fallbackPath: "/agency/social-media-management",
    cta: "Learn about social media",
    bento: true,
    inPricingTable: true,
  },
  {
    slug: "lead-generation",
    name: "Lead Generation",
    tileName: "Lead Generation",
    categories: ["paid"],
    outcome: "Campaigns, landing pages and lead tracking that turn clicks into enquiries.",
    whoFor: "Businesses getting clicks and impressions but few real enquiries",
    price: { kes: 50000, unit: "month", from: true },
    scope: "Landing pages and campaign management across two platforms. Your team follows up with the leads.",
    pagePath: "/agency/lead-generation",
    proof: { line: "10x increase in qualified leads in 6 months (Convey Communications)", source: "convey-communications-case-study-10x-leads" },
    imageSlot: "svc-lead-gen",
    fallbackPath: "/agency/lead-generation",
    cta: "Explore lead generation",
    bento: true,
    // Not in the pricing table today: it has its own note under the table.
    inPricingTable: false,
  },
  {
    slug: "shopify-services",
    name: "Shopify Store Services",
    tileName: "Shopify Stores",
    categories: ["stores"],
    outcome: "Store creation and migration per project; management scoped monthly.",
    whoFor: "Businesses launching a first online store, moving from WooCommerce, or improving an existing Shopify store",
    price: { label: "Quoted for your scope" },
    scope: "Store creation and migration per project; management scoped monthly. Shopify and third-party costs are separate.",
    pagePath: "/agency/shopify-services",
    proof: null, // TODO(joseph): the live Babyshop Dansar store is the proof; no figure is published.
    imageSlot: "svc-shopify",
    fallbackPath: "/agency/shopify-services",
    cta: "Explore Shopify services",
    bento: true,
    inPricingTable: true,
  },
  {
    slug: "digital-marketing-audit",
    name: "Digital Marketing Audit",
    tileName: "Free Audit",
    categories: ["seo"],
    outcome: "Find what is wasting time or budget before you spend more.",
    whoFor: "Businesses paying for marketing and unsure what they are getting",
    price: { label: "Free for now" },
    scope: "Performance review, with findings in a written report or call within 1-2 days.",
    pagePath: "/agency/digital-marketing-audit",
    proof: null,
    imageSlot: null,
    fallbackPath: "/agency/digital-marketing-audit",
    cta: "Get the free audit",
    bento: true,
    inPricingTable: true,
  },
  {
    slug: "content-strategy",
    name: "Content Strategy",
    tileName: "Content strategy",
    categories: ["social"],
    outcome: "Develop campaign messages, visuals, and video ideas that give ads something worth clicking.",
    whoFor: "Campaigns that need stronger messages, visuals, and video",
    price: { kes: 45000, unit: "month", from: true },
    scope: "Editorial calendars and content plans.",
    pagePath: null,
    proof: null,
    imageSlot: null,
    fallbackPath: "/work/design",
    cta: "See creative work",
    bento: false,
    inPricingTable: true,
  },
  {
    slug: "video-production",
    name: "Video Production",
    tileName: "Video production",
    categories: ["social"],
    outcome: "Short-form ads and brand videos.",
    whoFor: null, // TODO(joseph)
    price: { kes: 40000, unit: "project", from: true },
    scope: "Short-form ads and brand videos.",
    pagePath: null,
    proof: null,
    imageSlot: null,
    fallbackPath: "/agency/contact#brief",
    cta: "Discuss a video",
    bento: false,
    inPricingTable: true,
  },
  {
    slug: "brand-strategy",
    name: "Brand Strategy",
    tileName: "Brand strategy",
    categories: ["social"],
    outcome: "Positioning, messaging and identity.",
    whoFor: null, // TODO(joseph)
    price: { kes: 60000, from: true },
    scope: "Positioning, messaging and identity.",
    pagePath: null,
    proof: null,
    imageSlot: null,
    fallbackPath: "/agency/contact#brief",
    cta: "Discuss brand strategy",
    bento: false,
    inPricingTable: true,
  },
  {
    slug: "graphic-design",
    name: "Graphic Design",
    tileName: "Graphic design",
    categories: ["social"],
    outcome: "Social graphics, ads and collateral.",
    whoFor: null, // TODO(joseph)
    price: { kes: 40000, unit: "month", from: true },
    scope: "Social graphics, ads and collateral.",
    pagePath: null,
    proof: null,
    imageSlot: null,
    fallbackPath: "/work/design",
    cta: "See design work",
    bento: false,
    inPricingTable: true,
  },
  {
    slug: "strategy-consultation",
    name: "Strategy Consultation",
    tileName: "Strategy consultation",
    categories: ["seo"],
    outcome: "One-on-one advisory session.",
    whoFor: null, // TODO(joseph)
    price: { kes: 40000, unit: "session" },
    scope: "One-on-one advisory session.",
    pagePath: null,
    proof: null,
    imageSlot: null,
    fallbackPath: "/agency/contact#brief",
    cta: "Book a session",
    bento: false,
    inPricingTable: true,
  },
];

export const getService = (slug: string): Service => {
  const found = services.find((s) => s.slug === slug);
  if (!found) throw new Error(`Unknown service slug: ${slug}`);
  return found;
};

/** The "From KES 40,000/month" string for a service. */
export const servicePrice = (slug: string, opts?: { short?: boolean }): string =>
  priceLabel(getService(slug).price, opts);

/** The bare KES amount, for sentences like "starts at KSh 50,000". Throws for unpriced services. */
export const serviceFeeKes = (slug: string): number => {
  const price = getService(slug).price;
  if (!("kes" in price)) throw new Error(`Service has no KES fee: ${slug}`);
  return price.kes;
};

/** Anchor id on /agency/services. /agency/pricing and legacy links point at these. */
export const serviceAnchorId = (slug: string): string => `service-${slug}`;

/** Where a tile or table row should send the visitor. */
export const serviceHref = (s: Service): string => s.pagePath ?? s.fallbackPath;

/** Tile order in the bento grid: the two lead services first, the free audit last. */
const BENTO_ORDER = [
  "meta-ads", "google-ads", "seo-optimization", "social-media-management",
  "tiktok-ads", "lead-generation", "shopify-services", "digital-marketing-audit",
];
export const bentoServices = services
  .filter((s) => s.bento)
  .sort((a, b) => BENTO_ORDER.indexOf(a.slug) - BENTO_ORDER.indexOf(b.slug));
export const alsoAvailableServices = services.filter((s) => !s.bento);

export const serviceFilters: { key: ServiceCategory | "all"; label: string }[] = [
  { key: "all", label: "All" },
  { key: "paid", label: "Paid ads" },
  { key: "seo", label: "SEO" },
  { key: "social", label: "Social" },
  { key: "stores", label: "Stores" },
];

/** Services matching a filter chip. "all" returns the list unchanged. */
export const filterServices = (list: Service[], key: ServiceCategory | "all"): Service[] =>
  key === "all" ? list : list.filter((s) => s.categories.includes(key));

/* -------------------------------------------------------------------------- */
/* Retainer packages                                                           */
/* -------------------------------------------------------------------------- */

export interface RetainerPackage {
  /** Also the `?service=` value on the brief form, lower-cased. */
  name: "STARTER" | "GROWTH" | "SCALE";
  label: string;
  highlight?: boolean;
  price: Price;
  note: string;
  intlNote: string;
  features: string[];
}

export const retainerPackages: RetainerPackage[] = [
  {
    name: "STARTER",
    label: "For small businesses",
    price: { kes: 40000, unit: "month", from: true },
    note: "Ad spend under KES 50,000/month",
    intlNote: "Ad spend from $1,500/month",
    features: ["1 platform managed", "Campaign setup and strategy", "Audience research", "Monthly reporting", "Email support"],
  },
  {
    name: "GROWTH",
    label: "Most popular",
    highlight: true,
    price: { kes: 70000, unit: "month", from: true },
    note: "Ad spend KES 50,000 - 200,000/month",
    intlNote: "Ad spend $3,000 - $8,000/month",
    features: ["2 platforms managed", "Full campaign management", "Creative direction", "Weekly optimization", "Bi-weekly reporting", "WhatsApp support"],
  },
  {
    name: "SCALE",
    label: "For established brands",
    price: { kes: 120000, unit: "month", from: true },
    note: "Ad spend KES 200,000+/month",
    intlNote: "Ad spend $8,000+/month",
    features: ["All platforms managed", "Full performance marketing", "Dedicated strategy sessions", "Daily monitoring", "Weekly reporting", "Priority WhatsApp support", "Quarterly strategy review"],
  },
];

/** Every value restates a line from the package's own feature list or note. Order matches `retainerPackages`. */
export const packageComparison: { label: string; values: string[]; intlValues?: string[] }[] = [
  { label: "Monthly ad spend", values: ["Under KES 50,000", "KES 50,000 – 200,000", "KES 200,000+"], intlValues: ["From $1,500", "$3,000 – $8,000", "$8,000+"] },
  { label: "Platforms managed", values: ["1", "2", "All"] },
  { label: "Reporting", values: ["Monthly", "Bi-weekly", "Weekly"] },
  { label: "Support", values: ["Email", "WhatsApp", "Priority WhatsApp"] },
];

export const packageFeeNote = "Management fee only. Advertising spend is paid directly to Google or Meta.";

export const getPackage = (name: RetainerPackage["name"]): RetainerPackage => {
  const found = retainerPackages.find((p) => p.name === name);
  if (!found) throw new Error(`Unknown package: ${name}`);
  return found;
};

/* -------------------------------------------------------------------------- */
/* Trust numbers and proof                                                     */
/* -------------------------------------------------------------------------- */

export interface TrustNumber {
  value: number;
  prefix: string;
  suffix: string;
  label: string;
}

/**
 * Hero numbers. Note for Joseph: the iClear line (see `proofItems`) says
 * "KES 1.2M+ ad spend managed", which does not match "KES 500K+ ad budgets
 * managed" here. Both are published today. Confirm which is right (brief Q3).
 */
export const trustNumbers: TrustNumber[] = [
  { value: 500, prefix: "KES ", suffix: "K+", label: "Ad budgets managed" },
  { value: 20, prefix: "", suffix: "+", label: "Campaigns launched" },
  { value: 3, prefix: "", suffix: "+", label: "Years experience" },
];

export interface ProofItem {
  id: string;
  /** `null` = client is not named on the site. Keep it that way. */
  client: string | null;
  period: string | null;
  goal: string;
  whatWasDone: string;
  /** Headline result, exactly as published. */
  result: string;
  /** Figures for the results strip. */
  stats: { value: string; label: string }[];
  /** Where the wording was copied from. */
  source: string;
  /** Link to the full write-up. */
  readMore: string;
  /** Results screenshot slot, supplied in Step 5. */
  imageSlot: "proof-case-1" | "proof-case-2" | "proof-case-3" | null;
}

export const proofItems: ProofItem[] = [
  {
    id: "google-ads-launch",
    client: null,
    period: "Aug to Oct 2026",
    goal: "The business had never run Google Ads.",
    whatWasDone: "Launched Search ads first, then Shopping ads, and tracked every order back to the campaign that drove it.",
    result: "KES 1.94M tracked revenue at 15.5x return on ad spend.",
    stats: [
      { value: "KES 1.94M", label: "Tracked revenue" },
      { value: "15.5x", label: "Return on ad spend" },
      { value: "339", label: "Tracked orders" },
    ],
    source: "src/data/caseStudies.ts#google-ads-launch",
    readMore: "/work/case-studies#google-ads-launch",
    imageSlot: "proof-case-1",
  },
  {
    id: "meta-ads-turnaround",
    client: null,
    period: "Jul to Oct 2026",
    goal: "A Nairobi beauty retailer was running Meta ads with no conversion tracking and no campaign structure.",
    whatWasDone: "Rebuilt the account around tracked, offer-specific sales campaigns.",
    result: "KES 5.33M revenue attributed by Meta at 41.3x return on ad spend.",
    stats: [
      { value: "KES 5.33M", label: "Revenue attributed by Meta" },
      { value: "41.3x", label: "Return on ad spend" },
      { value: "953", label: "Tracked purchases" },
    ],
    source: "src/data/caseStudies.ts#meta-ads-turnaround",
    readMore: "/work/case-studies#meta-ads-turnaround",
    imageSlot: "proof-case-2",
  },
  {
    id: "convey-communications",
    client: "Convey Communications",
    period: "6 months",
    goal: "Low organic reach and stagnant lead flow across digital channels.",
    // From the blog post's meta description.
    whatWasDone: "Combined Meta Ads, TikTok strategy and content production.",
    result: "10x increase in qualified leads and 300%+ engagement growth across Instagram and TikTok in 6 months.",
    stats: [
      { value: "10x", label: "Qualified leads" },
      { value: "300%+", label: "Engagement growth" },
    ],
    source: "src/data/servicePages.ts (digital-marketing-kenya, lead-generation)",
    readMore: "/agency/blog/convey-communications-case-study-10x-leads",
    imageSlot: "proof-case-3",
  },
  {
    id: "iclear-kenya",
    client: "iClear Kenya",
    period: null, // TODO(joseph): no period is published for this figure.
    goal: "Limited brand awareness in a saturated FMCG market.",
    whatWasDone: "TODO(joseph): no published description of the work beyond the result.",
    result: "KES 1.2M+ ad spend managed at 4.2x ROAS, with 180% follower growth.",
    stats: [
      { value: "4.2x", label: "ROAS" },
      { value: "KES 1.2M+", label: "Ad spend managed" },
      { value: "180%", label: "Follower growth" },
    ],
    source: "src/data/servicePages.ts (meta-ads-management)",
    readMore: "/agency/blog/how-i-landed-national-press-coverage-for-iclear",
    imageSlot: null,
  },
  {
    id: "nyeri-county",
    client: null, // The write-up does not name the client. Do not assume one.
    period: null, // TODO(joseph): the write-up is dated Sep 2026; the campaign period is not published.
    goal: "Reach a hyper-local audience on a limited budget.",
    whatWasDone: "A hyper-local video production and Meta Ads strategy.",
    result: "Over 500,000 views and 22 community events filled to capacity.",
    stats: [
      { value: "500K+", label: "Views" },
      { value: "22", label: "Events filled to capacity" },
    ],
    source: "src/data/blogSummaries.ts (nyeri-county-campaign-hyper-local-marketing)",
    readMore: "/agency/blog/nyeri-county-campaign-hyper-local-marketing",
    imageSlot: null,
  },
];

/** Shown when a result is a single campaign, not a promise. Already used on the services page. */
export const proofDisclaimer = "Results are specific to each campaign.";

/* -------------------------------------------------------------------------- */
/* Process                                                                     */
/* -------------------------------------------------------------------------- */

/** The commercial onboarding steps: call, proposal, deposit, launch, report. */
export const onboardingSteps = [
  { title: "Free Strategy Call", desc: "Free 30-minute call to understand your brand, goals and budget." },
  { title: "Custom Proposal", desc: "I send a tailored proposal within 24 hours — services, pricing and timeline." },
  { title: "Agreement & Deposit", desc: "We agree on terms. 50% deposit paid via M-Pesa to kick things off." },
  { title: "We Launch", desc: "Campaigns go live. You get access to your client portal for real-time updates." },
  { title: "Report & Grow", desc: "Weekly updates and monthly reports. We optimize, scale and keep growing." },
];

/* -------------------------------------------------------------------------- */
/* FAQ                                                                         */
/* -------------------------------------------------------------------------- */

export interface Faq {
  q: string;
  a: string;
}

/** The six agency FAQs shown on /agency/pricing. The services page reuses them in Step 8. */
export const agencyFaqs: Faq[] = [
  { q: "Do you require long-term contracts?", a: "No lock-in contracts. I work on monthly retainers with 30-day notice to end services. I believe in earning your business every month." },
  { q: "How quickly can we get started?", a: "After the strategy call and proposal acceptance — we can launch within 3-5 business days." },
  { q: "Do I provide the ad budget separately?", a: "Yes. My fee covers management only. Ad spend goes directly to Meta/Google/TikTok. This keeps everything transparent." },
  { q: "What reports will I receive?", a: "Weekly performance updates via WhatsApp and detailed monthly reports delivered to your email and client portal." },
  { q: "Can I see my campaign performance anytime?", a: "Yes — your client portal gives you 24/7 access to your campaign status, reports and files." },
  { q: "What does founder-led mean for my business?", a: "Direct access to the person doing the work — not an account manager passing messages. Faster decisions, personal attention, better results." },
];
