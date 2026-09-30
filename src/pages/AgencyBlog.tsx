import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, ArrowRight, CalendarDays, Clock, User } from "lucide-react";
import { blogPosts } from "@/data/blogPosts";
import { blogHubs, getHubPosts, getUnhubbedPosts } from "@/data/blogHubs";
import { Footer } from "@/components/Footer";

const SITE = "https://www.josephmaina.co.ke";

const Meta = ({ dateLabel, readTime }: { dateLabel: string; readTime: string }) => (
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
  </div>
);

const AgencyBlog = () => {
  const featured = blogPosts[0];
  const strays = getUnhubbedPosts();

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
            className="inline-flex items-center gap-2 text-sm text-[#666666] transition-colors hover:text-[#F97316]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Agency
          </Link>

          <header className="mt-10 mb-14 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#F97316]">Insights</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Digital marketing, written plainly.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-[#555555]">
              Strategy notes, campaign breakdowns and honest numbers from running paid and organic
              marketing for Kenyan brands. Pick a topic below, or start with the latest piece.
            </p>
          </header>

          {/* Topic hubs */}
          <section className="mb-20">
            <div className="flex items-baseline justify-between gap-4">
              <h2 className="text-2xl font-bold tracking-tight">Browse by topic</h2>
              <p className="text-sm text-[#888888]">{blogPosts.length} articles</p>
            </div>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {blogHubs.map((hub) => {
                const count = getHubPosts(hub).length;
                return (
                  <Link
                    key={hub.slug}
                    to={`/agency/blog/topics/${hub.slug}`}
                    className="group flex flex-col rounded-2xl border border-[#EAEAEA] p-7 transition-shadow hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
                  >
                    <hub.icon className="h-6 w-6 text-[#F97316]" aria-hidden="true" />
                    <h3 className="mt-5 text-lg font-bold tracking-tight group-hover:text-[#F97316]">
                      {hub.name}
                    </h3>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-[#555555]">{hub.tagline}</p>
                    <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#F97316]">
                      {count} {count === 1 ? "article" : "articles"}
                      <ArrowRight
                        className="h-4 w-4 transition-transform group-hover:translate-x-1"
                        aria-hidden="true"
                      />
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Latest */}
          <section className="mb-20">
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-[#999999]">Latest</h2>
            <article className="mt-5 overflow-hidden rounded-2xl border border-[#EAEAEA]">
              <div className="relative h-56 sm:h-80">
                <img
                  src={featured.thumbnail}
                  alt={featured.thumbnailAlt}
                  loading="eager"
                  width={1200}
                  height={630}
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <span className="absolute bottom-6 left-6 rounded-full bg-[#F97316] px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white">
                  {featured.category}
                </span>
              </div>
              <div className="p-7 sm:p-10">
                <h3 className="max-w-3xl text-2xl font-bold leading-snug tracking-tight sm:text-4xl">
                  <Link to={`/agency/blog/${featured.slug}`} className="hover:text-[#F97316]">
                    {featured.title}
                  </Link>
                </h3>
                <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#555555] sm:text-lg">
                  {featured.excerpt}
                </p>
                <div className="mt-6">
                  <Meta dateLabel={featured.dateLabel} readTime={featured.readTime} />
                </div>
                <Link
                  to={`/agency/blog/${featured.slug}`}
                  className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#F97316] px-6 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Read Article
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            </article>
          </section>

          {/* Every article, grouped under its hub */}
          {blogHubs.map((hub) => {
            const posts = getHubPosts(hub);
            if (posts.length === 0) return null;
            return (
              <section key={hub.slug} className="mb-20 border-t border-[#EAEAEA] pt-12">
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
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#F97316] transition-all hover:gap-3"
                  >
                    Open hub
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>

                <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                  {posts.map((post) => (
                    <article
                      key={post.slug}
                      className="flex flex-col overflow-hidden rounded-2xl border border-[#EAEAEA] transition-shadow hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
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
                          <Meta dateLabel={post.dateLabel} readTime={post.readTime} />
                        </div>
                        <Link
                          to={`/agency/blog/${post.slug}`}
                          className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#F97316] transition-all hover:gap-3"
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
              <div className="mt-8 grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {strays.map((post) => (
                  <article
                    key={post.slug}
                    className="flex flex-col overflow-hidden rounded-2xl border border-[#EAEAEA] transition-shadow hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
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
                        <Meta dateLabel={post.dateLabel} readTime={post.readTime} />
                      </div>
                      <Link
                        to={`/agency/blog/${post.slug}`}
                        className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#F97316] transition-all hover:gap-3"
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
        <Footer />
      </div>
    </>
  );
};

export default AgencyBlog;
