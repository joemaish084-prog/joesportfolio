import { Navigation } from "@/components/Navigation";
import { Hero } from "@/components/Hero";
import { GraphicDesign } from "@/components/GraphicDesign";
import { MotionDesign } from "@/components/MotionDesign";
import { SocialMediaManagement } from "@/components/SocialMediaManagement";
import { ManagedAccounts } from "@/components/ManagedAccounts";
import { VideoProduction } from "@/components/VideoProduction";
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
        <MotionDesign />
        <SocialMediaManagement />
        <ManagedAccounts />
        <VideoProduction />
        <About />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
