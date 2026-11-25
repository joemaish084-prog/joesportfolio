import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDownRight, ArrowRight, Check } from "lucide-react";
import { AgencyNavigation } from "@/components/agency/AgencyNavigation";
import { Footer } from "@/components/Footer";
import { Seo } from "@/components/Seo";
import type { ServicePage } from "@/data/servicePages";
import { formatKes } from "@/data/services";
import { websiteAdsHero, websiteAdsLabel, websiteAdsMonths, websiteAdsPlans, websiteAdsProblems } from "@/data/websiteAds";
import { serviceHead } from "@/seo/pageHeads";
import { WebsiteAdsDetails } from "./WebsiteAdsDetails";

const audiences = [
  { key: "retail", label: "Retail" },
  { key: "services", label: "Services" },
] as const;
type Audience = (typeof audiences)[number]["key"];

const kes = (amount: number) => `KSh ${formatKes(amount)}`;
const kesRange = (values: number[]) => {
  const low = Math.min(...values);
  const high = Math.max(...values);
  return low === high ? kes(low) : `${kes(low)}–${formatKes(high)}`;
};
type WebsiteAdsPlan = (typeof websiteAdsPlans)[number];

function totals(plan: WebsiteAdsPlan, websitePayment: number, months: number) {
  return plan.options.map(({ management, media }) => websitePayment + months * (management + media));
}
const estimate = (plan: WebsiteAdsPlan, websitePayment: number, months: number) => kesRange(totals(plan, websitePayment, months));
const lowestTotal = Math.min(...websiteAdsPlans.flatMap((plan) => totals(plan, plan.buildFee, websiteAdsMonths)));

const paymentSchedule = [
  { label: "Website deposit", description: "Half the website fee to start the build", buildShare: 0.5, months: 0 },
  { label: "At launch", description: "Website balance plus the first campaign month", buildShare: 0.5, months: 1 },
  { label: "Month 2", description: "Campaign management and media budget", buildShare: 0, months: 1 },
  { label: "Month 3", description: "Campaign management and media budget", buildShare: 0, months: 1 },
];

const sectionLinks = [
  { label: "Packages", id: "website-ads-packages" },
  { label: "Payment schedule", id: "website-ads-payments" },
  { label: "Retail and services", id: "website-ads-examples" },
  { label: "90-day timeline", id: "website-ads-timeline" },
  { label: "FAQs", id: "website-ads-faqs" },
];

const heroIncludes = [
  "A website built for your offer, by Nuvana",
  "Ads set up and managed by JM Marketing",
  "Three months of ad spend planned in",
  "Tracking tested before the ads go live",
];

/* Shared look: brand black, oatmilk and the orange gradient. Orange text on oatmilk uses the
   darker 25 100% 33% tone so it stays readable. */
const ctaClass = "group inline-flex min-h-11 items-center gap-3 rounded-sm bg-gradient-orange px-5 py-2.5 text-sm font-bold text-[#111110] shadow-[0_10px_30px_-12px_rgba(255,106,0,.7)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_16px_36px_-12px_rgba(255,106,0,.85)] active:translate-y-0";
const ghostClass = "inline-flex min-h-11 items-center gap-2 rounded-sm border border-current/30 px-5 py-2.5 text-sm font-semibold transition duration-200 hover:-translate-y-0.5 hover:border-current active:translate-y-0";

