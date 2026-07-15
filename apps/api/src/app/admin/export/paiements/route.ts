import { prisma } from "@/lib/prisma";
import { formatDate, toCSV } from "@/lib/finance";

export const dynamic = "force-dynamic";

export async function GET() {
  const payments = await prisma.payment.findMany({
    orderBy: { date: "desc" },
    include: { invoice: { select: { number: true, clientName: true } } },
  });
  const rows = payments.map((p) => [
    formatDate(p.date),
    p.invoice.number,
    p.invoice.clientName,
    Math.round(p.amount),
    p.method,
    p.note ?? "",
  ]);
  const csv = toCSV(["Date", "Facture", "Client", "Montant (FCFA)", "Méthode", "Note"], rows);
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="paiements-sokatf.csv"',
    },
  });
}
