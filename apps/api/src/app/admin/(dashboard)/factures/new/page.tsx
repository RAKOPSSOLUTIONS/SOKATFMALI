import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSettings } from "@/lib/settings";
import { DocumentForm } from "../../../_components/DocumentForm";
import { createInvoice } from "../../../finance-actions";

export const dynamic = "force-dynamic";

export default async function NewFacturePage() {
  const [s, clients, catalog] = await Promise.all([
    getSettings(),
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    prisma.catalogItem.findMany({ where: { active: true }, orderBy: [{ kind: "asc" }, { name: "asc" }], select: { id: true, kind: true, name: true, unit: true, price: true } }),
  ]);
  const today = new Date().toISOString().slice(0, 10);
  const due = new Date();
  due.setDate(due.getDate() + 30);
  return (
    <div className="space-y-6">
      <div>
        <Link href="/admin/factures" className="font-label-md text-label-md text-on-surface-variant hover:text-primary">← Factures</Link>
        <h1 className="font-headline-lg text-headline-lg text-primary mt-1">Nouvelle facture</h1>
      </div>
      <DocumentForm
        action={createInvoice}
        submitLabel="Créer la facture"
        kind="facture"
        doc={{ date: today, secondDate: due.toISOString().slice(0, 10), taxRate: s.defaultTaxRate, notes: s.paymentTerms ?? undefined }}
        clients={clients}
        catalog={catalog}
      />
    </div>
  );
}
