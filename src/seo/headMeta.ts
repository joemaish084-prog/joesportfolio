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
export const ogCardPath = (path: string) => `/og${path === "/" ? "/index" : path}.png`;

export const ogCardImage = (path: string, alt: string) => ({
  image: ogCardPath(path),
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
