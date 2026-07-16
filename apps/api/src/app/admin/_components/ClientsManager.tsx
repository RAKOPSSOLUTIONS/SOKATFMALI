"use client";

import { useMemo, useState } from "react";
import { Modal, ConfirmSubmit, ExportButton } from "./ui";

export type ClientRow = {
  id: string;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  address: string | null;
};

type Action = (fd: FormData) => void | Promise<void>;

export function ClientsManager({
  clients,
  createAction,
  updateAction,
  deleteAction,
}: {
  clients: ClientRow[];
  createAction: Action;
  updateAction: Action;
  deleteAction: Action;
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return clients;
    return clients.filter((c) => [c.name, c.company, c.email, c.phone].filter(Boolean).some((v) => v!.toLowerCase().includes(q)));
  }, [clients, query]);

  const exportRows = filtered.map((c) => [c.name, c.company ?? "", c.email ?? "", c.phone ?? "", c.address ?? ""]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-headline-md text-headline-md text-primary">Carnet d'adresses</h2>
        <Modal title="Ajouter un client" triggerLabel="Ajouter un client" triggerIcon="person_add" size="md">
          {(close) => <ClientForm action={createAction} submitLabel="Ajouter" onDone={close} />}
        </Modal>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un client…" className="input pl-11" />
        </div>
        <ExportButton filename="clients-sokatf" headers={["Nom", "Société", "Email", "Téléphone", "Adresse"]} rows={exportRows} />
      </div>

      {filtered.length === 0 ? (
        <div className="card p-10 text-center text-on-surface-variant">
          <span className="material-symbols-outlined text-[40px]">contacts</span>
          <p className="font-body-md text-body-md mt-2">{query ? "Aucun résultat." : "Aucun client."}</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low">
                  <th className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant p-3">Client</th>
                  <th className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant p-3 hidden md:table-cell">Contact</th>
                  <th className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-b border-outline-variant last:border-0">
                    <td className="p-3">
                      <div className="font-label-md text-label-md text-primary">{c.name}</div>
                      {c.company && <div className="font-body-sm text-body-sm text-on-surface-variant">{c.company}</div>}
                    </td>
                    <td className="p-3 hidden md:table-cell font-body-sm text-body-sm text-on-surface-variant">
                      {[c.phone, c.email].filter(Boolean).join(" · ") || "—"}
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1">
                        <Modal
                          title={`Modifier — ${c.name}`}
                          triggerLabel="Modifier"
                          triggerIcon="edit"
                          triggerClass="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-label-md text-label-md text-primary hover:bg-surface-container-high transition-colors"
                        >
                          {(close) => <ClientForm action={updateAction} submitLabel="Enregistrer" client={c} onDone={close} />}
                        </Modal>
                        <form action={deleteAction}>
                          <input type="hidden" name="id" value={c.id} />
                          <ConfirmSubmit label="" icon="delete" message={`Supprimer « ${c.name} » du carnet ?`} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-label-md text-label-md text-error hover:bg-error-container transition-colors" />
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function ClientForm({ action, submitLabel, client, onDone }: { action: Action; submitLabel: string; client?: ClientRow; onDone: () => void }) {
  return (
    <form action={async (fd) => { await action(fd); onDone(); }} className="grid md:grid-cols-2 gap-4">
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
      <div className="md:col-span-2 flex justify-end gap-3 pt-2">
        <button type="button" onClick={onDone} className="btn-outline">Annuler</button>
        <button className="btn-primary">{submitLabel}</button>
      </div>
    </form>
  );
}
