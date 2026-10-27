import { format, parseISO } from "date-fns";
import { formatKpi } from "@/hub/lib/format";
import { periodRows, storiesFor, headlineSentence, headlineStory, withData } from "./derive";
import type { PortalSnapshot } from "./types";

// Downloads built in the browser from data the client already has. The heavy
// libraries (SheetJS, jsPDF) load only when a download is clicked.

export type Cell = string | number | null;
export type Sheet = { name: string; rows: Cell[][] };

function save(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 2000);
}

const slug = (s: string) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const fileStamp = () => format(new Date(), "yyyy-MM-dd");

/** Quotes a CSV field and neutralises spreadsheet formulas (=, +, -, @) so a cell can never run as one. */
function csvField(value: Cell) {
  if (value === null) return "";
  let s = String(value);
  if (typeof value === "string" && /^[=+\-@\t\r]/.test(s)) s = `'${s}`;
  return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}

export function downloadCsv(name: string, rows: Cell[][]) {
  const text = rows.map((r) => r.map(csvField).join(",")).join("\r\n");
  // The BOM makes Excel read UTF-8 (en dashes, accents) correctly.
  save(new Blob(["﻿", text], { type: "text/csv;charset=utf-8" }), `${slug(name)}-${fileStamp()}.csv`);
}

export async function downloadXlsx(name: string, sheets: Sheet[]) {
  const XLSX = await import("xlsx");
  const book = XLSX.utils.book_new();
  for (const sheet of sheets) {
    const ws = XLSX.utils.aoa_to_sheet(sheet.rows);
    const widths = sheet.rows[0]?.map((_, c) => ({
      wch: Math.min(48, Math.max(10, ...sheet.rows.map((r) => String(r[c] ?? "").length + 2))),
    }));
    if (widths) ws["!cols"] = widths;
    XLSX.utils.book_append_sheet(book, ws, sheet.name.slice(0, 31));
  }
  XLSX.writeFile(book, `${slug(name)}-${fileStamp()}.xlsx`);
}

// ---------------------------------------------------------------- PDF

const ORANGE: [number, number, number] = [255, 106, 0];
const INK: [number, number, number] = [28, 22, 18];
const MUTED: [number, number, number] = [112, 100, 92];

type Doc = import("jspdf").jsPDF;

async function newPdf() {
  const [{ jsPDF }, autoTable] = await Promise.all([import("jspdf"), import("jspdf-autotable")]);
  return { doc: new jsPDF({ unit: "pt", format: "a4" }), autoTable: autoTable.default };
}

