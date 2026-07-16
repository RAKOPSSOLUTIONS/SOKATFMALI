import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { parseItems, computeTotals, formatDate, QUOTE_STATUSES } from "@/lib/finance";
import { deleteQuote } from "../../finance-actions";
import { DocumentsList, type DocRow } from "../../_components/DocumentsList";

export const dynamic = "force-dynamic";

export default async function DevisPage() {
  const quotes = await prisma.quote.findMany({ orderBy: { createdAt: "desc" } });

  const rows: DocRow[] = quotes.map((q) => {
    const { total } = computeTotals(parseItems(q.items), q.taxRate, q.discount);
    return {
      id: q.id,
      number: q.number,
      clientName: q.clientName,
      clientCompany: q.clientCompany,
      dateLabel: formatDate(q.date),
      status: q.status,
      total,
      paid: 0,
      balance: 0,
    };
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary">Devis</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {quotes.length} devis enregistré{quotes.length > 1 ? "s" : ""}.
          </p>
        </div>
        <Link href="/admin/devis/new" className="btn-primary">
          <span className="material-symbols-outlined text-[18px]">add</span> Nouveau devis
        </Link>
      </div>

      <DocumentsList kind="devis" rows={rows} statuses={[...QUOTE_STATUSES]} deleteAction={deleteQuote} />
    </div>
  );
}
