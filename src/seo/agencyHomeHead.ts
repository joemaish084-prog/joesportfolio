import { agencyPages } from "@/data/agencyPages";
import { homeFaqs } from "@/data/agencyHome";
import { SITE_URL, canonicalUrl, ogCardImage, type PageHead } from "./headMeta";

export const agencyOrganization = {
  "@context": "https://schema.org",
  "@type": ["Organization", "LocalBusiness"],
  "@id": `${SITE_URL}/agency#organization`,
  name: "Joseph Maina Marketing",
  description: "Joseph Maina Marketing is a founder-led digital marketing agency in Nairobi, led by Joseph Maina, a digital marketing specialist.",
  url: `${SITE_URL}/`,
  logo: `${SITE_URL}/icon-512.png`,
  email: "joemaish084@gmail.com",
  telephone: "+254704700160",
  address: { "@type": "PostalAddress", addressLocality: "Nairobi", addressCountry: "KE" },
  areaServed: { "@type": "Country", name: "Kenya" },
  founder: { "@type": "Person", name: "Joseph Maina", jobTitle: "Digital Marketing Specialist", url: SITE_URL },
  sameAs: [
    "https://www.behance.net/joemaish",
    "https://www.linkedin.com/in/joseph-isaac-m-33a9a611b/",
    "https://x.com/Joemkush15",
    "https://www.instagram.com/m_k_ush_/",
  ],
};

const { title, description, path } = agencyPages.home;
export const agencyHomeHead: PageHead = {
  title, description, path,
  ogTitle: "Make your marketing bring in more sales | Joseph Maina Marketing",
  ogDescription: "Nairobi-based digital marketing agency for Kenyan and African businesses. Explore tracked campaign results and book a free marketing audit.",
  ...ogCardImage("/", "Joseph Maina Marketing · Make your marketing bring in more sales"),
  jsonLd: [
    agencyOrganization,
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${canonicalUrl(path)}#webpage`,
      name: title, description, url: canonicalUrl(path),
      about: { "@id": agencyOrganization["@id"] },
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: homeFaqs.map(({ question, answer }) => ({
        "@type": "Question",
        name: question,
        acceptedAnswer: { "@type": "Answer", text: answer },
      })),
    },
  ],
};

