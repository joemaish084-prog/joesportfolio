// Must run before React renders anything.
import "@/lib/domGuard";
import { createRoot, hydrateRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
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
    Boolean(container.querySelector(":scope > .studio-agency"));
  const hydratePortfolio = pathname === PORTFOLIO_PATH && (!hash || hash === "#selected-work") &&
    Boolean(container.querySelector(".studio-portfolio"));
  const hydratePrimary = hydrateAgency || hydratePortfolio;
  const app = (
    <RootErrorBoundary>
      <HelmetProvider>
        <App hydratePrimary={hydratePrimary} />
      </HelmetProvider>
    </RootErrorBoundary>
  );
  if (hydratePrimary) hydrateRoot(container, app);
  else createRoot(container).render(app);
  bootWindow.__jmAppMounted = true;
}
