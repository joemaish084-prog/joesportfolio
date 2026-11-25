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

const audiences = [
  { key: "retail", label: "Retail" },
  { key: "services", label: "Services" },
] as const;
type Audience = (typeof audiences)[number]["key"];

const kes = (amount: number) => `KSh ${formatKes(amount)}`;

function estimatedTotal(plan: (typeof websiteAdsPlans)[number]) {
  const totals = plan.options.map(({ management, media }) => plan.buildFee + websiteAdsMonths * (management + media));
  const low = Math.min(...totals);
  const high = Math.max(...totals);
  return low === high ? kes(low) : `${kes(low)}–${formatKes(high)}`;
}

export function WebsiteAdsOffer({ page }: { page: ServicePage }) {
  const [audience, setAudience] = useState<Audience>("retail");

  useEffect(() => {
    if (window.location.hash !== "#website-ads-packages") window.scrollTo(0, 0);
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
                return (
                  <article key={plan.id} className={growth
                    ? "border-t-[3px] border-[#00bfa5] bg-[#101815] p-5 text-[#f6f5eb] sm:p-8"
                    : "border border-t-[3px] border-[#c9cdc0] border-t-[#0f766e] bg-[#f6f5eb] p-5 sm:p-8"}>
                    <h3 className={`font-serif text-5xl leading-none ${growth ? "text-[#00bfa5]" : ""}`}>{plan.name}</h3>
                    <p className="mt-3 text-3xl font-bold tracking-tight">{estimatedTotal(plan)}</p>
                    <p className="mt-1 text-xs opacity-80">Estimated total including three months of ad spend</p>
                    <ul className="mt-4 divide-y divide-current/25 border-y border-current/25 text-sm">
                      <li className="py-2.5" aria-live="polite">{plan.scope[audience]}</li>
                      <li className="py-2.5">{plan.campaignScope}</li>
                    </ul>
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
              {page.cta.label} <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}
