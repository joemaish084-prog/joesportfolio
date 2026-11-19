import { useRef, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { ArrowUpRight, BarChart3, Compass, Globe2, Megaphone, Play, TrendingUp, Users } from "lucide-react";
import { AgencyNavigation, AgencySectionLinks } from "@/components/agency/AgencyNavigation";
import { AuditForm } from "@/components/agency/AuditForm";
import { useStudioMotion } from "@/components/agency/useStudioMotion";
import { BrandsLogoMarquee } from "@/components/BrandsLogoMarquee";
import { Testimonials } from "@/components/Testimonials";
import { Seo } from "@/components/Seo";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { agencyHomeHead } from "@/seo/agencyHomeHead";
import { AUDIT_WHATSAPP, homeFaqs, homeProcess, homeResults, homeServices } from "@/data/agencyHome";
import { agencyHeroPhoto } from "@/data/agencyHeroMedia";
import portraitSmall from "@/assets/responsive/1-joseph-maina-portrait-240.webp";
import portrait from "@/assets/responsive/1-joseph-maina-portrait-480.webp";
import "@/components/agency/studio.css";

const serviceIcons = [Megaphone, Compass, Play, Globe2, Users, BarChart3];
const serviceOutcomes = [
  "Trackable sales and enquiries",
  "Traffic from people already searching",
  "Clear post-click performance",
  "Better visibility in local search",
  "Content that answers customer questions",
  "Spending guided by campaign results",
];
const proof = [
  { value: homeResults[0].stats[0].value, label: "Attributed revenue", context: "A Kenyan beauty retailer" },
  { value: homeResults[0].stats[1].value, label: "Return on ad spend", context: "Meta Ads and Google Ads" },
  { value: homeResults[1].stats[0].value, label: "Property enquiries", context: "A Kenyan residential development" },
];

export default function AgencyHome() {
  const root = useRef<HTMLDivElement>(null);
  useStudioMotion(root);
  return (
    <MotionConfig reducedMotion="user">
    <div ref={root} className="studio studio-agency">
      <Seo {...agencyHomeHead} />
      <a href="#main-content" className="studio-skip">Skip to content</a>
      <AgencyNavigation home />
      <main id="main-content" tabIndex={-1}>
        <section className="studio-hero" aria-labelledby="agency-heading" data-track-location="hero">
          <div className="studio-container studio-hero-layout">
            <div className="studio-hero-copy">
              <p className="studio-kicker"><span aria-hidden /> Joseph Maina Marketing · Nairobi, Kenya</p>
              <h1 id="agency-heading"><span>Make your marketing</span> <em>bring in more sales.</em></h1>
              <p className="studio-hero-intro">I’m Joseph Maina. My Nairobi digital marketing agency helps Kenyan and African businesses get more sales and enquiries through paid ads, SEO, and social media.</p>
              <Button asChild className="studio-button studio-button-primary"><a href="#audit" data-magnetic>Book a Free Audit <ArrowUpRight size={17} aria-hidden /></a></Button>
            </div>
            <div className="studio-hero-visual">
            <figure className="studio-hero-photo" data-studio-cursor>
              <div className="studio-photo-mask">
                <picture>
                  <source type="image/avif" media={agencyHeroPhoto.mobileMedia} sizes={agencyHeroPhoto.mobileSizes}
                    srcSet={agencyHeroPhoto.avif} />
                  <img src={agencyHeroPhoto.src} srcSet={agencyHeroPhoto.srcSet}
                    sizes={agencyHeroPhoto.sizes} width={720} height={600}
                    alt="The iClear team with students and teachers at the Baobab School water purifier handover" {...{ fetchpriority: "high" }} decoding="async" />
                </picture>
              </div>
              <figcaption><span>iClear Kenya</span><Link to="/agency/blog/how-i-landed-national-press-coverage-for-iclear">Baobab School campaign</Link></figcaption>
            </figure>
            <Card className="studio-hero-result studio-glow-card" role="group" aria-label="Combined Meta Ads and Google Ads case study">
              <TrendingUp size={19} aria-hidden />
              <div><strong>{proof[0].value}</strong><span>Attributed revenue</span></div>
              <div><strong>{proof[1].value}</strong><span>ROAS</span></div>
            </Card>
            </div>
          </div>
        </section>

        <section className="studio-section studio-proof" aria-labelledby="agency-proof" data-track-location="home_proof">
          <div className="studio-container">
            <div data-reveal className="studio-section-heading">
              <p className="studio-kicker">Campaign proof</p>
              <h2 id="agency-proof">Measured in sales and enquiries.</h2>
            </div>
            <dl className="studio-metrics">
              {proof.map(({ value, label, context }, index) => (
                <div key={label} className="studio-glow-card" data-reveal style={{ "--reveal-delay": `${index * 65}ms` } as CSSProperties}>
                  <dt>{label}</dt>
                  <dd className="studio-stat"><span className="sr-only">{value}</span><span data-count={value} aria-hidden>{value}</span></dd>
                  <dd className="studio-stat-note">{context}</dd>
                </div>
              ))}
            </dl>
            <p className="studio-footnote">Figures come from the campaigns shown below. Past performance varies by campaign.</p>
            <BrandsLogoMarquee compact />
          </div>
        </section>

        <section className="studio-section studio-meet" aria-labelledby="agency-meet-title">
          <div className="studio-container studio-meet-layout">
            <figure className="studio-portrait" data-reveal>
              <img src={portrait} srcSet={`${portraitSmall} 240w, ${portrait} 480w`}
                sizes="(min-width: 900px) 280px, 65vw" width={480} height={480}
                alt="Portrait of Joseph Maina" loading="lazy" decoding="async" />
            </figure>
            <div className="studio-section-heading" data-reveal>
              <p className="studio-kicker">Digital marketing · Nairobi, Kenya</p>
              <h2 id="agency-meet-title">Meet Joseph.</h2>
              <p>I’m a digital marketing manager based in Nairobi.<br />I work across paid ads, SEO, and content.<br />I’ve worked with brands including iClear, PowWater, and Convey Communications.</p>
              <Button asChild className="studio-button studio-button-primary"><a href="#audit" data-magnetic>Book a Free Audit <ArrowUpRight size={17} aria-hidden /></a></Button>
            </div>
          </div>
        </section>

        <section id="agency-services" className="studio-section" aria-labelledby="agency-services-title">
          <div className="studio-container">
            <div className="studio-section-heading studio-heading-with-link" data-reveal>
              <div><p className="studio-kicker">Services</p><h2 id="agency-services-title">Find the right channel.</h2></div>
              <Link className="studio-text-link" to="/agency/services">Full service directory</Link>
            </div>
            <ul className="studio-service-grid">
              {homeServices.map(({ name, path, copy }, index) => {
                const Icon = serviceIcons[index];
                return <li key={name} data-reveal style={{ "--reveal-delay": `${(index % 3) * 65}ms` } as CSSProperties}>
                  <Link to={path}><Card className="studio-service-card studio-glow-card">
                    <Icon size={29} strokeWidth={1.6} aria-hidden />
                    <h3>{name}</h3><p>{copy}</p>
                    <span className="studio-service-outcome">{serviceOutcomes[index]}</span>
                  </Card></Link>
                </li>;
              })}
            </ul>
            <p className="studio-section-note">Need help with your store? <Link to="/agency/shopify-services">Explore Shopify services</Link>.</p>
          </div>
        </section>

        <section id="agency-process" className="studio-section studio-process" aria-labelledby="agency-process-title">
          <div className="studio-container studio-split">
            <div className="studio-section-heading" data-reveal>
              <p className="studio-kicker">Process</p>
              <h2 id="agency-process-title">Know where your budget goes.</h2>
              <p>Work directly with me from the first conversation through to reporting.</p>
            </div>
            <ol className="studio-process-list" data-timeline>
              {homeProcess.map(({ name, copy }, index) => (
                <li key={name} data-reveal>
                  <span className="studio-step" aria-hidden>{String(index + 1).padStart(2, "0")}</span>
                  <h3>{name}</h3><p>{copy}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <section id="agency-results" className="studio-section" aria-labelledby="agency-results-title">
          <div className="studio-container">
            <div className="studio-section-heading studio-heading-with-link" data-reveal>
              <div><p className="studio-kicker">Selected case studies</p><h2 id="agency-results-title">The work behind the numbers.</h2></div>
              <Link to="/agency/results" className="studio-text-link">All campaign results</Link>
            </div>
            <div className="studio-case-grid">
              {homeResults.map(project => (
                <article key={project.id} data-reveal data-studio-cursor>
                  <Link to={`/work/case-studies#${project.id}`}>
                    <div className="studio-case-image">
                      <img src={project.cover.src} width={840} height={473} alt={project.cover.alt} loading="lazy" decoding="async" />
                      <span className="studio-case-badge">{project.stats[1].value} {project.id === "property-lead-funnel" ? "hot buyers" : "ROAS"}</span>
                    </div>
                    <div className="studio-case-body">
                      <p className="studio-kicker">{project.tag} · {project.period}</p>
                      <h3>{project.title}</h3>
                      <p>{project.stats[1].value} {project.stats[1].label.toLowerCase()}</p>
                      <span className="studio-text-link">View case study <ArrowUpRight size={16} aria-hidden /></span>
                    </div>
                  </Link>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="agency-testimonials" className="studio-section studio-testimonials" aria-labelledby="agency-testimonials-title">
          <div className="studio-container">
            <div className="studio-section-heading" data-reveal>
              <p className="studio-kicker">Testimonials</p><h2 id="agency-testimonials-title">What clients say.</h2>
            </div>
            <Testimonials compact />
          </div>
        </section>

        <section id="agency-faq" className="studio-section" aria-labelledby="agency-faq-title">
          <div className="studio-container studio-split">
            <div className="studio-section-heading" data-reveal><p className="studio-kicker">FAQ</p><h2 id="agency-faq-title">Before we talk.</h2></div>
            <Accordion type="single" collapsible className="studio-faq" data-reveal>
              {homeFaqs.map(({ question, answer }) => (
                <AccordionItem key={question} value={question}>
                  <AccordionTrigger>{question}</AccordionTrigger>
                  <AccordionContent><p>{answer}</p></AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>

        <section id="audit" className="studio-section studio-audit" aria-labelledby="audit-title">
          <div className="studio-container studio-split">
            <div className="studio-section-heading" data-reveal>
              <p className="studio-kicker">Free marketing audit</p>
              <h2 id="audit-title">Where could your next customers come from?</h2>
              <p>Tell me a little about your business. I’ll get in touch to discuss where your ads, website, or tracking could do more for you.</p>
              <Link className="studio-text-link" to="/agency/contact">Prefer to book a strategy call?</Link>
            </div>
            <AuditForm />
          </div>
        </section>
      </main>
      <footer className="studio-footer">
        <div className="studio-container">
          <AgencySectionLinks />
          <div className="studio-footer-row">
            <span>© {new Date().getFullYear()} Joseph Maina Marketing</span>
            <Link to="/agency/overview">Agency overview</Link>
            <Link to="/privacy-policy">Privacy</Link>
            <Link to="/cookie-policy">Cookies</Link>
            <Link to="/terms">Terms</Link>
            <a href={AUDIT_WHATSAPP} target="_blank" rel="noopener noreferrer">WhatsApp</a>
          </div>
        </div>
      </footer>
      <div className="studio-mobile-audit" data-mobile-audit hidden>
        <Button asChild className="studio-button studio-button-primary"><a href="#audit">Book a Free Audit <ArrowUpRight size={18} aria-hidden /></a></Button>
      </div>
      <div className="studio-cursor" aria-hidden />
    </div>
    </MotionConfig>
  );
}
