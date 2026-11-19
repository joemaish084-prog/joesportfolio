export const PORTFOLIO_PATH = "/portfolio";
export const AUDIT_PATH = "/#audit";

const portfolioAnchors = new Set([
  "home", "case-study", "videos", "graphic-design", "branding", "brand-identity",
  "mockups", "shopify", "about", "about-story", "press", "services", "services-pricing", "agency-promo",
  "media-buying", "skills", "skills-stats", "process", "experience",
  "certifications", "brands", "testimonials", "faq", "contact", "case-study-results",
]);

export const isLegacyPortfolioAnchor = (hash: string) => portfolioAnchors.has(hash.slice(1));

// Fragments from the former agency entry point still land on the original sections.
const legacyAgencyTargets: Record<string, string> = {
  services: "/agency/services",
  results: "/agency/results",
  pricing: "/agency/pricing",
  booking: "/agency/contact",
  contact: "/agency/contact",
  faq: "/#agency-faq",
};

export function legacyAgencyTarget(hash: string) {
  const id = hash.slice(1);
  return Object.prototype.hasOwnProperty.call(legacyAgencyTargets, id)
    ? legacyAgencyTargets[id]
    : id.startsWith("service-") ? `/agency/services#${id}` : undefined;
}
