import { useState, useEffect, useRef, useCallback, lazy, Suspense } from "react";
import { createPortal } from "react-dom";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown, FileText, Menu, X } from "lucide-react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "./ThemeToggle";
import { caseStudies } from "@/data/caseStudies";

const CVViewer = lazy(() => import("./CVViewer").then((m) => ({ default: m.CVViewer })));

interface NavChild {
  label: string;
  href: string;
  /** Small label above the title (case study tag). */
  eyebrow?: string;
  description?: string;
  badge?: string;
}

interface NavLink {
  label: string;
  href: string;
  children?: NavChild[];
  /** "View all" link at the bottom of the dropdown. */
  footer?: { label: string; href: string };
}

const navLinks: NavLink[] = [
  { label: "Home", href: "/#home" },
  {
    label: "Videos",
    href: "/#videos",
    children: [
      { label: "Long form", description: "Brand films, interviews and documentaries", href: "/work/videos?type=long" },
      { label: "Short form", description: "Reels and social clips", href: "/work/videos?type=short" },
    ],
    footer: { label: "All videos", href: "/work/videos" },
  },
  {
    label: "Design",
    href: "/#graphic-design",
    children: [
      { label: "Graphics", description: "Campaign creatives and social designs", href: "/work/design" },
      { label: "Branding", description: "Logo, colour, type and brand systems", badge: "New", href: "/work/branding" },
    ],
  },
  {
    label: "Cases",
    href: "/#case-study",
    children: caseStudies.map((cs) => ({
      label: cs.title,
      eyebrow: cs.tag,
      href: `/work/case-studies#${cs.id}`,
    })),
    footer: { label: "All case studies", href: "/work/case-studies" },
  },
  // Topic hubs are listed by hand rather than imported from the blog data, which
  // is too large to load with the header on every page.
  {
    label: "Blog",
    href: "/agency/blog",
    children: [
      { label: "Meta Ads", description: "Budgets, creative testing and costly mistakes", href: "/agency/blog/topics/meta-ads" },
      { label: "Google Ads & Search", description: "Costs, setup and when search beats social", href: "/agency/blog/topics/google-ads" },
      { label: "Local SEO for Nairobi", description: "Getting found on Google and Maps", href: "/agency/blog/topics/local-seo" },
      { label: "Lead Generation", description: "Turning clicks into enquiries and sales", href: "/agency/blog/topics/lead-generation" },
      { label: "TikTok & Social", description: "Short-form video and platform choice", href: "/agency/blog/topics/tiktok-and-social" },
    ],
    footer: { label: "All articles", href: "/agency/blog" },
  },
  { label: "Experience", href: "/#experience" },
  {
    label: "About",
    href: "/#about",
    children: [
      { label: "My story", description: "Who I am and how I work", href: "/#about" },
      { label: "Skills & tools", description: "What I do and what I use", href: "/#skills" },
      { label: "Certifications", description: "Courses and achievements", href: "/#certifications" },
      { label: "Press coverage", description: "Featured in the Daily Nation", href: "/#press" },
      { label: "Testimonials", description: "What people I've worked with say", href: "/#testimonials" },
    ],
  },
  { label: "Contact", href: "/#contact" },
];

const getHash = (href: string) => "#" + href.split("#")[1];
const isHomeAnchor = (href: string) => href.startsWith("/#");

/** Homepage anchors smooth-scroll in place; everything else is a router link. */
function NavAnchor({
  href,
  onAnchor,
  onClick,
  ...props
}: Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href"> & {
  href: string;
  onAnchor: (e: React.MouseEvent, href: string) => void;
}) {
  if (isHomeAnchor(href)) {
    return (
      <a
        href={href}
        onClick={(e) => {
          onAnchor(e, href);
          onClick?.(e);
        }}
        {...props}
      />
    );
  }
  return <Link to={href} onClick={onClick} {...props} />;
}

