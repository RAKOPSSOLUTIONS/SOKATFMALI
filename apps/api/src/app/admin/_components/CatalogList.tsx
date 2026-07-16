"use client";

import { useEffect, useMemo, useState } from "react";
import { Modal, ConfirmSubmit, ExportButton, ImageField } from "./ui";
import { Pagination } from "./DocumentsList";
import { toast } from "./toast";

export type CatalogRow = {
  id: string;
  kind: string;
  name: string;
  description: string | null;
  imageUrl: string | null;
  unit: string;
  price: number;
  reference: string | null;
  category: string | null;
  active: boolean;
};

type Action = (fd: FormData) => void | Promise<void>;

const UNITS = ["unité", "lot", "forfait", "kg", "tonne", "litre", "sac", "carton", "m²", "m³", "heure", "jour", "mois", "prestation"];
const fmt = (n: number) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(Math.round(n || 0)) + " FCFA";

const PAGE_SIZE = 12;
const toExport = (rs: CatalogRow[]) => rs.map((i) => [i.name, i.reference ?? "", i.category ?? "", i.unit, i.price, i.active ? "Actif" : "Inactif"]);
const EXPORT_HEADERS = ["Désignation", "Référence", "Catégorie", "Unité", "Prix U.", "Statut"];

export function CatalogList({
  kind,
  items,
  createAction,
  updateAction,
  deleteAction,
  bulkDeleteAction,
}: {
  kind: "PRODUCT" | "SERVICE";
  items: CatalogRow[];
  createAction: Action;
  updateAction: Action;
  deleteAction: Action;
  bulkDeleteAction: Action;
}) {
  const isProduct = kind === "PRODUCT";
  const noun = isProduct ? "produit" : "service";
  const title = isProduct ? "Produits" : "Services";
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"list" | "card">(isProduct ? "card" : "list");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) =>
      [i.name, i.reference, i.category, i.description].filter(Boolean).some((v) => v!.toLowerCase().includes(q)),
    );
  }, [items, query]);

  useEffect(() => setPage(1), [query]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const toggle = (id: string) => setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const selectedRows = filtered.filter((i) => selected.has(i.id));

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary">{title}</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Catalogue réutilisable dans vos devis et factures. {items.length} {noun}{items.length > 1 ? "s" : ""}.
          </p>
        </div>
        <Modal title={`Ajouter un ${noun}`} triggerLabel={`Ajouter un ${noun}`} size="lg">
          {(close) => <CatalogForm kind={kind} submitLabel="Ajouter" action={createAction} onDone={close} />}
        </Modal>
      </div>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Rechercher un ${noun}…`}
            className="input pl-11"
          />
        </div>
        <ExportButton filename={`${noun}s-sokatf`} sheet={title} headers={EXPORT_HEADERS} rows={toExport(filtered)} />
        <div className="flex rounded-lg border border-outline-variant overflow-hidden">
          <button type="button" onClick={() => setView("list")} aria-label="Vue liste" className={`h-11 w-11 grid place-items-center ${view === "list" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container-high"}`}>
            <span className="material-symbols-outlined">view_list</span>
          </button>
          <button type="button" onClick={() => setView("card")} aria-label="Vue cartes" className={`h-11 w-11 grid place-items-center ${view === "card" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container-high"}`}>
            <span className="material-symbols-outlined">grid_view</span>
          </button>
        </div>
      </div>

      {selected.size > 0 && (
        <div className="flex flex-wrap items-center gap-3 p-3 rounded-xl bg-primary/5 border border-primary/20">
          <span className="font-label-md text-label-md text-primary">{selected.size} sélectionné{selected.size > 1 ? "s" : ""}</span>
          <button type="button" onClick={() => setSelected(new Set())} className="font-label-md text-label-md text-on-surface-variant hover:text-primary">Tout désélectionner</button>
          <div className="ml-auto flex items-center gap-2">
            <ExportButton filename={`${noun}s-selection-sokatf`} sheet={title} headers={EXPORT_HEADERS} rows={toExport(selectedRows)} label="Exporter la sélection" />
            <form action={bulkDeleteAction} onSubmit={() => setSelected(new Set())}>
              <input type="hidden" name="ids" value={[...selected].join(",")} />
              <input type="hidden" name="kind" value={kind} />
              <ConfirmSubmit label={`Supprimer (${selected.size})`} message={`Supprimer les ${selected.size} article${selected.size > 1 ? "s" : ""} sélectionné${selected.size > 1 ? "s" : ""} ?`} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-label-md text-label-md text-error bg-error-container/50 hover:bg-error-container transition-colors" />
            </form>
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="card p-10 text-center text-on-surface-variant">
          <span className="material-symbols-outlined text-[40px]">{isProduct ? "inventory_2" : "home_repair_service"}</span>
          <p className="font-body-md text-body-md mt-2">{query ? "Aucun résultat." : `Aucun ${noun} pour le moment.`}</p>
        </div>
      ) : view === "card" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {pageItems.map((it) => (
            <div key={it.id} className={`card overflow-hidden flex flex-col ${selected.has(it.id) ? "ring-2 ring-primary" : ""}`}>
              <div className="relative aspect-video bg-surface-container-high grid place-items-center overflow-hidden">
                <input type="checkbox" checked={selected.has(it.id)} onChange={() => toggle(it.id)} className="absolute top-2 left-2 h-4 w-4 accent-primary z-10" aria-label={`Sélectionner ${it.name}`} />
                {it.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={it.imageUrl} alt={it.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-on-surface-variant/40 text-[40px]">{isProduct ? "inventory_2" : "home_repair_service"}</span>
                )}
              </div>
              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-label-md text-label-md text-primary">{it.name}</h3>
                  {!it.active && <span className="badge bg-surface-container-high text-on-surface-variant shrink-0">Inactif</span>}
                </div>
                {it.category && <p className="font-body-sm text-body-sm text-on-surface-variant">{it.category}</p>}
                <div className="font-headline-md text-headline-md text-primary mt-2">{fmt(it.price)}</div>
                <div className="font-body-sm text-body-sm text-on-surface-variant">/ {it.unit}{it.reference ? ` · ${it.reference}` : ""}</div>
                <div className="flex gap-1 mt-auto pt-3">
                  <RowActions it={it} kind={kind} updateAction={updateAction} deleteAction={deleteAction} />
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low">
                  <th className="p-3 w-10"><input type="checkbox" checked={pageItems.length > 0 && pageItems.every((i) => selected.has(i.id))} onChange={() => setSelected((prev) => { const n = new Set(prev); const all = pageItems.every((i) => n.has(i.id)); pageItems.forEach((i) => all ? n.delete(i.id) : n.add(i.id)); return n; })} className="h-4 w-4 accent-primary" aria-label="Tout sélectionner" /></th>
                  <th className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant p-3">Désignation</th>
                  <th className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant p-3 hidden md:table-cell">Réf.</th>
                  <th className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant p-3 hidden sm:table-cell">Unité</th>
                  <th className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant p-3 text-right">Prix U.</th>
                  <th className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {pageItems.map((it) => (
                  <tr key={it.id} className={`border-b border-outline-variant last:border-0 ${selected.has(it.id) ? "bg-primary/5" : ""}`}>
                    <td className="p-3"><input type="checkbox" checked={selected.has(it.id)} onChange={() => toggle(it.id)} className="h-4 w-4 accent-primary" aria-label={`Sélectionner ${it.name}`} /></td>
                    <td className="p-3">
                      <div className="flex items-center gap-3">
                        <span className="h-10 w-10 shrink-0 rounded-lg bg-surface-container-high grid place-items-center overflow-hidden">
                          {it.imageUrl ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={it.imageUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="material-symbols-outlined text-on-surface-variant/50 text-[20px]">{isProduct ? "inventory_2" : "home_repair_service"}</span>
                          )}
                        </span>
                        <div>
                          <div className="font-label-md text-label-md text-primary">{it.name}{!it.active && <span className="badge bg-surface-container-high text-on-surface-variant ml-2">Inactif</span>}</div>
                          {it.category && <div className="font-body-sm text-body-sm text-on-surface-variant">{it.category}</div>}
                        </div>
                      </div>
                    </td>
                    <td className="p-3 font-body-sm text-body-sm text-on-surface-variant hidden md:table-cell">{it.reference ?? "—"}</td>
                    <td className="p-3 font-body-sm text-body-sm text-on-surface-variant hidden sm:table-cell">{it.unit}</td>
                    <td className="p-3 text-right font-label-md text-label-md text-primary whitespace-nowrap">{fmt(it.price)}</td>
                    <td className="p-3">
                      <div className="flex justify-end gap-1">
                        <RowActions it={it} kind={kind} updateAction={updateAction} deleteAction={deleteAction} />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filtered.length > 0 && <Pagination page={safePage} totalPages={totalPages} total={filtered.length} onPage={setPage} />}
    </div>
  );
}

function RowActions({ it, kind, updateAction, deleteAction }: { it: CatalogRow; kind: "PRODUCT" | "SERVICE"; updateAction: Action; deleteAction: Action }) {
  return (
    <>
      <Modal
        title={`Modifier — ${it.name}`}
        triggerLabel="Modifier"
        triggerIcon="edit"
        triggerClass="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-label-md text-label-md text-primary hover:bg-surface-container-high transition-colors"
        size="lg"
      >
        {(close) => <CatalogForm kind={kind} submitLabel="Enregistrer" action={updateAction} item={it} onDone={close} />}
      </Modal>
      <form action={deleteAction}>
        <input type="hidden" name="id" value={it.id} />
        <input type="hidden" name="kind" value={kind} />
        <ConfirmSubmit
          label=""
          icon="delete"
          message={`Supprimer « ${it.name} » du catalogue ?`}
          className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-label-md text-label-md text-error hover:bg-error-container transition-colors"
        />
      </form>
    </>
  );
}

function CatalogForm({
  kind,
  submitLabel,
  action,
  item,
  onDone,
}: {
  kind: "PRODUCT" | "SERVICE";
  submitLabel: string;
  action: Action;
  item?: CatalogRow;
  onDone: () => void;
}) {
  const nounLabel = kind === "PRODUCT" ? "produit" : "service";
  return (
    <form
      action={async (fd) => {
        await action(fd);
        toast(item ? "Modifications enregistrées" : "Ajouté au catalogue", "success");
        onDone();
      }}
      className="grid md:grid-cols-2 gap-4"
    >
      {item && <input type="hidden" name="id" value={item.id} />}
      <input type="hidden" name="kind" value={kind} />
      <div className="md:col-span-2">
        <label className="label">Désignation *</label>
        <input name="name" required defaultValue={item?.name} className="input" placeholder={kind === "PRODUCT" ? "Ex. Ciment CPA 45" : "Ex. Gardiennage 24/7 (agent)"} />
      </div>
      <div>
        <label className="label">Prix unitaire (FCFA)</label>
        <input name="price" type="number" min="0" step="1" defaultValue={item?.price ?? 0} className="input text-right" />
      </div>
      <div>
        <label className="label">Unité</label>
        <select name="unit" defaultValue={item?.unit ?? (kind === "PRODUCT" ? "unité" : "prestation")} className="input">
          {UNITS.map((u) => <option key={u} value={u}>{u}</option>)}
        </select>
      </div>
      <div>
        <label className="label">Référence</label>
        <input name="reference" defaultValue={item?.reference ?? ""} className="input" placeholder="SKU / code" />
      </div>
      <div>
        <label className="label">Catégorie</label>
        <input name="category" defaultValue={item?.category ?? ""} className="input" placeholder="Secteur / famille" />
      </div>
      <div className="md:col-span-2">
        <ImageField name="imageUrl" defaultValue={item?.imageUrl ?? ""} label={`Image du ${nounLabel}`} />
      </div>
      <div className="md:col-span-2">
        <label className="label">Description</label>
        <textarea name="description" rows={2} defaultValue={item?.description ?? ""} className="input" />
      </div>
      <label className="md:col-span-2 flex items-center gap-2 cursor-pointer">
        <input type="checkbox" name="active" defaultChecked={item ? item.active : true} className="h-4 w-4 accent-primary" />
        <span className="font-body-md text-body-md text-on-surface">Actif (disponible dans les devis / factures)</span>
      </label>
      <div className="md:col-span-2 flex justify-end gap-3 pt-2">
        <button type="button" onClick={onDone} className="btn-outline">Annuler</button>
        <button className="btn-primary">{submitLabel}</button>
      </div>
    </form>
  );
}
