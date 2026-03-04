import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { GraphicDesign } from "@/components/GraphicDesign";
import { Videos } from "@/components/Videos";
import { SocialMediaManagement } from "@/components/SocialMediaManagement";
import { CaseStudy } from "@/components/CaseStudy";
import { ManagedAccounts } from "@/components/ManagedAccounts";
import { ToolsWorkflow } from "@/components/ToolsWorkflow";

import { Experience } from "@/components/Experience";
import { About } from "@/components/About";
import { Contact } from "@/components/Contact";
import { Footer } from "@/components/Footer";

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
        <ManagedAccounts />
        <ToolsWorkflow />
        
        <Experience />
        <About />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
