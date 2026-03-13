import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { GraphicDesign } from "@/components/GraphicDesign";
import { Videos } from "@/components/Videos";
import { SocialMediaManagement } from "@/components/SocialMediaManagement";
import { CaseStudy } from "@/components/CaseStudy";
import { FAQ } from "@/components/FAQ";
import { SkillsStats } from "@/components/SkillsStats";
import { ManagedAccounts } from "@/components/ManagedAccounts";
import { ToolsWorkflow } from "@/components/ToolsWorkflow";
import { Testimonials } from "@/components/Testimonials";
import { Experience } from "@/components/Experience";
import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";
import { ChatAssistant } from "@/components/ChatAssistant";

const Index = () => {
  return (
    <div className="min-h-screen">
      <Navigation />
      <main>
        <Hero />
        <GraphicDesign />
        <Videos />
        <SocialMediaManagement />
        <CaseStudy />
        <FAQ />
        <SkillsStats />
        <ManagedAccounts />
        <ToolsWorkflow />
        <Testimonials />
        <Experience />
        <About />
        <Contact />
      </main>
      <Footer />
      <ChatAssistant />
    </div>
  );
};

export default Index;
