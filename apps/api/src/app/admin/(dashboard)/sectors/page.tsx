import { ConfirmSubmit } from "../../_components/ui";
import { prisma } from "@/lib/prisma";
import { ACCENTS } from "@/lib/constants";
import { createSector, updateSector, deleteSector } from "../../actions";

export const dynamic = "force-dynamic";

type SectorRow = Awaited<ReturnType<typeof prisma.sector.findMany>>[number];

export default async function SectorsPage() {
  const sectors = await prisma.sector.findMany({
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-headline-lg text-headline-lg text-primary">Secteurs</h1>
          <p className="font-body-md text-body-md text-on-surface-variant">
            Gérez les secteurs d&apos;activité affichés sur le site.
          </p>
        </div>
      </div>

      <details className="card p-5 group">
        <summary className="flex items-center gap-2 cursor-pointer font-label-md text-label-md text-primary list-none">
          <span className="material-symbols-outlined text-secondary">add_circle</span>
          Ajouter un secteur
        </summary>
        <div className="mt-5">
          <SectorForm action={createSector} submitLabel="Créer le secteur" />
        </div>
      </details>

      <div className="space-y-3">
        {sectors.map((s) => (
          <details key={s.id} className="card p-5">
            <summary className="flex items-center gap-4 cursor-pointer list-none">
              <span className="material-symbols-outlined text-primary">{s.icon}</span>
              <div className="min-w-0">
                <div className="font-label-md text-label-md text-primary truncate">
                  {s.name}
                  {s.featured && (
                    <span className="badge bg-secondary-container text-on-secondary-container ml-2">
                      Vedette
                    </span>
                  )}
                  {!s.published && (
                    <span className="badge bg-surface-container-high text-on-surface-variant ml-2">
                      Masqué
                    </span>
                  )}
                </div>
                <div className="font-body-sm text-body-sm text-on-surface-variant truncate">
                  {s.tagline}
                </div>
              </div>
              <span className="font-label-sm text-label-sm text-on-surface-variant ml-auto shrink-0">
                #{s.order}
              </span>
            </summary>
            <div className="mt-5 pt-5 border-t border-outline-variant">
              <SectorForm action={updateSector} submitLabel="Enregistrer" sector={s} />
              <form action={deleteSector} className="mt-4">
                <input type="hidden" name="id" value={s.id} />
                <ConfirmSubmit label="Supprimer ce secteur" message={`Supprimer le secteur « ${s.name} » ?`} />
              </form>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

function SectorForm({
  action,
  submitLabel,
  sector,
}: {
  action: (formData: FormData) => void;
  submitLabel: string;
  sector?: SectorRow;
}) {
  return (
    <form action={action} className="grid md:grid-cols-2 gap-4">
      {sector && <input type="hidden" name="id" value={sector.id} />}
      <div>
        <label className="label">Nom</label>
        <input name="name" required defaultValue={sector?.name} className="input" />
      </div>
      <div>
        <label className="label">Slug</label>
        <input name="slug" required defaultValue={sector?.slug} className="input" placeholder="btp-construction" />
      </div>
      <div className="md:col-span-2">
        <label className="label">Accroche</label>
        <input name="tagline" defaultValue={sector?.tagline} className="input" />
      </div>
      <div className="md:col-span-2">
        <label className="label">Description</label>
        <textarea name="description" rows={3} defaultValue={sector?.description} className="input" />
      </div>
      <div>
        <label className="label">Icône (Material Symbols)</label>
        <input name="icon" defaultValue={sector?.icon ?? "business_center"} className="input" />
      </div>
      <div>
        <label className="label">Accent</label>
        <select name="accent" defaultValue={sector?.accent ?? "primary"} className="input">
          {ACCENTS.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Ordre</label>
        <input name="order" type="number" defaultValue={sector?.order ?? 0} className="input" />
      </div>
      <div className="flex items-end gap-6">
        <label className="flex items-center gap-2 font-body-md text-body-md">
          <input type="checkbox" name="featured" defaultChecked={sector?.featured ?? false} />
          Vedette
        </label>
        <label className="flex items-center gap-2 font-body-md text-body-md">
          <input type="checkbox" name="published" defaultChecked={sector?.published ?? true} />
          Publié
        </label>
      </div>
      <div className="md:col-span-2">
        <button type="submit" className="btn-primary">
          {submitLabel}
        </button>
      </div>
    </form>
  );
}
