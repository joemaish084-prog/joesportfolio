import { existsSync, readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import * as XLSX from "xlsx";
import { detectSheetKind, readWorkbook } from "../../../../supabase/functions/_shared/crm/sheet";
import { safeCell, toSafeCsv } from "./exportCsv";
import { computeFit } from "./fitScore";
import { buildRows, commitPayload, reviewRows, suggestMapping, type ExistingLead } from "./importMapping";
import { externalUrl, gmailComposeUrl, instagramUrl, whatsappUrl } from "./links";
import { domainKey, nameKey, phoneKey, whatsappNumber } from "./normalize";

const HEADERS = [
  "Dealership",
  "Area",
  "Type",
  "Phone",
  "Email (best found)",
  "Website",
  "Instagram",
  "Facebook",
  "TikTok",
  "Google rating",
  "Reviews",
  "Weakness score",
  "Priority",
  "Decision-maker hint",
  "Owner / MD name (to find)",
  "Direct line (to find)",
  "Verify socials by hand?",
  "Status",
  "Notes",
];

describe("column mapping", () => {
  it("maps the dealership sheet's columns", () => {
    expect(suggestMapping(HEADERS)).toEqual({
      Dealership: "name",
      Area: "area",
      Type: "business_type",
      Phone: "phone",
      "Email (best found)": "email",
      Website: "website",
      Instagram: "instagram",
      Facebook: "facebook",
      TikTok: "tiktok",
      "Google rating": "google_rating",
      Reviews: "google_reviews",
      "Weakness score": "weakness_score",
      Priority: "original_priority",
      "Decision-maker hint": "decision_maker_hint",
      "Owner / MD name (to find)": "owner_name",
      "Direct line (to find)": "direct_line",
      "Verify socials by hand?": "ignore",
      Status: "ignore",
      Notes: "notes",
    });
  });

  it("works for other industries' headings", () => {
    expect(suggestMapping(["Clinic", "Location", "Telephone", "E-mail", "URL"])).toEqual({
      Clinic: "name",
      Location: "area",
      Telephone: "phone",
      "E-mail": "email",
      URL: "website",
    });
  });
});

describe("row validation", () => {
  const mapping = suggestMapping(HEADERS);
  const row = (values: Partial<Record<(typeof HEADERS)[number], string | null>>) => HEADERS.map((h) => values[h] ?? null);

  it("keeps blanks blank and never invents values", () => {
    const [r] = buildRows(HEADERS, [row({ Dealership: "Kei Cars", Phone: "+254 722 000111", "Google rating": "4.6", Reviews: "1,204" })], mapping);
    expect(r.errors).toEqual([]);
    expect(r.lead).toEqual({ name: "Kei Cars", phone: "+254 722 000111", google_rating: 4.6, google_reviews: 1204 });
  });

  it("flags rows without a name and bad numbers, keeping the raw values", () => {
    const rows = buildRows(
      HEADERS,
      [row({ Area: "Karen" }), row({ Dealership: "X Motors", "Google rating": "great", "Email (best found)": "not-an-email" })],
      mapping,
    );
    expect(rows[0].errors).toEqual(["No business name"]);
    expect(rows[1].lead.google_rating).toBeUndefined();
    expect(rows[1].raw["Google rating"]).toBe("great");
    expect(rows[1].warnings).toHaveLength(2);
    expect(rows[1].lead.email).toBe("not-an-email");
  });

  it("labels the decision-maker hint as unverified research", () => {
    const [r] = buildRows(HEADERS, [row({ Dealership: "Y", "Decision-maker hint": "md@y.co.ke goes to the MD" })], mapping);
    expect(r.lead.research_notes).toMatch(/not verified/);
  });

  it("skips blank lines and numbers rows like the spreadsheet does", () => {
    const rows = buildRows(HEADERS, [row({ Dealership: "A" }), row({}), row({ Dealership: "B" })], mapping);
    expect(rows.map((r) => r.rowNumber)).toEqual([2, 4]);
  });
});

describe("duplicate detection", () => {
  const mapping = suggestMapping(HEADERS);
  const existing: ExistingLead[] = [
    { id: "lead-1", name: "Kei Cars Ltd", name_key: "kei cars", domain_key: "keicars.co.ke", email_key: null, phone_key: "722000111" },
  ];

  it("matches on name, domain, email or phone, and defaults duplicates to skip", async () => {
    const rows = buildRows(
      HEADERS,
      [
        HEADERS.map((h) => ({ Dealership: "KEI CARS", Website: "https://www.keicars.co.ke/stock" })[h as "Dealership"] ?? null),
        HEADERS.map((h) => ({ Dealership: "Different Name", Phone: "0722 000 111" })[h as "Dealership"] ?? null),
        HEADERS.map((h) => ({ Dealership: "Fresh Motors" })[h as "Dealership"] ?? null),
        HEADERS.map((h) => ({ Dealership: "Fresh Motors Limited" })[h as "Dealership"] ?? null),
      ],
      mapping,
    );
    const reviewed = await reviewRows(rows, existing);
    expect(reviewed[0].matches[0]).toMatchObject({ leadId: "lead-1", reasons: ["name", "website"] });
    expect(reviewed[1].matches[0].reasons).toEqual(["phone"]);
    expect(reviewed.map((r) => r.decision)).toEqual(["skip", "skip", "create", "skip"]);
    expect(reviewed[3].matches[0]).toMatchObject({ leadId: null, rowNumber: 4 });
    expect(reviewed[0].mergeLeadId).toBe("lead-1");
    // Same row, same fingerprint; different row, different one.
    const again = await reviewRows(rows, existing);
    expect(again[2].fingerprint).toBe(reviewed[2].fingerprint);
    expect(reviewed[2].fingerprint).not.toBe(reviewed[3].fingerprint);

    const payload = commitPayload(
      { filename: "f.xlsx", fileSha256: "0".repeat(64), fileSize: 10, sheetName: "Leads", mapping, methodology: [], industryId: null, campaignId: null },
      reviewed.map((r, i) => (i === 0 ? { ...r, decision: "merge" as const } : r)),
    );
    expect(payload.rows[0].merge_lead_id).toBe("lead-1");
    expect(payload.rows[1].merge_lead_id).toBeNull();
  });
});

describe("normalisation", () => {
  it("normalises names, domains and phones", () => {
    expect(nameKey("Select Motors (Kenya) Ltd.")).toBe("select motors");
    expect(domainKey("https://www.facebook.com/dealer")).toBeNull();
    expect(domainKey("WWW.Dealer.co.ke/about")).toBe("dealer.co.ke");
    expect(phoneKey("+254 722 123 456")).toBe("722123456");
  });

  it("only offers WhatsApp for Kenyan mobile numbers", () => {
    expect(whatsappNumber("0722 123 456")).toBe("254722123456");
    expect(whatsappNumber("+254 110 123456")).toBe("254110123456");
    expect(whatsappNumber("020 2345678")).toBeNull();
    expect(whatsappNumber(null)).toBeNull();
  });
});

describe("fit score", () => {
  it("leaves unrated factors out instead of counting them as zero", () => {
    expect(computeFit({}).score).toBeNull();
    const r = computeFit({ business_fit: { rating: 4, verified: true, checked_on: "2026-10-20" } }, {}, new Date("2026-10-24"));
    // business fit 4/4 (weight 20) + recency 4/4 (weight 10)
    expect(r).toMatchObject({ score: 100, known: 2, verified: 2, total: 7 });
  });

  it("weights rated factors and ages recency", () => {
    const inputs = {
      business_fit: { rating: 4, verified: true, checked_on: "2026-06-01" },
      ad_opportunity: { rating: 0, verified: false },
    };
    const r = computeFit(inputs, { recency: 0 }, new Date("2026-10-24"));
    expect(r.score).toBe(50); // (20*1 + 20*0) / 40
    expect(r.verified).toBe(1);
    expect(computeFit(inputs, {}, new Date("2026-10-24")).breakdown.find((b) => b.factor === "recency")?.rating).toBe(1);
  });
});

describe("CSV export", () => {
  it("neutralises spreadsheet formulas but leaves numbers alone", () => {
    expect(safeCell("=HYPERLINK(\"http://x\")")).toBe("'=HYPERLINK(\"http://x\")");
    expect(safeCell("+254722000111")).toBe("'+254722000111");
    expect(safeCell("@SUM(A1)")).toBe("'@SUM(A1)");
    expect(safeCell("Kei Cars")).toBe("Kei Cars");
    expect(safeCell(-500)).toBe(-500);
    const csv = toSafeCsv([{ n: "-2+3" }], [{ header: "Name", value: (r) => r.n }]);
    expect(csv).toBe('"Name"\r\n"\'-2+3"');
  });
});

describe("hand-off links", () => {
  it("builds compose links and refuses unsafe URLs", () => {
    expect(gmailComposeUrl("a@b.co.ke", "Hi & hello", "Line 1\nLine 2")).toContain("su=Hi+%26+hello");
    expect(whatsappUrl("0722123456", "Habari")).toBe("https://wa.me/254722123456?text=Habari");
    expect(whatsappUrl("020 123 4567", "x")).toBeNull();
    expect(instagramUrl("@kei.cars")).toBe("https://www.instagram.com/kei.cars/");
    expect(instagramUrl("not a handle!")).toBeNull();
    expect(externalUrl("dealer.co.ke")).toBe("https://dealer.co.ke/");
    expect(externalUrl("javascript:alert(1)")).toBeNull();
  });
});

describe("sheet reading", () => {
  it("checks file type by content, not just the name", () => {
    expect(detectSheetKind("leads.xlsx", new Uint8Array([0x50, 0x4b, 0x03, 0x04]))).toBe("xlsx");
    expect(detectSheetKind("leads.xlsx", new TextEncoder().encode("<html>"))).toBeNull();
    expect(detectSheetKind("leads.csv", new TextEncoder().encode("a,b\n1,2"))).toBe("csv");
    expect(detectSheetKind("leads.csv", new Uint8Array([0x61, 0x00, 0x62]))).toBeNull();
    expect(detectSheetKind("leads.exe", new TextEncoder().encode("a,b"))).toBeNull();
  });

  it("returns cached values, never formulas", () => {
    const ws = XLSX.utils.aoa_to_sheet([["Dealership", "Reviews"], ["Kei Cars", 0]]);
    ws["B2"] = { t: "n", v: 42, f: "40+2" };
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Leads");
    const bytes = new Uint8Array(XLSX.write(wb, { type: "array", bookType: "xlsx" }));
    const [sheet] = readWorkbook(XLSX, bytes, "xlsx");
    expect(sheet).toEqual({ name: "Leads", headers: ["Dealership", "Reviews"], rows: [["Kei Cars", "42"]], truncated: false });
  });

  it("keeps CSV values as text", () => {
    const csv = ["Name,Phone", "A,0722000111", ""].join(String.fromCharCode(10));
    const bom = new Uint8Array([0xef, 0xbb, 0xbf, ...new TextEncoder().encode(csv)]);
    const [sheet] = readWorkbook(XLSX, bom, "csv");
    expect(sheet.rows).toEqual([["A", "0722000111"]]);
  });

  // Point CRM_IMPORT_SAMPLE at the real prospect file to check it end to end.
  // The file itself never goes in the repo.
  const sample = process.env.CRM_IMPORT_SAMPLE;
  it.skipIf(!sample || !existsSync(sample))("reads the real dealership file: 81 valid leads, no duplicates", async () => {
    const bytes = new Uint8Array(readFileSync(sample as string));
    const sheets = readWorkbook(XLSX, bytes, detectSheetKind(sample as string, bytes) as "xlsx");
    const leads = sheets.find((s) => s.name === "Leads")!;
    expect(sheets.map((s) => s.name)).toContain("How to read this");
    const rows = buildRows(leads.headers, leads.rows, suggestMapping(leads.headers));
    expect(rows).toHaveLength(81);
    expect(rows.filter((r) => r.errors.length)).toEqual([]);
    const reviewed = await reviewRows(rows, []);
    expect(reviewed.filter((r) => r.decision === "create")).toHaveLength(81);
    expect(rows.every((r) => r.lead.owner_name === undefined && r.lead.direct_line === undefined)).toBe(true);
  });
});
