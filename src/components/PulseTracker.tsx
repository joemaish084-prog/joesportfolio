import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { buildElementSelector, sendPulse } from "@/lib/pulse";

const HEARTBEAT_INTERVAL_MS = 15_000;

export function PulseTracker() {
  const location = useLocation();
  const pageStartRef = useRef<number>(performance.now());
  const lastPathRef = useRef<string>("");

  // Page views + heartbeats + exit duration, per route.
  useEffect(() => {
    const path = location.pathname + location.search;
    const referrer = lastPathRef.current || document.referrer || "";
    pageStartRef.current = performance.now();

    sendPulse({
      event_type: "page_view",
      page_path: path,
      page_title: document.title,
      referrer,
    });

    const heartbeat = setInterval(() => {
      if (document.visibilityState !== "visible") return;
      sendPulse({
        event_type: "heartbeat",
        page_path: path,
        duration_ms: performance.now() - pageStartRef.current,
      });
    }, HEARTBEAT_INTERVAL_MS);

    const sendExit = () => {
      sendPulse(
        {
          event_type: "page_exit",
          page_path: path,
          duration_ms: performance.now() - pageStartRef.current,
        },
        true,
      );
    };

    const onVisibilityChange = () => {
      if (document.visibilityState === "hidden") sendExit();
    };

    document.addEventListener("visibilitychange", onVisibilityChange);
    window.addEventListener("pagehide", sendExit);

    lastPathRef.current = path;

    return () => {
      clearInterval(heartbeat);
      document.removeEventListener("visibilitychange", onVisibilityChange);
      window.removeEventListener("pagehide", sendExit);
      sendExit();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search]);

  // Site-wide click tracking.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as Element | null;
      if (!target || !(target instanceof Element)) return;
      const el = target.closest("button, a, [role='button'], input, select, textarea") || target;
      sendPulse({
        event_type: "click",
        page_path: location.pathname + location.search,
        element_selector: buildElementSelector(el),
        element_text: (el.textContent || "").trim().slice(0, 80) || undefined,
      });
    };

    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname, location.search]);

  return null;
}
