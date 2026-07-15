import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseItems } from "@/lib/finance";
import { DocumentForm } from "../../../../_components/DocumentForm";
import { updateQuote } from "../../../../finance-actions";

export const dynamic = "force-dynamic";

export default async function EditDevisPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const q = await prisma.quote.findUnique({ where: { id } });
  if (!q) notFound();
  const [clients, catalog] = await Promise.all([
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    prisma.catalogItem.findMany({ where: { active: true }, orderBy: [{ kind: "asc" }, { name: "asc" }], select: { id: true, kind: true, name: true, unit: true, price: true } }),
  ]);

  const doc = {
    id: q.id,
    clientName: q.clientName,
    clientCompany: q.clientCompany ?? "",
    clientEmail: q.clientEmail ?? "",
    clientPhone: q.clientPhone ?? "",
    clientAddress: q.clientAddress ?? "",
    date: q.date.toISOString().slice(0, 10),
    secondDate: q.validUntil ? q.validUntil.toISOString().slice(0, 10) : "",
    items: parseItems(q.items),
    taxRate: q.taxRate,
    discount: q.discount,
    notes: q.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/admin/devis/${q.id}`} className="font-label-md text-label-md text-on-surface-variant hover:text-primary">← {q.number}</Link>
        <h1 className="font-headline-lg text-headline-lg text-primary mt-1">Modifier le devis</h1>
      </div>
      <DocumentForm action={updateQuote} submitLabel="Enregistrer" kind="devis" doc={doc} clients={clients} catalog={catalog} />
    </div>
  );
}
