import { supabase } from "@/integrations/supabase/client";
import { toNumberOrNull } from "./format";
import { parseDate, parseMethod } from "./invoiceImport";
import type { InvoiceLineItem, PaymentMethod } from "./types";
import type { ReadRequest, ReadResponse } from "./pdfReader.worker";

// Reads past invoices from PDFs. The text (or, for scanned PDFs, page images)
// is pulled out in the browser with pdf.js, then the hub-read-invoice function
// turns it into fields. If that service isn't available a simple built-in
// reader fills in what it can. Every result is reviewed before saving.

export type ReadInvoice = {
  number: string | null;
  clientName: string | null;
  issueDate: string | null;
  dueDate: string | null;
  currency: string | null;
  lineItems: InvoiceLineItem[];
  total: number | null;
  amountPaid: number | null;
  paidDate: string | null;
  method: PaymentMethod | null;
  reference: string | null;
  notes: string | null;
  confidence: "high" | "medium" | "low";
  /** "ai" = read by the AI service, "basic" = built-in reader. */
  source: "ai" | "basic";
};

type PdfJs = typeof import("pdfjs-dist");
let pdfjsPromise: Promise<PdfJs> | null = null;

const AI_TIMEOUT_MS = 45_000;

/** pdf.js (and its worker) load only when the first PDF is read. */
function loadPdfJs() {
  pdfjsPromise ??= Promise.all([import("pdfjs-dist"), import("pdfjs-dist/build/pdf.worker.min.mjs?url")]).then(
    ([pdfjs, worker]) => {
      pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
      return pdfjs;
    },
  );
  return pdfjsPromise;
}

/** Text of every page, with lines rebuilt from the PDF's positioned text runs. */
export async function extractPdf(file: File, maxPages = 4) {
  const pdfjs = await loadPdfJs();
  const doc = await pdfjs.getDocument({ data: await file.arrayBuffer() }).promise;
  const pages: string[] = [];
  for (let p = 1; p <= Math.min(doc.numPages, maxPages); p++) {
    const page = await doc.getPage(p);
    const content = await page.getTextContent();
    const lines = new Map<number, { x: number; s: string }[]>();
    for (const item of content.items) {
      if (!("str" in item) || !item.str.trim()) continue;
      const y = Math.round(item.transform[5] / 3) * 3; // group runs on the same baseline
      const x = item.transform[4];
      (lines.get(y) ?? lines.set(y, []).get(y)!).push({ x, s: item.str });
    }
    pages.push(
      [...lines.entries()]
        .sort((a, b) => b[0] - a[0])
        .map(([, runs]) =>
          runs
            .sort((a, b) => a.x - b.x)
            .map((r) => r.s)
            .join(" ")
            .replace(/\s+/g, " ")
            .trim(),
        )
        .join("\n"),
    );
  }
  return { doc, text: pages.join("\n\n").trim(), pageCount: doc.numPages };
}

// Longest side of a page image sent for reading. Enough for invoice text; much
// larger and drawing/encoding the page stalls the browser (scans often have
// huge page sizes).
const MAX_RENDER_PX = 1600;

const nextFrame = () => new Promise<void>((resolve) => setTimeout(resolve, 0));

function blobToDataUrl(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

/** First pages as JPEG data URLs, for scanned invoices with no text layer. */
async function renderPages(doc: Awaited<ReturnType<typeof extractPdf>>["doc"], maxPages = 2) {
  const images: string[] = [];
  for (let p = 1; p <= Math.min(doc.numPages, maxPages); p++) {
    const page = await doc.getPage(p);
    const base = page.getViewport({ scale: 1 });
    const scale = Math.min(1.6, MAX_RENDER_PX / Math.max(base.width, base.height));
    const viewport = page.getViewport({ scale });
    const canvas = document.createElement("canvas");
    canvas.width = Math.floor(viewport.width);
    canvas.height = Math.floor(viewport.height);
    const ctx = canvas.getContext("2d");
    if (!ctx) break;
    await page.render({ canvasContext: ctx, viewport }).promise;
    // toBlob encodes off the main thread; toDataURL would block the page.
    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.8));
    canvas.width = canvas.height = 0; // free the bitmap right away
    page.cleanup();
    if (blob) images.push(await blobToDataUrl(blob));
    await nextFrame();
  }
  return images;
}

// ---------------------------------------------------------------- background reader

const WORKER_TIMEOUT_MS = 60_000;
let readerWorker: Worker | null = null;
const waiting = new Map<string, { resolve: (r: ReadResponse) => void; reject: (e: Error) => void }>();

