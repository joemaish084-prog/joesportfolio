// Safe spreadsheet reading for crm-parse-sheet. The SheetJS module is passed
// in, so Deno (CDN build) and Vitest (npm tarball) run the same code.

export const MAX_UPLOAD_BYTES = 2 * 1024 * 1024;
export const MAX_ROWS = 5000;
export const MAX_COLUMNS = 60;
export const MAX_CELL = 2000;

export type SheetKind = "xlsx" | "csv";

/** Checks the name and the first bytes agree on what the file is. */
export function detectSheetKind(filename: string, bytes: Uint8Array): SheetKind | null {
  const name = filename.toLowerCase();
  if (name.endsWith(".xlsx")) {
    // XLSX is a zip: PK\x03\x04
    return bytes[0] === 0x50 && bytes[1] === 0x4b && bytes[2] === 0x03 && bytes[3] === 0x04 ? "xlsx" : null;
  }
  if (name.endsWith(".csv")) {
    const head = bytes.subarray(0, 8192);
    if (head.includes(0)) return null; // binary
    try {
      new TextDecoder("utf-8", { fatal: true }).decode(head.length < bytes.length ? head.subarray(0, lastUtf8Boundary(head)) : head);
    } catch {
      return null;
    }
    return "csv";
  }
  return null;
}

// Don't fail the UTF-8 check on a character cut in half at the 8 KB mark.
function lastUtf8Boundary(b: Uint8Array) {
  let i = b.length;
  while (i > 0 && (b[i - 1] & 0xc0) === 0x80) i--;
  return i > 0 && b[i - 1] >= 0xc0 ? i - 1 : b.length;
}

export type ParsedSheet = {
  name: string;
  headers: string[];
  rows: (string | null)[][];
  truncated: boolean;
};

// Only the parts of SheetJS this module uses.
type XlsxLike = {
  read: (data: unknown, opts: Record<string, unknown>) => { SheetNames: string[]; Sheets: Record<string, unknown> };
  utils: { sheet_to_json: (sheet: unknown, opts: Record<string, unknown>) => unknown[][] };
};

const clean = (v: unknown) => {
  if (v === null || v === undefined) return null;
  const s = String(v).replace(/\r\n?/g, "\n").trim();
  return s === "" ? null : s.slice(0, MAX_CELL);
};

/**
 * Reads every sheet as text. Formulas are never evaluated or returned (only
 * their cached values), and rows, columns and cell lengths are capped.
 */
export function readWorkbook(XLSX: XlsxLike, bytes: Uint8Array, kind: SheetKind): ParsedSheet[] {
  const wb =
    kind === "csv"
      ? XLSX.read(new TextDecoder("utf-8").decode(bytes) /* drops a leading BOM by itself */, {
          type: "string",
          raw: true,
          sheetRows: MAX_ROWS + 1,
        })
      : XLSX.read(bytes, {
          type: "array",
          cellFormula: false,
          cellHTML: false,
          cellStyles: false,
          bookVBA: false,
          sheetRows: MAX_ROWS + 1,
        });

  return wb.SheetNames.slice(0, 10).map((name) => {
    const all = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, raw: false, defval: null, blankrows: false });
    const [head = [], ...body] = all;
    const headers = (head as unknown[]).slice(0, MAX_COLUMNS).map((h, i) => clean(h) ?? `Column ${i + 1}`);
    const rows = body.slice(0, MAX_ROWS).map((r) => headers.map((_, i) => clean((r as unknown[])[i])));
    return { name: name.slice(0, 120), headers, rows, truncated: body.length > MAX_ROWS };
  });
}

/** SHA-256 of the uploaded bytes, as hex. */
export async function sha256Hex(bytes: Uint8Array) {
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest), (b) => b.toString(16).padStart(2, "0")).join("");
}
