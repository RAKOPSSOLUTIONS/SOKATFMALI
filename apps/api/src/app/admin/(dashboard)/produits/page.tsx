import { prisma } from "@/lib/prisma";
import { CatalogList } from "../../_components/CatalogList";
import { createCatalogItem, updateCatalogItem, deleteCatalogItem } from "../../catalog-actions";

export const dynamic = "force-dynamic";

export default async function ProduitsPage() {
  const items = await prisma.catalogItem.findMany({
    where: { kind: "PRODUCT" },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });
  return (
    <CatalogList
      kind="PRODUCT"
      items={items}
      createAction={createCatalogItem}
      updateAction={updateCatalogItem}
      deleteAction={deleteCatalogItem}
    />
  );
}
