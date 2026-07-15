import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/session";
import { ROLE_LABEL } from "@/lib/auth";
import { LEAD_STATUS_LABEL } from "@/lib/constants";
import { parseItems, computeTotals, formatFCFA, formatDate } from "@/lib/finance";

export const dynamic = "force-dynamic";

export default async function DashboardHome() {
  const session = await getSession();
  const role = session?.role ?? "commercial";
  const isFinance = role === "admin" || role === "comptable";
  const isCommercial = role === "admin" || role === "commercial";

  const [leadsTotal, newLeads, quotesCount, invoicesCount, clientsCount, invoices, recentLeads, recentPayments] =
    await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { status: "NEW" } }),
      prisma.quote.count(),
      prisma.invoice.count(),
      prisma.client.count(),
      isFinance ? prisma.invoice.findMany({ include: { payments: true } }) : Promise.resolve([]),
      isCommercial ? prisma.lead.findMany({ orderBy: { createdAt: "desc" }, take: 5 }) : Promise.resolve([]),
      isFinance
        ? prisma.payment.findMany({ orderBy: { date: "desc" }, take: 5, include: { invoice: { select: { number: true, id: true, clientName: true } } } })
        : Promise.resolve([]),
    ]);

  let billed = 0,
    collected = 0,
    outstanding = 0;
  for (const inv of invoices as any[]) {
    if (inv.status === "CANCELLED") continue;
    const { total } = computeTotals(parseItems(inv.items), inv.taxRate, inv.discount);
    const paid = inv.payments.reduce((s: number, p: any) => s + p.amount, 0);
    collected += paid;
    if (inv.status !== "DRAFT") {
      billed += total;
      outstanding += Math.max(0, total - paid);
    }
  }

  type Stat = { label: string; value: string | number; icon: string; href: string; tone?: string };
  const stats: Stat[] = [];
  if (isCommercial) {
    stats.push({ label: "Prospects", value: leadsTotal, icon: "inbox", href: "/admin/leads" });
    stats.push({ label: "Nouveaux", value: newLeads, icon: "fiber_new", href: "/admin/leads" });
    stats.push({ label: "Clients", value: clientsCount, icon: "contacts", href: "/admin/clients" });
    stats.push({ label: "Devis", value: quotesCount, icon: "request_quote", href: "/admin/devis" });
  }
  if (isFinance) {
    stats.push({ label: "Factures", value: invoicesCount, icon: "receipt_long", href: "/admin/factures" });
    stats.push({ label: "CA facturé", value: formatFCFA(billed), icon: "payments", href: "/admin/finances", tone: "text-primary" });
    stats.push({ label: "Encaissé", value: formatFCFA(collected), icon: "savings", href: "/admin/finances", tone: "text-secondary" });
    stats.push({ label: "Impayés", value: formatFCFA(outstanding), icon: "pending_actions", href: "/admin/finances", tone: "text-error" });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-primary">Bonjour {session?.name || ""}</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Espace <span className="text-secondary">{ROLE_LABEL[role] ?? role}</span> — {new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" })}.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card p-5 hover:border-primary transition-colors">
            <span className={`material-symbols-outlined mb-3 ${s.tone ?? "text-on-surface-variant"}`}>{s.icon}</span>
            <div className={`font-headline-md text-headline-md ${s.tone ?? "text-primary"}`}>{s.value}</div>
            <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mt-1">{s.label}</div>
          </Link>
        ))}
      </div>

      {/* Quick actions by role */}
      <div className="flex flex-wrap gap-3">
        {isCommercial && <Link href="/admin/devis/new" className="btn-primary"><span className="material-symbols-outlined text-[18px]">add</span> Nouveau devis</Link>}
        {isFinance && <Link href="/admin/factures/new" className="btn-outline"><span className="material-symbols-outlined text-[18px]">add</span> Nouvelle facture</Link>}
        {isFinance && <Link href="/admin/finances" className="btn-outline"><span className="material-symbols-outlined text-[18px]">account_balance_wallet</span> Finances</Link>}
      </div>

      {/* Commercial: recent prospects */}
      {isCommercial && (
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-outline-variant">
            <h2 className="font-headline-md text-headline-md text-primary">Derniers prospects</h2>
            <Link href="/admin/leads" className="font-label-md text-label-md text-secondary hover:underline">Tout voir</Link>
          </div>
          {(recentLeads as any[]).length === 0 ? (
            <p className="p-5 font-body-md text-body-md text-on-surface-variant">Aucun prospect.</p>
          ) : (
            <ul className="divide-y divide-outline-variant">
              {(recentLeads as any[]).map((l) => (
                <li key={l.id} className="flex items-center gap-4 p-5">
                  <span className="badge bg-surface-container-high text-on-surface">{l.type}</span>
                  <div className="min-w-0">
                    <div className="font-label-md text-label-md text-primary truncate">{l.name}</div>
                    <div className="font-body-sm text-body-sm text-on-surface-variant truncate">{l.email}</div>
                  </div>
                  <span className="badge bg-surface-container-low text-on-surface-variant ml-auto shrink-0">
                    {LEAD_STATUS_LABEL[l.status as keyof typeof LEAD_STATUS_LABEL] ?? l.status}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {/* Finance: recent payments */}
      {isFinance && (
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between p-5 border-b border-outline-variant">
            <h2 className="font-headline-md text-headline-md text-primary">Derniers encaissements</h2>
            <Link href="/admin/finances" className="font-label-md text-label-md text-secondary hover:underline">Finances</Link>
          </div>
          {(recentPayments as any[]).length === 0 ? (
            <p className="p-5 font-body-md text-body-md text-on-surface-variant">Aucun paiement enregistré.</p>
          ) : (
            <ul className="divide-y divide-outline-variant">
              {(recentPayments as any[]).map((p) => (
                <li key={p.id} className="flex items-center gap-4 p-5">
                  <span className="material-symbols-outlined text-secondary">payments</span>
                  <Link href={`/admin/factures/${p.invoice.id}`} className="font-label-md text-label-md text-primary hover:underline">{p.invoice.number}</Link>
                  <span className="font-body-sm text-body-sm text-on-surface-variant truncate">{p.invoice.clientName}</span>
                  <div className="ml-auto text-right">
                    <div className="font-label-md text-label-md text-secondary">{formatFCFA(p.amount)}</div>
                    <div className="font-body-sm text-body-sm text-on-surface-variant">{formatDate(p.date)}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
