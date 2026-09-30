import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, ArrowRight, CalendarDays, ChevronRight, Clock, User } from "lucide-react";
import { getPostBySlug } from "@/data/blogPosts";
import {
  getHubsForPost,
  getPrimaryHubForPost,
  getRelatedByHub,
  resolveHubServiceHref,
} from "@/data/blogHubs";
import { Footer } from "@/components/Footer";

const SITE = "https://www.josephmaina.co.ke";
const CALENDLY_URL = "https://calendly.com/joemaish084/30min";

const AgencyBlogPost = () => {
  const { slug } = useParams();
  const post = getPostBySlug(slug);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(100, (window.scrollY / max) * 100) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!post) return <Navigate to="/agency/blog" replace />;

  const url = `${SITE}/agency/blog/${post.slug}`;
  const related = getRelatedByHub(post.slug);
  const hubs = getHubsForPost(post.slug);
  const primaryHub = getPrimaryHubForPost(post.slug);

  const breadcrumb = {
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Blog", item: `${SITE}/agency/blog` },
      ...(primaryHub
        ? [
            {
              "@type": "ListItem",
              position: 2,
              name: primaryHub.name,
              item: `${SITE}/agency/blog/topics/${primaryHub.slug}`,
            },
          ]
        : []),
      { "@type": "ListItem", position: primaryHub ? 3 : 2, name: post.title, item: url },
    ],
  };

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDescription,
    datePublished: post.date,
    author: { "@type": "Person", name: "Joseph Maina", url: SITE },
    publisher: { "@type": "Organization", name: "Joseph Maina Agency", url: SITE },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    articleSection: primaryHub?.name ?? post.category,
    breadcrumb,
  };

  return (
    <>
      <Helmet>
        <title>{`${post.metaTitle} | Joseph Maina`}</title>
        <meta name="description" content={post.metaDescription} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={post.metaTitle} />
        <meta property="og:description" content={post.metaDescription} />
        <meta property="og:type" content="article" />
        <meta property="og:url" content={url} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.metaTitle} />
        <meta name="twitter:description" content={post.metaDescription} />
        <script type="application/ld+json">{JSON.stringify(schema)}</script>
      </Helmet>

      {/* Reading progress */}
      <div className="fixed inset-x-0 top-0 z-50 h-1 bg-transparent">
        <div className="h-full bg-[#F97316] transition-[width] duration-150" style={{ width: `${progress}%` }} />
      </div>

      <div className="min-h-screen bg-white text-[#111111]">
        <div className="mx-auto max-w-6xl px-5 pb-24 pt-16 sm:px-8">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-sm text-[#666666]"
          >
            <Link
              to="/agency/blog"
              className="inline-flex items-center gap-2 transition-colors hover:text-[#F97316]"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Blog
            </Link>
            {primaryHub && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-[#CCCCCC]" aria-hidden="true" />
                <Link
                  to={`/agency/blog/topics/${primaryHub.slug}`}
                  className="transition-colors hover:text-[#F97316]"
                >
                  {primaryHub.name}
                </Link>
              </>
            )}
          </nav>

          <div className="mt-10 lg:flex lg:gap-14">
            <article className="mx-auto w-full max-w-[800px]">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#F97316]">
                {post.category}
              </p>
              <h1 className="mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
                {post.title}
              </h1>

              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-[#EAEAEA] py-4 text-sm text-[#666666]">
                <span className="inline-flex items-center gap-1.5">
                  <User className="h-4 w-4" aria-hidden="true" /> Joseph Maina
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4" aria-hidden="true" /> {post.dateLabel}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4" aria-hidden="true" /> {post.readTime}
                </span>
              </div>

              <p className="mt-10 text-xl leading-relaxed text-[#333333]">{post.intro}</p>

              {post.sections.map((section) => (
                <section key={section.id} id={section.id} className="mt-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{section.heading}</h2>
                  {section.paragraphs.map((p, i) => (
                    <p key={i} className="mt-5 text-lg leading-[1.85] text-[#444444]">
                      {p}
                    </p>
                  ))}
                  {section.image && (
                    <figure className="mt-8">
                      <img
                        src={section.image.src}
                        alt={section.image.alt}
                        loading="lazy"
                        className="w-full rounded-2xl border border-[#EAEAEA] object-cover"
                      />
                      {section.image.caption && (
                        <figcaption className="mt-3 text-center text-sm text-[#999999]">
                          {section.image.caption}
                        </figcaption>
                      )}
                    </figure>
                  )}
                </section>
              ))}

              {/* Related service for this topic */}
              {primaryHub && (
                <section className="mt-20 rounded-2xl border border-[#EAEAEA] p-7 sm:p-9">
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#999999]">
                    Related service
                  </p>
                  <h2 className="mt-4 text-xl font-bold tracking-tight sm:text-2xl">
                    {primaryHub.service.name}
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-[#F97316]">{primaryHub.service.price}</p>
                  <p className="mt-3 text-base leading-relaxed text-[#555555]">
                    {primaryHub.service.blurb}
                  </p>
                  <Link
                    to={resolveHubServiceHref(primaryHub)}
                    className="mt-6 inline-flex items-center gap-2 rounded-full border border-[#111111] px-6 py-3 text-sm font-semibold text-[#111111] transition-colors hover:bg-[#111111] hover:text-white"
                  >
                    View Service &amp; Pricing
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </section>
              )}

              {/* CTA */}
              <div className="mt-8 rounded-2xl border border-[#EAEAEA] bg-[#FAFAFA] p-8 text-center sm:p-12">
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {primaryHub ? primaryHub.cta.heading : "Ready to grow your business?"}
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-[#555555]">
                  {primaryHub ? primaryHub.cta.body : "Book a free strategy call."}
                </p>
                {primaryHub && !primaryHub.cta.external ? (
                  <Link
                    to={primaryHub.cta.href}
                    className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#F97316] px-7 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    {primaryHub.cta.label}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                ) : (
                  <a
                    href={primaryHub ? primaryHub.cta.href : CALENDLY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#F97316] px-7 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    {primaryHub ? primaryHub.cta.label : "Book a Free Strategy Call"}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </a>
                )}
              </div>
            </article>

            {/* Table of contents */}
            <aside className="hidden lg:block lg:w-64 lg:flex-shrink-0">
              <nav aria-label="Table of contents" className="sticky top-24">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#999999]">
                  On this page
                </p>
                <ul className="mt-4 space-y-3 border-l border-[#EAEAEA] pl-4">
                  {post.sections.map((s) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className="text-sm leading-snug text-[#666666] transition-colors hover:text-[#F97316]"
                      >
                        {s.heading}
                      </a>
                    </li>
                  ))}
                </ul>

                {hubs.length > 0 && (
                  <div className="mt-10 border-t border-[#EAEAEA] pt-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#999999]">
                      Part of
                    </p>
                    <ul className="mt-4 space-y-2.5">
                      {hubs.map((h) => (
                        <li key={h.slug}>
                          <Link
                            to={`/agency/blog/topics/${h.slug}`}
                            className="inline-flex items-start gap-2 text-sm font-semibold leading-snug text-[#F97316] hover:underline"
                          >
                            <h.icon className="mt-0.5 h-4 w-4 flex-shrink-0" aria-hidden="true" />
                            {h.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </nav>
            </aside>
          </div>

          {/* Related */}
          {related.length > 0 && (
            <section className="mt-24 border-t border-[#EAEAEA] pt-14">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <h2 className="text-2xl font-bold tracking-tight">
                  {primaryHub ? `More on ${primaryHub.name}` : "Related articles"}
                </h2>
                {primaryHub && (
                  <Link
                    to={`/agency/blog/topics/${primaryHub.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#F97316] transition-all hover:gap-3"
                  >
                    See the whole hub
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                )}
              </div>
              <div className="mt-8 grid gap-8 md:grid-cols-3">
                {related.map((r) => (
                  <article key={r.slug} className="overflow-hidden rounded-2xl border border-[#EAEAEA]">
                    <div className="relative h-32">
                      <img
                        src={r.thumbnail}
                        alt={r.thumbnailAlt}
                        loading="lazy"
                        width={400}
                        height={128}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                      <span className="absolute bottom-3 left-3 rounded-full bg-[#F97316] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                        {r.category}
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="text-base font-bold leading-snug">
                        <Link to={`/agency/blog/${r.slug}`} className="hover:text-[#F97316]">
                          {r.title}
                        </Link>
                      </h3>
                      <p className="mt-2 text-sm text-[#666666]">{r.readTime}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}
        </div>
        <Footer />
      </div>
    </>
  );
};

export default AgencyBlogPost;
