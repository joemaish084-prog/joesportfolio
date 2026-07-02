import { Link } from "react-router-dom";
import { Linkedin, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";

const socialLinks = [
  { name: "LinkedIn", href: "https://www.linkedin.com/in/joseph-isaac-m-33a9a611b/", Icon: Linkedin },
  { name: "Instagram", href: "https://www.instagram.com/m_k_ush_/", Icon: Instagram },
  { name: "Twitter / X", href: "https://x.com/Joemkush15", Icon: Twitter },
];

const portfolioLinks = [
  { name: "About", href: "/#about" },
  { name: "Case Studies", href: "/#case-study" },
  { name: "Experience", href: "/#experience" },
  { name: "Videos", href: "/#videos" },
  { name: "Design Work", href: "/#graphic-design" },
  { name: "Testimonials", href: "/#testimonials" },
];

const agencyServices = [
  { name: "Meta Ads Management", href: "/agency#services" },
  { name: "Google Ads Management", href: "/agency#services" },
  { name: "TikTok Ads Management", href: "/agency#services" },
  { name: "SEO Services", href: "/agency#services" },
  { name: "Social Media Management", href: "/agency#services" },
  { name: "Media Buying", href: "/agency#services" },
  { name: "Book Discovery Call", href: "/agency#contact" },
];

// Behance uses a custom SVG since lucide-react doesn't ship a Behance icon
function BehanceIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M7.5 6.5c1.4 0 2.5 1.1 2.5 2.5 0 .9-.5 1.7-1.2 2.1 1.1.3 1.8 1.3 1.8 2.6 0 1.7-1.3 3-3 3H2V6.5h5.5zM5 8v2.5h2.3c.6 0 1.1-.5 1.1-1.2 0-.7-.5-1.3-1.1-1.3H5zm0 4v3h2.7c.8 0 1.4-.7 1.4-1.5S8.5 12 7.7 12H5zm10-4.8h5v1.3h-5V7.2zM17.5 10c2.5 0 4 1.9 4 4.3 0 .2 0 .4-.1.7h-6.3c.1 1.2 1 2 2.4 2 1 0 1.6-.4 2-1.1h1.9c-.5 1.6-2 2.6-3.9 2.6-2.5 0-4.1-1.7-4.1-4.2S15 10 17.5 10zm-2 3.4h4c-.2-1.1-1-1.9-2-1.9s-1.8.8-2 1.9z" />
    </svg>
  );
}

export function Footer() {
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-border bg-card text-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Column 1 — Brand */}
          <div className="space-y-4">
            <Link to="/" className="text-2xl font-display font-bold inline-block">
              <span className="text-foreground">Joseph</span>
              <span className="text-primary">Maina</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Digital Marketing Specialist &amp; Agency Owner based in Nairobi, Kenya.
            </p>
            <div className="flex items-center gap-3 pt-1">
              {socialLinks.map(({ name, href, Icon }) => (
                <a
                  key={name}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={name}
                  className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
              <a
                href="https://www.behance.net/joemaish"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Behance"
                className="w-9 h-9 rounded-full border border-border flex items-center justify-center text-muted-foreground hover:text-primary hover:border-primary transition-colors"
              >
                <BehanceIcon className="w-4 h-4" />
              </a>
            </div>
            <p className="text-xs text-muted-foreground pt-2">
              © {year} Joseph Maina. All rights reserved.
            </p>
          </div>

          {/* Column 2 — Portfolio */}
          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
              Portfolio
            </h3>
            <ul className="space-y-2.5">
              {portfolioLinks.map((l) => (
                <li key={l.name}>
                  <a
                    href={l.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {l.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — Agency Services */}
          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
              Agency Services
            </h3>
            <ul className="space-y-2.5">
              {agencyServices.map((l) => (
                <li key={l.name}>
                  <Link
                    to={l.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {l.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4 — Legal & Contact */}
          <div>
            <h3 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
              Legal &amp; Contact
            </h3>
            <ul className="space-y-2.5 mb-5">
              <li>
                <Link to="/privacy-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/cookie-policy" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Cookie Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="text-sm text-muted-foreground hover:text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
            <ul className="space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                <a href="mailto:joemaish084@gmail.com" className="hover:text-primary transition-colors break-all">
                  joemaish084@gmail.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <Phone className="w-4 h-4 mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                <a href="tel:+254704700160" className="hover:text-primary transition-colors">
                  +254 704 700 160
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-primary" aria-hidden="true" />
                <span>Nairobi, Kenya</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-muted-foreground">
          <p>
            <a href="https://www.josephmaina.co.ke" className="hover:text-primary transition-colors">
              josephmaina.co.ke
            </a>{" "}
            | Digital Marketing Agency Nairobi, Kenya
          </p>
          <p>Built &amp; maintained by Joseph Isaac Maina</p>
        </div>

        <div className="mt-6 text-xs text-muted-foreground text-center max-w-3xl mx-auto leading-relaxed">
          Joseph Maina — Digital Marketing Specialist in Nairobi, Kenya. Offering Meta Ads, Google Ads, TikTok Ads, SEO, Social Media Management and Media Buying services across Kenya and Africa.
        </div>
      </div>
    </footer>
  );
}
