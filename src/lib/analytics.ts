const GA_MEASUREMENT_ID = "G-X86CZEY9GV";
const CONSENT_KEY = "cookie-consent-v1";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

let gaLoaded = false;

function hasAnalyticsConsent(): boolean {
  try {
    return localStorage.getItem(CONSENT_KEY) === "accepted";
  } catch {
    return false;
  }
}

export function initGA() {
  if (gaLoaded || typeof window === "undefined" || !hasAnalyticsConsent()) return;
  gaLoaded = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag(...args: unknown[]) {
    window.dataLayer!.push(args);
  };
  window.gtag("js", new Date());
  window.gtag("config", GA_MEASUREMENT_ID, { anonymize_ip: true });

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${GA_MEASUREMENT_ID}`;
  document.head.appendChild(script);
}

export function trackEvent(name: string, params?: Record<string, unknown>) {
  if (!hasAnalyticsConsent()) return;
  initGA();
  window.gtag?.("event", name, params);
}

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

/**
 * Fires a named conversion to both Meta Pixel and GA4. fbq is unconditional
 * (matches the existing Meta Pixel setup, which isn't consent-gated); the
 * GA4 side still goes through trackEvent's cookie-consent check.
 */
export function trackConversion(name: "Lead" | "Contact" | "Schedule", params?: Record<string, unknown>) {
  window.fbq?.("track", name);
  trackEvent(name, params);
}
