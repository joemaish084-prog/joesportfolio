import { formatKes, packageFeeKes } from "@/data/services";

const starterFee = formatKes(packageFeeKes("STARTER"));

export const agencyPages = {
  home: {
    path: "/", label: "Agency Home",
    title: "Digital Marketing Agency Nairobi | Joseph Maina Marketing",
    heading: "Digital marketing for Kenyan businesses",
    description: "Book a free marketing audit with Joseph Maina Marketing, a Nairobi agency helping Kenyan and African businesses increase sales with paid ads, SEO and social media.",
    intro: "A direct partnership for paid media, SEO and content, built around your business goals.",
    teaser: "",
  },
  services: {
    path: "/agency/services", label: "Services",
    title: "Digital Marketing Services Nairobi & Kenya | Joseph Maina",
    heading: "Digital marketing services in Nairobi, Kenya",
    description: "Explore Google Ads, Meta Ads, SEO, social media and Shopify store services. Compare scope and pricing for businesses in Kenya and worldwide.",
    intro: "Choose a single channel or combine strategy, campaigns and creative. Start with the service that fits your goals, then read its scope, process and pricing.",
    teaser: "Paid ads, SEO, content and Shopify stores, with a detailed page for each core service.",
  },
  results: {
    path: "/agency/results", label: "Results",
    title: "Digital Marketing Results & Case Studies | Joseph Maina",
    heading: "The work behind the results",
    description: "Explore Joseph Maina's Kenyan campaign results, including Convey Communications and iClear. Read the briefs, creative decisions and campaign breakdowns.",
    intro: "A result is more useful with the campaign behind it. See the challenges, channels and outcomes below, then read the full breakdowns. Past results are specific to each campaign.",
    teaser: "Six tracked case studies covering revenue, return on ad spend and reach, plus written breakdowns.",
  },
  pricing: {
    path: "/agency/pricing", label: "Pricing",
    title: "Digital Marketing Pricing in Kenya | Joseph Maina",
    heading: "Clear pricing, with room for your brief",
    description: `Compare digital marketing retainers from KSh ${starterFee} per month, channel management fees and project services. Advertising spend is billed separately.`,
    intro: "Compare the existing monthly packages and starting fees below. Management and creative fees are separate from your ad spend; the final scope is agreed in your proposal.",
    teaser: `Retainers from KES ${starterFee}/month. Your ad spend is billed separately.`,
  },
  contact: {
    path: "/agency/contact", label: "Contact",
    title: "Contact Joseph Maina Marketing | Nairobi",
    heading: "Let's talk about your business",
    description: "Contact Joseph Maina Marketing in Nairobi for digital marketing support. Book a free 30-minute strategy call, send a project brief or start a conversation on WhatsApp.",
    intro: "Tell me what you sell, who you want to reach and what is getting in the way. Book a free strategy call, send a brief or get in touch directly.",
    teaser: "Book a free 30-minute call, send a project brief or message on WhatsApp.",
  },
} as const;

export type AgencyPageKey = keyof typeof agencyPages;
