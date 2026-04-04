import { useState, useEffect, useCallback, useRef } from "react";
import { Menu, X, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { motion, AnimatePresence } from "framer-motion";

const navLinks = [
  { name: "Home", href: "#home" },
  { name: "Design", href: "#graphic-design" },
  { name: "Videos", href: "#videos" },
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
  const [activeSection, setActiveSection] = useState("home");
  const lastScrollY = useRef(0);

  const handleScroll = useCallback(() => {
    const currentScrollY = window.scrollY;
    const isAtTop = currentScrollY < 50;

    setIsScrolled(!isAtTop);

    if (isAtTop) {
      setIsVisible(true);
    } else if (currentScrollY > lastScrollY.current && currentScrollY > 80) {
      // Scrolling down
      setIsVisible(false);
    } else {
      // Scrolling up
      setIsVisible(true);
    }

    lastScrollY.current = currentScrollY;

    // Active section detection
    const sections = navLinks.map((l) => l.href.replace("#", ""));
    for (let i = sections.length - 1; i >= 0; i--) {
      const el = document.getElementById(sections[i]);
      if (el) {
        const rect = el.getBoundingClientRect();
        if (rect.top <= 120) {
          setActiveSection(sections[i]);
          break;
        }
      }
    }
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [handleScroll]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [isMobileMenuOpen]);

  return (
    <>
      <motion.nav
        aria-label="Main navigation"
        initial={{ y: 0 }}
        animate={{ y: isVisible ? 0 : -100 }}
        transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
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
            {/* Logo */}
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
              <Button asChild className="shadow-elegant btn-hover bg-primary text-primary-foreground">
                <a href="/Joseph_Isaac_Maina_Resume.pdf" download="Joseph Isaac Maina Resume.pdf">
                  <Download className="mr-2 h-4 w-4" />
                  CV
                </a>
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
                className="relative z-[60]"
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
      </motion.nav>

      {/* Full-screen mobile menu */}
      <div
        className={`fixed inset-0 z-[55] md:hidden flex flex-col items-center justify-center transition-all duration-300 ease-in-out ${
          isMobileMenuOpen
            ? "opacity-100 translate-x-0 pointer-events-auto"
            : "opacity-0 translate-x-full pointer-events-none"
        }`}
        style={{ backgroundColor: "hsl(var(--background))" }}
      >
        <nav className="flex flex-col items-center gap-8">
          {navLinks.map((link) => {
            const sectionId = link.href.replace("#", "");
            const isActive = activeSection === sectionId;
            return (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`text-2xl font-semibold transition-colors duration-200 ${
                  isActive
                    ? "text-primary"
                    : "text-foreground hover:text-primary"
                }`}
              >
                {link.name}
              </a>
            );
          })}
          <Button asChild className="mt-4 shadow-elegant bg-primary text-primary-foreground px-8 py-3 text-lg">
            <a
              href="/Joseph_Isaac_Maina_Resume.pdf"
              download="Joseph Isaac Maina Resume.pdf"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              <Download className="mr-2 h-5 w-5" />
              Download CV
            </a>
          </Button>
        </nav>
      </div>
    </>
  );
}
