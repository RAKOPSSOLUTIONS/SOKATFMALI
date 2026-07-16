import type { NextRequest } from "next/server";
import { getSiteContent } from "@/lib/siteContent";
import { jsonWithCors, preflight } from "@/lib/cors";

export const dynamic = "force-dynamic";

export async function OPTIONS(req: NextRequest) {
  return preflight(req.headers.get("origin"));
}

export async function GET(req: NextRequest) {
  const content = await getSiteContent();
  return jsonWithCors(content, { origin: req.headers.get("origin") });
}