function WebsiteAdsPaymentSchedule() {
  return (
    <section id="website-ads-payments" aria-labelledby="website-ads-payments-heading" className="scroll-mt-20 border-t border-[#cfcfc1] py-12 sm:py-20">
      <div className="grid gap-6 md:grid-cols-[1fr_1.6fr] md:gap-12">
        <div>
          <p className="text-xs font-bold uppercase tracking-[.14em] text-[#a84700]">Pay as it goes live</p>
          <h2 id="website-ads-payments-heading" className="mt-3 font-serif text-4xl leading-[.95] sm:text-5xl">Example payment schedule</h2>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-[#55554d]">The website fee is split into two payments. Campaign management is billed monthly from launch, and you pay your media budget directly to the platforms.</p>
        </div>
        <div>
          <table className="w-full table-fixed border-collapse text-xs sm:text-sm">
            <caption className="sr-only">Estimated payment milestones for Growth and Launch, including the planned ad spend</caption>
            <thead className="border-b-2 border-[#111110]">
              <tr>
                <th scope="col" className="py-3 text-left font-semibold">When you pay</th>
                {websiteAdsPlans.map((plan) => <th key={plan.id} scope="col" className="w-[29%] py-3 text-right font-semibold sm:w-1/4">{plan.name}</th>)}
              </tr>
            </thead>
            <tbody>
              {paymentSchedule.map(({ label, description, buildShare, months }) => (
                <tr key={label} className="border-b border-[#cfcfc1]">
                  <th scope="row" className="py-4 pr-2 text-left font-semibold">
                    {label}<span className="mt-1 block font-normal text-[#55554d]">{description}</span>
                  </th>
                  {websiteAdsPlans.map((plan) => (
                    <td key={plan.id} className="py-4 text-right font-semibold tabular-nums">{estimate(plan, plan.buildFee * buildShare, months)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot className="font-bold">
              <tr>
                <th scope="row" className="py-4 text-left">Estimated total</th>
                {websiteAdsPlans.map((plan) => (
                  <td key={plan.id} className="py-4 text-right text-base tabular-nums sm:text-lg">{estimate(plan, plan.buildFee, websiteAdsMonths)}</td>
                ))}
              </tr>
            </tfoot>
          </table>
          <p className="mt-3 text-sm leading-relaxed text-[#55554d]">These examples use the same media budget in each campaign month. The quote confirms milestones and any hosting, extra content or integration costs.</p>
        </div>
      </div>
    </section>
  );
}

function PlanLedger({ plan, dark }: { plan: WebsiteAdsPlan; dark: boolean }) {
  const rows = [
    { label: "Website build", note: "One time", value: kes(plan.buildFee) },
    { label: "Campaign management", note: `${websiteAdsMonths} months`, value: `${websiteAdsMonths} × ${kesRange(plan.options.map((o) => o.management))}` },
    { label: "Ad spend", note: "Paid to Google or Meta from your account", value: `${websiteAdsMonths} × ${kesRange(plan.options.map((o) => o.media))}` },
  ];
  return (
    <dl className={`mt-6 border-t text-sm ${dark ? "border-white/15" : "border-[#cfcfc1]"}`}>
      {rows.map(({ label, note, value }) => (
        <div key={label} className={`flex items-baseline justify-between gap-4 border-b py-3 ${dark ? "border-white/15" : "border-[#cfcfc1]"}`}>
          <dt>
            <span className="font-semibold">{label}</span>
            <span className={`block text-xs ${dark ? "text-[#c9c9bd]" : "text-[#55554d]"}`}>{note}</span>
          </dt>
          <dd className="text-right font-semibold tabular-nums">{value}</dd>
        </div>
      ))}
      <div className="flex items-baseline justify-between gap-4 pt-4">
        <dt className="font-bold">Estimated total</dt>
        <dd className="text-right text-lg font-bold tabular-nums">{estimate(plan, plan.buildFee, websiteAdsMonths)}</dd>
      </div>
    </dl>
  );
}

export function WebsiteAdsOffer({ page }: { page: ServicePage }) {
  const [audience, setAudience] = useState<Audience>("retail");

  useEffect(() => {
    const section = document.getElementById(window.location.hash.slice(1));
    if (section) section.scrollIntoView({ block: "start" });
    else window.scrollTo(0, 0);
  }, []);

  return (
    <>
      <Seo {...serviceHead(page, websiteAdsHero)} />
      <a href="#website-ads-main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110] focus:rounded-md focus:bg-background focus:px-4 focus:py-2">Skip to content</a>
      <AgencyNavigation solid />
      <main id="website-ads-main" className="bg-[#ebebdf] font-sans text-[#111110]">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
          <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 border-b border-[#cfcfc1] py-5">
            <div className="flex items-center gap-2.5 sm:gap-4">
              <img src="/media/partnership/nuvana-wordmark.png" alt="Nuvana HQ" width={909} height={262} className="h-auto w-24 sm:w-28" />
              <span aria-hidden="true" className="text-lg text-[#a84700]">×</span>
              <div className="flex items-center gap-2">
                <img src="/logo/jm-lockup-240.webp" alt="" width={240} height={91} className="h-8 w-8 object-cover object-left" />
                <span className="text-xs font-bold leading-tight">Joseph Maina<br />Marketing</span>
              </div>
            </div>
            <p className="text-xs font-semibold uppercase tracking-[.14em] text-[#55554d]">A joint offer for Kenyan businesses</p>
          </div>

          <section className="grid items-center gap-10 py-12 md:grid-cols-[1.12fr_.88fr] lg:gap-16 lg:py-20" aria-labelledby="website-ads-heading">
            <div className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-4 motion-safe:duration-700">
              <p className="flex items-center gap-3 text-xs font-bold uppercase tracking-[.14em] before:h-px before:w-6 before:bg-gradient-orange">{websiteAdsLabel}</p>
              <h1 id="website-ads-heading" className="mt-5 font-serif text-[3.4rem] leading-[.92] tracking-tight sm:text-7xl lg:text-[5.5rem]">
                A website that sells. <em className="bg-gradient-to-r from-[#a84700] to-[#d15800] bg-clip-text font-normal text-transparent">Ads that fill&nbsp;it.</em>
              </h1>
              <p className="mt-6 max-w-[40ch] text-base leading-relaxed text-[#55554d] sm:text-lg">
                For Kenyan shops and service businesses tired of paying for clicks that go nowhere. One team builds your site, runs your ads for 90 days and shows you what came in.
              </p>
              <p className="mt-6 text-sm text-[#55554d]">
                From <strong className="text-2xl font-bold tracking-tight text-[#111110]">{kes(lowestTotal)}</strong>, including three months of ad spend
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <a href="#website-ads-packages" className={ctaClass}>
                  Compare packages <ArrowDownRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:translate-y-0.5" aria-hidden />
                </a>
                <Link to={page.cta.href} className={ghostClass}>Request a quote</Link>
              </div>
            </div>

            <div className="relative motion-safe:animate-in motion-safe:fade-in motion-safe:duration-1000 md:pb-14">
              <div className="overflow-hidden rounded-sm shadow-[0_30px_60px_-30px_rgba(17,17,16,.55)]">
                <img
                  src={websiteAdsHero.src}
                  srcSet={websiteAdsHero.srcSet}
                  sizes="(min-width: 1152px) 500px, (min-width: 768px) 46vw, 96vw"
                  alt={websiteAdsHero.alt}
                  width={websiteAdsHero.width}
                  height={websiteAdsHero.height}
                  fetchPriority="high"
                  className="aspect-[4/3] h-auto w-full object-cover transition-transform duration-700 hover:scale-[1.03] md:aspect-[5/6]"
                />
              </div>
              <div className="relative mx-4 -mt-10 rounded-sm bg-[#111110] p-5 text-[#ebebdf] shadow-2xl md:absolute md:bottom-0 md:-left-8 md:mx-0 md:mt-0 md:w-[19rem]">
                <p className="text-xs font-bold uppercase tracking-[.14em] text-[#ff8a33]">One plan covers</p>
                <ul className="mt-3 space-y-2 text-sm">
                  {heroIncludes.map((item) => (
                    <li key={item} className="flex items-start gap-2">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#ff8a33]" aria-hidden />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <nav aria-label="On this page" className="flex flex-wrap gap-x-6 gap-y-1 border-y border-[#cfcfc1] py-1 text-sm">
            {sectionLinks.map(({ label, id }) => (
              <a key={id} href={`#${id}`} className="inline-flex min-h-11 items-center font-semibold text-[#111110] decoration-[#ff6a00] decoration-2 underline-offset-[6px] transition hover:underline">{label}</a>
            ))}
          </nav>
        </div>

        <section aria-labelledby="website-ads-problems-heading" className="mt-12 bg-[#111110] py-14 text-[#ebebdf] sm:mt-16 sm:py-20">
          <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
            <div className="grid gap-6 md:grid-cols-[1fr_1.4fr] md:items-end md:gap-12">
              <h2 id="website-ads-problems-heading" className="font-serif text-4xl leading-[.95] sm:text-6xl">
                The problems this <em className="text-gradient font-normal">package fixes</em>
              </h2>
              <p className="max-w-lg text-base leading-relaxed text-[#c9c9bd]">Many businesses try a website or a few boosted posts first. The money goes out, the customers don’t come in, and nobody can say why. This package closes those gaps.</p>
            </div>
            <ol className="mt-10 border-t border-white/15">
              {websiteAdsProblems.map(({ problem, fix }, index) => (
                <li key={problem} className="group grid gap-3 border-b border-white/15 py-6 transition-colors hover:bg-white/[.03] md:grid-cols-[3rem_1fr_1fr] md:gap-8 md:py-8">
                  <span className="font-serif text-2xl text-[#ff8a33] tabular-nums">{String(index + 1).padStart(2, "0")}</span>
                  <p className="font-serif text-2xl leading-tight sm:text-3xl">{problem}</p>
                  <p className="flex items-start gap-3 text-base leading-relaxed text-[#c9c9bd]">
                    <ArrowRight className="mt-1 h-4 w-4 shrink-0 text-[#ff8a33] transition-transform group-hover:translate-x-1" aria-hidden />
                    <span>{fix}</span>
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
          <section id="website-ads-packages" aria-labelledby="website-ads-packages-heading" className="scroll-mt-20 py-12 sm:py-20">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-5">
              <div>
                <p className="text-xs font-bold uppercase tracking-[.14em] text-[#a84700]">Two packages, every cost shown</p>
                <h2 id="website-ads-packages-heading" className="mt-3 font-serif text-4xl leading-[.95] sm:text-6xl">Choose your package</h2>
              </div>
              <div role="group" aria-label="Business type" className="inline-flex gap-1 rounded-sm border border-[#cfcfc1] bg-[#f5f5ec] p-1">
                {audiences.map(({ key, label }) => (
                  <button key={key} type="button" aria-pressed={key === audience} onClick={() => setAudience(key)} className="min-h-11 rounded-sm px-4 text-sm font-semibold transition-colors hover:bg-[#111110]/5 aria-pressed:bg-[#111110] aria-pressed:text-[#ebebdf]">
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              {websiteAdsPlans.map((plan) => {
                const growth = plan.id === "growth";
                const scope = plan.scope[audience];
                return (
                  <article key={plan.id} className={`relative flex flex-col rounded-sm p-6 transition duration-300 hover:-translate-y-0.5 sm:p-9 ${growth
                    ? "bg-[#111110] text-[#ebebdf] shadow-[0_30px_60px_-30px_rgba(17,17,16,.7)]"
                    : "border border-[#cfcfc1] bg-[#f5f5ec] hover:shadow-[0_24px_50px_-30px_rgba(17,17,16,.4)]"}`}>
                    {growth && <span aria-hidden="true" className="absolute inset-x-0 top-0 h-1 rounded-t-sm bg-gradient-orange" />}
                    <div className="flex items-start justify-between gap-4">
                      <h3 className="font-serif text-5xl leading-none">{plan.name}</h3>
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${growth ? "bg-gradient-orange text-[#111110]" : "border border-[#cfcfc1] text-[#55554d]"}`}>
                        {growth ? "Most complete" : "Fastest start"}
                      </span>
                    </div>
                    <p className="mt-5 text-4xl font-bold tracking-tight tabular-nums">{estimate(plan, plan.buildFee, websiteAdsMonths)}</p>
                    <p className={`mt-1 text-xs ${growth ? "text-[#c9c9bd]" : "text-[#55554d]"}`}>Estimated total including three months of ad spend</p>

                    <div className="mt-6 space-y-5 text-sm">
                      <div aria-live="polite">
                        <h4 className="font-semibold">{scope.title}</h4>
                        <ul className={`mt-2 space-y-2 leading-relaxed ${growth ? "text-[#c9c9bd]" : "text-[#55554d]"}`}>
                          {scope.details.map((detail) => (
                            <li key={detail} className="flex items-start gap-2">
                              <Check className={`mt-0.5 h-4 w-4 shrink-0 ${growth ? "text-[#ff8a33]" : "text-[#a84700]"}`} aria-hidden />
                              <span>{detail}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h4 className="font-semibold">{plan.campaignScope}</h4>
                        <p className={`mt-2 leading-relaxed ${growth ? "text-[#c9c9bd]" : "text-[#55554d]"}`}>{plan.campaignDetails}</p>
                      </div>
                    </div>

                    <PlanLedger plan={plan} dark={growth} />
                    <Link to={page.cta.href} className={`mt-7 self-start ${growth ? ctaClass : ghostClass}`}>
                      Get a {plan.name} quote <ArrowRight className="h-4 w-4" aria-hidden />
                    </Link>
                  </article>
                );
              })}
            </div>
            <p className="mt-5 max-w-2xl text-sm leading-relaxed text-[#55554d]">The three months start when your ads go live. Ad spend goes directly to the platforms. Your quote confirms the website scope and media budget.</p>
          </section>
          <WebsiteAdsPaymentSchedule />
          <WebsiteAdsDetails page={page} />
        </div>
      </main>
      <Footer />
    </>
  );
}
