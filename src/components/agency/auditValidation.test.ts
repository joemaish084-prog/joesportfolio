import { describe, expect, it } from "vitest";
import { auditSchema, normalizeKenyanPhone } from "./auditValidation";

describe("audit form validation", () => {
  it.each([
    ["0704 700 160", "+254704700160"],
    ["(011) 234-5678", "+254112345678"],
    ["+254 704 700 160", "+254704700160"],
    ["00254704700160", "+254704700160"],
  ])("normalizes %s", (input, phone) => {
    expect(normalizeKenyanPhone(input)).toBe(phone);
  });

  it.each(["+12345678901", "0201234567", "+2540704700160", "070470016", "0712 abc 678"])(
    "rejects %s as a Kenyan mobile number",
    input => expect(normalizeKenyanPhone(input)).toBeNull(),
  );

  it("validates every required lead field and accepts the current budgets", () => {
    const fields = { name: " Joseph ", business: " Test ", phone: "0704 700 160", budget: "Still deciding" };
    expect(auditSchema.parse(fields)).toEqual({ ...fields, name: "Joseph", business: "Test" });
    const invalid = auditSchema.safeParse({ name: " ", business: "", phone: "123", budget: "Other" });
    expect(invalid.success).toBe(false);
    if (!invalid.success) expect(invalid.error.issues).toHaveLength(4);
  });
});
