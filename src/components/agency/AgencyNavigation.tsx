import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, Calendar, Menu, MessageCircle, X } from "lucide-react";
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

export function AgencyNavigation() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
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
    document.body.style.overflow = "hidden";
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", close);
    return () => { document.body.style.overflow = previous; document.removeEventListener("keydown", close); };
  }, [open]);
  return <>
    <header className={`sticky top-0 z-50 border-b backdrop-blur-md transition-[background-color,border-color,box-shadow] duration-300 ${scrolled ? "border-border/60 bg-background/85 shadow-[0_8px_30px_-12px_hsl(0_0%_0%/0.25)]" : "border-transparent bg-background/60"}`}>
      <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/" aria-label="Back to Portfolio" className="group flex items-center gap-2 min-h-11">
            <img src="/logo/jm-lockup.png" {...localImageProps("/logo/jm-lockup.png", "105px")} alt="" width={352} height={134} className="h-9 w-auto" />
          </Link>
          <span aria-hidden className="hidden sm:block h-5 w-px bg-border" />
          <Link to="/" className="hidden sm:inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-3.5 w-3.5" aria-hidden />Portfolio
          </Link>
        </div>
        <div className="hidden lg:block"><AgencySectionLinks pill className="text-muted-foreground" /></div>
        <div className="flex items-center gap-1 shrink-0">
          <Button size="sm" className="h-10 sm:h-9 rounded-full px-4" asChild><Link to="/agency/contact"><span className="xl:hidden">Book a Call</span><span className="hidden xl:inline">Book a Free Strategy Call</span></Link></Button>
          <button type="button" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open} aria-controls="agency-mobile-nav"
            className="lg:hidden h-11 w-11 -mr-2 rounded-full text-foreground inline-flex items-center justify-center shrink-0"><Menu className="h-6 w-6" /></button>
        </div>
      </div>
    </header>
    <AnimatePresence>{open && <motion.div id="agency-mobile-nav" role="dialog" aria-modal="true" aria-label="Agency menu"
      className="fixed inset-0 z-[100] bg-background lg:hidden overflow-y-auto flex flex-col" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.26, ease: "easeOut" }}>
      <div className="h-16 px-4 flex items-center justify-between border-b border-border/40 shrink-0">
        <span className="section-label"><span className="slashes">//</span> Agency</span>
        <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="h-11 w-11 -mr-2 rounded-full inline-flex items-center justify-center"><X className="h-6 w-6" /></button>
      </div>
      <nav aria-label="Agency mobile" className="px-4 pt-2 flex flex-col">
        {links.map((link, i) => {
          const active = pathname === link.path;
          return <Link key={link.path} to={link.path} onClick={() => setOpen(false)} aria-current={active ? "page" : undefined}
            className={`group flex items-center gap-4 py-3.5 min-h-11 border-b border-border/50 ${active ? "text-primary" : "text-foreground"}`}>
            <span className="mono-accent w-6 text-xs text-muted-foreground">{String(i + 1).padStart(2, "0")}</span>
            <span className="flex-1 text-2xl font-display font-semibold">{link.label}</span>
            <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1" aria-hidden />
          </Link>;
        })}
        <Link to="/" className="flex items-center gap-2 py-4 min-h-11 text-muted-foreground" onClick={() => setOpen(false)}>
          <ArrowLeft className="h-4 w-4" aria-hidden />Back to Portfolio
        </Link>
      </nav>
      <div className="mt-auto grid gap-3 p-4 pb-8">
        <Button size="lg" className="w-full rounded-full" asChild>
          <Link to="/agency/contact" onClick={() => setOpen(false)}><Calendar className="h-5 w-5" aria-hidden /> Book a Free Strategy Call</Link>
        </Button>
        <Button size="lg" variant="outline" className="w-full rounded-full" asChild>
          <a href="https://wa.me/254704700160" target="_blank" rel="noopener noreferrer"><MessageCircle className="h-5 w-5" aria-hidden /> WhatsApp</a>
        </Button>
      </div>
    </motion.div>}</AnimatePresence>
  </>;
}
