import { agencyPages, type AgencyPageKey } from "@/data/agencyPages";
import { SITE_URL, canonicalUrl, type PageHead } from "./headMeta";
import { getLiveServicePages } from "@/data/servicePages";
import { agencyFaqs } from "@/data/services";
import { agencyHomeHead, agencyOrganization } from "./agencyHomeHead";

export { agencyOrganization } from "./agencyHomeHead";

export function agencyHead(key: AgencyPageKey): PageHead {
  if (key === "home") return agencyHomeHead;
  const page = agencyPages[key];
  const crumbs = [{ name: "Agency", path: "/" }, { name: page.label, path: page.path }];
  return {
    title: page.title, description: page.description, path: page.path,
    jsonLd: [agencyOrganization, {
      "@context": "https://schema.org",
      "@type": key === "contact" ? "ContactPage" : "CollectionPage",
      "@id": `${canonicalUrl(page.path)}#webpage`,
      name: page.title, description: page.description, url: canonicalUrl(page.path),
      about: { "@id": agencyOrganization["@id"] },
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
      isPartOf: { "@id": `${SITE_URL}/#webpage` },
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
  title: "Agency Overview | Joseph Maina Marketing",
  description: "Meet Joseph Maina Marketing, see the team’s campaign work, and explore services, pricing, and ways to get in touch.",
  path: "/agency/overview",
};
