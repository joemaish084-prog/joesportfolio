import { ReactNode, useEffect, useState, useRef, useCallback } from "react";
import { ChevronDown, LucideIcon } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useIsMobile } from "@/hooks/use-mobile";

interface CollapsibleWrapperProps {
  id: string;
  title: string;
  Icon?: LucideIcon;
  count?: string;
  children: ReactNode;
}

const STORAGE_PREFIX = "section-collapsed:";

export function CollapsibleWrapper({ id, title, Icon, count, children }: CollapsibleWrapperProps) {
  const isMobile = useIsMobile();
  const [open, setOpen] = useState<boolean | null>(null);
  const initialized = useRef(false);

  // Initialize from localStorage or device default
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    const stored = localStorage.getItem(STORAGE_PREFIX + id);
    if (stored === "open") setOpen(true);
    else if (stored === "closed") setOpen(false);
    else setOpen(!isMobile); // default: expanded on desktop, collapsed on mobile
  }, [id, isMobile]);

  // Persist
  useEffect(() => {
    if (open === null) return;
    localStorage.setItem(STORAGE_PREFIX + id, open ? "open" : "closed");
  }, [id, open]);

  // Listen for global expand/collapse all
  useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<{ open: boolean }>).detail;
      if (typeof detail?.open === "boolean") setOpen(detail.open);
    };
    window.addEventListener("collapsibles:set-all", handler);
    return () => window.removeEventListener("collapsibles:set-all", handler);
  }, []);

  const toggle = useCallback(() => setOpen((v) => !v), []);

  const isOpen = open ?? !isMobile;

  return (
    <div id={`${id}-wrap`} className="scroll-mt-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <button
          type="button"
          onClick={toggle}
          aria-expanded={isOpen}
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
            {!isOpen && (
              <span className="hidden md:inline text-xs text-muted-foreground">
                Click to expand
              </span>
            )}
            <ChevronDown
              className={`h-5 w-5 text-primary transition-transform duration-[400ms] ${isOpen ? "rotate-0" : "-rotate-180"}`}
            />
          </div>
        </button>
      </div>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`${id}-content`}
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
            style={{ overflow: "hidden" }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
