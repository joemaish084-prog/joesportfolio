import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { blogPostHead } from "@/seo/heads";
import { ArrowLeft, ArrowRight, Calculator, CalendarDays, ChevronRight, Clock, Eye, User } from "lucide-react";
import { CALCULATOR_HUBS, CALCULATOR_PATH } from "@/data/adCalculatorContent";
import { getPostBySlug } from "@/data/blogPosts";
import {
  getHubsForPost,
  getPrimaryHubForPost,
  getRelatedByHub,
  resolveHubServiceHref,
} from "@/data/blogHubs";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { MetaTurnaroundVisual } from "@/components/MetaTurnaroundVisual";
import { useBlogViews, formatViews, SHOW_BLOG_VIEWS } from "@/lib/useBlogViews";

const CALENDLY_URL = "https://calendly.com/joemaish084/30min";

const AgencyBlogPost = () => {
  const { slug } = useParams();
  const post = getPostBySlug(slug);
  const [progress, setProgress] = useState(0);
  const views = useBlogViews();

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

  const related = getRelatedByHub(post.slug);
  const hubs = getHubsForPost(post.slug);
  const primaryHub = getPrimaryHubForPost(post.slug);

  return (
    <>
      <Seo {...blogPostHead(post)} />

      {/* Reading progress */}
      <div className="fixed inset-x-0 top-0 z-[60] h-1 bg-transparent">
        <div className="h-full bg-primary transition-[width] duration-150" style={{ width: `${progress}%` }} />
      </div>

      <SiteHeader />
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-6xl px-5 pb-24 pt-28 sm:px-8 sm:pt-32">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground"
          >
            <Link
              to="/agency/blog"
              className="inline-flex items-center gap-2 transition-colors hover:text-primary"
            >
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Blog
            </Link>
            {primaryHub && (
              <>
                <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" aria-hidden="true" />
                <Link
                  to={`/agency/blog/topics/${primaryHub.slug}`}
                  className="transition-colors hover:text-primary"
                >
                  {primaryHub.name}
                </Link>
              </>
            )}
          </nav>

          <div className="mt-10 lg:flex lg:gap-14">
            <article className="mx-auto w-full max-w-[800px]">
              <p className="text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                {post.category}
              </p>
              <h1 className="font-display mt-4 text-3xl font-bold leading-tight tracking-tight sm:text-5xl">
                {post.title}
              </h1>

              <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-y border-border py-4 text-sm text-muted-foreground">
                <span className="inline-flex items-center gap-1.5">
                  <User className="h-4 w-4" aria-hidden="true" /> Joseph Maina
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4" aria-hidden="true" /> {post.dateLabel}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Clock className="h-4 w-4" aria-hidden="true" /> {post.readTime}
                </span>
                {SHOW_BLOG_VIEWS && views[post.slug] !== undefined && (
                  <span className="inline-flex items-center gap-1.5">
                    <Eye className="h-4 w-4" aria-hidden="true" /> {formatViews(views[post.slug])} views
                  </span>
                )}
              </div>

              <figure className="mt-8">
                <img
                  src={post.thumbnail}
                  alt={post.thumbnailAlt}
                  loading="eager"
                  width={1200}
                  height={630}
                  className="h-56 w-full rounded-2xl border border-border object-cover sm:h-80"
                />
              </figure>

              {post.heroVisual && (
                <MetaTurnaroundVisual kind={post.heroVisual} tone="theme" className="mt-8" />
              )}

              <p className="mt-10 text-xl leading-relaxed text-foreground/90">{post.intro}</p>

              {post.sections.map((section) => (
                <section key={section.id} id={section.id} className="mt-12 scroll-mt-24">
                  <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{section.heading}</h2>
                  {section.paragraphs.map((p, i) => (
                    <p key={i} className="mt-5 text-lg leading-[1.85] text-foreground/80">
                      {p}
                    </p>
                  ))}
                  {section.visuals?.map((kind) => (
                    <MetaTurnaroundVisual key={kind} kind={kind} tone="theme" className="mt-8" />
                  ))}
                  {section.image && (
                    <figure className="mt-8">
                      <img
                        src={section.image.src}
                        width={section.image.width}
                        height={section.image.height}
                        decoding="async"
                        alt={section.image.alt}
                        loading="lazy"
                        className="w-full rounded-2xl border border-border object-cover"
                      />
                      {section.image.caption && (
                        <figcaption className="mt-3 text-center text-sm text-muted-foreground">
                          {section.image.caption}
                        </figcaption>
                      )}
                    </figure>
                  )}
                </section>
              ))}

              {/* Budget calculator, for posts about paid acquisition and pricing */}
              {primaryHub && CALCULATOR_HUBS.includes(primaryHub.slug) && (
                <Link
                  to={CALCULATOR_PATH}
                  className="group mt-20 flex items-center gap-4 rounded-2xl border border-primary/30 bg-primary/5 p-6 transition-colors hover:border-primary/60"
                >
                  <Calculator className="h-8 w-8 shrink-0 text-primary" aria-hidden="true" />
                  <span className="flex-1">
                    <span className="block font-semibold">Will your ad budget pay for itself?</span>
                    <span className="mt-0.5 block text-sm text-muted-foreground">
                      Run your own numbers in the free ad budget calculator.
                    </span>
                  </span>
                  <ArrowRight
                    className="h-5 w-5 shrink-0 text-primary transition-transform group-hover:translate-x-1"
                    aria-hidden="true"
                  />
                </Link>
              )}

              {/* Related service for this topic */}
              {primaryHub && (
                <section
                  className={`${CALCULATOR_HUBS.includes(primaryHub.slug) ? "mt-6" : "mt-20"} rounded-2xl border border-border p-7 sm:p-9`}
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    Related service
                  </p>
                  <h2 className="mt-4 text-xl font-bold tracking-tight sm:text-2xl">
                    {primaryHub.service.name}
                  </h2>
                  <p className="mt-1 text-sm font-semibold text-primary">{primaryHub.service.price}</p>
                  <p className="mt-3 text-base leading-relaxed text-muted-foreground">
                    {primaryHub.service.blurb}
                  </p>
                  <Link
                    to={resolveHubServiceHref(primaryHub)}
                    className="mt-6 inline-flex items-center gap-2 rounded-full border border-foreground px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-foreground hover:text-background"
                  >
                    View Service &amp; Pricing
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </section>
              )}

              {/* CTA */}
              <div className="mt-8 rounded-2xl border border-border bg-card p-8 text-center sm:p-12">
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  {primaryHub ? primaryHub.cta.heading : "Ready to grow your business?"}
                </h2>
                <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">
                  {primaryHub ? primaryHub.cta.body : "Book a free strategy call."}
                </p>
                {primaryHub && !primaryHub.cta.external ? (
                  <Link
                    to={primaryHub.cta.href}
                    className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                  >
                    {primaryHub.cta.label}
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                ) : (
                  <a
                    href={primaryHub ? primaryHub.cta.href : CALENDLY_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
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
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  On this page
                </p>
                <ul className="mt-4 space-y-3 border-l border-border pl-4">
                  {post.sections.map((s) => (
                    <li key={s.id}>
                      <a
                        href={`#${s.id}`}
                        className="text-sm leading-snug text-muted-foreground transition-colors hover:text-primary"
                      >
                        {s.heading}
                      </a>
                    </li>
                  ))}
                </ul>

                {hubs.length > 0 && (
                  <div className="mt-10 border-t border-border pt-6">
                    <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                      Part of
                    </p>
                    <ul className="mt-4 space-y-2.5">
                      {hubs.map((h) => (
                        <li key={h.slug}>
                          <Link
                            to={`/agency/blog/topics/${h.slug}`}
                            className="inline-flex items-start gap-2 text-sm font-semibold leading-snug text-primary hover:underline"
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
            <section className="mt-24 border-t border-border pt-14">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <h2 className="text-2xl font-bold tracking-tight">
                  {primaryHub ? `More on ${primaryHub.name}` : "Related articles"}
                </h2>
                {primaryHub && (
                  <Link
                    to={`/agency/blog/topics/${primaryHub.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-all hover:gap-3"
                  >
                    See the whole hub
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                )}
              </div>
              <div className="mt-8 grid gap-8 md:grid-cols-3">
                {related.map((r) => (
                  <article key={r.slug} className="overflow-hidden rounded-2xl border border-border">
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
                      <span className="absolute bottom-3 left-3 rounded-full bg-primary px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                        {r.category}
                      </span>
                    </div>
                    <div className="p-5">
                      <h3 className="text-base font-bold leading-snug">
                        <Link to={`/agency/blog/${r.slug}`} className="hover:text-primary">
                          {r.title}
                        </Link>
                      </h3>
                      <p className="mt-2 text-sm text-muted-foreground">{r.readTime}</p>
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
