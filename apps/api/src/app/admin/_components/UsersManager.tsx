"use client";

import { useMemo, useState } from "react";
import { Modal, ConfirmSubmit, ExportButton } from "./ui";
import { toast } from "./toast";

export type UserRow = { id: string; name: string; email: string; role: string; active: boolean };
type Role = { value: string; label: string };
type Action = (fd: FormData) => void | Promise<void>;

export function UsersManager({
  users,
  roles,
  createAction,
  updateAction,
  deleteAction,
}: {
  users: UserRow[];
  roles: Role[];
  createAction: Action;
  updateAction: Action;
  deleteAction: Action;
}) {
  const [query, setQuery] = useState("");
  const roleLabel = (r: string) => roles.find((x) => x.value === r)?.label ?? r;
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return users;
    return users.filter((u) => [u.name, u.email, roleLabel(u.role)].some((v) => v.toLowerCase().includes(q)));
  }, [users, query]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-headline-md text-headline-md text-primary">Comptes</h2>
        <Modal title="Ajouter un utilisateur" triggerLabel="Ajouter un utilisateur" triggerIcon="person_add">
          {(close) => <UserForm roles={roles} action={createAction} submitLabel="Créer le compte" onDone={close} />}
        </Modal>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un utilisateur…" className="input pl-11" />
        </div>
        <ExportButton filename="utilisateurs-sokatf" sheet="Utilisateurs" headers={["Nom", "Email", "Rôle", "Statut"]} rows={filtered.map((u) => [u.name, u.email, roleLabel(u.role), u.active ? "Actif" : "Désactivé"])} />
      </div>

      {filtered.length === 0 ? (
        <div className="card p-10 text-center text-on-surface-variant"><span className="material-symbols-outlined text-[40px]">group</span><p className="font-body-md text-body-md mt-2">Aucun utilisateur.</p></div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low">
                  <th className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant p-3">Utilisateur</th>
                  <th className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant p-3 text-center hidden sm:table-cell">Rôle</th>
                  <th className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((u) => (
                  <tr key={u.id} className="border-b border-outline-variant last:border-0">
                    <td className="p-3">
                      <div className="font-label-md text-label-md text-primary">{u.name}{!u.active && <span className="badge bg-surface-container-high text-on-surface-variant ml-2">Désactivé</span>}</div>
                      <div className="font-body-sm text-body-sm text-on-surface-variant">{u.email}</div>
                    </td>
                    <td className="p-3 text-center hidden sm:table-cell"><span className="badge bg-secondary-container text-on-secondary-container">{roleLabel(u.role)}</span></td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1">
                        <Modal title={`Modifier — ${u.name}`} triggerLabel="Modifier" triggerIcon="edit" triggerClass="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-label-md text-label-md text-primary hover:bg-surface-container-high transition-colors">
                          {(close) => <UserForm roles={roles} action={updateAction} submitLabel="Enregistrer" user={u} onDone={close} />}
                        </Modal>
                        <form action={deleteAction}>
                          <input type="hidden" name="id" value={u.id} />
                          <ConfirmSubmit label="" icon="delete" message={`Supprimer le compte de ${u.name} ?`} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-label-md text-label-md text-error hover:bg-error-container transition-colors" />
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

function UserForm({ roles, action, submitLabel, user, onDone }: { roles: Role[]; action: Action; submitLabel: string; user?: UserRow; onDone: () => void }) {
  return (
    <form action={async (fd) => { await action(fd); toast(user ? "Utilisateur mis à jour" : "Compte créé", "success"); onDone(); }} className="grid md:grid-cols-2 gap-4">
      {user && <input type="hidden" name="id" value={user.id} />}
      <div>
        <label className="label">Nom *</label>
        <input name="name" required defaultValue={user?.name} className="input" />
      </div>
      {!user && (
        <div>
          <label className="label">Email *</label>
          <input name="email" type="email" required className="input" />
        </div>
      )}
      <div>
        <label className="label">Rôle</label>
        <select name="role" defaultValue={user?.role ?? "commercial"} className="input">
          {roles.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
        </select>
      </div>
      <div>
        <label className="label">{user ? "Nouveau mot de passe (vide = garder)" : "Mot de passe * (min. 4)"}</label>
        <input name="password" type="text" required={!user} className="input" />
      </div>
      {user && (
        <label className="md:col-span-2 flex items-center gap-2 cursor-pointer">
          <input type="checkbox" name="active" defaultChecked={user.active} className="h-4 w-4 accent-primary" /> <span className="font-body-md text-body-md text-on-surface">Compte actif</span>
        </label>
      )}
      <div className="md:col-span-2 flex justify-end gap-3 pt-2">
        <button type="button" onClick={onDone} className="btn-outline">Annuler</button>
        <button className="btn-primary">{submitLabel}</button>
      </div>
    </form>
  );
}
