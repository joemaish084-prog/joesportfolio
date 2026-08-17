import { useState, useEffect, lazy, Suspense } from "react";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import PillNav from "./PillNav.jsx";
import StaggeredMenu from "./StaggeredMenu.jsx";

const CVViewer = lazy(() => import("./CVViewer").then(m => ({ default: m.CVViewer })));

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Videos", href: "#videos" },
  { label: "Design", href: "#graphic-design" },
  { label: "Cases", href: "#case-study" },
  { label: "Experience", href: "#experience" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

export function Navigation() {
  const [cvOpen, setCvOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeHref, setActiveHref] = useState("#home");

  // Active section via IntersectionObserver
  useEffect(() => {
    const observers: IntersectionObserver[] = [];
    navLinks.forEach((link) => {
      const id = link.href.replace("#", "");
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) setActiveHref(`#${id}`);
          });
        },
        { rootMargin: "-50% 0px -50% 0px", threshold: 0 }
      );
      observer.observe(el);
      observers.push(observer);
    });
    return () => observers.forEach((o) => o.disconnect());
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileMenuOpen]);

  return (
    <>
      <div className="pill-nav-container">
        <div className="pill-nav-wrap">
          <PillNav
            logo=""
            logoAlt="Joseph Maina"
            initialLoadAnimation
            activeHref={activeHref}
            baseColor="#0a0a0a"
            pillColor="#F97316"
            pillTextColor="#ffffff"
            hoveredPillTextColor="#ffffff"
            ease="power3.out"
            items={navLinks}
            mobileMenuOpen={mobileMenuOpen}
            onMobileMenuClick={() => setMobileMenuOpen((v) => !v)}
            onNavigate={() => setMobileMenuOpen(false)}
          />

          <div className="pill-nav-side">
            <ThemeToggle />
            <a
              href="/agency"
              className="text-xs font-semibold px-3 py-1.5 rounded-full bg-gradient-orange text-white shadow-[var(--shadow-orange-glow)] hover:brightness-110 transition"
            >
              Agency
            </a>
            <Button
              size="sm"
              onClick={() => setCvOpen(true)}
              className="shadow-elegant btn-hover bg-primary text-primary-foreground rounded-full h-9"
            >
              <FileText className="mr-1.5 h-4 w-4" />
              View CV
            </Button>
          </div>
        </div>

        {/* Mobile menu popover */}
        <div className={`mobile-menu-popover mobile-only ${mobileMenuOpen ? "open" : ""}`}>
          <ul className="mobile-menu-list">
            {navLinks.map((link) => (
              <li key={link.href}>
                <a
                  href={link.href}
                  className="mobile-menu-link"
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.querySelector(link.href);
                    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                    setMobileMenuOpen(false);
                  }}
                >
                  {link.label}
                </a>
              </li>
            ))}
            <li>
              <a href="/agency" className="mobile-menu-link">Agency</a>
            </li>
            <li>
              <a
                href="#"
                className="mobile-menu-link"
                onClick={(e) => { e.preventDefault(); setMobileMenuOpen(false); setCvOpen(true); }}
              >
                View CV
              </a>
            </li>
          </ul>
        </div>
      </div>

      {/* Mobile-only StaggeredMenu */}
      <div className="mobile-staggered-menu">
        {/* @ts-expect-error jsx component */}
        <StaggeredMenu
          position="right"
          isFixed
          displaySocials
          displayItemNumbering
          menuButtonColor="#ffffff"
          openMenuButtonColor="#ffffff"
          accentColor="#F97316"
          colors={["#1a1a1a", "#0a0a0a"]}
          logoUrl=""
          items={[
            ...navLinks.map((l) => ({ label: l.label, link: l.href, ariaLabel: l.label })),
            { label: "Agency", link: "/agency", ariaLabel: "Agency" },
          ]}
          socialItems={[
            { label: "Instagram", link: "https://instagram.com" },
            { label: "LinkedIn", link: "https://linkedin.com" },
            { label: "TikTok", link: "https://tiktok.com" },
          ]}
          onItemClick={() => setMobileMenuOpen(false)}
        />
      </div>

      {/* Push content below fixed navbar */}
      <div aria-hidden style={{ height: 80 }} />

      <Suspense fallback={null}>
        <CVViewer open={cvOpen} onClose={() => setCvOpen(false)} />
      </Suspense>
    </>
  );
}
