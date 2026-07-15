import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { parseItems, computeTotals, formatFCFA, formatDate, STATUS_LABEL, STATUS_STYLE } from "@/lib/finance";

export const dynamic = "force-dynamic";

export default async function FacturesPage() {
  const invoices = await prisma.invoice.findMany({
    orderBy: { createdAt: "desc" },
    include: { payments: true },
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary">Factures</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            {invoices.length} facture{invoices.length > 1 ? "s" : ""}.
          </p>
        </div>
        <Link href="/admin/factures/new" className="btn-primary">
          <span className="material-symbols-outlined text-[18px]">add</span> Nouvelle facture
        </Link>
      </div>

      {invoices.length === 0 ? (
        <div className="card p-8 text-center">
          <span className="material-symbols-outlined text-4xl text-on-surface-variant mb-2">receipt_long</span>
          <p className="font-body-md text-body-md text-on-surface-variant">Aucune facture pour le moment.</p>
        </div>
      ) : (
        <div className="card divide-y divide-outline-variant overflow-hidden">
          {invoices.map((inv) => {
            const { total } = computeTotals(parseItems(inv.items), inv.taxRate, inv.discount);
            const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
            const balance = total - paid;
            return (
              <Link key={inv.id} href={`/admin/factures/${inv.id}`} className="flex flex-wrap items-center gap-4 p-4 hover:bg-surface-container-low transition-colors">
                <span className="font-label-md text-label-md text-secondary w-32">{inv.number}</span>
                <div className="min-w-0 flex-1">
                  <div className="font-label-md text-label-md text-primary truncate">{inv.clientName}</div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant">{formatDate(inv.date)}</div>
                </div>
                <div className="text-right">
                  <div className="font-label-md text-label-md text-primary">{formatFCFA(total)}</div>
                  {balance > 0.5 && <div className="font-body-sm text-body-sm text-error">Reste {formatFCFA(balance)}</div>}
                </div>
                <span className={`badge ${STATUS_STYLE[inv.status] ?? ""}`}>{STATUS_LABEL[inv.status] ?? inv.status}</span>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
