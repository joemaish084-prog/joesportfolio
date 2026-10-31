import { Suspense, useEffect, useRef, useState, type ReactNode } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { CollapsibleWrapper } from "@/components/CollapsibleWrapper";
import { ExpandCollapseAll } from "@/components/ExpandCollapseAll";
import { PressFeatures } from "@/components/PressFeatures";
import { Video, Palette, BarChart3, Briefcase, HelpCircle } from "lucide-react";
import { Hero } from "@/components/Hero";
import { Seo } from "@/components/Seo";
import { STATIC_HEADS } from "@/seo/heads";
import {
  ScrollProgress,
  BackToTop,
  Videos,
  GraphicDesign,
  BrandIdentity,
  Mockups,
  About,
  ServicesPricing,
  AgencyPromo,
  MediaBuying,
  SkillsStats,
  CaseStudy,
  Experience,
  Certifications,
  BrandsLogoMarquee,
  Testimonials,
  FAQ,
  Contact,
  Footer,
  ChatAssistant,
  MOUNT_ALL_SECTIONS_EVENT,
  preloadHomeSections,
  whenIdle,
} from "./homeSections";

// Each section has its own boundary, so one still loading never hides the ones
// already on screen. The placeholder keeps some height while its chunk loads.
const sectionFallback = <div aria-hidden style={{ minHeight: "600px" }} />;

const SECTIONS: { key: string; node: ReactNode }[] = [
  {
    key: "case-study",
    node: (
      <CollapsibleWrapper id="case-study" title="Case Studies" Icon={BarChart3} count="Featured" defaultOpenOnMobile>
        <CaseStudy />
      </CollapsibleWrapper>
    ),
  },
  {
    key: "videos",
    node: (
      <CollapsibleWrapper id="videos" title="Video Production" Icon={Video} count="15 Videos" defaultOpenOnMobile>
        <Videos />
      </CollapsibleWrapper>
    ),
  },
  {
    key: "graphic-design",
    node: (
      <CollapsibleWrapper id="graphic-design" title="Graphic Design" Icon={Palette} count="Gallery">
        <GraphicDesign />
      </CollapsibleWrapper>
    ),
  },
  { key: "brand-identity", node: <BrandIdentity /> },
  { key: "mockups", node: <Mockups /> },
  { key: "about", node: <About /> },
  { key: "press", node: <PressFeatures /> },
  { key: "services-pricing", node: <ServicesPricing /> },
  { key: "agency-promo", node: <AgencyPromo /> },
  { key: "media-buying", node: <MediaBuying /> },
  { key: "skills-stats", node: <SkillsStats /> },
  {
    key: "experience",
    node: (
      <CollapsibleWrapper id="experience" title="Experience" Icon={Briefcase} count="Timeline">
        <Experience />
      </CollapsibleWrapper>
    ),
  },
  { key: "certifications", node: <Certifications /> },
  { key: "brands", node: <BrandsLogoMarquee /> },
  { key: "testimonials", node: <Testimonials /> },
  {
    key: "faq",
    node: (
      <CollapsibleWrapper id="faq" title="FAQ" Icon={HelpCircle} count="15 Questions">
        <FAQ />
      </CollapsibleWrapper>
    ),
  },
  { key: "contact", node: <Contact /> },
];

// Rendered straight away; the rest are added one per idle moment, so a phone
// never has to build the whole page in one long, unresponsive task.
const INITIAL_SECTIONS = 2;

const Index = () => {
  // Arriving at /#section needs that section in the page right away.
  const [mounted, setMounted] = useState(() =>
    window.location.hash ? SECTIONS.length : INITIAL_SECTIONS,
  );
  const allMounted = mounted >= SECTIONS.length;
  const spacerRef = useRef<HTMLDivElement>(null);

  // Download the remaining section chunks once the first screen is up.
  useEffect(() => whenIdle(() => preloadHomeSections()), []);

  // Add the next section whenever the main thread is free. Animations keep a
  // phone from ever going fully idle, so cap the wait to keep the page filling in.
  useEffect(() => {
    if (allMounted) return;
    return whenIdle(() => setMounted((n) => Math.min(n + 1, SECTIONS.length)), 300);
  }, [mounted, allMounted]);

  // Nav links ask for everything before scrolling. Any other in-page link whose
  // target isn't rendered yet does the same, then scrolls once it exists.
  useEffect(() => {
    const mountAll = () => setMounted(SECTIONS.length);
    let retry = 0;
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented) return; // already handled, e.g. by the header nav
      const link = (e.target as Element | null)?.closest?.("a[href]");
      const href = link?.getAttribute("href") ?? "";
      const hash = href.startsWith("#") ? href : href.startsWith("/#") ? href.slice(1) : "";
      if (hash.length < 2 || document.getElementById(hash.slice(1))) return;
      e.preventDefault();
      mountAll();
      window.history.pushState(null, "", hash);
      const giveUpAt = Date.now() + 8000;
      const tryScroll = () => {
        const target = document.getElementById(hash.slice(1));
        if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
        else if (Date.now() < giveUpAt) retry = window.setTimeout(tryScroll, 100);
      };
      retry = window.setTimeout(tryScroll, 50);
    };
    window.addEventListener(MOUNT_ALL_SECTIONS_EVENT, mountAll);
    document.addEventListener("click", onClick);
    return () => {
      window.removeEventListener(MOUNT_ALL_SECTIONS_EVENT, mountAll);
      document.removeEventListener("click", onClick);
      window.clearTimeout(retry);
    };
  }, []);

  // A visitor scrolling faster than sections are added gets the rest at once.
  useEffect(() => {
    const spacer = spacerRef.current;
    if (allMounted || !spacer) return;
    const observer = new IntersectionObserver(
      ([entry]) => entry.isIntersecting && setMounted(SECTIONS.length),
      { rootMargin: "1200px 0px" },
    );
    observer.observe(spacer);
    return () => observer.disconnect();
  }, [allMounted]);

  return (
    <>
      <Seo {...STATIC_HEADS.home} />
      <Suspense fallback={null}><ScrollProgress /></Suspense>
      <SiteHeader />
      <main className="min-h-screen">
        <Hero />
        <ExpandCollapseAll />
        {SECTIONS.slice(0, mounted).map(({ key, node }) => (
          <Suspense key={key} fallback={sectionFallback}>
            {node}
          </Suspense>
        ))}
        {/* Reserve the height of sections not added yet, so the page doesn't
            end abruptly under a visitor who scrolls ahead of them. */}
        {!allMounted && (
          <div ref={spacerRef} aria-hidden style={{ minHeight: `${(SECTIONS.length - mounted) * 600}px` }} />
        )}
      </main>
      {allMounted && (
        <Suspense fallback={null}>
          <Footer />
        </Suspense>
      )}
      <Suspense fallback={null}><ChatAssistant /></Suspense>
      <Suspense fallback={null}><BackToTop /></Suspense>
    </>
  );
};

export default Index;
