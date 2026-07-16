import { NextRequest } from "next/server";
import { readFileSync } from "fs";
import { resolve } from "path";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

function dbPath() {
  const url = process.env.DATABASE_URL || "file:./dev.db";
  return resolve(process.cwd(), url.replace(/^file:/, ""));
}

function stamp() {
  return new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
}

export async function GET(req: NextRequest) {
  const format = new URL(req.url).searchParams.get("format") || "sqlite";

  if (format === "json") {
    const [leads, sectors, projects, quotes, invoices, payments, clients, users, catalog, setting, activity] = await Promise.all([
      prisma.lead.findMany(),
      prisma.sector.findMany(),
      prisma.project.findMany(),
      prisma.quote.findMany(),
      prisma.invoice.findMany(),
      prisma.payment.findMany(),
      prisma.client.findMany(),
      prisma.user.findMany(),
      prisma.catalogItem.findMany(),
      prisma.setting.findMany(),
      prisma.activityLog.findMany(),
    ]);
    const dump = { app: "SOKATF SARL", exportedAt: new Date().toISOString(), leads, sectors, projects, quotes, invoices, payments, clients, users, catalog, setting, activity };
    await logActivity({ action: "UPDATE", entity: "Settings", detail: "Sauvegarde JSON téléchargée" });
    return new Response(JSON.stringify(dump, null, 2), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="sokatf-backup-${stamp()}.json"`,
        "Cache-Control": "no-store",
      },
    });
  }

  // Raw SQLite file — flush the WAL into the main file first for a current snapshot.
  try {
    await prisma.$executeRawUnsafe("PRAGMA wal_checkpoint(TRUNCATE);");
  } catch {
    /* non-fatal */
  }
  const buf = readFileSync(dbPath());
  await logActivity({ action: "UPDATE", entity: "Settings", detail: "Sauvegarde base (.db) téléchargée" });
  return new Response(new Uint8Array(buf), {
    headers: {
      "Content-Type": "application/octet-stream",
      "Content-Disposition": `attachment; filename="sokatf-${stamp()}.db"`,
      "Cache-Control": "no-store",
    },
  });
}
