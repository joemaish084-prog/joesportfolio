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
