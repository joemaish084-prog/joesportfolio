import { lazy } from "react";

// Home page sections live in their own chunks. Kept in a module of their own so
// App can start the downloads at boot, in parallel with the Index chunk, instead
// of only after Index has loaded and rendered.
const loaders = {
  ScrollProgress: () => import("@/components/ScrollProgress").then((m) => ({ default: m.ScrollProgress })),
  BackToTop: () => import("@/components/BackToTop").then((m) => ({ default: m.BackToTop })),
  WhatsAppButton: () => import("@/components/WhatsAppButton").then((m) => ({ default: m.WhatsAppButton })),
  Videos: () => import("@/components/Videos").then((m) => ({ default: m.Videos })),
  GraphicDesign: () => import("@/components/GraphicDesign").then((m) => ({ default: m.GraphicDesign })),
  BrandIdentity: () => import("@/components/BrandIdentity").then((m) => ({ default: m.BrandIdentity })),
  About: () => import("@/components/About").then((m) => ({ default: m.About })),
  ServicesPricing: () => import("@/components/ServicesPricing").then((m) => ({ default: m.ServicesPricing })),
  AgencyPromo: () => import("@/components/AgencyPromo").then((m) => ({ default: m.AgencyPromo })),
  MediaBuying: () => import("@/components/MediaBuying").then((m) => ({ default: m.MediaBuying })),
  SkillsStats: () => import("@/components/SkillsStats").then((m) => ({ default: m.SkillsStats })),
  CaseStudy: () => import("@/components/CaseStudy").then((m) => ({ default: m.CaseStudy })),
  Experience: () => import("@/components/Experience").then((m) => ({ default: m.Experience })),
  Certifications: () => import("@/components/Certifications").then((m) => ({ default: m.Certifications })),
  BrandsLogoMarquee: () => import("@/components/BrandsLogoMarquee").then((m) => ({ default: m.BrandsLogoMarquee })),
  Testimonials: () => import("@/components/Testimonials").then((m) => ({ default: m.Testimonials })),
  FAQ: () => import("@/components/FAQ").then((m) => ({ default: m.FAQ })),
  Contact: () => import("@/components/Contact").then((m) => ({ default: m.Contact })),
  Footer: () => import("@/components/Footer").then((m) => ({ default: m.Footer })),
  ChatAssistant: () => import("@/components/ChatAssistant").then((m) => ({ default: m.ChatAssistant })),
};

export const ScrollProgress = lazy(loaders.ScrollProgress);
export const BackToTop = lazy(loaders.BackToTop);
export const WhatsAppButton = lazy(loaders.WhatsAppButton);
export const Videos = lazy(loaders.Videos);
export const GraphicDesign = lazy(loaders.GraphicDesign);
export const BrandIdentity = lazy(loaders.BrandIdentity);
export const About = lazy(loaders.About);
export const ServicesPricing = lazy(loaders.ServicesPricing);
export const AgencyPromo = lazy(loaders.AgencyPromo);
export const MediaBuying = lazy(loaders.MediaBuying);
export const SkillsStats = lazy(loaders.SkillsStats);
export const CaseStudy = lazy(loaders.CaseStudy);
export const Experience = lazy(loaders.Experience);
export const Certifications = lazy(loaders.Certifications);
export const BrandsLogoMarquee = lazy(loaders.BrandsLogoMarquee);
export const Testimonials = lazy(loaders.Testimonials);
export const FAQ = lazy(loaders.FAQ);
export const Contact = lazy(loaders.Contact);
export const Footer = lazy(loaders.Footer);
export const ChatAssistant = lazy(loaders.ChatAssistant);

/** Begin downloading every section chunk without waiting for a render. */
export const preloadHomeSections = () => {
  Object.values(loaders).forEach((load) => void load().catch(() => {}));
};
