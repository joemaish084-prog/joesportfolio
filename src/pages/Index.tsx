import { lazy, Suspense } from "react";
import { SiteHeader } from "@/components/SiteHeader";
import { CollapsibleWrapper } from "@/components/CollapsibleWrapper";
import { ExpandCollapseAll } from "@/components/ExpandCollapseAll";
import { PressFeatures } from "@/components/PressFeatures";
import { Video, Palette, BarChart3, Briefcase, HelpCircle } from "lucide-react";
import { Hero } from "@/components/Hero";
import { Seo } from "@/components/Seo";

// Lazy-load non-critical above-the-fold utilities
const ScrollProgress = lazy(() => import("@/components/ScrollProgress").then(m => ({ default: m.ScrollProgress })));
const BackToTop = lazy(() => import("@/components/BackToTop").then(m => ({ default: m.BackToTop })));
const WhatsAppButton = lazy(() => import("@/components/WhatsAppButton").then(m => ({ default: m.WhatsAppButton })));

// Lazy-load below-the-fold components to reduce main-thread blocking
const Videos = lazy(() => import("@/components/Videos").then(m => ({ default: m.Videos })));
const GraphicDesign = lazy(() => import("@/components/GraphicDesign").then(m => ({ default: m.GraphicDesign })));
const BrandIdentity = lazy(() => import("@/components/BrandIdentity").then(m => ({ default: m.BrandIdentity })));
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

  return (
    <>
      <Seo
        title="Joseph Maina | Digital Marketing Specialist Nairobi | Meta Ads, Google Ads & SEO Kenya"
        description="Digital Marketing Specialist in Nairobi, Kenya. Expert in Meta Ads, Google Ads, TikTok, SEO & Social Media. Real results for Kenyan brands. Book a free strategy call today."
        path="/"
      />
      <Suspense fallback={null}><ScrollProgress /></Suspense>
      <SiteHeader />
      <main className="min-h-screen">
        <Hero />
        <ExpandCollapseAll />
        <Suspense fallback={null}>
          <CollapsibleWrapper id="case-study" title="Case Studies" Icon={BarChart3} count="Featured" defaultOpenOnMobile>
            <CaseStudy />
          </CollapsibleWrapper>
          <CollapsibleWrapper id="videos" title="Video Production" Icon={Video} count="15 Videos" defaultOpenOnMobile>
            <Videos />
          </CollapsibleWrapper>
          <CollapsibleWrapper id="graphic-design" title="Graphic Design" Icon={Palette} count="Gallery">
            <GraphicDesign />
          </CollapsibleWrapper>
          <BrandIdentity />
          <About />
          <PressFeatures />
          <ServicesPricing />
          <AgencyPromo />
          <MediaBuying />
          <SkillsStats />
          <CollapsibleWrapper id="experience" title="Experience" Icon={Briefcase} count="Timeline">
            <Experience />
          </CollapsibleWrapper>
          <Certifications />
          <BrandsLogoMarquee />
          <Testimonials />
          <CollapsibleWrapper id="faq" title="FAQ" Icon={HelpCircle} count="15 Questions">
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
