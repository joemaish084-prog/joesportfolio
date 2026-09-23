import { useState, lazy, Suspense } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { CollapsibleWrapper } from "@/components/CollapsibleWrapper";
import { ExpandCollapseAll } from "@/components/ExpandCollapseAll";
import { PressFeatures } from "@/components/PressFeatures";
import { Video, Palette, DollarSign, BarChart3, Briefcase, HelpCircle } from "lucide-react";
import { Helmet } from "react-helmet-async";

// Lazy-load Hero to split framer-motion out of the critical path and reduce longest task
const Hero = lazy(() => import("@/components/Hero").then(m => ({ default: m.Hero })));

// Lightweight placeholder matching Hero dimensions to avoid layout shift
const HeroFallback = () => (
  <section id="home" className="relative w-full min-h-screen bg-background flex items-center px-6 sm:px-10 lg:px-16">
    <div className="max-w-xl">
      <p className="text-xs font-medium text-muted-foreground mb-6 tracking-wide uppercase">Digital Marketing Specialist · Nairobi, Kenya</p>
      <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold tracking-tight text-foreground">
        Creative Strategy<span className="text-primary"> Meets </span>Visual Storytelling
      </h1>
    </div>
  </section>
);

// Lazy-load non-critical above-the-fold utilities
const SplashScreen = lazy(() => import("@/components/SplashScreen").then(m => ({ default: m.SplashScreen })));
const ScrollProgress = lazy(() => import("@/components/ScrollProgress").then(m => ({ default: m.ScrollProgress })));
const BackToTop = lazy(() => import("@/components/BackToTop").then(m => ({ default: m.BackToTop })));
const WhatsAppButton = lazy(() => import("@/components/WhatsAppButton").then(m => ({ default: m.WhatsAppButton })));

// Lazy-load below-the-fold components to reduce main-thread blocking
const Videos = lazy(() => import("@/components/Videos").then(m => ({ default: m.Videos })));
const GraphicDesign = lazy(() => import("@/components/GraphicDesign").then(m => ({ default: m.GraphicDesign })));
const PrintMockup = lazy(() => import("@/components/PrintMockup").then(m => ({ default: m.PrintMockup })));
const About = lazy(() => import("@/components/About").then(m => ({ default: m.About })));
const ServicesPricing = lazy(() => import("@/components/ServicesPricing").then(m => ({ default: m.ServicesPricing })));
const AgencyPromo = lazy(() => import("@/components/AgencyPromo").then(m => ({ default: m.AgencyPromo })));
const MediaBuying = lazy(() => import("@/components/MediaBuying").then(m => ({ default: m.MediaBuying })));
const SkillsStats = lazy(() => import("@/components/SkillsStats").then(m => ({ default: m.SkillsStats })));
const CaseStudy = lazy(() => import("@/components/CaseStudy").then(m => ({ default: m.CaseStudy })));
const Experience = lazy(() => import("@/components/Experience").then(m => ({ default: m.Experience })));
const Certifications = lazy(() => import("@/components/Certifications").then(m => ({ default: m.Certifications })));
const BrandsLogoMarquee = lazy(() => import("@/components/BrandsLogoMarquee").then(m => ({ default: m.BrandsLogoMarquee })));
const Testimonials = lazy(() => import("@/components/Testimonials").then(m => ({ default: m.Testimonials })));
const FAQ = lazy(() => import("@/components/FAQ").then(m => ({ default: m.FAQ })));
const Contact = lazy(() => import("@/components/Contact").then(m => ({ default: m.Contact })));
const Footer = lazy(() => import("@/components/Footer").then(m => ({ default: m.Footer })));
const ChatAssistant = lazy(() => import("@/components/ChatAssistant").then(m => ({ default: m.ChatAssistant })));

const Index = () => {
  const [splashDone, setSplashDone] = useState(
    !!sessionStorage.getItem("splash-seen")
  );

  return (
    <>
      <Helmet>
        <link rel="canonical" href="https://www.josephmaina.co.ke/" />
      </Helmet>
      {!splashDone && <Suspense fallback={null}><SplashScreen onComplete={() => setSplashDone(true)} /></Suspense>}
      <Suspense fallback={null}><ScrollProgress /></Suspense>
      <SiteHeader />
      <main className={`min-h-screen ${splashDone ? "animate-fade-in" : "opacity-0"}`}>
        <Suspense fallback={<HeroFallback />}><Hero /></Suspense>
        <ExpandCollapseAll />
        <Suspense fallback={null}>
          <CollapsibleWrapper id="videos" title="Video Production" Icon={Video} count="9+ Videos">
            <Videos />
          </CollapsibleWrapper>
          <CollapsibleWrapper id="graphic-design" title="Graphic Design" Icon={Palette} count="Gallery">
            <GraphicDesign />
          </CollapsibleWrapper>
          <PrintMockup />
          <About />
          <ServicesPricing />
          <AgencyPromo />
          <MediaBuying />
          <SkillsStats />
          <CollapsibleWrapper id="case-study" title="Case Studies" Icon={BarChart3} count="Featured">
            <CaseStudy />
          </CollapsibleWrapper>
          <CollapsibleWrapper id="experience" title="Experience" Icon={Briefcase} count="Timeline">
            <Experience />
          </CollapsibleWrapper>
          <Certifications />
          <BrandsLogoMarquee />
          <PressFeatures />
          <Testimonials />
          <CollapsibleWrapper id="faq" title="FAQ" Icon={HelpCircle} count="7 Questions">
            <FAQ />
          </CollapsibleWrapper>
          <Contact />
        </Suspense>
      </main>
      <Suspense fallback={null}>
        <Footer />
        <ChatAssistant />
      </Suspense>
      <Suspense fallback={null}><BackToTop /></Suspense>
      <Suspense fallback={null}><WhatsAppButton /></Suspense>
    </>
  );
};

export default Index;
