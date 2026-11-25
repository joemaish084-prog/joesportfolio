import { useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Seo } from "@/components/Seo";
import { serviceHead } from "@/seo/pageHeads";
import { AlertTriangle, ArrowLeft, ArrowRight, Check, ChevronRight, MessageCircle, Quote, X } from "lucide-react";
import {
  SERVICE_PROCESS,
  getServicePageBySlug,
  serviceHeadings,
  servicePages,
  type ServicePage,
} from "@/data/servicePages";
import { getHubBySlug } from "@/data/blogHubs";
import { blogSummaries as blogPosts } from "@/data/blogSummaries";
import { contentImageProps } from "@/lib/responsiveImage";
import NotFound from "@/pages/NotFound";
import { Footer } from "@/components/Footer";
import { AgencyNavigation } from "@/components/agency/AgencyNavigation";
import { ServiceGallery, ServiceHeroVisual, ServiceSideImage } from "@/components/services/ServiceVisuals";
import { PROCESS_VISUAL, getServiceVisuals } from "@/data/serviceVisuals";
import { localizePrice, useMarket } from "@/lib/market";
import { ShopifyServiceContent } from "@/components/shopify/ShopifyServiceContent";
import { WebsiteAdsOffer } from "@/components/services/WebsiteAdsOffer";
import { websiteAdsSlug } from "@/data/websiteAds";
import { PairedTitle, TypePairScope } from "@/components/type/TypePair";
import { SERVICE_TYPE_PAIRS, splitHeadline } from "@/lib/typePairs";

/** The lower-commitment ways to get in touch, beside each page's main booking button. */
function OtherContactOptions({ slug, name, briefIsPrimary, className = "" }: { slug: string; name: string; briefIsPrimary: boolean; className?: string }) {
  const whatsappText = encodeURIComponent(`Hi Joseph! I'd like to talk about ${name}.`);
  return (
    <p className={`flex flex-wrap items-center gap-x-5 gap-y-2 text-sm font-semibold ${className}`}>
      <a
        href={`https://wa.me/254704700160?text=${whatsappText}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex min-h-11 items-center gap-2 text-foreground transition-colors hover:text-primary"
      >
        <MessageCircle className="h-4 w-4" aria-hidden="true" />
        Message me on WhatsApp
      </a>
      {!briefIsPrimary && (
        <Link to={`/agency/contact?service=${slug}#brief`} className="inline-flex min-h-11 items-center text-muted-foreground transition-colors hover:text-primary">
          Or send a project brief
        </Link>
      )}
    </p>
  );
}

/** The page's main booking button: an external link (Calendly) or an in-site route. */
function PrimaryCta({ cta, className = "" }: { cta: ServicePage["cta"]; className?: string }) {
  const classes = `inline-flex items-center gap-2 rounded-full bg-primary px-7 py-3.5 text-sm font-semibold text-primary-foreground transition-opacity hover:opacity-90 ${className}`;
  const content = (
    <>
      {cta.label}
      <ArrowRight className="h-4 w-4" aria-hidden="true" />
    </>
  );
  return cta.external ? (
    <a href={cta.href} target="_blank" rel="noopener noreferrer" className={classes}>
      {content}
    </a>
  ) : (
    <Link to={cta.href} className={classes}>
      {content}
    </Link>
  );
}

const AgencyService = () => {
  const { service: slug } = useParams();
  const page = getServicePageBySlug(slug);
  return page ? <AgencyServiceContent page={page} /> : <NotFound />;
};

/** Shared by the client route and build-time rendering, so search engines get
 * the same service scope, proof, FAQs and links that visitors see. */
export function AgencyServiceContent({ page }: { page: ServicePage }) {
  if (page.slug === websiteAdsSlug) return <WebsiteAdsOffer page={page} />;
  return page.slug === "shopify-services" ? <ShopifyServiceContent page={page} /> : <StandardAgencyServiceContent page={page} />;
}

