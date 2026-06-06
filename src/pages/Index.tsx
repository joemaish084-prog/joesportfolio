import { useState, lazy, Suspense } from "react";
import { Navigation } from "@/components/Navigation";
import { CollapsibleWrapper } from "@/components/CollapsibleWrapper";
import { ExpandCollapseAll } from "@/components/ExpandCollapseAll";
import { Video, Palette, DollarSign, BarChart3, Briefcase, HelpCircle } from "lucide-react";
import { Helmet } from "react-helmet-async";

// Lazy-load Hero to split framer-motion out of the critical path and reduce longest task
const Hero = lazy(() => import("@/components/Hero").then(m => ({ default: m.Hero })));

// Lightweight placeholder matching Hero dimensions to avoid layout shift
const HeroFallback = () => (
  <section id="home" className="relative w-full min-h-screen bg-background flex items-center justify-center">
    <div className="text-center px-4">
      <p className="text-sm font-medium text-primary mb-4 tracking-wide uppercase">Digital Marketing Specialist · Nairobi, Kenya</p>
      <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold tracking-tight leading-tight max-w-4xl">
        Creative Strategy<span className="text-gradient"> Meets </span>Visual Storytelling
      </h1>
    </div>
  </section>
);

// Lazy-load non-critical above-the-fold utilities
const SplashScreen = lazy(() => import("@/components/SplashScreen").then(m => ({ default: m.SplashScreen })));
const ScrollProgress = lazy(() => import("@/components/ScrollProgress").then(m => ({ default: m.ScrollProgress })));
const BackToTop = lazy(() => import("@/components/BackToTop").then(m => ({ default: m.BackToTop })));

// Lazy-load below-the-fold components to reduce main-thread blocking
const Videos = lazy(() => import("@/components/Videos").then(m => ({ default: m.Videos })));
const GraphicDesign = lazy(() => import("@/components/GraphicDesign").then(m => ({ default: m.GraphicDesign })));
const PrintMockup = lazy(() => import("@/components/PrintMockup").then(m => ({ default: m.PrintMockup })));
const About = lazy(() => import("@/components/About").then(m => ({ default: m.About })));
const ServicesPricing = lazy(() => import("@/components/ServicesPricing").then(m => ({ default: m.ServicesPricing })));
const MediaBuying = lazy(() => import("@/components/MediaBuying").then(m => ({ default: m.MediaBuying })));
const SkillsStats = lazy(() => import("@/components/SkillsStats").then(m => ({ default: m.SkillsStats })));
const CaseStudy = lazy(() => import("@/components/CaseStudy").then(m => ({ default: m.CaseStudy })));
const Experience = lazy(() => import("@/components/Experience").then(m => ({ default: m.Experience })));
const Certifications = lazy(() => import("@/components/Certifications").then(m => ({ default: m.Certifications })));
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
      <div className={`min-h-screen ${splashDone ? "animate-fade-in" : "opacity-0"}`}>
        <Suspense fallback={null}><ScrollProgress /></Suspense>
        <Navigation />
        <main>
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
            <MediaBuying />
            <SkillsStats />
            <CollapsibleWrapper id="case-study" title="Case Studies" Icon={BarChart3} count="Featured">
              <CaseStudy />
            </CollapsibleWrapper>
            <CollapsibleWrapper id="experience" title="Experience" Icon={Briefcase} count="Timeline">
              <Experience />
            </CollapsibleWrapper>
            <Certifications />
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
      </div>
    </>
  );
};

export default Index;
