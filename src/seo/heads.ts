import { blogPosts, type BlogPost } from "@/data/blogPosts";
import { blogHubs, getHubPosts, getPrimaryHubForPost, type BlogHub } from "@/data/blogHubs";
import type { ServicePage } from "@/data/servicePages";
import type { Brand } from "@/data/brands";
import { CALCULATOR_FAQS, CALCULATOR_INTRO, CALCULATOR_PATH, CALCULATOR_TITLE } from "@/data/adCalculatorContent";

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

const person = { "@type": "Person", name: "Joseph Maina", url: SITE_URL };

const breadcrumbs = (items: { name: string; path: string }[]) => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: item.name,
    item: canonicalUrl(item.path),
  })),
});

// ---------------------------------------------------------------- static pages

export const STATIC_HEADS = {
  home: {
    title: "Joseph Maina | Digital Marketing Specialist Nairobi | Meta Ads, Google Ads & SEO Kenya",
    description:
      "Digital Marketing Specialist in Nairobi, Kenya. Expert in Meta Ads, Google Ads, TikTok, SEO & Social Media. Real results for Kenyan brands. Book a free strategy call today.",
    path: "/",
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
    title: "Brand Identity Portfolio | Joseph Maina, Nairobi",
    description:
      "Brand identity work by Joseph Maina: logo systems, colour palettes, typography, social templates and mockups for Kenyan brands.",
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

// --------------------------------------------------------------- dynamic pages

export function brandHead(brand: Brand): PageHead {
  return {
    title: `${brand.name} Brand Identity | Joseph Maina`,
    description: `${brand.name}: ${brand.tagline} Logo system, colour palette, typography, social templates and mockups by Joseph Maina.`,
    path: `/work/branding/${brand.slug}`,
    ...ogCardImage(`/work/branding/${brand.slug}`, `${brand.name} brand identity by Joseph Maina`),
  };
}

export function blogIndexHead(): PageHead {
  const path = "/agency/blog";
  return {
    title: "Digital Marketing Blog Kenya | Joseph Maina Agency",
    description:
      "Practical digital marketing insights for Kenyan brands, organised by topic: SEO, Meta Ads, Google Ads, TikTok strategy and campaign case studies.",
    ogDescription: "SEO, Meta Ads, Google Ads, TikTok strategy and campaign case studies for Kenyan brands.",
    path,
    ...ogCardImage(path, "Joseph Maina's digital marketing blog for Kenyan brands"),
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Blog",
        name: "Joseph Maina Agency Blog",
        url: canonicalUrl(path),
        blogPost: blogPosts.map((p) => ({
          "@type": "BlogPosting",
          headline: p.title,
          description: p.excerpt,
          datePublished: p.date,
          author: { "@type": "Person", name: "Joseph Maina" },
          url: canonicalUrl(`/agency/blog/${p.slug}`),
        })),
      },
      {
        "@context": "https://schema.org",
        "@type": "ItemList",
        name: "Blog topic hubs",
        itemListElement: blogHubs.map((h, i) => ({
          "@type": "ListItem",
          position: i + 1,
          name: h.name,
          url: canonicalUrl(`/agency/blog/topics/${h.slug}`),
        })),
      },
    ],
  };
}

export function blogHubHead(hub: BlogHub): PageHead {
  const path = `/agency/blog/topics/${hub.slug}`;
  const posts = getHubPosts(hub);
  return {
    title: `${hub.metaTitle} | Joseph Maina`,
    ogTitle: hub.metaTitle,
    description: hub.metaDescription,
    path,
    ...ogCardImage(path, `${hub.name} guides by Joseph Maina`),
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        name: hub.metaTitle,
        description: hub.metaDescription,
        url: canonicalUrl(path),
        breadcrumb: breadcrumbs([
          { name: "Blog", path: "/agency/blog" },
          { name: hub.name, path },
        ]),
        mainEntity: {
          "@type": "ItemList",
          itemListElement: posts.map((p, i) => ({
            "@type": "ListItem",
            position: i + 1,
            name: p.title,
            url: canonicalUrl(`/agency/blog/${p.slug}`),
          })),
        },
      },
    ],
  };
}

export function blogPostHead(post: BlogPost): PageHead {
  const path = `/agency/blog/${post.slug}`;
  const url = canonicalUrl(path);
  const primaryHub = getPrimaryHubForPost(post.slug);
  return {
    title: `${post.metaTitle} | Joseph Maina`,
    ogTitle: post.metaTitle,
    description: post.metaDescription,
    path,
    ogType: "article",
    ...ogCardImage(path, post.title),
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        headline: post.title,
        description: post.metaDescription,
        image: [absoluteUrl(post.thumbnail), absoluteUrl(`/og${path}.png`)],
        datePublished: post.date,
        dateModified: post.date,
        author: person,
        publisher: { "@type": "Organization", name: "Joseph Maina Agency", url: SITE_URL },
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        articleSection: primaryHub?.name ?? post.category,
        breadcrumb: breadcrumbs([
          { name: "Blog", path: "/agency/blog" },
          ...(primaryHub ? [{ name: primaryHub.name, path: `/agency/blog/topics/${primaryHub.slug}` }] : []),
          { name: post.title, path },
        ]),
      },
    ],
  };
}

export function serviceHead(page: ServicePage): PageHead {
  const path = `/agency/${page.slug}`;
  const faqs = page.faqs
    // Unanswered questions must not reach structured data.
    .filter((f) => !f.a.includes("[CONFIRM]"))
    .map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    }));

  return {
    title: page.metaTitle,
    description: page.metaDescription,
    path,
    noindex: page.draft,
    ...ogCardImage(path, page.name),
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Service",
        name: page.name,
        description: page.metaDescription,
        url: canonicalUrl(path),
        serviceType: page.navLabel,
        areaServed: { "@type": "Country", name: "Kenya" },
        provider: person,
        offers: {
          "@type": "Offer",
          price: page.price.amount,
          priceCurrency: "KES",
          description: page.price.note,
        },
      },
      ...(faqs.length > 0 ? [{ "@context": "https://schema.org", "@type": "FAQPage", mainEntity: faqs }] : []),
      {
        "@context": "https://schema.org",
        ...breadcrumbs([
          { name: "Agency", path: "/agency" },
          { name: page.navLabel, path },
        ]),
      },
    ],
  };
}

export function calculatorHead(): PageHead {
  const path = CALCULATOR_PATH;
  return {
    title: `${CALCULATOR_TITLE} | Joseph Maina`,
    ogTitle: CALCULATOR_TITLE,
    description:
      "Free ad budget calculator for Kenyan businesses. See how many leads and customers a Meta or Google Ads budget buys, and the cost per lead you can afford to break even.",
    ogDescription: CALCULATOR_INTRO,
    path,
    ...ogCardImage(path, CALCULATOR_TITLE),
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "WebApplication",
        name: CALCULATOR_TITLE,
        url: canonicalUrl(path),
        description: CALCULATOR_INTRO,
        applicationCategory: "BusinessApplication",
        operatingSystem: "Any",
        isAccessibleForFree: true,
        offers: { "@type": "Offer", price: "0", priceCurrency: "KES" },
        author: person,
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: CALCULATOR_FAQS.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@context": "https://schema.org",
        ...breadcrumbs([
          { name: "Agency", path: "/agency" },
          { name: "Ad Budget Calculator", path },
        ]),
      },
    ],
  };
}
