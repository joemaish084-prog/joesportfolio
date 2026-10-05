import { useEffect } from "react";
import { track } from "@/lib/track";

function linkLocation(el: Element): string {
  const explicit = el.closest("[data-track-location]");
  if (explicit) return explicit.getAttribute("data-track-location") || "other";
  if (el.closest("footer")) return "footer";
  if (el.closest("header")) return "header";
  return el.closest("section[id]")?.id || "other";
}

/**
 * Site-wide conversion listeners:
 * - Calendly's postMessage booking event, so "calendly_booked" fires once per
 *   booking no matter which page or widget (inline embed or popup) was used.
 * - Delegated clicks on WhatsApp, phone and booking links/buttons. The
 *   listener only observes, so it never blocks the normal click behaviour.
 */
export function ConversionTracker() {
  useEffect(() => {
    const seenBookings = new Set<string>();
    const onMessage = (event: MessageEvent) => {
      if (event.origin !== "https://calendly.com") return;
      if (event.data?.event !== "calendly.event_scheduled") return;
      const bookingId = event.data?.payload?.event?.uri;
      if (typeof bookingId === "string") {
        if (seenBookings.has(bookingId)) return;
        seenBookings.add(bookingId);
      }
      track("calendly_booked");
    };

    const onClick = (e: MouseEvent) => {
      const target = e.target;
      if (!(target instanceof Element)) return;
      const el = target.closest("a[href], [data-track]");
      if (!el) return;
      const href = el.getAttribute("href") || "";
      const link_location = linkLocation(el);

      if (href.includes("wa.me")) track("whatsapp_click", { link_location });
      else if (href.startsWith("tel:")) track("phone_click", { link_location });
      else if (el.getAttribute("data-track") === "calendly_click" || href.includes("calendly.com"))
        track("calendly_click", { link_location });
    };

    window.addEventListener("message", onMessage);
    document.addEventListener("click", onClick, true);
    return () => {
      window.removeEventListener("message", onMessage);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  return null;
}
