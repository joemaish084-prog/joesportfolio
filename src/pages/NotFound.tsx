import { useLocation } from "react-router-dom";
import { useEffect } from "react";

const SITE_URL = "https://www.josephmaina.co.ke";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error("404 Error: User attempted to access non-existent route:", location.pathname);

    const prevTitle = document.title;
    document.title = "Page Not Found (404) | Joseph Maina";

    const setMeta = (selector: string, attr: string, name: string, content: string) => {
      let el = document.head.querySelector<HTMLMetaElement | HTMLLinkElement>(selector);
      if (!el) {
        el = (attr === "rel" ? document.createElement("link") : document.createElement("meta")) as
          | HTMLMetaElement
          | HTMLLinkElement;
        el.setAttribute(attr, name);
        document.head.appendChild(el);
      }
      if (el instanceof HTMLLinkElement) el.href = content;
      else el.content = content;
      return el;
    };

    const url = `${SITE_URL}${location.pathname}`;
    const desc = "The page you're looking for doesn't exist. Return to Joseph Maina's portfolio home.";

    const changed: Array<{ el: Element; attr: string; prev: string | null }> = [];
    const track = (el: Element, attr: string) => {
      changed.push({ el, attr, prev: el.getAttribute(attr) });
    };

    const descEl = setMeta('meta[name="description"]', "name", "description", desc);
    track(descEl, descEl instanceof HTMLLinkElement ? "href" : "content");

    const canonical = setMeta('link[rel="canonical"]', "rel", "canonical", url);
    track(canonical, "href");

    const ogTitle = setMeta('meta[property="og:title"]', "property", "og:title", "Page Not Found | Joseph Maina");
    track(ogTitle, "content");
    const ogDesc = setMeta('meta[property="og:description"]', "property", "og:description", desc);
    track(ogDesc, "content");
    const ogUrl = setMeta('meta[property="og:url"]', "property", "og:url", url);
    track(ogUrl, "content");

    // Add noindex for 404
    let robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    const robotsExisted = !!robots;
    const prevRobots = robots?.content ?? null;
    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.appendChild(robots);
    }
    robots.content = "noindex, follow";

    return () => {
      document.title = prevTitle;
      if (robotsExisted && prevRobots !== null) robots!.content = prevRobots;
      else robots?.remove();
    };
  }, [location.pathname]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold">404</h1>
        <p className="mb-4 text-xl text-muted-foreground">Oops! Page not found</p>
        <a href="/" className="text-primary underline hover:text-primary/90">
          Return to Home
        </a>
      </div>
    </div>
  );
};

export default NotFound;
