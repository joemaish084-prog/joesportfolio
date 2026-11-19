import { useRef } from "react";
import { Link } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import { BarChart3, Compass, Globe2, Megaphone, Play, Users, ChevronDown } from "lucide-react";
import { AgencyNavigation, AgencySectionLinks } from "@/components/agency/AgencyNavigation";
import { AuditForm } from "@/components/agency/AuditForm";
import { useStudioMotion } from "@/components/agency/useStudioMotion";
import { BrandsLogoMarquee } from "@/components/BrandsLogoMarquee";
import { Testimonials } from "@/components/Testimonials";
import { Seo } from "@/components/Seo";
import { agencyHomeHead } from "@/seo/agencyHomeHead";
import { AUDIT_WHATSAPP, homeFaqs, homeProcess, homeResults, homeServices } from "@/data/agencyHome";
import { agencyHeroPhoto } from "@/data/agencyHeroMedia";
import metaImage from "@/assets/services/svc-meta-ads-400.webp";
import googleImage from "@/assets/services/svc-google-ads-400.webp";
import leadImage from "@/assets/services/svc-social-400.webp";
import "@/components/agency/studio.css";

const serviceIcons = [Megaphone, Compass, Play, Globe2, Users, BarChart3];
const resultImages = {
  "meta-google-combined": metaImage,
  "property-lead-funnel": leadImage,
  "google-ads-launch": googleImage,
};
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
              <a href="#audit" className="studio-button studio-button-primary" data-magnetic>Book a Free Audit</a>
            </div>
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
          </div>
        </section>

        <section className="studio-section studio-proof" aria-labelledby="agency-proof" data-track-location="home_proof">
          <div className="studio-container">
            <div data-reveal className="studio-section-heading">
              <p className="studio-kicker">Campaign proof</p>
              <h2 id="agency-proof">Measured in sales and enquiries.</h2>
            </div>
            <dl className="studio-metrics">
              {proof.map(({ value, label, context }) => (
                <div key={label} data-reveal>
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

        <section id="agency-services" className="studio-section" aria-labelledby="agency-services-title">
          <div className="studio-container">
            <div className="studio-section-heading studio-heading-with-link" data-reveal>
              <div><p className="studio-kicker">Services</p><h2 id="agency-services-title">Find the right channel.</h2></div>
              <Link className="studio-text-link" to="/agency/services">Full service directory</Link>
            </div>
            <ul className="studio-service-grid">
              {homeServices.map(({ name, path, copy }, index) => {
                const Icon = serviceIcons[index];
                return <li key={name} data-reveal><Link to={path}>
                  <Icon size={24} strokeWidth={1.6} aria-hidden />
                  <h3>{name}</h3><p>{copy}</p>
                </Link></li>;
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
            <ol className="studio-process-list">
              {homeProcess.map(({ name, copy }) => <li key={name} data-reveal><h3>{name}</h3><p>{copy}</p></li>)}
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
                    <img src={resultImages[project.id as keyof typeof resultImages]} width={400} height={251} alt="" loading="lazy" decoding="async" />
                    <div className="studio-case-body">
                      <p className="studio-kicker">{project.tag} · {project.period}</p>
                      <h3>{project.title}</h3>
                      <p>{project.stats[1].value} {project.stats[1].label.toLowerCase()}</p>
                      <span className="studio-text-link">Read case study</span>
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
            <div className="studio-faq">
              {homeFaqs.map(({ question, answer }) => (
                <details key={question} data-reveal>
                  <summary>{question}<ChevronDown size={19} aria-hidden /></summary>
                  <p>{answer}</p>
                </details>
              ))}
            </div>
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
      <div className="studio-cursor" aria-hidden />
    </div>
    </MotionConfig>
  );
}
