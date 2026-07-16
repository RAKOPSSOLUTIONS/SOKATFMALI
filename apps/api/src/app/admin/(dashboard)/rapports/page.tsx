import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { parseItems, computeTotals, formatFCFA, formatDate } from "@/lib/finance";
import { ExportButton } from "../../_components/ui";

export const dynamic = "force-dynamic";

const MONTHS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

export default async function RapportsPage() {
  const [quotes, invoices, leads, clientsCount] = await Promise.all([
    prisma.quote.findMany(),
    prisma.invoice.findMany({ include: { payments: true } }),
    prisma.lead.findMany(),
    prisma.client.count(),
  ]);

  // Quote funnel
  const quotesByStatus: Record<string, number> = {};
  for (const q of quotes) quotesByStatus[q.status] = (quotesByStatus[q.status] ?? 0) + 1;
  const accepted = quotesByStatus["ACCEPTED"] ?? 0;
  const conversion = quotes.length ? Math.round((accepted / quotes.length) * 100) : 0;

  // Invoice finance
  let billed = 0, collected = 0, outstanding = 0, overdue = 0;
  const byClient = new Map<string, { name: string; billed: number; collected: number }>();
  const byMonth = new Map<string, { billed: number; collected: number }>();
  const now = Date.now();
  for (const inv of invoices) {
    if (inv.status === "CANCELLED") continue;
    const { total } = computeTotals(parseItems(inv.items), inv.taxRate, inv.discount);
    const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
    collected += paid;
    if (inv.status !== "DRAFT") {
      billed += total;
      const bal = Math.max(0, total - paid);
      outstanding += bal;
      if (bal > 0.5 && inv.dueDate && new Date(inv.dueDate).getTime() < now) overdue += bal;
    }
    const g = byClient.get(inv.clientName) ?? { name: inv.clientName, billed: 0, collected: 0 };
    g.billed += total; g.collected += paid; byClient.set(inv.clientName, g);
    const d = new Date(inv.date);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const m = byMonth.get(key) ?? { billed: 0, collected: 0 };
    m.billed += total; m.collected += paid; byMonth.set(key, m);
  }

  // Last 12 months
  const months: { key: string; label: string; billed: number; collected: number }[] = [];
  const cursor = new Date();
  cursor.setDate(1);
  for (let i = 11; i >= 0; i--) {
    const d = new Date(cursor.getFullYear(), cursor.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const m = byMonth.get(key) ?? { billed: 0, collected: 0 };
    months.push({ key, label: `${MONTHS[d.getMonth()]} ${String(d.getFullYear()).slice(-2)}`, ...m });
  }
  const maxMonth = Math.max(1, ...months.map((m) => m.billed));

  // Top clients
  const topClients = [...byClient.values()].sort((a, b) => b.billed - a.billed).slice(0, 8);

  // Top products / services (aggregate line items across quotes + invoices)
  const byItem = new Map<string, { name: string; qty: number; revenue: number }>();
  for (const src of [...quotes, ...invoices]) {
    for (const it of parseItems(src.items)) {
      const key = it.description.trim().toLowerCase();
      if (!key) continue;
      const g = byItem.get(key) ?? { name: it.description.trim(), qty: 0, revenue: 0 };
      g.qty += it.quantity; g.revenue += it.quantity * it.unitPrice; byItem.set(key, g);
    }
  }
  const topItems = [...byItem.values()].sort((a, b) => b.revenue - a.revenue).slice(0, 8);

  // Overdue invoices
  const overdueList = invoices
    .filter((inv) => {
      if (inv.status === "CANCELLED" || inv.status === "DRAFT") return false;
      const { total } = computeTotals(parseItems(inv.items), inv.taxRate, inv.discount);
      const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
      return total - paid > 0.5 && inv.dueDate && new Date(inv.dueDate).getTime() < now;
    })
    .map((inv) => {
      const { total } = computeTotals(parseItems(inv.items), inv.taxRate, inv.discount);
      const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
      return { id: inv.id, number: inv.number, clientName: inv.clientName, due: inv.dueDate!, balance: total - paid };
    })
    .sort((a, b) => new Date(a.due).getTime() - new Date(b.due).getTime());

  const kpis = [
    { label: "CA facturé", value: formatFCFA(billed), icon: "payments", tone: "text-primary" },
    { label: "Encaissé", value: formatFCFA(collected), icon: "savings", tone: "text-secondary" },
    { label: "Impayés", value: formatFCFA(outstanding), icon: "pending_actions", tone: "text-error" },
    { label: "En retard", value: formatFCFA(overdue), icon: "warning", tone: "text-error" },
    { label: "Devis", value: quotes.length, icon: "request_quote", tone: "text-primary" },
    { label: "Conversion devis", value: `${conversion}%`, icon: "trending_up", tone: "text-secondary" },
    { label: "Clients", value: clientsCount, icon: "contacts", tone: "text-primary" },
    { label: "Prospects", value: leads.length, icon: "inbox", tone: "text-primary" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-primary">Rapports</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">Vue d'ensemble de l'activité commerciale et financière.</p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map((k) => (
          <div key={k.label} className="card p-5">
            <span className={`material-symbols-outlined mb-3 ${k.tone}`}>{k.icon}</span>
            <div className={`font-headline-md text-headline-md ${k.tone}`}>{k.value}</div>
            <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mt-1">{k.label}</div>
          </div>
        ))}
      </div>

      {/* Monthly revenue */}
      <div className="card p-5">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-headline-md text-headline-md text-primary">CA sur 12 mois</h2>
          <ExportButton
            filename="ca-mensuel-sokatf"
            headers={["Mois", "CA facturé", "Encaissé"]}
            rows={months.map((m) => [m.label, m.billed, m.collected])}
          />
        </div>
        <div className="flex items-end gap-2 h-48 overflow-x-auto">
          {months.map((m) => (
            <div key={m.key} className="flex-1 min-w-[36px] flex flex-col items-center gap-2 h-full justify-end">
              <div className="w-full flex flex-col justify-end h-full">
                <div className="w-full bg-primary/80 rounded-t" style={{ height: `${(m.billed / maxMonth) * 100}%` }} title={formatFCFA(m.billed)} />
              </div>
              <span className="font-body-sm text-[10px] text-on-surface-variant whitespace-nowrap">{m.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Top clients */}
        <ReportTable
          title="Top clients (CA)"
          icon="leaderboard"
          exportName="top-clients-sokatf"
          headers={["Client", "Facturé", "Encaissé"]}
          rows={topClients.map((c) => [c.name, c.billed, c.collected])}
          empty="Aucune facture."
        >
          {topClients.map((c) => (
            <tr key={c.name} className="border-b border-outline-variant last:border-0">
              <td className="p-3 font-label-md text-label-md text-primary">{c.name}</td>
              <td className="p-3 text-right font-body-md text-body-md">{formatFCFA(c.billed)}</td>
              <td className="p-3 text-right font-body-md text-body-md text-secondary">{formatFCFA(c.collected)}</td>
            </tr>
          ))}
        </ReportTable>

        {/* Top items */}
        <ReportTable
          title="Produits / services les plus vendus"
          icon="inventory_2"
          exportName="top-articles-sokatf"
          headers={["Article", "Quantité", "CA"]}
          rows={topItems.map((i) => [i.name, i.qty, i.revenue])}
          empty="Aucune ligne."
        >
          {topItems.map((i) => (
            <tr key={i.name} className="border-b border-outline-variant last:border-0">
              <td className="p-3 font-label-md text-label-md text-primary">{i.name}</td>
              <td className="p-3 text-right font-body-md text-body-md">{i.qty}</td>
              <td className="p-3 text-right font-body-md text-body-md">{formatFCFA(i.revenue)}</td>
            </tr>
          ))}
        </ReportTable>
      </div>

      {/* Overdue */}
      <ReportTable
        title="Factures en retard"
        icon="warning"
        exportName="factures-en-retard-sokatf"
        headers={["Numéro", "Client", "Échéance", "Reste"]}
        rows={overdueList.map((o) => [o.number, o.clientName, formatDate(o.due), o.balance])}
        empty="Aucune facture en retard. 🎉"
      >
        {overdueList.map((o) => (
          <tr key={o.id} className="border-b border-outline-variant last:border-0">
            <td className="p-3"><Link href={`/admin/factures/${o.id}`} className="font-label-md text-label-md text-secondary hover:underline">{o.number}</Link></td>
            <td className="p-3 font-body-md text-body-md text-primary">{o.clientName}</td>
            <td className="p-3 font-body-sm text-body-sm text-error">{formatDate(o.due)}</td>
            <td className="p-3 text-right font-label-md text-label-md text-error">{formatFCFA(o.balance)}</td>
          </tr>
        ))}
      </ReportTable>
    </div>
  );
}

function ReportTable({
  title, icon, exportName, headers, rows, empty, children,
}: {
  title: string; icon: string; exportName: string; headers: string[]; rows: (string | number)[][]; empty: string; children: React.ReactNode;
}) {
  return (
    <div className="card overflow-hidden">
      <div className="flex items-center justify-between gap-2 p-4 border-b border-outline-variant">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-secondary">{icon}</span>
          <h2 className="font-headline-md text-headline-md text-primary">{title}</h2>
        </div>
        {rows.length > 0 && <ExportButton filename={exportName} headers={headers} rows={rows} />}
      </div>
      {rows.length === 0 ? (
        <p className="p-6 text-center font-body-md text-body-md text-on-surface-variant">{empty}</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-surface-container-low">
                {headers.map((h, i) => (
                  <th key={h} className={`font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant p-3 ${i === 0 ? "" : "text-right"}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>{children}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
