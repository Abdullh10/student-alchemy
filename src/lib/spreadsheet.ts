import * as XLSX from "xlsx";

export interface ImportedStudentRow {
  name: string;
  student_number?: string;
}

const NAME_HEADERS = ["اسم الطالب", "الاسم", "name", "student name", "الطالب"];
const NUMBER_HEADERS = ["رقم الطالب", "الرقم", "number", "id", "رقم"];

/**
 * Parses an uploaded Excel/CSV file of students. Accepts either a header row
 * (looks for common Arabic/English column names) or a single unlabeled name
 * column, and always skips blank rows.
 */
export async function parseStudentsFile(file: File): Promise<ImportedStudentRow[]> {
  const buffer = await file.arrayBuffer();
  const workbook = XLSX.read(buffer, { type: "array" });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows: Record<string, unknown>[] = XLSX.utils.sheet_to_json(sheet, { defval: "" });

  if (rows.length === 0) return [];

  const headers = Object.keys(rows[0]).map((h) => h.toString());
  const nameKey = headers.find((h) => NAME_HEADERS.some((n) => h.trim().toLowerCase() === n.toLowerCase())) ?? headers[0];
  const numberKey = headers.find((h) => NUMBER_HEADERS.some((n) => h.trim().toLowerCase() === n.toLowerCase()));

  return rows
    .map((row) => ({
      name: String(row[nameKey] ?? "").trim(),
      student_number: numberKey ? String(row[numberKey] ?? "").trim() || undefined : undefined,
    }))
    .filter((r) => r.name.length > 0);
}
