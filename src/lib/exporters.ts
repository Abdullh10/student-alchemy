import * as XLSX from "xlsx";

/** Exports an array of plain objects as a downloadable .xlsx file (RTL-safe, real data). */
export function exportRowsToExcel(filename: string, sheetName: string, rows: Record<string, unknown>[]) {
  const worksheet = XLSX.utils.json_to_sheet(rows);
  worksheet["!cols"] = Object.keys(rows[0] ?? {}).map(() => ({ wch: 18 }));
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/**
 * PDF export & printing both go through the browser's native print-to-PDF —
 * jsPDF-style libraries don't shape Arabic glyphs correctly, while a real
 * HTML/CSS RTL page prints Arabic perfectly and lets the user "Save as PDF".
 * Call this from a page that renders a `.print-area` section styled for print.
 */
export function printReport() {
  window.print();
}
