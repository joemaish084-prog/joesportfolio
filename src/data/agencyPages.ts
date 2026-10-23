export const agencyPages = {
  home: {
    path: "/agency", label: "Agency Home",
    title: "Digital Marketing Agency Nairobi | Joseph Maina",
    heading: "Digital marketing for Kenyan businesses",
    description: "Paid ads, SEO and content for Kenyan businesses. Explore Joseph Maina's agency services, campaign results and pricing, or book a free discovery call.",
    intro: "A direct partnership for paid media, SEO and content, built around your business goals.",
  },
  services: {
    path: "/agency/services", label: "Services",
    title: "Digital Marketing Services in Kenya | Joseph Maina",
    heading: "Digital marketing services for your next stage of growth",
    description: "Explore Meta Ads, Google Ads, SEO, social media and lead generation services in Kenya. Compare the scope and find the right support for your business.",
    intro: "Choose a single channel or combine strategy, campaigns and creative. Start with the service that fits your goals, then read its scope, process and pricing.",
  },
  results: {
    path: "/agency/results", label: "Results",
    title: "Digital Marketing Results & Case Studies | Joseph Maina",
    heading: "The work behind the results",
    description: "Explore Joseph Maina's Kenyan campaign results, including Convey Communications and iClear. Read the briefs, creative decisions and campaign breakdowns.",
    intro: "A result is more useful with the campaign behind it. See the challenges, channels and outcomes below, then read the full breakdowns. Past results are specific to each campaign.",
  },
  pricing: {
    path: "/agency/pricing", label: "Pricing",
    title: "Digital Marketing Pricing in Kenya | Joseph Maina",
    heading: "Clear pricing, with room for your brief",
    description: "Compare digital marketing retainers from KSh 40,000 per month, channel management fees and project services. Advertising spend is billed separately.",
    intro: "Compare the existing monthly packages and starting fees below. Management and creative fees are separate from your ad spend; the final scope is agreed in your proposal.",
  },
  contact: {
    path: "/agency/contact", label: "Contact",
    title: "Contact Joseph Maina's Marketing Agency | Nairobi",
    heading: "Let's talk about your business",
    description: "Contact Joseph Maina in Nairobi for digital marketing support. Book a free 30-minute discovery call, send a project brief or start a conversation on WhatsApp.",
    intro: "Tell me what you sell, who you want to reach and what is getting in the way. Book a free discovery call, send a brief or get in touch directly.",
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
