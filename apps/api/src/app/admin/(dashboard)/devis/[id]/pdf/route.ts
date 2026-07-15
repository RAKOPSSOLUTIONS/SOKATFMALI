import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { renderDocumentPDF } from "@/lib/pdf";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const q = await prisma.quote.findUnique({ where: { id } });
  if (!q) return new Response("Introuvable", { status: 404 });
  const settings = await getSettings();
  const pdf = await renderDocumentPDF(q, "DEVIS", settings, 0);
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${q.number}.pdf"`,
    },
  });
}
