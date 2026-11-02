// Must run before React renders anything.
import "@/lib/domGuard";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App";
import { RootErrorBoundary } from "@/components/RootErrorBoundary";

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

  createRoot(document.getElementById("root")!).render(
    <RootErrorBoundary>
      <HelmetProvider>
        <App />
      </HelmetProvider>
    </RootErrorBoundary>
  );
  bootWindow.__jmAppMounted = true;
}
