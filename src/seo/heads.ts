import { faqs } from "@/data/faqs";
import { ogCardImage, type PageHead } from "./headMeta";

export * from "./headMeta";

// ---------------------------------------------------------------- static pages

export const STATIC_HEADS = {
  portfolio: {
    title: "Digital Marketing Portfolio & Case Studies | Joseph Maina",
    description:
      "Explore Joseph Maina’s digital marketing portfolio, including paid media case studies, Shopify storefronts, video production and brand identity work.",
    path: "/portfolio",
    ...ogCardImage("/portfolio", "JM Marketing · Selected work"),
    jsonLd: [{
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: faqs.map(({ question, answer }) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    }],
  },
  connect: {
    title: "Connect Your AI Assistant | Joseph Maina",
    description:
      "Add josephmaina.co.ke to ChatGPT or Claude so your AI assistant can answer questions about Joseph Maina's services, bio and contact details.",
    path: "/connect",
  },
  workDesign: {
    title: "Graphic Design Portfolio | Joseph Maina, Nairobi",
    description:
      "Campaign creatives, social media designs and brand artwork by Joseph Maina for Kenyan brands. Newest work first.",
    path: "/work/design",
  },
  workVideos: {
    title: "Video Production Portfolio | Joseph Maina, Nairobi",
    description:
      "Short-form reels and long-form brand films produced by Joseph Maina for Kenyan brands. Newest work first.",
    path: "/work/videos",
  },
  workCaseStudies: {
    title: "Digital Marketing Case Studies in Kenya | Joseph Maina",
    description:
      "Meta Ads, Google Ads and social media case studies for Nairobi and Kenyan brands. Explore tracked revenue, ROAS, conversion tracking and campaign strategy.",
    path: "/work/case-studies",
  },
  workBranding: {
    title: "Brand Identity & Media Kit Design Portfolio | Joseph Maina, Nairobi",
    description:
      "Brand identity and media kit design by Joseph Maina in Nairobi: logo systems, colour palettes, typography, social templates and influencer media kits for Kenyan brands.",
    path: "/work/branding",
  },
  workMockups: {
    title: "Brand Mockups & Applications | Joseph Maina, Nairobi",
    description: "Explore brand mockup concepts for JM Marketing, Duara Schools, iClear and Sidi Safari, from printed stationery to apparel and drinkware.",
    path: "/work/mockups",
  },
  privacy: {
    title: "Privacy Policy | Joseph Maina",
    description: "How Joseph Maina Digital Marketing collects, uses and protects your personal information.",
    path: "/privacy-policy",
  },
  cookies: {
    title: "Cookie Policy | Joseph Maina",
    description: "How josephmaina.co.ke uses cookies and analytics to improve your browsing experience.",
    path: "/cookie-policy",
  },
  terms: {
    title: "Terms of Service | Joseph Maina",
    description: "Terms of Service for Joseph Maina Digital Marketing — payments, IP, cancellation and liability.",
    path: "/terms",
  },
} satisfies Record<string, PageHead>;
