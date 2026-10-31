import { useEffect } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { serviceHead } from "@/seo/pageHeads";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, ChevronRight, MessageCircle, Quote, X } from "lucide-react";
import {
  SERVICE_PROCESS,
  getServicePageBySlug,
  servicePages,
} from "@/data/servicePages";
import { getHubBySlug } from "@/data/blogHubs";
import { blogPosts } from "@/data/blogPosts";
import { Footer } from "@/components/Footer";
import { AgencyNavigation } from "@/components/agency/AgencyNavigation";

/** The lower-commitment ways to get in touch, beside each page's main booking button. */
function OtherContactOptions({ slug, name, briefIsPrimary, className = "" }: { slug: string; name: string; briefIsPrimary: boolean; className?: string }) {
  const whatsappText = encodeURIComponent(`Hi Joseph! I'd like to talk about ${name}.`);
  return (
    <p className={`flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold ${className}`}>
      <a
        href={`https://wa.me/254704700160?text=${whatsappText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-11 items-center gap-2 text-[#111111] transition-colors hover:text-[#F97316]"
      >
        <MessageCircle className="h-4 w-4" aria-hidden="true" />
        Message me on WhatsApp
      </a>
      {!briefIsPrimary && (
        <Link to={`/agency/contact?service=${slug}#brief`} className="inline-flex min-h-11 items-center text-[#555555] transition-colors hover:text-[#F97316]">
          Or send a project brief
        </Link>
      )}
    </p>
  );
}

