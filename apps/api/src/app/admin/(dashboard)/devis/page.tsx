import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { parseItems, computeTotals, formatFCFA, formatDate, STATUS_LABEL, STATUS_STYLE } from "@/lib/finance";

export const dynamic = "force-dynamic";

export default async function DevisPage() {
  const quotes = await prisma.quote.findMany({ orderBy: { createdAt: "desc" } });

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

      {quotes.length === 0 ? (
        <div className="card p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">request_quote</span>
          <p className="font-body-md text-body-md text-on-surface-variant">Aucun devis. Créez votre premier devis.</p>
        </div>
      ) : (
        <div className="card divide-y divide-outline-variant overflow-hidden">
          {quotes.map((q) => {
            const { total } = computeTotals(parseItems(q.items), q.taxRate, q.discount);
            return (
              <Link key={q.id} href={`/admin/devis/${q.id}`} className="flex flex-wrap items-center gap-4 p-4 hover:bg-surface-container-low transition-colors">
                <span className="font-label-md text-label-md text-secondary w-32">{q.number}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-label-md text-label-md text-primary truncate">{q.clientName}</div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant">{formatDate(q.date)}</div>
                </div>
                <span className="font-label-md text-label-md text-primary">{formatFCFA(total)}</span>
                <span className={`badge ${STATUS_STYLE[q.status] ?? ""}`}>{STATUS_LABEL[q.status] ?? q.status}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
