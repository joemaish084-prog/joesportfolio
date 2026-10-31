import { agencyPages, type AgencyPageKey } from "@/data/agencyPages";
import { SITE_URL, canonicalUrl, type PageHead } from "./heads";

export const agencyOrganization = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": `${SITE_URL}/agency#organization`,
  name: "Joseph Maina Marketing",
  description: "Joseph Maina Marketing is a founder-led digital marketing agency in Nairobi, led by Joseph Maina, a digital marketing specialist.",
  url: `${SITE_URL}/agency`,
  logo: `${SITE_URL}/icon-512.png`,
  email: "joemaish084@gmail.com",
  telephone: "+254704700160",
  address: { "@type": "PostalAddress", addressLocality: "Nairobi", addressCountry: "KE" },
  areaServed: { "@type": "Country", name: "Kenya" },
  founder: { "@type": "Person", name: "Joseph Maina", jobTitle: "Digital Marketing Specialist", url: SITE_URL },
  sameAs: [
    "https://www.linkedin.com/in/joseph-isaac-m-33a9a611b/",
    "https://www.instagram.com/m_k_ush_/",
  ],
};

export function agencyHead(key: AgencyPageKey): PageHead {
  const page = agencyPages[key];
  const crumbs = [{ name: "Portfolio", path: "/" }, { name: "Agency", path: "/agency" }];
  if (key !== "home") crumbs.push({ name: page.label, path: page.path });
  return {
    title: page.title, description: page.description, path: page.path,
    jsonLd: [agencyOrganization, {
      "@context": "https://schema.org",
      "@type": key === "contact" ? "ContactPage" : key === "home" ? "WebPage" : "CollectionPage",
      "@id": `${canonicalUrl(page.path)}#webpage`,
      name: page.title, description: page.description, url: canonicalUrl(page.path),
      about: { "@id": agencyOrganization["@id"] },
      ...(key !== "home" ? { isPartOf: { "@id": `${SITE_URL}/agency#webpage` } } : {}),
    }, {
      "@context": "https://schema.org", "@type": "BreadcrumbList",
      itemListElement: crumbs.map((crumb, index) => ({
        "@type": "ListItem", position: index + 1, name: crumb.name, item: canonicalUrl(crumb.path),
      })),
    }],
  };
}
