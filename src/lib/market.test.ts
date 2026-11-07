import { describe, expect, it } from "vitest";
import { localizePrice } from "./market";

describe("localizePrice", () => {
  it("leaves Kenyan prices untouched", () => {
    expect(localizePrice("From KES 40,000/month", "KE")).toBe("From KES 40,000/month");
  });

  it("swaps KES and KSh fees for the hand-set USD fee", () => {
    expect(localizePrice("From KES 40,000/month", "INTL")).toBe("From $900/month");
    expect(localizePrice("from KES 45,000/mo", "INTL")).toBe("from $1,200/mo");
    expect(localizePrice("starts at KSh 50,000 a month", "INTL")).toBe("starts at $1,200 a month");
    expect(localizePrice("from KES 120,000/month", "INTL")).toBe("from $3,000/month");
  });

  it("estimates an unlisted fee at about 3x and leaves non-price text alone", () => {
    expect(localizePrice("KES 90,000/month", "INTL")).toBe("$2,100/month");
    expect(localizePrice("Free for now", "INTL")).toBe("Free for now");
  });
});
