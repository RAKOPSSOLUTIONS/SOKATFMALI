import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { parseItems } from "@/lib/finance";
import { DocumentForm } from "../../../../_components/DocumentForm";
import { updateInvoice } from "../../../../finance-actions";

export const dynamic = "force-dynamic";

export default async function EditFacturePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const inv = await prisma.invoice.findUnique({ where: { id } });
  if (!inv) notFound();
  const clients = await prisma.client.findMany({ orderBy: { name: "asc" } });

  const doc = {
    id: inv.id,
    clientName: inv.clientName,
    clientCompany: inv.clientCompany ?? "",
    clientEmail: inv.clientEmail ?? "",
    clientPhone: inv.clientPhone ?? "",
    clientAddress: inv.clientAddress ?? "",
    date: inv.date.toISOString().slice(0, 10),
    secondDate: inv.dueDate ? inv.dueDate.toISOString().slice(0, 10) : "",
    items: parseItems(inv.items),
    taxRate: inv.taxRate,
    discount: inv.discount,
    notes: inv.notes ?? "",
  };

  return (
    <div className="space-y-6">
      <div>
        <Link href={`/admin/factures/${inv.id}`} className="font-label-md text-label-md text-on-surface-variant hover:text-primary">← {inv.number}</Link>
        <h1 className="font-headline-lg text-headline-lg text-primary mt-1">Modifier la facture</h1>
      </div>
      <DocumentForm action={updateInvoice} submitLabel="Enregistrer" kind="facture" doc={doc} clients={clients} />
    </div>
  );
}
