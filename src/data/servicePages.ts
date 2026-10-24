import { BarChart3, ClipboardList, Magnet, MapPin, Share2, Target, TrendingUp } from "lucide-react";
import type { LucideIcon } from "lucide-react";

/**
 * "Money pages" — one focused page per search intent, so the agency section does
 * not depend on the blog to rank for commercial queries.
 *
 * Prices, process steps, case study figures and testimonials below are copied
 * from the live agency page and Testimonials component — they are real. Anything
 * I could not source from existing site content is marked [CONFIRM] and the page
 * stays `draft: true`, which keeps it noindex and out of the sitemap until the
 * markers are cleared.
 */

export interface ServiceFaq {
  q: string;
  a: string;
}

export interface ServiceInclusion {
  title: string;
  desc: string;
}

export interface ServiceCaseStudy {
  name: string;
  challenge: string;
  results: string;
  /** Blog post slug for the full write-up, when one exists. */
  readMore?: string;
  /** Direct portfolio link when the case study is not a blog post. */
  href?: string;
}

export interface ServiceTestimonial {
  quote: string;
  name: string;
  role: string;
}

/** An extra titled block between "What is included" and the process, e.g. how creative testing works. */
export interface ServiceSection {
  title: string;
  intro?: string;
  items: ServiceInclusion[];
}

export interface ServicePage {
  slug: string;
  icon: LucideIcon;
  /** H1. Targets one search intent. */
  name: string;
  /** Short label for breadcrumbs and cross-links. */
  navLabel: string;
  metaTitle: string;
  metaDescription: string;
  /** One-sentence positioning under the H1. */
  standfirst: string;
  price: { amount: string; note: string; value?: number };
  whoFor: string[];
  notFor?: string[];
  fitNote?: string;
  included: ServiceInclusion[];
  /** Optional deeper sections (process, reporting). Copy must restate facts already published on the site. */
  sections?: ServiceSection[];
  /** One honest line shown under the case study when proof is limited to what is already on the page. */
  proofNote?: string;
  caseStudy?: ServiceCaseStudy;
  testimonial?: ServiceTestimonial;
  faqs: ServiceFaq[];
  /** Topic hub slug this service reads alongside. */
  hubSlug: string;
  /** Blog post slugs shown as supporting reading. */
  relatedPosts: string[];
  cta: { heading: string; body: string; label: string; href: string; external?: boolean };
  /** True while the page still contains [CONFIRM] markers. Keeps it noindex. */
  draft: boolean;
  /** Open questions for Joseph, surfaced in a review banner on draft pages. */
  reviewNotes: string[];
}

export const CALENDLY_URL = "https://calendly.com/joemaish084/30min";

/** The real five-step onboarding process, shared by every service page. */
export const SERVICE_PROCESS = [
  { title: "Discovery Call", desc: "Free 30-minute call to understand your brand, goals and budget." },
  { title: "Custom Proposal", desc: "I send a tailored proposal within 24 hours — services, pricing and timeline." },
  { title: "Agreement & Deposit", desc: "We agree on terms. 50% deposit paid via M-Pesa to kick things off." },
  { title: "We Launch", desc: "Campaigns go live. You get access to your client portal for real-time updates." },
  { title: "Report & Grow", desc: "Weekly updates and monthly reports. We optimize, scale and keep growing." },
];

/** Real FAQs from the agency page, relevant to every retainer service. */
const SHARED_FAQS: ServiceFaq[] = [
  {
    q: "Do you require long-term contracts?",
    a: "No lock-in contracts. I work on monthly retainers with 30-day notice to end services. I believe in earning your business every month.",
  },
  {
    q: "Do I provide the ad budget separately?",
    a: "Yes. My fee covers management only. Ad spend goes directly to Meta, Google or TikTok. This keeps everything transparent.",
  },
  {
    q: "What makes you different from an agency?",
    a: "Direct access to the person doing the work — not an account manager passing messages. Faster decisions, personal attention, better results.",
  },
];

