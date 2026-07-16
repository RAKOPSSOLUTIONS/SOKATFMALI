"use client";

import { useMemo, useState } from "react";
import { Modal, ConfirmSubmit, ExportButton } from "./ui";
import { toast } from "./toast";

export type SectorRow = {
  id: string; slug: string; name: string; tagline: string; description: string;
  icon: string; accent: string; order: number; featured: boolean; published: boolean;
};
type Action = (fd: FormData) => void | Promise<void>;

export function SectorsManager({ sectors, accents, createAction, updateAction, deleteAction }: {
  sectors: SectorRow[]; accents: string[]; createAction: Action; updateAction: Action; deleteAction: Action;
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return sectors;
    return sectors.filter((s) => [s.name, s.slug, s.tagline].some((v) => v.toLowerCase().includes(q)));
  }, [sectors, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-headline-md text-headline-md text-primary">Secteurs d'activité</h2>
        <Modal title="Ajouter un secteur" triggerLabel="Ajouter un secteur" size="lg">
          {(close) => <SectorForm accents={accents} action={createAction} submitLabel="Créer le secteur" onDone={close} />}
        </Modal>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher un secteur…" className="input pl-11" />
        </div>
        <ExportButton filename="secteurs-sokatf" sheet="Secteurs" headers={["Nom", "Slug", "Accroche", "Ordre", "Vedette", "Publié"]} rows={filtered.map((s) => [s.name, s.slug, s.tagline, s.order, s.featured ? "Oui" : "Non", s.published ? "Oui" : "Non"])} />
      </div>

      {filtered.length === 0 ? (
        <div className="card p-10 text-center text-on-surface-variant"><span className="material-symbols-outlined text-[40px]">category</span><p className="font-body-md text-body-md mt-2">Aucun secteur.</p></div>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((s) => (
            <div key={s.id} className="card p-4 flex items-center gap-3">
              <span className="h-10 w-10 shrink-0 rounded-lg bg-secondary-container grid place-items-center text-on-secondary-container"><span className="material-symbols-outlined">{s.icon}</span></span>
              <div className="min-w-0 flex-1">
                <div className="font-label-md text-label-md text-primary truncate">{s.name}
                  {s.featured && <span className="badge bg-secondary-container text-on-secondary-container ml-2">Vedette</span>}
                  {!s.published && <span className="badge bg-surface-container-high text-on-surface-variant ml-2">Masqué</span>}
                </div>
                <div className="font-body-sm text-body-sm text-on-surface-variant truncate">{s.tagline}</div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Modal title={`Modifier — ${s.name}`} triggerLabel="" triggerIcon="edit" triggerClass="h-9 w-9 grid place-items-center rounded-lg text-primary hover:bg-surface-container-high" size="lg">
                  {(close) => <SectorForm accents={accents} action={updateAction} submitLabel="Enregistrer" sector={s} onDone={close} />}
                </Modal>
                <form action={deleteAction}>
                  <input type="hidden" name="id" value={s.id} />
                  <ConfirmSubmit label="" icon="delete" message={`Supprimer le secteur « ${s.name} » ?`} className="h-9 w-9 grid place-items-center rounded-lg text-error hover:bg-error-container" />
                </form>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function SectorForm({ accents, action, submitLabel, sector, onDone }: { accents: string[]; action: Action; submitLabel: string; sector?: SectorRow; onDone: () => void }) {
  return (
    <form action={async (fd) => { await action(fd); toast(sector ? "Secteur mis à jour" : "Secteur créé", "success"); onDone(); }} className="grid md:grid-cols-2 gap-4">
      {sector && <input type="hidden" name="id" value={sector.id} />}
      <div><label className="label">Nom *</label><input name="name" required defaultValue={sector?.name} className="input" /></div>
      <div><label className="label">Slug *</label><input name="slug" required defaultValue={sector?.slug} className="input" placeholder="btp-construction" /></div>
      <div className="md:col-span-2"><label className="label">Accroche</label><input name="tagline" defaultValue={sector?.tagline} className="input" /></div>
      <div className="md:col-span-2"><label className="label">Description</label><textarea name="description" rows={3} defaultValue={sector?.description} className="input" /></div>
      <div><label className="label">Icône (Material Symbols)</label><input name="icon" defaultValue={sector?.icon ?? "business_center"} className="input" /></div>
      <div><label className="label">Accent</label><select name="accent" defaultValue={sector?.accent ?? "primary"} className="input">{accents.map((a) => <option key={a} value={a}>{a}</option>)}</select></div>
      <div><label className="label">Ordre</label><input name="order" type="number" defaultValue={sector?.order ?? 0} className="input" /></div>
      <div className="flex items-end gap-6">
        <label className="flex items-center gap-2 font-body-md text-body-md"><input type="checkbox" name="featured" defaultChecked={sector?.featured ?? false} className="accent-primary" /> Vedette</label>
        <label className="flex items-center gap-2 font-body-md text-body-md"><input type="checkbox" name="published" defaultChecked={sector?.published ?? true} className="accent-primary" /> Publié</label>
      </div>
      <div className="md:col-span-2 flex justify-end gap-3 pt-2">
        <button type="button" onClick={onDone} className="btn-outline">Annuler</button>
        <button className="btn-primary">{submitLabel}</button>
      </div>
    </form>
  );
}
