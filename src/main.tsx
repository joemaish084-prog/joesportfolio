// Keep styles in the HTML's initial dependency graph for the prerendered page.
import "./index.css";
import "./styles/type-pairs.css";

// Keep React and all app imports out of this entry module. A module requested
// from the bare domain can redirect to www and then be imported again by a lazy
// route at its final URL. If React lives here, those two module identities get
// separate hook dispatchers even though import.meta.url is identical for both.
// Relative imports resolve against the final response URL, so both entry copies
// load the same bootstrap module (also when the entry has a query or fragment).
//
// On a slow or flaky connection this import can fail outright, and nothing else
// is running yet to recover from it: the prerendered HTML stays on screen but
// never becomes interactive. Retry a few times (current browsers fetch a failed
// module again on the next import), then reload the page once as a last resort.
const RETRY_DELAYS_MS = [1000, 3000, 6000];

function loadBootstrap(attempt = 0): Promise<unknown> {
  return import("./bootstrap").then(() => {
    try {
      sessionStorage.removeItem("bootstrap-reload");
    } catch {
      // Storage blocked: nothing to clear.
    }
  }, (error) => {
    if (attempt < RETRY_DELAYS_MS.length) {
      return new Promise((resolve) => setTimeout(resolve, RETRY_DELAYS_MS[attempt])).then(() => loadBootstrap(attempt + 1));
    }
    try {
      if (!sessionStorage.getItem("bootstrap-reload")) {
        sessionStorage.setItem("bootstrap-reload", "1");
        window.location.reload();
        return;
      }
    } catch {
      // Storage blocked: fall through and report.
    }
    console.error("App failed to load", error);
  });
}

void loadBootstrap();
