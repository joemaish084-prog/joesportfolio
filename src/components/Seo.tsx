import { Helmet } from "react-helmet-async";

const SITE_URL = "https://www.josephmaina.co.ke";

interface SeoProps {
  title: string;
  description: string;
  /** Route path, e.g. "/agency". Trailing slashes are stripped (except "/"). */
  path: string;
}

export function Seo({ title, description, path }: SeoProps) {
  const cleanPath = path.replace(/\/+$/, "");
  const url = `${SITE_URL}${cleanPath || "/"}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
    </Helmet>
  );
}
