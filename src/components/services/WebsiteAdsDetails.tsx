import { Link } from "react-router-dom";
import { ArrowRight, Check } from "lucide-react";
import type { ServicePage } from "@/data/servicePages";
import { websiteAdsExamples, websiteAdsResponsibilities, websiteAdsTimeline } from "@/data/websiteAds";

const eyebrow = "text-xs font-bold uppercase tracking-[.14em] text-[#a84700]";
const heading = "mt-3 font-serif text-4xl leading-[.95] sm:text-6xl";

export function WebsiteAdsDetails({ page }: { page: ServicePage }) {
  return (
    <>
      <section id="website-ads-examples" aria-labelledby="website-ads-examples-heading" className="scroll-mt-20 border-t border-[#cfcfc1] py-12 sm:py-20">
        <p className={eyebrow}>Retail and services</p>
        <h2 id="website-ads-examples-heading" className={heading}>From an ad click to a customer</h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#55554d]">The website gives customers a clear next step. The campaign report shows how often they take it.</p>
        <div className="mt-9 grid gap-5 md:grid-cols-2">
          {websiteAdsExamples.map(({ title, example, measurement, href, linkLabel }) => (
            <article key={title} className="group flex flex-col rounded-sm border border-[#cfcfc1] bg-[#f5f5ec] p-6 transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_50px_-30px_rgba(17,17,16,.4)] sm:p-8">
              <h3 className="font-serif text-3xl leading-none sm:text-4xl">{title}</h3>
              <p className="mt-4 text-sm leading-relaxed text-[#55554d]">{example}</p>
              <div className="mb-5 mt-5 border-l-2 border-[#ff6a00] pl-4 text-sm leading-relaxed">
                <p className="font-semibold">What you’ll see in your report</p>
                <p className="mt-1 text-[#55554d]">{measurement}</p>
              </div>
              <Link to={href} className="mt-auto inline-flex min-h-11 items-center gap-2 self-start text-sm font-semibold text-[#a84700] underline underline-offset-4">
                {linkLabel} <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden />
              </Link>
            </article>
          ))}
        </div>
      </section>

      <section id="website-ads-timeline" aria-labelledby="website-ads-timeline-heading" className="scroll-mt-20 border-t border-[#cfcfc1] py-12 sm:py-20">
        <p className={eyebrow}>Build first, then 90 days live</p>
        <h2 id="website-ads-timeline-heading" className={heading}>What happens over 90 days</h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#55554d]">We prepare and test the website first. Your three campaign months begin once the ads go live.</p>
        <ol className="mt-10 grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
          {websiteAdsTimeline.map(({ stage, title, body }, index) => (
            <li key={stage} className="relative pt-6">
              <span aria-hidden="true" className="absolute left-0 right-0 top-0 h-px bg-[#cfcfc1]" />
              <span aria-hidden="true" className="absolute left-0 top-0 h-1 w-12 bg-gradient-orange" />
              <p className="flex items-baseline gap-3 text-sm font-semibold text-[#a84700]">
                <span className="font-serif text-2xl text-[#111110] tabular-nums">{String(index + 1).padStart(2, "0")}</span>{stage}
              </p>
              <h3 className="mt-3 font-serif text-3xl leading-none">{title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-[#55554d]">{body}</p>
            </li>
          ))}
        </ol>
      </section>

      <section id="website-ads-responsibilities" aria-labelledby="website-ads-responsibilities-heading" className="scroll-mt-20 rounded-sm bg-[#111110] px-6 py-12 text-[#ebebdf] sm:px-10 sm:py-16">
        <p className="text-xs font-bold uppercase tracking-[.14em] text-[#ff8a33]">One plan, three owners</p>
        <h2 id="website-ads-responsibilities-heading" className="mt-3 font-serif text-4xl leading-[.95] sm:text-6xl">Who does what</h2>
        <div className="mt-9 grid gap-8 lg:grid-cols-3">
          {websiteAdsResponsibilities.map(({ title, items }) => (
            <article key={title} className="border-t border-white/15 pt-5">
              <h3 className="font-serif text-3xl leading-none">{title}</h3>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-[#c9c9bd]">
                {items.map((item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#ff8a33]" aria-hidden />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby="service-faqs" className="scroll-mt-20 py-12 sm:py-20" id="website-ads-faqs">
        <p className={eyebrow}>FAQs</p>
        <h2 id="service-faqs" className={heading}>Questions before you start</h2>
        <dl className="mt-8 grid gap-x-10 sm:grid-cols-2">
          {page.faqs.map(({ q, a }) => (
            <div key={q} className="border-t border-[#cfcfc1] py-5">
              <dt className="font-semibold">{q}</dt>
              <dd className="mt-2 text-sm leading-relaxed text-[#55554d]">{a}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="website-ads-quote" aria-labelledby="website-ads-quote-heading" className="scroll-mt-20 pb-14 sm:pb-20">
        <div className="relative overflow-hidden rounded-sm bg-[#111110] p-7 text-[#ebebdf] sm:p-12">
          <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 bg-gradient-orange" />
          <h2 id="website-ads-quote-heading" className="max-w-2xl font-serif text-4xl leading-[.95] sm:text-6xl">{page.cta.heading}</h2>
          <p className="mt-4 max-w-2xl text-base leading-relaxed text-[#c9c9bd]">{page.cta.body} Bring your shop or website link, the offer you want to promote, and your planned monthly ad budget.</p>
          <Link to={page.cta.href} className="group mt-7 inline-flex min-h-11 items-center gap-3 rounded-sm bg-gradient-orange px-5 py-2.5 text-sm font-bold text-[#111110] shadow-[0_10px_30px_-12px_rgba(255,106,0,.7)] transition duration-200 hover:-translate-y-0.5 active:translate-y-0">
            {page.cta.label} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>
        </div>
      </section>
    </>
  );
}
