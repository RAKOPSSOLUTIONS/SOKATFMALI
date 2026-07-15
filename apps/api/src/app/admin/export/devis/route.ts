import { prisma } from "@/lib/prisma";
import { parseItems, computeTotals, formatDate, STATUS_LABEL, toCSV } from "@/lib/finance";

export const dynamic = "force-dynamic";

export async function GET() {
  const quotes = await prisma.quote.findMany({ orderBy: { date: "desc" } });
  const rows = quotes.map((q) => {
    const { total } = computeTotals(parseItems(q.items), q.taxRate, q.discount);
    return [
      q.number,
      formatDate(q.date),
      q.clientName,
      q.clientCompany ?? "",
      Math.round(total),
      STATUS_LABEL[q.status] ?? q.status,
    ];
  });
  const csv = toCSV(["Numéro", "Date", "Client", "Société", "Total TTC (FCFA)", "Statut"], rows);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="devis-sokatf.csv"',
    },
  });
}
