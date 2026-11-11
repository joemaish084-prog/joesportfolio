import { readFileSync } from "node:fs";
import { runInNewContext } from "node:vm";
import { afterEach, describe, expect, it, vi } from "vitest";
import { grantAnalyticsConsent } from "./analytics";
import { track } from "./track";

const html = readFileSync("index.html", "utf8");
const bootstrap = html.split("<!-- Agency GA4 Google tag.")[1].match(/<script>([\s\S]*?)<\/script>/)![1];
const id = "G-X86CZEY9GV";

function setup(pathname = "/agency", consent = "denied") {
  const appendChild = vi.fn();
  const gtag = vi.fn();
  const scheduled: (() => void)[] = [];
  const listeners: Record<string, () => void> = {};
  const browser: Record<string, unknown> = {
    location: { pathname },
    addEventListener: (event: string, callback: () => void) => { listeners[event] = callback; },
  };
  const location = browser.location as { pathname: string };
  const history = Object.fromEntries(["pushState", "replaceState"].map(method => [method,
    (_state: unknown, _title: string, url: string) => { location.pathname = new URL(url, "https://www.josephmaina.co.ke").pathname; },
  ]));
  runInNewContext(bootstrap, {
    window: browser, history, c: consent, gtag, Date,
    afterInitialRender: (callback: () => void) => scheduled.push(callback),
    document: { createElement: () => ({}), head: { appendChild } },
  });
  const load = browser.loadGoogleAnalytics as () => void;
  return { browser, history, listeners, location, load, gtag, appendChild, flush: () => scheduled.splice(0).forEach(callback => callback()) };
}

afterEach(() => vi.unstubAllGlobals());

describe("agency Google tag bootstrap", () => {
  it("waits for consent, configures once and loads only one Google tag", () => {
    const app = setup();
    app.load();
    app.flush();
    expect(app.gtag).not.toHaveBeenCalled();
    expect(app.appendChild).not.toHaveBeenCalled();
    app.browser.analyticsConsentGranted = true;
    app.load();
    app.load();
    app.history.pushState(null, "", "/agency/pricing");
    app.flush();
    expect(app.gtag.mock.calls.filter(call => call[0] === "config")).toEqual([["config", id, { send_page_view: true }]]);
    expect(app.appendChild).toHaveBeenCalledOnce();
    expect(app.appendChild.mock.calls[0][0].src).toBe(`https://www.googletagmanager.com/gtag/js?id=${id}`);
    expect(html).not.toContain("GTM-K789XFXX");
  });

  it.each(["/hub", "/hub/clients/123", "/portal", "/portal/projects", "/admin"])("does not initialize on private route %s", pathname => {
    const app = setup(pathname, "granted");
    app.load();
    app.flush();
    expect(app.browser[`ga-disable-${id}`]).toBe(true);
    expect(app.gtag).not.toHaveBeenCalled();
    expect(app.appendChild).not.toHaveBeenCalled();
    app.history.pushState(null, "", "/agency");
    app.flush();
    expect(app.browser[`ga-disable-${id}`]).toBe(false);
    expect(app.appendChild).toHaveBeenCalledOnce();
  });

  it("suppresses private SPA visits and restores public collection without reconfiguring", () => {
    const app = setup("/agency", "granted");
    app.load();
    app.history.pushState(null, "", "/portal/client");
    expect(app.browser[`ga-disable-${id}`]).toBe(true);
    app.history.replaceState(null, "", "/agency/results");
    expect(app.browser[`ga-disable-${id}`]).toBe(false);
    app.location.pathname = "/hub";
    app.listeners.popstate();
    expect(app.browser[`ga-disable-${id}`]).toBe(true);
    expect(app.gtag.mock.calls.filter(call => call[0] === "config")).toHaveLength(1);
  });
});

describe("agency conversion events", () => {
  it("sends an accepted public conversion to the correct stream", () => {
    const gtag = vi.fn();
    vi.stubGlobal("window", { location: { pathname: "/agency/contact" }, analyticsConsentGranted: true, gtag });
    track("generate_lead", { form_location: "agency_brief" });
    expect(gtag).toHaveBeenCalledExactlyOnceWith("event", "generate_lead", { form_location: "agency_brief", send_to: id });
  });

  it.each([
    [false, "/agency"], [true, "/hub"], [true, "/hub/clients"], [true, "/portal"], [true, "/admin"],
  ])("does not send a GA event with consent=%s on %s", (consent, pathname) => {
    const gtag = vi.fn();
    vi.stubGlobal("window", { location: { pathname }, analyticsConsentGranted: consent, gtag });
    track("generate_lead");
    expect(gtag).not.toHaveBeenCalled();
  });

  it("updates consent before starting the Google tag", () => {
    const loadGoogleAnalytics = vi.fn();
    const browser = { dataLayer: [] as unknown[], loadGoogleAnalytics, loadMetaPixel: vi.fn(), analyticsConsentGranted: false };
    vi.stubGlobal("window", browser);
    grantAnalyticsConsent();
    expect(Array.from(browser.dataLayer[0] as ArrayLike<unknown>).slice(0, 2)).toEqual(["consent", "update"]);
    expect(browser.analyticsConsentGranted).toBe(true);
    expect(loadGoogleAnalytics).toHaveBeenCalledOnce();
  });
});
