import { toCsv, type CsvColumn } from "../../lib/csv";

// Spreadsheet apps run a cell that starts with =, +, -, @, tab or carriage
// return as a formula. Prospect data comes from scraped sites, so every text
// value gets a leading apostrophe when it starts with one of those. Numbers
// stay numbers.

const FORMULA_START = /^[=+\-@\t\r]/;

export function safeCell(value: string | number | null | undefined) {
  if (typeof value !== "string") return value;
  return FORMULA_START.test(value) ? `'${value}` : value;
}

export function toSafeCsv<T>(rows: T[], columns: CsvColumn<T>[]) {
  return toCsv(
    rows,
    columns.map((c) => ({ header: String(safeCell(c.header)), value: (row: T) => safeCell(c.value(row)) })),
  );
}
