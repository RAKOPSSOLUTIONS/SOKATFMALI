"use client";

import { useEffect, useMemo, useState } from "react";
import { ExportButton } from "./ui";
import { Pagination } from "./DocumentsList";

export type LogRow = {
  id: string; action: string; entity: string; detail: string | null;
  userName: string | null; userEmail: string | null; when: string;
};

const ACTION_ICON: Record<string, string> = {
  CREATE: "add_circle", UPDATE: "edit", DELETE: "delete", LOGIN: "login",
  LOGOUT: "logout", STATUS: "flag", PAYMENT: "payments", EMAIL: "mail",
};
const ACTION_TONE: Record<string, string> = {
  CREATE: "text-secondary", UPDATE: "text-primary", DELETE: "text-error",
  LOGIN: "text-secondary", LOGOUT: "text-on-surface-variant", STATUS: "text-primary", PAYMENT: "text-secondary", EMAIL: "text-primary",
};
const PAGE_SIZE = 25;

export function ActivityList({
  logs, actionLabels, entityLabels,
}: {
  logs: LogRow[]; actionLabels: Record<string, string>; entityLabels: Record<string, string>;
}) {
  const [query, setQuery] = useState("");
  const [action, setAction] = useState("");
  const [entity, setEntity] = useState("");
  const [page, setPage] = useState(1);

  const actions = useMemo(() => [...new Set(logs.map((l) => l.action))], [logs]);
  const entities = useMemo(() => [...new Set(logs.map((l) => l.entity))], [logs]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return logs.filter((l) => {
      if (action && l.action !== action) return false;
      if (entity && l.entity !== entity) return false;
      if (!q) return true;
      return [l.detail, l.userName, l.userEmail].filter(Boolean).some((v) => v!.toLowerCase().includes(q));
    });
  }, [logs, query, action, entity]);

  useEffect(() => setPage(1), [query, action, entity]);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher (détail, utilisateur)…" className="input pl-11" />
        </div>
        <select value={action} onChange={(e) => setAction(e.target.value)} className="input w-auto min-w-[140px]">
          <option value="">Toutes actions</option>
          {actions.map((a) => <option key={a} value={a}>{actionLabels[a] ?? a}</option>)}
        </select>
        <select value={entity} onChange={(e) => setEntity(e.target.value)} className="input w-auto min-w-[140px]">
          <option value="">Tous types</option>
          {entities.map((e2) => <option key={e2} value={e2}>{entityLabels[e2] ?? e2}</option>)}
        </select>
        <ExportButton
          filename="journal-activite-sokatf"
          sheet="Activité"
          headers={["Date", "Action", "Type", "Détail", "Utilisateur"]}
          rows={filtered.map((l) => [l.when, actionLabels[l.action] ?? l.action, entityLabels[l.entity] ?? l.entity, l.detail ?? "", l.userName || l.userEmail || "—"])}
        />
      </div>

      {filtered.length === 0 ? (
        <div className="card p-10 text-center text-on-surface-variant"><span className="material-symbols-outlined text-[40px]">history</span><p className="font-body-md text-body-md mt-2">{logs.length ? "Aucun résultat." : "Aucune activité enregistrée."}</p></div>
      ) : (
        <>
          <div className="card divide-y divide-outline-variant overflow-hidden">
            {pageRows.map((l) => (
              <div key={l.id} className="flex items-start gap-4 p-4">
                <span className={`material-symbols-outlined ${ACTION_TONE[l.action] ?? "text-on-surface-variant"} mt-0.5`}>{ACTION_ICON[l.action] ?? "bolt"}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="badge bg-surface-container-high text-on-surface-variant">{entityLabels[l.entity] ?? l.entity}</span>
                    <span className="font-label-md text-label-md text-primary">{l.detail || (actionLabels[l.action] ?? l.action)}</span>
                  </div>
                  <div className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                    {l.userName || l.userEmail || "Système"}{(l.userName && l.userEmail) ? ` · ${l.userEmail}` : ""}
                  </div>
                </div>
                <span className="font-body-sm text-body-sm text-on-surface-variant whitespace-nowrap shrink-0">{l.when}</span>
              </div>
            ))}
          </div>
          <Pagination page={safePage} totalPages={totalPages} total={filtered.length} onPage={setPage} />
        </>
      )}
    </div>
  );
}
