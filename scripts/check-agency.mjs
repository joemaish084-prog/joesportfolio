// Validate the public information architecture delivered without JavaScript.
import assert from "node:assert/strict";
import fs from "node:fs";

const origin = "https://www.josephmaina.co.ke";
const routes = ["/", "/agency/services", "/agency/results", "/agency/pricing", "/agency/contact"];
const read = path => fs.readFileSync(path === "/" ? "dist/index.html" : `dist${path}.html`, "utf8");
const links = html => [...html.matchAll(/<a\b[^>]*href="([^"]+)"/g)].map(match => match[1]);
const isHotlinked = html => /<img\b[^>]*\bsrc="https?:\/\//i.test(html);
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
  assert(links(root).includes("/portfolio"), `${path}: portfolio link`);
  const schemas = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]));
  const organizations = schemas.filter(schema => [].concat(schema["@type"] ?? []).includes("Organization"));
  assert.equal(organizations.length, 1, `${path}: one consistent agency organization`);
  assert.equal(organizations[0]["@id"], `${origin}/agency#organization`);
  assert(!JSON.stringify(organizations[0]).includes("aggregateRating"), "No invented ratings");
  if (path === "/") assert(organizations[0]["@type"].includes("LocalBusiness"), "Agency home identifies a Nairobi business");
  else assert(schemas.some(schema => schema["@type"] === "BreadcrumbList"), `${path}: breadcrumbs`);
}
const services = read("/agency/services");
const pricing = read("/agency/pricing");
const results = read("/agency/results");
const contact = read("/agency/contact");
const home = read("/");
const websiteAdsPath = "/agency/website-and-ads";
assert(links(services).includes(websiteAdsPath), "Services links to the website and ads offer");
assert(links(pricing).includes(websiteAdsPath), "Pricing links to the website and ads offer");
assert(sitemap.includes(`<loc>${origin}${websiteAdsPath}</loc>`), "The website and ads offer is in the sitemap");
const websiteAds = read(websiteAdsPath);
assert(websiteAds.includes("KSh 480,000") && websiteAds.includes("KSh 260,000"), "Both website and ads packages are prerendered");
assert(links(websiteAds).includes("/agency/contact?service=website-and-ads#brief"), "The website and ads offer links to the contact brief");
for (const [key, html] of [["services", services], ["pricing", pricing], ["results", results]]) {
  assert(html.includes(`property="og:image" content="${origin}/og/agency/${key}.png"`), `${key}: unique prerendered share image`);
}
for (const [key, html, photo] of [["pricing", pricing, "pricing-planning"], ["results", results, "results-reporting"]]) {
  const heroImage = html.match(new RegExp(`<img\\b[^>]*src="/media/agency/${photo}-960.webp"[^>]*>`))?.[0];
  assert(heroImage?.includes('loading="eager"'), `${key}: load the initial hero image eagerly`);
  assert(heroImage.includes('fetchpriority="high"'), `${key}: prioritize the hero image`);
  assert(html.includes(`"contentUrl":"${origin}/media/agency/${photo}-960.webp"`), `${key}: describe the visible hero in structured data`);
}
const serviceCards = [...services.matchAll(/<li\b[^>]*\bid="service-([^"]+)"[^>]*>([\s\S]*?)<\/li>/g)];
assert(serviceCards.length >= 13, "Core and additional service cards are present before JavaScript");
for (const [, slug, card] of serviceCards) {
  const image = card.match(new RegExp(`<img\\b[^>]*src="/media/agency/${slug}-960.webp"[^>]*>`))?.[0];
  assert(image && /\balt="[^"]+"/.test(image), `${slug}: unique service photo with descriptive alt text`);
  assert(image.includes(`/media/agency/${slug}-480.webp 480w`) && image.includes('loading="lazy"'), `${slug}: responsive lazy-loaded service photo`);
}
assert(pricing.includes("Starting monthly management fees"), "Pricing compares monthly fees in the initial HTML");
assert(results.includes("Attributed revenue by period") && results.includes("Where the property enquiries went"), "Results charts appear in the initial HTML");
const legacyHome = read("/agency");
assert(legacyHome.includes(`rel="canonical" href="${origin}/"`), "The legacy agency entry canonicalizes to home");
assert(!sitemap.includes(`<loc>${origin}/agency</loc>`), "The legacy home alias is excluded from the sitemap");
const catalogSchemas = [...services.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]));
const catalog = catalogSchemas.find(schema => schema["@type"] === "CollectionPage")?.mainEntity;
assert.equal(catalog?.["@type"], "ItemList", "Services directory needs a factual service list");
const directory = services.match(/<nav aria-label="Full service pages"[^>]*>([\s\S]*?)<\/nav>/)?.[1];
assert(directory, "Service directory must be rendered before JavaScript");
assert.equal(catalog.numberOfItems, catalog.itemListElement.length, "Catalog count must match its entries");
assert.deepEqual(catalog.itemListElement.map(entry => new URL(entry.item.url).pathname).sort(), links(directory).sort(), "Catalog must describe exactly the services linked in the directory");
for (const [index, entry] of catalog.itemListElement.entries()) {
  assert.equal(entry.position, index + 1, "Catalog positions are consecutive");
  const path = new URL(entry.item.url).pathname;
  const html = read(path);
  const root = html.slice(html.indexOf('<div id="root">'));
  assert(!root.includes('data-prerender="'), `${path}: actual service content must not be replaced by a hidden summary`);
  assert(root.includes('<main '), `${path}: needs a main landmark`);
  assert(links(root).includes("/agency/services"), `${path}: links back to the directory`);
  const schemas = [...html.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]));
  const service = schemas.find(schema => schema["@type"] === "Service");
  const page = schemas.find(schema => schema["@type"] === "WebPage");
  assert.equal(service?.["@id"], entry.item["@id"], `${path}: directory and detail share the service identity`);
  assert.equal(page?.mainEntity?.["@id"], service["@id"], `${path}: page describes its service`);
  assert.equal(service.mainEntityOfPage?.["@id"], page["@id"], `${path}: service links to its page`);
  if (path !== "/agency/shopify-services") {
    assert(!isHotlinked(root), `${path}: serve gallery and related-post images locally`);
    const hero = page.primaryImageOfPage;
    assert.equal(hero?.["@type"], "ImageObject", `${path}: describe the visible hero image`);
    const image = new URL(hero.contentUrl);
    assert.equal(image.origin, origin, `${path}: host the hero image on the site`);
    assert(fs.existsSync(`dist${image.pathname}`), `${path}: primary image must exist`);
    assert(hero.name && hero.width > 0 && hero.height > 0, `${path}: provide a meaningful hero image description and dimensions`);
  }
  const faq = schemas.find(schema => schema["@type"] === "FAQPage");
  const faqContent = root.match(/<section aria-labelledby="service-faqs"[^>]*>([\s\S]*?)<\/section>/)?.[1];
  if (faq) assert.equal(faq.mainEntity.length, (faqContent?.match(/<dt\b/g) ?? []).length, `${path}: schema FAQs match visible FAQ entries`);
  assert(/rel="modulepreload"[^>]*href="\/assets\/AgencyService-/.test(html), `${path}: preload its route without a JavaScript discovery waterfall`);
}
for (const slug of ["digital-marketing-kenya", "meta-ads-management", "google-ads-management", "seo-services-nairobi", "social-media-management", "lead-generation", "digital-marketing-audit"]) {
  assert(links(services).includes(`/agency/${slug}`), `Existing service retained: ${slug}`);
  assert(sitemap.includes(`<loc>${origin}/agency/${slug}</loc>`), `Existing service in sitemap: ${slug}`);
}
assert(!home.includes('id="booking"') && home.includes('id="agency-results"'), "The homepage links to selected results and keeps the full booking experience on Contact");
const audit = home.match(/<form\b[^>]*aria-label="Free audit request"[\s\S]*?<\/form>/)?.[0];
assert(audit, "The agency home has an audit form");
assert.deepEqual([...audit.matchAll(/<(?:input|select)\b[^>]*name="([^"]+)"/g)].map(match => match[1]), ["name", "phone", "business", "budget", "website"]);
assert(pricing.includes("STARTER") && pricing.includes("GROWTH") && pricing.includes("SCALE") && pricing.includes("<table"), "Pricing page retains packages and fee comparison");
assert(!services.includes("Retainer Packages"), "Detailed packages belong on Pricing");
assert(results.includes("Read the campaign breakdowns"), "Results page needs campaign context");
assert(!isHotlinked(results), "Results images should load from the site");
assert(new Set(links(results).filter(path => path.startsWith("/agency/blog/") && !path.includes("/topics/"))).size >= 3, "Results must link to full campaign case studies");
assert(links(contact).includes("mailto:joemaish084@gmail.com") && links(contact).includes("tel:+254704700160"), "Contact keeps its direct contact details");
for (const match of pricing.matchAll(/href="\/agency\/services#([^"]+)"/g)) {
  assert(services.includes(`id="${match[1]}"`), `Pricing scope link must resolve: ${match[1]}`);
}
const portfolio = read("/portfolio");
const shopify = read("/agency/shopify-services");
const portfolioMain = portfolio.match(/<main\b[^>]*data-portfolio-home[^>]*>[\s\S]*?<\/main>/)?.[0];
assert(portfolioMain, "Portfolio needs its real content before JavaScript");
assert.match(portfolioMain, /<h1\b[^>]*>Digital Marketing That Turns Attention Into/, "Portfolio opens on its original hero");
const portfolioHero = portfolioMain.indexOf('id="home"');
assert(portfolioHero >= 0 && portfolioHero < portfolioMain.indexOf('id="selected-work"'), "The portfolio hero leads the project grid");
assert(links(services).includes("/agency/shopify-services") && links(home).includes("/agency/shopify-services"), "Shopify must be discoverable from agency home and services");
assert(portfolio.includes('id="shopify"') && portfolio.includes("Babyshop Dansar"), "Portfolio renders the real Shopify project before JavaScript");
assert(links(portfolio).includes("https://babyshopdansar.com/") && links(shopify).includes("https://babyshopdansar.com/"), "Shopify proof links to the supplied live store");
assert(shopify.includes("Quoted for your scope"), "Shopify pricing remains quote-based");
const shopifySchemas = [...shopify.matchAll(/<script\b[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map(match => JSON.parse(match[1]));
const shopifySchema = shopifySchemas.find(schema => schema["@type"] === "Service");
assert.equal(shopifySchema.areaServed, "Worldwide", "Shopify serves Kenyan and international clients");
assert(!shopifySchema.offers.priceSpecification, "Unpriced Shopify work must not invent a numeric price");
for (const intent of ["create", "migrate", "manage"]) assert(shopify.includes(`id="${intent}"`), `Shopify supports the ${intent} entry point`);
assert(links(pricing).includes("/agency/shopify-services"), "Pricing links to the quoted Shopify scope");
assert(links(portfolio).includes("/"), "Portfolio must link to agency home");
assert(home.includes("founder-led digital marketing agency in Nairobi"), "Agency home states the positioning");
assert(new Set(links(home).filter(path => path.startsWith("/work/case-studies#"))).size === 3, "Agency home links to three case study results");
for (const pack of ["starter", "growth", "scale"]) assert(links(pricing).includes(`/agency/contact?service=${pack}#brief`), `Pricing passes the ${pack} package to Contact`);
const contactMain = contact.match(/<main\b[^>]*>([\s\S]*?)<\/main>/)?.[1] ?? "";
assert(!/<form\b/.test(contactMain), "Contact directs project enquiries to WhatsApp");
assert(contactMain.includes('id="brief"') && links(contactMain).some(url => url.startsWith("https://wa.me/")), "Brief links land on a crawlable WhatsApp contact option");
assert(contactMain.includes("Show booking calendar"), "Contact offers an on-demand booking calendar");
assert(!/<iframe\b/.test(contactMain), "Contact must not request the booking iframe before activation");
assert(links(contactMain).some(url => url.startsWith("https://calendly.com/")), "Contact has a direct booking link");
const manifest = JSON.parse(fs.readFileSync("dist/.vite/manifest.json", "utf8"));
const agencyModule = Object.entries(manifest).find(([key, chunk]) => key === "src/pages/Agency.tsx" || (chunk.name === "Agency" && chunk.isDynamicEntry))?.[1];
assert(agencyModule && fs.readFileSync(`dist/${agencyModule.file}`, "utf8").includes("initInlineWidget"), "Contact uses Calendly's event-capable inline widget");
assert(!portfolio.includes("Live results"), "Fixed figures must not be labelled as live");
for (const [label, html] of [["portfolio", portfolio], ["contact", contact]]) {
  const gate = html.indexOf("window.loadMetaPixel=function");
  assert(gate >= 0 && html.indexOf("fbq('init'") > gate, `${label}: Meta Pixel must wait for cookie consent`);
  assert(!html.includes("facebook.com/tr?"), `${label}: no-script pixel cannot ask for consent`);
}
assert(!/^Disallow:\s*\/(?:agency(?:\/|\s|$)|\s*$)/mi.test(fs.readFileSync("dist/robots.txt", "utf8")), "Robots must allow agency crawling");
console.log("Agency checks passed: five distinct prerendered pages, seven existing services, navigation, schemas, sitemap and contact channels.");
