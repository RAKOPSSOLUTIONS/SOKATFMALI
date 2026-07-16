import { prisma } from "@/lib/prisma";
import { ROLES, ROLE_LABEL } from "@/lib/auth";
import { createUser, updateUser, deleteUser } from "../../actions";
import { UsersManager } from "../../_components/UsersManager";

export const dynamic = "force-dynamic";

export default async function UtilisateursPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: "asc" } });
  const roles = ROLES.map((r) => ({ value: r, label: ROLE_LABEL[r] ?? r }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-primary">Utilisateurs</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Comptes du back-office et leurs rôles. Le compte administrateur défini par variable d'environnement reste toujours valide.
        </p>
      </div>

      <UsersManager
        users={users.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, active: u.active }))}
        roles={roles}
        createAction={createUser}
        updateAction={updateUser}
        deleteAction={deleteUser}
      />
    </div>
  );
}