const AgencyService = () => {
  const { service: slug } = useParams();
  const page = getServicePageBySlug(slug);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [slug]);

  if (!page) return <Navigate to="/agency" replace />;

  const hub = getHubBySlug(page.hubSlug);
  const related = page.relatedPosts
    .map((s) => blogPosts.find((p) => p.slug === s))
    .filter((p): p is (typeof blogPosts)[number] => Boolean(p));
  const caseStudyPost = page.caseStudy?.readMore
    ? blogPosts.find((p) => p.slug === page.caseStudy?.readMore)
    : undefined;
  const otherServices = servicePages.filter((s) => s.slug !== page.slug);

  return (
    <>
      <Seo {...serviceHead(page)} />

      <div className="min-h-screen bg-white text-[#111111]">
        <AgencyNavigation solid />
        <div className="mx-auto max-w-5xl px-5 pb-24 pt-10 sm:px-8">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-[#666666]">
            <Link to="/agency" className="inline-flex items-center gap-2 transition-colors hover:text-[#F97316]">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Agency
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-[#CCCCCC]" aria-hidden="true" />
            <Link to="/agency/services" className="hover:text-[#F97316]">Services</Link>
            <ChevronRight className="h-3.5 w-3.5 text-[#CCCCCC]" aria-hidden="true" />
            <span className="font-medium text-[#111111]">{page.navLabel}</span>
          </nav>

          {/* Draft review banner — never shown once draft is cleared */}
          {page.draft && (
            <div className="mt-8 rounded-2xl border border-[#F59E0B] bg-[#FFFBEB] p-6">
              <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-[#B45309]">
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                Draft — not indexed
              </p>
              <p className="mt-3 text-sm leading-relaxed text-[#78350F]">
                This page is set to <code className="font-mono">noindex</code> and is excluded from the
                sitemap until the items below are confirmed. Anything marked{" "}
                <span className="font-semibold">[CONFIRM]</span> in the copy is a placeholder, not a claim.
              </p>
              <ul className="mt-4 space-y-2">
                {page.reviewNotes.map((note) => (
                  <li key={note} className="flex items-start gap-2 text-sm leading-relaxed text-[#78350F]">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#B45309]" />
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Hero */}
          <header data-track-location="service_hero" className="mt-10 max-w-3xl">
            <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-[#F97316]">
              <page.icon className="h-4 w-4" aria-hidden="true" />
              Service
            </p>
            <h1 className="mt-4 text-4xl font-bold leading-tight tracking-tight sm:text-5xl">{page.name}</h1>
            <p className="mt-5 text-lg leading-relaxed text-[#555555]">{page.standfirst}</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              {page.cta.external ? (
                <a
                  href={page.cta.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-full bg-[#F97316] px-7 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  {page.cta.label}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </a>
              ) : (
                <Link
                  to={page.cta.href}
                  className="inline-flex items-center gap-2 rounded-full bg-[#F97316] px-7 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
                >
                  {page.cta.label}
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              )}
              <div>
                <p className="text-lg font-bold tracking-tight">{page.price.amount}</p>
                <p className="text-sm text-[#888888]">{page.price.note}</p>
              </div>
            </div>
            <OtherContactOptions slug={page.slug} name={page.name} briefIsPrimary={!page.cta.external} className="mt-3" />
          </header>

          {/* Who it's for */}
          <section className="mt-20">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Who this is for</h2>
            <ul className="mt-7 grid gap-4 sm:grid-cols-2">
              {page.whoFor.map((item) => (
                <li key={item} className="flex items-start gap-3 text-base leading-relaxed text-[#444444]">
                  <Check className="mt-1 h-5 w-5 flex-shrink-0 text-[#F97316]" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            {page.fitNote && <p className="mt-7 text-base leading-relaxed text-[#666666]">{page.fitNote}</p>}
            {page.notFor && page.notFor.length > 0 && (
              <>
                <h3 className="mt-10 text-lg font-bold tracking-tight">Who it is not for</h3>
                <ul className="mt-4 space-y-3">
                  {page.notFor.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-base leading-relaxed text-[#666666]">
                      <X className="mt-1 h-5 w-5 flex-shrink-0 text-[#CCCCCC]" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          {/* What's included */}
          <section className="mt-20">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">What is included</h2>
            <dl className="mt-7 divide-y divide-[#EAEAEA] border-y border-[#EAEAEA]">
              {page.included.map((item) => (
                <div key={item.title} className="py-6 sm:flex sm:gap-8">
                  <dt className="text-base font-bold tracking-tight sm:w-1/3 sm:flex-shrink-0">
                    {item.title}
                  </dt>
                  <dd className="mt-2 text-base leading-relaxed text-[#555555] sm:mt-0 sm:flex-1">
                    {item.desc}
                  </dd>
                </div>
              ))}
            </dl>
            <p className="mt-6 text-sm text-[#888888]">{page.price.note}</p>
          </section>

          {/* Deeper sections, e.g. creative testing and reporting */}
          {page.sections?.map((section) => (
            <section key={section.title} className="mt-20">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{section.title}</h2>
              {section.intro && <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#555555]">{section.intro}</p>}
              <dl className="mt-7 grid gap-x-10 gap-y-7 sm:grid-cols-2">
                {section.items.map((item) => (
                  <div key={item.title} className="border-t border-[#EAEAEA] pt-5">
                    <dt className="text-base font-bold tracking-tight">{item.title}</dt>
                    <dd className="mt-2 text-base leading-relaxed text-[#555555]">{item.desc}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}

          {/* Pricing starting point */}
          <section className="mt-20" aria-labelledby="pricing-start">
            <h2 id="pricing-start" className="text-2xl font-bold tracking-tight sm:text-3xl">Pricing starting point</h2>
            <div className="mt-7 rounded-2xl border border-[#EAEAEA] bg-[#FAFAFA] p-6 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-8">
              <div>
                <p className="text-2xl font-bold tracking-tight">{page.price.amount}</p>
                <p className="mt-2 max-w-xl text-base leading-relaxed text-[#555555]">
                  {page.price.note}
                  {page.price.amount.includes("/month") && " No lock-in contracts, and the scope is agreed in your proposal."}
                </p>
              </div>
              <Link
                to="/agency/pricing"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-[#F97316] transition-all hover:gap-3 sm:mt-0 sm:flex-shrink-0"
              >
                See full pricing
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </section>

          {/* Process */}
          <section className="mt-20">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">How we start</h2>
            <ol className="mt-7 space-y-5">
              {SERVICE_PROCESS.map((step, i) => (
                <li key={step.title} className="flex items-start gap-5">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[#F97316] text-sm font-bold text-white">
                    {i + 1}
                  </span>
                  <div className="pt-1">
                    <h3 className="text-base font-bold tracking-tight">{step.title}</h3>
                    <p className="mt-1.5 text-base leading-relaxed text-[#555555]">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          {/* Case study */}
          {page.caseStudy && (
          <section className="mt-20 rounded-2xl border border-[#EAEAEA] p-8 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#999999]">Case study</p>
            <h2 className="mt-4 text-2xl font-bold tracking-tight">{page.caseStudy.name}</h2>
            <dl className="mt-6 space-y-5">
              <div>
                <dt className="text-sm font-semibold uppercase tracking-wider text-[#888888]">Challenge</dt>
                <dd className="mt-1.5 text-base leading-relaxed text-[#444444]">{page.caseStudy.challenge}</dd>
              </div>
              <div>
                <dt className="text-sm font-semibold uppercase tracking-wider text-[#888888]">Result</dt>
                <dd className="mt-1.5 text-base font-medium leading-relaxed text-[#111111]">
                  {page.caseStudy.results}
                </dd>
              </div>
            </dl>
            {(caseStudyPost || page.caseStudy.href) && (
              <Link
                to={page.caseStudy.href ?? `/agency/blog/${caseStudyPost!.slug}`}
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-[#F97316] transition-all hover:gap-3"
              >
                Read the full breakdown
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            )}
            {page.proofNote && <p className="mt-6 text-sm text-[#666666]">{page.proofNote}</p>}
          </section>

          )}
          {/* Testimonial */}
          {page.testimonial && (
            <figure className="mt-8 rounded-2xl bg-[#FAFAFA] p-8 sm:p-10">
              <Quote className="h-7 w-7 text-[#F97316]" aria-hidden="true" />
              <blockquote className="mt-5 text-lg leading-relaxed text-[#333333]">
                {page.testimonial.quote}
              </blockquote>
              <figcaption className="mt-5 text-sm">
                <span className="font-bold text-[#111111]">{page.testimonial.name}</span>
                <span className="text-[#888888]"> — {page.testimonial.role}</span>
              </figcaption>
            </figure>
          )}

          {/* FAQ */}
          <section className="mt-20">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Questions</h2>
            <dl className="mt-7 divide-y divide-[#EAEAEA] border-y border-[#EAEAEA]">
              {page.faqs.map((faq) => {
                const unanswered = faq.a.includes("[CONFIRM]");
                return (
                  <div key={faq.q} className="py-6">
                    <dt className="text-base font-bold tracking-tight">{faq.q}</dt>
                    <dd
                      className={`mt-2 text-base leading-relaxed ${
                        unanswered
                          ? "rounded-lg bg-[#FFFBEB] p-3 font-medium text-[#B45309]"
                          : "text-[#555555]"
                      }`}
                    >
                      {faq.a}
                    </dd>
                  </div>
                );
              })}
            </dl>
          </section>

          {/* Supporting reading */}
          {related.length > 0 && (
            <section className="mt-20">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Read before you buy</h2>
                {hub && (
                  <Link
                    to={`/agency/blog/topics/${hub.slug}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-[#F97316] transition-all hover:gap-3"
                  >
                    All {hub.name} guides
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </Link>
                )}
              </div>
              <div className="mt-7 grid gap-6 md:grid-cols-3">
                {related.map((post) => (
                  <article
                    key={post.slug}
                    className="flex flex-col overflow-hidden rounded-2xl border border-[#EAEAEA] transition-shadow hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
                  >
                    <div className="relative h-36">
                      <img
                        src={post.thumbnail}
                        alt={post.thumbnailAlt}
                        loading="lazy"
                        width={400}
                        height={144}
                        className="h-full w-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="text-base font-bold leading-snug tracking-tight">
                        <Link to={`/agency/blog/${post.slug}`} className="hover:text-[#F97316]">
                          {post.title}
                        </Link>
                      </h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-[#666666]">{post.excerpt}</p>
                      <p className="mt-3 text-xs text-[#999999]">{post.readTime}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <section data-track-location="service_cta" className="mt-20 rounded-2xl border border-[#EAEAEA] bg-[#FAFAFA] p-8 text-center sm:p-12">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{page.cta.heading}</h2>
            <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-[#555555]">{page.cta.body}</p>
            {page.cta.external ? (
              <a
                href={page.cta.href}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#F97316] px-7 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                {page.cta.label}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </a>
            ) : (
              <Link
                to={page.cta.href}
                className="mt-7 inline-flex items-center gap-2 rounded-full bg-[#F97316] px-7 py-3.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              >
                {page.cta.label}
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            )}
            <OtherContactOptions slug={page.slug} name={page.name} briefIsPrimary={!page.cta.external} className="mt-4 justify-center" />
          </section>

          {/* Other services */}
          <section className="mt-20 border-t border-[#EAEAEA] pt-14">
            <h2 className="text-2xl font-bold tracking-tight">Other services</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {otherServices.map((s) => (
                <Link
                  key={s.slug}
                  to={`/agency/${s.slug}`}
                  className="group rounded-2xl border border-[#EAEAEA] p-6 transition-shadow hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
                >
                  <s.icon className="h-5 w-5 text-[#F97316]" aria-hidden="true" />
                  <h3 className="mt-4 text-base font-bold tracking-tight group-hover:text-[#F97316]">
                    {s.navLabel}
                  </h3>
                  <p className="mt-1.5 text-sm font-semibold text-[#F97316]">{s.price.amount}</p>
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

export default AgencyService;
