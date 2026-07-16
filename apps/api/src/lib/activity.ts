import { prisma } from "./prisma";
import { getSession } from "./session";

export type ActivityAction = "CREATE" | "UPDATE" | "DELETE" | "LOGIN" | "LOGOUT" | "STATUS" | "PAYMENT" | "EMAIL";

/**
 * Record an audit-trail entry for a back-office action. Best-effort: never
 * throws (a logging failure must not break the underlying action). The actor
 * is read from the current session.
 */
export async function logActivity(entry: {
  action: ActivityAction;
  entity: string;
  entityId?: string | null;
  detail?: string;
  actorEmail?: string;
  actorName?: string;
}): Promise<void> {
  try {
    let email = entry.actorEmail;
    let name = entry.actorName;
    if (!email) {
      const session = await getSession();
      email = session?.email ?? undefined;
      name = session?.name ?? undefined;
    }
    await prisma.activityLog.create({
      data: {
        action: entry.action,
        entity: entry.entity,
        entityId: entry.entityId ?? null,
        detail: entry.detail ?? null,
        userEmail: email ?? null,
        userName: name ?? null,
      },
    });
  } catch (err) {
    console.error("[activity] log failed:", err);
  }
}

export const ACTION_LABEL: Record<string, string> = {
  CREATE: "Création", UPDATE: "Modification", DELETE: "Suppression",
  LOGIN: "Connexion", LOGOUT: "Déconnexion", STATUS: "Statut", PAYMENT: "Paiement", EMAIL: "Email",
};

export const ENTITY_LABEL: Record<string, string> = {
  Quote: "Devis", Invoice: "Facture", Client: "Client", User: "Utilisateur", Lead: "Prospect",
  Sector: "Secteur", Project: "Réalisation", CatalogItem: "Catalogue", Auth: "Authentification", Settings: "Paramètres",
};
