import { ReactNode, useEffect, useRef, useState, useCallback } from "react";
import { ChevronDown, LucideIcon } from "lucide-react";
import { motion } from "framer-motion";

interface CollapsibleWrapperProps {
  id: string;
  title: string;
  Icon?: LucideIcon;
  count?: string;
  /** Keep this section expanded on phones, where sections otherwise start collapsed */
  defaultOpenOnMobile?: boolean;
  children: ReactNode;
}

// v2: earlier builds wrote "open" for every section on first visit, even on phones
const STORAGE_PREFIX = "section-collapsed:v2:";
const MOBILE_QUERY = "(max-width: 767px)";

const readStored = (id: string): boolean | null => {
  try {
    const stored = localStorage.getItem(STORAGE_PREFIX + id);
    if (stored === "open") return true;
    if (stored === "closed") return false;
  } catch {
    // storage unavailable — fall through to the device default
  }
  return null;
};

const persist = (id: string, open: boolean) => {
  try {
    localStorage.setItem(STORAGE_PREFIX + id, open ? "open" : "closed");
  } catch {
    // ignore
  }
};

export function CollapsibleWrapper({ id, title, Icon, count, defaultOpenOnMobile = false, children }: CollapsibleWrapperProps) {
  // Read the viewport synchronously: a hook that settles after mount would
  // always report "desktop" here and leave every section expanded on phones.
  const [open, setOpen] = useState<boolean>(() => {
    if (window.location.hash === `#${id}`) return true;
    const stored = readStored(id);
    if (stored !== null) return stored;
    // default: expanded on desktop, collapsed on mobile
    return defaultOpenOnMobile || !window.matchMedia(MOBILE_QUERY).matches;
  });
  const wrapRef = useRef<HTMLDivElement>(null);
  const openRef = useRef(open);
  const scrollToSelf = useRef(window.location.hash === `#${id}`);

  // Listen for global expand/collapse all
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ open: boolean }>).detail;
      if (typeof detail?.open === "boolean") {
        setOpen(detail.open);
        persist(id, detail.open);
      }
    };
    window.addEventListener("collapsibles:set-all", handler);
    return () => window.removeEventListener("collapsibles:set-all", handler);
  }, [id]);

  // In-page links (nav, hero CTA, footer) point at the section inside — expand it
  // so the visitor doesn't land on a closed header.
  useEffect(() => {
    const openFromLink = () => {
      if (!openRef.current) scrollToSelf.current = true;
      setOpen(true);
    };
    const onClick = (e: MouseEvent) => {
      const link = (e.target as Element | null)?.closest?.("a[href]");
      if (link?.getAttribute("href")?.endsWith(`#${id}`)) openFromLink();
    };
    const onHashChange = () => {
      if (window.location.hash === `#${id}`) openFromLink();
    };
    document.addEventListener("click", onClick);
    window.addEventListener("hashchange", onHashChange);
    return () => {
      document.removeEventListener("click", onClick);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, [id]);

  // Bring the section into view once a link has opened it (or on arrival with /#id,
  // where it mounts after the browser already tried to scroll). The link's own
  // scroll can't be relied on: a smooth scroll that starts in the same frame as
  // the expand is cancelled by it, so this one waits for the expand to commit.
  useEffect(() => {
    openRef.current = open;
    if (!open || !scrollToSelf.current) return;
    scrollToSelf.current = false;
    let inner = 0;
    const outer = requestAnimationFrame(() => {
      inner = requestAnimationFrame(() => {
        wrapRef.current?.scrollIntoView({ block: "start" });
      });
    });
    return () => {
      cancelAnimationFrame(outer);
      cancelAnimationFrame(inner);
    };
  }, [open]);

  const toggle = useCallback(() => {
    setOpen((v) => {
      persist(id, !v);
      return !v;
    });
  }, [id]);

  return (
    <div id={`${id}-wrap`} ref={wrapRef} className="scroll-mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={open}
          aria-controls={`${id}-content`}
          className="group w-full flex items-center justify-between gap-4 py-4 sm:py-5 px-4 sm:px-6 rounded-xl bg-card/40 hover:bg-card/70 border-b-2 border-primary/40 hover:border-primary transition-all duration-300"
        >
          <div className="flex items-center gap-3 min-w-0">
            {Icon && (
              <span className="flex-shrink-0 h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Icon className="h-5 w-5" />
              </span>
            )}
            <span className="font-display text-lg sm:text-xl md:text-2xl font-bold text-left truncate">
              {title}
            </span>
            {count && (
              <span className="hidden sm:inline-flex flex-shrink-0 text-xs font-medium px-2 py-1 rounded-full bg-primary/15 text-primary">
                {count}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            {!open && (
              <span className="hidden md:inline text-xs text-muted-foreground">
                Click to expand
              </span>
            )}
            <ChevronDown
              className={`h-5 w-5 text-primary transition-transform duration-[400ms] ${open ? "rotate-0" : "-rotate-180"}`}
            />
          </div>
        </button>
      </div>

      {/* Stays mounted while collapsed so the content remains in the page for
          search engines and anchor links; visibility keeps it out of the tab order. */}
      <motion.div
        id={`${id}-content`}
        initial={false}
        animate={
          open
            ? { height: "auto", opacity: 1, visibility: "visible" }
            : { height: 0, opacity: 0, transitionEnd: { visibility: "hidden" } }
        }
        transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
        style={{ overflow: "hidden" }}
        aria-hidden={!open}
      >
        {children}
      </motion.div>
    </div>
  );
}
