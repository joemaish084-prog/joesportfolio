import { useState, lazy, Suspense } from "react";
import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";

// Lazy-load non-critical above-the-fold utilities
const SplashScreen = lazy(() => import("@/components/SplashScreen").then(m => ({ default: m.SplashScreen })));
const ScrollProgress = lazy(() => import("@/components/ScrollProgress").then(m => ({ default: m.ScrollProgress })));
const BackToTop = lazy(() => import("@/components/BackToTop").then(m => ({ default: m.BackToTop })));

// Lazy-load below-the-fold components to reduce main-thread blocking
const GraphicDesign = lazy(() => import("@/components/GraphicDesign").then(m => ({ default: m.GraphicDesign })));
const PrintMockup = lazy(() => import("@/components/PrintMockup").then(m => ({ default: m.PrintMockup })));
const Videos = lazy(() => import("@/components/Videos").then(m => ({ default: m.Videos })));
const SocialMediaManagement = lazy(() => import("@/components/SocialMediaManagement").then(m => ({ default: m.SocialMediaManagement })));
const CaseStudy = lazy(() => import("@/components/CaseStudy").then(m => ({ default: m.CaseStudy })));
const FAQ = lazy(() => import("@/components/FAQ").then(m => ({ default: m.FAQ })));
const SkillsStats = lazy(() => import("@/components/SkillsStats").then(m => ({ default: m.SkillsStats })));
const ManagedAccounts = lazy(() => import("@/components/ManagedAccounts").then(m => ({ default: m.ManagedAccounts })));
const ToolsWorkflow = lazy(() => import("@/components/ToolsWorkflow").then(m => ({ default: m.ToolsWorkflow })));
const Testimonials = lazy(() => import("@/components/Testimonials").then(m => ({ default: m.Testimonials })));
const Experience = lazy(() => import("@/components/Experience").then(m => ({ default: m.Experience })));
const Blog = lazy(() => import("@/components/Blog").then(m => ({ default: m.Blog })));
const About = lazy(() => import("@/components/About").then(m => ({ default: m.About })));
const Contact = lazy(() => import("@/components/Contact").then(m => ({ default: m.Contact })));
const Footer = lazy(() => import("@/components/Footer").then(m => ({ default: m.Footer })));
const ChatAssistant = lazy(() => import("@/components/ChatAssistant").then(m => ({ default: m.ChatAssistant })));

const Index = () => {
  const [splashDone, setSplashDone] = useState(
    !!sessionStorage.getItem("splash-seen")
  );

  return (
    <>
      {!splashDone && <Suspense fallback={null}><SplashScreen onComplete={() => setSplashDone(true)} /></Suspense>}
      <div className={`min-h-screen ${splashDone ? "animate-fade-in" : "opacity-0"}`}>
        <Suspense fallback={null}><ScrollProgress /></Suspense>
        <Navigation />
        <main>
          <Hero />
          <Suspense fallback={null}>
            <GraphicDesign />
            <PrintMockup />
            <Videos />
            <SocialMediaManagement />
            <CaseStudy />
            <FAQ />
            <SkillsStats />
            <ManagedAccounts />
            <ToolsWorkflow />
            <Testimonials />
            <Experience />
            <Blog />
            <About />
            <Contact />
          </Suspense>
        </main>
        <Suspense fallback={null}>
          <Footer />
          <ChatAssistant />
        </Suspense>
        <BackToTop />
      </div>
    </>
  );
};

export default Index;
