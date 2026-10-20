// Runs after `vite build`. Writes a static HTML file for every public route so
// crawlers and link previews (WhatsApp, LinkedIn, X, Facebook) that never run
// JavaScript get the right title, description, social card, JSON-LD and text.
// Also writes sitemap.xml from the same route list.
//
// Route data comes from src/prerender/routes.tsx, bundled here with Vite so it
// shares the app's data files and hashed asset URLs.

import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";
import { build } from "vite";

const root = process.cwd();
const dist = path.join(root, "dist");
const cacheDir = path.join(root, "node_modules", ".cache", "prerender");

await build({
  configFile: false,
  root,
  publicDir: false,
  logLevel: "warn",
  resolve: { alias: { "@": path.join(root, "src") } },
  esbuild: { jsx: "automatic" },
  build: {
    ssr: "src/prerender/routes.tsx",
    outDir: cacheDir,
    emptyOutDir: true,
    rollupOptions: { output: { entryFileNames: "routes.mjs" } },
  },
});

const { getPrerenderRoutes, headTags, SITE_URL } = await import(
  pathToFileURL(path.join(cacheDir, "routes.mjs")).href
);

const template = fs.readFileSync(path.join(dist, "index.html"), "utf8");

const escapeAttr = (value) =>
  String(value).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const escapeText = (value) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
// JSON inside <script> must not be able to close the tag.
const safeJson = (value) => JSON.stringify(value).replace(/</g, "\\u003c");

function renderHead(head) {
  const lines = [`<title>${escapeText(head.title)}</title>`];
  for (const { tag, attrs } of headTags(head)) {
    const attrText = Object.entries(attrs)
      .map(([k, v]) => `${k}="${escapeAttr(v)}"`)
      .join(" ");
    // data-rh lets react-helmet-async take these over once the app mounts.
    lines.push(`<${tag} data-rh="true" ${attrText} />`);
  }
  for (const schema of head.jsonLd ?? []) {
    lines.push(`<script type="application/ld+json" data-rh="true">${safeJson(schema)}</script>`);
  }
  return lines.join("\n    ");
}

function replaceRegion(html, name, replacement) {
  const pattern = new RegExp(`<!-- prerender:${name} -->[\\s\\S]*?<!-- /prerender:${name} -->`);
  if (!pattern.test(html)) throw new Error(`prerender: marker "${name}" missing from dist/index.html`);
  return html.replace(pattern, () => replacement);
}

// Homepage-only structured data and its <noscript> summary.
const stripHomeOnly = (html) =>
  ["home-schema", "home-schema-rating", "home-body"].reduce((out, name) => replaceRegion(out, name, ""), html);

function renderPage(route) {
  let html = replaceRegion(template, "head", renderHead(route.head));
  if (route.path !== "/") html = stripHomeOnly(html);
  if (route.body) {
    if (!html.includes('<div id="root"></div>')) throw new Error("prerender: empty #root not found");
    html = html.replace('<div id="root"></div>', () => `<div id="root">${route.body}</div>`);
  }
  return html;
}

function outputFile(routePath) {
  // vercel.json sets cleanUrls, so /agency/blog is served from agency/blog.html.
  return routePath === "/" ? "index.html" : `${routePath.replace(/^\//, "")}.html`;
}

const routes = getPrerenderRoutes();
const seen = new Set();
for (const route of routes) {
  if (seen.has(route.path)) throw new Error(`prerender: duplicate route ${route.path}`);
  seen.add(route.path);
  const file = path.join(dist, outputFile(route.path));
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, renderPage(route));
}

// Fallback for routes that are not prerendered (the private hub, admin, 404s).
// Same app, generic head, never indexed.
const home = routes.find((r) => r.path === "/");
fs.writeFileSync(
  path.join(dist, "spa-shell.html"),
  stripHomeOnly(replaceRegion(template, "head", renderHead({ ...home.head, noindex: true }))),
);

const sitemapEntries = routes
  .filter((r) => r.sitemap && !r.head.noindex)
  .map((r) => {
    const loc = `${SITE_URL}${r.path === "/" ? "/" : r.path}`;
    const lastmod = r.sitemap.lastmod ? `\n    <lastmod>${r.sitemap.lastmod}</lastmod>` : "";
    return `  <url>\n    <loc>${loc}</loc>${lastmod}\n    <changefreq>${r.sitemap.changefreq}</changefreq>\n    <priority>${r.sitemap.priority.toFixed(1)}</priority>\n  </url>`;
  });
fs.writeFileSync(
  path.join(dist, "sitemap.xml"),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapEntries.join("\n")}\n</urlset>\n`,
);

console.log(`prerender: ${routes.length} routes, ${sitemapEntries.length} sitemap entries`);
