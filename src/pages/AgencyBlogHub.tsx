import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, ArrowRight, CalendarDays, ChevronRight, Clock } from "lucide-react";
import { blogHubs, getHubBySlug, getHubPosts } from "@/data/blogHubs";
import { Footer } from "@/components/Footer";

const SITE = "https://www.josephmaina.co.ke";

const AgencyBlogHub = () => {
  const { hub: hubSlug } = useParams();
  const hub = getHubBySlug(hubSlug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [hubSlug]);

  if (!hub) return <Navigate to="/agency/blog" replace />;

  const posts = getHubPosts(hub);
  const [lead, ...others] = posts;
  const url = `${SITE}/agency/blog/topics/${hub.slug}`;
  const otherHubs = blogHubs.filter((h) => h.slug !== hub.slug);

  const schema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: hub.metaTitle,
    description: hub.metaDescription,
    url,
    breadcrumb: {
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Blog", item: `${SITE}/agency/blog` },
        { "@type": "ListItem", position: 2, name: hub.name, item: url },
      ],
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: posts.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        name: p.title,
        url: `${SITE}/agency/blog/${p.slug}`,
      })),
    },
  };

  return (
    <>
      <Helmet>
        <title>{`${hub.metaTitle} | Joseph Maina`}</title>
        <meta name="description" content={hub.metaDescription} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={hub.metaTitle} />
        <meta property="og:description" content={hub.metaDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={url} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>

      <div className="min-h-screen bg-white text-[#111111]">
        <div className="mx-auto max-w-6xl px-5 pb-24 pt-16 sm:px-8">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-[#666666]">
            <Link to="/agency/blog" className="inline-flex items-center gap-2 transition-colors hover:text-[#F97316]">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              All topics
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-[#CCCCCC]" aria-hidden="true" />
            <span className="font-medium text-[#111111]">{hub.name}</span>
          </nav>

          {/* Intro */}
          <header className="mt-10 max-w-3xl">
            <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#F97316]">
              <hub.icon className="h-4 w-4" aria-hidden="true" />
              Topic hub
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">{hub.name}</h1>
            {hub.intro.map((p, i) => (
              <p key={i} className="mt-5 text-lg leading-relaxed text-[#555555]">
                {p}
              </p>
            ))}
            <p className="mt-6 text-sm text-[#888888]">
              {posts.length} {posts.length === 1 ? "article" : "articles"} in this hub
            </p>
          </header>

          {/* Start here */}
          {lead && (
            <section className="mt-16">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#999999]">Start here</h2>
              <article className="mt-5 overflow-hidden rounded-2xl border border-[#EAEAEA] sm:flex">
                <div className="relative h-48 sm:h-auto sm:w-2/5 sm:flex-shrink-0">
                  <img
                    src={lead.thumbnail}
                    alt={lead.thumbnailAlt}
                    loading="eager"
                    width={800}
                    height={440}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent sm:bg-gradient-to-r" />
                  <span className="absolute bottom-4 left-4 rounded-full bg-[#F97316] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                    {lead.category}
                  </span>
                </div>
                <div className="p-7 sm:p-9">
                  <h3 className="text-xl font-bold leading-snug tracking-tight sm:text-2xl">
                    <Link to={`/agency/blog/${lead.slug}`} className="hover:text-[#F97316]">
                      {lead.title}
                    </Link>
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-[#555555]">{lead.excerpt}</p>
                  <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#666666]">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4" aria-hidden="true" /> {lead.dateLabel}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-4 w-4" aria-hidden="true" /> {lead.readTime}
                    </span>
                  </div>
                  <Link
                    to={`/agency/blog/${lead.slug}`}
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#F97316] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    Read Article
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            </section>
          )}

          {/* The rest, as a scannable list */}
          {others.length > 0 && (
            <section className="mt-16">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#999999]">
                Then read
              </h2>
              <ol className="mt-5 divide-y divide-[#EAEAEA] border-y border-[#EAEAEA]">
                {others.map((post, i) => (
                  <li key={post.slug}>
                    <Link
                      to={`/agency/blog/${post.slug}`}
                      className="group flex items-start gap-5 py-6 transition-colors hover:bg-[#FAFAFA]"
                    >
                      <span className="mt-0.5 w-6 flex-shrink-0 text-sm font-semibold tabular-nums text-[#CCCCCC]">
                        {String(i + 2).padStart(2, "0")}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-bold leading-snug tracking-tight group-hover:text-[#F97316]">
                          {post.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-[#555555]">{post.excerpt}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-[#888888]">
                          <span className="font-semibold uppercase tracking-wider text-[#F97316]">
                            {post.category}
                          </span>
                          <span>{post.dateLabel}</span>
                          <span>{post.readTime}</span>
                        </div>
                      </div>
                      <ArrowRight
                        className="mt-1 h-5 w-5 flex-shrink-0 text-[#CCCCCC] transition-colors group-hover:text-[#F97316]"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Related service */}
          <section className="mt-16 rounded-2xl border border-[#EAEAEA] p-8 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#999999]">
              Related service
            </p>
            <div className="mt-4 sm:flex sm:items-end sm:justify-between sm:gap-8">
              <div className="max-w-xl">
                <h2 className="text-2xl font-bold tracking-tight">{hub.service.name}</h2>
                <p className="mt-1 text-sm font-semibold text-[#F97316]">{hub.service.price}</p>
                <p className="mt-3 text-base leading-relaxed text-[#555555]">{hub.service.blurb}</p>
              </div>
              <Link
                to={hub.service.href}
                className="mt-6 inline-flex flex-shrink-0 items-center gap-2 rounded-full border border-[#111111] px-6 py-3 text-sm font-semibold text-[#111111] transition-colors hover:bg-[#111111] hover:text-white sm:mt-0"
              >
                View Service &amp; Pricing
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </section>

          {/* Hub CTA */}
          <section className="mt-8 rounded-2xl border border-[#EAEAEA] bg-[#FAFAFA] p-8 text-center sm:p-12">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{hub.cta.heading}</h2>
            <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-[#555555]">{hub.cta.body}</p>
            {hub.cta.external ? (
              <a
                href={hub.cta.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#F97316] px-7 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                {hub.cta.label}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            ) : (
              <Link
                to={hub.cta.href}
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#F97316] px-7 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                {hub.cta.label}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            )}
          </section>

          {/* Other hubs */}
          <section className="mt-20 border-t border-[#EAEAEA] pt-14">
            <h2 className="text-2xl font-bold tracking-tight">Other topics</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {otherHubs.map((h) => (
                <Link
                  key={h.slug}
                  to={`/agency/blog/topics/${h.slug}`}
                  className="group rounded-2xl border border-[#EAEAEA] p-6 transition-shadow hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
                >
                  <h.icon className="h-5 w-5 text-[#F97316]" aria-hidden="true" />
                  <h3 className="mt-4 text-base font-bold tracking-tight group-hover:text-[#F97316]">
                    {h.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#666666]">{h.tagline}</p>
                </Link>
              ))}
            </div>
          </section>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default AgencyBlogHub;
