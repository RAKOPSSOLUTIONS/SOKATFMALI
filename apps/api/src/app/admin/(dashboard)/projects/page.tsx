import { FormToast } from "../../_components/toast";
import { ConfirmSubmit } from "../../_components/ui";
import { prisma } from "@/lib/prisma";
import { PROJECT_STATUSES } from "@/lib/constants";
import { createProject, updateProject, deleteProject } from "../../actions";

export const dynamic = "force-dynamic";

type ProjectRow = Awaited<ReturnType<typeof prisma.project.findMany>>[number];

export default async function ProjectsPage() {
  const [projects, sectors] = await Promise.all([
    prisma.project.findMany({ orderBy: { createdAt: "desc" } }),
    prisma.sector.findMany({ select: { slug: true, name: true }, orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-primary">Réalisations</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Projets de référence présentés sur le site.
        </p>
      </div>

      <details className="card p-5">
        <summary className="flex items-center gap-2 cursor-pointer font-label-md text-label-md text-primary list-none">
          <span className="material-symbols-outlined text-secondary">add_circle</span>
          Ajouter une réalisation
        </summary>
        <div className="mt-5">
          <ProjectForm action={createProject} submitLabel="Créer" sectors={sectors} />
        </div>
      </details>

      <div className="space-y-3">
        {projects.map((p) => (
          <details key={p.id} className="card p-5">
            <summary className="flex items-center gap-4 cursor-pointer list-none">
              <span className="material-symbols-outlined text-primary">workspaces</span>
              <div className="min-w-0">
                <div className="font-label-md text-label-md text-primary truncate">
                  {p.title}
                  {p.featured && (
                    <span className="badge bg-secondary-container text-on-secondary-container ml-2">
                      Vedette
                    </span>
                  )}
                </div>
                <div className="font-body-sm text-body-sm text-on-surface-variant truncate">
                  {[p.location, p.year, p.sector].filter(Boolean).join(" · ")}
                </div>
              </div>
              <span className="badge bg-surface-container-high text-on-surface-variant ml-auto shrink-0">
                {p.status}
              </span>
            </summary>
            <div className="mt-5 pt-5 border-t border-outline-variant">
              <ProjectForm action={updateProject} submitLabel="Enregistrer" project={p} sectors={sectors} />
              <form action={deleteProject} className="mt-4">
                <input type="hidden" name="id" value={p.id} />
                <ConfirmSubmit message={`Supprimer la réalisation « ${p.title} » ?`} />
              </form>
            </div>
          </details>
        ))}
      </div>
    </div>
  );
}

function ProjectForm({
  action,
  submitLabel,
  project,
  sectors,
}: {
  action: (formData: FormData) => void;
  submitLabel: string;
  project?: ProjectRow;
  sectors: { slug: string; name: string }[];
}) {
  return (
    <form action={action} className="grid md:grid-cols-2 gap-4">
      <FormToast message="Réalisation enregistrée" />
      {project && <input type="hidden" name="id" value={project.id} />}
      <div>
        <label className="label">Titre</label>
        <input name="title" required defaultValue={project?.title} className="input" />
      </div>
      <div>
        <label className="label">Slug</label>
        <input name="slug" required defaultValue={project?.slug} className="input" />
      </div>
      <div className="md:col-span-2">
        <label className="label">Description</label>
        <textarea name="description" rows={3} defaultValue={project?.description} className="input" />
      </div>
      <div>
        <label className="label">Secteur</label>
        <select name="sector" defaultValue={project?.sector ?? ""} className="input">
          <option value="">—</option>
          {sectors.map((s) => (
            <option key={s.slug} value={s.slug}>
              {s.name}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Statut</label>
        <select name="status" defaultValue={project?.status ?? "COMPLETED"} className="input">
          {PROJECT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Localisation</label>
        <input name="location" defaultValue={project?.location ?? ""} className="input" />
      </div>
      <div>
        <label className="label">Année</label>
        <input name="year" type="number" defaultValue={project?.year ?? ""} className="input" />
      </div>
      <div className="md:col-span-2">
        <label className="label">Image (URL)</label>
        <input name="imageUrl" defaultValue={project?.imageUrl ?? ""} className="input" placeholder="https://…" />
      </div>
      <div className="flex items-end">
        <label className="flex items-center gap-2 font-body-md text-body-md">
          <input type="checkbox" name="featured" defaultChecked={project?.featured ?? false} />
          Mettre en vedette
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
