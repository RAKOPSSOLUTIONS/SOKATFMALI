import Link from "next/link";
import { DocumentForm } from "../../../_components/DocumentForm";
import { createQuote } from "../../../finance-actions";

export default function NewDevisPage() {
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div className="space-y-6 max-w-4xl">
      <div>
        <Link href="/admin/devis" className="font-label-md text-label-md text-on-surface-variant hover:text-primary">← Devis</Link>
        <h1 className="font-headline-lg text-headline-lg text-primary mt-1">Nouveau devis</h1>
      </div>
      <DocumentForm action={createQuote} submitLabel="Créer le devis" kind="devis" doc={{ date: today, taxRate: 18 }} />
    </div>
  );
}
