import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { parseItems, computeTotals, formatFCFA, formatDate, daysOverdue, waLink, reminderText } from "@/lib/finance";
import { sendInvoiceReminder } from "../../finance-actions";

export const dynamic = "force-dynamic";

export default async function FinancesPage() {
  const [invoices, quotesPending, recentPayments, allPayments] = await Promise.all([
    prisma.invoice.findMany({ include: { payments: true } }),
    prisma.quote.count({ where: { status: { in: ["DRAFT", "SENT"] } } }),
    prisma.payment.findMany({ orderBy: { date: "desc" }, take: 6, include: { invoice: { select: { number: true, clientName: true, id: true } } } }),
    prisma.payment.findMany({ select: { amount: true, date: true } }),
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

  const now = new Date();
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1);
    return { key: `${d.getFullYear()}-${d.getMonth()}`, label: d.toLocaleDateString("fr-FR", { month: "short" }), total: 0 };
  });
  for (const p of allPayments) {
    const d = new Date(p.date);
    const m = months.find((x) => x.key === `${d.getFullYear()}-${d.getMonth()}`);
    if (m) m.total += p.amount;
  }
  const maxMonth = Math.max(1, ...months.map((m) => m.total));
  const compact = (n: number) =>
    n >= 1e6 ? (n / 1e6).toFixed(1).replace(".0", "") + "M" : n >= 1e3 ? Math.round(n / 1e3) + "k" : String(Math.round(n));

  const overdue = invoices
    .filter((inv) => inv.status !== "CANCELLED" && inv.status !== "DRAFT")
    .map((inv) => {
      const { total } = computeTotals(parseItems(inv.items), inv.taxRate, inv.discount);
      const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
      return { inv, balance: total - paid, days: daysOverdue(inv.dueDate) };
    })
    .filter((x) => x.balance > 0.5 && x.days > 0)
    .sort((a, b) => b.days - a.days);

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

      {overdue.length > 0 && (
        <div className="card overflow-hidden">
          <div className="flex items-center gap-2 p-5 border-b border-outline-variant">
            <span className="material-symbols-outlined text-error">warning</span>
            <h2 className="font-headline-md text-headline-md text-primary">Factures à relancer ({overdue.length})</h2>
          </div>
          <ul className="divide-y divide-outline-variant">
            {overdue.map(({ inv, balance, days }) => (
              <li key={inv.id} className="flex flex-wrap items-center gap-4 p-4">
                <Link href={`/admin/factures/${inv.id}`} className="font-label-md text-label-md text-secondary w-40 hover:underline">{inv.number}</Link>
                <div className="min-w-0 flex-1">
                  <div className="font-label-md text-label-md text-primary truncate">{inv.clientName}</div>
                  <div className="font-body-sm text-body-sm text-error">
                    En retard de {days} jour{days > 1 ? "s" : ""} · échéance {formatDate(inv.dueDate)}
                  </div>
                </div>
                <span className="font-label-md text-label-md text-error">{formatFCFA(balance)}</span>
                <a
                  href={waLink(inv.clientPhone, reminderText(inv.number, inv.clientName, balance))}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-outline py-2"
                >
                  <span className="material-symbols-outlined text-[18px]">chat</span> Relancer
                </a>
                <form action={sendInvoiceReminder}>
                  <input type="hidden" name="id" value={inv.id} />
                  <button className="btn-outline py-2 disabled:opacity-50" disabled={!inv.clientEmail} title={inv.clientEmail ? "" : "Email client manquant"}>
                    <span className="material-symbols-outlined text-[18px]">mail</span> Email
                  </button>
                </form>
              </li>
            ))}
          </ul>
        </div>
      )}

      <div className="flex flex-wrap gap-3">
        <Link href="/admin/devis/new" className="btn-primary"><span className="material-symbols-outlined text-[18px]">add</span> Nouveau devis</Link>
        <Link href="/admin/factures/new" className="btn-outline"><span className="material-symbols-outlined text-[18px]">add</span> Nouvelle facture</Link>
        <a href="/admin/export/factures" className="btn-outline"><span className="material-symbols-outlined text-[18px]">table_view</span> Factures (Excel)</a>
        <a href="/admin/export/paiements" className="btn-outline"><span className="material-symbols-outlined text-[18px]">table_view</span> Paiements (Excel)</a>
        <a href="/admin/export/devis" className="btn-outline"><span className="material-symbols-outlined text-[18px]">table_view</span> Devis (Excel)</a>
      </div>

      <div className="card p-6">
        <h2 className="font-headline-md text-headline-md text-primary mb-6">CA encaissé — 6 derniers mois</h2>
        <div className="flex items-end gap-3 h-44">
          {months.map((m) => (
            <div key={m.key} className="flex-1 flex flex-col items-center justify-end gap-2 h-full">
              <span className="font-label-sm text-label-sm text-on-surface-variant">{m.total > 0 ? compact(m.total) : ""}</span>
              <div
                className="w-full rounded-t-md bg-secondary/80"
                style={{ height: `${Math.max(m.total > 0 ? 4 : 0, (m.total / maxMonth) * 100)}%` }}
                title={formatFCFA(m.total)}
              />
            </div>
          ))}
        </div>
        <div className="flex gap-3 mt-2">
          {months.map((m) => (
            <div key={m.key} className="flex-1 text-center font-label-sm text-label-sm text-on-surface-variant capitalize">{m.label}</div>
          ))}
        </div>
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
