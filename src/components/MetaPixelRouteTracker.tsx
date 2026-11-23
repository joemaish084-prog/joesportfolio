import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import { trackOpenAIPageView } from "@/lib/track";

export function MetaPixelRouteTracker() {
  const location = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    window.fbq?.("track", "PageView");
    trackOpenAIPageView(location.pathname);
  }, [location.pathname]);

  return null;
}
