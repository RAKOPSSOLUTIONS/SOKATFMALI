import { prisma } from "@/lib/prisma";
import { CatalogList } from "../../_components/CatalogList";

export const dynamic = "force-dynamic";

export default async function ProduitsPage() {
  const items = await prisma.catalogItem.findMany({
    where: { kind: "PRODUCT" },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });
  return <CatalogList kind="PRODUCT" items={items} />;
}
