import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Calendar, MessageCircle } from "lucide-react";
import { ctaContent } from "./servicesContent";

interface MobileCtaBarProps {
  /** Id of the hero buttons. The bar appears once they have scrolled off the top. */
  afterId: string;
  /** Id of the closing CTA band. The bar leaves when it comes into view, so the two never compete. */
  untilId: string;
}

/**
 * Phone-only bottom bar: the booking link plus WhatsApp. Shown between the hero
 * buttons and the closing CTA. It is unmounted while hidden, so it is never a
 * hidden tab stop. Desktop has the nav button instead.
 */
export function MobileCtaBar({ afterId, untilId }: MobileCtaBarProps) {
  const [pastHero, setPastHero] = useState(false);
  const [atEnd, setAtEnd] = useState(false);

  useEffect(() => {
    const after = document.getElementById(afterId);
    const until = document.getElementById(untilId);
    if (!after || !until || typeof IntersectionObserver === "undefined") return;

    const heroObserver = new IntersectionObserver(([entry]) => {
      setPastHero(!entry.isIntersecting && entry.boundingClientRect.bottom < 0);
    });
    const endObserver = new IntersectionObserver(([entry]) => {
      // Still "at the end" once the band has scrolled above the screen (the footer).
      setAtEnd(entry.isIntersecting || entry.boundingClientRect.top < 0);
    });
    heroObserver.observe(after);
    endObserver.observe(until);
    return () => {
      heroObserver.disconnect();
      endObserver.disconnect();
    };
  }, [afterId, untilId]);

  return (
    <AnimatePresence>
      {pastHero && !atEnd && (
        <motion.div
          role="region"
          aria-label="Book a call"
          data-track-location="services-sticky-bar"
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="fixed inset-x-0 bottom-0 z-40 flex items-center gap-2 border-t border-border/70 bg-background px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-8px_30px_-12px_hsl(0_0%_0%/0.35)] md:hidden"
        >
          <a
            href={ctaContent.primary.to}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-primary px-4 text-sm font-semibold text-primary-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <Calendar className="h-4 w-4 shrink-0" aria-hidden />
            {ctaContent.primary.label}
          </a>
          <a
            href={ctaContent.whatsapp.to}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={ctaContent.whatsapp.label}
            className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-border text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <MessageCircle className="h-5 w-5" aria-hidden />
          </a>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
