// Run after npm run build. Check the HTML that crawlers actually receive.
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { getPrerenderRoutes, SITE_URL } from "../node_modules/.cache/prerender/routes.mjs";

const routes = getPrerenderRoutes();
const routePaths = new Set(routes.map((route) => route.path));
const titles = new Set();
let links = 0;
let images = 0;
const decode = (text) => text.replace(/&quot;/g, '"').replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&");
const fileFor = (route) => path.join("dist", route === "/" ? "index.html" : `${route.slice(1)}.html`);
const tags = (html, name) => [...html.matchAll(new RegExp(`<${name}\\b([^>]*)>`, "g"))].map((match) =>
  Object.fromEntries([...match[1].matchAll(/([\w:-]+)="([^"]*)"/g)].map(([, key, value]) => [key, decode(value)])),
);
const schemaNodes = (node, check) => {
  if (!node || typeof node !== "object") return;
  check(node);
  Object.values(node).forEach((child) => schemaNodes(child, check));
};
const localFile = (url) => path.join("dist", decodeURIComponent(url.pathname.slice(1)));

for (const route of routes) {
  const html = fs.readFileSync(fileFor(route.path), "utf8");
  const label = route.path;
  const metas = tags(html, "meta");
  const meta = (name) => metas.filter((tag) => tag.name === name || tag.property === name);
  const canonical = `${SITE_URL}${route.path}`;
  const title = [...html.matchAll(/<title[^>]*>(.*?)<\/title>/gs)];
  assert.equal(title.length, 1, `${label}: exactly one title`);
  assert.equal(decode(title[0][1]), route.head.title, `${label}: generated title matches source`);
  assert(!titles.has(route.head.title), `${label}: duplicate title`);
  titles.add(route.head.title);
  assert.equal(meta("description").length, 1, `${label}: exactly one description`);
  assert.equal(meta("description")[0].content, route.head.description, `${label}: description matches source`);
  assert.deepEqual(tags(html, "link").filter((tag) => tag.rel === "canonical").map((tag) => tag.href), [canonical], `${label}: self canonical`);
  assert.equal(meta("robots").length, 1, `${label}: exactly one robots directive`);
  assert.equal(meta("robots")[0].content.includes("noindex"), Boolean(route.head.noindex), `${label}: indexing matches draft status`);
  assert.equal((html.match(/<h1\b/g) ?? []).length, 1, `${label}: exactly one H1`);
  assert.match(html, /<div id="root">[\s\S]+?<\/div>/, `${label}: readable initial HTML`);
  assert.equal(meta("og:url")[0]?.content, canonical, `${label}: Open Graph URL`);
  for (const name of ["og:image", "twitter:image"]) {
    assert.equal(meta(name).length, 1, `${label}: ${name}`);
    const url = new URL(meta(name)[0].content);
    assert.equal(url.protocol, "https:", `${label}: HTTPS social image`);
    if (url.origin === SITE_URL) assert(fs.existsSync(localFile(url)), `${label}: missing social image ${url.pathname}`);
  }
  for (const image of tags(html, "img")) {
    images++;
    assert(Object.hasOwn(image, "alt"), `${label}: image needs alt (empty for decorative images)`);
    const url = new URL(image.src, canonical);
    if (url.origin === SITE_URL) assert(fs.existsSync(localFile(url)), `${label}: missing image ${url.pathname}`);
  }
  for (const link of tags(html, "a")) {
    if (!link.href) continue;
    const url = new URL(link.href, canonical);
    if (url.origin !== SITE_URL) continue;
    links++;
    // Hash destinations inside interactive sections are checked in the browser.
    assert(routePaths.has(url.pathname) || fs.existsSync(localFile(url)), `${label}: broken internal link ${link.href}`);
  }
  const schemas = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((match) => JSON.parse(match[1]));
  schemas.forEach((schema) => schemaNodes(schema, (node) => {
    for (const key of ["price", "minPrice", "maxPrice"]) {
      if (key in node) assert(Number.isFinite(Number(node[key])), `${label}: ${key} must be numeric`);
    }
    assert(node["@type"] !== "AggregateRating", `${label}: unsupported testimonial rating markup`);
  }));
  if (route.path.startsWith("/agency/blog/") || route.path.startsWith("/agency/lead") || route.path === "/agency/ad-budget-calculator") {
    assert(schemas.some((schema) => schema["@type"] === "BreadcrumbList"), `${label}: standalone breadcrumbs`);
  }
}

const sitemap = fs.readFileSync("dist/sitemap.xml", "utf8");
const locations = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((match) => decode(match[1])).sort();
const expected = routes.filter((route) => route.sitemap && !route.head.noindex).map((route) => `${SITE_URL}${route.path}`).sort();
assert.deepEqual(locations, expected, "Sitemap must list exactly the canonical, indexable routes");
assert(fs.readFileSync("dist/robots.txt", "utf8").includes(`Sitemap: ${SITE_URL}/sitemap.xml`), "Robots sitemap declaration");
assert(fs.existsSync("dist/llms.txt"), "Optional llms.txt is preserved");
for (const file of ["spa-shell.html", "404.html"]) {
  assert(tags(fs.readFileSync(`dist/${file}`, "utf8"), "meta").some((tag) => tag.name === "robots" && tag.content.includes("noindex")), `${file}: must remain noindex`);
}
const config = JSON.parse(fs.readFileSync("vercel.json", "utf8"));
assert(config.rewrites.every((rule) => ["/hub/:path*", "/admin"].includes(rule.source)), "Unknown URLs must reach the real 404, not an SPA catch-all");
assert(config.redirects.some((rule) => rule.has?.some((condition) => condition.type === "host" && condition.value === "josephmaina.co.ke") && rule.permanent && rule.destination === `${SITE_URL}/:path*`), "Apex domain must redirect to canonical www host");
console.log(`SEO checks passed: ${routes.length} pages, ${locations.length} sitemap entries, ${links} internal links, ${images} image tags.`);
