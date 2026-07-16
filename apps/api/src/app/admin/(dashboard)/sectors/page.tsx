import { prisma } from "@/lib/prisma";
import { ACCENTS } from "@/lib/constants";
import { createSector, updateSector, deleteSector } from "../../actions";
import { SectorsManager } from "../../_components/SectorsManager";

export const dynamic = "force-dynamic";

export default async function SectorsPage() {
  const sectors = await prisma.sector.findMany({ orderBy: [{ order: "asc" }, { name: "asc" }] });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-headline-lg text-headline-lg text-primary">Secteurs</h1>
        <p className="font-body-md text-body-md text-on-surface-variant">
          Gérez les secteurs d&apos;activité affichés sur le site.
        </p>
      </div>

      <SectorsManager
        sectors={sectors.map((s) => ({
          id: s.id, slug: s.slug, name: s.name, tagline: s.tagline, description: s.description,
          icon: s.icon, accent: s.accent, order: s.order, featured: s.featured, published: s.published,
        }))}
        accents={[...ACCENTS]}
        createAction={createSector}
        updateAction={updateSector}
        deleteAction={deleteSector}
      />
    </div>
  );
}
