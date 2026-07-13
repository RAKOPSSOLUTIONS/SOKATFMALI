import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { jsonWithCors, preflight } from "@/lib/cors";

export const dynamic = "force-dynamic";

export async function OPTIONS(req: NextRequest) {
  return preflight(req.headers.get("origin"));
}

/** Public list of published sectors for the site to consume. */
export async function GET(req: NextRequest) {
  const sectors = await prisma.sector.findMany({
    where: { published: true },
    orderBy: [{ order: "asc" }, { name: "asc" }],
    select: {
      slug: true,
      name: true,
      tagline: true,
      description: true,
      icon: true,
      accent: true,
      featured: true,
    },
  });
  return jsonWithCors({ sectors }, { origin: req.headers.get("origin") });
}
