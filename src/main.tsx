import { createRoot } from "react-dom/client";
import { HelmetProvider } from "react-helmet-async";
import App from "./App.tsx";
import "./index.css";

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
  <HelmetProvider>
    <App />
  </HelmetProvider>
);