function Logo({ onClick }: { onClick?: (e: React.MouseEvent) => void }) {
  return (
    <a href="/#home" onClick={onClick} className="flex items-center gap-2.5 shrink-0">
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
  const [menu, setMenu] = useState<string | null>(null);
  const [mobileSub, setMobileSub] = useState<string | null>(null);
  const menuCloseTimer = useRef<number>();
  const reduceMotion = useReducedMotion();

  // Desktop dropdowns: the short close delay lets the pointer cross the gap to the panel
  const openMenu = useCallback((label: string) => {
    window.clearTimeout(menuCloseTimer.current);
    setMenu(label);
  }, []);
  const closeMenuSoon = useCallback(() => {
    window.clearTimeout(menuCloseTimer.current);
    menuCloseTimer.current = window.setTimeout(() => setMenu(null), 140);
  }, []);
  useEffect(() => () => window.clearTimeout(menuCloseTimer.current), []);

  // Reopening the mobile menu starts with every group folded
  useEffect(() => {
    if (!open) setMobileSub(null);
  }, [open]);

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
      const id = getHash(link.href).replace("#", "");
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
    if (!isHomeAnchor(href)) return;
    const hash = getHash(href);
    // Off the homepage, let the browser do a normal navigation to "/#id"
    if (window.location.pathname !== "/") return;
    e.preventDefault();
    setOpen(false);
    const el = document.querySelector(hash);
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
          <Logo onClick={(e) => handleAnchor(e, "/#home")} />

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-7" aria-label="Primary">
            {navLinks.map((link) => {
              const isActive = activeHref === getHash(link.href);
              const isOpen = menu === link.label;
              const anchor = (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => {
                    setMenu(null);
                    handleAnchor(e, link.href);
                  }}
                  aria-current={isActive ? "true" : undefined}
                  aria-haspopup={link.children ? "true" : undefined}
                  aria-expanded={link.children ? isOpen : undefined}
                  className={`relative inline-flex items-center gap-1 ${navLinkClass} ${
                    isActive ? "text-primary" : "text-foreground/70 hover:text-foreground"
                  }`}
                >
                  {link.label}
                  {link.children && (
                    <ChevronDown
                      className={`h-3.5 w-3.5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
                      aria-hidden="true"
                    />
                  )}
                  <span
                    className={`pointer-events-none absolute -bottom-1.5 left-0 h-[2px] bg-primary origin-left transition-transform duration-[250ms] ease-out w-full ${
                      isActive ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </a>
              );
              if (!link.children) return anchor;

              return (
                <div
                  key={link.href}
                  className="relative"
                  onMouseEnter={() => openMenu(link.label)}
                  onMouseLeave={closeMenuSoon}
                  onFocus={() => openMenu(link.label)}
                  onBlur={(e) => {
                    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setMenu(null);
                  }}
                  onKeyDown={(e) => e.key === "Escape" && setMenu(null)}
                >
                  {anchor}
                  <AnimatePresence>
                    {isOpen && (
                      <div className="absolute left-1/2 top-full -translate-x-1/2 pt-5">
                        <motion.div
                          initial={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
                          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -6 }}
                          transition={{ duration: 0.16, ease: "easeOut" }}
                          className={`rounded-2xl border border-border bg-popover text-popover-foreground shadow-elegant p-2 ${
                            link.children.some((c) => c.eyebrow) ? "w-[25rem]" : "w-72"
                          }`}
                        >
                          <ul>
                            {link.children.map((child) => (
                              <li key={child.href}>
                                <NavAnchor
                                  href={child.href}
                                  onAnchor={handleAnchor}
                                  onClick={() => setMenu(null)}
                                  className="group/item block rounded-xl px-3 py-2.5 transition-colors hover:bg-primary/10 focus-visible:bg-primary/10 focus-visible:outline-none"
                                >
                                  {child.eyebrow && (
                                    <span className="mono-accent block text-[10px] uppercase tracking-[0.16em] text-primary">
                                      {child.eyebrow}
                                    </span>
                                  )}
                                  <span className="flex items-center gap-2 text-sm font-semibold text-foreground group-hover/item:text-primary">
                                    {child.label}
                                    {child.badge && (
                                      <span className="rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                                        {child.badge}
                                      </span>
                                    )}
                                  </span>
                                  {child.description && (
                                    <span className="mt-0.5 block text-xs text-muted-foreground">{child.description}</span>
                                  )}
                                </NavAnchor>
                              </li>
                            ))}
                          </ul>
                          {link.footer && (
                            <div className="mt-1 border-t border-border pt-1">
                              <NavAnchor
                                href={link.footer.href}
                                onAnchor={handleAnchor}
                                onClick={() => setMenu(null)}
                                className="flex items-center justify-between rounded-xl px-3 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/10 focus-visible:bg-primary/10 focus-visible:outline-none"
                              >
                                {link.footer.label}
                                <ArrowRight className="h-4 w-4" aria-hidden="true" />
                              </NavAnchor>
                            </div>
                          )}
                        </motion.div>
                      </div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </nav>

          {/* Desktop right */}
          <div className="hidden lg:flex items-center gap-3">
            <ThemeToggle />
            <Button size="sm" variant="outline" onClick={() => setCvOpen(true)} className="rounded-full">
              <FileText className="mr-1.5 h-4 w-4" />
              View CV
            </Button>
            <Button size="sm" asChild className="rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
              <a href="/agency">Agency</a>
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
                <Logo onClick={(e) => handleAnchor(e, "/#home")} />
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
                  <motion.div
                    key={link.href}
                    initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                    animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                    transition={reduceMotion ? undefined : { delay: i * 0.04, duration: 0.2 }}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <a
                        href={link.href}
                        onClick={(e) => handleAnchor(e, link.href)}
                        className={`flex-1 block py-3 min-h-[44px] text-2xl font-display font-semibold ${
                          activeHref === getHash(link.href) ? "text-primary" : "text-foreground"
                        }`}
                      >
                        {link.label}
                      </a>
                      {link.children && (
                        <button
                          type="button"
                          onClick={() => setMobileSub((s) => (s === link.label ? null : link.label))}
                          aria-expanded={mobileSub === link.label}
                          aria-controls={`mobile-sub-${i}`}
                          aria-label={`${mobileSub === link.label ? "Hide" : "Show"} ${link.label} links`}
                          className="h-11 w-11 shrink-0 rounded-full inline-flex items-center justify-center text-muted-foreground hover:text-foreground"
                        >
                          <ChevronDown
                            className={`h-5 w-5 transition-transform duration-200 ${
                              mobileSub === link.label ? "rotate-180 text-primary" : ""
                            }`}
                          />
                        </button>
                      )}
                    </div>
                    {/* Sub-links stay folded until their chevron is tapped, one group at a time */}
                    <AnimatePresence initial={false}>
                      {link.children && mobileSub === link.label && (
                        <motion.ul
                          id={`mobile-sub-${i}`}
                          initial={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                          animate={reduceMotion ? { opacity: 1 } : { height: "auto", opacity: 1 }}
                          exit={reduceMotion ? { opacity: 0 } : { height: 0, opacity: 0 }}
                          transition={{ duration: 0.2, ease: "easeOut" }}
                          className="overflow-hidden ml-1 border-l border-border pl-4"
                        >
                          {(link.footer ? [...link.children, link.footer as NavChild] : link.children).map((child) => (
                            <li key={child.href}>
                              <NavAnchor
                                href={child.href}
                                onAnchor={handleAnchor}
                                onClick={() => setOpen(false)}
                                className={`flex min-h-[40px] items-center gap-2 py-1.5 text-[15px] ${
                                  child === link.footer ? "font-semibold text-primary" : "text-muted-foreground"
                                }`}
                              >
                                <span className="truncate">{child.label}</span>
                                {child.badge && (
                                  <span className="shrink-0 rounded-full bg-primary/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                                    {child.badge}
                                  </span>
                                )}
                              </NavAnchor>
                            </li>
                          ))}
                        </motion.ul>
                      )}
                    </AnimatePresence>
                  </motion.div>
                ))}

                <div className="border-t border-border my-4" />

                <Button asChild className="w-full rounded-full bg-primary text-primary-foreground hover:bg-primary/90">
                  <a href="/agency">Agency</a>
                </Button>

                <Button
                  variant="outline"
                  onClick={() => {
                    setOpen(false);
                    setCvOpen(true);
                  }}
                  className="mt-3 w-full rounded-full"
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