function header(doc: Doc, title: string, subtitle: string) {
  const w = doc.internal.pageSize.getWidth();
  doc.setFillColor(...INK);
  doc.rect(0, 0, w, 96, "F");
  doc.setFillColor(...ORANGE);
  doc.rect(0, 96, w, 4, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.text(title, 40, 50);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(255, 190, 140);
  doc.text(subtitle, 40, 72);
  doc.setTextColor(...INK);
}

function footer(doc: Doc, who: string) {
  const pages = doc.getNumberOfPages();
  const w = doc.internal.pageSize.getWidth();
  const h = doc.internal.pageSize.getHeight();
  for (let p = 1; p <= pages; p++) {
    doc.setPage(p);
    doc.setFontSize(8.5);
    doc.setTextColor(...MUTED);
    doc.text(`${who} · Prepared ${format(new Date(), "d MMM yyyy")}`, 40, h - 24);
    doc.text(`Page ${p} of ${pages}`, w - 40, h - 24, { align: "right" });
  }
}

/** A clean branded table as a PDF: what each table's "Download PDF" produces. */
export async function downloadTablePdf(opts: { title: string; subtitle: string; who: string; head: string[]; body: Cell[][]; fileName: string }) {
  const { doc, autoTable } = await newPdf();
  header(doc, opts.title, opts.subtitle);
  autoTable(doc, {
    startY: 124,
    head: [opts.head],
    body: opts.body.map((r) => r.map((c) => (c === null ? "" : String(c)))),
    margin: { left: 40, right: 40, bottom: 46 },
    styles: { fontSize: 9, cellPadding: 6, textColor: INK },
    headStyles: { fillColor: ORANGE, textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [250, 246, 242] },
  });
  footer(doc, opts.who);
  doc.save(`${slug(opts.fileName)}-${fileStamp()}.pdf`);
}

/** The full performance report: headline, KPI scorecard, a bar chart and the month-by-month numbers. */
export async function downloadPerformancePdf(snap: PortalSnapshot) {
  const { doc, autoTable } = await newPdf();
  const stories = withData(storiesFor(snap, "all"));
  const headline = headlineStory(stories);
  const name = snap.client.business_name || snap.client.name;
  const first = snap.reports.map((r) => r.period_start).sort()[0];
  const last = snap.reports.map((r) => r.period_end).sort().at(-1);
  const w = doc.internal.pageSize.getWidth();

  header(
    doc,
    `${name}: performance report`,
    first && last ? `${format(parseISO(first), "MMM yyyy")} to ${format(parseISO(last), "MMM yyyy")}` : "Performance report",
  );

  let y = 128;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("In short", 40, y);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10.5);
  doc.setTextColor(...MUTED);
  const lines = doc.splitTextToSize(headlineSentence(headline), w - 80);
  doc.text(lines, 40, y + 18);
  y += 18 + lines.length * 14 + 14;
  doc.setTextColor(...INK);

  autoTable(doc, {
    startY: y,
    head: [["Metric", "Started at", "Latest", "Change", "Target"]],
    body: stories.map((s) => [
      s.kpi.name,
      formatKpi(s.first, s.kpi.unit),
      formatKpi(s.latest, s.kpi.unit),
      s.change === null ? "n/a" : `${s.change > 0 ? "+" : ""}${s.change}%`,
      s.kpi.target ? formatKpi(Number(s.kpi.target), s.kpi.unit) : "",
    ]),
    margin: { left: 40, right: 40, bottom: 46 },
    styles: { fontSize: 9.5, cellPadding: 7, textColor: INK },
    headStyles: { fillColor: ORANGE, textColor: 255, fontStyle: "bold" },
    alternateRowStyles: { fillColor: [250, 246, 242] },
  });
  y = (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 26;

  // Bars for the headline KPI, drawn by hand so no chart library is needed.
  if (headline && headline.points.length > 1) {
    if (y > 560) {
      doc.addPage();
      y = 60;
    }
    doc.setFont("helvetica", "bold");
    doc.setFontSize(13);
    doc.text(`${headline.kpi.name} by month`, 40, y);
    const chartTop = y + 16;
    const chartH = 120;
    const plotW = w - 80;
    const pts = headline.points.slice(-12);
    const max = Math.max(...pts.map((p) => p.value), 1);
    const slot = plotW / pts.length;
    pts.forEach((p, i) => {
      const bh = Math.max(2, (p.value / max) * chartH);
      doc.setFillColor(...(i === pts.length - 1 ? ORANGE : ([255, 190, 140] as [number, number, number])));
      doc.roundedRect(40 + i * slot + slot * 0.18, chartTop + chartH - bh, slot * 0.64, bh, 2, 2, "F");
      doc.setFontSize(7.5);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...MUTED);
      doc.text(p.label.split(" ")[0], 40 + i * slot + slot / 2, chartTop + chartH + 12, { align: "center" });
    });
    doc.setTextColor(...INK);
    y = chartTop + chartH + 36;
  }

  const kpis = [...snap.kpis].sort((a, b) => a.sort_order - b.sort_order);
  const rows = periodRows(snap);
  if (rows.length) {
    autoTable(doc, {
      startY: y,
      head: [["Period", ...kpis.map((k) => k.name)]],
      body: rows.map((r) => [r.period, ...kpis.map((k) => formatKpi(r.values[k.id], k.unit))]),
      margin: { left: 40, right: 40, bottom: 46 },
      styles: { fontSize: 8.5, cellPadding: 5, textColor: INK },
      headStyles: { fillColor: INK, textColor: 255, fontStyle: "bold" },
      alternateRowStyles: { fillColor: [250, 246, 242] },
    });
  }

  const notes = snap.reports.filter((r) => r.summary?.trim()).sort((a, b) => b.period_end.localeCompare(a.period_end)).slice(0, 6);
  if (notes.length) {
    autoTable(doc, {
      startY: (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 24,
      head: [["Highlights", ""]],
      body: notes.map((r) => [r.title, r.summary ?? ""]),
      margin: { left: 40, right: 40, bottom: 46 },
      styles: { fontSize: 9, cellPadding: 6, textColor: INK },
      headStyles: { fillColor: ORANGE, textColor: 255, fontStyle: "bold" },
      columnStyles: { 0: { cellWidth: 150, fontStyle: "bold" } },
    });
  }

  footer(doc, name);
  doc.save(`${slug(name)}-performance-report-${fileStamp()}.pdf`);
}

// ---------------------------------------------------------------- workbooks

/** Every KPI by period, plus a sheet of notes: the Excel version of the performance report. */
export function performanceSheets(snap: PortalSnapshot): Sheet[] {
  const kpis = [...snap.kpis].sort((a, b) => a.sort_order - b.sort_order);
  const rows = [...periodRows(snap)].reverse();
  return [
    {
      name: "Performance",
      rows: [["Period", ...kpis.map((k) => k.name)], ...rows.map((r) => [r.period, ...kpis.map((k) => r.values[k.id])])],
    },
    {
      name: "Highlights",
      rows: [
        ["Report", "Period end", "Summary"],
        ...[...snap.reports].sort((a, b) => a.period_end.localeCompare(b.period_end)).map((r) => [r.title, r.period_end, r.summary ?? ""]),
      ],
    },
  ];
}
