import { Suspense } from "react";
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
  WhatsAppButton,
  Videos,
  GraphicDesign,
  BrandIdentity,
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
} from "./homeSections";

const Index = () => {

  return (
    <>
      <Seo {...STATIC_HEADS.home} />
      <Suspense fallback={null}><ScrollProgress /></Suspense>
      <SiteHeader />
      <main className="min-h-screen">
        <Hero />
        <ExpandCollapseAll />
        {/* Reserve the page's height while the section chunks load. With a null
            fallback the page collapses to the hero, and a visitor who has already
            scrolled the prerendered page lands on empty dark background. */}
        <Suspense fallback={<div aria-hidden style={{ minHeight: "8000px" }} />}>
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
