import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowDownRight, ArrowRight } from "lucide-react";
import { AgencyNavigation } from "@/components/agency/AgencyNavigation";
import { Footer } from "@/components/Footer";
import { Seo } from "@/components/Seo";
import type { ServicePage } from "@/data/servicePages";
import { formatKes } from "@/data/services";
import { websiteAdsDescription, websiteAdsHero, websiteAdsLabel, websiteAdsMonths, websiteAdsPlans } from "@/data/websiteAds";
import { serviceHead } from "@/seo/pageHeads";
import { WebsiteAdsDetails } from "./WebsiteAdsDetails";

const audiences = [
  { key: "retail", label: "Retail" },
  { key: "services", label: "Services" },
] as const;
type Audience = (typeof audiences)[number]["key"];

const kes = (amount: number) => `KSh ${formatKes(amount)}`;
type WebsiteAdsPlan = (typeof websiteAdsPlans)[number];

function estimate(plan: WebsiteAdsPlan, websitePayment: number, months: number) {
  const totals = plan.options.map(({ management, media }) => websitePayment + months * (management + media));
  const low = Math.min(...totals);
  const high = Math.max(...totals);
  return low === high ? kes(low) : `${kes(low)}–${formatKes(high)}`;
}

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

function WebsiteAdsPaymentSchedule() {
  return (
    <section id="website-ads-payments" aria-labelledby="website-ads-payments-heading" className="scroll-mt-20 border-t border-[#c9cdc0] py-10 sm:py-16">
      <h2 id="website-ads-payments-heading" className="font-serif text-4xl leading-none sm:text-5xl">Example payment schedule</h2>
      <p className="mt-3 max-w-2xl text-sm leading-relaxed text-[#505d56]">The website fee is split into two payments. Campaign management is billed monthly from launch, and you pay your media budget directly to the platforms.</p>
      <table className="mt-6 w-full table-fixed border-collapse text-xs sm:text-sm">
        <caption className="sr-only">Estimated payment milestones for Growth and Launch, including the planned ad spend</caption>
        <thead className="border-y border-[#c9cdc0] bg-[#f6f5eb]">
          <tr>
            <th scope="col" className="py-3 pl-2 text-left sm:pl-4">When you pay</th>
            {websiteAdsPlans.map((plan) => <th key={plan.id} scope="col" className="w-[29%] py-3 pr-1 text-right sm:w-1/4 sm:pr-4">{plan.name}</th>)}
          </tr>
        </thead>
        <tbody>
          {paymentSchedule.map(({ label, description, buildShare, months }) => (
            <tr key={label} className="border-b border-[#c9cdc0]">
              <th scope="row" className="py-3 pl-2 pr-1 text-left font-semibold sm:pl-4">
                {label}<span className="mt-1 block font-normal text-[#505d56]">{description}</span>
              </th>
              {websiteAdsPlans.map((plan) => (
                <td key={plan.id} className="py-3 pr-1 text-right font-semibold tabular-nums sm:pr-4">{estimate(plan, plan.buildFee * buildShare, months)}</td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot className="border-b border-[#c9cdc0] bg-[#f6f5eb] font-bold">
          <tr>
            <th scope="row" className="py-3 pl-2 text-left sm:pl-4">Estimated total</th>
            {websiteAdsPlans.map((plan) => (
              <td key={plan.id} className="py-3 pr-1 text-right tabular-nums sm:pr-4">{estimate(plan, plan.buildFee, websiteAdsMonths)}</td>
            ))}
          </tr>
        </tfoot>
      </table>
      <p className="mt-3 text-sm leading-relaxed text-[#505d56]">These examples use the same media budget in each campaign month. The quote confirms milestones and any hosting, extra content or integration costs.</p>
    </section>
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
      <main id="website-ads-main" className="bg-[#ebebdf] font-sans text-[#101815]">
        <div className="mx-auto max-w-6xl px-5 sm:px-8 lg:px-10">
          <div className="flex flex-wrap items-center justify-between gap-x-5 gap-y-3 border-b border-[#c9cdc0] py-5">
            <div className="flex items-center gap-2.5 sm:gap-4">
              <img src="/media/partnership/nuvana-wordmark.png" alt="Nuvana HQ" width={909} height={262} className="h-auto w-24 sm:w-28" />
              <span aria-hidden="true" className="text-[#505d56]">×</span>
              <div className="flex items-center gap-2">
                <img src="/logo/jm-lockup-240.webp" alt="" width={240} height={91} className="h-8 w-8 object-cover object-left" />
                <span className="text-xs font-bold leading-tight">Joseph Maina<br />Marketing</span>
              </div>
            </div>
            <Link to="/agency/services" className="text-sm font-medium text-[#0f766e] underline underline-offset-4">Agency services</Link>
          </div>

          <section className="grid items-center gap-9 py-10 md:grid-cols-[1.02fr_1fr] lg:gap-16 lg:py-16" aria-labelledby="website-ads-heading">
            <div>
              <p className="flex items-center gap-2 text-xs font-bold uppercase tracking-[.1em] before:h-px before:w-4 before:bg-[#0f766e]">{websiteAdsLabel}</p>
              <h1 id="website-ads-heading" className="mt-5 font-serif text-6xl leading-[.88] tracking-tight sm:text-7xl lg:text-8xl">
                Open online.<br /><em className="font-normal text-[#0f766e]">Get found.</em>
              </h1>
              <p className="mt-5 max-w-[34ch] text-base leading-relaxed text-[#505d56]">{websiteAdsDescription}</p>
              <a href="#website-ads-packages" className="mt-6 inline-flex min-h-11 items-center gap-3 rounded-sm bg-[#ff6a00] px-4 py-2.5 text-sm font-bold text-[#101815] hover:bg-[#ff8633]">
                Compare packages <ArrowDownRight className="h-4 w-4" aria-hidden />
              </a>
            </div>
            <figure className="bg-[#0f766e] p-2.5 pb-0 text-[#f6f5eb] md:-rotate-2">
              <img
                src={websiteAdsHero.src}
                srcSet={websiteAdsHero.srcSet}
                sizes="(min-width: 1152px) 490px, (min-width: 768px) 46vw, 96vw"
                alt={websiteAdsHero.alt}
                width={websiteAdsHero.width}
                height={websiteAdsHero.height}
                fetchPriority="high"
                className="aspect-[16/10] h-auto w-full object-cover md:aspect-[4/3]"
              />
              <figcaption className="py-2 text-xs font-medium">{websiteAdsHero.caption}</figcaption>
            </figure>
          </section>

          <div className="flex flex-wrap gap-x-7 gap-y-2 border-y border-[#c9cdc0] py-3 text-sm text-[#505d56]">
            <p><strong className="text-[#101815]">Nuvana</strong> builds your website.</p>
            <p><strong className="text-[#101815]">JM Marketing</strong> runs and tracks your ads.</p>
          </div>
          <nav aria-label="On this page" className="flex flex-wrap gap-x-5 gap-y-1 pt-2 text-sm text-[#0f766e]">
            {sectionLinks.map(({ label, id }) => (
              <a key={id} href={`#${id}`} className="inline-flex min-h-11 items-center font-semibold underline-offset-4 hover:underline">{label}</a>
            ))}
          </nav>

          <section id="website-ads-packages" aria-labelledby="website-ads-packages-heading" className="scroll-mt-20 py-9 sm:py-12">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
              <h2 id="website-ads-packages-heading" className="font-serif text-4xl leading-none sm:text-5xl">Choose your package</h2>
              <div role="group" aria-label="Business type" className="inline-flex gap-1 border border-[#c9cdc0] p-1">
                {audiences.map(({ key, label }) => (
                  <button key={key} type="button" aria-pressed={key === audience} onClick={() => setAudience(key)} className="min-h-11 rounded-sm px-3 text-sm font-semibold hover:bg-[#0f766e]/10 aria-pressed:bg-[#0f766e] aria-pressed:text-[#f6f5eb]">
                    {label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {websiteAdsPlans.map((plan) => {
                const growth = plan.id === "growth";
                const scope = plan.scope[audience];
                return (
                  <article key={plan.id} className={growth
                    ? "border-t-[3px] border-[#00bfa5] bg-[#101815] p-5 text-[#f6f5eb] sm:p-8"
                    : "border border-t-[3px] border-[#c9cdc0] border-t-[#0f766e] bg-[#f6f5eb] p-5 sm:p-8"}>
                    <h3 className={`font-serif text-5xl leading-none ${growth ? "text-[#00bfa5]" : ""}`}>{plan.name}</h3>
                    <p className="mt-3 text-3xl font-bold tracking-tight">{estimate(plan, plan.buildFee, websiteAdsMonths)}</p>
                    <p className="mt-1 text-xs opacity-80">Estimated total including three months of ad spend</p>
                    <div className="mt-5 divide-y divide-current/25 border-y border-current/25 text-sm">
                      <div className="py-4" aria-live="polite">
                        <h4 className="font-semibold">{scope.title}</h4>
                        <ul className="mt-2 list-disc space-y-1 pl-4 leading-relaxed opacity-85">
                          {scope.details.map((detail) => <li key={detail}>{detail}</li>)}
                        </ul>
                      </div>
                      <div className="py-4">
                        <h4 className="font-semibold">{plan.campaignScope}</h4>
                        <p className="mt-2 leading-relaxed opacity-85">{plan.campaignDetails}</p>
                      </div>
                    </div>
                    <div className="mt-4 space-y-1.5 text-xs leading-relaxed opacity-85">
                      <p>Website build: {kes(plan.buildFee)} one time</p>
                      {plan.options.map((option) => (
                        <p key={option.name}>{!growth && `${option.name}: `}{kes(option.management)} management + {kes(option.media)} ad spend per month</p>
                      ))}
                    </div>
                  </article>
                );
              })}
            </div>
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#505d56]">The three months start when your ads go live. Ad spend goes directly to the platforms. Your quote confirms the website scope and media budget.</p>
            <Link to={page.cta.href} className="mt-6 inline-flex min-h-11 items-center gap-3 rounded-sm bg-[#ff6a00] px-4 py-2.5 text-sm font-bold text-[#101815] hover:bg-[#ff8633]">
              Request a package quote <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </section>
          <WebsiteAdsPaymentSchedule />
          <WebsiteAdsDetails page={page} />
        </div>
      </main>
      <Footer />
    </>
  );
}
