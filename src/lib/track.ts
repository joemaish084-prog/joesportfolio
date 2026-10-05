declare global {
  interface Window {
    dataLayer?: unknown[];
    fbq?: (...args: unknown[]) => void;
  }
}

// dataLayer event name -> Meta Pixel standard event.
const META_EVENTS: Record<string, string> = {
  generate_lead: "Lead",
  calendly_booked: "Schedule",
  whatsapp_click: "Contact",
};

/**
 * Pushes an event to the GTM dataLayer (GA4 is sent from GTM) and fires the
 * matching Meta Pixel event when there is one. Never put personal data
 * (name, email, phone) in params.
 */
export function track(eventName: string, params: Record<string, unknown> = {}) {
  try {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: eventName, ...params });
    const metaEvent = META_EVENTS[eventName];
    if (metaEvent) window.fbq?.("track", metaEvent);
  } catch {
    // Tracking must never break the page.
  }
}
