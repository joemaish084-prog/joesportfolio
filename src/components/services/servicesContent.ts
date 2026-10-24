import {
  BarChart3, ClipboardList, Compass, PenLine, Rocket, Search, Share2, Target, TrendingUp, Wrench,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CALENDLY_URL } from "@/data/servicePages";

/**
 * Everything the /agency/services page says lives in this file, so copy, links
 * and sample figures can be edited without touching the components.
 *
 * Rules for editing:
 *  - Anything under `snapshots` is ILLUSTRATIVE. It is labelled as sample data
 *    on the page. Only replace it with figures you can back with a client report.
 *  - `proof` entries are the only place results are claimed. Add a figure only
 *    when it is verified and approved for public use.
 */

export type PlatformKey = "google" | "meta";

export { CALENDLY_URL };

export const CASE_STUDIES_URL = "/agency/results";

/* -------------------------------------------------------------------------- */
/* Section header                                                              */
/* -------------------------------------------------------------------------- */

export const servicesHeader = {
  label: "GOOGLE ADS · META ADS · LEAD GENERATION",
  heading: "Paid campaigns built for measurable growth",
  intro:
    "I help Kenyan businesses choose the right platform, build campaigns that make commercial sense, and improve performance without hiding behind complicated reports.",
  statement: "Strategy before spend. Creative meets data. Every decision tied to a business goal.",
};

/* -------------------------------------------------------------------------- */
/* Primary services                                                            */
/* -------------------------------------------------------------------------- */

export interface ProofContent {
  /** "verified" renders figures. "pending" renders only the honest fallback line. */
  status: "verified" | "pending";
  heading: string;
  /** Figures shown only when status is "verified". */
  figures?: { value: string; label: string }[];
  period?: string;
  note?: string;
  link: { label: string; to: string };
}

export interface PrimaryService {
  key: PlatformKey;
  /** Anchor id. Pricing links to these, so do not rename without updating Pricing. */
  anchorId: string;
  icon: LucideIcon;
  platformLabel: string;
  /** Platform indicator colour. Used only for the small badge dot. */
  indicator: string;
  /** Keyword-bearing eyebrow, visible text. */
  eyebrow: string;
  title: string;
  short: string;
  expanded: string;
  bestFor: string[];
  included: string[];
  tags: string[];
  price: string;
  cta: { label: string; to: string };
  proof: ProofContent;
}

