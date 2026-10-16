import { format, isValid, parse } from "date-fns";
import { toNumberOrNull } from "./format";
import { PAYMENT_METHODS, type Client, type Invoice, type PaymentMethod } from "./types";

// Reads a spreadsheet of past invoices (CSV) into checked rows the hub can
// import. Nothing is saved here; the dialog shows the preview first.

export const TEMPLATE_HEADERS = [
  "invoice_number",
  "client",
  "issue_date",
  "due_date",
  "description",
  "amount",
  "amount_paid",
  "paid_date",
  "payment_method",
  "payment_reference",
] as const;

export const TEMPLATE_EXAMPLE = [
  [
    "INV-2025-014",
    "Select Gadgets",
    "05/03/2025",
    "19/03/2025",
    "Meta Ads management - March",
    "45000",
    "45000",
    "15/03/2025",
    "M-Pesa",
    "SC71XYZ123",
  ],
  [
    "INV-2025-015",
    "Glow Skin Clinic",
    "2025-03-10",
    "2025-03-24",
    "Social media + content",
    "60000",
    "30000",
    "2025-03-20",
    "Bank",
    "",
  ],
];

/** Minimal RFC 4180 CSV parser: quoted fields, escaped quotes, commas and newlines inside quotes. */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let quoted = false;
  const src = text.replace(/^\uFEFF/, "");
  for (let i = 0; i < src.length; i++) {
    const ch = src[i];
    if (quoted) {
      if (ch === '"' && src[i + 1] === '"') {
        field += '"';
        i++;
      } else if (ch === '"') quoted = false;
      else field += ch;
    } else if (ch === '"') quoted = true;
    else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n" || ch === "\r") {
      if (ch === "\r" && src[i + 1] === "\n") i++;
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
    } else field += ch;
  }
  if (field || row.length) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter((r) => r.some((c) => c.trim() !== ""));
}

const DATE_FORMATS = [
  "yyyy-MM-dd",
  "dd/MM/yyyy",
  "d/M/yyyy",
  "dd-MM-yyyy",
  "d MMM yyyy",
  "d MMMM yyyy",
  "MMM d, yyyy",
  "dd.MM.yyyy",
];

/** Accepts 2025-03-05, 05/03/2025 (day first, as in Kenya), 5 Mar 2025… Returns ISO or null. */
export function parseDate(text: string): string | null {
  const t = text.trim();
  if (!t) return null;
  for (const f of DATE_FORMATS) {
    const d = parse(t, f, new Date());
    if (isValid(d) && d.getFullYear() > 1990 && d.getFullYear() < 2100) return format(d, "yyyy-MM-dd");
  }
  return null;
}

export function parseMethod(text: string): PaymentMethod {
  const t = text
    .trim()
    .toLowerCase()
    .replace(/[\s_-]+/g, "");
  if (!t) return "other";
  if (t.includes("mpesa") || t.includes("mobile")) return "mpesa";
  if (t.includes("bank") || t.includes("transfer") || t.includes("eft") || t.includes("rtgs")) return "bank";
  if (t.includes("cash")) return "cash";
  if (t.includes("card") || t.includes("visa") || t.includes("mastercard")) return "card";
  if (t.includes("cheque") || t.includes("check")) return "cheque";
  return (PAYMENT_METHODS as readonly string[]).includes(t) ? (t as PaymentMethod) : "other";
}

const money = (text: string) => toNumberOrNull(text.replace(/kes|ksh|ksh\.|\/=/gi, ""));

export type ImportRow = {
  line: number;
  number: string;
  clientName: string;
  clientId: string | null;
  issueDate: string | null;
  dueDate: string | null;
  description: string;
  amount: number | null;
  paid: number;
  paidDate: string | null;
  method: PaymentMethod;
  reference: string | null;
  errors: string[];
  /** Already in the hub (same invoice number): skipped. */
  duplicate: boolean;
};

