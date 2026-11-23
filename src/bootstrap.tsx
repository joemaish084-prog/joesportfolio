// Must run before React renders anything.
import "@/lib/domGuard";
import { createRoot, hydrateRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import { preloadPrimaryView } from "./pages/primaryViews";
import { RootErrorBoundary } from "@/components/RootErrorBoundary";
import { isLegacyPortfolioAnchor, PORTFOLIO_PATH } from "@/lib/publicViews";

const bootWindow = window as Window & { __jmAppMounted?: boolean };

if (!bootWindow.__jmAppMounted) {
  // A lazy chunk that fails to load (flaky mobile network, or a stale tab after a
  // deploy) would otherwise unmount the whole app and leave a black screen.
  window.addEventListener("vite:preloadError", (event) => {
    event.preventDefault();
    try {
      if (sessionStorage.getItem("chunk-reload")) return;
      sessionStorage.setItem("chunk-reload", "1");
    } catch {
      return;
    }
    window.location.reload();
  });

  const container = document.getElementById("root")!;
  const { pathname, hash } = window.location;
  const hydrateAgency = pathname === "/" && !isLegacyPortfolioAnchor(hash) &&
    Boolean(container.querySelector(":scope > [data-agency-home]"));
  const hydratePortfolio = pathname === PORTFOLIO_PATH && (!hash || hash === "#selected-work") &&
    Boolean(container.querySelector("[data-portfolio-home]"));
  const hydrateResults = pathname === "/agency/results" &&
    Boolean(container.querySelector(":scope > [data-agency-results]"));
  const hydratePrimary = hydrateAgency || hydratePortfolio || hydrateResults;
  const app = (
    <RootErrorBoundary>
      <HelmetProvider>
        <App hydratePrimary={hydratePrimary} />
      </HelmetProvider>
    </RootErrorBoundary>
  );
  bootWindow.__jmAppMounted = true;
  // Tells the CSS safety net in index.css that React now drives scroll reveals.
  const markReady = () => document.documentElement.setAttribute("data-app-ready", "");
  const hydrate = () => {
    hydrateRoot(container, app);
    markReady();
  };
  if (hydrateAgency || hydratePortfolio) {
    // Resolve the prerendered view before React hydrates its Suspense boundary.
    void preloadPrimaryView(hydrateAgency ? "/" : PORTFOLIO_PATH).then(hydrate, hydrate);
  } else if (hydratePrimary) {
    hydrate();
  } else {
    createRoot(container).render(app);
    markReady();
  }
}