export const primaryServices: PrimaryService[] = [
  {
    key: "google",
    anchorId: "service-google-ads",
    icon: Search,
    platformLabel: "Google Ads",
    indicator: "#EA4335",
    eyebrow: "Google Ads specialist in Nairobi",
    title: "Google Ads",
    short: "Capture demand when people are already searching for what you sell.",
    expanded:
      "I build and manage Google Ads campaigns around search intent, conversion tracking, and the phrases Kenyan customers actually use.",
    bestFor: [
      "Service businesses",
      "Professional practices",
      "Repairs and local services",
      "B2B companies",
      "E-commerce businesses",
      "Businesses with customers already searching",
    ],
    included: [
      "Search campaign strategy",
      "Keyword research",
      "Negative keyword management",
      "Shopping and Performance Max where appropriate",
      "Bid and budget management",
      "Conversion tracking",
      "Calls, forms, and WhatsApp enquiry tracking",
      "Monthly reporting",
      "Ongoing optimization",
    ],
    tags: ["Search campaigns", "Shopping", "Conversion tracking", "Keyword strategy", "Bid management"],
    price: "From KES 45,000/month",
    cta: { label: "Explore Google Ads", to: "/agency/google-ads-management" },
    // VERIFIED: from the Google Ads launch case study (src/data/googleAdsCaseStudy.ts).
    // Keep in step with that file and with the Google Ads service page.
    proof: {
      status: "verified",
      heading: "Selected Google Ads result",
      figures: [
        { value: "KSh 1.94M", label: "Attributed revenue" },
        { value: "339", label: "Tracked orders" },
        { value: "15.5x", label: "ROAS" },
      ],
      period: "Campaign period: 1 August–8 October 2026",
      note: "Revenue as attributed by Google Ads. Client not named. Results are specific to this campaign.",
      link: { label: "Read the full case study", to: "/work/case-studies#google-ads-launch" },
    },
  },
  {
    key: "meta",
    anchorId: "service-meta-ads",
    icon: Target,
    platformLabel: "Meta Ads",
    indicator: "#1877F2",
    eyebrow: "Meta Ads specialist in Kenya",
    title: "Meta Ads",
    short: "Create demand with better creative, sharper targeting, and continuous testing.",
    expanded:
      "I manage Facebook and Instagram campaigns from audience research and creative direction through to optimization and reporting.",
    bestFor: [
      "Consumer brands",
      "Beauty and aesthetics businesses",
      "Restaurants and hospitality",
      "E-commerce companies",
      "Local businesses",
      "Businesses that need to generate interest before people search",
    ],
    included: [
      "Campaign strategy and setup",
      "Audience research",
      "Lead-generation campaigns",
      "Creative direction",
      "Ad copy and format testing",
      "Retargeting",
      "Budget allocation",
      "Weekly optimization",
      "Monthly reporting",
    ],
    tags: ["Lead generation", "Creative testing", "Audience strategy", "Retargeting", "Conversion campaigns"],
    price: "From KES 40,000/month",
    cta: { label: "Explore Meta Ads", to: "/agency/meta-ads-management" },
    // NO VERIFIED META FIGURE IS SHOWN HERE ON PURPOSE.
    // To add one: set status to "verified" and fill figures, period and link.
    proof: {
      status: "pending",
      heading: "Meta Ads results",
      note: "Selected Meta Ads results available on request.",
      link: { label: "See campaign case studies", to: CASE_STUDIES_URL },
    },
  },
];

/* -------------------------------------------------------------------------- */
/* Platform decision                                                           */
/* -------------------------------------------------------------------------- */

export interface DecisionOption {
  value: "google" | "meta" | "unsure";
  tab: string;
  heading: string;
  copy: string;
  /** Short reasons, drawn from the primary cards' "best for" lists. */
  signals?: string[];
  cta: { label: string; to: string; external?: boolean };
  read?: { label: string; to: string };
}

export const decisionHeading = "Which platform is right for your business?";

export const decisionOptions: DecisionOption[] = [
  {
    value: "google",
    tab: "Google Ads",
    heading: "Customers are already searching",
    copy:
      "Choose Google Ads when customers are already searching for your product or service. It is strongest when there is clear search intent and a reliable way to track enquiries or sales.",
    signals: ["People search for what you sell", "Enquiries come by call, form or WhatsApp", "You can measure what each enquiry is worth"],
    cta: { label: "Explore Google Ads", to: "/agency/google-ads-management" },
    read: { label: "Read: Google Ads vs Meta Ads in Kenya", to: "/agency/blog/google-ads-vs-meta-ads-kenya-2026" },
  },
  {
    value: "meta",
    tab: "Meta Ads",
    heading: "You need to create the demand",
    copy:
      "Choose Meta Ads when you need to create demand, reach a defined audience, test creative, or generate interest before people actively search.",
    signals: ["Few people search for you by name yet", "You have a visual or story-led offer", "You want to test several creative angles"],
    cta: { label: "Explore Meta Ads", to: "/agency/meta-ads-management" },
    read: { label: "Read: what Kenyan SMEs should spend on Meta Ads", to: "/agency/blog/how-much-should-a-kenyan-sme-spend-on-meta-ads" },
  },
  {
    value: "unsure",
    tab: "Not sure yet?",
    heading: "Start with a conversation",
    copy: "I'll help you choose the right starting point based on your offer, audience, goals, and budget.",
    cta: { label: "Book a Free Strategy Call", to: CALENDLY_URL, external: true },
  },
];

/* -------------------------------------------------------------------------- */
/* Campaign Snapshot (ILLUSTRATIVE)                                            */
/* -------------------------------------------------------------------------- */

export type MetricUnit = "kes" | "count" | "percent";

