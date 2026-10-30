import { faqs } from "@/data/faqs";

/**
 * Every public page's <head>: title, description, social card and JSON-LD.
 *
 * Pages render these through <Seo>, and scripts/prerender.mjs writes the same
 * tags into static HTML at build time, so crawlers and link previews (WhatsApp,
 * LinkedIn, X) that never run JavaScript still see the right page.
 */

export const SITE_URL = "https://www.josephmaina.co.ke";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

export interface PageHead {
  /** Full <title>. */
  title: string;
  description: string;
  /** Route path, e.g. "/agency". Trailing slashes are stripped (except "/"). */
  path: string;
  /** Social card title when it should differ from <title> (usually no suffix). */
  ogTitle?: string;
  ogDescription?: string;
  ogType?: "website" | "article";
  /** Absolute URL or site path. Falls back to the default social card. */
  image?: string;
  imageAlt?: string;
  imageWidth?: number;
  imageHeight?: number;
  noindex?: boolean;
  jsonLd?: object[];
}

export interface HeadTag {
  tag: "meta" | "link";
  attrs: Record<string, string>;
}

export const absoluteUrl = (pathOrUrl: string) =>
  /^https?:\/\//.test(pathOrUrl) ? pathOrUrl : `${SITE_URL}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;

export const canonicalUrl = (path: string) => `${SITE_URL}${path.replace(/\/+$/, "") || "/"}`;

/**
 * The page's generated social card. scripts/prerender.mjs draws one for every
 * route that has a `card` in src/prerender/routes.tsx and fails the build if a
 * head points at a card that was not drawn.
 */
export const ogCardImage = (path: string, alt: string) => ({
  image: `/og${path}.png`,
  imageAlt: alt,
  imageWidth: 1200,
  imageHeight: 630,
});

/** The meta and link tags for a page, shared by <Seo> and the prerender script. */
export function headTags(head: PageHead): HeadTag[] {
  const url = canonicalUrl(head.path);
  const image = head.image ? absoluteUrl(head.image) : DEFAULT_OG_IMAGE;
  const ogTitle = head.ogTitle ?? head.title;
  const ogDescription = head.ogDescription ?? head.description;
  const meta = (key: "name" | "property", value: string, content: string): HeadTag => ({
    tag: "meta",
    attrs: { [key]: value, content },
  });

  return [
    meta("name", "description", head.description),
    meta(
      "name",
      "robots",
      head.noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large",
    ),
    { tag: "link", attrs: { rel: "canonical", href: url } },
    meta("property", "og:title", ogTitle),
    meta("property", "og:description", ogDescription),
    meta("property", "og:type", head.ogType ?? "website"),
    meta("property", "og:url", url),
    meta("property", "og:image", image),
    ...(head.image
      ? head.imageWidth && head.imageHeight
        ? [
            meta("property", "og:image:width", String(head.imageWidth)),
            meta("property", "og:image:height", String(head.imageHeight)),
          ]
        : []
      : [meta("property", "og:image:width", "1216"), meta("property", "og:image:height", "640")]),
    ...(head.imageAlt ? [meta("property", "og:image:alt", head.imageAlt)] : []),
    meta("name", "twitter:card", "summary_large_image"),
    meta("name", "twitter:title", ogTitle),
    meta("name", "twitter:description", ogDescription),
    meta("name", "twitter:image", image),
  ];
}

// ---------------------------------------------------------------- static pages

export const STATIC_HEADS = {
  home: {
    title: "Digital Marketing Specialist Nairobi | Joseph Maina",
    description:
      "Grow your Kenyan business with Joseph Maina, a digital marketing specialist in Nairobi. Explore Meta Ads, Google Ads, SEO and real campaign case studies.",
    path: "/",
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
  agency: {
    title: "Digital Marketing Agency Nairobi | Joseph Maina",
    description:
      "Meta Ads, Google Ads and SEO for Kenyan businesses. See services and pricing, then book a free discovery call with Joseph Maina.",
    path: "/agency",
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
