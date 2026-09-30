import { BarChart3, ClipboardList, Magnet, MapPin, Share2, Tag, Target, Video } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { blogPosts, type BlogPost } from "@/data/blogPosts";
import { getServicePageBySlug } from "@/data/servicePages";

export interface HubService {
  name: string;
  price: string;
  blurb: string;
  /** Fallback target used while the dedicated service page is still a draft. */
  href: string;
  /** Slug in servicePages. Once that page is live it becomes the link target. */
  pageSlug?: string;
}

export interface HubCta {
  heading: string;
  body: string;
  label: string;
  href: string;
  external?: boolean;
}

export interface BlogHub {
  slug: string;
  name: string;
  icon: LucideIcon;
  /** One line used on hub cards and in the blog index. */
  tagline: string;
  /** Short introduction shown at the top of the hub page. */
  intro: string[];
  /** The most important articles for this topic, in reading order. */
  postSlugs: string[];
  service: HubService;
  cta: HubCta;
  metaTitle: string;
  metaDescription: string;
}

const CALENDLY_URL = "https://calendly.com/joemaish084/30min";

export const blogHubs: BlogHub[] = [
  {
    slug: "meta-ads",
    name: "Meta Ads",
    icon: Target,
    tagline: "Budgets, creative testing and the mistakes that quietly drain spend.",
    intro: [
      "Facebook and Instagram are still where most Kenyan SMEs get their cheapest reach, and also where most of them waste the most money. The difference is rarely the budget. It is the creative, the structure of the account and how long you let a losing ad run.",
      "These are the pieces I point clients to most often before we launch anything on Meta — what to spend, what to test, and what to stop doing.",
    ],
    postSlugs: [
      "how-much-should-a-kenyan-sme-spend-on-meta-ads",
      "ad-mistakes-nairobi-smes-keep-making-2026",
      "video-ads-vs-static-ads-kenya-2026",
      "ad-creative-testing-kenyan-brands-2026",
      "google-ads-vs-meta-ads-kenya-2026",
    ],
    service: {
      name: "Meta Ads Management",
      price: "From KES 40,000/month",
      blurb:
        "Campaign strategy and setup, audience research, creative direction, weekly optimization and monthly reporting.",
      href: "/agency#service-meta-ads",
      pageSlug: "meta-ads-management",
    },
    cta: {
      heading: "Want your Meta account looked at properly?",
      body:
        "Book a free 30-minute call and I'll walk through your current campaigns, spend and creative, and tell you plainly where the money is leaking.",
      label: "Book a Meta Ads Strategy Call",
      href: CALENDLY_URL,
      external: true,
    },
    metaTitle: "Meta Ads for Kenyan Businesses — Guides, Budgets and Creative Testing",
    metaDescription:
      "Everything I've written about running Meta Ads in Kenya: what to spend, which creative converts, how to test, and the mistakes Nairobi SMEs keep repeating.",
  },
  {
    slug: "google-ads",
    name: "Google Ads & Search",
    icon: BarChart3,
    tagline: "What management actually costs, and when search beats social.",
    intro: [
      "Google Ads works best when someone is already looking for what you sell. That makes it the stronger first channel for some businesses and a waste of money for others, and the pricing conversation is where most Kenyan SMEs get misled.",
      "Start here if you are deciding between search and social, or trying to work out what a fair retainer looks like.",
    ],
    postSlugs: [
      "google-ads-cost-kenya-2026",
      "google-ads-vs-meta-ads-kenya-2026",
      "ad-mistakes-nairobi-smes-keep-making-2026",
      "peak-season-marketing-kenya-2026",
    ],
    service: {
      name: "Google Ads Management",
      price: "From KES 45,000/month",
      blurb:
        "Search, Display and YouTube campaigns, keyword research, bid management, conversion tracking and monthly reporting.",
      href: "/agency#service-google-ads",
      pageSlug: "google-ads-management",
    },
    cta: {
      heading: "Not sure Google Ads is the right first channel?",
      body:
        "That is exactly the call to have before you spend anything. Thirty minutes, no charge, and I'll tell you if search is wrong for your business.",
      label: "Book a Google Ads Strategy Call",
      href: CALENDLY_URL,
      external: true,
    },
    metaTitle: "Google Ads in Kenya — Costs, Channel Choice and Campaign Guides",
    metaDescription:
      "Guides on Google Ads for Kenyan businesses: management costs, Google vs Meta, the mistakes that waste budget, and peak season planning.",
  },
  {
    slug: "local-seo",
    name: "Local SEO for Nairobi",
    icon: MapPin,
    tagline: "Getting found on Google and Maps without paying for every click.",
    intro: [
      "Most Nairobi businesses are invisible in local search and have no idea, because nobody ever tells them. The fixes are usually unglamorous: a properly filled Google Business Profile, pages built around what customers actually type, and a site that loads on a Kenyan mobile connection.",
      "These articles cover the diagnosis, the realistic cost of fixing it, and the local search work that moves the needle fastest.",
    ],
    postSlugs: [
      "why-your-nairobi-business-isnt-showing-up-on-google-2026",
      "google-business-profile-setup-nairobi-2026",
      "seo-pricing-for-kenyan-smes-2026",
    ],
    service: {
      name: "SEO Optimization",
      price: "From KES 45,000/month",
      blurb:
        "On-page, technical and local SEO built around how Kenyan customers actually search, including Google Business Profile and Maps visibility.",
      href: "/agency#service-seo-optimization",
      pageSlug: "seo-services-nairobi",
    },
    cta: {
      heading: "Find out why you are not ranking",
      body:
        "A free call, or a full KES 40,000 audit if you want the whole picture in writing. Either way you'll know what is holding the site back.",
      label: "Book an SEO Review Call",
      href: CALENDLY_URL,
      external: true,
    },
    metaTitle: "Local SEO for Nairobi Businesses — Google Business Profile, Maps and Rankings",
    metaDescription:
      "Local SEO guides for Nairobi and Kenyan businesses: why you are not showing up on Google, how to set up Google Business Profile properly, and what SEO costs.",
  },
  {
    slug: "lead-generation",
    name: "Lead Generation",
    icon: Magnet,
    tagline: "Turning clicks into actual enquiries, and enquiries into sales.",
    intro: [
      "Traffic is not the problem for most Kenyan SMEs. The gap is between the click and the enquiry, and then between the enquiry and someone actually following up on it. A campaign can look healthy in Ads Manager and still produce nothing you can bank.",
      "This hub covers where leads come from, why ads get clicks but no calls, and what happens on WhatsApp after the lead lands.",
    ],
    postSlugs: [
      "lead-generation-campaigns-kenya-2026",
      "whatsapp-as-a-sales-channel-kenya-2026",
      "ad-mistakes-nairobi-smes-keep-making-2026",
      "ad-creative-testing-kenyan-brands-2026",
      "convey-communications-case-study-10x-leads",
    ],
    service: {
      name: "GROWTH Retainer — Lead Generation",
      price: "From KES 70,000/month",
      blurb:
        "Two platforms managed end to end: full campaign management, creative direction, weekly optimization, bi-weekly reporting and WhatsApp support.",
      href: "/agency#services",
      pageSlug: "lead-generation",
    },
    cta: {
      heading: "Getting clicks but no enquiries?",
      body:
        "That is usually fixable in weeks, not months, and it is the first thing I look at on a call. Bring your numbers and we'll find the break.",
      label: "Book a Lead Generation Call",
      href: CALENDLY_URL,
      external: true,
    },
    metaTitle: "Lead Generation for Kenyan Businesses — Campaigns, WhatsApp and Follow-Up",
    metaDescription:
      "How Kenyan SMEs actually generate leads online: campaigns that convert, why ads get clicks but no enquiries, and using WhatsApp as a sales channel.",
  },
  {
    slug: "pricing-and-buying",
    name: "Pricing & Buying Advice",
    icon: Tag,
    tagline: "What marketing costs in Kenya, and how to buy it without getting burned.",
    intro: [
      "Almost every Kenyan SME that tells me marketing does not work for them has paid someone before. The budget was rarely the problem — the brief, the expectations and the fit were. And nobody publishes real numbers, which makes the whole thing easy to get wrong.",
      "These are the honest ones: what things cost, how to vet whoever you are about to hire, what an audit actually surfaces, and why I turn work down.",
    ],
    postSlugs: [
      "seo-pricing-for-kenyan-smes-2026",
      "google-ads-cost-kenya-2026",
      "how-to-choose-a-digital-marketing-agency-nairobi-2026",
      "what-a-digital-marketing-audit-finds-kenya-2026",
      "real-reason-kenyan-smes-fail-at-marketing",
      "what-nobody-tells-you-about-pricing-your-services-kenya",
      "why-i-stopped-taking-every-client-who-could-pay",
      "ai-marketing-honest-take-2026",
    ],
    service: {
      name: "Digital Marketing Audit",
      price: "KES 40,000",
      blurb:
        "A full-channel review of your ads, site, search presence and tracking, delivered in writing with a prioritised fix list and honest pricing guidance.",
      href: "/agency#service-digital-marketing-audit",
      pageSlug: "digital-marketing-audit",
    },
    cta: {
      heading: "Start with an audit, not a retainer",
      body:
        "If you are not sure what you need yet, the audit is the cheapest way to find out. Or book a free call and I'll tell you if it is even worth it.",
      label: "Request an Audit",
      href: "/agency#booking",
    },
    metaTitle: "What Digital Marketing Costs in Kenya — Pricing and Buying Advice",
    metaDescription:
      "Real numbers on what SEO, Google Ads and marketing retainers cost in Kenya, how to choose an agency in Nairobi, and what a digital marketing audit finds.",
  },
  {
    slug: "tiktok-and-social",
    name: "TikTok & Social",
    icon: Video,
    tagline: "Short-form video, platform choice and turning attention into sales.",
    intro: [
      "Organic reach on TikTok in Kenya is still cheaper than anything you can buy, but only if the creative earns it. Choosing the wrong platform for your audience, or treating TikTok like Instagram, wastes the whole advantage.",
      "Here is how I think about platform choice, what a campaign that reached four million views actually looked like, and where the sale eventually closes.",
    ],
    postSlugs: [
      "tiktok-vs-instagram-for-kenyan-brands-2026",
      "0-to-4-million-tiktok-views-behind-the-campaign",
      "video-ads-vs-static-ads-kenya-2026",
      "whatsapp-as-a-sales-channel-kenya-2026",
    ],
    service: {
      name: "TikTok Ads & Social Media Management",
      price: "From KES 40,000/month",
      blurb:
        "Campaign strategy, creative direction, audience targeting and community management across TikTok and Instagram.",
      href: "/agency#service-tiktok-ads",
      pageSlug: "social-media-management",
    },
    cta: {
      heading: "Want short-form video that actually performs?",
      body:
        "Bring me your product and audience on a free call and I'll tell you whether TikTok, Instagram or neither is where your budget belongs.",
      label: "Book a Social Strategy Call",
      href: CALENDLY_URL,
      external: true,
    },
    metaTitle: "TikTok & Social Media Marketing for Kenyan Brands",
    metaDescription:
      "TikTok and social media guides for Kenyan brands: platform choice, short-form video that converts, and using WhatsApp as a real sales channel.",
  },
  {
    slug: "case-studies",
    name: "Campaign Case Studies",
    icon: Share2,
    tagline: "Real campaigns, real numbers, including what did not work.",
    intro: [
      "Numbers with the campaign behind them are more useful than a portfolio of logos. Each of these breaks down the brief, the budget, the creative decisions and the result — including the parts that went sideways.",
      "If you want to know how I actually work before you hire me, read these rather than the services page.",
    ],
    postSlugs: [
      "convey-communications-case-study-10x-leads",
      "0-to-4-million-tiktok-views-behind-the-campaign",
      "nyeri-county-campaign-hyper-local-marketing",
      "how-i-landed-national-press-coverage-for-iclear",
      "iclear-water-initiative-baobab-school",
    ],
    service: {
      name: "Full Performance Marketing Retainers",
      price: "From KES 40,000/month",
      blurb:
        "The STARTER, GROWTH and SCALE retainers behind these campaigns — scoped to your ad spend and number of platforms.",
      href: "/agency#services",
      pageSlug: "digital-marketing-kenya",
    },
    cta: {
      heading: "Want results like these for your brand?",
      body:
        "Send me a short brief and I'll come back within 24 hours with a tailored proposal, or book a free call first if you'd rather talk it through.",
      label: "Send a Project Brief",
      href: "/agency#booking",
    },
    metaTitle: "Digital Marketing Case Studies — Kenyan Campaigns and Results",
    metaDescription:
      "Campaign breakdowns from Kenyan brands: 10x qualified leads, 4 million TikTok views, hyper-local county campaigns and national press coverage.",
  },
];

