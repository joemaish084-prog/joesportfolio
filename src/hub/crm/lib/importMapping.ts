import { domainKey, emailKey, nameKey, phoneKey } from "./normalize";

// Spreadsheet import: map columns, validate rows, find duplicates, and build
// the payload crm_commit_import takes. Nothing here invents a value: a blank
// cell stays blank, and anything that doesn't parse is kept in the raw row.

export const IMPORT_FIELDS = [
  "name",
  "area",
  "business_type",
  "phone",
  "email",
  "website",
  "instagram",
  "facebook",
  "tiktok",
  "google_rating",
  "google_reviews",
  "weakness_score",
  "original_priority",
  "decision_maker_hint",
  "owner_name",
  "direct_line",
  "notes",
] as const;
export type ImportField = (typeof IMPORT_FIELDS)[number];
export type Mapping = Record<string, ImportField | "ignore">;

export const IMPORT_FIELD_LABEL: Record<ImportField, string> = {
  name: "Business name",
  area: "Area",
  business_type: "Business type",
  phone: "Phone",
  email: "Email",
  website: "Website",
  instagram: "Instagram",
  facebook: "Facebook",
  tiktok: "TikTok",
  google_rating: "Google rating",
  google_reviews: "Google reviews",
  weakness_score: "Weakness score (original)",
  original_priority: "Priority (original)",
  decision_maker_hint: "Decision-maker hint",
  owner_name: "Owner / MD name",
  direct_line: "Direct line",
  notes: "Notes",
};

const SYNONYMS: [ImportField, RegExp][] = [
  ["name", /^(dealership|business( name)?|company( name)?|name|clinic|school|store|shop)$/],
  ["area", /^(area|location|neighbou?rhood|estate|town|city)$/],
  ["business_type", /^(type|category|business type)$/],
  ["direct_line", /direct line/],
  ["owner_name", /(owner|md|managing director|decision maker) name|^owner/],
  ["decision_maker_hint", /decision.?maker/],
  ["phone", /^(phone|tel|telephone|mobile|phone number)/],
  ["email", /^e-?mail/],
  ["website", /^(website|site|web|url)$/],
  ["instagram", /^(instagram|ig)$/],
  ["facebook", /^(facebook|fb)$/],
  ["tiktok", /^tik ?tok$/],
  ["google_rating", /(google )?rating/],
  ["google_reviews", /^(google )?reviews?( count)?$/],
  ["weakness_score", /weakness/],
  ["original_priority", /^priority$/],
  ["notes", /^notes?$/],
];

/** Best guess at which field each column holds; each field is used once at most. */
export function suggestMapping(headers: string[]): Mapping {
  const used = new Set<ImportField>();
  const mapping: Mapping = {};
  for (const header of headers) {
    const h = header.trim().toLowerCase().replace(/\s*\(.*?\)\s*/g, " ").replace(/\?/g, "").trim();
    const hit = SYNONYMS.find(([field, re]) => !used.has(field) && (re.test(h) || re.test(header.trim().toLowerCase())));
    mapping[header] = hit ? hit[0] : "ignore";
    if (hit) used.add(hit[0]);
  }
  return mapping;
}

export type LeadValues = {
  name: string;
  area?: string;
  business_type?: string;
  phone?: string;
  email?: string;
  website?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  google_rating?: number;
  google_reviews?: number;
  weakness_score?: number;
  original_priority?: string;
  research_notes?: string;
  owner_name?: string;
  direct_line?: string;
  notes?: string;
};

export type ParsedRow = {
  /** 1-based spreadsheet row, header included, so it matches what Excel shows. */
  rowNumber: number;
  raw: Record<string, string>;
  lead: LeadValues;
  errors: string[];
  warnings: string[];
};

export const MAX_CELL = 2000;

const num = (s: string) => {
  const cleaned = s.replace(/[,\s]/g, "");
  if (!/^-?\d+(\.\d+)?$/.test(cleaned)) return null;
  return Number(cleaned);
};

/** Turns sheet rows into lead values plus a list of problems for each row. */
export function buildRows(headers: string[], rows: (string | null)[][], mapping: Mapping): ParsedRow[] {
  const out: ParsedRow[] = [];
  rows.forEach((cells, i) => {
    const raw: Record<string, string> = {};
    headers.forEach((h, c) => {
      const v = cells[c];
      if (v !== null && v !== undefined && String(v).trim() !== "") raw[h] = String(v);
    });
    if (Object.keys(raw).length === 0) return; // blank line

    const errors: string[] = [];
    const warnings: string[] = [];
    const lead: LeadValues = { name: "" };

    for (const [header, field] of Object.entries(mapping)) {
      if (field === "ignore") continue;
      let value = raw[header]?.trim();
      if (!value) continue;
      if (value.length > MAX_CELL) {
        warnings.push(`${header} was cut to ${MAX_CELL} characters`);
        value = value.slice(0, MAX_CELL);
      }
      switch (field) {
        case "google_rating": {
          const n = num(value);
          if (n === null || n < 0 || n > 5) warnings.push(`Google rating "${value}" isn't 0 to 5, left blank`);
          else lead.google_rating = Math.round(n * 10) / 10;
          break;
        }
        case "google_reviews": {
          const n = num(value);
          if (n === null || n < 0 || !Number.isInteger(n)) warnings.push(`Reviews "${value}" isn't a whole number, left blank`);
          else lead.google_reviews = n;
          break;
        }
        case "weakness_score": {
          const n = num(value);
          if (n === null || Math.abs(n) >= 10000) warnings.push(`Weakness score "${value}" isn't a number, left blank`);
          else lead.weakness_score = n;
          break;
        }
        case "decision_maker_hint":
          lead.research_notes = `Decision-maker hint (from the spreadsheet, not verified): ${value}`;
          break;
        case "email":
          if (!emailKey(value)) warnings.push(`Email "${value}" doesn't look valid; kept as written`);
          lead.email = value;
          break;
        case "phone":
          if (!phoneKey(value)) warnings.push(`Phone "${value}" looks too short; kept as written`);
          lead.phone = value;
          break;
        case "name":
          lead.name = value.slice(0, 300);
          break;
        default:
          lead[field] = value;
      }
    }

    if (!lead.name) errors.push("No business name");
    out.push({ rowNumber: i + 2, raw, lead, errors, warnings });
  });
  return out;
}

