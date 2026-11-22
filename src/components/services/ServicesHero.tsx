import { ArrowRight, ArrowUpRight, Calendar, ChevronRight, Sparkles } from "lucide-react";
import { Link } from "react-router-dom";
import { SectionLabel } from "@/components/SectionLabel";
import { Button } from "@/components/ui/button";
import { PairedTitle } from "@/components/type/TypePair";
import { CALENDLY_URL, proofDisclaimer } from "@/data/services";
import portrait480 from "@/assets/responsive/1-joseph-maina-portrait-480.webp";
import portrait900 from "@/assets/responsive/1-joseph-maina-portrait-900.webp";
import logoIclear from "@/assets/marquee/iclear-240.webp";
import logoConvey from "@/assets/marquee/convey-240.webp";
import logoJoan from "@/assets/marquee/joan-240.webp";
import logoTechmindset from "@/assets/marquee/techmindset-240.webp";
import logoDuara from "@/assets/marquee/duara-240.webp";

/*
 * Every figure here is published elsewhere on the site. Change them only from
 * real reports: src/data/caseStudies.ts (studies) and src/data/services.ts
 * (confirmed claims). The revenue study's client is never named, so the client
 * logos stay on a different card from the revenue figure.
 */
const HERO_STUDY = {
  href: "/work/case-studies#meta-google-combined",
  period: "Aug to Oct 2026",
  revenue: "KES 5.43M",
  roas: "26.4x",
};
/** TikTok 4M + Instagram 2.5M + Facebook 4.8M, from the social-media-2025 study. */
const VIDEO_VIEWS = { value: "11M+", href: "/work/case-studies#social-media-2025" };
const CLIENT_COUNT = "10+";

const clientLogos = [
  { name: "iClear Wellife Service", src: logoIclear },
  { name: "Convey Communications", src: logoConvey },
  { name: "TechMindset Africa", src: logoTechmindset },
  { name: "Duara Schools", src: logoDuara },
  { name: "Joan Mbesya", src: logoJoan },
];

const cardFocus =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background";

