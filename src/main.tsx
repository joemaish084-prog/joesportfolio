// Must run before React renders anything.
import "@/lib/domGuard";
import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import { RootErrorBoundary } from "@/components/RootErrorBoundary";
import "./index.css";

// Some browsers (seen in the X app's in-app browser) can run this entry bundle a
// second time in the same page. Each run carries its own copy of React, and a
// second createRoot on #root makes page chunks, which are bound to the first
// copy, render under the second: React error #321 and the "Something went wrong"
// screen. Only the first run may mount.
const bootWindow = window as Window & { __jmAppMounted?: boolean };

if (bootWindow.__jmAppMounted) {
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
