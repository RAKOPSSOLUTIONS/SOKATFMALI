import { prisma } from "@/lib/prisma";
import { parseItems, computeTotals, formatDate, STATUS_LABEL } from "@/lib/finance";
import { buildXlsx } from "@/lib/xlsx";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const quotes = await prisma.quote.findMany({ orderBy: { date: "desc" } });
  const rows = quotes.map((q) => {
    const { total } = computeTotals(parseItems(q.items), q.taxRate, q.discount);
    return [q.number, formatDate(q.date), q.clientName, q.clientCompany ?? "", Math.round(total), STATUS_LABEL[q.status] ?? q.status];
  });
  const buf = await buildXlsx({
    sheet: "Devis",
    columns: ["Numéro", "Date", "Client", "Société", "Total TTC", "Statut"],
    rows,
  });
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="devis-sokatf.xlsx"',
      "Cache-Control": "no-store",
    },
  });
}
