import { prisma } from "@/lib/prisma";
import { PROJECT_STATUSES } from "@/lib/constants";
import { createProject, updateProject, deleteProject } from "../../actions";
import { ProjectsManager } from "../../_components/ProjectsManager";

export const dynamic = "force-dynamic";

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

      <ProjectsManager
        projects={projects.map((p) => ({
          id: p.id, slug: p.slug, title: p.title, description: p.description, sector: p.sector,
          status: p.status, location: p.location, year: p.year, imageUrl: p.imageUrl, featured: p.featured,
        }))}
        sectors={sectors}
        statuses={[...PROJECT_STATUSES]}
        createAction={createProject}
        updateAction={updateProject}
        deleteAction={deleteProject}
      />
    </div>
  );
}
