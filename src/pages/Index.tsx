import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { GraphicDesign } from "@/components/GraphicDesign";
import { SocialMediaManagement } from "@/components/SocialMediaManagement";
import { ManagedAccounts } from "@/components/ManagedAccounts";
import { ToolsWorkflow } from "@/components/ToolsWorkflow";
import { ContentLinks } from "@/components/ContentLinks";
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
        <SocialMediaManagement />
        <ManagedAccounts />
        <ToolsWorkflow />
        <ContentLinks />
        <Experience />
        <About />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
