import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Calendar, Menu, MessageCircle, X } from "lucide-react";
import { PublicViewLink } from "@/components/PublicViewLink";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Button } from "@/components/ui/button";
import { agencyPages } from "@/data/agencyPages";
import { localImageProps } from "@/lib/imageVariants";

const links = [...Object.values(agencyPages), { path: "/agency/blog", label: "Blog" }];

export function AgencySectionLinks({ className = "", pill = false }: { className?: string; pill?: boolean }) {
  const { pathname } = useLocation();
  return <nav aria-label="Agency pages" className={`flex flex-wrap text-sm ${pill ? "gap-1" : "gap-x-5 gap-y-3"} ${className}`}>
    {links.map(link => {
      const active = pathname === link.path;
      return <Link key={link.path} to={link.path}
        aria-current={active ? "page" : undefined}
        className={pill
          ? `relative isolate rounded-full px-3.5 py-1.5 transition-colors ${active ? "text-primary font-medium" : "hover:text-foreground"}`
          : active ? "font-semibold text-primary" : "hover:text-primary transition-colors"}>
        {pill && active && <motion.span layoutId="agency-nav-pill" aria-hidden
          className="absolute inset-0 -z-10 rounded-full bg-primary/10 ring-1 ring-primary/25"
          transition={{ type: "spring", stiffness: 380, damping: 32 }} />}
        {link.label}
      </Link>;
    })}
  </nav>;
}

/** `solid` is for pages with a light body, where the translucent bar turns grey. */
export function AgencyNavigation({ solid = false, home = false }: { solid?: boolean; home?: boolean }) {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuButton = useRef<HTMLButtonElement>(null);
  const menuPanel = useRef<HTMLDivElement>(null);
  const closeButton = useRef<HTMLButtonElement>(null);
  const { pathname } = useLocation();
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    const trigger = menuButton.current;
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    const close = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
      if (event.key !== "Tab") return;
      const items = menuPanel.current?.querySelectorAll<HTMLElement>("a[href], button");
      if (!items?.length) return;
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    const desktop = window.matchMedia("(min-width: 1024px)");
    const resize = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener("change", resize);
    document.addEventListener("keydown", close);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener("keydown", close);
      desktop.removeEventListener("change", resize);
      trigger?.focus();
    };
  }, [open]);
  return <>
    <header className={`sticky top-0 z-50 border-b transition-[background-color,border-color,box-shadow] duration-300 ${home ? "studio-nav" : solid ? "border-border/60 bg-background" : scrolled ? "border-border/60 bg-background/85 backdrop-blur-md shadow-[0_8px_30px_-12px_hsl(0_0%_0%/0.25)]" : "border-transparent bg-background/60 backdrop-blur-md"}`}>
      <div className="container mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-1.5 sm:gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/" aria-label="Joseph Maina Marketing home" className="group flex items-center gap-2 min-h-11">
            <img src="/logo/jm-lockup.png" {...localImageProps("/logo/jm-lockup.png", "105px")} alt="" width={352} height={134} className="h-7 w-auto brightness-75 dark:brightness-100 sm:h-9" />
          </Link>
        </div>
        <div className="hidden lg:block"><AgencySectionLinks pill className="text-muted-foreground" /></div>
        <div className="flex items-center gap-1 shrink-0">
          {home
            ? <a href="#audit" className="studio-nav-audit">Book a Free Audit</a>
            : <Button size="sm" className="h-10 rounded-full px-3 max-[369px]:hidden sm:h-9" asChild><Link to="/agency/contact"><span className="xl:hidden">Book a Call</span><span className="hidden xl:inline">Book a Free Strategy Call</span></Link></Button>}
          <Button size="sm" asChild className={home ? "studio-nav-switch" : "h-10 rounded-full bg-primary px-3 text-primary-foreground hover:bg-primary/90"}><PublicViewLink to="/portfolio">Portfolio</PublicViewLink></Button>
          <ThemeToggle />
          <button ref={menuButton} type="button" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open} aria-controls="agency-mobile-nav"
            className="lg:hidden h-11 w-9 rounded-full inline-flex items-center justify-center shrink-0 hover:bg-muted/25"><Menu className="h-5 w-5" /></button>
        </div>
      </div>
    </header>
    <AnimatePresence>{open && <motion.div ref={menuPanel} id="agency-mobile-nav" role="dialog" aria-modal="true" aria-label="Agency menu"
      className={`fixed inset-0 z-[100] lg:hidden overflow-y-auto flex flex-col ${home ? "studio-mobile-menu" : "bg-background"}`} initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.26, ease: "easeOut" }}>
      <div className="h-16 px-4 flex items-center justify-between border-b border-border/40 shrink-0">
        <span className="section-label"><span className="slashes">//</span> Agency</span>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button ref={closeButton} type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="h-11 w-11 -mr-2 rounded-full inline-flex items-center justify-center"><X className="h-6 w-6" /></button>
        </div>
      </div>
      <nav aria-label="Agency mobile" className="px-4 pt-2 flex flex-col">
        {links.map((link) => {
          const active = pathname === link.path;
          return <Link key={link.path} to={link.path} onClick={() => setOpen(false)} aria-current={active ? "page" : undefined}
            className={`group flex items-center gap-4 py-3.5 min-h-11 border-b border-border/50 ${active ? "text-primary" : "text-foreground"}`}>
            <span className="flex-1 text-2xl font-display font-semibold">{link.label}</span>
            <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>;
        })}
        <PublicViewLink to="/portfolio" className="flex items-center gap-2 py-4 min-h-11 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" aria-hidden />Portfolio
        </PublicViewLink>
      </nav>
      <div className="mt-auto grid gap-3 p-4 pb-8">
        {home ? <a href="#audit" className="studio-button studio-button-primary" onClick={() => setOpen(false)}>Book a Free Audit</a>
          : <Button size="lg" className="w-full rounded-full" asChild>
            <Link to="/agency/contact" onClick={() => setOpen(false)}><Calendar className="h-5 w-5" aria-hidden /> Book a Free Strategy Call</Link>
          </Button>}
        <Button size="lg" variant="outline" className="w-full rounded-full" asChild>
          <a href="https://wa.me/254704700160" target="_blank" rel="noopener noreferrer"><MessageCircle className="h-5 w-5" aria-hidden /> WhatsApp</a>
        </Button>
      </div>
    </motion.div>}</AnimatePresence>
  </>;
}