export interface SnapshotMetric {
  key: string;
  label: string;
  value: number;
  unit: MetricUnit;
  decimals?: number;
}

export interface Snapshot {
  campaignName: string;
  objective: string;
  dateRange: string;
  status: string;
  metrics: SnapshotMetric[];
  /** Leads per week. These add up to the leads metric above. */
  weekly: { week: string; leads: number }[];
  strategyHeading: string;
  strategy: string;
  focus: string[];
  approach: { label: string; to: string };
}

export const snapshotLabels = {
  heading: "Campaign Snapshot",
  badge: "ILLUSTRATIVE CAMPAIGN VIEW",
  note: "Sample data — replace with verified results. Not a real account, client or result.",
  chartTitle: "Leads per week (sample)",
};

/*
 * SAMPLE DATA. Replace with verified client figures when approved.
 * Keep the arithmetic honest: cost per lead = spend / leads, and the weekly
 * leads should add up to the total.
 * ROAS is intentionally omitted: both sample campaigns are lead generation, so
 * there is no revenue to divide by. Add it only for a verified sales campaign.
 */
export const snapshots: Record<PlatformKey, Snapshot> = {
  google: {
    campaignName: "Nairobi Search Campaign",
    objective: "Lead generation",
    dateRange: "Last 30 days (sample period)",
    status: "Active (sample)",
    metrics: [
      { key: "spend", label: "Spend", value: 85000, unit: "kes" },
      { key: "leads", label: "Leads", value: 420, unit: "count" },
      { key: "cpl", label: "Cost per lead", value: 202, unit: "kes" },
      { key: "ctr", label: "CTR", value: 6.8, unit: "percent", decimals: 1 },
      { key: "cvr", label: "Conversion rate", value: 8.4, unit: "percent", decimals: 1 },
    ],
    weekly: [
      { week: "Week 1", leads: 78 },
      { week: "Week 2", leads: 101 },
      { week: "Week 3", leads: 112 },
      { week: "Week 4", leads: 129 },
    ],
    strategyHeading: "How a search campaign like this is run",
    strategy:
      "Spend follows search intent. The campaign targets the phrases buyers type, keeps irrelevant searches out, and sends each click to a page that answers the query.",
    focus: ["Match high-intent keywords", "Block wasted searches with negatives", "Track calls, forms and WhatsApp enquiries"],
    approach: { label: "View the Google Ads approach", to: "/agency/google-ads-management" },
  },
  meta: {
    campaignName: "Lead Generation Campaign",
    objective: "Qualified enquiries",
    dateRange: "Last 30 days (sample period)",
    status: "Active (sample)",
    metrics: [
      { key: "spend", label: "Spend", value: 120000, unit: "kes" },
      { key: "leads", label: "Leads", value: 840, unit: "count" },
      { key: "cpl", label: "Cost per lead", value: 143, unit: "kes" },
      { key: "ctr", label: "CTR", value: 2.9, unit: "percent", decimals: 1 },
      { key: "cvr", label: "Conversion rate", value: 7.1, unit: "percent", decimals: 1 },
    ],
    weekly: [
      { week: "Week 1", leads: 170 },
      { week: "Week 2", leads: 205 },
      { week: "Week 3", leads: 225 },
      { week: "Week 4", leads: 240 },
    ],
    strategyHeading: "How a lead campaign like this is run",
    strategy:
      "Several creative angles run against a defined audience. Weak ads are cut early, strong ones get the budget, and people who showed interest are retargeted.",
    focus: ["Test creative angles in parallel", "Cut weak ads early", "Retarget interested audiences"],
    approach: { label: "View the Meta Ads approach", to: "/agency/meta-ads-management" },
  },
};

/* -------------------------------------------------------------------------- */
/* Process                                                                     */
/* -------------------------------------------------------------------------- */

export const processHeading = "How I approach paid campaigns";

