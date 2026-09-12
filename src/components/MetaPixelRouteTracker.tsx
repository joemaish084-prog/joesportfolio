import { useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";

export function MetaPixelRouteTracker() {
  const location = useLocation();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    const fbq = (window as any).fbq;
    if (typeof fbq === "function") {
      fbq("track", "PageView");
    }
  }, [location.pathname]);

  return null;
}
