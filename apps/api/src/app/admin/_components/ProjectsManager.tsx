"use client";

import { useMemo, useState } from "react";
import { Modal, ConfirmSubmit, ExportButton, ImageField } from "./ui";
import { toast } from "./toast";

export type ProjectRow = {
  id: string; slug: string; title: string; description: string; sector: string | null;
  status: string; location: string | null; year: number | null; imageUrl: string | null; featured: boolean;
};
type Sector = { slug: string; name: string };
type Action = (fd: FormData) => void | Promise<void>;

export function ProjectsManager({ projects, sectors, statuses, createAction, updateAction, deleteAction }: {
  projects: ProjectRow[]; sectors: Sector[]; statuses: string[]; createAction: Action; updateAction: Action; deleteAction: Action;
}) {
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return projects;
    return projects.filter((p) => [p.title, p.location, p.sector].filter(Boolean).some((v) => v!.toLowerCase().includes(q)));
  }, [projects, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-headline-md text-headline-md text-primary">Réalisations</h2>
        <Modal title="Ajouter une réalisation" triggerLabel="Ajouter une réalisation" size="lg">
          {(close) => <ProjectForm sectors={sectors} statuses={statuses} action={createAction} submitLabel="Créer" onDone={close} />}
        </Modal>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
          <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Rechercher une réalisation…" className="input pl-11" />
        </div>
        <ExportButton filename="realisations-sokatf" sheet="Réalisations" headers={["Titre", "Secteur", "Localisation", "Année", "Statut", "Vedette"]} rows={filtered.map((p) => [p.title, p.sector ?? "", p.location ?? "", p.year ?? "", p.status, p.featured ? "Oui" : "Non"])} />
      </div>

      {filtered.length === 0 ? (
        <div className="card p-10 text-center text-on-surface-variant"><span className="material-symbols-outlined text-[40px]">workspaces</span><p className="font-body-md text-body-md mt-2">Aucune réalisation.</p></div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <div key={p.id} className="card overflow-hidden flex flex-col">
              <div className="aspect-video bg-surface-container-high grid place-items-center overflow-hidden">
                {p.imageUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.imageUrl} alt={p.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="material-symbols-outlined text-on-surface-variant/40 text-[40px]">workspaces</span>
                )}
              </div>
              <div className="p-4 flex flex-col flex-1">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-label-md text-label-md text-primary">{p.title}</h3>
                  {p.featured && <span className="badge bg-secondary-container text-on-secondary-container shrink-0">Vedette</span>}
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant">{[p.location, p.year, p.status].filter(Boolean).join(" · ")}</p>
                <div className="flex gap-1 mt-auto pt-3">
                  <Modal title={`Modifier — ${p.title}`} triggerLabel="Modifier" triggerIcon="edit" triggerClass="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-label-md text-label-md text-primary hover:bg-surface-container-high transition-colors" size="lg">
                    {(close) => <ProjectForm sectors={sectors} statuses={statuses} action={updateAction} submitLabel="Enregistrer" project={p} onDone={close} />}
                  </Modal>
                  <form action={deleteAction}>
                    <input type="hidden" name="id" value={p.id} />
                    <ConfirmSubmit label="" icon="delete" message={`Supprimer la réalisation « ${p.title} » ?`} className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-label-md text-label-md text-error hover:bg-error-container transition-colors" />
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjectForm({ sectors, statuses, action, submitLabel, project, onDone }: { sectors: Sector[]; statuses: string[]; action: Action; submitLabel: string; project?: ProjectRow; onDone: () => void }) {
  return (
    <form action={async (fd) => { await action(fd); toast(project ? "Réalisation mise à jour" : "Réalisation créée", "success"); onDone(); }} className="grid md:grid-cols-2 gap-4">
      {project && <input type="hidden" name="id" value={project.id} />}
      <div><label className="label">Titre *</label><input name="title" required defaultValue={project?.title} className="input" /></div>
      <div><label className="label">Slug *</label><input name="slug" required defaultValue={project?.slug} className="input" /></div>
      <div className="md:col-span-2"><label className="label">Description</label><textarea name="description" rows={3} defaultValue={project?.description} className="input" /></div>
      <div><label className="label">Secteur</label><select name="sector" defaultValue={project?.sector ?? ""} className="input"><option value="">—</option>{sectors.map((s) => <option key={s.slug} value={s.slug}>{s.name}</option>)}</select></div>
      <div><label className="label">Statut</label><select name="status" defaultValue={project?.status ?? "COMPLETED"} className="input">{statuses.map((s) => <option key={s} value={s}>{s}</option>)}</select></div>
      <div><label className="label">Localisation</label><input name="location" defaultValue={project?.location ?? ""} className="input" /></div>
      <div><label className="label">Année</label><input name="year" type="number" defaultValue={project?.year ?? ""} className="input" /></div>
      <div className="md:col-span-2"><ImageField name="imageUrl" defaultValue={project?.imageUrl ?? ""} label="Image de la réalisation" /></div>
      <label className="md:col-span-2 flex items-center gap-2 cursor-pointer"><input type="checkbox" name="featured" defaultChecked={project?.featured ?? false} className="h-4 w-4 accent-primary" /> <span className="font-body-md text-body-md text-on-surface">Mettre en vedette</span></label>
      <div className="md:col-span-2 flex justify-end gap-3 pt-2">
        <button type="button" onClick={onDone} className="btn-outline">Annuler</button>
        <button className="btn-primary">{submitLabel}</button>
      </div>
    </form>
  );
}
