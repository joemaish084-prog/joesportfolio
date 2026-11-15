import { BarChart3, Compass, Rocket, TrendingUp, Wrench } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { CALENDLY_URL } from "@/data/servicePages";

/**
 * Copy, links and small lists for the /agency/services page that do not live in
 * src/data/services.ts. Prices, packages, proof and FAQ answers are in that file.
 */

const CASE_STUDIES_URL = "/agency/results";

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
/* Other services                                                              */
/* -------------------------------------------------------------------------- */

export const moreServices: { anchorId: string; label: string }[] = [
  { anchorId: "service-tiktok-ads", label: "TikTok Ads" },
  { anchorId: "service-video-production", label: "Video production" },
  { anchorId: "service-graphic-design", label: "Graphic design" },
  { anchorId: "service-brand-strategy", label: "Brand strategy" },
  { anchorId: "service-strategy-consultation", label: "Strategy consultation" },
];

/* -------------------------------------------------------------------------- */
/* Packages reassurance                                                        */
/* -------------------------------------------------------------------------- */

export const pricingContent = {
  assurances: [
    "No lock-in contracts",
    "Direct access to Joseph",
    "Scope based on goals, budget, and campaign complexity",
    "Advertising spend is separate from management fees",
  ],
};

/* -------------------------------------------------------------------------- */
/* Closing CTA                                                                 */
/* -------------------------------------------------------------------------- */

/** Same number as the contact page and the agency pages, so the link is the same everywhere. */
const WHATSAPP_NUMBER = "254704700160";
const WHATSAPP_MESSAGE = "Hi Joseph! I visited josephmaina.co.ke/agency/services and I'd like to discuss working together.";

export const ctaContent = {
  heading: "Not sure where your next customer should come from?",
  body: "I'll help you identify the right channel, the clearest opportunity, and the next practical step.",
  primary: { label: "Book a Free Strategy Call", to: CALENDLY_URL },
  whatsapp: {
    label: "Message me on WhatsApp",
    to: `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(WHATSAPP_MESSAGE)}`,
  },
  secondary: { label: "View Case Studies", to: CASE_STUDIES_URL },
};

/* -------------------------------------------------------------------------- */
/* FAQ                                                                         */
/* -------------------------------------------------------------------------- */

/** The questions come from `agencyFaqs` in src/data/services.ts. Only the heading copy lives here. */
export const faqContent = {
  eyebrow: "FAQ",
  heading: "Common questions",
  intro: "Still unsure?",
  askLabel: "Ask me directly",
};
