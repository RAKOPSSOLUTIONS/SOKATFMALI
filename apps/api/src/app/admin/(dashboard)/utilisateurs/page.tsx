import { FormToast } from "../../_components/toast";
import { ConfirmSubmit } from "../../_components/ui";
import { prisma } from "@/lib/prisma";
import { ROLES, ROLE_LABEL } from "@/lib/auth";
import { createUser, updateUser, deleteUser } from "../../actions";

export const dynamic = "force-dynamic";

export default async function UtilisateursPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-primary">Utilisateurs</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Comptes du back-office et leurs rôles. Le compte administrateur défini par variable d'environnement reste toujours valide.
        </p>
      </div>

      <details className="card p-5">
        <summary className="flex items-center gap-2 cursor-pointer font-label-md text-label-md text-primary list-none">
          <span className="material-symbols-outlined text-secondary">person_add</span> Ajouter un utilisateur
        </summary>
        <form action={createUser} className="grid md:grid-cols-2 gap-4 mt-5">
          <FormToast message="Compte créé" />
          <div>
            <label className="label">Nom *</label>
            <input name="name" required className="input" />
          </div>
          <div>
            <label className="label">Email *</label>
            <input name="email" type="email" required className="input" />
          </div>
          <div>
            <label className="label">Mot de passe * (min. 4)</label>
            <input name="password" type="text" required className="input" />
          </div>
          <div>
            <label className="label">Rôle</label>
            <select name="role" defaultValue="commercial" className="input">
              {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
            </select>
          </div>
          <div className="md:col-span-2"><button className="btn-primary">Créer le compte</button></div>
        </form>
      </details>

      <div className="space-y-3">
        {users.map((u) => (
          <details key={u.id} className="card p-5">
            <summary className="flex items-center gap-4 cursor-pointer list-none">
              <span className="material-symbols-outlined text-primary">account_circle</span>
              <div className="min-w-0">
                <div className="font-label-md text-label-md text-primary truncate">
                  {u.name}
                  {!u.active && <span className="badge bg-surface-container-high text-on-surface-variant ml-2">Désactivé</span>}
                </div>
                <div className="font-body-sm text-body-sm text-on-surface-variant truncate">{u.email}</div>
              </div>
              <span className="badge bg-secondary-container text-on-secondary-container ml-auto">{ROLE_LABEL[u.role] ?? u.role}</span>
            </summary>
            <div className="mt-5 pt-5 border-t border-outline-variant">
              <form action={updateUser} className="grid md:grid-cols-2 gap-4">
                <FormToast message="Utilisateur mis à jour" />
                <input type="hidden" name="id" value={u.id} />
                <div>
                  <label className="label">Nom</label>
                  <input name="name" defaultValue={u.name} className="input" />
                </div>
                <div>
                  <label className="label">Rôle</label>
                  <select name="role" defaultValue={u.role} className="input">
                    {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
                  </select>
                </div>
                <div>
                  <label className="label">Nouveau mot de passe (laisser vide pour garder)</label>
                  <input name="password" type="text" className="input" />
                </div>
                <div className="flex items-end gap-2">
                  <label className="flex items-center gap-2 font-body-md text-body-md">
                    <input type="checkbox" name="active" defaultChecked={u.active} /> Actif
                  </label>
                </div>
                <div className="md:col-span-2"><button className="btn-primary">Enregistrer</button></div>
              </form>
              <form action={deleteUser} className="mt-4">
                <input type="hidden" name="id" value={u.id} />
                <ConfirmSubmit message={`Supprimer le compte de ${u.name} ?`} />
              </form>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}
