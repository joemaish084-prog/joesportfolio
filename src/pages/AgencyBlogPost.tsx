import { useEffect, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { ArrowLeft, ArrowRight, CalendarDays, Clock, User } from "lucide-react";
import { getPostBySlug, getRelatedPosts } from "@/data/blogPosts";
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
  const related = getRelatedPosts(post.slug);

  const schema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.metaDescription,
    datePublished: post.date,
    author: { "@type": "Person", name: "Joseph Maina", url: SITE },
    publisher: { "@type": "Organization", name: "Joseph Maina Agency", url: SITE },
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    articleSection: post.category,
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
          <Link
            to="/agency/blog"
            className="inline-flex items-center gap-2 text-sm text-[#666666] transition-colors hover:text-[#F97316]"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Blog
          </Link>

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
                </section>
              ))}

              {/* CTA */}
              <div className="mt-20 rounded-2xl border border-[#EAEAEA] bg-[#FAFAFA] p-8 text-center sm:p-12">
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  Ready to grow your business?
                </h2>
                <p className="mt-3 text-base text-[#555555]">Book a free strategy call.</p>
                <a
                  href={CALENDLY_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#F97316] px-7 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  Book a Free Strategy Call
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
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
              </nav>
            </aside>
          </div>

          {/* Related */}
          {related.length > 0 && (
            <section className="mt-24 border-t border-[#EAEAEA] pt-14">
              <h2 className="text-2xl font-bold tracking-tight">Related articles</h2>
              <div className="mt-8 grid gap-8 md:grid-cols-3">
                {related.map((r) => (
                  <article key={r.slug} className="overflow-hidden rounded-2xl border border-[#EAEAEA]">
                    <div className="relative h-32 bg-gradient-to-br from-[#111111] via-[#1c1c1c] to-[#2a1508]">
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
