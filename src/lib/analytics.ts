import "@/lib/track";

/**
 * The agency Google tag (see index.html) starts only after cookie acceptance.
 * Enhanced measurement handles page views; track() forwards conversion events.
 */
export function grantAnalyticsConsent() {
  if (typeof window === "undefined") return;
  window.dataLayer = window.dataLayer || [];
  // Consent commands must be pushed as an `arguments` object, not an array.
  function gtag(..._args: unknown[]) {
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  }
  gtag("consent", "update", {
    analytics_storage: "granted",
    ad_storage: "granted",
    ad_user_data: "granted",
    ad_personalization: "granted",
  });
  window.analyticsConsentGranted = true;
  window.loadGoogleAnalytics?.();
  window.loadMetaPixel?.();
}
