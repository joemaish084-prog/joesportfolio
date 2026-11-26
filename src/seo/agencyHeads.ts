import { agencyPages, type AgencyPageKey } from "@/data/agencyPages";
import { SITE_URL, absoluteUrl, canonicalUrl, ogCardImage, type PageHead } from "./headMeta";
import { agencyHeroPhotos, agencyPhotoPath, agencyPhotoSize } from "@/data/agencyPageMedia";
import { getLiveServicePages } from "@/data/servicePages";
import { agencyFaqs, retainerPackages } from "@/data/services";
import { agencyHomeHead, agencyOrganization, websiteId } from "./agencyHomeHead";

export { agencyOrganization } from "./agencyHomeHead";

export const agencySocialCards = {
  services: { eyebrow: "Digital marketing services", title: "Find the right service for your goals", meta: "Paid media, SEO, social and Shopify" },
  pricing: { eyebrow: "Pricing", title: agencyPages.pricing.heading, meta: "Compare retainers and standalone services" },
  results: { eyebrow: "Case studies", title: agencyPages.results.heading, meta: "Revenue, return on ad spend and lead quality" },
} as const;

export function agencyHead(key: AgencyPageKey): PageHead {
  if (key === "home") return agencyHomeHead;
  const page = agencyPages[key];
  const card = key === "contact" ? undefined : agencySocialCards[key];
  const hero = key === "pricing" || key === "results" ? agencyHeroPhotos[key] : undefined;
  const crumbs = [{ name: "Agency", path: "/" }, { name: page.label, path: page.path }];
  return {
    title: page.title, description: page.description, path: page.path,
    ...(card && ogCardImage(page.path, `JM Marketing · ${card.title}`)),
    jsonLd: [agencyOrganization, {
      "@context": "https://schema.org",
      "@type": key === "contact" ? "ContactPage" : key === "pricing" ? "WebPage" : "CollectionPage",
      "@id": `${canonicalUrl(page.path)}#webpage`,
      name: page.title, description: page.description, url: canonicalUrl(page.path),
      about: { "@id": agencyOrganization["@id"] },
      ...(hero && {
        primaryImageOfPage: {
          "@type": "ImageObject",
          contentUrl: absoluteUrl(agencyPhotoPath(hero.name)),
          name: hero.alt,
          width: agencyPhotoSize.large,
          height: agencyPhotoSize.height,
        },
      }),
      ...(key === "services" ? {
        mainEntity: {
          "@type": "ItemList",
          "@id": `${SITE_URL}/agency/services#service-list`,
          name: "Digital marketing services",
          numberOfItems: getLiveServicePages().length,
          itemListElement: getLiveServicePages().map((service, index) => ({
            "@type": "ListItem", position: index + 1,
            item: {
              "@type": "Service",
              "@id": `${SITE_URL}/agency/${service.slug}#service`,
              name: service.name, description: service.standfirst,
              url: canonicalUrl(`/agency/${service.slug}`),
              provider: { "@id": agencyOrganization["@id"] },
            },
          })),
        },
      } : {}),
      ...(key === "pricing" && {
        mainEntity: {
          "@type": "OfferCatalog",
          name: "Digital marketing retainers",
          itemListElement: retainerPackages.map(({ name, price, features }) => ({
            "@type": "Offer",
            url: canonicalUrl(page.path),
            itemOffered: {
              "@type": "Service",
              name: `${name[0]}${name.slice(1).toLowerCase()} digital marketing retainer`,
              description: features.join(", "),
              provider: { "@id": agencyOrganization["@id"] },
            },
            priceSpecification: {
              "@type": "UnitPriceSpecification",
              [price.from ? "minPrice" : "price"]: price.kes,
              priceCurrency: "KES",
              unitText: "month",
            },
          })),
        },
      }),
      isPartOf: { "@id": websiteId },
    }, ...(key === "services" ? [{
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: agencyFaqs.map(({ q, a }) => ({
        "@type": "Question",
        name: q,
        acceptedAnswer: { "@type": "Answer", text: a },
      })),
    }] : []), {
      "@context": "https://schema.org", "@type": "BreadcrumbList",
      itemListElement: crumbs.map((crumb, index) => ({
        "@type": "ListItem", position: index + 1, name: crumb.name, item: canonicalUrl(crumb.path),
      })),
    }],
  };
}

export const agencyOverviewHead: PageHead = {
  title: "Agency Overview | JM Marketing",
  description: "Meet JM Marketing, see the team’s campaign work, and explore services, pricing, and ways to get in touch.",
  path: "/agency/overview",
};
