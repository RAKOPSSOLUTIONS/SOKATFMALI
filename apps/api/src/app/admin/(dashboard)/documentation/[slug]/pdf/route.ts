import { findDoc } from "@/lib/orgDocs";
import { renderOrgPDF } from "@/lib/docPdf";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = findDoc(slug);
  if (!doc) return new Response("Introuvable", { status: 404 });
  const pdf = await renderOrgPDF(doc);
  return new Response(new Uint8Array(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `inline; filename="${doc.slug}-sokatf.pdf"`,
    },
  });
}