/** Stable hash of a source row, so re-importing the same row is recognised. */
export async function fingerprint(raw: Record<string, string>): Promise<string> {
  const canonical = JSON.stringify(
    Object.keys(raw)
      .sort()
      .map((k) => [k.trim().toLowerCase(), raw[k].trim().replace(/\s+/g, " ").toLowerCase()]),
  );
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(canonical));
  return Array.from(new Uint8Array(bytes), (b) => b.toString(16).padStart(2, "0")).join("");
}

export type ExistingLead = {
  id: string;
  name: string;
  name_key: string | null;
  domain_key: string | null;
  email_key: string | null;
  phone_key: string | null;
};

export type MatchReason = "name" | "website" | "email" | "phone";
export type DuplicateMatch = { leadId: string | null; name: string; rowNumber?: number; reasons: MatchReason[] };

export type Decision = "create" | "merge" | "skip" | "error";

export type ReviewRow = ParsedRow & {
  fingerprint: string;
  matches: DuplicateMatch[];
  decision: Decision;
  mergeLeadId: string | null;
};

function keysOf(lead: LeadValues) {
  return {
    name: nameKey(lead.name),
    website: domainKey(lead.website),
    email: emailKey(lead.email),
    phone: phoneKey(lead.phone),
  };
}

function reasonsBetween(a: ReturnType<typeof keysOf>, b: ReturnType<typeof keysOf>): MatchReason[] {
  const reasons: MatchReason[] = [];
  if (a.name && a.name.length > 2 && a.name === b.name) reasons.push("name");
  if (a.website && a.website === b.website) reasons.push("website");
  if (a.email && a.email === b.email) reasons.push("email");
  if (a.phone && a.phone === b.phone) reasons.push("phone");
  return reasons;
}

/**
 * Pairs each row with existing leads and earlier rows that look like the same
 * business. Duplicates start as "skip" so nothing changes until you choose.
 */
export async function reviewRows(rows: ParsedRow[], existing: ExistingLead[]): Promise<ReviewRow[]> {
  const seen: { keys: ReturnType<typeof keysOf>; row: ParsedRow }[] = [];
  const out: ReviewRow[] = [];
  for (const row of rows) {
    const keys = keysOf(row.lead);
    const matches: DuplicateMatch[] = [];
    for (const lead of existing) {
      const reasons = reasonsBetween(keys, {
        name: lead.name_key,
        website: lead.domain_key,
        email: lead.email_key,
        phone: lead.phone_key,
      });
      if (reasons.length) matches.push({ leadId: lead.id, name: lead.name, reasons });
    }
    for (const prev of seen) {
      const reasons = reasonsBetween(keys, prev.keys);
      if (reasons.length) matches.push({ leadId: null, name: prev.row.lead.name, rowNumber: prev.row.rowNumber, reasons });
    }
    if (row.errors.length === 0) seen.push({ keys, row });

    const existingMatch = matches.find((m) => m.leadId);
    out.push({
      ...row,
      fingerprint: await fingerprint(row.raw),
      matches,
      decision: row.errors.length ? "error" : matches.length ? "skip" : "create",
      mergeLeadId: existingMatch?.leadId ?? null,
    });
  }
  return out;
}

export type ImportMeta = {
  filename: string;
  fileSha256: string;
  fileSize: number;
  sheetName: string;
  mapping: Mapping;
  methodology: string[];
  industryId: string | null;
  campaignId: string | null;
  sourceName?: string;
};

export function commitPayload(meta: ImportMeta, rows: ReviewRow[]) {
  return {
    filename: meta.filename,
    file_sha256: meta.fileSha256,
    file_size: meta.fileSize,
    sheet_name: meta.sheetName,
    column_mapping: meta.mapping,
    methodology: meta.methodology,
    industry_id: meta.industryId,
    campaign_id: meta.campaignId,
    source_name: meta.sourceName ?? meta.filename,
    rows: rows.map((r) => ({
      row_number: r.rowNumber,
      raw: r.raw,
      fingerprint: r.fingerprint,
      decision: r.decision,
      merge_lead_id: r.decision === "merge" ? r.mergeLeadId : null,
      message: r.errors.join("; ") || undefined,
      lead: r.lead,
    })),
  };
}
