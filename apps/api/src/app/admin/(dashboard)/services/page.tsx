import { prisma } from "@/lib/prisma";
import { CatalogList } from "../../_components/CatalogList";

export const dynamic = "force-dynamic";

export default async function ServicesPage() {
  const items = await prisma.catalogItem.findMany({
    where: { kind: "SERVICE" },
    orderBy: [{ order: "asc" }, { name: "asc" }],
  });
  return <CatalogList kind="SERVICE" items={items} />;
}
