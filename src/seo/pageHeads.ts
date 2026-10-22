import { blogSummaries as blogPosts } from "@/data/blogSummaries";
import type { BlogPost } from "@/data/blogPosts";
import { blogHubs, getHubPosts, getPrimaryHubForPost, type BlogHub } from "@/data/blogHubs";
import type { ServicePage } from "@/data/servicePages";
import type { Brand } from "@/data/brands";
import { CALCULATOR_FAQS, CALCULATOR_INTRO, CALCULATOR_PATH, CALCULATOR_TITLE } from "@/data/adCalculatorContent";

import { SITE_URL, canonicalUrl, absoluteUrl, ogCardImage, type PageHead } from "./heads";

const person = { "@type": "Person", name: "Joseph Maina", url: SITE_URL, image: `${SITE_URL}/joseph-maina.jpg` };

const breadcrumbs = (items: { name: string; path: string }[]) => ({
  "@type": "BreadcrumbList",
  itemListElement: items.map((item, i) => ({
    "@type": "ListItem",
    position: i + 1,
    name: item.name,
    item: canonicalUrl(item.path),
  })),
});

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
      {
        "@context": "https://schema.org",
        ...breadcrumbs([
          { name: "Blog", path: "/agency/blog" },
          { name: hub.name, path },
        ]),
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
      },
      {
        "@context": "https://schema.org",
        ...breadcrumbs([
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
          // Preserve "from" and monthly billing without putting display copy in a numeric price field.
          priceSpecification: {
            "@type": "UnitPriceSpecification",
            [page.price.amount.startsWith("From ") ? "minPrice" : "price"]:
              page.price.value ?? Number(page.price.amount.match(/[\d,]+/)![0].replace(/,/g, "")),
            priceCurrency: "KES",
            ...(page.price.amount.includes("/month") ? { unitText: "month" } : {}),
          },
          description: `${page.price.amount}. ${page.price.note}`,
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
