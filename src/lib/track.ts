declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
    analyticsConsentGranted?: boolean;
    loadGoogleAnalytics?: () => void;
    fbq?: (...args: unknown[]) => void;
    /** Defined in index.html. Only runs once the visitor accepts cookies. */
    loadMetaPixel?: () => void;
    oaiq?: (...args: unknown[]) => void;
    /** Defined in index.html. Only runs once the visitor accepts cookies. */
    loadOpenAIPixel?: () => void;
  }
}

const PRIVATE_PATH = /^\/(hub|portal|admin)(\/|$)/;

// dataLayer event name -> Meta Pixel standard event.
const META_EVENTS: Record<string, string> = {
  generate_lead: "Lead",
  calendly_booked: "Schedule",
  whatsapp_click: "Contact",
};

// dataLayer event name -> ChatGPT Ads (OpenAI pixel) measure() arguments.
const OPENAI_EVENTS: Record<string, unknown[]> = {
  generate_lead: ["lead_created", { type: "customer_action" }],
  calendly_booked: ["appointment_scheduled", { type: "customer_action" }],
  whatsapp_click: ["custom", { type: "custom" }, { custom_event_name: "whatsapp_click" }],
};

/** Sends a ChatGPT Ads page view. No-op until the pixel has loaded after consent. */
export function trackOpenAIPageView(pathname: string) {
  try {
    if (PRIVATE_PATH.test(pathname)) return;
    window.oaiq?.("measure", "page_viewed", {
      type: "contents",
      contents: [{ id: pathname, content_type: "page" }],
    });
  } catch {
    // Tracking must never break the page.
  }
}

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
    const isPrivate = PRIVATE_PATH.test(window.location.pathname);
    if (window.analyticsConsentGranted && !isPrivate) {
      window.gtag?.("event", eventName, { ...params, send_to: "G-X86CZEY9GV" });
    }
    const metaEvent = META_EVENTS[eventName];
    if (metaEvent) window.fbq?.("track", metaEvent);
    const openAIEvent = OPENAI_EVENTS[eventName];
    if (openAIEvent && !isPrivate) window.oaiq?.("measure", ...openAIEvent);
  } catch {
    // Tracking must never break the page.
  }
}
