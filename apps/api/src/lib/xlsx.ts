import ExcelJS from "exceljs";
import { COMPANY } from "./finance";

const NAVY = "FF0F172A";
const ZEBRA = "FFF8FAFC";

/** Build a styled .xlsx workbook (navy bold header, frozen row, autofilter,
 *  auto column widths, thousands format on numeric columns, zebra striping). */
export async function buildXlsx(opts: { sheet: string; columns: string[]; rows: (string | number)[][] }): Promise<Buffer> {
  const wb = new ExcelJS.Workbook();
  wb.creator = COMPANY.name;
  wb.created = new Date();
  const ws = wb.addWorksheet(opts.sheet.slice(0, 31) || "Export", {
    views: [{ state: "frozen", ySplit: 1 }],
  });

  // Header
  const header = ws.addRow(opts.columns);
  header.height = 22;
  header.eachCell((cell) => {
    cell.font = { bold: true, color: { argb: "FFFFFFFF" }, size: 11 };
    cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: NAVY } };
    cell.alignment = { vertical: "middle" };
  });

  // Data
  opts.rows.forEach((r, ri) => {
    const row = ws.addRow(r);
    if (ri % 2 === 1) row.eachCell((cell) => (cell.fill = { type: "pattern", pattern: "solid", fgColor: { argb: ZEBRA } }));
  });

  // Column widths + numeric format
  opts.columns.forEach((label, i) => {
    const col = ws.getColumn(i + 1);
    let max = label.length;
    const vals = opts.rows.map((r) => r[i]);
    for (const v of vals) max = Math.max(max, String(v ?? "").length);
    col.width = Math.min(60, Math.max(12, max + 2));
    if (vals.length > 0 && vals.every((v) => typeof v === "number")) {
      col.numFmt = "#,##0";
      col.alignment = { horizontal: "right" };
    }
  });

  ws.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: opts.columns.length } };

  return Buffer.from(await wb.xlsx.writeBuffer());
}
