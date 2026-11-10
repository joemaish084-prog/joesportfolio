import { getServicePageBySlug, type ServicePage } from "@/data/servicePages";

/**
 * Which service page each article sends readers to. Every article links to the
 * service closest to its topic, so service pages collect internal links from
 * the blog instead of competing with it (see the 31 Oct 2026 service SEO audit).
 *
 * Articles not listed fall back to their topic hub's service, then to
 * Digital Marketing for Kenyan SMEs.
 */
const SERVICE_POSTS: Record<string, string[]> = {
  "meta-ads-management": [
    "ad-creative-fatigue-signs-kenya-2026",
    "meta-ads-account-structure-small-budget-kenya-2026",
    "how-much-should-a-kenyan-sme-spend-on-meta-ads",
    "meta-ads-turnaround-case-study-kenya-2026",
    "boost-post-vs-ads-manager-kenya-2026",
    "meta-sales-campaign-types-ranked-case-study-2026",
    "ad-mistakes-nairobi-smes-keep-making-2026",
    "video-ads-vs-static-ads-kenya-2026",
    "ad-creative-testing-kenyan-brands-2026",
    "google-ads-vs-meta-ads-kenya-2026",
    "meta-advantage-plus-ai-campaigns-kenya-2026",
    "meta-ads-manager-setup-guide-kenya-2026",
    "meta-pixel-conversions-api-setup-kenya-2026",
    "click-to-whatsapp-ads-kenya-2026",
    "meta-retargeting-small-budget-kenya-2026",
    "how-to-read-meta-ads-report-kenya-2026",
  ],
  "google-ads-management": [
    "responsive-search-ads-headlines-kenya-2026",
    "google-ads-bidding-strategies-explained-kenya-2026",
    "google-ads-cost-kenya-2026",
    "google-ads-launch-case-study-kenya-2026",
    "how-to-create-successful-ppc-campaign-kenya-2026",
    "average-cost-per-click-google-ads-kenya-2026",
    "best-tools-managing-google-ads-kenya-2026",
    "google-ads-account-setup-guide-kenya-2026",
    "google-ads-conversion-tracking-kenya-2026",
    "google-ads-manager-mcc-explained-kenya-2026",
    "google-ads-quality-score-kenya-2026",
    "google-local-services-ads-kenya-2026",
    "google-performance-max-kenya-2026",
    "google-shopping-ads-merchant-center-kenya-2026",
    "negative-keywords-google-ads-kenya-2026",
    "peak-season-marketing-kenya-2026",
    "youtube-ads-for-kenyan-businesses-2026",
  ],
  "seo-services-nairobi": [
    "core-web-vitals-website-speed-kenya-2026",
    "how-google-maps-ranks-businesses-nairobi-2026",
    "why-your-nairobi-business-isnt-showing-up-on-google-2026",
    "seo-pricing-for-kenyan-smes-2026",
    "google-business-profile-setup-nairobi-2026",
    "ai-search-chatgpt-local-business-kenya-2026",
    "get-more-google-reviews-nairobi-2026",
    "local-backlinks-citations-kenya-2026",
    "local-keyword-research-nairobi-2026",
    "location-pages-seo-nairobi-2026",
  ],
  "social-media-management": [
    "short-video-editing-workflow-small-business-kenya-2026",
    "community-management-replying-to-comments-kenya-2026",
    "social-media-marketing-services-kenya-cost-2026",
    "how-to-develop-social-media-marketing-strategy-kenya-2026",
    "best-social-media-platforms-for-marketing-kenya-2026",
    "best-social-media-marketing-tools-kenya-2026",
    "instagram-reels-vs-tiktok-for-business-kenya-2026",
    "instagram-577000-views-one-week-case-study-2026",
    "linkedin-for-b2b-marketing-kenya-2026",
    "sheng-in-ads-when-it-sells-kenya-2026",
    "social-media-content-calendar-small-business-kenya-2026",
    "tiktok-vs-instagram-for-kenyan-brands-2026",
    "working-with-creators-influencers-kenya-2026",
    // TikTok and video articles, until those services have their own pages.
    "tiktok-ads-manager-setup-guide-kenya-2026",
    "tiktok-spark-ads-kenya-2026",
    "tiktok-marketing-strategy-brand-awareness-kenya-2026",
    "0-to-4-million-tiktok-views-behind-the-campaign",
    "video-production-for-small-businesses-kenya-2026",
    "video-hooks-first-three-seconds-kenya-2026",
  ],
  "lead-generation": [
    "property-leads-lost-in-the-inbox-case-study-2026",
    "whatsapp-broadcast-vs-email-marketing-kenya-2026",
    "lead-qualification-questions-whatsapp-kenya-2026",
    "lead-generation-campaigns-kenya-2026",
    "good-cost-per-lead-kenya-2026",
    "convey-communications-case-study-10x-leads",
    "dm-for-price-is-costing-you-sales-kenya-2026",
    "data-protection-act-marketing-kenya-2026",
    "landing-page-that-converts-kenya-2026",
    "lead-magnets-for-kenyan-businesses-2026",
    "whatsapp-as-a-sales-channel-kenya-2026",
    "whatsapp-lead-follow-up-system-kenya-2026",
  ],
  "digital-marketing-audit": [
    "marketing-contract-checklist-kenya-2026",
    "marketing-retainer-vs-project-vs-commission-kenya-2026",
    "what-a-digital-marketing-audit-finds-kenya-2026",
    "is-your-marketing-actually-paying-kenya-2026",
    "how-to-choose-a-digital-marketing-agency-nairobi-2026",
    "ai-marketing-honest-take-2026",
    "digital-marketing-budget-kenyan-sme-2026",
    "freelance-digital-marketer-vs-agency-kenya-2026",
    "hire-in-house-marketer-or-outsource-kenya-2026",
    "how-much-does-a-website-cost-kenya-2026",
    "real-reason-kenyan-smes-fail-at-marketing",
    "what-does-a-digital-marketing-specialist-do-kenya-2026",
    "what-nobody-tells-you-about-pricing-your-services-kenya",
    "who-owns-your-ad-account-kenya-2026",
    "why-i-stopped-taking-every-client-who-could-pay",
    // Until a Brand Strategy page exists.
    "brand-strategy-before-running-ads-kenya-2026",
  ],
  "digital-marketing-kenya": [
    "seven-lessons-two-platforms-one-retailer-case-study-2026",
    "digital-marketing-for-ecommerce-kenya-2027",
    "digital-marketing-for-real-estate-kenya-2027",
    "digital-marketing-for-clinics-healthcare-kenya-2026",
    "digital-marketing-for-restaurants-kenya-2027",
    "digital-marketing-for-salons-and-spas-kenya-2026",
    "digital-marketing-for-schools-kenya-2026",
    "marketing-your-airbnb-kenya-2027",
    "chatgpt-ads-what-kenyan-businesses-should-do-now",
    "what-matatus-teach-brands-about-getting-noticed",
    "meta-and-google-ads-together-case-study-kenya-2026",
    "how-i-landed-national-press-coverage-for-iclear",
    "iclear-water-initiative-baobab-school",
    "nyeri-county-campaign-hyper-local-marketing",
    "514000-people-kes-8255-awareness-case-study-2026",
  ],
};

const POST_TO_SERVICE = new Map<string, string>(
  Object.entries(SERVICE_POSTS).flatMap(([service, posts]) => posts.map((post) => [post, service] as const)),
);

export const FALLBACK_SERVICE_SLUG = "digital-marketing-kenya";

/** Article slugs assigned to each service, for checks and reports. */
export const servicePostSlugs = SERVICE_POSTS;

/**
 * The live service page an article should link to. `hubServiceSlug` is the
 * article's topic hub service, used when the article has no explicit entry.
 */
export function getServiceForPost(postSlug: string, hubServiceSlug?: string): ServicePage | undefined {
  for (const candidate of [POST_TO_SERVICE.get(postSlug), hubServiceSlug, FALLBACK_SERVICE_SLUG]) {
    const page = getServicePageBySlug(candidate);
    if (page && !page.draft) return page;
  }
  return undefined;
}

/** Descriptive anchor text for links to a service page. */
export const serviceLinkLabel = (page: ServicePage) => `See ${page.navLabel} service and pricing`;
