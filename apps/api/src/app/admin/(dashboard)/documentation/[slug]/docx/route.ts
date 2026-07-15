import { findDoc } from "@/lib/orgDocs";
import { renderDocx } from "@/lib/docx";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = findDoc(slug);
  if (!doc) return new Response("Introuvable", { status: 404 });
  const buf = await renderDocx(doc);
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "Content-Disposition": `attachment; filename="${doc.slug}-sokatf.docx"`,
    },
  });
}