function StandardAgencyServiceContent({ page }: { page: ServicePage }) {
  const market = useMarket();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [page.slug]);

  const hub = getHubBySlug(page.hubSlug);
  const related = page.relatedPosts
    .map((s) => blogPosts.find((p) => p.slug === s))
    .filter((p): p is (typeof blogPosts)[number] => Boolean(p));
  const caseStudyPost = page.caseStudy?.readMore
    ? blogPosts.find((p) => p.slug === page.caseStudy?.readMore)
    : undefined;
  const otherServices = servicePages.filter((s) => s.slug !== page.slug && !s.draft);
  const headings = serviceHeadings(page);
  const visuals = getServiceVisuals(page.slug);
  const typeSetting = SERVICE_TYPE_PAIRS[page.slug];
  const [titleMain, titleAccent] = splitHeadline(page.name, typeSetting?.main);

  return (
    <>
      <Seo {...serviceHead(page, visuals?.hero)} />

      <div className="service-page min-h-screen bg-background text-foreground">
        <AgencyNavigation solid />
        <TypePairScope as="main" pair={typeSetting?.pair} className="mx-auto max-w-5xl px-5 pb-24 pt-10 sm:px-8">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <Link to="/" className="inline-flex items-center gap-2 transition-colors hover:text-primary">
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
              Agency
            </Link>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
            <Link to="/agency/services" className="hover:text-primary">Services</Link>
            <ChevronRight className="h-3.5 w-3.5 text-muted-foreground" aria-hidden="true" />
            <span className="font-medium text-foreground">{page.navLabel}</span>
          </nav>

          {/* Draft review banner — never shown once draft is cleared */}
          {page.draft && (
            <div className="mt-8 rounded-2xl border border-primary/40 bg-primary/10 p-6">
              <p className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-wider text-primary">
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                Draft — not indexed
              </p>
              <p className="mt-3 text-sm leading-relaxed text-foreground/85">
                This page is set to <code className="font-mono">noindex</code> and is excluded from the
                sitemap until the items below are confirmed. Anything marked{" "}
                <span className="font-semibold">[CONFIRM]</span> in the copy is a placeholder, not a claim.
              </p>
              <ul className="mt-4 space-y-2">
                {page.reviewNotes.map((note) => (
                  <li key={note} className="flex items-start gap-2 text-sm leading-relaxed text-foreground/85">
                    <span className="mt-2 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
                    {note}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Hero */}
          <div className={visuals ? "relative mt-10 grid items-center gap-9 rounded-3xl border border-border bg-gradient-to-br from-primary/[0.05] via-card to-background p-5 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] lg:gap-12" : ""}>
          <header data-track-location="service_hero" className={visuals ? "max-w-3xl" : "mt-10 max-w-3xl"}>
            <p className="inline-flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              <page.icon className="h-4 w-4" aria-hidden="true" />
              Service
            </p>
            {typeSetting
              ? <PairedTitle className="mt-5" main={titleMain} accent={titleAccent} />
              : <h1 className="mt-4 text-balance font-display text-3xl font-bold leading-tight tracking-tight sm:text-5xl">{page.name}</h1>}
            <p className="mt-5 text-lg leading-relaxed text-muted-foreground">{page.standfirst}</p>
            <div className="mt-8 flex flex-wrap items-center gap-4">
              <PrimaryCta cta={page.cta} />
              <div>
                <p className="text-lg font-bold tracking-tight">{localizePrice(page.price.amount, market)}</p>
                <p className="text-sm text-muted-foreground">{page.price.note}</p>
              </div>
            </div>
            <OtherContactOptions slug={page.slug} name={page.name} briefIsPrimary={!page.cta.external} className="mt-3" />
          </header>
          {visuals && <ServiceHeroVisual visuals={visuals} />}
          </div>

          {/* Who it's for */}
          <section className="mt-20">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{headings.whoFor}</h2>
            <ul className="mt-7 grid gap-4 sm:grid-cols-2">
              {page.whoFor.map((item) => (
                <li key={item} className="flex items-start gap-3 text-base leading-relaxed text-foreground/85">
                  <Check className="mt-1 h-5 w-5 flex-shrink-0 text-primary" aria-hidden="true" />
                  {item}
                </li>
              ))}
            </ul>
            {page.fitNote && <p className="mt-7 text-base leading-relaxed text-muted-foreground">{page.fitNote}</p>}
            {page.notFor && page.notFor.length > 0 && (
              <>
                <h3 className="mt-10 text-lg font-bold tracking-tight">Who it is not for</h3>
                <ul className="mt-4 space-y-3">
                  {page.notFor.map((item) => (
                    <li key={item} className="flex items-start gap-3 text-base leading-relaxed text-muted-foreground">
                      <X className="mt-1 h-5 w-5 flex-shrink-0 text-muted-foreground" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </section>

          {/* What's included */}
          <section className="mt-20">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{headings.included}</h2>
            <div className={visuals?.included ? "mt-7 grid gap-8 lg:grid-cols-[minmax(0,1fr)_340px] lg:items-start lg:gap-12" : "mt-7"}>
            <dl className="divide-y divide-border border-y border-border">
              {page.included.map((item) => (
                <div key={item.title} className="py-6 sm:flex sm:gap-8">
                  <dt className="text-base font-bold tracking-tight sm:w-1/3 sm:flex-shrink-0">
                    {item.title}
                  </dt>
                  <dd className="mt-2 text-base leading-relaxed text-muted-foreground sm:mt-0 sm:flex-1">
                    {item.desc}
                  </dd>
                </div>
              ))}
            </dl>
            {visuals?.included && <ServiceSideImage visual={visuals.included} className="max-lg:order-first" />}
            </div>
            <p className="mt-6 text-sm text-muted-foreground">{page.price.note}</p>
          </section>

          {/* Deeper sections, e.g. creative testing and reporting */}
          {page.sections?.map((section) => (
            <section key={section.title} className="mt-20">
              <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{section.title}</h2>
              {section.intro && <p className="mt-3 max-w-2xl text-base leading-relaxed text-muted-foreground">{section.intro}</p>}
              <dl className="mt-7 grid gap-x-10 gap-y-7 sm:grid-cols-2">
                {section.items.map((item) => (
                  <div key={item.title} className="border-t border-border pt-5">
                    <dt className="text-base font-bold tracking-tight">{item.title}</dt>
                    <dd className="mt-2 text-base leading-relaxed text-muted-foreground">{item.desc}</dd>
                  </div>
                ))}
              </dl>
            </section>
          ))}

          {/* Pricing starting point */}
          <section className="mt-20" aria-labelledby="pricing-start">
            <h2 id="pricing-start" className="text-2xl font-bold tracking-tight sm:text-3xl">{headings.pricing}</h2>
            <div className="mt-7 rounded-2xl border border-border bg-card p-6 sm:flex sm:items-center sm:justify-between sm:gap-8 sm:p-8">
              <div>
                <p className="text-2xl font-bold tracking-tight">{localizePrice(page.price.amount, market)}</p>
                <p className="mt-2 max-w-xl text-base leading-relaxed text-muted-foreground">
                  {page.price.note}
                  {page.price.amount.includes("/month") && " No lock-in contracts, and the scope is agreed in your proposal."}
                </p>
              </div>
              <Link
                to="/agency/pricing"
                className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-all hover:gap-3 sm:mt-0 sm:flex-shrink-0"
              >
                See full pricing
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            </div>
          </section>

          {/* Process */}
          <section className="mt-20">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{headings.process}</h2>
            <div className="mt-7 grid gap-8 lg:grid-cols-[340px_minmax(0,1fr)] lg:items-start lg:gap-12">
            <ServiceSideImage visual={PROCESS_VISUAL} />
            <ol className="space-y-5 lg:pt-2">
              {SERVICE_PROCESS.map((step, i) => (
                <li key={step.title} className="flex items-start gap-5">
                  <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground">
                    {i + 1}
                  </span>
                  <div className="pt-1">
                    <h3 className="text-base font-bold tracking-tight">{step.title}</h3>
                    <p className="mt-1.5 text-base leading-relaxed text-muted-foreground">{step.desc}</p>
                  </div>
                </li>
              ))}
            </ol>
            </div>
          </section>

          {/* Case study */}
          {page.caseStudy && (
          <section className="mt-20 rounded-2xl border border-border p-8 sm:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">Case study</p>
            <h2 className="mt-4 text-2xl font-bold tracking-tight">{page.caseStudy.name}</h2>
            <dl className="mt-6 space-y-5">
              <div>
                <dt className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Challenge</dt>
                <dd className="mt-1.5 text-base leading-relaxed text-foreground/85">{page.caseStudy.challenge}</dd>
              </div>
              <div>
                <dt className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">Result</dt>
                <dd className="mt-1.5 text-base font-medium leading-relaxed text-foreground">
                  {page.caseStudy.results}
                </dd>
              </div>
            </dl>
            {(caseStudyPost || page.caseStudy.href) && (
              <Link
                to={page.caseStudy.href ?? `/agency/blog/${caseStudyPost!.slug}`}
                className="mt-6 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-all hover:gap-3"
              >
                Read the full breakdown
                <ArrowRight className="h-4 w-4" aria-hidden="true" />
              </Link>
            )}
            {page.proofNote && <p className="mt-6 text-sm text-muted-foreground">{page.proofNote}</p>}
          </section>

          )}
          {/* Testimonial */}
          {page.testimonial && (
            <figure className="mt-8 rounded-2xl bg-card p-8 sm:p-10">
              <Quote className="h-7 w-7 text-primary" aria-hidden="true" />
              <blockquote className="mt-5 text-lg leading-relaxed text-foreground/90">
                {page.testimonial.quote}
              </blockquote>
              <figcaption className="mt-5 text-sm">
                <span className="font-bold text-foreground">{page.testimonial.name}</span>
                <span className="text-muted-foreground"> — {page.testimonial.role}</span>
              </figcaption>
            </figure>
          )}

          {visuals?.gallery && <ServiceGallery {...visuals.gallery} />}

          {/* Mid-page CTA, so readers who are convinced by the proof don't have to scroll to the end */}
          <section
            data-track-location="service_mid_cta"
            className="mt-16 flex flex-col gap-5 rounded-2xl border border-border bg-card p-8 text-card-foreground sm:flex-row sm:items-center sm:justify-between sm:p-10"
          >
            <div>
              <h2 className="text-xl font-bold tracking-tight sm:text-2xl">{headings.midCta}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {localizePrice(page.price.amount, market)}. {page.cta.external ? "Start with a free 30-minute strategy call, with no obligation." : page.price.note}
              </p>
            </div>
            <PrimaryCta cta={page.cta} className="flex-shrink-0 self-start sm:self-auto" />
          </section>

          {/* FAQ */}
          <section aria-labelledby="service-faqs" className="mt-20">
            <h2 id="service-faqs" className="text-2xl font-bold tracking-tight sm:text-3xl">{headings.faqs}</h2>
            <dl className="mt-7 divide-y divide-border border-y border-border">
              {page.faqs.map((faq) => {
                const unanswered = faq.a.includes("[CONFIRM]");
                return (
                  <div key={faq.q} className="py-6">
                    <dt className="text-base font-bold tracking-tight">{faq.q}</dt>
                    <dd
                      className={`mt-2 text-base leading-relaxed ${
                        unanswered
                          ? "rounded-lg bg-primary/10 p-3 font-medium text-primary"
                          : "text-muted-foreground"
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
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary transition-all hover:gap-3"
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
                    className="flex flex-col overflow-hidden rounded-2xl border border-border transition-shadow hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
                  >
                    <div className="relative h-36">
                      <img
                        src={post.thumbnail}
                        {...contentImageProps(post.thumbnail, "(min-width: 768px) 300px, 100vw")}
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
                        <Link to={`/agency/blog/${post.slug}`} className="hover:text-primary">
                          {post.title}
                        </Link>
                      </h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{post.excerpt}</p>
                      <p className="mt-3 text-xs text-muted-foreground">{post.readTime}</p>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {/* CTA */}
          <section data-track-location="service_cta" className="mt-20 rounded-2xl border border-border bg-card p-8 text-center sm:p-12">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">{page.cta.heading}</h2>
            <p className="mx-auto mt-3 max-w-xl text-base leading-relaxed text-muted-foreground">{page.cta.body}</p>
            <PrimaryCta cta={page.cta} className="mt-7" />
            <OtherContactOptions slug={page.slug} name={page.name} briefIsPrimary={!page.cta.external} className="mt-4 justify-center" />
          </section>

          {/* Other services */}
          <section className="mt-20 border-t border-border pt-14">
            <h2 className="text-2xl font-bold tracking-tight">Other services</h2>
            <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {otherServices.map((s) => (
                <Link
                  key={s.slug}
                  to={`/agency/${s.slug}`}
                  className="group rounded-2xl border border-border bg-card p-6 transition-shadow hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
                >
                  <s.icon className="h-5 w-5 text-primary" aria-hidden="true" />
                  <h3 className="mt-4 text-base font-bold tracking-tight group-hover:text-primary">
                    {s.navLabel}
                  </h3>
                  <p className="mt-1.5 text-sm font-semibold text-primary">{localizePrice(s.price.amount, market)}</p>
                </Link>
              ))}
            </div>
          </section>
        </TypePairScope>
        <Footer />
      </div>
    </>
  );
}

export default AgencyService;
