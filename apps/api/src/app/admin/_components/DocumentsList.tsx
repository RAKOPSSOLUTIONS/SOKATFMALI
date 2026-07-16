"use client";

import { useEffect, useMemo, useState } from "react";
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
const PAGE_SIZE = 15;

export function DocumentsList({
  kind,
  rows,
  statuses,
  deleteAction,
  bulkDeleteAction,
}: {
  kind: "devis" | "facture";
  rows: DocRow[];
  statuses: string[];
  deleteAction: Action;
  bulkDeleteAction: Action;
}) {
  const base = kind === "devis" ? "/admin/devis" : "/admin/factures";
  const isFacture = kind === "facture";
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (status && r.status !== status) return false;
      if (!q) return true;
      return [r.number, r.clientName, r.clientCompany].filter(Boolean).some((v) => v!.toLowerCase().includes(q));
    });
  }, [rows, query, status]);

  useEffect(() => setPage(1), [query, status]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const toExport = (rs: DocRow[]) =>
    rs.map((r) => (isFacture
      ? [r.number, r.clientName, r.dateLabel, STATUS_LABEL[r.status] ?? r.status, r.total, r.paid, r.balance]
      : [r.number, r.clientName, r.dateLabel, STATUS_LABEL[r.status] ?? r.status, r.total]));
  const headers = isFacture
    ? ["Numéro", "Client", "Date", "Statut", "Total TTC", "Payé", "Reste"]
    : ["Numéro", "Client", "Date", "Statut", "Total TTC"];

  const allPageSelected = pageRows.length > 0 && pageRows.every((r) => selected.has(r.id));
  const toggle = (id: string) => setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const togglePage = () => setSelected((prev) => {
    const n = new Set(prev);
    if (allPageSelected) pageRows.forEach((r) => n.delete(r.id));
    else pageRows.forEach((r) => n.add(r.id));
    return n;
  });
  const selectedRows = filtered.filter((r) => selected.has(r.id));

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
        <ExportButton filename={`${kind}-sokatf`} sheet={kind} headers={headers} rows={toExport(filtered)} />
      </div>

      {/* Bulk action bar */}
      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
          <span className="font-label-md text-label-md text-primary">{selected.size} sélectionné{selected.size > 1 ? "s" : ""}</span>
          <button type="button" onClick={() => setSelected(new Set())} className="font-label-md text-label-md text-on-surface-variant hover:text-primary">Tout désélectionner</button>
          <div className="ml-auto flex items-center gap-2">
            <ExportButton filename={`${kind}-selection-sokatf`} sheet={kind} headers={headers} rows={toExport(selectedRows)} label="Exporter la sélection" />
            <form action={bulkDeleteAction} onSubmit={() => setSelected(new Set())}>
              <input type="hidden" name="ids" value={[...selected].join(",")} />
              <ConfirmSubmit
                label={`Supprimer (${selected.size})`}
                message={`Supprimer les ${selected.size} ${kind}s sélectionné${selected.size > 1 ? "s" : ""} ? Action irréversible.`}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-label-md text-label-md text-error bg-error-container/50 hover:bg-error-container transition-colors"
              />
            </form>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="card p-10 text-center text-on-surface-variant">
          <span className="material-symbols-outlined text-[40px]">{isFacture ? "receipt_long" : "request_quote"}</span>
          <p className="font-body-md text-body-md mt-2">{rows.length ? "Aucun résultat." : `Aucun ${kind}.`}</p>
        </div>
      ) : (
        <>
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-surface-container-low">
                    <th className="p-3 w-10"><input type="checkbox" checked={allPageSelected} onChange={togglePage} className="h-4 w-4 accent-primary" aria-label="Tout sélectionner" /></th>
                    <th className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant p-3">Numéro</th>
                    <th className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant p-3">Client</th>
                    <th className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant p-3 text-right whitespace-nowrap">Total{isFacture ? " / Reste" : ""}</th>
                    <th className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant p-3 text-center hidden sm:table-cell">Statut</th>
                    <th className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pageRows.map((r) => (
                    <tr key={r.id} className={`border-b border-outline-variant last:border-0 ${selected.has(r.id) ? "bg-primary/5" : "hover:bg-surface-container-low/50"}`}>
                      <td className="p-3"><input type="checkbox" checked={selected.has(r.id)} onChange={() => toggle(r.id)} className="h-4 w-4 accent-primary" aria-label={`Sélectionner ${r.number}`} /></td>
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

          <Pagination page={safePage} totalPages={totalPages} total={filtered.length} onPage={setPage} />
        </>
      )}
    </div>
  );
}

export function Pagination({ page, totalPages, total, onPage }: { page: number; totalPages: number; total: number; onPage: (p: number) => void }) {
  if (totalPages <= 1) return <p className="font-body-sm text-body-sm text-on-surface-variant text-center">{total} élément{total > 1 ? "s" : ""}</p>;
  return (
    <div className="flex items-center justify-between gap-3 flex-wrap">
      <span className="font-body-sm text-body-sm text-on-surface-variant">Page {page} / {totalPages} · {total} éléments</span>
      <div className="flex items-center gap-1">
        <button type="button" onClick={() => onPage(page - 1)} disabled={page <= 1} className="h-10 w-10 grid place-items-center rounded-lg border border-outline-variant disabled:opacity-40 hover:bg-surface-container-high"><span className="material-symbols-outlined">chevron_left</span></button>
        <button type="button" onClick={() => onPage(page + 1)} disabled={page >= totalPages} className="h-10 w-10 grid place-items-center rounded-lg border border-outline-variant disabled:opacity-40 hover:bg-surface-container-high"><span className="material-symbols-outlined">chevron_right</span></button>
      </div>
    </div>
  );
}
