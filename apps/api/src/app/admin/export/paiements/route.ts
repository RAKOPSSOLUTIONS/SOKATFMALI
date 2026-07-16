import { prisma } from "@/lib/prisma";
import { formatDate } from "@/lib/finance";
import { buildXlsx } from "@/lib/xlsx";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const payments = await prisma.payment.findMany({
    orderBy: { date: "desc" },
    include: { invoice: { select: { number: true, clientName: true } } },
  });
  const rows = payments.map((p) => [formatDate(p.date), p.invoice.number, p.invoice.clientName, Math.round(p.amount), p.method, p.note ?? ""]);
  const buf = await buildXlsx({
    sheet: "Paiements",
    columns: ["Date", "Facture", "Client", "Montant", "Méthode", "Note"],
    rows,
  });
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="paiements-sokatf.xlsx"',
      "Cache-Control": "no-store",
    },
  });
}