/** Page header for /agency/services: a framed landing hero with a proof row underneath. */
export function ServicesHero() {
  return (
    <header data-track-location="services-hero" className="relative overflow-hidden bg-primary/[0.06] pb-10 pt-6 sm:pb-14 sm:pt-8">
      <div aria-hidden className="pointer-events-none absolute -top-48 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-primary/10 blur-[140px]" />

      <div className="container relative mx-auto px-4">
        <div className="mx-auto max-w-6xl rounded-[2rem] border border-border/60 bg-background p-4 shadow-elegant sm:p-7 lg:p-9">
          <nav aria-label="Breadcrumb" className="text-sm text-muted-foreground">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li><Link to="/agency" className="inline-flex min-h-11 items-center transition-colors hover:text-primary focus-visible:rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">Agency</Link></li>
              <li aria-hidden="true"><ChevronRight className="h-3.5 w-3.5" /></li>
              <li><span aria-current="page" className="text-foreground">Services</span></li>
            </ol>
          </nav>

          <div className="mt-2 grid gap-8 lg:grid-cols-[1.15fr_1fr] lg:items-center lg:gap-10">
            <div className="relative px-1 sm:px-2">
              <SectionLabel>JM MARKETING · NAIROBI</SectionLabel>
              <PairedTitle
                className="services-hero-title mt-5"
                main="Digital marketing services in Nairobi that"
                accent={<>pay back in <span className="services-hero-swoosh">KES.<Swoosh /></span></>}
              />
              <p className="mt-7 max-w-lg text-lg leading-relaxed text-muted-foreground">
                Paid ads, SEO, social media and Shopify stores. Pick one channel or combine them, and work directly with me.
              </p>

              <div id="services-hero-cta" className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                <Button size="lg" className="w-full rounded-full sm:w-auto" asChild>
                  <a href={CALENDLY_URL} target="_blank" rel="noopener noreferrer">
                    <Calendar className="mr-2 h-5 w-5" aria-hidden /> Book a Free Strategy Call
                  </a>
                </Button>
                <Button size="lg" variant="outline" className="w-full rounded-full sm:w-auto" asChild>
                  <a href="#results">
                    See results <ArrowRight className="ml-2 h-4 w-4" aria-hidden />
                  </a>
                </Button>
              </div>

              <Starburst className="pointer-events-none absolute -top-8 right-0 hidden h-24 w-24 text-primary/70 sm:block lg:-top-20" />
            </div>

            <PortraitPanel />
          </div>

          <ul className="mt-8 grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-[2fr_1fr_1fr]">
            <li className="col-span-2 lg:col-span-1">
              <Link
                to={VIDEO_VIEWS.href}
                className={`group flex h-full flex-col justify-between gap-6 rounded-3xl bg-[linear-gradient(105deg,#1d1713_52%,hsl(var(--primary)/0.9))] p-5 text-white ring-1 ring-white/10 transition-transform motion-safe:hover:-translate-y-0.5 sm:flex-row sm:items-center sm:p-7 ${cardFocus}`}
              >
                <div>
                  <ul className="flex -space-x-3" aria-label="Some of the brands I've worked with">
                    {clientLogos.map((logo) => (
                      <li key={logo.name} className="flex h-12 w-12 items-center justify-center rounded-full bg-white p-1.5 ring-2 ring-[#1d1713] sm:h-14 sm:w-14">
                        <img src={logo.src} alt={logo.name} width={240} height={160} decoding="async" className="h-full w-full object-contain" />
                      </li>
                    ))}
                  </ul>
                  <p className="mt-3 text-xs font-medium uppercase tracking-[0.14em] text-white/60">Brands I've worked with</p>
                </div>
                <div className="sm:text-right">
                  <p className="font-display text-5xl font-bold leading-none tracking-tight tabular-nums sm:text-6xl">{VIDEO_VIEWS.value}</p>
                  <p className="mt-2 max-w-[16rem] text-sm leading-snug text-white/80 sm:ml-auto">
                    Video views across TikTok, Instagram and Facebook in 2025
                  </p>
                </div>
              </Link>
            </li>

            <li className="flex flex-col items-center justify-center rounded-3xl bg-primary/10 p-5 text-center ring-1 ring-primary/15 sm:p-7">
              <p className="font-display text-5xl font-bold leading-none tracking-tight text-[hsl(25_100%_34%)] tabular-nums dark:text-primary sm:text-6xl">
                {CLIENT_COUNT}
              </p>
              <p className="mt-2 text-base font-medium sm:text-lg">Brands served</p>
            </li>

            <li>
              <Link
                to="/work/case-studies"
                className={`group relative flex h-full flex-col items-center justify-center rounded-3xl bg-primary p-5 text-center text-primary-foreground transition-transform motion-safe:hover:-translate-y-0.5 sm:p-7 ${cardFocus}`}
              >
                <Sparkles className="absolute left-4 top-4 h-5 w-5" aria-hidden />
                <ArrowUpRight className="absolute right-4 top-4 h-5 w-5 transition-transform motion-safe:group-hover:-translate-y-0.5 motion-safe:group-hover:translate-x-0.5" aria-hidden />
                <p className="font-display text-5xl font-bold leading-none tracking-tight tabular-nums sm:text-6xl">20+</p>
                <p className="mt-2 text-base font-semibold sm:text-lg">Campaigns launched</p>
                <p className="mt-1 text-xs font-medium opacity-80">KES 500K+ ad budgets managed</p>
              </Link>
            </li>
          </ul>
        </div>
      </div>
    </header>
  );
}

