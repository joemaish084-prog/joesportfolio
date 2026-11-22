import { useRef } from "react";
import { Link } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import { AgencyNavigation, AgencySectionLinks } from "@/components/agency/AgencyNavigation";
import { AgencyHero } from "@/components/agency/AgencyHero";
import { AgencyJourney } from "@/components/agency/AgencyJourney";
import { AgencyProcess } from "@/components/agency/AgencyProcess";
import { CreativeShowcase } from "@/components/agency/AgencyVisuals";
import { MeetBadge } from "@/components/agency/MeetBadge";
import { SubHeading } from "@/components/agency/AgencyPageSections";
import { AuditForm } from "@/components/agency/AuditForm";
import { useStudioMotion } from "@/components/agency/useStudioMotion";
import { BrandsLogoMarquee } from "@/components/BrandsLogoMarquee";
import { Footer } from "@/components/Footer";
import { SectionLabel } from "@/components/SectionLabel";
import { Testimonials } from "@/components/Testimonials";
import { Seo } from "@/components/Seo";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { agencyHomeHead } from "@/seo/agencyHomeHead";
import { AUDIT_WHATSAPP, homeFaqs, homeResults, homeServices } from "@/data/agencyHome";
import { trackSpotlight } from "@/lib/spotlight";
import "@/components/agency/studio.css";

export default function AgencyHome() {
  const root = useRef<HTMLDivElement>(null);
  useStudioMotion(root);

  return (
    <MotionConfig reducedMotion="user">
      <div ref={root} data-agency-home className="agency-page agency-home min-h-screen bg-background">
        <Seo {...agencyHomeHead} />
        <a href="#main-content" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[110] focus:rounded-md focus:bg-background focus:px-4 focus:py-2">Skip to content</a>
        <AgencyNavigation />
        <main id="main-content" tabIndex={-1}>
          <AgencyHero whatsappUrl={AUDIT_WHATSAPP} showAuditLink />

          <section id="agency-results" data-track-location="home_proof" className="container mx-auto scroll-mt-24 px-4 pt-8 sm:pt-16">
            <div className="mx-auto max-w-6xl">
              <SubHeading eyebrow="Campaign proof" title="Tracked campaigns, real numbers"
                aside={<Link className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline" to="/agency/results">All campaign results <ArrowRight className="h-4 w-4" aria-hidden /></Link>} />
              <div className="grid gap-4 md:grid-cols-3">
                {homeResults.map(project => (
                  <Link key={project.id} to={`/work/case-studies#${project.id}`} onMouseMove={trackSpotlight}
                    className="spotlight surface-card group flex h-full flex-col gap-2 p-6 transition-colors hover:border-primary/40">
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">{project.tag} · {project.period}</p>
                    <h3 className="font-display text-lg font-semibold">{project.title}</h3>
                    <p className="mt-2 font-display text-3xl font-bold text-gradient tabular-nums">{project.stats[0].value}</p>
                    <p className="text-sm text-muted-foreground">{project.stats[0].label}</p>
                    <p className="mt-auto border-t border-border/60 pt-3 text-sm text-muted-foreground">
                      <strong className="text-foreground">{project.stats[1].value}</strong> {project.stats[1].label.toLowerCase()}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-primary">View case study <ArrowUpRight className="h-4 w-4" aria-hidden /></span>
                  </Link>
                ))}
              </div>
              <p className="mt-4 text-xs text-muted-foreground">Figures come from the campaigns shown above. Past performance varies by campaign.</p>
            </div>
          </section>
          <BrandsLogoMarquee />

          <section className="container mx-auto overflow-x-clip px-4 py-20" aria-labelledby="agency-meet-title">
            <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-[1fr_1.05fr] lg:gap-16">
              <MeetBadge />
              <div className="space-y-4">
                <SectionLabel>Digital marketing · Nairobi, Kenya</SectionLabel>
                <h2 id="agency-meet-title" className="font-display text-3xl font-bold md:text-4xl">Meet <span className="font-serif font-normal italic text-primary">Joseph</span></h2>
                <p className="leading-relaxed text-muted-foreground">I’m a digital marketing manager based in Nairobi. I work across paid ads, SEO, and content. I’ve worked with brands including iClear, PowWater, and Convey Communications.</p>
                <Button asChild className="rounded-full"><a href="#audit">Book a Free Audit <ArrowUpRight className="h-4 w-4" aria-hidden /></a></Button>
              </div>
            </div>
          </section>

          <section id="agency-services" className="container mx-auto scroll-mt-24 px-4 pb-16">
            <div className="mx-auto max-w-6xl">
              <SubHeading eyebrow="Services" title="Find the right channel"
                aside={<Link to="/agency/services" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline">Full service directory <ArrowRight className="h-4 w-4" aria-hidden /></Link>} />
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {homeServices.map(({ name, path, copy }) => (
                  <li key={name}>
                    <Link to={path} onMouseMove={trackSpotlight} className="spotlight surface-card group flex h-full flex-col p-6 transition-colors hover:border-primary/40">
                      <h3 className="font-display text-lg font-semibold group-hover:text-primary">{name}</h3>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{copy}</p>
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-sm text-muted-foreground">Need help with your store? <Link to="/agency/shopify-services" className="font-semibold text-primary hover:underline">Explore Shopify services</Link>.</p>
            </div>
          </section>

          <AgencyJourney />
          <CreativeShowcase />
          <AgencyProcess id="agency-process" />

          <div id="agency-testimonials" className="scroll-mt-24">
            <Testimonials />
          </div>

          <section id="agency-faq" aria-labelledby="agency-faq-title" className="container mx-auto scroll-mt-24 px-4 py-20">
            <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_1.6fr] lg:gap-16">
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary">FAQ</p>
                <h2 id="agency-faq-title" className="font-display text-3xl font-bold tracking-tight md:text-4xl">Before we talk</h2>
              </div>
              <Accordion type="single" collapsible>
                {homeFaqs.map(({ question, answer }) => (
                  <AccordionItem key={question} value={question}>
                    <AccordionTrigger className="text-left">{question}</AccordionTrigger>
                    <AccordionContent className="text-muted-foreground"><p>{answer}</p></AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </section>

          <section id="audit" aria-labelledby="audit-title" className="scroll-mt-16 border-y border-border/60 bg-muted/30 py-20">
            <div className="container mx-auto px-4">
              <div className="mx-auto grid max-w-6xl items-start gap-8 lg:grid-cols-2 lg:gap-14">
                <div className="space-y-4">
                  <SectionLabel>Free marketing audit</SectionLabel>
                  <h2 id="audit-title" className="font-display text-3xl font-bold tracking-tight md:text-4xl">Where could your next customers come from?</h2>
                  <p className="leading-relaxed text-muted-foreground">Tell me a little about your business. I’ll get in touch to discuss where your ads, website, or tracking could do more for you.</p>
                  <Link className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline" to="/agency/contact">Prefer to book a strategy call? <ArrowRight className="h-4 w-4" aria-hidden /></Link>
                </div>
                <AuditForm />
              </div>
            </div>
          </section>
        </main>
        <div className="container mx-auto px-4 py-10 text-sm text-muted-foreground">
          <AgencySectionLinks className="justify-center" />
        </div>
        <Footer />
        <div className="studio-mobile-audit" data-mobile-audit hidden>
          <Button asChild className="w-full rounded-full"><a href="#audit">Book a Free Audit <ArrowUpRight className="h-4 w-4" aria-hidden /></a></Button>
        </div>
      </div>
    </MotionConfig>
  );
}