function getReaderWorker() {
  if (readerWorker) return readerWorker;
  const w = new Worker(new URL("./pdfReader.worker.ts", import.meta.url), { type: "module" });
  w.onmessage = (e: MessageEvent<ReadResponse>) => {
    waiting.get(e.data.id)?.resolve(e.data);
    waiting.delete(e.data.id);
  };
  w.onerror = (e) => {
    // A crashed worker fails everything in flight; the next file gets a fresh one.
    waiting.forEach((p) => p.reject(new Error(e.message || "PDF reader stopped")));
    waiting.clear();
    readerWorker?.terminate();
    readerWorker = null;
  };
  readerWorker = w;
  return w;
}

/** Text (and page images for scans), read in a background thread. */
async function pullFromPdf(file: File): Promise<{ text: string; images: string[] }> {
  const supported = typeof Worker !== "undefined" && typeof OffscreenCanvas !== "undefined";
  if (!supported) {
    // Older browsers: read on the page (may pause it briefly on heavy files).
    const { doc, text } = await extractPdf(file);
    const images = text.replace(/\s/g, "").length < 40 ? await renderPages(doc) : [];
    await doc.destroy();
    return { text, images };
  }
  const buffer = await file.arrayBuffer();
  const id = crypto.randomUUID();
  const worker = getReaderWorker();
  const result = await new Promise<ReadResponse>((resolve, reject) => {
    const timer = setTimeout(() => {
      waiting.delete(id);
      // Stop a runaway file so it can't keep the reader busy; start fresh next time.
      worker.terminate();
      if (readerWorker === worker) readerWorker = null;
      waiting.forEach((p) => p.reject(new Error("PDF reader restarted")));
      waiting.clear();
      reject(new Error("This PDF took too long to open"));
    }, WORKER_TIMEOUT_MS);
    waiting.set(id, {
      resolve: (r) => {
        clearTimeout(timer);
        resolve(r);
      },
      reject: (e) => {
        clearTimeout(timer);
        reject(e);
      },
    });
    const request: ReadRequest = { id, buffer, maxTextPages: 4, maxImagePages: 2, maxPx: MAX_RENDER_PX };
    worker.postMessage(request, [buffer]);
  });
  if ("error" in result) throw new Error(result.error);
  return { text: result.text, images: result.images };
}

// ---------------------------------------------------------------- built-in reader

const DATE = String.raw`(\d{4}-\d{2}-\d{2}|\d{1,2}[\/.\-]\d{1,2}[\/.\-]\d{2,4}|\d{1,2}(?:st|nd|rd|th)?\s+[A-Za-z]{3,9},?\s+\d{4}|[A-Za-z]{3,9}\s+\d{1,2}(?:st|nd|rd|th)?,?\s+\d{4})`;

function findDate(text: string, labels: string) {
  const m = text.match(new RegExp(`(?:${labels})\\s*[:\\-]?\\s*${DATE}`, "i"));
  return m ? parseDate(m[1].replace(/(\d)(st|nd|rd|th)/, "$1").replace(",", "")) : null;
}

