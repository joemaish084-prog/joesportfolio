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
console.log(`Performance checks passed: visible initial hero, ${Math.round(bytes / 1024)} KiB initial JS gzip, ${variants} responsive image references.`);
