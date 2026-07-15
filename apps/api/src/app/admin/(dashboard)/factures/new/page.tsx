import Link from "next/link";
import { DocumentForm } from "../../../_components/DocumentForm";
import { createInvoice } from "../../../finance-actions";

export default function NewFacturePage() {
  const today = new Date().toISOString().slice(0, 10);
  const due = new Date();
  due.setDate(due.getDate() + 30);
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Link href="/admin/factures" className="font-label-md text-label-md text-on-surface-variant hover:text-primary">← Factures</Link>
        <h1 className="font-headline-lg text-headline-lg text-primary mt-1">Nouvelle facture</h1>
      </div>
      <DocumentForm
        action={createInvoice}
        submitLabel="Créer la facture"
        kind="facture"
        doc={{ date: today, secondDate: due.toISOString().slice(0, 10), taxRate: 18 }}
      />
    </div>
  );
}
