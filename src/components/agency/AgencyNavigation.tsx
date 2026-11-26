import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
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
          ? `inline-flex min-h-11 items-center rounded-full px-3.5 transition-colors ${active ? "bg-primary/10 font-medium text-primary ring-1 ring-primary/25" : "hover:text-foreground"}`
          : `inline-flex min-h-11 items-center ${active ? "font-semibold text-primary" : "hover:text-primary transition-colors"}`}>
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
  const menuPanel = useRef<HTMLDialogElement>(null);
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
    const dialog = menuPanel.current;
    if (!open || !dialog) return;
    const previous = document.body.style.overflow;
    const trigger = menuButton.current;
    dialog.showModal();
    document.body.style.overflow = "hidden";
    closeButton.current?.focus();
    const desktop = window.matchMedia("(min-width: 1024px)");
    const resize = () => { if (desktop.matches) setOpen(false); };
    desktop.addEventListener("change", resize);
    return () => {
      dialog.close();
      document.body.style.overflow = previous;
      desktop.removeEventListener("change", resize);
      if (!desktop.matches) trigger?.focus({ preventScroll: true });
    };
  }, [open]);
  return <>
    <header className={`sticky top-0 z-50 border-b ${solid ? "border-border/60 bg-background" : scrolled ? "border-border/60 bg-background lg:bg-background/85 lg:backdrop-blur-md" : "border-border/60 bg-background lg:border-transparent lg:bg-background/60 lg:backdrop-blur-md"}`}>
      <div className="container mx-auto px-3 sm:px-4 h-16 flex items-center justify-between gap-1.5 sm:gap-4">
        <div className="flex items-center gap-3 shrink-0">
          <Link to="/" aria-label="JM Marketing home" className="group flex items-center gap-2 min-h-11">
            <img src="/logo/jm-lockup.png" {...localImageProps("/logo/jm-lockup.png", "105px")} alt="" width={352} height={134} className="h-7 w-auto brightness-75 dark:brightness-100 sm:h-9" />
          </Link>
        </div>
        <div className="hidden lg:block"><AgencySectionLinks pill className="text-muted-foreground" /></div>
        <div className="flex items-center gap-1 shrink-0">
          {home
            ? <Button size="sm" className="h-11 rounded-full px-3" asChild><a href="#audit">Book a Free Audit</a></Button>
            : <Button size="sm" className="h-11 rounded-full px-3" asChild><Link to="/agency/contact"><span className="xl:hidden">Book a Call</span><span className="hidden xl:inline">Book a Free Strategy Call</span></Link></Button>}
          <Button size="sm" variant="outline" asChild className="hidden h-11 rounded-full px-3 lg:inline-flex"><PublicViewLink to="/portfolio">Portfolio</PublicViewLink></Button>
          <div className="hidden lg:block"><ThemeToggle /></div>
          <button ref={menuButton} type="button" onClick={() => setOpen(true)} aria-label="Open menu" aria-haspopup="dialog" aria-expanded={open} aria-controls="agency-mobile-nav"
            className="inline-flex h-11 min-w-11 shrink-0 items-center justify-center gap-1.5 rounded-full px-2 text-sm font-semibold hover:bg-muted/25 lg:hidden"><Menu className="h-5 w-5" aria-hidden /> Menu</button>
        </div>
      </div>
    </header>
    <dialog ref={menuPanel} id="agency-mobile-nav" aria-label="Agency menu"
      onCancel={(event) => { event.preventDefault(); setOpen(false); }}
      className="fixed inset-0 m-0 h-[100dvh] max-h-none w-full max-w-none flex-col overflow-y-auto overscroll-contain bg-background text-foreground open:flex lg:open:hidden">
      {open && <>
      <div className="h-16 px-4 flex items-center justify-between border-b border-border/40 shrink-0">
        <span className="section-label"><span className="slashes">//</span> Agency</span>
        <div className="flex items-center gap-1">
          <ThemeToggle />
          <button ref={closeButton} type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="h-11 w-11 -mr-2 rounded-full inline-flex items-center justify-center"><X className="h-6 w-6" aria-hidden /></button>
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
        <Link to="/portfolio" onClick={() => setOpen(false)} className="flex items-center gap-2 py-4 min-h-11 text-muted-foreground">
          <ArrowLeft className="h-4 w-4" aria-hidden />Portfolio
        </Link>
      </nav>
      <div className="mt-auto grid gap-3 p-4 pb-8">
        {home ? <Button size="lg" className="w-full rounded-full" asChild><a href="#audit" onClick={() => setOpen(false)}>Book a Free Audit</a></Button>
          : <Button size="lg" className="w-full rounded-full" asChild>
            <Link to="/agency/contact" onClick={() => setOpen(false)}><Calendar className="h-5 w-5" aria-hidden /> Book a Free Strategy Call</Link>
          </Button>}
        <Button size="lg" variant="outline" className="w-full rounded-full" asChild>
          <a href="https://wa.me/254704700160" target="_blank" rel="noopener noreferrer"><MessageCircle className="h-5 w-5" aria-hidden /> WhatsApp</a>
        </Button>
      </div>
      </>}
    </dialog>
  </>;
}
