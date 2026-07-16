"use client";

import { useMemo, useState } from "react";
import { Modal, ConfirmSubmit, ExportButton } from "./ui";

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

export function CatalogList({
  kind,
  items,
  createAction,
  updateAction,
  deleteAction,
}: {
  kind: "PRODUCT" | "SERVICE";
  items: CatalogRow[];
  createAction: Action;
  updateAction: Action;
  deleteAction: Action;
}) {
  const isProduct = kind === "PRODUCT";
  const noun = isProduct ? "produit" : "service";
  const title = isProduct ? "Produits" : "Services";
  const [query, setQuery] = useState("");
  const [view, setView] = useState<"list" | "card">(isProduct ? "card" : "list");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) =>
      [i.name, i.reference, i.category, i.description].filter(Boolean).some((v) => v!.toLowerCase().includes(q)),
    );
  }, [items, query]);

  const exportRows = filtered.map((i) => [i.name, i.reference ?? "", i.category ?? "", i.unit, i.price, i.active ? "Actif" : "Inactif"]);

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
        <ExportButton filename={`${noun}s-sokatf`} headers={["Désignation", "Référence", "Catégorie", "Unité", "Prix U.", "Statut"]} rows={exportRows} />
        <div className="flex rounded-lg border border-outline-variant overflow-hidden">
          <button type="button" onClick={() => setView("list")} aria-label="Vue liste" className={`h-11 w-11 grid place-items-center ${view === "list" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container-high"}`}>
            <span className="material-symbols-outlined">view_list</span>
          </button>
          <button type="button" onClick={() => setView("card")} aria-label="Vue cartes" className={`h-11 w-11 grid place-items-center ${view === "card" ? "bg-primary text-on-primary" : "text-on-surface-variant hover:bg-surface-container-high"}`}>
            <span className="material-symbols-outlined">grid_view</span>
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card p-10 text-center text-on-surface-variant">
          <span className="material-symbols-outlined text-[40px]">{isProduct ? "inventory_2" : "home_repair_service"}</span>
          <p className="font-body-md text-body-md mt-2">{query ? "Aucun résultat." : `Aucun ${noun} pour le moment.`}</p>
        </div>
      ) : view === "card" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((it) => (
            <div key={it.id} className="card overflow-hidden flex flex-col">
              <div className="aspect-video bg-surface-container-high grid place-items-center overflow-hidden">
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
                  <th className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant p-3">Désignation</th>
                  <th className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant p-3 hidden md:table-cell">Réf.</th>
                  <th className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant p-3 hidden sm:table-cell">Unité</th>
                  <th className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant p-3 text-right">Prix U.</th>
                  <th className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant p-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((it) => (
                  <tr key={it.id} className="border-b border-outline-variant last:border-0">
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
  const [preview, setPreview] = useState(item?.imageUrl ?? "");
  return (
    <form
      action={async (fd) => {
        await action(fd);
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
        <label className="label">Image (URL)</label>
        <div className="flex items-center gap-3">
          <input name="imageUrl" defaultValue={item?.imageUrl ?? ""} onChange={(e) => setPreview(e.target.value)} className="input" placeholder="https://…/photo.jpg" />
          <span className="h-12 w-12 shrink-0 rounded-lg bg-surface-container-high grid place-items-center overflow-hidden border border-outline-variant">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="w-full h-full object-cover" />
            ) : (
              <span className="material-symbols-outlined text-on-surface-variant/50 text-[20px]">image</span>
            )}
          </span>
        </div>
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
