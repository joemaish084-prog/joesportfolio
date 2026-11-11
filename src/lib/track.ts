declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    analyticsConsentGranted?: boolean;
    loadGoogleAnalytics?: () => void;
    fbq?: (...args: unknown[]) => void;
    /** Defined in index.html. Only runs once the visitor accepts cookies. */
    loadMetaPixel?: () => void;
  }
}

// dataLayer event name -> Meta Pixel standard event.
const META_EVENTS: Record<string, string> = {
  generate_lead: "Lead",
  calendly_booked: "Schedule",
  whatsapp_click: "Contact",
};

/** Where on the page a tracked link sits, e.g. "floating_button", "footer" or a section id. */
export function linkLocation(el: Element): string {
  const explicit = el.closest("[data-track-location]");
  if (explicit) return explicit.getAttribute("data-track-location") || "other";
  if (el.closest("footer")) return "footer";
  if (el.closest("header")) return "header";
  return el.closest("section[id]")?.id || "other";
}

/**
 * Sends consented public-site events to the agency Google tag and fires the
 * matching Meta Pixel event when there is one. Never put personal data
 * (name, email, phone) in params.
 */
export function track(eventName: string, params: Record<string, unknown> = {}) {
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: eventName, ...params });
    if (window.analyticsConsentGranted && !/^\/(hub|portal|admin)(\/|$)/.test(window.location.pathname)) {
      window.gtag?.("event", eventName, { ...params, send_to: "G-X86CZEY9GV" });
    }
    const metaEvent = META_EVENTS[eventName];
    if (metaEvent) window.fbq?.("track", metaEvent);
  } catch {
    // Tracking must never break the page.
  }
}
