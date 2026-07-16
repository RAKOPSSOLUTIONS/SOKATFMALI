import { prisma } from "@/lib/prisma";
import { parseItems, computeTotals, formatFCFA } from "@/lib/finance";
import { createClient, updateClient, deleteClient } from "../../actions";
import { ClientsManager } from "../../_components/ClientsManager";

export const dynamic = "force-dynamic";

export default async function ClientsPage() {
  const [clients, invoices] = await Promise.all([
    prisma.client.findMany({ orderBy: { name: "asc" } }),
    prisma.invoice.findMany({ where: { status: { not: "CANCELLED" } }, include: { payments: true } }),
  ]);

  // CA par client (grouped from invoices by client name)
  const byClient = new Map<string, { name: string; company: string | null; count: number; billed: number; collected: number }>();
  for (const inv of invoices) {
    const { total } = computeTotals(parseItems(inv.items), inv.taxRate, inv.discount);
    const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
    const g = byClient.get(inv.clientName) ?? { name: inv.clientName, company: inv.clientCompany, count: 0, billed: 0, collected: 0 };
    g.count += 1;
    g.billed += total;
    g.collected += paid;
    byClient.set(inv.clientName, g);
  }
  const ranking = [...byClient.values()].sort((a, b) => b.billed - a.billed).slice(0, 10);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-primary">Clients</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Carnet d'adresses réutilisable pour vos devis et factures. {clients.length} client{clients.length > 1 ? "s" : ""}.
        </p>
      </div>

      {ranking.length > 0 && (
        <div className="card overflow-hidden">
          <div className="flex items-center gap-2 p-5 border-b border-outline-variant">
            <span className="material-symbols-outlined text-secondary">leaderboard</span>
            <h2 className="font-headline-md text-headline-md text-primary">CA par client</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low">
                  <th className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant p-3">Client</th>
                  <th className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant p-3 text-right">Factures</th>
                  <th className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant p-3 text-right">Facturé</th>
                  <th className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant p-3 text-right">Encaissé</th>
                  <th className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant p-3 text-right">Reste</th>
                </tr>
              </thead>
              <tbody>
                {ranking.map((r) => (
                  <tr key={r.name} className="border-b border-outline-variant">
                    <td className="p-3">
                      <div className="font-label-md text-label-md text-primary">{r.name}</div>
                      {r.company && <div className="font-body-sm text-body-sm text-on-surface-variant">{r.company}</div>}
                    </td>
                    <td className="p-3 text-right font-body-md text-body-md">{r.count}</td>
                    <td className="p-3 text-right font-body-md text-body-md">{formatFCFA(r.billed)}</td>
                    <td className="p-3 text-right font-body-md text-body-md text-secondary">{formatFCFA(r.collected)}</td>
                    <td className="p-3 text-right font-body-md text-body-md text-error">{formatFCFA(Math.max(0, r.billed - r.collected))}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <ClientsManager clients={clients} createAction={createClient} updateAction={updateClient} deleteAction={deleteClient} />
    </div>
  );
}
