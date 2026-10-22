import { contentImageProps } from "@/lib/responsiveImage";
import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { blogHubHead } from "@/seo/pageHeads";
import { ArrowLeft, ArrowRight, CalendarDays, ChevronRight, Clock, Eye } from "lucide-react";
import { blogHubs, getHubBySlug, getHubPosts, resolveHubServiceHref } from "@/data/blogHubs";
import { Footer } from "@/components/Footer";
import { SiteHeader } from "@/components/SiteHeader";
import { useBlogViews, formatViews, SHOW_BLOG_VIEWS } from "@/lib/useBlogViews";

const AgencyBlogHub = () => {
  const { hub: hubSlug } = useParams();
  const hub = getHubBySlug(hubSlug);
  const views = useBlogViews();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [hubSlug]);

  if (!hub) return <Navigate to="/agency/blog" replace />;
  // Old topic addresses (for example /topics/google-ads) move to the current one.
  if (hub.slug !== hubSlug) return <Navigate to={`/agency/blog/topics/${hub.slug}`} replace />;

  const posts = getHubPosts(hub);
  const [lead, ...others] = posts;
  const otherHubs = blogHubs.filter((h) => h.slug !== hub.slug);

  return (
    <>
      <Seo {...blogHubHead(hub)} />

      <SiteHeader />
      <div className="min-h-screen bg-background text-foreground">
        <div className="mx-auto max-w-6xl px-5 pb-24 pt-28 sm:px-8 sm:pt-32">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Link to="/agency/blog" className="inline-flex min-h-11 items-center gap-2 transition-colors hover:text-primary">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              All topics
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground/50" aria-hidden="true" />
            <span className="font-medium text-foreground">{hub.name}</span>
          </nav>

          {/* Intro */}
          <header className="mt-10 max-w-3xl">
            <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              <hub.icon className="h-4 w-4" aria-hidden="true" />
              Topic hub
            </p>
            <h1 className="font-display mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">{hub.name}</h1>
            {hub.intro.map((p, i) => (
              <p key={i} className="mt-5 text-lg leading-relaxed text-muted-foreground">
                {p}
              </p>
            ))}
            <p className="mt-6 text-sm text-muted-foreground">
              {posts.length} {posts.length === 1 ? "article" : "articles"} in this hub
            </p>
          </header>

          {/* Start here */}
          {lead && (
            <section className="mt-16">
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Start here</h2>
              <article className="mt-5 overflow-hidden rounded-2xl border border-border sm:flex">
                <div className="relative h-48 sm:h-auto sm:w-2/5 sm:flex-shrink-0">
                  <img
                    src={lead.thumbnail} {...contentImageProps(lead.thumbnail, "(min-width: 1024px) 760px, 100vw")}
                    alt={lead.thumbnailAlt}
                    loading="eager"
                    width={800}
                    height={440}
                    className="h-full w-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent sm:bg-gradient-to-r" />
                  <span className="absolute bottom-4 left-4 rounded-full bg-primary px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                    {lead.category}
                  </span>
                </div>
                <div className="p-7 sm:p-9">
                  <h3 className="text-xl font-bold leading-snug tracking-tight sm:text-2xl">
                    <Link to={`/agency/blog/${lead.slug}`} className="hover:text-primary">
                      {lead.title}
                    </Link>
                  </h3>
                  <p className="mt-3 text-base leading-relaxed text-muted-foreground">{lead.excerpt}</p>
                  <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
                    <span className="inline-flex items-center gap-1.5">
                      <CalendarDays className="h-4 w-4" aria-hidden="true" /> {lead.dateLabel}
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <Clock className="h-4 w-4" aria-hidden="true" /> {lead.readTime}
                    </span>
                    {SHOW_BLOG_VIEWS && views[lead.slug] !== undefined && (
                      <span className="inline-flex items-center gap-1.5">
                        <Eye className="h-4 w-4" aria-hidden="true" /> {formatViews(views[lead.slug])} views
                      </span>
                    )}
                  </div>
                  <Link
                    to={`/agency/blog/${lead.slug}`}
                    className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
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
              <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                Then read
              </h2>
              <ol className="mt-5 divide-y divide-border border-y border-border">
                {others.map((post, i) => (
                  <li key={post.slug}>
                    <Link
                      to={`/agency/blog/${post.slug}`}
                      className="group flex items-start gap-5 py-6 transition-colors hover:bg-card"
                    >
                      <span className="mt-0.5 w-6 flex-shrink-0 text-sm font-semibold tabular-nums text-muted-foreground/50">
                        {String(i + 2).padStart(2, "0")}
                      </span>
                      <div className="min-w-0 flex-1">
                        <h3 className="text-lg font-bold leading-snug tracking-tight group-hover:text-primary">
                          {post.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
                        <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                          <span className="font-semibold uppercase tracking-wider text-primary">
                            {post.category}
                          </span>
                          <span>{post.dateLabel}</span>
                          <span>{post.readTime}</span>
                          {SHOW_BLOG_VIEWS && views[post.slug] !== undefined && (
                            <span>{formatViews(views[post.slug])} views</span>
                          )}
                        </div>
                      </div>
                      <ArrowRight
                        className="mt-1 h-5 w-5 flex-shrink-0 text-muted-foreground/50 transition-colors group-hover:text-primary"
                        aria-hidden="true"
                      />
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* Related service */}
          <section className="mt-16 rounded-2xl border border-border p-8 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Related service
            </p>
            <div className="mt-4 sm:flex sm:items-end sm:justify-between sm:gap-8">
              <div className="max-w-xl">
                <h2 className="text-2xl font-bold tracking-tight">{hub.service.name}</h2>
                <p className="mt-1 text-sm font-semibold text-primary">{hub.service.price}</p>
                <p className="mt-3 text-base leading-relaxed text-muted-foreground">{hub.service.blurb}</p>
              </div>
              <Link
                to={resolveHubServiceHref(hub)}
                className="mt-6 inline-flex flex-shrink-0 items-center gap-2 rounded-full border border-foreground px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-foreground hover:text-background sm:mt-0"
              >
                View Service &amp; Pricing
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </section>

          {/* Hub CTA */}
          <section className="mt-8 rounded-2xl border border-border bg-card p-8 text-center sm:p-12">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{hub.cta.heading}</h2>
            <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">{hub.cta.body}</p>
            {hub.cta.external ? (
              <a
                href={hub.cta.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                {hub.cta.label}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            ) : (
              <Link
                to={hub.cta.href}
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                {hub.cta.label}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            )}
          </section>

          {/* Other hubs */}
          <section className="mt-20 border-t border-border pt-14">
            <h2 className="text-2xl font-bold tracking-tight">Other topics</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {otherHubs.map((h) => (
                <Link
                  key={h.slug}
                  to={`/agency/blog/topics/${h.slug}`}
                  className="group rounded-2xl border border-border p-6 transition-shadow hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
                >
                  <h.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  <h3 className="mt-4 text-base font-bold tracking-tight group-hover:text-primary">
                    {h.name}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{h.tagline}</p>
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
