// Run after a production build. Guard the delivered first paint and JS budget.
import fs from "node:fs";
import assert from "node:assert/strict";
import { gzipSync } from "node:zlib";

const html = fs.readFileSync("dist/index.html", "utf8");
const root = html.slice(html.indexOf('<div id="root">'));
assert(root.indexOf("<h1") >= 0 && root.indexOf("<h1") < root.indexOf('data-prerender="'), "The real homepage heading must be outside the hidden crawler fallback");
assert.match(root, /<header\b/, "The header must be available before the app loads");
const heading = root.match(/<h1\b([^>]*)>/)?.[1] ?? "";
assert(!/opacity:\s*0(?:;|$)/.test(heading), "The initial headline must not start invisible");
const scripts = [...html.matchAll(/<script\b[^>]*type="module"[^>]*src="([^"]+)"/g)].map((match) => match[1]);
const preloads = [...html.matchAll(/<link\b[^>]*rel="modulepreload"[^>]*href="([^"]+)"/g)].map((match) => match[1]);
const initialJs = [...new Set([...scripts, ...preloads])];
const bytes = initialJs.reduce((total, src) => total + gzipSync(fs.readFileSync(`dist${src}`)).length, 0);
assert(bytes < 220 * 1024, `Initial JavaScript exceeds the 220 KiB gzip budget: ${bytes} bytes`);
let variants = 0;
for (const match of root.matchAll(/<img\b[^>]*srcSet="([^"]+)"/gi)) {
  for (const candidate of match[1].split(",")) {
    const src = candidate.trim().split(/\s+/)[0];
    if (!src.startsWith("/")) continue;
    assert(fs.existsSync(`dist${src}`), `Missing responsive image ${src}`);
    variants++;
  }
}
assert(variants >= 12, "Hero images must expose responsive variants");
const blog = fs.readFileSync("dist/agency/blog.html", "utf8");
const blogRoot = blog.slice(blog.indexOf('<div id="root">'));
assert.match(blogRoot, /<h1\b[^>]*>Digital marketing, written plainly\.<\/h1>/, "The actual blog heading must be in the initial HTML");
assert(!blogRoot.includes('data-prerender="'), "The blog must not hide its content until JavaScript loads");
for (const page of [html, blog]) {
  assert.match(page, /rel="modulepreload"[^>]*href="\/assets\/(?:Index|AgencyBlog)-/, "The initial route must be preloaded");
  for (const font of ["space-grotesk-latin-700-normal.woff2", "inter-latin-400-normal.woff2"]) {
    assert(page.includes(`href="/fonts/${font}"`), `Missing critical font preload: ${font}`);
    assert(fs.existsSync(`dist/fonts/${font}`), `Missing local font: ${font}`);
  }
  assert(!page.includes("family=Inter") && !page.includes("family=Space+Grotesk"), "Primary fonts must not depend on a Google stylesheet");
}
const manifest = JSON.parse(fs.readFileSync("dist/.vite/manifest.json", "utf8"));
function staticDependencies(key, seen = new Set()) {
  if (seen.has(key)) return seen;
  seen.add(key);
  for (const dependency of manifest[key]?.imports ?? []) staticDependencies(dependency, seen);
  return seen;
}
assert(!staticDependencies("src/pages/AgencyBlog.tsx").has("src/pages/Index.tsx"), "The blog must not load the homepage route");
for (const key of staticDependencies("src/pages/AgencyBlog.tsx")) {
  assert(!/\/blogPosts-/.test(manifest[key].file), "The blog listing must not download full article bodies");
}
console.log(`Performance checks passed: visible initial hero, ${Math.round(bytes / 1024)} KiB initial JS gzip, ${variants} responsive image references.`);
