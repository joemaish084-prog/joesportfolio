// Validate the public information architecture delivered without JavaScript.
import assert from "node:assert/strict";
import fs from "node:fs";

const origin = "https://www.josephmaina.co.ke";
const routes = ["/agency", "/agency/services", "/agency/results", "/agency/pricing", "/agency/contact"];
const read = path => fs.readFileSync(`dist${path}.html`, "utf8");
const links = html => [...html.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map(match => match[1]);
const sitemap = fs.readFileSync("dist/sitemap.xml", "utf8");
const mainContent = new Set();
for (const path of routes) {
  const html = read(path);
  assert(sitemap.includes(`<loc>${origin}${path}</loc>`), `${path}: must be in sitemap`);
  const root = html.slice(html.indexOf('<div id="root">'));
  assert(!root.includes('data-prerender="'), `${path}: render the actual page, not a hidden summary`);
  const main = root.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1];
  assert(main, `${path}: needs a main landmark`);
  assert(!mainContent.has(main), `${path}: must have distinct content`);
  mainContent.add(main);
  const nav = root.match(/<nav aria-label="Agency pages"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
  assert(nav, `${path}: crawlable agency navigation`);
  for (const destination of routes) assert(links(nav).includes(destination), `${path}: missing navigation to ${destination}`);
  assert(links(root).includes("/"), `${path}: portfolio link`);
  const schemas = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]));
  const organizations = schemas.filter(schema => schema["@type"] === "Organization");
  assert.equal(organizations.length, 1, `${path}: one consistent agency organization`);
  assert.equal(organizations[0]["@id"], `${origin}/agency#organization`);
  assert(!JSON.stringify(organizations[0]).includes("aggregateRating"), "No invented ratings");
  assert(schemas.some(schema => schema["@type"] === "BreadcrumbList"), `${path}: breadcrumbs`);
}
const services = read("/agency/services");
const pricing = read("/agency/pricing");
const results = read("/agency/results");
const contact = read("/agency/contact");
const home = read("/agency");
for (const slug of ["digital-marketing-kenya", "meta-ads-management", "google-ads-management", "seo-services-nairobi", "social-media-management", "lead-generation", "digital-marketing-audit"]) {
  assert(links(services).includes(`/agency/${slug}`), `Existing service retained: ${slug}`);
  assert(sitemap.includes(`<loc>${origin}/agency/${slug}</loc>`), `Existing service in sitemap: ${slug}`);
}
assert(!home.includes('id="booking"') && !home.includes('id="results"'), "Homepage should link to detailed sections rather than duplicate them");
assert(pricing.includes("STARTER") && pricing.includes("GROWTH") && pricing.includes("SCALE") && pricing.includes("<table"), "Pricing page retains packages and fee comparison");
assert(!services.includes("Retainer Packages"), "Detailed packages belong on Pricing");
assert(results.includes("Read the campaign breakdowns"), "Results page needs campaign context");
assert(new Set(links(results).filter(path => path.startsWith("/agency/blog/") && !path.includes("/topics/"))).size >= 3, "Results must link to full campaign case studies");
assert(contact.includes("<form") && links(contact).includes("mailto:joemaish084@gmail.com") && links(contact).includes("tel:+254704700160"), "Contact keeps its brief form and direct channels");
for (const match of pricing.matchAll(/href="\/agency\/services#([^"]+)"/g)) {
  assert(services.includes(`id="${match[1]}"`), `Pricing scope link must resolve: ${match[1]}`);
}
const portfolio = fs.readFileSync("dist/index.html", "utf8");
assert(links(portfolio).includes("/agency"), "Portfolio must link to agency home");
assert(home.includes("founder-led digital marketing agency in Nairobi"), "Agency home states the positioning");
assert(new Set(links(home).filter(path => path.startsWith("/work/case-studies#"))).size === 3, "Agency home links to three case study results");
for (const pack of ["starter", "growth", "scale"]) assert(links(pricing).includes(`/agency/contact?service=${pack}#brief`), `Pricing preselects the ${pack} package`);
assert(contact.includes('id="brief"'), "Contact has the brief form anchor");
assert(contact.includes("embed_domain="), "Booking embed can report bookings back to the page");
assert(!portfolio.includes("Live results"), "Fixed figures must not be labelled as live");
for (const [label, html] of [["portfolio", portfolio], ["contact", contact]]) {
  const gate = html.indexOf("window.loadMetaPixel=function");
  assert(gate >= 0 && html.indexOf("fbq('init'") > gate, `${label}: Meta Pixel must wait for cookie consent`);
  assert(!html.includes("facebook.com/tr?"), `${label}: no-script pixel cannot ask for consent`);
}
assert(!/^Disallow:\s*\/(?:agency(?:\/|\s|$)|\s*$)/mi.test(fs.readFileSync("dist/robots.txt", "utf8")), "Robots must allow agency crawling");
console.log("Agency checks passed: five distinct prerendered pages, seven existing services, navigation, schemas, sitemap and contact channels.");
