import { useEffect } from "react";
import { Helmet } from "react-helmet-async";

/**
 * index.html ships a static `robots: index, follow` tag that Helmet can't
 * remove, so while the hub is open that tag is switched to noindex as well,
 * and restored on the way out. vercel.json also sends X-Robots-Tag for /hub.
 */
export function HubNoIndex() {
  useEffect(() => {
    const tags = Array.from(document.querySelectorAll<HTMLMetaElement>('meta[name="robots"]:not([data-rh])'));
    const previous = tags.map((tag) => tag.content);
    tags.forEach((tag) => (tag.content = "noindex, nofollow"));
    return () => tags.forEach((tag, i) => (tag.content = previous[i]!));
  }, []);

  return (
    <Helmet>
      <title>Client Hub</title>
      <meta name="robots" content="noindex, nofollow, noarchive" />
      <meta name="googlebot" content="noindex, nofollow" />
    </Helmet>
  );
}
