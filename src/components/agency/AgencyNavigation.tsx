import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { agencyPages } from "@/data/agencyPages";

const links = [...Object.values(agencyPages), { path: "/agency/blog", label: "Blog" }];

export function AgencySectionLinks({ className = "" }: { className?: string }) {
  const { pathname } = useLocation();
  return <nav aria-label="Agency pages" className={`flex flex-wrap gap-x-5 gap-y-3 text-sm ${className}`}>
    {links.map(link => <Link key={link.path} to={link.path}
      aria-current={pathname === link.path ? "page" : undefined}
      className={pathname === link.path ? "font-semibold text-primary" : "hover:text-primary transition-colors"}>
      {link.label}
    </Link>)}
  </nav>;
}

export function AgencyNavigation() {
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const close = (event: KeyboardEvent) => { if (event.key === "Escape") setOpen(false); };
    document.addEventListener("keydown", close);
    return () => { document.body.style.overflow = previous; document.removeEventListener("keydown", close); };
  }, [open]);
  return <>
    <header className="border-b border-border/40 sticky top-0 bg-background/80 backdrop-blur-md z-50">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between gap-4">
        <Link to="/" aria-label="Back to Portfolio" className="inline-flex items-center justify-center sm:justify-start min-h-11 min-w-11 -ml-3 sm:ml-0 sm:min-w-0 text-sm text-muted-foreground hover:text-foreground transition-colors shrink-0">
          <ArrowLeft className="h-5 w-5 sm:h-4 sm:w-4 sm:mr-2" /><span className="hidden sm:inline">Back to Portfolio</span>
        </Link>
        <div className="hidden lg:block"><AgencySectionLinks className="text-muted-foreground" /></div>
        <div className="flex items-center gap-1 shrink-0">
          <Button size="sm" className="h-10 sm:h-9" asChild><Link to="/agency/contact">Book Call</Link></Button>
          <button type="button" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open} aria-controls="agency-mobile-nav"
            className="lg:hidden h-11 w-11 -mr-2 rounded-full text-foreground inline-flex items-center justify-center shrink-0"><Menu className="h-6 w-6" /></button>
        </div>
      </div>
    </header>
    <AnimatePresence>{open && <motion.div id="agency-mobile-nav" role="dialog" aria-modal="true" aria-label="Agency menu"
      className="fixed inset-0 z-[100] bg-background lg:hidden overflow-y-auto" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.26, ease: "easeOut" }}>
      <div className="h-14 px-4 flex items-center justify-between border-b border-border/40">
        <span className="text-sm font-medium">Agency menu</span>
        <button type="button" onClick={() => setOpen(false)} aria-label="Close menu" className="h-11 w-11 -mr-2 rounded-full inline-flex items-center justify-center"><X className="h-6 w-6" /></button>
      </div>
      <nav aria-label="Agency mobile" className="px-4 pt-4 pb-10 flex flex-col">
        {links.map(link => <Link key={link.path} to={link.path} onClick={() => setOpen(false)} aria-current={pathname === link.path ? "page" : undefined}
          className={`py-3 min-h-11 text-2xl font-display font-semibold ${pathname === link.path ? "text-primary" : "text-foreground"}`}>{link.label}</Link>)}
        <Link to="/" className="py-3 min-h-11 mt-4 border-t border-border text-lg text-muted-foreground" onClick={() => setOpen(false)}>Back to Portfolio</Link>
      </nav>
    </motion.div>}</AnimatePresence>
  </>;
}