/** Pattern-based fallback for text PDFs when the AI reader isn't available. */
export function readBasic(text: string): ReadInvoice {
  const number =
    text.match(/invoice\s*(?:no\.?|number|num\.?|#)\s*[:#.]?\s*([A-Z0-9][A-Z0-9/_.-]{1,})/i)?.[1] ??
    text.match(/\b(INV[-\s]?[0-9][0-9/-]*)\b/i)?.[1] ??
    null;

  const issueDate = findDate(text, "invoice\\s*date|date\\s*of\\s*issue|issue\\s*date|date\\s*issued|dated|date");
  const dueDate = findDate(text, "due\\s*date|payment\\s*due|due\\s*by|due");

  // The payable total: prefer explicit "total due / amount due / grand total", else the largest "total".
  const money = String.raw`(?:KES|KSH|KSHS|Kshs?\.?)?\s*([0-9]{1,3}(?:,[0-9]{3})+(?:\.\d{1,2})?|[0-9]+(?:\.\d{1,2})?)`;
  const strong = [
    ...text.matchAll(
      new RegExp(
        `(?:grand\\s*total|total\\s*due|amount\\s*due|balance\\s*due|total\\s*payable)\\s*[:\\-]?\\s*${money}`,
        "gi",
      ),
    ),
  ];
  const weak = [...text.matchAll(new RegExp(`\\btotal\\b[^\\n0-9]{0,20}${money}`, "gi"))];
  const values = (strong.length ? strong : weak)
    .map((m) => toNumberOrNull(m[1]))
    .filter((n): n is number => n !== null && n > 0);
  const total = values.length ? Math.max(...values) : null;

  // "Bill to" block: the next non-empty line is usually the client.
  let clientName: string | null = null;
  const lines = text.split("\n").map((l) => l.trim());
  const idx = lines.findIndex((l) => /^(bill(ed)?\s*to|invoice\s*to|client|customer|to)\s*:?/i.test(l));
  if (idx >= 0) {
    const sameLine = lines[idx].replace(/^(bill(ed)?\s*to|invoice\s*to|client|customer|to)\s*:?\s*/i, "").trim();
    clientName = sameLine || lines.slice(idx + 1).find((l) => l.length > 1) || null;
  }

  const paidStamp = /\b(paid in full|payment received|receipt)\b/i.test(text);
  const mpesa = text.match(/\b([A-Z]{2}[A-Z0-9]{8})\b/)?.[1] ?? null;

  const found = [number, clientName, issueDate, total].filter(Boolean).length;
  return {
    number,
    clientName,
    issueDate,
    dueDate,
    currency: /\b(USD|US\$)\b/.test(text) ? "USD" : "KES",
    lineItems: [],
    total,
    amountPaid: paidStamp ? total : null,
    paidDate: null,
    method: mpesa ? "mpesa" : null,
    reference: paidStamp ? mpesa : null,
    notes: null,
    confidence: found === 4 ? "medium" : "low",
    source: "basic",
  };
}

// ---------------------------------------------------------------- main entry

type AiInvoice = {
  invoice_number: string | null;
  client_name: string | null;
  issue_date: string | null;
  due_date: string | null;
  currency: string | null;
  line_items: InvoiceLineItem[] | null;
  total: number | null;
  amount_paid: number | null;
  paid_date: string | null;
  payment_method: string | null;
  payment_reference: string | null;
  notes: string | null;
  confidence: "high" | "medium" | "low";
};

const isoOrNull = (s: string | null | undefined) => (s && /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : s ? parseDate(s) : null);

/**
 * Reads one invoice PDF. Returns the details plus whether the AI reader was used;
 * `aiError` explains why it fell back, so the review screen can say so.
 */
export async function readInvoicePdf(
  file: File,
  knownClients: string[],
): Promise<{ invoice: ReadInvoice; aiError: string | null }> {
  const { text, images } = await pullFromPdf(file);
  const scanned = images.length > 0 || text.replace(/\s/g, "").length < 40;

  try {
    const { data, error } = await supabase.functions.invoke("hub-read-invoice", {
      body: { text: scanned ? "" : text, images, fileName: file.name, clients: knownClients },
      // A stuck request shouldn't leave the card "Reading…" forever.
      timeout: AI_TIMEOUT_MS,
    });
    if (error) throw error;
    const ai = (data as { invoice?: AiInvoice })?.invoice;
    if (!ai) throw new Error("No result");
    const items = (ai.line_items ?? []).filter((l) => l && l.description && Number.isFinite(Number(l.unit_price)));
    return {
      invoice: {
        number: ai.invoice_number?.trim() || null,
        clientName: ai.client_name?.trim() || null,
        issueDate: isoOrNull(ai.issue_date),
        dueDate: isoOrNull(ai.due_date),
        currency: ai.currency?.toUpperCase() || "KES",
        lineItems: items.map((l) => ({
          description: l.description,
          quantity: Number(l.quantity) || 1,
          unit_price: Number(l.unit_price),
        })),
        total: ai.total != null ? Number(ai.total) : null,
        amountPaid: ai.amount_paid != null ? Number(ai.amount_paid) : null,
        paidDate: isoOrNull(ai.paid_date),
        method: ai.payment_method ? parseMethod(ai.payment_method) : null,
        reference: ai.payment_reference?.trim() || null,
        notes: ai.notes?.trim() || null,
        confidence: ai.confidence ?? "medium",
        source: "ai",
      },
      aiError: null,
    };
  } catch {
    const reason = scanned
      ? "This looks like a scanned PDF and the AI reader isn't available right now, so please fill in the details."
      : "The AI reader isn't available right now, so the built-in reader filled in what it could. Please check the details.";
    return { invoice: scanned ? { ...readBasic(""), confidence: "low" } : readBasic(text), aiError: reason };
  }
}
