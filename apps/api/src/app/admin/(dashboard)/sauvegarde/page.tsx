import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export default async function SauvegardePage() {
  const [leads, clients, quotes, invoices, catalog] = await Promise.all([
    prisma.lead.count(), prisma.client.count(), prisma.quote.count(), prisma.invoice.count(), prisma.catalogItem.count(),
  ]);
  const counts = [
    { label: "Prospects", value: leads }, { label: "Clients", value: clients },
    { label: "Devis", value: quotes }, { label: "Factures", value: invoices }, { label: "Catalogue", value: catalog },
  ];

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-primary">Sauvegarde</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">Téléchargez une copie complète de la base de données.</p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {counts.map((c) => (
          <div key={c.label} className="card p-4 text-center">
            <div className="font-headline-md text-headline-md text-primary">{c.value}</div>
            <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider">{c.label}</div>
          </div>
        ))}
      </div>

      <div className="grid sm:grid-cols-2 gap-4">
        <div className="card p-6">
          <span className="material-symbols-outlined text-primary text-[32px]">database</span>
          <h2 className="font-headline-md text-headline-md text-primary mt-2">Fichier base (.db)</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">Copie exacte du fichier SQLite — restaurable directement en remplaçant le fichier de production.</p>
          <a href="/admin/backup?format=sqlite" className="btn-primary w-full">
            <span className="material-symbols-outlined text-[18px]">download</span> Télécharger .db
          </a>
        </div>
        <div className="card p-6">
          <span className="material-symbols-outlined text-secondary text-[32px]">data_object</span>
          <h2 className="font-headline-md text-headline-md text-primary mt-2">Export JSON</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-4">Toutes les tables en JSON lisible — pratique pour l'archivage ou une migration.</p>
          <a href="/admin/backup?format=json" className="btn-outline w-full">
            <span className="material-symbols-outlined text-[18px]">download</span> Télécharger .json
          </a>
        </div>
      </div>

      <div className="card p-5 bg-surface-container-low">
        <div className="flex items-start gap-3">
          <span className="material-symbols-outlined text-secondary">lightbulb</span>
          <div className="font-body-sm text-body-sm text-on-surface-variant">
            <p className="font-label-md text-label-md text-primary mb-1">Sauvegarde automatique (serveur)</p>
            <p>Pour une sauvegarde quotidienne automatique sur le VPS, programmez un cron :</p>
            <pre className="mt-2 p-3 rounded-lg bg-surface-container-high overflow-x-auto text-[12px]">0 2 * * *  cp /var/www/apis/sokatf/apps/api/prisma/prod.db /var/backups/sokatf-$(date +\%F).db</pre>
          </div>
        </div>
      </div>
    </div>
  );
}
