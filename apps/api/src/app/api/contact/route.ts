import type { NextRequest } from "next/server";
import { prisma } from "@/lib/prisma";
import { contactSchema, fieldErrors } from "@/lib/validation";
import { sendLeadNotification } from "@/lib/mailer";
import { jsonWithCors, preflight } from "@/lib/cors";

export const dynamic = "force-dynamic";

export async function OPTIONS(req: NextRequest) {
  return preflight(req.headers.get("origin"));
}

export async function POST(req: NextRequest) {
  const origin = req.headers.get("origin");
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return jsonWithCors({ ok: false, error: "Invalid JSON" }, { status: 400, origin });
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    return jsonWithCors(
      { ok: false, errors: fieldErrors(parsed.error) },
      { status: 422, origin },
    );
  }

  const data = parsed.data;
  // Honeypot tripped → pretend success, drop silently.
  if (data.website) {
    return jsonWithCors({ ok: true }, { origin });
  }

  const lead = await prisma.lead.create({
    data: {
      type: "CONTACT",
      name: data.name,
      email: data.email,
      phone: data.phone || null,
      company: data.company || null,
      message: data.message,
      source: data.source || "/contact",
    },
  });

  await sendLeadNotification({ type: "CONTACT", ...data });

  return jsonWithCors({ ok: true, id: lead.id }, { status: 201, origin });
}
