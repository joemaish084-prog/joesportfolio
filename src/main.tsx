// Must run before React renders anything.
import "@/lib/domGuard";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import { RootErrorBoundary } from "@/components/RootErrorBoundary";
import "./index.css";

// Some in-app browsers (seen in X and WhatsApp) can run this entry bundle twice in
// one page, once from an odd URL such as index-*.js?something. Each run carries
// its own copy of React, but lazy page chunks always import the entry at its plain
// URL. If the odd copy mounts, those chunks call hooks on a React that is not
// rendering: "Cannot read properties of null (reading 'useContext')" / error #321
// and the "Something went wrong" screen. So only the plain-URL run may mount; an
// odd-URL run loads the plain one instead and steps aside.
const bootWindow = window as Window & { __jmAppMounted?: boolean };
const entryUrl = new URL(import.meta.url);
const isCanonicalEntry = import.meta.env.DEV || (!entryUrl.search && !entryUrl.hash);

if (!isCanonicalEntry) {
  console.warn("App bundle loaded from a non-canonical URL; deferring to the canonical one");
  import(/* @vite-ignore */ entryUrl.origin + entryUrl.pathname);
} else if (bootWindow.__jmAppMounted) {
  console.warn("App bundle ran twice; skipped the second mount");
} else {
  bootWindow.__jmAppMounted = true;

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
}
