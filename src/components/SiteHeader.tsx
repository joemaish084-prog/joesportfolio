import { useState, useEffect, useRef, useCallback, lazy, Suspense } from "react";
import { createPortal } from "react-dom";
import { FileText, Menu, X } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";

const CVViewer = lazy(() => import("./CVViewer").then((m) => ({ default: m.CVViewer })));

const navLinks = [
  { label: "Home", href: "#home" },
  { label: "Videos", href: "#videos" },
  { label: "Design", href: "#graphic-design" },
  { label: "Cases", href: "#case-study" },
  { label: "Experience", href: "#experience" },
  { label: "About", href: "#about" },
  { label: "Contact", href: "#contact" },
];

function Logo({ onClick }: { onClick?: (e: React.MouseEvent) => void }) {
  return (
    <a href="#home" onClick={onClick} className="flex items-center gap-2.5 shrink-0">
      <span className="h-8 w-8 rounded-full bg-foreground text-background flex items-center justify-center text-xs font-bold tracking-wide">
        JM
      </span>
      <span className="font-display font-semibold text-base text-foreground">Joseph Maina</span>
    </a>
  );
}

export function SiteHeader() {
  const [cvOpen, setCvOpen] = useState(false);
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeHref, setActiveHref] = useState("#home");
  const reduceMotion = useReducedMotion();

  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Scroll state
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY >= 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Active section
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

  // Body scroll lock + escape + focus management
  useEffect(() => {
    if (!open) return;
    document.body.style.overflow = "hidden";
    const prev = hamburgerRef.current;
    const t = window.setTimeout(() => closeRef.current?.focus(), 30);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
        return;
      }
      if (e.key === "Tab" && panelRef.current) {
        const focusables = panelRef.current.querySelectorAll<HTMLElement>(
          'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'
        );
        if (!focusables.length) return;
        const first = focusables[0];
        const last = focusables[focusables.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      document.removeEventListener("keydown", onKeyDown);
      window.clearTimeout(t);
      prev?.focus();
    };
  }, [open]);

  // Close on desktop breakpoint
  useEffect(() => {
    const mql = window.matchMedia("(min-width: 1024px)");
    const onChange = () => mql.matches && setOpen(false);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  const handleAnchor = useCallback((e: React.MouseEvent, href: string) => {
    if (!href.startsWith("#")) return;
    e.preventDefault();
    setOpen(false);
    const el = document.querySelector(href);
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  const navLinkClass = "text-sm font-medium transition-colors";

  return (
    <>
      <header
        className={`fixed top-0 inset-x-0 z-50 h-14 lg:h-16 transition-all duration-200 ${
          scrolled
            ? "bg-background/70 backdrop-blur-xl border-b border-border/60 shadow-sm"
            : "bg-transparent border-b border-transparent"
        }`}
      >
        <div className="container mx-auto px-6 h-full flex items-center justify-between gap-4">
          <Logo onClick={(e) => handleAnchor(e, "#home")} />

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-7" aria-label="Primary">
            {navLinks.map((link) => {
              const isActive = activeHref === link.href;
              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleAnchor(e, link.href)}
                  aria-current={isActive ? "true" : undefined}
                  className={`relative ${navLinkClass} ${
                    isActive ? "text-primary" : "text-foreground/70 hover:text-foreground"
                  }`}
                >
                  {link.label}
                  <span
                    className={`pointer-events-none absolute -bottom-1.5 left-0 h-[2px] bg-primary origin-left transition-transform duration-[250ms] ease-out w-full ${
                      isActive ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </a>
              );
            })}
          </nav>

          {/* Desktop right */}
          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />
            <a href="/agency" className={`${navLinkClass} text-foreground/70 hover:text-foreground`}>
              Agency
            </a>
            <Button
              size="sm"
              onClick={() => setCvOpen(true)}
              className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <FileText className="mr-1.5 h-4 w-4" />
              View CV
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            ref={hamburgerRef}
            type="button"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
            aria-expanded={open}
            aria-controls="mobile-nav"
            className="lg:hidden h-11 w-11 rounded-full text-foreground inline-flex items-center justify-center"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>
      </header>

      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              id="mobile-nav"
              role="dialog"
              aria-modal="true"
              aria-label="Site menu"
              ref={panelRef}
              className="fixed inset-0 z-[100] bg-background lg:hidden overflow-y-auto"
              initial={reduceMotion ? { opacity: 0 } : { x: "100%" }}
              animate={reduceMotion ? { opacity: 1 } : { x: 0 }}
              exit={reduceMotion ? { opacity: 0 } : { x: "100%" }}
              transition={reduceMotion ? { duration: 0.12 } : { duration: 0.26, ease: "easeOut" }}
            >
              <div className="h-14 px-6 flex items-center justify-between">
                <Logo onClick={(e) => handleAnchor(e, "#home")} />
                <button
                  ref={closeRef}
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Close menu"
                  aria-expanded={open}
                  aria-controls="mobile-nav"
                  className="h-11 w-11 rounded-full text-foreground inline-flex items-center justify-center"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="px-6 pt-4 pb-10">
                {navLinks.map((link, i) => (
                  <motion.a
                    key={link.href}
                    href={link.href}
                    onClick={(e) => handleAnchor(e, link.href)}
                    initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                    animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                    transition={reduceMotion ? undefined : { delay: i * 0.04, duration: 0.2 }}
                    className={`block py-3 min-h-[44px] text-2xl font-display font-semibold ${
                      activeHref === link.href ? "text-primary" : "text-foreground"
                    }`}
                  >
                    {link.label}
                  </motion.a>
                ))}

                <div className="border-t border-border my-4" />

                <a
                  href="/agency"
                  className="block py-3 min-h-[44px] text-2xl font-display font-semibold text-foreground"
                >
                  Agency
                </a>

                <Button
                  onClick={() => {
                    setOpen(false);
                    setCvOpen(true);
                  }}
                  className="mt-4 w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <FileText className="mr-2 h-4 w-4" />
                  View CV
                </Button>

                <div className="mt-6 flex items-center gap-2">
                  <ThemeToggle />
                  <span className="text-base font-medium text-foreground">Theme</span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}

      <Suspense fallback={null}>
        <CVViewer open={cvOpen} onClose={() => setCvOpen(false)} />
      </Suspense>
    </>
  );
}
