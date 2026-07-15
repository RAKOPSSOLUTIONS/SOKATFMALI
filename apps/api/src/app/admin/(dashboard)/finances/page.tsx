import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { parseItems, computeTotals, formatFCFA, formatDate } from "@/lib/finance";

export const dynamic = "force-dynamic";

export default async function FinancesPage() {
  const [invoices, quotesPending, recentPayments] = await Promise.all([
    prisma.invoice.findMany({ include: { payments: true } }),
    prisma.quote.count({ where: { status: { in: ["DRAFT", "SENT"] } } }),
    prisma.payment.findMany({ orderBy: { date: "desc" }, take: 6, include: { invoice: { select: { number: true, clientName: true, id: true } } } }),
  ]);

  let billed = 0,
    collected = 0,
    outstanding = 0,
    issuedCount = 0;
  for (const inv of invoices) {
    if (inv.status === "CANCELLED") continue;
    const { total } = computeTotals(parseItems(inv.items), inv.taxRate, inv.discount);
    const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
    collected += paid;
    if (inv.status !== "DRAFT") {
      billed += total;
      outstanding += Math.max(0, total - paid);
      issuedCount++;
    }
  }

  const kpis = [
    { label: "Chiffre d'affaires facturé", value: formatFCFA(billed), icon: "receipt_long", tone: "text-primary" },
    { label: "Encaissé", value: formatFCFA(collected), icon: "payments", tone: "text-secondary" },
    { label: "Impayés", value: formatFCFA(outstanding), icon: "pending_actions", tone: "text-error" },
    { label: "Devis en cours", value: String(quotesPending), icon: "request_quote", tone: "text-primary" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-primary">Gestion financière</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Vue d'ensemble de la facturation et des encaissements.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="card p-5">
            <span className={`material-symbols-outlined mb-3 ${k.tone}`}>{k.icon}</span>
            <div className={`font-headline-md text-headline-md ${k.tone}`}>{k.value}</div>
            <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/devis/new" className="btn-primary"><span className="material-symbols-outlined text-[18px]">add</span> Nouveau devis</Link>
        <Link href="/admin/factures/new" className="btn-outline"><span className="material-symbols-outlined text-[18px]">add</span> Nouvelle facture</Link>
        <a href="/admin/export/factures" className="btn-outline"><span className="material-symbols-outlined text-[18px]">download</span> Factures (CSV)</a>
        <a href="/admin/export/paiements" className="btn-outline"><span className="material-symbols-outlined text-[18px]">download</span> Paiements (CSV)</a>
        <a href="/admin/export/devis" className="btn-outline"><span className="material-symbols-outlined text-[18px]">download</span> Devis (CSV)</a>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-outline-variant">
          <h2 className="font-headline-md text-headline-md text-primary">Derniers encaissements</h2>
          <Link href="/admin/factures" className="font-label-md text-label-md text-secondary hover:underline">Factures</Link>
        </div>
        {recentPayments.length === 0 ? (
          <p className="p-5 font-body-md text-body-md text-on-surface-variant">Aucun paiement enregistré.</p>
        ) : (
          <ul className="divide-y divide-outline-variant">
            {recentPayments.map((p) => (
              <li key={p.id} className="flex items-center gap-4 p-5">
                <span className="material-symbols-outlined text-secondary">payments</span>
                <div className="min-w-0">
                  <Link href={`/admin/factures/${p.invoice.id}`} className="font-label-md text-label-md text-primary hover:underline">
                    {p.invoice.number}
                  </Link>
                  <div className="font-body-sm text-body-sm text-on-surface-variant truncate">{p.invoice.clientName} · {p.method}</div>
                </div>
                <div className="ml-auto text-right">
                  <div className="font-label-md text-label-md text-secondary">{formatFCFA(p.amount)}</div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant">{formatDate(p.date)}</div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
