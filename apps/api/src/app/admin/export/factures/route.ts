import { prisma } from "@/lib/prisma";
import { parseItems, computeTotals, formatDate, STATUS_LABEL } from "@/lib/finance";
import { buildXlsx } from "@/lib/xlsx";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const invoices = await prisma.invoice.findMany({ orderBy: { date: "desc" }, include: { payments: true } });
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
  const buf = await buildXlsx({
    sheet: "Factures",
    columns: ["Numéro", "Date", "Client", "Société", "Total TTC", "Payé", "Reste", "Statut"],
    rows,
  });
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="factures-sokatf.xlsx"',
      "Cache-Control": "no-store",
    },
  });
}
