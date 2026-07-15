import { prisma } from "@/lib/prisma";
import { parseItems, computeTotals, formatFCFA } from "@/lib/finance";
import { createClient, updateClient, deleteClient } from "../../actions";

export const dynamic = "force-dynamic";

type ClientRow = Awaited<ReturnType<typeof prisma.client.findMany>>[number];

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

      <details className="card p-5">
        <summary className="flex items-center gap-2 cursor-pointer font-label-md text-label-md text-primary list-none">
          <span className="material-symbols-outlined text-secondary">person_add</span> Ajouter un client
        </summary>
        <div className="mt-5">
          <ClientForm action={createClient} submitLabel="Ajouter" />
        </div>
      </details>

      <div className="space-y-3">
        {clients.map((c) => (
          <details key={c.id} className="card p-5">
            <summary className="flex items-center gap-4 cursor-pointer list-none">
              <span className="material-symbols-outlined text-primary">person</span>
              <div className="min-w-0">
                <div className="font-label-md text-label-md text-primary truncate">{c.name}{c.company ? ` — ${c.company}` : ""}</div>
                <div className="font-body-sm text-body-sm text-on-surface-variant truncate">{[c.phone, c.email].filter(Boolean).join(" · ") || "—"}</div>
              </div>
            </summary>
            <div className="mt-5 pt-5 border-t border-outline-variant">
              <ClientForm action={updateClient} submitLabel="Enregistrer" client={c} />
              <form action={deleteClient} className="mt-4">
                <input type="hidden" name="id" value={c.id} />
                <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-label-md text-label-md text-error hover:bg-error-container transition-colors">
                  <span className="material-symbols-outlined text-[18px]">delete</span> Supprimer
                </button>
              </form>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

function ClientForm({ action, submitLabel, client }: { action: (fd: FormData) => void; submitLabel: string; client?: ClientRow }) {
  return (
    <form action={action} className="grid md:grid-cols-2 gap-4">
      {client && <input type="hidden" name="id" value={client.id} />}
      <div>
        <label className="label">Nom *</label>
        <input name="name" required defaultValue={client?.name} className="input" />
      </div>
      <div>
        <label className="label">Société</label>
        <input name="company" defaultValue={client?.company ?? ""} className="input" />
      </div>
      <div>
        <label className="label">Email</label>
        <input name="email" type="email" defaultValue={client?.email ?? ""} className="input" />
      </div>
      <div>
        <label className="label">Téléphone</label>
        <input name="phone" defaultValue={client?.phone ?? ""} className="input" />
      </div>
      <div className="md:col-span-2">
        <label className="label">Adresse</label>
        <input name="address" defaultValue={client?.address ?? ""} className="input" />
      </div>
      <div className="md:col-span-2">
        <button className="btn-primary">{submitLabel}</button>
      </div>
    </form>
  );
}
