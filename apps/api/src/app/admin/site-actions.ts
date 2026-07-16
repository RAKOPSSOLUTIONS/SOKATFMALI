"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";

export async function updateSiteContent(fd: FormData) {
  const s = (k: string) => String(fd.get(k) ?? "").trim() || null;
  const arr = (k: string) => {
    try {
      const v = JSON.parse(String(fd.get(k) ?? "[]"));
      return Array.isArray(v) ? JSON.stringify(v) : "[]";
    } catch {
      return "[]";
    }
  };
  const data = {
    heroEyebrow: s("heroEyebrow"),
    heroTitle: s("heroTitle"),
    heroTitleAccent: s("heroTitleAccent"),
    heroSubtitle: s("heroSubtitle"),
    stats: arr("stats"),
    aboutEyebrow: s("aboutEyebrow"),
    aboutTitle: s("aboutTitle"),
    aboutText: s("aboutText"),
    contactCity: s("contactCity"),
    contactAddress: s("contactAddress"),
    phoneDisplay: s("phoneDisplay"),
    phoneTel: s("phoneTel"),
    email: s("email"),
    whatsapp: s("whatsapp"),
    whatsappLink: s("whatsappLink"),
    nif: s("nif"),
    rccm: s("rccm"),
    blurb: s("blurb"),
    partners: arr("partners"),
    services: arr("services"),
  };
  await prisma.siteContent.upsert({ where: { id: "singleton" }, create: { id: "singleton", ...data }, update: data });
  await logActivity({ action: "UPDATE", entity: "Settings", detail: "Contenu du site public mis à jour" });
  revalidatePath("/admin/site");
}
