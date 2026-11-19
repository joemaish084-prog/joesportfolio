import { caseStudies } from "@/data/caseStudies";

export const PRIVACY_PATH = "/privacy-policy";
export const AUDIT_WHATSAPP = "https://wa.me/254704700160?text=Hi%20Joseph%21%20I%27d%20like%20to%20discuss%20a%20free%20marketing%20audit.";

export const auditBudgets = [
  "Under KES 50,000",
  "KES 50,000 to 99,999",
  "KES 100,000 to 249,999",
  "KES 250,000 or more",
  "Still deciding",
] as const;

export const homeServices = [
  { name: "Meta Ads", path: "/agency/meta-ads-management", copy: "Reach new customers on Facebook and Instagram, test what sells, and track what comes back." },
  { name: "Google Ads", path: "/agency/google-ads-management", copy: "Show up when people are already searching for what you sell." },
  { name: "TikTok Ads", path: "/agency/services#service-tiktok-ads", copy: "Build campaigns around short-form creative and measure what happens after the click." },
  { name: "SEO", path: "/agency/seo-services-nairobi", copy: "Make it easier for customers to find you in search and on Google Maps." },
  { name: "Social Media Management", path: "/agency/social-media-management", copy: "Plan, create, and publish content that answers the questions your customers ask." },
  { name: "Media Buying", path: "/portfolio#media-buying", copy: "Put budget behind the right channels and adjust spending as results come in." },
] as const;

export const homeProcess = [
  { name: "Audit what you have", copy: "I’ll review your offer, campaigns, website, and tracking to see where sales or enquiries are falling away." },
  { name: "Agree on the plan", copy: "We pick the channels, budget, and measures of success together before any new spend." },
  { name: "Launch, measure, adjust", copy: "I build or improve the campaigns, report what happened, and explain where I’d put the next shilling." },
];

export const homeFaqs = [
  { question: "What do I get from the free audit?", answer: "I’ll review the marketing you already have and point out the areas I’d tackle first. Share your business name and budget so I can make the review relevant to you." },
  { question: "Do I need to be running ads already?", answer: "No. If you’re starting from scratch, I can look at your offer, website or social profiles and suggest which channel makes sense to test first." },
  { question: "Is advertising spend included in your fees?", answer: "Your advertising budget is paid separately from management and creative fees. We’ll agree on both before work starts." },
  { question: "Who do you work with?", answer: "I’m based in Nairobi and work with Kenyan and African businesses, including e-commerce shops, restaurants, property businesses, startups, and SMEs." },
];

export const homeResults = caseStudies.filter(({ id }) =>
  ["meta-google-combined", "property-lead-funnel", "google-ads-launch"].includes(id),
).sort((a, b) => Number(b.id === "meta-google-combined") - Number(a.id === "meta-google-combined"));
