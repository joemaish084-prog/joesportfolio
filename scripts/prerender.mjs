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

const { getPrerenderRoutes, headTags, renderOgCard, SITE_URL } = await import(
  pathToFileURL(path.join(cacheDir, "routes.mjs")).href
);

const template = fs.readFileSync(path.join(dist, "index.html"), "utf8");
const manifest = JSON.parse(fs.readFileSync(path.join(dist, ".vite/manifest.json"), "utf8"));
const initialRouteModules = {
  "/": "src/pages/Index.tsx",
  "/agency/blog": "src/pages/AgencyBlog.tsx",
  "/agency": "src/pages/Agency.tsx",
  "/agency/services": "src/pages/Agency.tsx",
  "/agency/results": "src/pages/Agency.tsx",
  "/agency/pricing": "src/pages/Agency.tsx",
  "/agency/contact": "src/pages/Agency.tsx",
  "/work/case-studies": "src/pages/WorkCaseStudies.tsx",
};

// Discover the initial route in parallel with the app, without preloading other
// routes or their dynamic imports (CV, galleries and other optional features).
function routePreloads(routePath) {
  const files = new Set();
  function visit(key) {
    const chunk = manifest[key];
    if (!chunk || files.has(chunk.file)) return;
    files.add(chunk.file);
    for (const dependency of chunk.imports ?? []) visit(dependency);
  }
  visit(initialRouteModules[routePath]);
  return [...files].map(file => `<link rel="modulepreload" href="/${file}" crossorigin>`).join("\n");
}

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
  // Markers are kept so dist/index.html (the homepage) still works as the
  // template if this script runs again without a fresh `vite build`.
  return html.replace(pattern, () => `<!-- prerender:${name} -->${replacement}<!-- /prerender:${name} -->`);
}

// Homepage-only structured data and its <noscript> summary.
const stripHomeOnly = (html) =>
  ["home-schema", "home-body"].reduce((out, name) => replaceRegion(out, name, ""), html);

function renderPage(route) {
  let html = replaceRegion(template, "head", renderHead(route.head));
  html = html.replace("</head>", () => `${routePreloads(route.path)}\n</head>`);
  // The homepage now has regular HTML in #root, just like every public route.
  html = replaceRegion(html, "home-body", "");
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

// Social cards. Each head that points at /og/<path>.png must have a card to draw.
const font = (pkg, file) => fs.readFileSync(path.join(root, "node_modules", "@fontsource", pkg, "files", file));
const ogAssets = {
  fonts: [
    { name: "Space Grotesk", data: font("space-grotesk", "space-grotesk-latin-700-normal.woff"), weight: 700, style: "normal" },
    { name: "Inter", data: font("inter", "inter-latin-500-normal.woff"), weight: 500, style: "normal" },
    { name: "Inter", data: font("inter", "inter-latin-600-normal.woff"), weight: 600, style: "normal" },
  ],
  logo: `data:image/png;base64,${fs.readFileSync(path.join(root, "public", "icon-512.png")).toString("base64")}`,
};
let cards = 0;
for (const route of routes) {
  const expected = `/og${route.path}.png`;
  if (route.head.image === expected && !route.card) {
    throw new Error(`prerender: ${route.path} uses ${expected} but has no card`);
  }
  if (!route.card) continue;
  if (route.head.image !== expected) throw new Error(`prerender: ${route.path} has a card its head does not use`);
  const file = path.join(dist, expected.slice(1));
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, await renderOgCard(route.card, ogAssets));
  cards++;
}

// Fallback for routes that are not prerendered (the private hub, admin, 404s).
// Same app, generic head, never indexed.
const home = routes.find((r) => r.path === "/");
fs.writeFileSync(
  path.join(dist, "spa-shell.html"),
  stripHomeOnly(replaceRegion(template, "head", renderHead({ ...home.head, noindex: true }))),
);

// Vercel serves this with HTTP 404 when no public file or private rewrite matches.
fs.writeFileSync(path.join(dist, "404.html"), renderPage({
  path: "/404",
  head: {
    title: "Page Not Found (404) | Joseph Maina",
    description: "This page could not be found. Explore Joseph Maina's portfolio, services and blog.",
    path: "/404",
    noindex: true,
  },
  body: '<main style="max-width:880px;margin:auto;padding:24px;font-family:system-ui"><h1>Page not found</h1><p>This page may have moved or the address may be incorrect.</p><p><a href="/">Visit the portfolio</a> · <a href="/agency">Explore services</a> · <a href="/agency/blog">Read the blog</a></p></main>',
}));

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

console.log(`prerender: ${routes.length} routes, ${cards} social cards, ${sitemapEntries.length} sitemap entries`);
