import { Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, ArrowRight, CalendarDays, Clock, User } from "lucide-react";
import { blogPosts } from "@/data/blogPosts";
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
  const [featured, ...rest] = blogPosts;

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

  return (
    <>
      <Helmet>
        <title>Digital Marketing Blog Kenya | Joseph Maina Agency</title>
        <meta
          name="description"
          content="Practical digital marketing insights for Kenyan brands: SEO, Meta Ads, TikTok strategy and campaign case studies from Joseph Maina."
        />
        <link rel="canonical" href={`${SITE}/agency/blog`} />
        <meta property="og:title" content="Digital Marketing Blog Kenya | Joseph Maina Agency" />
        <meta
          property="og:description"
          content="SEO, Meta Ads, TikTok strategy and campaign case studies for Kenyan brands."
        />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${SITE}/agency/blog`} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">{JSON.stringify(itemListSchema)}</script>
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

          <header className="mt-10 mb-16 max-w-2xl">
            <p className="text-sm font-semibold uppercase tracking-[0.18em] text-[#F97316]">Insights</p>
            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">
              Digital marketing, written plainly.
            </h1>
            <p className="mt-5 text-lg leading-relaxed text-[#555555]">
              Strategy notes, campaign breakdowns and honest numbers from running paid and organic
              marketing for Kenyan brands.
            </p>
          </header>

          {/* Featured */}
          <article className="mb-20 overflow-hidden rounded-2xl border border-[#EAEAEA]">
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
              <h2 className="max-w-3xl text-2xl font-bold leading-snug tracking-tight sm:text-4xl">
                <Link to={`/agency/blog/${featured.slug}`} className="hover:text-[#F97316]">
                  {featured.title}
                </Link>
              </h2>
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

          {/* Grid */}
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((post) => (
              <article
                key={post.slug}
                className="flex flex-col overflow-hidden rounded-2xl border border-[#EAEAEA] transition-shadow hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
              >
                <div className="relative h-44 bg-gradient-to-br from-[#111111] via-[#1c1c1c] to-[#2a1508]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_25%,rgba(249,115,22,0.3),transparent_60%)]" />
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
                  <p className="mt-3 text-sm leading-relaxed text-[#555555]">{post.excerpt}</p>
                  <div className="mt-5">
                    <Meta dateLabel={post.dateLabel} readTime={post.readTime} />
                  </div>
                  <Link
                    to={`/agency/blog/${post.slug}`}
                    className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#F97316] hover:gap-3 transition-all"
                  >
                    Read Article
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
};

export default AgencyBlog;
