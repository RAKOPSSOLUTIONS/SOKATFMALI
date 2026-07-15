import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { LEAD_STATUS_LABEL } from "@/lib/constants";

export const dynamic = "force-dynamic";

export default async function DashboardHome() {
  const [leadsTotal, newLeads, quotesCount, invoicesCount, sectors, projects, recent] =
    await Promise.all([
      prisma.lead.count(),
      prisma.lead.count({ where: { status: "NEW" } }),
      prisma.quote.count(),
      prisma.invoice.count(),
      prisma.sector.count(),
      prisma.project.count(),
      prisma.lead.findMany({
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

  const stats = [
    { label: "Prospects", value: leadsTotal, icon: "inbox", href: "/admin/leads" },
    { label: "Nouveaux", value: newLeads, icon: "fiber_new", href: "/admin/leads" },
    { label: "Devis", value: quotesCount, icon: "request_quote", href: "/admin/devis" },
    { label: "Factures", value: invoicesCount, icon: "receipt_long", href: "/admin/factures" },
    { label: "Finances", value: "→", icon: "account_balance_wallet", href: "/admin/finances" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-primary">
          Tableau de bord
        </h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Vue d&apos;ensemble de l&apos;activité du portail.
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="card p-5 hover:border-primary transition-colors">
            <span className="material-symbols-outlined text-on-surface-variant mb-3">
              {s.icon}
            </span>
            <div className="font-headline-lg text-headline-lg text-primary">
              {s.value}
            </div>
            <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">
              {s.label}
            </div>
          </Link>
        ))}
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between p-5 border-b border-outline-variant">
          <h2 className="font-headline-md text-headline-md text-primary">
            Derniers prospects
          </h2>
          <Link href="/admin/leads" className="font-label-md text-label-md text-secondary hover:underline">
            Tout voir
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="p-5 font-body-md text-body-md text-on-surface-variant">
            Aucun prospect pour le moment.
          </p>
        ) : (
          <ul className="divide-y divide-outline-variant">
            {recent.map((l) => (
              <li key={l.id} className="flex items-center gap-4 p-5">
                <span className="badge bg-surface-container-high text-on-surface">
                  {l.type}
                </span>
                <div className="min-w-0">
                  <div className="font-label-md text-label-md text-primary truncate">
                    {l.name}
                  </div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant truncate">
                    {l.email}
                  </div>
                </div>
                <span className="badge bg-surface-container-low text-on-surface-variant ml-auto shrink-0">
                  {LEAD_STATUS_LABEL[l.status as keyof typeof LEAD_STATUS_LABEL] ?? l.status}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
