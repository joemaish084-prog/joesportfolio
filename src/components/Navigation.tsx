import { useState, useEffect, useCallback, useRef, lazy, Suspense } from "react";
import { Menu, X, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";

const CVViewer = lazy(() => import("./CVViewer").then(m => ({ default: m.CVViewer })));

const navLinks = [
  { name: "Home", href: "#home" },
  { name: "Videos", href: "#videos" },
  { name: "Media Buying", href: "#media-buying" },
  { name: "Design", href: "#graphic-design" },
  { name: "Social Media", href: "#social-media" },
  { name: "Case Study", href: "#case-study" },
  { name: "Experience", href: "#experience" },
  { name: "About", href: "#about" },
  { name: "Contact", href: "#contact" },
];

export function Navigation() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [cvOpen, setCvOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("home");
  const lastScrollY = useRef(0);

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    const isAtTop = currentScrollY < 50;

    setIsScrolled(!isAtTop);

    if (isAtTop) {
      setIsVisible(true);
    } else if (currentScrollY > lastScrollY.current && currentScrollY > 100) {
      setIsVisible(false);
    } else {
      setIsVisible(true);
    }

    lastScrollY.current = currentScrollY;
  }, []);

  // Use IntersectionObserver for active section detection (avoids forced reflow)
  useEffect(() => {
    const sectionIds = navLinks.map((l) => l.href.replace("#", ""));
    const observers: IntersectionObserver[] = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              setActiveSection(id);
            }
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
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  return (
    <>
      <nav
        aria-label="Main navigation"
        style={{
          transform: isVisible ? 'translateY(0)' : 'translateY(-100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled
            ? "bg-background/80 backdrop-blur-xl border-b border-primary/10 shadow-[0_1px_20px_hsl(var(--primary)/0.08)]"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div
            className={`flex items-center justify-between transition-all duration-300 ${
              isScrolled ? "h-14 sm:h-16" : "h-16 sm:h-20"
            }`}
          >
            <a href="#home" className="text-xl sm:text-2xl font-display font-bold">
              <span className="text-foreground">Joseph</span>
              <span className="text-primary">Maina</span>
            </a>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6 lg:gap-8">
              {navLinks.map((link) => {
                const sectionId = link.href.replace("#", "");
                const isActive = activeSection === sectionId;
                return (
                  <a
                    key={link.name}
                    href={link.href}
                    className={`text-sm font-medium transition-colors duration-200 nav-link-animated pb-1 ${
                      isActive
                        ? "text-primary"
                        : "text-muted-foreground hover:text-primary"
                    }`}
                  >
                    {link.name}
                  </a>
                );
              })}
              <ThemeToggle />
              <Button
                onClick={() => setCvOpen(true)}
                className="shadow-elegant btn-hover bg-primary text-primary-foreground"
              >
                <FileText className="mr-2 h-4 w-4" />
                View CV
              </Button>
            </div>

            {/* Mobile Controls */}
            <div className="flex items-center gap-2 md:hidden">
              <ThemeToggle />
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label={isMobileMenuOpen ? "Close navigation menu" : "Open navigation menu"}
                className="relative z-[80]"
              >
                {isMobileMenuOpen ? (
                  <X className="h-6 w-6" />
                ) : (
                  <Menu className="h-6 w-6" />
                )}
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Full-screen mobile menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[70] md:hidden" style={{ background: "hsl(0 0% 8%)" }}>
          <div className="flex flex-col items-center justify-center h-full w-full gap-7 pt-16">
            {navLinks.map((link) => {
              const sectionId = link.href.replace("#", "");
              const isActive = activeSection === sectionId;
              return (
                <a
                  key={link.name}
                  href={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="text-2xl font-semibold"
                  style={{ color: isActive ? "hsl(25, 100%, 50%)" : "#f5f5f5" }}
                >
                  {link.name}
                </a>
              );
            })}
            <Button
              onClick={() => { setIsMobileMenuOpen(false); setCvOpen(true); }}
              className="mt-2 shadow-elegant bg-primary text-primary-foreground px-8 py-3 text-lg"
            >
              <FileText className="mr-2 h-5 w-5" />
              View CV
            </Button>
          </div>
        </div>
      )}

      <Suspense fallback={null}>
        <CVViewer open={cvOpen} onClose={() => setCvOpen(false)} />
      </Suspense>
    </>
  );
}