export const processSteps: { n: string; icon: LucideIcon; title: string; desc: string }[] = [
  { n: "01", icon: Compass, title: "Diagnose", desc: "Understand the offer, audience, funnel, current account, tracking, and business goals." },
  { n: "02", icon: BarChart3, title: "Plan", desc: "Choose the right platform, campaign structure, budget, audience, and measurement approach." },
  { n: "03", icon: Wrench, title: "Build", desc: "Set up campaigns, landing-page direction, creative variations, targeting, and conversion tracking." },
  { n: "04", icon: Rocket, title: "Launch", desc: "Launch carefully, monitor early signals, and avoid making decisions from insufficient data." },
  { n: "05", icon: TrendingUp, title: "Improve", desc: "Optimize creative, targeting, bids, budgets, landing pages, and follow-up based on business results." },
];

/* -------------------------------------------------------------------------- */
/* Secondary services                                                          */
/* -------------------------------------------------------------------------- */

export interface SecondaryService {
  anchorId: string;
  icon: LucideIcon;
  title: string;
  desc: string;
  bestFor: string;
  link: { label: string; to: string };
}

export const secondaryHeading = "Additional support around your campaigns";

export const secondaryServices: SecondaryService[] = [
  {
    anchorId: "service-seo-optimization",
    icon: TrendingUp,
    title: "SEO",
    desc: "Build long-term visibility for the searches your customers make.",
    bestFor: "Businesses that want leads that do not stop when the ad budget does",
    link: { label: "Learn more about SEO services", to: "/agency/seo-services-nairobi" },
  },
  {
    anchorId: "service-social-media-management",
    icon: Share2,
    title: "Social Media Management",
    desc: "Create a consistent presence with content people actually stop to notice.",
    bestFor: "Brands getting reach but few enquiries from social",
    link: { label: "Learn more about social media", to: "/agency/social-media-management" },
  },
  {
    anchorId: "service-content-strategy",
    icon: PenLine,
    title: "Content and Creative",
    desc: "Develop campaign messages, visuals, and video ideas that give ads something worth clicking.",
    bestFor: "Campaigns that need stronger messages, visuals, and video",
    link: { label: "See creative work", to: "/work/design" },
  },
  {
    anchorId: "service-digital-marketing-audit",
    icon: ClipboardList,
    title: "Digital Marketing Audit",
    desc: "Find what is wasting time or budget before you spend more.",
    bestFor: "Businesses paying for marketing and unsure what they are getting",
    link: { label: "Learn more about the audit", to: "/agency/digital-marketing-audit" },
  },
];

/**
 * Other existing services. They have no card of their own here, but Pricing links
 * to these anchors, so each keeps a stable id.
 */
export const moreServices: { anchorId: string; label: string }[] = [
  { anchorId: "service-tiktok-ads", label: "TikTok Ads" },
  { anchorId: "service-video-production", label: "Video production" },
  { anchorId: "service-graphic-design", label: "Graphic design" },
  { anchorId: "service-brand-strategy", label: "Brand strategy" },
  { anchorId: "service-strategy-consultation", label: "Strategy consultation" },
];

/* -------------------------------------------------------------------------- */
/* Pricing and offer clarity                                                   */
/* -------------------------------------------------------------------------- */

export const pricingContent = {
  heading: "Simple starting points",
  feeStatement: "Management fee only. Advertising spend is paid directly to Google or Meta.",
  rows: [
    { label: "Meta Ads and social media management", price: "From KES 40,000/month" },
    { label: "Google Ads and SEO", price: "From KES 45,000/month" },
    { label: "Multi-platform retainers", price: "From KES 70,000/month" },
  ],
  assurances: [
    "No lock-in contracts",
    "Direct access to Joseph",
    "Scope based on goals, budget, and campaign complexity",
    "Advertising spend is separate from management fees",
  ],
  link: { label: "See full pricing", to: "/agency/pricing" },
};

/* -------------------------------------------------------------------------- */
/* Closing CTA                                                                 */
/* -------------------------------------------------------------------------- */

export const ctaContent = {
  heading: "Not sure where your next customer should come from?",
  body: "I'll help you identify the right channel, the clearest opportunity, and the next practical step.",
  primary: { label: "Book a Free Strategy Call", to: CALENDLY_URL },
  secondary: { label: "View Case Studies", to: CASE_STUDIES_URL },
};
