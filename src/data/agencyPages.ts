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
    description: "Explore Kenyan digital marketing case studies with charts for Meta and Google Ads revenue, return on ad spend, and how property enquiries were qualified.",
    intro: "See how campaigns performed across paid search, social and lead generation. Explore the numbers, then read how each campaign was planned, measured and improved.",
    teaser: "Six tracked case studies covering revenue, return on ad spend and reach, plus written breakdowns.",
  },
  pricing: {
    path: "/agency/pricing", label: "Pricing",
    title: "Digital Marketing Pricing in Kenya | Joseph Maina",
    heading: "Clear pricing, with room for your brief",
    description: `Compare digital marketing retainers from KSh ${starterFee} per month, channel management fees and project services. Advertising spend is billed separately.`,
    intro: "Compare monthly packages and standalone services. Your proposal sets out the channels, creative and reporting that fit your brief.",
    teaser: `Retainers from KES ${starterFee}/month. Your ad spend is billed separately.`,
  },
  contact: {
    path: "/agency/contact", label: "Contact",
    title: "Contact Joseph Maina Marketing | Nairobi",
    heading: "Let's talk about your business",
    description: "Contact Joseph Maina Marketing in Nairobi for digital marketing support. Book a free 30-minute strategy call or discuss your project on WhatsApp.",
    intro: "Tell me what you sell, who you want to reach and what is getting in the way. Book a free strategy call or message me on WhatsApp.",
    teaser: "Book a free 30-minute call or message me on WhatsApp.",
  },
} as const;

export type AgencyPageKey = keyof typeof agencyPages;
