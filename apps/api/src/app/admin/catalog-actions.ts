"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

const KINDS = ["PRODUCT", "SERVICE"] as const;
type Kind = (typeof KINDS)[number];

/** Admin path for a given catalogue kind (for revalidation + redirects). */
function pathFor(kind: string) {
  return kind === "SERVICE" ? "/admin/services" : "/admin/produits";
}

function itemFromForm(fd: FormData) {
  const kind = String(fd.get("kind") ?? "PRODUCT");
  return {
    kind: (KINDS.includes(kind as Kind) ? kind : "PRODUCT") as Kind,
    name: String(fd.get("name") ?? "").trim(),
    description: String(fd.get("description") ?? "").trim() || null,
    imageUrl: String(fd.get("imageUrl") ?? "").trim() || null,
    unit: String(fd.get("unit") ?? "").trim() || "unité",
    price: Math.max(0, Number(fd.get("price")) || 0),
    reference: String(fd.get("reference") ?? "").trim() || null,
    category: String(fd.get("category") ?? "").trim() || null,
    active: fd.get("active") === "on" || fd.get("active") === "true",
  };
}

export async function createCatalogItem(fd: FormData) {
  const data = itemFromForm(fd);
  if (!data.name) return;
  await prisma.catalogItem.create({ data });
  revalidatePath(pathFor(data.kind));
}

export async function updateCatalogItem(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  if (!id) return;
  const data = itemFromForm(fd);
  if (!data.name) return;
  await prisma.catalogItem.update({ where: { id }, data });
  revalidatePath(pathFor(data.kind));
}

export async function deleteCatalogItem(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  if (!id) return;
  await prisma.catalogItem.delete({ where: { id } });
  revalidatePath(pathFor(String(fd.get("kind") ?? "PRODUCT")));
}
