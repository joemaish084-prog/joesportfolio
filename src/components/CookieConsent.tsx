import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { grantAnalyticsConsent } from "@/lib/analytics";

const STORAGE_KEY = "cookie-consent-v1";

type Consent = "accepted" | "essential" | null;

export function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const [showPrefs, setShowPrefs] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY) as Consent;
      if (!stored) {
        // Slight delay so it doesn't block first paint
        const t = setTimeout(() => setVisible(true), 800);
        return () => clearTimeout(t);
      }
      if (stored === "accepted") grantAnalyticsConsent();
    } catch {
      setVisible(true);
    }
  }, []);

  const save = (value: Exclude<Consent, null>) => {
    try {
      localStorage.setItem(STORAGE_KEY, value);
    } catch {
      // ignore
    }
    if (value === "accepted") grantAnalyticsConsent();
    setVisible(false);
    setShowPrefs(false);
  };

  if (!visible) return null;

  return (
    <section
      data-cookie-consent
      aria-label="Cookie preferences"
      className="fixed inset-x-2.5 bottom-[max(.625rem,env(safe-area-inset-bottom))] z-[90] max-h-[70dvh] overflow-y-auto overscroll-contain rounded-xl border border-border bg-card p-3 shadow-elegant sm:left-auto sm:right-6 sm:max-w-sm sm:p-4"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="text-sm font-semibold">Cookie preferences</p>
        <button type="button" aria-expanded={showPrefs} aria-controls="cookie-preference-details"
          className="min-h-11 min-w-11 rounded-md px-2 text-sm font-medium text-primary underline"
          onClick={() => setShowPrefs(value => !value)}>
          {showPrefs ? "Hide details" : "Details"}
        </button>
      </div>
      <p className="text-sm leading-snug text-muted-foreground">Allow optional cookies for analytics and ad measurement?</p>
      <div id="cookie-preference-details" hidden={!showPrefs} className="mt-3 space-y-2 border-t border-border pt-3 text-sm text-muted-foreground">
        <p>Essential cookies help the site work and remember your theme. Accepting also enables Google Analytics and Meta Pixel.</p>
        <Link to="/cookie-policy" className="inline-flex min-h-11 items-center text-primary underline underline-offset-4">Read our cookie policy</Link>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <Button size="sm" variant="outline" onClick={() => save("essential")} className="h-11">Essential Only</Button>
        <Button size="sm" onClick={() => save("accepted")} className="h-11 bg-primary text-primary-foreground">Accept All</Button>
      </div>
    </section>
  );
}
