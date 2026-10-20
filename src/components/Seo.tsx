import { Helmet } from "react-helmet-async";
import { headTags, type PageHead } from "@/seo/heads";

/** Renders a page's <head> from a PageHead (see src/seo/heads.ts). */
export function Seo(head: PageHead) {
  return (
    <Helmet>
      <title>{head.title}</title>
      {headTags(head).map(({ tag, attrs }) =>
        tag === "link" ? <link key={attrs.rel} {...attrs} /> : <meta key={attrs.name ?? attrs.property} {...attrs} />,
      )}
      {head.jsonLd?.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}
