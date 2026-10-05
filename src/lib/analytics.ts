import "@/lib/track";

/**
 * GA4 is loaded by Google Tag Manager (see index.html), which
 * starts with Consent Mode denied. Call this once the visitor accepts cookies.
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
}
