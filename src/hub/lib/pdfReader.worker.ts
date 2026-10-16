/// <reference lib="webworker" />
// Reads invoice PDFs entirely off the main thread, so the page never freezes,
// however heavy the PDF (Canva exports, big scans).
//
// pdf.js normally parses in its own worker but draws pages on the main thread.
// Here both happen in this worker: loading pdf.worker first registers its
// message handler on globalThis, so pdf.js parses in-thread instead of spawning
// a nested worker, and pages are drawn onto OffscreenCanvas.
import "pdfjs-dist/build/pdf.worker.min.mjs";
import { getDocument } from "pdfjs-dist";

declare const self: DedicatedWorkerGlobalScope;

/** Canvases for pdf.js without a DOM. */
class OffscreenCanvasFactory {
  create(width: number, height: number) {
    if (width <= 0 || height <= 0) throw new Error("Invalid canvas size");
    const canvas = new OffscreenCanvas(width, height);
    return { canvas, context: canvas.getContext("2d", { willReadFrequently: true }) };
  }
  reset(c: { canvas: OffscreenCanvas }, width: number, height: number) {
    c.canvas.width = width;
    c.canvas.height = height;
  }
  destroy(c: { canvas: OffscreenCanvas | null; context: unknown }) {
    if (c.canvas) c.canvas.width = c.canvas.height = 0;
    c.canvas = null;
    c.context = null;
  }
}

/** SVG filters need a DOM; invoices don't need them. */
class NoFilterFactory {
  addFilter() {
    return "none";
  }
  addHCMFilter() {
    return "none";
  }
  addAlphaFilter() {
    return "none";
  }
  addLuminosityFilter() {
    return "none";
  }
  addHighlightHCMFilter() {
    return "none";
  }
  destroy() {}
}

export type ReadRequest = {
  id: string;
  buffer: ArrayBuffer;
  maxTextPages: number;
  maxImagePages: number;
  maxPx: number;
};
export type ReadResponse =
  | { id: string; ok: true; text: string; images: string[]; pageCount: number }
  | { id: string; ok: false; error: string };

function blobToDataUrl(blob: Blob) {
  return new FileReaderSync().readAsDataURL(blob);
}

async function read({ id, buffer, maxTextPages, maxImagePages, maxPx }: ReadRequest): Promise<ReadResponse> {
  const doc = await getDocument({
    data: new Uint8Array(buffer),
    CanvasFactory: OffscreenCanvasFactory,
    FilterFactory: NoFilterFactory,
    // Draw glyphs as paths: no FontFace/document needed in a worker.
    disableFontFace: true,
    isOffscreenCanvasSupported: true,
    isEvalSupported: false,
    useSystemFonts: false,
  }).promise;

  try {
    // Text, with lines rebuilt from positioned runs.
    const pages: string[] = [];
    for (let p = 1; p <= Math.min(doc.numPages, maxTextPages); p++) {
      const page = await doc.getPage(p);
      const content = await page.getTextContent();
      const lines = new Map<number, { x: number; s: string }[]>();
      for (const item of content.items) {
        if (!("str" in item) || !item.str.trim()) continue;
        const y = Math.round(item.transform[5] / 3) * 3;
        (lines.get(y) ?? lines.set(y, []).get(y)!).push({ x: item.transform[4], s: item.str });
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
      page.cleanup();
    }
    const text = pages.join("\n\n").trim();

    // No real text layer: a scan (or outlined text). Send page images instead.
    const images: string[] = [];
    if (text.replace(/\s/g, "").length < 40) {
      for (let p = 1; p <= Math.min(doc.numPages, maxImagePages); p++) {
        const page = await doc.getPage(p);
        const base = page.getViewport({ scale: 1 });
        const viewport = page.getViewport({ scale: Math.min(1.6, maxPx / Math.max(base.width, base.height)) });
        const canvas = new OffscreenCanvas(Math.floor(viewport.width), Math.floor(viewport.height));
        const ctx = canvas.getContext("2d")!;
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        await page.render({ canvasContext: ctx as unknown as CanvasRenderingContext2D, viewport }).promise;
        const blob = await canvas.convertToBlob({ type: "image/jpeg", quality: 0.8 });
        canvas.width = canvas.height = 0;
        page.cleanup();
        images.push(blobToDataUrl(blob));
      }
    }
    return { id, ok: true, text, images, pageCount: doc.numPages };
  } finally {
    await doc.destroy();
  }
}

self.onmessage = async (e: MessageEvent<ReadRequest>) => {
  try {
    self.postMessage(await read(e.data));
  } catch (err) {
    self.postMessage({
      id: e.data.id,
      ok: false,
      error: (err as Error)?.message ?? "Couldn't read this PDF",
    } satisfies ReadResponse);
  }
};
