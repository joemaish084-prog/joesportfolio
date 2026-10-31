export const agencyPages = {
  home: {
    path: "/agency", label: "Agency Home",
    title: "Digital Marketing Agency Nairobi | Joseph Maina Marketing",
    heading: "Digital marketing for Kenyan businesses",
    description: "Joseph Maina Marketing is a founder-led digital marketing agency in Nairobi. Paid ads, SEO and content for Kenyan businesses. Book a free strategy call.",
    intro: "A direct partnership for paid media, SEO and content, built around your business goals.",
    teaser: "",
  },
  services: {
    path: "/agency/services", label: "Services",
    title: "Digital Marketing Services in Kenya | Joseph Maina",
    heading: "Digital marketing services for your next stage of growth",
    description: "Explore Meta Ads, Google Ads, SEO, social media and lead generation services in Kenya. Compare the scope and find the right support for your business.",
    intro: "Choose a single channel or combine strategy, campaigns and creative. Start with the service that fits your goals, then read its scope, process and pricing.",
    teaser: "Meta, Google and TikTok Ads, SEO, social and content, with a detailed page for each core service.",
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
    description: "Compare digital marketing retainers from KSh 40,000 per month, channel management fees and project services. Advertising spend is billed separately.",
    intro: "Compare the existing monthly packages and starting fees below. Management and creative fees are separate from your ad spend; the final scope is agreed in your proposal.",
    teaser: "Retainers from KES 40,000/month. Your ad spend is billed separately.",
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

// Old fragments aren't sent to the server. Resolve them in the browser, while
// new internal links go straight to the relevant crawlable page.
export const legacyAgencyTargets: Record<string, string> = {
  services: "/agency/services", results: "/agency/results", pricing: "/agency/pricing",
  booking: "/agency/contact", contact: "/agency/contact",
};

export function legacyAgencyTarget(hash: string) {
  const id = hash.replace(/^#/, "");
  return legacyAgencyTargets[id] ?? (id.startsWith("service-") ? `/agency/services#${id}` : undefined);
}
