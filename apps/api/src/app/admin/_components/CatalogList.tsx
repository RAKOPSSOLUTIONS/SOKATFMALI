import { formatFCFA } from "@/lib/finance";
import { createCatalogItem, updateCatalogItem, deleteCatalogItem } from "../catalog-actions";

export type CatalogRow = {
  id: string;
  kind: string;
  name: string;
  description: string | null;
  unit: string;
  price: number;
  reference: string | null;
  category: string | null;
  active: boolean;
};

const UNITS = ["unité", "lot", "forfait", "kg", "tonne", "litre", "sac", "carton", "m²", "m³", "heure", "jour", "mois", "prestation"];

export function CatalogList({ kind, items }: { kind: "PRODUCT" | "SERVICE"; items: CatalogRow[] }) {
  const isProduct = kind === "PRODUCT";
  const noun = isProduct ? "produit" : "service";
  const title = isProduct ? "Produits" : "Services";
  const icon = isProduct ? "inventory_2" : "home_repair_service";
  const activeCount = items.filter((i) => i.active).length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-primary">{title}</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Catalogue réutilisable dans vos devis et factures. {items.length} {noun}
          {items.length > 1 ? "s" : ""} ({activeCount} actif{activeCount > 1 ? "s" : ""}).
        </p>
      </div>

      <details className="card p-5">
        <summary className="flex items-center gap-2 cursor-pointer font-label-md text-label-md text-primary list-none">
          <span className="material-symbols-outlined text-secondary">add_circle</span> Ajouter un {noun}
        </summary>
        <div className="mt-5">
          <CatalogForm action={createCatalogItem} kind={kind} submitLabel="Ajouter" />
        </div>
      </details>

      {items.length === 0 ? (
        <div className="card p-8 text-center">
          <span className="material-symbols-outlined text-on-surface-variant text-[40px]">{icon}</span>
          <p className="font-body-md text-body-md text-on-surface-variant mt-2">Aucun {noun} pour le moment.</p>
        </div>
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-surface-container-low">
                  <th className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant p-3">{title.slice(0, -1)}</th>
                  <th className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant p-3">Réf.</th>
                  <th className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant p-3">Unité</th>
                  <th className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant p-3 text-right">Prix U.</th>
                  <th className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant p-3 text-center">Statut</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it) => (
                  <tr key={it.id} className="border-b border-outline-variant last:border-0 align-top">
                    <td className="p-0" colSpan={5}>
                      <details className="group">
                        <summary className="grid grid-cols-12 gap-2 items-center cursor-pointer list-none p-3 hover:bg-surface-container-low">
                          <div className="col-span-5 md:col-span-4">
                            <div className="font-label-md text-label-md text-primary">{it.name}</div>
                            {it.category && <div className="font-body-sm text-body-sm text-on-surface-variant">{it.category}</div>}
                          </div>
                          <div className="col-span-2 font-body-sm text-body-sm text-on-surface-variant truncate">{it.reference ?? "—"}</div>
                          <div className="col-span-2 font-body-sm text-body-sm text-on-surface-variant">{it.unit}</div>
                          <div className="col-span-2 text-right font-label-md text-label-md text-primary">{formatFCFA(it.price)}</div>
                          <div className="col-span-1 text-center">
                            <span className={`badge ${it.active ? "bg-secondary-container text-on-secondary-container" : "bg-surface-container-high text-on-surface-variant"}`}>
                              {it.active ? "Actif" : "Inactif"}
                            </span>
                          </div>
                        </summary>
                        <div className="p-4 border-t border-outline-variant bg-surface-container-lowest">
                          <CatalogForm action={updateCatalogItem} kind={kind} submitLabel="Enregistrer" item={it} />
                          <form action={deleteCatalogItem} className="mt-4">
                            <input type="hidden" name="id" value={it.id} />
                            <input type="hidden" name="kind" value={kind} />
                            <button className="inline-flex items-center gap-2 px-4 py-2 rounded-lg font-label-md text-label-md text-error hover:bg-error-container transition-colors">
                              <span className="material-symbols-outlined text-[18px]">delete</span> Supprimer
                            </button>
                          </form>
                        </div>
                      </details>
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

function CatalogForm({
  action,
  kind,
  submitLabel,
  item,
}: {
  action: (fd: FormData) => void;
  kind: "PRODUCT" | "SERVICE";
  submitLabel: string;
  item?: CatalogRow;
}) {
  return (
    <form action={action} className="grid md:grid-cols-2 gap-4">
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
          {UNITS.map((u) => (
            <option key={u} value={u}>{u}</option>
          ))}
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
        <label className="label">Description</label>
        <textarea name="description" rows={2} defaultValue={item?.description ?? ""} className="input" />
      </div>
      <label className="md:col-span-2 flex items-center gap-2 cursor-pointer">
        <input type="checkbox" name="active" defaultChecked={item ? item.active : true} className="h-4 w-4 accent-primary" />
        <span className="font-body-md text-body-md text-on-surface">Actif (disponible dans les devis / factures)</span>
      </label>
      <div className="md:col-span-2">
        <button className="btn-primary">{submitLabel}</button>
      </div>
    </form>
  );
}
