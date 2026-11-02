// Keep styles in the HTML's initial dependency graph for the prerendered page.
import "./index.css";

// Keep React and all app imports out of this entry module. A module requested
// from the bare domain can redirect to www and then be imported again by a lazy
// route at its final URL. If React lives here, those two module identities get
// separate hook dispatchers even though import.meta.url is identical for both.
// Relative imports resolve against the final response URL, so both entry copies
// load the same bootstrap module (also when the entry has a query or fragment).
import("./bootstrap");
