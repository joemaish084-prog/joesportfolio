import { useEffect } from "react";
import { trackConversion } from "@/lib/analytics";

/**
 * Site-wide listener for Calendly's postMessage booking event, so a
 * "Schedule" conversion fires once per booking no matter which page or
 * widget (inline embed or popup) the visitor booked through.
 */
export function ConversionTracker() {
  useEffect(() => {
    const onMessage = (event: MessageEvent) => {
      if (event.data?.event !== "calendly.event_scheduled") return;
      trackConversion("Schedule");
    };
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, []);

  return null;
}
