import Link from "next/link";
import { getSettings } from "@/lib/settings";
import { DocumentForm } from "../../../_components/DocumentForm";
import { createQuote } from "../../../finance-actions";

export const dynamic = "force-dynamic";

export default async function NewDevisPage() {
  const s = await getSettings();
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Link href="/admin/devis" className="font-label-md text-label-md text-on-surface-variant hover:text-primary">← Devis</Link>
        <h1 className="font-headline-lg text-headline-lg text-primary mt-1">Nouveau devis</h1>
      </div>
      <DocumentForm
        action={createQuote}
        submitLabel="Créer le devis"
        kind="devis"
        doc={{ date: today, taxRate: s.defaultTaxRate, notes: s.paymentTerms ?? undefined }}
      />
    </div>
  );
}
