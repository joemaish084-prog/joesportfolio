import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, ArrowRight, CalendarDays, ChevronLeft, ChevronRight, Clock, Eye, Pause, Play, User } from "lucide-react";
import { blogPosts, type BlogPost } from "@/data/blogPosts";
import { blogHubs, getHubPosts, getUnhubbedPosts } from "@/data/blogHubs";
import { Footer } from "@/components/Footer";
import { useBlogViews, formatViews, SHOW_BLOG_VIEWS } from "@/lib/useBlogViews";

const SITE = "https://www.josephmaina.co.ke";

const Meta = ({
  dateLabel,
  readTime,
  views,
}: {
  dateLabel: string;
  readTime: string;
  views?: number;
}) => (
  <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-[#666666]">
    <span className="inline-flex items-center gap-1.5">
      <User className="h-4 w-4" aria-hidden="true" /> Joseph Maina
    </span>
    <span className="inline-flex items-center gap-1.5">
      <CalendarDays className="h-4 w-4" aria-hidden="true" /> {dateLabel}
    </span>
    <span className="inline-flex items-center gap-1.5">
      <Clock className="h-4 w-4" aria-hidden="true" /> {readTime}
    </span>
    {SHOW_BLOG_VIEWS && views !== undefined && (
      <span className="inline-flex items-center gap-1.5">
        <Eye className="h-4 w-4" aria-hidden="true" /> {formatViews(views)} views
      </span>
    )}
  </div>
);


const ROTATE_SECONDS = 30;

/** The pinned post first, then every other post in a fresh random order each visit. */
function featuredOrder(): BlogPost[] {
  const [pinned, ...rest] = blogPosts;
  for (let i = rest.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }
  return [pinned, ...rest];
}

function FeaturedRotator({ views }: { views: Record<string, number> }) {
  const [order] = useState(featuredOrder);
  const [index, setIndex] = useState(0);
  // Visitors who prefer reduced motion start paused; the arrows still work.
  const [paused, setPaused] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [hovering, setHovering] = useState(false);
  const [tabHidden, setTabHidden] = useState(false);

  useEffect(() => {
    const onVisibility = () => setTabHidden(document.visibilityState === "hidden");
    document.addEventListener("visibilitychange", onVisibility);
    return () => document.removeEventListener("visibilitychange", onVisibility);
  }, []);

  const running = !paused && !hovering && !tabHidden;
  const post = order[index];
  const go = (delta: number) => setIndex((i) => (i + delta + order.length) % order.length);

  return (
    <section
      className="mb-20"
      aria-roledescription="carousel"
      aria-label="Featured articles"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      onFocus={() => setHovering(true)}
      onBlur={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHovering(false);
      }}
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#999999]">Featured</h2>
        <div className="flex items-center gap-1">
          <span className="mr-2 text-xs tabular-nums text-[#999999]">
            {index + 1} / {order.length}
          </span>
          <button
            type="button"
            onClick={() => go(-1)}
            aria-label="Previous featured article"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#EAEAEA] text-[#555555] transition-colors hover:border-[#F97316] hover:text-[#F97316]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={() => setPaused((v) => !v)}
            aria-label={paused ? "Resume rotating featured articles" : "Pause rotating featured articles"}
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#EAEAEA] text-[#555555] transition-colors hover:border-[#F97316] hover:text-[#F97316]"
          >
            {paused ? <Play className="h-4 w-4" /> : <Pause className="h-4 w-4" />}
          </button>
          <button
            type="button"
            onClick={() => go(1)}
            aria-label="Next featured article"
            className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-[#EAEAEA] text-[#555555] transition-colors hover:border-[#F97316] hover:text-[#F97316]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* The bar is the timer: when its animation finishes, the next article shows. */}
      <div className="mt-4 h-1 overflow-hidden rounded-full bg-[#F1F1F1]" aria-hidden="true">
        {!paused && (
          <div
            key={post.slug}
            className="h-full origin-left rounded-full bg-[#F97316]"
            style={{
              animation: `featured-progress ${ROTATE_SECONDS}s linear forwards`,
              animationPlayState: running ? "running" : "paused",
            }}
            onAnimationEnd={() => go(1)}
          />
        )}
      </div>

      <article
        key={post.slug}
        aria-live={running ? "off" : "polite"}
        className="mt-4 overflow-hidden rounded-2xl border border-[#EAEAEA] animate-fade-in"
      >
        <div className="relative h-56 sm:h-80">
          <img
            src={post.thumbnail}
            alt={post.thumbnailAlt}
            loading="eager"
            width={1200}
            height={630}
            className="h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <span className="absolute bottom-6 left-6 rounded-full bg-[#F97316] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
            {post.category}
          </span>
        </div>
        <div className="p-7 sm:p-10">
          <h3 className="max-w-3xl text-2xl font-bold leading-snug tracking-tight sm:text-4xl">
            <Link to={`/agency/blog/${post.slug}`} className="hover:text-[#F97316]">
              {post.title}
            </Link>
          </h3>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#555555] sm:text-lg">{post.excerpt}</p>
          <div className="mt-6">
            <Meta dateLabel={post.dateLabel} readTime={post.readTime} views={views[post.slug]} />
          </div>
          <Link
            to={`/agency/blog/${post.slug}`}
            className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#F97316] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
          >
            Read Article
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
      </article>
    </section>
  );
}

const AgencyBlog = () => {
  const strays = getUnhubbedPosts();
  const views = useBlogViews();

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Joseph Maina Agency Blog",
    url: `${SITE}/agency/blog`,
    blogPost: blogPosts.map((p) => ({
      "@type": "BlogPosting",
      headline: p.title,
      description: p.excerpt,
      datePublished: p.date,
      author: { "@type": "Person", name: "Joseph Maina" },
      url: `${SITE}/agency/blog/${p.slug}`,
    })),
  };

  const hubListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "Blog topic hubs",
    itemListElement: blogHubs.map((h, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: h.name,
      url: `${SITE}/agency/blog/topics/${h.slug}`,
    })),
  };

  return (
    <>
      <Helmet>
        <title>Digital Marketing Blog Kenya | Joseph Maina Agency</title>
        <meta
          name="description"
          content="Practical digital marketing insights for Kenyan brands, organised by topic: SEO, Meta Ads, Google Ads, TikTok strategy and campaign case studies."
        />
        <link rel="canonical" href={`${SITE}/agency/blog`} />
        <meta property="og:title" content="Digital Marketing Blog Kenya | Joseph Maina Agency" />
        <meta
          property="og:description"
          content="SEO, Meta Ads, Google Ads, TikTok strategy and campaign case studies for Kenyan brands."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE}/agency/blog`} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(hubListSchema)}</script>
      </Helmet>

      <div className="min-h-screen bg-white text-[#111111]">
        <div className="mx-auto max-w-6xl px-5 pb-24 pt-16 sm:px-8">
          <Link
            to="/agency"
            className="inline-flex min-h-11 items-center gap-2 text-sm text-[#666666] transition-colors hover:text-[#F97316]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Agency
          </Link>

          <header className="mt-10 mb-10 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#F97316]">Insights</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Digital marketing, written plainly.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-[#555555]">
              Strategy notes, campaign breakdowns and honest numbers from running paid and organic
              marketing for Kenyan brands. Pick a topic from the side, or start with the latest piece.
            </p>
          </header>

          {/* Topic nav: horizontal chips on mobile/tablet, sticky sidebar from lg up */}
          <nav aria-label="Browse by topic" className="mb-10 lg:hidden">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#999999]">
                Browse by topic
              </h2>
              <p className="text-xs text-[#999999]">{blogPosts.length} articles</p>
            </div>
            <div className="mt-4 flex gap-2.5 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
              {blogHubs.map((hub) => {
                const count = getHubPosts(hub).length;
                return (
                  <Link
                    key={hub.slug}
                    to={`/agency/blog/topics/${hub.slug}`}
                    className="inline-flex shrink-0 items-center gap-2 whitespace-nowrap rounded-full border border-[#EAEAEA] px-4 py-2.5 text-sm font-semibold text-[#333333] transition-colors hover:border-[#F97316] hover:text-[#F97316]"
                  >
                    <hub.icon className="h-4 w-4 text-[#F97316]" aria-hidden="true" />
                    {hub.name}
                    <span className="text-[#999999]">{count}</span>
                  </Link>
                );
              })}
            </div>
          </nav>

          <div className="lg:flex lg:gap-14">
            <div className="min-w-0 flex-1">
              <FeaturedRotator views={views} />

              {/* Every article, grouped under its hub */}
              {blogHubs.map((hub) => {
                const posts = getHubPosts(hub);
                if (posts.length === 0) return null;
                return (
                  <section key={hub.slug} id={hub.slug} className="mb-20 scroll-mt-24 border-t border-[#EAEAEA] pt-12">
                    <div className="flex flex-wrap items-end justify-between gap-4">
                      <div className="max-w-2xl">
                        <h2 className="inline-flex items-center gap-2.5 text-2xl font-bold tracking-tight">
                          <hub.icon className="h-5 w-5 text-[#F97316]" aria-hidden="true" />
                          {hub.name}
                        </h2>
                        <p className="mt-2 text-base leading-relaxed text-[#555555]">{hub.tagline}</p>
                      </div>
                      <Link
                        to={`/agency/blog/topics/${hub.slug}`}
                        className="inline-flex min-h-11 items-center gap-2 text-sm font-semibold text-[#F97316] transition-all hover:gap-3"
                      >
                        Open hub
                        <ArrowRight className="h-4 w-4" aria-hidden="true" />
                      </Link>
                    </div>

                    <div className="mt-8 grid gap-8 md:grid-cols-2">
                      {posts.map((post) => (
                        <article
                          key={post.slug}
                          className="relative flex flex-col overflow-hidden rounded-2xl border border-[#EAEAEA] transition-shadow hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
                        >
                          <div className="relative h-44">
                            <img
                              src={post.thumbnail}
                              alt={post.thumbnailAlt}
                              loading="lazy"
                              width={800}
                              height={440}
                              className="h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                            <span className="absolute bottom-4 left-4 rounded-full bg-[#F97316] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                              {post.category}
                            </span>
                          </div>
                          <div className="flex flex-1 flex-col p-6">
                            <h3 className="text-lg font-bold leading-snug tracking-tight">
                              <Link to={`/agency/blog/${post.slug}`} className="hover:text-[#F97316]">
                                {post.title}
                              </Link>
                            </h3>
                            <p className="mt-3 flex-1 text-sm leading-relaxed text-[#555555]">{post.excerpt}</p>
                            <div className="mt-5">
                              <Meta dateLabel={post.dateLabel} readTime={post.readTime} views={views[post.slug]} />
                            </div>
                            <Link
                              to={`/agency/blog/${post.slug}`}
                              // after: stretches the link over the whole card, so the card is one big tap target
                              className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#F97316] transition-all hover:gap-3 after:absolute after:inset-0 after:content-['']"
                            >
                              Read Article
                              <ArrowRight className="h-4 w-4" aria-hidden="true" />
                            </Link>
                          </div>
                        </article>
                      ))}
                    </div>
                  </section>
                );
              })}

              {/* Anything not yet assigned to a hub */}
              {strays.length > 0 && (
                <section className="mb-20 border-t border-[#EAEAEA] pt-12">
                  <h2 className="text-2xl font-bold tracking-tight">More writing</h2>
                  <div className="mt-8 grid gap-8 md:grid-cols-2">
                    {strays.map((post) => (
                      <article
                        key={post.slug}
                        className="relative flex flex-col overflow-hidden rounded-2xl border border-[#EAEAEA] transition-shadow hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
                      >
                        <div className="relative h-44">
                          <img
                            src={post.thumbnail}
                            alt={post.thumbnailAlt}
                            loading="lazy"
                            width={800}
                            height={440}
                            className="h-full w-full object-cover"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                          <span className="absolute bottom-4 left-4 rounded-full bg-[#F97316] px-3 py-1 text-[11px] font-semibold uppercase tracking-wider text-white">
                            {post.category}
                          </span>
                        </div>
                        <div className="flex flex-1 flex-col p-6">
                          <h3 className="text-lg font-bold leading-snug tracking-tight">
                            <Link to={`/agency/blog/${post.slug}`} className="hover:text-[#F97316]">
                              {post.title}
                            </Link>
                          </h3>
                          <p className="mt-3 flex-1 text-sm leading-relaxed text-[#555555]">{post.excerpt}</p>
                          <div className="mt-5">
                            <Meta dateLabel={post.dateLabel} readTime={post.readTime} views={views[post.slug]} />
                          </div>
                          <Link
                            to={`/agency/blog/${post.slug}`}
                            className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#F97316] transition-all hover:gap-3 after:absolute after:inset-0 after:content-['']"
                          >
                            Read Article
                            <ArrowRight className="h-4 w-4" aria-hidden="true" />
                          </Link>
                        </div>
                      </article>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* Topic sidebar, desktop only */}
            <aside className="hidden lg:block lg:w-72 lg:flex-shrink-0">
              <div className="sticky top-24">
                <div className="flex items-baseline justify-between gap-4">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-[#999999]">
                    Browse by topic
                  </h2>
                  <p className="text-xs text-[#999999]">{blogPosts.length} articles</p>
                </div>
                <nav aria-label="Browse by topic" className="mt-5 space-y-1">
                  {blogHubs.map((hub) => {
                    const count = getHubPosts(hub).length;
                    return (
                      <a
                        key={hub.slug}
                        href={`#${hub.slug}`}
                        className="group flex items-center gap-3 rounded-xl border border-transparent px-3 py-3 transition-colors hover:border-[#EAEAEA] hover:bg-[#FAFAFA]"
                      >
                        <hub.icon className="h-4.5 w-4.5 flex-shrink-0 text-[#F97316]" aria-hidden="true" />
                        <span className="flex-1 text-sm font-semibold text-[#333333] group-hover:text-[#F97316]">
                          {hub.name}
                        </span>
                        <span className="text-xs text-[#999999]">{count}</span>
                      </a>
                    );
                  })}
                </nav>
              </div>
            </aside>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default AgencyBlog;
