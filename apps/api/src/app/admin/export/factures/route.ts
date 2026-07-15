import { prisma } from "@/lib/prisma";
import { parseItems, computeTotals, formatDate, STATUS_LABEL, toCSV } from "@/lib/finance";

export const dynamic = "force-dynamic";

export async function GET() {
  const invoices = await prisma.invoice.findMany({
    orderBy: { date: "desc" },
    include: { payments: true },
  });
  const rows = invoices.map((inv) => {
    const { total } = computeTotals(parseItems(inv.items), inv.taxRate, inv.discount);
    const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
    return [
      inv.number,
      formatDate(inv.date),
      inv.clientName,
      inv.clientCompany ?? "",
      Math.round(total),
      Math.round(paid),
      Math.round(total - paid),
      STATUS_LABEL[inv.status] ?? inv.status,
    ];
  });
  const csv = toCSV(
    ["Numéro", "Date", "Client", "Société", "Total TTC (FCFA)", "Payé", "Reste", "Statut"],
    rows,
  );
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="factures-sokatf.csv"',
    },
  });
}
