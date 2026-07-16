"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ConfirmSubmit, ExportButton, PdfModal } from "./ui";

export type DocRow = {
  id: string;
  number: string;
  clientName: string;
  clientCompany: string | null;
  dateLabel: string;
  status: string;
  total: number;
  paid: number;
  balance: number;
};

type Action = (fd: FormData) => void | Promise<void>;

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Brouillon", SENT: "Envoyé", ACCEPTED: "Accepté", REJECTED: "Refusé",
  PARTIAL: "Partiel", PAID: "Payé", OVERDUE: "En retard", CANCELLED: "Annulé",
};
const STATUS_STYLE: Record<string, string> = {
  DRAFT: "bg-surface-container-high text-on-surface-variant",
  SENT: "bg-tertiary-fixed text-on-tertiary-fixed",
  ACCEPTED: "bg-secondary-container text-on-secondary-container",
  REJECTED: "bg-error-container text-on-error-container",
  PARTIAL: "bg-tertiary-fixed text-on-tertiary-fixed",
  PAID: "bg-secondary-container text-on-secondary-container",
  OVERDUE: "bg-error-container text-on-error-container",
  CANCELLED: "bg-surface-container-high text-on-surface-variant",
};
const fmt = (n: number) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Math.round(n || 0)) + " FCFA";

export function DocumentsList({
  kind,
  rows,
  statuses,
  deleteAction,
}: {
  kind: "devis" | "facture";
  rows: DocRow[];
  statuses: string[];
  deleteAction: Action;
}) {
  const base = kind === "devis" ? "/admin/devis" : "/admin/factures";
  const isFacture = kind === "facture";
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (status && r.status !== status) return false;
      if (!q) return true;
      return [r.number, r.clientName, r.clientCompany].filter(Boolean).some((v) => v!.toLowerCase().includes(q));
    });
  }, [rows, query, status]);

  const exportRows = filtered.map((r) =>
    isFacture
      ? [r.number, r.clientName, r.dateLabel, STATUS_LABEL[r.status] ?? r.status, r.total, r.paid, r.balance]
      : [r.number, r.clientName, r.dateLabel, STATUS_LABEL[r.status] ?? r.status, r.total],
  );
  const exportHeaders = isFacture
    ? ["Numéro", "Client", "Date", "Statut", "Total TTC", "Payé", "Reste"]
    : ["Numéro", "Client", "Date", "Statut", "Total TTC"];

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[180px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher (n°, client)…" className="input pl-11" />
        </div>
        <select value={status} onChange={(e) => setStatus(e.target.value)} className="input w-auto min-w-[150px]">
          <option value="">Tous les statuts</option>
          {statuses.map((s) => <option key={s} value={s}>{STATUS_LABEL[s] ?? s}</option>)}
        </select>
        <ExportButton filename={`${kind}-sokatf`} headers={exportHeaders} rows={exportRows} />
      </div>

      {filtered.length === 0 ? (
        <div className="card p-10 text-center text-on-surface-variant">
          <span className="material-symbols-outlined text-[40px]">{isFacture ? "receipt_long" : "request_quote"}</span>
          <p className="font-body-md text-body-md mt-2">{rows.length ? "Aucun résultat." : `Aucun ${kind}.`}</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low">
                  <th className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant p-3">Numéro</th>
                  <th className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant p-3">Client</th>
                  <th className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant p-3 text-right whitespace-nowrap">Total{isFacture ? " / Reste" : ""}</th>
                  <th className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant p-3 text-center hidden sm:table-cell">Statut</th>
                  <th className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((r) => (
                  <tr key={r.id} className="border-b border-outline-variant last:border-0 hover:bg-surface-container-low/50">
                    <td className="p-3">
                      <Link href={`${base}/${r.id}`} className="font-label-md text-label-md text-secondary hover:underline whitespace-nowrap">{r.number}</Link>
                      <div className="font-body-sm text-body-sm text-on-surface-variant sm:hidden">{r.dateLabel}</div>
                    </td>
                    <td className="p-3">
                      <div className="font-label-md text-label-md text-primary">{r.clientName}</div>
                      <div className="font-body-sm text-body-sm text-on-surface-variant hidden sm:block">{r.dateLabel}</div>
                    </td>
                    <td className="p-3 text-right whitespace-nowrap">
                      <div className="font-label-md text-label-md text-primary">{fmt(r.total)}</div>
                      {isFacture && r.balance > 0.5 && <div className="font-body-sm text-body-sm text-error">Reste {fmt(r.balance)}</div>}
                    </td>
                    <td className="p-3 text-center hidden sm:table-cell">
                      <span className={`badge ${STATUS_STYLE[r.status] ?? ""}`}>{STATUS_LABEL[r.status] ?? r.status}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex justify-end items-center gap-1">
                        <PdfModal url={`${base}/${r.id}/pdf`} label="" title={`${r.number}`} />
                        <Link href={`${base}/${r.id}`} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-label-md text-label-md text-primary hover:bg-surface-container-high transition-colors" aria-label="Ouvrir">
                          <span className="material-symbols-outlined text-[18px]">open_in_full</span>
                        </Link>
                        <form action={deleteAction}>
                          <input type="hidden" name="id" value={r.id} />
                          <ConfirmSubmit label="" icon="delete" message={`Supprimer ${r.number} ? Cette action est irréversible.`} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-label-md text-label-md text-error hover:bg-error-container transition-colors" />
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