export const getHubBySlug = (slug?: string) => blogHubs.find((h) => h.slug === slug);

/**
 * Where a hub's "related service" link should point. Prefers the dedicated
 * service page, but falls back to the agency-page anchor while that page is
 * still a draft, so live pages never link readers into unreviewed copy.
 */
export const resolveHubServiceHref = (hub: BlogHub) => {
  const page = hub.service.pageSlug ? getServicePageBySlug(hub.service.pageSlug) : undefined;
  return page && !page.draft ? `/agency/${page.slug}` : hub.service.href;
};

/** Posts belonging to a hub, resolved and filtered to slugs that actually exist. */
export const getHubPosts = (hub: BlogHub): BlogPost[] =>
  hub.postSlugs
    .map((slug) => blogPosts.find((p) => p.slug === slug))
    .filter((p): p is BlogPost => Boolean(p));

/** Every hub that features a given post. A post can sit in more than one hub. */
export const getHubsForPost = (slug: string) => blogHubs.filter((h) => h.postSlugs.includes(slug));

/** The hub used for breadcrumbs, the in-article service link and the CTA. */
export const getPrimaryHubForPost = (slug: string) => getHubsForPost(slug)[0];

/**
 * Posts related to a given one: hub siblings first, then anything sharing the
 * category, so recommendations stay inside the topic the reader is already in.
 * Always returns at least `limit` posts where the blog is big enough, which is
 * what guarantees the "every post links to two other articles" rule.
 */
export const getRelatedByHub = (slug: string, limit = 3): BlogPost[] => {
  const post = blogPosts.find((p) => p.slug === slug);
  if (!post) return [];

  const seen = new Set<string>([slug]);
  const picks: BlogPost[] = [];

  const push = (candidate?: BlogPost) => {
    if (!candidate || seen.has(candidate.slug) || picks.length >= limit) return;
    seen.add(candidate.slug);
    picks.push(candidate);
  };

  getHubsForPost(slug).forEach((hub) => getHubPosts(hub).forEach(push));
  blogPosts.filter((p) => p.category === post.category).forEach(push);
  blogPosts.forEach(push);

  return picks;
};

/** Posts not featured in any hub, so the index never silently drops an article. */
export const getUnhubbedPosts = (): BlogPost[] =>
  blogPosts.filter((p) => getHubsForPost(p.slug).length === 0);
