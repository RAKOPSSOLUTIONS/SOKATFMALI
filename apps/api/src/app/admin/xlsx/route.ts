import { NextRequest } from "next/server";
import { buildXlsx } from "@/lib/xlsx";

export const runtime = "nodejs";

/** Generic styled .xlsx generator. The client POSTs the already-computed
 *  { filename, sheet, columns, rows } it is displaying. Protected by the admin
 *  middleware (a logged-in user can only export data it was served). */
export async function POST(req: NextRequest) {
  let body: { filename?: string; sheet?: string; columns?: unknown; rows?: unknown };
  try {
    body = await req.json();
  } catch {
    return new Response("Bad request", { status: 400 });
  }
  const filename = String(body.filename || "export").replace(/[^\w.-]+/g, "_").replace(/\.xlsx$/i, "");
  const columns = Array.isArray(body.columns) ? body.columns.map((c) => String(c)) : [];
  const rows = Array.isArray(body.rows)
    ? (body.rows as unknown[]).map((r) => (Array.isArray(r) ? r.map((c) => (typeof c === "number" ? c : String(c ?? ""))) : []))
    : [];
  if (columns.length === 0) return new Response("No columns", { status: 400 });

  const buf = await buildXlsx({ sheet: String(body.sheet || "Export"), columns, rows });
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}.xlsx"`,
      "Cache-Control": "no-store",
    },
  });
}
