import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { parseItems, computeTotals } from "@/lib/finance";
import { renderDocumentPDF } from "@/lib/pdf";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const inv = await prisma.invoice.findUnique({ where: { id }, include: { payments: true } });
  if (!inv) return new Response("Introuvable", { status: 404 });
  const settings = await getSettings();
  const paid = inv.payments.reduce((sum, p) => sum + p.amount, 0);
  const pdf = await renderDocumentPDF(inv, "FACTURE", settings, paid);
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${inv.number}.pdf"`,
    },
  });
}
