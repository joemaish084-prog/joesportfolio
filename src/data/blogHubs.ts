import { BarChart3, ClipboardList, Search, Share2, Target, Video } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { blogPosts, type BlogPost } from "@/data/blogPosts";

export interface HubService {
  name: string;
  price: string;
  blurb: string;
  href: string;
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
      href: "/agency#services",
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
      "lead-generation-campaigns-kenya-2026",
      "ad-mistakes-nairobi-smes-keep-making-2026",
      "peak-season-marketing-kenya-2026",
    ],
    service: {
      name: "Google Ads Management",
      price: "From KES 45,000/month",
      blurb:
        "Search, Display and YouTube campaigns, keyword research, bid management, conversion tracking and monthly reporting.",
      href: "/agency#services",
    },
    cta: {
      heading: "Not sure Google Ads is the right first channel?",
      body:
        "That is exactly the call to have before you spend anything. Thirty minutes, no charge, and I'll tell you if search is wrong for your business.",
      label: "Book a Google Ads Strategy Call",
      href: CALENDLY_URL,
      external: true,
    },
    metaTitle: "Google Ads in Kenya — Costs, Lead Generation and Channel Choice",
    metaDescription:
      "Guides on Google Ads for Kenyan businesses: management costs, Google vs Meta, lead generation campaigns that convert, and peak season planning.",
  },
  {
    slug: "seo",
    name: "SEO & Local Search",
    icon: Search,
    tagline: "Getting found on Google in Nairobi without paying for every click.",
    intro: [
      "Most Nairobi businesses are invisible in search and have no idea, because nobody ever tells them. The fixes are usually unglamorous: a properly filled Google Business Profile, pages built around what customers actually type, and a site that loads on a Kenyan mobile connection.",
      "These articles cover the diagnosis, the realistic cost of fixing it, and the local search work that moves the needle fastest.",
    ],
    postSlugs: [
      "why-your-nairobi-business-isnt-showing-up-on-google-2026",
      "google-business-profile-setup-nairobi-2026",
      "seo-pricing-for-kenyan-smes-2026",
      "what-a-digital-marketing-audit-finds-kenya-2026",
    ],
    service: {
      name: "SEO Optimization",
      price: "From KES 45,000/month",
      blurb: "On-page, technical and local SEO built around how Kenyan customers actually search.",
      href: "/agency#services",
    },
    cta: {
      heading: "Find out why you are not ranking",
      body:
        "A free call, or a full KES 40,000 audit if you want the whole picture in writing. Either way you'll know what is holding the site back.",
      label: "Book an SEO Review Call",
      href: CALENDLY_URL,
      external: true,
    },
    metaTitle: "SEO for Kenyan Businesses — Local Search, Pricing and Google Business Profile",
    metaDescription:
      "Practical SEO guides for Nairobi and Kenyan businesses: why you are not ranking, what SEO costs, and how to set up Google Business Profile properly.",
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
      href: "/agency#services",
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
  {
    slug: "hiring-an-agency",
    name: "Hiring an Agency",
    icon: ClipboardList,
    tagline: "How to choose, what to pay, and why most marketing budgets fail.",
    intro: [
      "Most Kenyan SMEs who tell me marketing does not work for them have paid someone before. The budget was rarely the problem — the brief, the expectations and the fit were.",
      "These are the honest ones: how to vet an agency, what an audit actually surfaces, how I price, and why I turn work down.",
    ],
    postSlugs: [
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
        "A full-channel performance review of your ads, site, search presence and tracking, delivered in writing with a prioritised fix list.",
      href: "/agency#services",
    },
    cta: {
      heading: "Start with an audit, not a retainer",
      body:
        "If you are not sure what you need yet, the audit is the cheapest way to find out. Or book a free call and I'll tell you if it is even worth it.",
      label: "Request an Audit",
      href: "/agency#booking",
    },
    metaTitle: "Hiring a Digital Marketing Agency in Kenya — Checklists and Honest Advice",
    metaDescription:
      "How to choose a digital marketing agency in Nairobi, what an audit finds, what fair pricing looks like, and why most Kenyan SME marketing budgets fail.",
  },
];

export const getHubBySlug = (slug?: string) => blogHubs.find((h) => h.slug === slug);

/** Posts belonging to a hub, resolved and filtered to slugs that actually exist. */
export const getHubPosts = (hub: BlogHub): BlogPost[] =>
  hub.postSlugs
    .map((slug) => blogPosts.find((p) => p.slug === slug))
    .filter((p): p is BlogPost => Boolean(p));

/** Every hub that features a given post. A post can sit in more than one hub. */
export const getHubsForPost = (slug: string) => blogHubs.filter((h) => h.postSlugs.includes(slug));

/** The hub used for breadcrumbs on a post page. */
export const getPrimaryHubForPost = (slug: string) => getHubsForPost(slug)[0];

/**
 * Posts related to a given one: hub siblings first, then anything sharing the
 * category, so recommendations stay inside the topic the reader is already in.
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
