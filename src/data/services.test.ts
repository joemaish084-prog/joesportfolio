import { describe, expect, it } from "vitest";
import { caseStudies } from "@/data/caseStudies";
import { servicePages } from "@/data/servicePages";
import { localizePrice } from "@/lib/market";
import {
  bentoServices, filterServices, formatKes, getPackage, packageComparison, priceLabel, proofItems, retainerPackages, serviceAnchorId,
  servicePrice, services,
} from "@/data/services";

describe("price formatting", () => {
  it("prints the forms the site already uses", () => {
    expect(priceLabel({ kes: 40000, unit: "month", from: true })).toBe("From KES 40,000/month");
    expect(priceLabel({ kes: 40000, unit: "month", from: true }, { short: true })).toBe("from KES 40,000/mo");
    expect(priceLabel({ kes: 40000, unit: "project", from: true }, { short: true })).toBe("from KES 40,000/project");
    expect(priceLabel({ kes: 60000, from: true }, { short: true })).toBe("from KES 60,000");
    expect(priceLabel({ kes: 40000, unit: "session" })).toBe("KES 40,000/session");
    expect(priceLabel({ label: "Free for now" })).toBe("Free for now");
    expect(formatKes(120000)).toBe("120,000");
  });

  it("stays convertible by localizePrice", () => {
    expect(localizePrice(servicePrice("meta-ads"), "INTL")).not.toContain("KES");
  });
});

describe("agreed prices", () => {
  it("matches the figures in the plan", () => {
    expect(servicePrice("meta-ads")).toBe("From KES 40,000/month");
    expect(servicePrice("google-ads")).toBe("From KES 45,000/month");
    expect(servicePrice("social-media-management")).toBe("From KES 40,000/month");
    expect(servicePrice("seo-optimization")).toBe("From KES 45,000/month");
    expect(retainerPackages.map((p) => priceLabel(p.price))).toEqual([
      "From KES 40,000/month",
      "From KES 70,000/month",
      "From KES 120,000/month",
    ]);
    expect(getPackage("GROWTH").highlight).toBe(true);
  });

  it("keeps paired prices equal, because the services page shows one row for each pair", () => {
    expect(servicePrice("meta-ads")).toBe(servicePrice("social-media-management"));
    expect(servicePrice("google-ads")).toBe(servicePrice("seo-optimization"));
  });

  it("is what every service page prints", () => {
    const bySlug = new Map(servicePages.map((p) => [p.slug, p.price.amount]));
    expect(bySlug.get("meta-ads-management")).toBe(servicePrice("meta-ads"));
    expect(bySlug.get("google-ads-management")).toBe(servicePrice("google-ads"));
    expect(bySlug.get("seo-services-nairobi")).toBe(servicePrice("seo-optimization"));
    expect(bySlug.get("social-media-management")).toBe(servicePrice("social-media-management"));
    expect(bySlug.get("lead-generation")).toBe(servicePrice("lead-generation"));
    expect(bySlug.get("digital-marketing-audit")).toBe(servicePrice("digital-marketing-audit"));
    expect(bySlug.get("shopify-services")).toBe(servicePrice("shopify-services"));
  });

  it("has one comparison value per package", () => {
    for (const row of packageComparison) {
      expect(row.values).toHaveLength(retainerPackages.length);
      if (row.intlValues) expect(row.intlValues).toHaveLength(retainerPackages.length);
    }
  });
});

describe("services list", () => {
  it("has unique slugs", () => {
    expect(new Set(services.map((s) => s.slug)).size).toBe(services.length);
  });

  it("keeps every anchor id that /agency/pricing and legacy links point at", () => {
    const required = [
      "service-google-ads", "service-meta-ads", "service-seo-optimization", "service-social-media-management",
      "service-content-strategy", "service-digital-marketing-audit", "service-tiktok-ads", "service-video-production",
      "service-graphic-design", "service-brand-strategy", "service-strategy-consultation",
    ];
    const anchors = services.map((s) => serviceAnchorId(s.slug));
    for (const id of required) expect(anchors).toContain(id);
  });

  it("links tiles only to pages that exist", () => {
    const live = new Set(servicePages.filter((p) => !p.draft).map((p) => `/agency/${p.slug}`));
    for (const s of services) if (s.pagePath) expect(live.has(s.pagePath), s.slug).toBe(true);
  });

  it("gives the large Meta tile a proof line and an image slot", () => {
    const meta = services.find((s) => s.slug === "meta-ads");
    expect(meta?.proof).not.toBeNull();
    expect(meta?.imageSlot).toBe("svc-meta-ads");
  });
});

describe("proof", () => {
  it("copies case study figures exactly", () => {
    for (const id of ["google-ads-launch", "meta-ads-turnaround"]) {
      const study = caseStudies.find((c) => c.id === id);
      const item = proofItems.find((p) => p.id === id);
      expect(study, id).toBeDefined();
      expect(item?.stats, id).toEqual(study?.stats);
    }
  });

  it("matches the published Convey and iClear wording", () => {
    const published = servicePages.flatMap((p) => (p.caseStudy ? [p.caseStudy.results] : []));
    expect(published).toContain(proofItems.find((p) => p.id === "convey-communications")?.result);
    expect(published).toContain(proofItems.find((p) => p.id === "iclear-kenya")?.result);
  });

  it("never names a client the site does not name", () => {
    for (const id of ["google-ads-launch", "meta-ads-turnaround", "nyeri-county"]) {
      expect(proofItems.find((p) => p.id === id)?.client, id).toBeNull();
    }
  });
});

describe("filterServices", () => {
  it("returns every tile for all", () => {
    expect(filterServices(bentoServices, "all")).toHaveLength(bentoServices.length);
  });

  it("keeps only tiles in the chosen category, and no chip is empty", () => {
    for (const key of ["paid", "seo", "social", "stores"] as const) {
      const out = filterServices(bentoServices, key);
      expect(out.length, key).toBeGreaterThan(0);
      expect(out.every((s) => s.categories.includes(key)), key).toBe(true);
    }
  });
});
