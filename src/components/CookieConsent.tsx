import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Cookie, X } from "lucide-react";
import { Button } from "@/components/ui/button";

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
    setVisible(false);
    setShowPrefs(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-live="polite"
      aria-label="Cookie consent"
      className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:bottom-6 sm:max-w-md z-[90] animate-fade-in"
    >
      <div className="relative bg-card border border-border rounded-xl shadow-[var(--shadow-elegant)] p-5 backdrop-blur">
        <button
          onClick={() => save("essential")}
          aria-label="Dismiss cookie banner"
          className="absolute top-3 right-3 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
            <Cookie className="w-4 h-4 text-primary" aria-hidden="true" />
          </div>
          <div className="flex-1">
            <p className="text-sm text-foreground leading-relaxed">
              We use cookies to improve your experience and analyze site traffic.{" "}
              <Link to="/cookie-policy" className="text-primary hover:underline">
                Learn more
              </Link>
              .
            </p>

            {showPrefs && (
              <div className="mt-3 space-y-2 text-xs text-muted-foreground border-t border-border pt-3">
                <p><strong className="text-foreground">Essential:</strong> Required for the site to work.</p>
                <p><strong className="text-foreground">Analytics:</strong> Google Analytics — anonymized traffic data.</p>
                <p><strong className="text-foreground">Functional:</strong> Remembers your theme preference.</p>
              </div>
            )}

            <div className="mt-4 flex flex-wrap gap-2">
              <Button
                size="sm"
                onClick={() => save("accepted")}
                className="text-xs h-9"
              >
                Accept All
              </Button>
              {showPrefs ? (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => save("essential")}
                  className="text-xs h-9"
                >
                  Essential Only
                </Button>
              ) : (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setShowPrefs(true)}
                  className="text-xs h-9"
                >
                  Manage Preferences
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
