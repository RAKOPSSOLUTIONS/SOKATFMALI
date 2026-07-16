import { prisma } from "@/lib/prisma";
import { ACTION_LABEL, ENTITY_LABEL } from "@/lib/activity";
import { ActivityList, type LogRow } from "../../_components/ActivityList";

export const dynamic = "force-dynamic";

export default async function ActivitePage() {
  const logs = await prisma.activityLog.findMany({ orderBy: { createdAt: "desc" }, take: 500 });
  const rows: LogRow[] = logs.map((l) => ({
    id: l.id,
    action: l.action,
    entity: l.entity,
    detail: l.detail,
    userName: l.userName,
    userEmail: l.userEmail,
    when: new Date(l.createdAt).toLocaleString("fr-FR", { day: "2-digit", month: "short", year: "2-digit", hour: "2-digit", minute: "2-digit" }),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-primary">Journal d'activité</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Historique des actions du back-office (500 dernières). {logs.length} entrée{logs.length > 1 ? "s" : ""}.
        </p>
      </div>
      <ActivityList logs={rows} actionLabels={ACTION_LABEL} entityLabels={ENTITY_LABEL} />
    </div>
  );
}
