// CSV export for the finance tables. Opens cleanly in Excel and Google Sheets:
// UTF-8 with a BOM, every value quoted, amounts as plain numbers.

export type CsvColumn<T> = { header: string; value: (row: T) => string | number | null | undefined };

export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]) {
  const quote = (v: string | number | null | undefined) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  const lines = [columns.map((c) => quote(c.header)).join(",")];
  for (const row of rows) lines.push(columns.map((c) => quote(c.value(row))).join(","));
  return lines.join("\r\n");
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
