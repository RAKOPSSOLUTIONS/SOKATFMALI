"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  SESSION_COOKIE,
  SESSION_MAX_AGE,
  ROLES,
  checkCredentials,
  createSessionToken,
  type Role,
} from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/password";
import { LEAD_STATUSES, PROJECT_STATUSES } from "@/lib/constants";

// --- Auth --------------------------------------------------------------

export type LoginState = { error?: string };

export async function loginAction(
  _prev: LoginState,
  formData: FormData,
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin") || "/admin";

  let role: Role;
  let name: string;
  const user = await prisma.user.findUnique({ where: { email } });
  if (user && user.active && verifyPassword(password, user.passwordHash)) {
    role = (ROLES.includes(user.role as Role) ? user.role : "commercial") as Role;
    name = user.name;
  } else if (checkCredentials(email, password)) {
    role = "admin";
    name = "Administrateur";
  } else {
    return { error: "Identifiants invalides." };
  }

  const token = await createSessionToken(email, role, name);
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });

  redirect(next.startsWith("/admin") ? next : "/admin");
}

export async function logoutAction() {
  const jar = await cookies();
  jar.delete(SESSION_COOKIE);
  redirect("/admin/login");
}

// --- Leads -------------------------------------------------------------

export async function updateLeadStatus(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  const status = String(formData.get("status") ?? "");
  if (!id || !LEAD_STATUSES.includes(status as never)) return;
  await prisma.lead.update({ where: { id }, data: { status } });
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
}

export async function deleteLead(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.lead.delete({ where: { id } });
  revalidatePath("/admin/leads");
  revalidatePath("/admin");
}

// --- Sectors -----------------------------------------------------------

function sectorFromForm(formData: FormData) {
  const orderRaw = Number(formData.get("order"));
  return {
    slug: String(formData.get("slug") ?? "").trim(),
    name: String(formData.get("name") ?? "").trim(),
    tagline: String(formData.get("tagline") ?? "").trim(),
    description: String(formData.get("description") ?? "").trim(),
    icon: String(formData.get("icon") ?? "business_center").trim() || "business_center",
    accent: String(formData.get("accent") ?? "primary").trim() || "primary",
    featured: formData.get("featured") === "on",
    published: formData.get("published") === "on",
    order: Number.isFinite(orderRaw) ? orderRaw : 0,
  };
}

export async function createSector(formData: FormData) {
  const data = sectorFromForm(formData);
  if (!data.slug || !data.name) return;
  await prisma.sector.create({ data });
  revalidatePath("/admin/sectors");
  redirect("/admin/sectors");
}

export async function updateSector(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const data = sectorFromForm(formData);
  await prisma.sector.update({ where: { id }, data });
  revalidatePath("/admin/sectors");
  redirect("/admin/sectors");
}

export async function deleteSector(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.sector.delete({ where: { id } });
  revalidatePath("/admin/sectors");
}

// --- Projects ----------------------------------------------------------

function projectFromForm(formData: FormData) {
  const yearRaw = Number(formData.get("year"));
  const status = String(formData.get("status") ?? "COMPLETED");
  return {
    slug: String(formData.get("slug") ?? "").trim(),
    title: String(formData.get("title") ?? "").trim(),
    sector: String(formData.get("sector") ?? "").trim() || null,
    description: String(formData.get("description") ?? "").trim(),
    imageUrl: String(formData.get("imageUrl") ?? "").trim() || null,
    location: String(formData.get("location") ?? "").trim() || null,
    year: Number.isFinite(yearRaw) && yearRaw > 0 ? yearRaw : null,
    status: PROJECT_STATUSES.includes(status as never) ? status : "COMPLETED",
    featured: formData.get("featured") === "on",
  };
}

export async function createProject(formData: FormData) {
  const data = projectFromForm(formData);
  if (!data.slug || !data.title) return;
  await prisma.project.create({ data });
  revalidatePath("/admin/projects");
  redirect("/admin/projects");
}