const norm = (s: string) => s.trim().toLowerCase().replace(/\s+/g, " ");

/** Turns parsed CSV into checked rows. Headers are matched loosely ("Invoice No", "Client name", "Total"…). */
export function readRows(
  cells: string[][],
  clients: Client[],
  existing: Invoice[],
): { rows: ImportRow[]; missingHeaders: string[] } {
  if (!cells.length) return { rows: [], missingHeaders: ["invoice_number", "client", "issue_date", "amount"] };
  const header = cells[0].map((h) => norm(h).replace(/[^a-z]/g, ""));
  // Exact aliases (letters only, lower case), so "Invoice No", "Client name" or "Total (KES)" all work.
  const find = (...names: string[]) => header.findIndex((h) => names.includes(h));
  const col = {
    number: find("invoicenumber", "invoiceno", "invoicenum", "invoice", "number", "no"),
    client: find("client", "clientname", "customer", "customername", "billto", "company"),
    issue: find("issuedate", "date", "invoicedate", "issued", "dateissued"),
    due: find("duedate", "due", "datedue"),
    description: find("description", "details", "item", "service", "services", "title"),
    amount: find("amount", "total", "invoicetotal", "value", "amountkes", "totalkes"),
    paid: find("amountpaid", "paid", "paidamount", "received", "amountreceived", "paidkes"),
    paidDate: find("paiddate", "datepaid", "paymentdate", "paidon"),
    method: find("paymentmethod", "method", "paidvia", "mode"),
    reference: find("paymentreference", "reference", "ref", "mpesacode", "mpesaref", "transactioncode"),
  };

  const missingHeaders = (
    [
      ["client", col.client],
      ["issue_date", col.issue],
      ["amount", col.amount],
    ] as const
  )
    .filter(([, i]) => i < 0)
    .map(([n]) => n);
  if (missingHeaders.length) return { rows: [], missingHeaders };

  const byName = new Map<string, string>();
  for (const c of clients) {
    byName.set(norm(c.name), c.id);
    if (c.business_name) byName.set(norm(c.business_name), c.id);
  }
  const taken = new Set(existing.map((i) => norm(i.number)));
  const seen = new Set<string>();
  const get = (r: string[], i: number) => (i >= 0 ? (r[i] ?? "").trim() : "");

  const rows = cells.slice(1).map((r, idx): ImportRow => {
    const errors: string[] = [];
    const number = get(r, col.number);
    const clientName = get(r, col.client);
    const issueText = get(r, col.issue);
    const issueDate = parseDate(issueText);
    const dueText = get(r, col.due);
    const dueDate = parseDate(dueText);
    const amount = money(get(r, col.amount));
    const paidText = get(r, col.paid);
    const paid = paidText ? money(paidText) : 0;
    const paidDateText = get(r, col.paidDate);
    const paidDate = parseDate(paidDateText);

    if (!clientName) errors.push("No client name");
    if (!issueDate) errors.push(issueText ? `Can't read date "${issueText}"` : "No invoice date");
    if (dueText && !dueDate) errors.push(`Can't read due date "${dueText}"`);
    if (amount === null || amount <= 0) errors.push("Amount missing or not a number");
    if (paid === null) errors.push("Amount paid isn't a number");
    if (paid && amount && paid > amount) errors.push("Paid more than the invoice total");
    if (paidDateText && !paidDate) errors.push(`Can't read paid date "${paidDateText}"`);

    const key = norm(number);
    const duplicate = !!number && (taken.has(key) || seen.has(key));
    if (number) seen.add(key);

    return {
      line: idx + 2,
      number,
      clientName,
      clientId: byName.get(norm(clientName)) ?? null,
      issueDate,
      dueDate,
      description: get(r, col.description),
      amount,
      paid: paid ?? 0,
      paidDate,
      method: parseMethod(get(r, col.method)),
      reference: get(r, col.reference) || null,
      errors,
      duplicate,
    };
  });
  return { rows, missingHeaders: [] };
}
