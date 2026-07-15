import { prisma } from "@/lib/prisma";
import { createClient, updateClient, deleteClient } from "../../actions";

export const dynamic = "force-dynamic";

type ClientRow = Awaited<ReturnType<typeof prisma.client.findMany>>[number];

export default async function ClientsPage() {
  const clients = await prisma.client.findMany({ orderBy: { name: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-primary">Clients</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Carnet d'adresses réutilisable pour vos devis et factures. {clients.length} client{clients.length > 1 ? "s" : ""}.
        </p>
      </div>

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