export const servicePages: ServicePage[] = [
  {
    slug: "digital-marketing-kenya",
    icon: TrendingUp,
    name: "Digital Marketing for Kenyan SMEs",
    navLabel: "Digital Marketing",
    metaTitle: "Digital Marketing for Kenyan SMEs | Joseph Maina, Nairobi",
    metaDescription:
      "Performance marketing for Kenyan small and medium businesses — Meta, Google and TikTok Ads, SEO and lead generation. Retainers from KES 40,000/month.",
    standfirst:
      "I help Kenyan businesses generate more leads and sales through paid and organic channels. One person doing the work, no account managers, no lock-in contracts.",
    price: { amount: "From KES 40,000/month", note: "Management fees are separate from your advertising budget." },
    whoFor: [
      "Kenyan SMEs with a product or service that already sells, who want more of it",
      "Businesses spending on ads without knowing what they get back",
      "Owners tired of paying a retainer and receiving screenshots instead of results",
      "Brands ready to commit at least three months — nothing meaningful happens in four weeks",
    ],
    fitNote: "Best suited to businesses that value steady growth over the lowest price. Results vary, so I don’t promise fixed rankings or lead numbers.",
    included: [
      { title: "Channel strategy", desc: "Which platforms deserve your budget, and which ones do not. Usually fewer than you expect." },
      { title: "Campaign management", desc: "Setup, audience research, creative direction and weekly optimization across the platforms we agree on." },
      { title: "Conversion tracking", desc: "Proper measurement of calls, forms and WhatsApp enquiries, so results are countable rather than assumed." },
      { title: "Reporting you can read", desc: "Weekly updates on WhatsApp and a monthly report in plain language, plus 24/7 client portal access." },
      { title: "Direct access", desc: "You message me, not a team inbox." },
    ],
    caseStudy: {
      name: "Convey Communications",
      challenge: "Low organic reach and stagnant lead flow across digital channels.",
      results: "10x increase in qualified leads and 300%+ engagement growth across Instagram and TikTok in 6 months.",
      readMore: "convey-communications-case-study-10x-leads",
    },
    testimonial: {
      quote:
        "Joseph consistently delivered high-quality designs and campaigns on tight timelines. His ability to blend strategy with creative execution made him an invaluable part of our marketing team.",
      name: "Convey Communications",
      role: "PR Agency",
    },
    faqs: [
      ...SHARED_FAQS,
      {
        q: "How quickly can we get started?",
        a: "After the discovery call and proposal acceptance — we can launch within 3-5 business days.",
      },
      {
        q: "Which channel should a Kenyan SME start with?",
        a: "It depends on whether people already search for what you sell. If they do, Google usually comes first. If they do not know your product exists yet, Meta or TikTok earns attention more cheaply. I'll tell you which on the call rather than selling you both.",
      },
      {
        q: "How long before I see results?",
        a: "Paid ads give us early signs of what’s working, while SEO takes longer. After reviewing your business and goals, I’ll walk you through what to expect and when.",
      },
    ],
    hubSlug: "pricing-and-buying",
    relatedPosts: [
      "real-reason-kenyan-smes-fail-at-marketing",
      "how-to-choose-a-digital-marketing-agency-nairobi-2026",
      "what-a-digital-marketing-audit-finds-kenya-2026",
    ],
    cta: {
      heading: "Start with a free 30-minute call",
      body: "Tell me what you sell and what you have tried. I'll tell you honestly whether I can help and what it would cost.",
      label: "Book a Free Strategy Call",
      href: CALENDLY_URL,
      external: true,
    },
    draft: false,
    reviewNotes: [],
  },
  {
    slug: "meta-ads-management",
    icon: Target,
    name: "Meta Ads Management in Nairobi",
    navLabel: "Meta Ads",
    metaTitle: "Meta Ads Management Nairobi | Facebook & Instagram Ads Kenya",
    metaDescription:
      "Facebook and Instagram ads management for Kenyan businesses from KES 40,000/month. Campaign strategy, creative direction, weekly optimization and monthly reporting.",
    standfirst:
      "Facebook and Instagram are where most Kenyan SMEs get their cheapest reach — and where most of them waste the most money. I run the account so that does not happen.",
    price: { amount: "From KES 40,000/month", note: "Management fee only. Ad spend goes directly to Meta." },
    whoFor: [
      "Businesses selling to Kenyan consumers who are not actively searching yet",
      "Brands with an offer that works offline and needs to work online",
      "Advertisers currently boosting posts and hoping for the best",
      "Anyone whose cost per lead has been climbing without explanation",
    ],
    included: [
      { title: "Campaign strategy and setup", desc: "Account structure, objectives and budget split built around your actual offer." },
      { title: "Audience research", desc: "Targeting built on how Kenyan buyers behave, not a copied interest list." },
      { title: "Creative direction", desc: "What to shoot and what to say, including which format to test first." },
      { title: "Weekly optimization", desc: "Budget moved toward what works and losing ads killed before they drain the month." },
      { title: "Monthly reporting", desc: "Spend, cost per result and what changes next — in language you can act on." },
    ],
    sections: [
      {
        title: "How creative testing works",
        intro: "On Meta, the ad itself does most of the work. So creative is tested on purpose, not left to chance.",
        items: [
          { title: "Several angles at once", desc: "Instead of betting on a single ad, I run a handful of different angles and formats side by side during the first 7–10 days." },
          { title: "Weak ads are cut early", desc: "Underperformers are paused based on click-through rate and cost per result, not on gut feel." },
          { title: "Winners shape the next batch", desc: "The hooks and formats that earn results brief the next round of creative, so each month starts smarter than the last." },
          { title: "Direction, not just a report", desc: "Creative direction is included: what to shoot, what to say and which format to test first. Producing the assets is a separate service." },
        ],
      },
      {
        title: "How reporting works",
        intro: "You should always know what the money is doing, in plain language.",
        items: [
          { title: "Weekly updates", desc: "Performance updates on WhatsApp every week, so you are never chasing for numbers." },
          { title: "A monthly report", desc: "A detailed report by email and in your client portal: spend, cost per result and what changes next." },
          { title: "Tied to leads or sales", desc: "Spend is connected back to leads and revenue impact rather than vanity metrics." },
          { title: "Your client portal", desc: "Campaign status, reports and files are available to you at any time." },
        ],
      },
    ],
    proofNote: "Selected Meta Ads results are available on request.",
    caseStudy: {
      name: "iClear Kenya",
      challenge: "Limited brand awareness in a saturated FMCG market.",
      results: "KES 1.2M+ ad spend managed at 4.2x ROAS, with 180% follower growth.",
      readMore: "how-i-landed-national-press-coverage-for-iclear",
    },
    testimonial: {
      quote:
        "Joseph transformed our social media presence. Our engagement grew by over 300% in just a few months — his video content strategy was a game-changer for iClear.",
      name: "iClear Wellife Service",
      role: "Water Purification Company",
    },
    faqs: [
      ...SHARED_FAQS,
      {
        q: "What is the minimum ad spend worth starting with?",
        a: "I recommend at least KSh 30,000 a month for your Meta ads budget. This goes directly to Meta and is separate from my management fee, which starts at KSh 40,000 a month.",
      },
      {
        q: "Do you produce the creative as well?",
        a: "Creative direction is included — I tell you what to shoot and how to frame the offer. Full video production and graphic design are separate services if you need the assets made.",
      },
      {
        q: "Can you work with my existing Meta account and pixel?",
        a: "Yes, and that is usually better than starting fresh — an account with history and a working pixel learns faster. I audit what is there before changing anything.",
      },
    ],
    hubSlug: "meta-ads",
    relatedPosts: [
      "how-much-should-a-kenyan-sme-spend-on-meta-ads",
      "ad-mistakes-nairobi-smes-keep-making-2026",
      "video-ads-vs-static-ads-kenya-2026",
    ],
    cta: {
      heading: "Want your Meta account looked at properly?",
      body: "Book a free 30-minute call. I'll go through your campaigns, spend and creative and tell you plainly where the money is leaking.",
      label: "Book a Meta Ads Strategy Call",
      href: CALENDLY_URL,
      external: true,
    },
    draft: false,
    reviewNotes: [],
  },
  {
    slug: "google-ads-management",
    icon: BarChart3,
    name: "Google Ads Management in Kenya",
    navLabel: "Google Ads",
    metaTitle: "Google Ads Management Kenya | Shopping & Performance Max",
    metaDescription:
      "Google Ads management in Kenya from KES 45,000/month. Search, Shopping, Performance Max, Display and YouTube campaigns with conversion tracking and reporting.",
    standfirst:
      "Google works best when someone is already looking for what you sell. If that is your business, it is usually the cheapest lead you will ever buy — once the account stops wasting clicks.",
    price: { amount: "From KES 45,000/month", note: "Management fee only. Ad spend goes directly to Google." },
    whoFor: [
      "Businesses whose customers actively search — services, repairs, B2B, professional practices",
      "Advertisers whose budget disappears on broad match with nothing to show",
      "Companies with a phone line or WhatsApp that converts enquiries well",
      "Anyone who has never had conversion tracking set up correctly",
    ],
    included: [
      { title: "Search, Shopping, Performance Max, Display and YouTube", desc: "I recommend the campaign types that fit your business, budget and goals." },
      { title: "Keyword research and strategy", desc: "Built around the phrases Kenyan customers actually type, including negatives to stop waste." },
      { title: "Bid management", desc: "Ongoing bid and budget control so you are not paying premium prices for low-intent clicks." },
      { title: "Conversion tracking", desc: "Calls, forms and WhatsApp enquiries measured properly — this is the step most accounts are missing." },
      { title: "Monthly reporting", desc: "What you spent, what it returned, and what changes next month." },
    ],
    sections: [
      {
        title: "How tracking and reporting work",
        intro: "Google can only optimise for what it can see, so measurement comes before spend.",
        items: [
          { title: "Enquiries measured properly", desc: "Calls, forms and WhatsApp enquiries are tracked as conversions, so the account learns from real enquiries rather than clicks." },
          { title: "Waste is cut continuously", desc: "Negative keywords and bids are adjusted so budget does not drift toward low-intent searches." },
          { title: "Weekly updates", desc: "Performance updates on WhatsApp every week, so you are never chasing for numbers." },
          { title: "A monthly report", desc: "A detailed report by email and in your client portal: what you spent, what it returned and what changes next." },
        ],
      },
    ],
    caseStudy: {
      name: "Google Ads launch for a Kenyan beauty retailer",
      challenge: "The business had never run Google Ads. I launched Search campaigns, then added Shopping ads.",
      results: "KSh 1.94M in revenue attributed by Google Ads, 339 tracked orders and 15.5x return on ad spend from 1 August to 8 October 2026. The client is not named.",
      href: "/work/case-studies#google-ads-launch",
    },
    faqs: [
      ...SHARED_FAQS,
      {
        q: "Is Google Ads better than Meta Ads for my business?",
        a: "Only if people already search for what you sell. If they do not know the product category exists, search volume will be too thin and Meta is the better first channel. I wrote a full comparison, and I'll give you a straight answer on the call.",
      },
      {
        q: "Why is my current Google Ads account spending with no leads?",
        a: "In most accounts I audit it is one of four things: broad match with no negative keywords, ads pointing at a homepage instead of a relevant page, no conversion tracking so Google is optimising blind, or bidding on terms that describe your industry rather than your customer's problem.",
      },
      {
        q: "Do you handle Google Ads for e-commerce and Shopping campaigns?",
        a: "Yes. I manage Google Shopping and Performance Max campaigns for e-commerce businesses. I’ll recommend the right setup for your products, budget and goals.",
      },
    ],
    hubSlug: "paid-search",
    relatedPosts: [
      "google-ads-cost-kenya-2026",
      "google-ads-vs-meta-ads-kenya-2026",
      "lead-generation-campaigns-kenya-2026",
    ],
    cta: {
      heading: "Not sure Google Ads is the right channel?",
      body: "That is exactly the call to have before you spend anything. Thirty minutes, no charge, and I'll tell you if search is wrong for your business.",
      label: "Book a Google Ads Strategy Call",
      href: CALENDLY_URL,
      external: true,
    },
    draft: false,
    reviewNotes: [],
  },
  {
    slug: "seo-services-nairobi",
    icon: MapPin,
    name: "SEO Services in Nairobi",
    navLabel: "SEO",
    metaTitle: "SEO Services Nairobi | Local SEO & Google Business Profile Kenya",
    metaDescription:
      "SEO services for Nairobi and Kenyan businesses from KES 45,000/month. On-page, technical and local SEO including Google Business Profile and Maps visibility.",
    standfirst:
      "Most Nairobi businesses are invisible in local search and nobody has ever told them why. The fixes are usually unglamorous, and they compound for years after you stop paying for clicks.",
    price: { amount: "From KES 45,000/month", note: "Ongoing retainer. An initial audit is free for now if you want to understand what needs fixing first." },
    whoFor: [
      "Businesses with a physical location or service area in Nairobi and beyond",
      "Companies that rank for their own name and nothing else",
      "Owners who want leads that do not stop the day the ad budget does",
      "Anyone with an incomplete or unclaimed Google Business Profile",
    ],
    included: [
      { title: "Technical SEO", desc: "Site speed on Kenyan mobile networks, crawlability, indexation and the structural issues blocking rankings." },
      { title: "On-page SEO", desc: "Pages rebuilt around the phrases customers actually search, including neighbourhood and service-area terms." },
      { title: "Local SEO", desc: "Google Business Profile set up properly, categories, service areas, photos and posting cadence for Maps visibility." },
      { title: "Content direction", desc: "Which pages to write and in what order, mapped to search intent rather than guesswork." },
      { title: "Monthly reporting", desc: "Rankings, traffic and — more importantly — enquiries attributable to search." },
    ],
    caseStudy: {
      name: "Beauty Square Kenya",
      challenge: "Improving Beauty Square’s visibility in organic search.",
      results: "Search rankings improved from position 20 to 14, then 9. The site recorded around 2,000 monthly active users, and the business received more than 20 DM enquiries.",
    },
    faqs: [
      ...SHARED_FAQS.filter((f) => !f.q.includes("ad budget")),
      {
        q: "How long does SEO take to work in Kenya?",
        a: "I usually recommend allowing 3–6 months to see meaningful progress. The pace depends on your website, competition and starting point.",
      },
      {
        q: "Can you guarantee first-page rankings?",
        a: "No, and anyone who does is either guessing or targeting terms nobody searches. What I commit to is the work, the measurement and honest monthly reporting on whether it is moving.",
      },
      {
        q: "Do I need SEO if I am already running ads?",
        a: "They do different jobs. Ads stop the moment you stop paying; search visibility keeps returning enquiries afterwards. If your budget only covers one, ads usually win in the short term and SEO wins over a year or more.",
      },
    ],
    hubSlug: "local-seo",
    relatedPosts: [
      "why-your-nairobi-business-isnt-showing-up-on-google-2026",
      "google-business-profile-setup-nairobi-2026",
      "seo-pricing-for-kenyan-smes-2026",
    ],
    cta: {
      heading: "Find out why you are not ranking",
      body: "Start with a free audit. I’ll explain what needs attention in a written report or a call before you decide on ongoing work.",
      label: "Book an SEO Review Call",
      href: CALENDLY_URL,
      external: true,
    },
    draft: false,
    reviewNotes: [],
  },
  {
    slug: "social-media-management",
    icon: Share2,
    name: "Social Media Management for Small Businesses",
    navLabel: "Social Media",
    metaTitle: "Social Media Management Kenya | Content & Community for SMEs",
    metaDescription:
      "Social media management in Kenya from KES 40,000/month. Four posts a week on two platforms you choose, with community management and light video shoots.",
    standfirst:
      "Posting consistently is not the hard part. Posting things people actually stop for, on the platform where your buyers already are, is — and that is what this covers.",
    price: { amount: "From KES 40,000/month", note: "Four posts a week on two platforms of your choice. Light video shoots included; larger productions and ad spend are separate." },
    whoFor: [
      "Businesses whose accounts have gone quiet or inconsistent",
      "Brands getting reach but no enquiries from social",
      "Owners doing it themselves at 11pm and running out of ideas",
      "Companies with a product that demonstrates well on video",
    ],
    included: [
      { title: "Content strategy", desc: "What to post, on which platform and why — built around your buyers rather than trends for their own sake." },
      { title: "Four posts a week", desc: "Graphics and short-form content planned and scheduled on a calendar you can see." },
      { title: "Light video shoots", desc: "Simple social media video shoots are included. Larger productions are quoted separately through my video production service." },
      { title: "Community management", desc: "Comments and DMs answered, because that is where most Kenyan social enquiries actually convert." },
      { title: "Two platforms of your choice", desc: "Choose the two platforms you want me to manage. I can help you decide where your audience is most active." },
      { title: "Monthly reporting", desc: "Reach and engagement, plus the enquiries that came from it." },
    ],
    caseStudy: {
      name: "iClear Kenya",
      challenge: "Limited brand awareness in a saturated FMCG market.",
      results: "180% follower growth and 300%+ engagement growth, driven by short-form video and consistent posting.",
      readMore: "0-to-4-million-tiktok-views-behind-the-campaign",
    },
    testimonial: {
      quote:
        "Joseph transformed our social media presence. Our engagement grew by over 300% in just a few months — his video content strategy was a game-changer for iClear.",
      name: "iClear Wellife Service",
      role: "Water Purification Company",
    },
    faqs: [
      ...SHARED_FAQS.filter((f) => !f.q.includes("ad budget")),
      {
        q: "How often will you post?",
        a: "The base package includes four posts a week, shared on two platforms of your choice. It starts at KSh 40,000 a month.",
      },
      {
        q: "Do you shoot the video, or do I?",
        a: "Simple social media video shoots are included. Bigger or more involved productions are quoted separately through my video production service.",
      },
      {
        q: "Should my business be on TikTok or Instagram?",
        a: "Whichever your buyers actually use, which is usually not the one you personally prefer. Organic reach on TikTok in Kenya is still cheaper than anything you can buy, but only if the creative earns it.",
      },
    ],
    hubSlug: "tiktok-and-social",
    relatedPosts: [
      "tiktok-vs-instagram-for-kenyan-brands-2026",
      "0-to-4-million-tiktok-views-behind-the-campaign",
      "video-ads-vs-static-ads-kenya-2026",
    ],
    cta: {
      heading: "Want social that produces enquiries?",
      body: "Book a free call and I'll tell you which platform deserves your effort, and whether what you are posting now is worth continuing.",
      label: "Book a Social Strategy Call",
      href: CALENDLY_URL,
      external: true,
    },
    draft: false,
    reviewNotes: [],
  },
  {
    slug: "lead-generation",
    icon: Magnet,
    name: "Lead Generation Campaigns in Kenya",
    navLabel: "Lead Generation",
    metaTitle: "Lead Generation Campaigns Kenya | Leads for Kenyan SMEs",
    metaDescription:
      "Lead generation campaigns in Kenya from KES 50,000/month. Landing pages included, with campaign management and tracking. Your team follows up with leads.",
    standfirst:
      "Traffic is rarely the problem. The gap is between the click and the enquiry, and then between the enquiry and someone actually following it up.",
    price: { amount: "From KES 50,000/month", note: "Landing pages and campaign management across two platforms included. Ad spend is separate. Your team follows up with leads." },
    whoFor: [
      "Businesses getting clicks and impressions but few real enquiries",
      "Services and B2B companies where one client is worth a lot",
      "Teams handling enquiries on WhatsApp with no record of where they came from",
      "Anyone who cannot say which channel produced last month's customers",
    ],
    included: [
      { title: "Offer and message", desc: "What you are actually asking people to do, which is where most campaigns fail before the ad even runs." },
      { title: "Campaign management across two platforms", desc: "Full management on the two channels that suit your buyer, with weekly optimization." },
      { title: "Landing pages", desc: "Landing pages are included, giving visitors a clear place to enquire about your offer." },
      { title: "Creative direction", desc: "Ads built to produce enquiries rather than applause." },
      { title: "Lead tracking", desc: "Calls, forms and WhatsApp enquiries attributed to source, so you can see what is working." },
      { title: "Lead handover", desc: "I manage the campaigns and lead tracking. Your team handles enquiries, follows up with leads and closes sales." },
      { title: "Bi-weekly reporting", desc: "Cost per qualified lead, not cost per click." },
    ],
    caseStudy: {
      name: "Convey Communications",
      challenge: "Low organic reach and stagnant lead flow across digital channels.",
      results: "10x increase in qualified leads and 300%+ engagement growth across Instagram and TikTok in 6 months.",
      readMore: "convey-communications-case-study-10x-leads",
    },
    testimonial: {
      quote:
        "Joseph consistently delivered high-quality designs and campaigns on tight timelines. His ability to blend strategy with creative execution made him an invaluable part of our marketing team.",
      name: "Convey Communications",
      role: "PR Agency",
    },
    faqs: [
      ...SHARED_FAQS,
      {
        q: "Why do my ads get clicks but no enquiries?",
        a: "Usually the offer is vague, the landing page asks for too much too early, or the enquiry route is friction-heavy — a form where WhatsApp would convert three times better. Occasionally the leads are arriving and nobody is following up within the hour.",
      },
      {
        q: "Do you guarantee a number of leads?",
        a: "No. I will give you a cost-per-lead range to work toward once I have seen your offer and market, and I will tell you early if the numbers are not going to work.",
      },
      {
        q: "Do you build the landing page?",
        a: "Yes, landing pages are included in the lead generation package, which starts at KSh 50,000 a month. Ad spend is separate.",
      },
      {
        q: "Who follows up with the leads?",
        a: "Your team handles the follow-up and sales conversations. I manage the campaigns, landing pages and tracking that bring the enquiries in.",
      },
    ],
    hubSlug: "lead-generation",
    relatedPosts: [
      "lead-generation-campaigns-kenya-2026",
      "whatsapp-as-a-sales-channel-kenya-2026",
      "ad-mistakes-nairobi-smes-keep-making-2026",
    ],
    cta: {
      heading: "Getting clicks but no enquiries?",
      body: "That is usually fixable in weeks, not months, and it is the first thing I look at. Bring your numbers to a free call and we'll find the break.",
      label: "Book a Lead Generation Call",
      href: CALENDLY_URL,
      external: true,
    },
    draft: false,
    reviewNotes: [],
  },
  {
    slug: "digital-marketing-audit",
    icon: ClipboardList,
    name: "Digital Marketing Audit in Nairobi",
    navLabel: "Marketing Audit",
    metaTitle: "Free Digital Marketing Audit Nairobi | Joseph Maina",
    metaDescription:
      "Free digital marketing audit for Kenyan businesses. Review your ads, website, SEO and tracking, with findings in a written report or call within 1–2 days.",
    standfirst:
      "Find out what needs fixing before spending more on marketing. The audit is free for now, with findings shared in a written report or a call within 1–2 days.",
    price: { amount: "Free for now", value: 0, note: "No audit fee and no obligation to book ongoing services." },
    whoFor: [
      "Businesses paying for marketing and unsure what they are getting",
      "Owners about to hire an agency who want to know what to ask for",
      "Companies whose results dropped without explanation",
      "Anyone who suspects their tracking has never worked properly",
    ],
    included: [
      { title: "Ad account review", desc: "Structure, targeting, creative and wasted spend across Meta, Google and TikTok — whichever you run." },
      { title: "Website and conversion review", desc: "Speed on Kenyan mobile networks, and whether the site converts the traffic it already gets." },
      { title: "Search presence review", desc: "Rankings, Google Business Profile and local visibility versus your actual competitors." },
      { title: "Tracking audit", desc: "Whether your conversions, calls and WhatsApp enquiries are being measured correctly. They often are not." },
      { title: "Clear next steps", desc: "Findings shared in a written report or over a call within 1–2 days, with priorities for what to fix first." },
    ],
    faqs: [
      {
        q: "What do I actually receive?",
        a: "I’ll share the findings in a written report or talk you through them on a call, usually within 1–2 days. You’ll know what needs attention and where to start.",
      },
      {
        q: "Do I have to hire you afterwards?",
        a: "No. The audit is a standalone piece of work and the fix list is yours to implement yourself or hand to whoever you like.",
      },
      {
        q: "How much does the audit cost?",
        a: "It’s free for now. If you decide to work with me afterwards, we’ll agree on the scope and price separately.",
      },
      {
        q: "What access do you need from me?",
        a: "Read access to your ad accounts, analytics and Google Business Profile, plus your website. I do not need to change anything to audit it.",
      },
    ],
    hubSlug: "pricing-and-buying",
    relatedPosts: [
      "what-a-digital-marketing-audit-finds-kenya-2026",
      "how-to-choose-a-digital-marketing-agency-nairobi-2026",
      "real-reason-kenyan-smes-fail-at-marketing",
    ],
    cta: {
      heading: "Start with the audit",
      body: "Send a short brief and I'll confirm scope and turnaround within 24 hours. If an audit is not what you need, I'll say so.",
      label: "Request an Audit",
      href: "/agency/contact",
    },
    draft: false,
    reviewNotes: [],
  },
];

export const getServicePageBySlug = (slug?: string) => servicePages.find((s) => s.slug === slug);

/** Service pages cleared for indexing and sitemap inclusion. */
export const getLiveServicePages = () => servicePages.filter((s) => !s.draft);