export async function updateProject(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  const data = projectFromForm(formData);
  await prisma.project.update({ where: { id }, data });
  revalidatePath("/admin/projects");
  redirect("/admin/projects");
}

export async function deleteProject(formData: FormData) {
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.project.delete({ where: { id } });
  revalidatePath("/admin/projects");
}

// --- Settings ----------------------------------------------------------

export async function updateSettings(formData: FormData) {
  const num = Number(formData.get("defaultTaxRate"));
  const pad = Number(formData.get("numberPadding"));
  const str = (k: string) => String(formData.get(k) ?? "").trim() || null;
  const data = {
    companyName: String(formData.get("companyName") ?? "SOKATF SARL").trim() || "SOKATF SARL",
    logoUrl: str("logoUrl"),
    defaultTaxRate: Number.isFinite(num) ? num : 18,
    paymentTerms: str("paymentTerms"),
    bankDetails: str("bankDetails"),
    documentFooter: str("documentFooter"),
    quotePrefix: String(formData.get("quotePrefix") ?? "Devis").trim() || "Devis",
    invoicePrefix: String(formData.get("invoicePrefix") ?? "Facture").trim() || "Facture",
    numberIncludeMonth: formData.get("numberIncludeMonth") === "on",
    numberPadding: Number.isFinite(pad) && pad >= 1 && pad <= 8 ? pad : 4,
  };
  await prisma.setting.upsert({
    where: { id: "singleton" },
    create: { id: "singleton", ...data },
    update: data,
  });
  revalidatePath("/admin/parametres");
}

// --- Clients (carnet d'adresses) ---------------------------------------

function clientFromForm(fd: FormData) {
  return {
    name: String(fd.get("name") ?? "").trim(),
    company: String(fd.get("company") ?? "").trim() || null,
    email: String(fd.get("email") ?? "").trim() || null,
    phone: String(fd.get("phone") ?? "").trim() || null,
    address: String(fd.get("address") ?? "").trim() || null,
  };
}

export async function createClient(fd: FormData) {
  const data = clientFromForm(fd);
  if (!data.name) return;
  await prisma.client.create({ data });
  revalidatePath("/admin/clients");
}

export async function updateClient(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  if (!id) return;
  await prisma.client.update({ where: { id }, data: clientFromForm(fd) });
  revalidatePath("/admin/clients");
}

export async function deleteClient(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  if (!id) return;
  await prisma.client.delete({ where: { id } });
  revalidatePath("/admin/clients");
}

// --- Users (admin only — enforced by middleware) -----------------------

export async function createUser(fd: FormData) {
  const name = String(fd.get("name") ?? "").trim();
  const email = String(fd.get("email") ?? "").trim().toLowerCase();
  const password = String(fd.get("password") ?? "");
  const role = String(fd.get("role") ?? "commercial");
  if (!name || !email || password.length < 4) return;
  try {
    await prisma.user.create({
      data: {
        name,
        email,
        role: ROLES.includes(role as Role) ? role : "commercial",
        passwordHash: hashPassword(password),
        active: true,
      },
    });
  } catch {
    // ignore duplicate email
  }
  revalidatePath("/admin/utilisateurs");
}

export async function updateUser(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  if (!id) return;
  const role = String(fd.get("role") ?? "commercial");
  const password = String(fd.get("password") ?? "");
  const data: { name: string; role: string; active: boolean; passwordHash?: string } = {
    name: String(fd.get("name") ?? "").trim() || "Utilisateur",
    role: ROLES.includes(role as Role) ? role : "commercial",
    active: fd.get("active") === "on",
  };
  if (password.length >= 4) data.passwordHash = hashPassword(password);
  await prisma.user.update({ where: { id }, data });
  revalidatePath("/admin/utilisateurs");
}

export async function deleteUser(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  if (!id) return;
  await prisma.user.delete({ where: { id } });
  revalidatePath("/admin/utilisateurs");
}
