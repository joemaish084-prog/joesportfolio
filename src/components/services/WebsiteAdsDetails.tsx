import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import type { ServicePage } from "@/data/servicePages";
import { websiteAdsExamples, websiteAdsResponsibilities, websiteAdsTimeline } from "@/data/websiteAds";

export function WebsiteAdsDetails({ page }: { page: ServicePage }) {
  return (
    <>
      <section id="website-ads-examples" aria-labelledby="website-ads-examples-heading" className="scroll-mt-20 border-t border-[#c9cdc0] py-10 sm:py-16">
        <h2 id="website-ads-examples-heading" className="font-serif text-4xl leading-none sm:text-5xl">From an ad click to a customer</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#505d56]">The website gives customers a clear next step. The campaign report shows how often they take it.</p>
        <div className="mt-7 grid gap-4 md:grid-cols-2">
          {websiteAdsExamples.map(({ title, example, measurement, href, linkLabel }) => (
            <article key={title} className="flex flex-col border border-[#c9cdc0] bg-[#f6f5eb] p-5 sm:p-7">
              <h3 className="font-serif text-3xl leading-none sm:text-4xl">{title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-[#505d56]">{example}</p>
              <p className="mb-4 mt-4 border-t border-[#c9cdc0] pt-4 text-sm leading-relaxed"><strong>What you’ll see in your report.</strong> {measurement}</p>
              <Link to={href} className="mt-auto inline-flex min-h-11 items-center gap-2 self-start text-sm font-semibold text-[#0f766e] underline underline-offset-4">
                {linkLabel} <ArrowRight className="h-4 w-4 shrink-0" aria-hidden />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section id="website-ads-timeline" aria-labelledby="website-ads-timeline-heading" className="scroll-mt-20 border-t border-[#c9cdc0] py-10 sm:py-16">
        <h2 id="website-ads-timeline-heading" className="font-serif text-4xl leading-none sm:text-5xl">What happens over 90 days</h2>
        <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#505d56]">We prepare and test the website first. Your three campaign months begin once the ads go live.</p>
        <ol className="mt-7 grid gap-x-6 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
          {websiteAdsTimeline.map(({ stage, title, body }) => (
            <li key={stage} className="border-t-2 border-[#0f766e] pt-4">
              <p className="text-sm font-semibold text-[#0f766e]">{stage}</p>
              <h3 className="mt-2 font-serif text-3xl leading-none">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#505d56]">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="website-ads-responsibilities" aria-labelledby="website-ads-responsibilities-heading" className="scroll-mt-20 border-t border-[#c9cdc0] bg-[#101815] px-5 py-9 text-[#f6f5eb] sm:px-8 sm:py-12">
        <h2 id="website-ads-responsibilities-heading" className="font-serif text-4xl leading-none sm:text-5xl">Who does what</h2>
        <div className="mt-7 grid gap-6 lg:grid-cols-3">
          {websiteAdsResponsibilities.map(({ title, items }) => (
            <article key={title} className="border-t border-[#41534b] pt-4">
              <h3 className="font-serif text-3xl leading-none">{title}</h3>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[#c5d4cc]">
                {items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#00bfa5]" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="service-faqs" className="scroll-mt-20 py-10 sm:py-16" id="website-ads-faqs">
        <h2 id="service-faqs" className="font-serif text-4xl leading-none sm:text-5xl">Questions before you start</h2>
        <dl className="mt-6 grid gap-x-8 sm:grid-cols-2">
          {page.faqs.map(({ q, a }) => (
            <div key={q} className="border-t border-[#c9cdc0] py-4">
              <dt className="font-semibold">{q}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-[#505d56]">{a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="website-ads-quote" aria-labelledby="website-ads-quote-heading" className="scroll-mt-20 border-t border-[#c9cdc0] py-10 sm:py-14">
        <div className="border-l-4 border-[#0f766e] bg-[#f6f5eb] p-5 sm:p-8">
          <h2 id="website-ads-quote-heading" className="font-serif text-4xl leading-none sm:text-5xl">{page.cta.heading}</h2>
          <p className="mt-3 max-w-2xl text-base leading-relaxed text-[#505d56]">{page.cta.body} Bring your shop or website link, the offer you want to promote, and your planned monthly ad budget.</p>
          <Link to={page.cta.href} className="mt-5 inline-flex min-h-11 items-center gap-3 rounded-sm bg-[#ff6a00] px-4 py-2.5 text-sm font-bold text-[#101815] hover:bg-[#ff8633]">
            {page.cta.label} <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </div>
      </section>
    </>
  );
}
