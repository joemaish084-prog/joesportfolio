import { describe, expect, it } from "vitest";
import { leadSource, readAttribution } from "./attribution";

const HOST = "www.josephmaina.co.ke";

describe("readAttribution", () => {
  it("prefers utm tags and keeps the landing path", () => {
    const result = readAttribution("?utm_source=facebook&utm_medium=paid&utm_campaign=audit", "https://google.com/", "/agency/lead-generation", HOST);
    expect(result).toEqual({ source: "facebook", medium: "paid", campaign: "audit", landing: "/agency/lead-generation" });
    expect(leadSource(result)).toBe("facebook / paid / audit");
  });

  it("keeps supporting the older ?source= links", () => {
    expect(readAttribution("?source=newsletter", "", "/agency", HOST).source).toBe("newsletter");
  });

  it("treats a Google Ads click as google / cpc", () => {
    expect(leadSource(readAttribution("?gclid=abc", "", "/", HOST))).toBe("google / cpc");
  });

  it("falls back to the referring site, ignoring the site itself", () => {
    expect(readAttribution("", "https://www.linkedin.com/feed/", "/", HOST).source).toBe("linkedin.com");
    expect(readAttribution("", "https://www.josephmaina.co.ke/agency", "/", HOST).source).toBe("direct");
    expect(readAttribution("", "https://josephmaina.co.ke/agency", "/", HOST).source).toBe("direct");
  });

  it("reports a visit with no signal as direct", () => {
    expect(leadSource(readAttribution("", "", "/", HOST))).toBe("direct");
  });

  it("caps long tag values", () => {
    expect(readAttribution(`?utm_source=${"x".repeat(300)}`, "", "/", HOST).source).toHaveLength(80);
  });
});