/** Joseph's portrait with one published result floating over it. */
function PortraitPanel() {
  return (
    <div className="relative mx-auto w-full max-w-md lg:max-w-none">
      <div className="relative aspect-square overflow-hidden rounded-[1.75rem] bg-[#dfe9f2] lg:aspect-[4/5]">
        <img
          src={portrait900}
          srcSet={`${portrait480} 480w, ${portrait900} 900w`}
          sizes="(min-width: 1024px) 440px, (min-width: 640px) 448px, 92vw"
          alt="Joseph Maina, founder of JM Marketing"
          width={900}
          height={900}
          fetchPriority="high"
          decoding="async"
          className="h-full w-full object-cover object-[45%_30%]"
        />
        <span className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-white/85 px-3 py-1.5 text-xs font-semibold text-neutral-900 backdrop-blur">
          <span className="h-2 w-2 rounded-full bg-emerald-500" aria-hidden /> Taking on new clients
        </span>
      </div>

      <Link
        to={HERO_STUDY.href}
        className={`group relative z-10 mx-auto -mt-10 block w-[calc(100%-2rem)] max-w-xs rounded-2xl lg:absolute lg:mt-0 lg:w-64 lg:max-w-none border border-black/5 bg-white p-4 text-neutral-900 shadow-[0_20px_50px_-15px_rgba(0,0,0,0.35)] transition-transform motion-safe:hover:-translate-y-1 lg:bottom-10 lg:right-[-1.75rem] ${cardFocus}`}
      >
        <div className="flex items-center justify-between text-[11px] font-medium text-neutral-500">
          <span>Tracked revenue</span>
          <span>{HERO_STUDY.period}</span>
        </div>
        <p className="mt-1 font-display text-2xl font-bold tracking-tight tabular-nums">{HERO_STUDY.revenue}</p>
        <svg viewBox="0 0 220 56" className="mt-2 h-12 w-full" aria-hidden>
          <defs>
            <linearGradient id="hero-curve-fill" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="hsl(25 100% 50%)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="hsl(25 100% 50%)" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M2 48 C 30 46, 42 34, 66 36 S 104 44, 124 28 S 168 20, 186 12 S 210 6, 218 4 L 218 56 L 2 56 Z" fill="url(#hero-curve-fill)" />
          <path d="M2 48 C 30 46, 42 34, 66 36 S 104 44, 124 28 S 168 20, 186 12 S 210 6, 218 4" fill="none" stroke="#171717" strokeWidth="2" strokeLinecap="round" />
          <circle cx="218" cy="4" r="3.5" fill="hsl(25 100% 50%)" />
        </svg>
        <div className="mt-2 flex items-center justify-between">
          <span className="rounded-full bg-neutral-900 px-2.5 py-1 text-[11px] font-semibold text-white tabular-nums">{HERO_STUDY.roas} ROAS</span>
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[hsl(25_100%_34%)]">
            Case study <ArrowRight className="h-3.5 w-3.5 transition-transform motion-safe:group-hover:translate-x-0.5" aria-hidden />
          </span>
        </div>
        <p className="mt-2 text-[10px] leading-snug text-neutral-500">Client not named. {proofDisclaimer}</p>
      </Link>
    </div>
  );
}

/** Hand-drawn underline under the accent word. */
function Swoosh() {
  return (
    <svg viewBox="0 0 300 24" preserveAspectRatio="none" aria-hidden className="services-hero-swoosh-line">
      <path d="M4 17 C 70 7, 170 3, 296 9" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" />
      <path d="M40 21 C 110 14, 190 12, 270 15" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" opacity="0.55" />
    </svg>
  );
}

/** Thin-ray burst, as in the reference layout. */
function Starburst({ className }: { className?: string }) {
  const rays = Array.from({ length: 16 }, (_, i) => {
    const angle = (i * Math.PI * 2) / 16;
    const inner = i % 2 ? 14 : 8;
    const outer = i % 2 ? 34 : 46;
    return {
      x1: 50 + Math.cos(angle) * inner,
      y1: 50 + Math.sin(angle) * inner,
      x2: 50 + Math.cos(angle) * outer,
      y2: 50 + Math.sin(angle) * outer,
    };
  });
  return (
    <svg viewBox="0 0 100 100" className={className} aria-hidden>
      {rays.map((r, i) => (
        <line key={i} {...r} stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      ))}
    </svg>
  );
}
