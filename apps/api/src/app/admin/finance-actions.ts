"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  QUOTE_STATUSES,
  INVOICE_STATUSES,
  PAYMENT_METHODS,
  computeTotals,
  parseItems,
  nextNumber,
  formatFCFA,
  docSummary,
  reminderText,
  type LineItem,
} from "@/lib/finance";
import { sendMail } from "@/lib/mailer";
import { renderDocumentPDF } from "@/lib/pdf";
import { getSettings } from "@/lib/settings";

function parseDate(v: FormDataEntryValue | null): Date | null {
  const s = String(v ?? "").trim();
  if (!s) return null;
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

function docFromForm(fd: FormData) {
  const num = (k: string) => {
    const n = Number(fd.get(k));
    return Number.isFinite(n) ? n : 0;
  };
  // Validate items JSON
  let items = "[]";
  try {
    const parsed = JSON.parse(String(fd.get("items") ?? "[]"));
    if (Array.isArray(parsed)) items = JSON.stringify(parsed);
  } catch {
    items = "[]";
  }
  return {
    clientName: String(fd.get("clientName") ?? "").trim() || "Client",
    clientCompany: String(fd.get("clientCompany") ?? "").trim() || null,
    clientEmail: String(fd.get("clientEmail") ?? "").trim() || null,
    clientPhone: String(fd.get("clientPhone") ?? "").trim() || null,
    clientAddress: String(fd.get("clientAddress") ?? "").trim() || null,
    items,
    taxRate: num("taxRate"),
    discount: num("discount"),
    notes: String(fd.get("notes") ?? "").trim() || null,
  };
}

/** Auto-add the document's client to the address book (deduplicated). */
async function ensureClient(d: ReturnType<typeof docFromForm>) {
  const name = d.clientName?.trim();
  if (!name || name === "Client") return;
  let existing = null;
  if (d.clientEmail) existing = await prisma.client.findFirst({ where: { email: d.clientEmail } });
  if (!existing) existing = await prisma.client.findFirst({ where: { name } });
  if (existing) return;
  await prisma.client.create({
    data: {
      name,
      company: d.clientCompany,
      email: d.clientEmail,
      phone: d.clientPhone,
      address: d.clientAddress,
    },
  });
  revalidatePath("/admin/clients");
}

// ---------------- Quotes (devis) ----------------

export async function createQuote(fd: FormData) {
  const data = docFromForm(fd);
  const number = await nextNumber("DEV");
  const q = await prisma.quote.create({
    data: {
      ...data,
      number,
      status: "DRAFT",
      date: parseDate(fd.get("date")) ?? new Date(),
      validUntil: parseDate(fd.get("validUntil")),
    },
  });
  await ensureClient(data);
  revalidatePath("/admin/devis");
  redirect(`/admin/devis/${q.id}`);
}

export async function updateQuote(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  if (!id) return;
  const data = docFromForm(fd);
  await prisma.quote.update({
    where: { id },
    data: {
      ...data,
      date: parseDate(fd.get("date")) ?? new Date(),
      validUntil: parseDate(fd.get("validUntil")),
    },
  });
  revalidatePath(`/admin/devis/${id}`);
  redirect(`/admin/devis/${id}`);
}

export async function setQuoteStatus(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  const status = String(fd.get("status") ?? "");
  if (!id || !QUOTE_STATUSES.includes(status as never)) return;
  await prisma.quote.update({ where: { id }, data: { status } });
  revalidatePath(`/admin/devis/${id}`);
  revalidatePath("/admin/devis");
}

export async function deleteQuote(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  if (!id) return;
  await prisma.quote.delete({ where: { id } });
  revalidatePath("/admin/devis");
  redirect("/admin/devis");
}

export async function convertQuoteToInvoice(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  if (!id) return;
  const q = await prisma.quote.findUnique({ where: { id } });
  if (!q) return;
  const number = await nextNumber("FAC");
  const due = new Date();
  due.setDate(due.getDate() + 30);
  const inv = await prisma.invoice.create({
    data: {
      number,
      status: "DRAFT",
      quoteId: q.id,
      clientName: q.clientName,
      clientCompany: q.clientCompany,
      clientEmail: q.clientEmail,
      clientPhone: q.clientPhone,
      clientAddress: q.clientAddress,
      items: q.items,
      taxRate: q.taxRate,
      discount: q.discount,
      notes: q.notes,
      date: new Date(),
      dueDate: due,
    },
  });
  await prisma.quote.update({ where: { id }, data: { status: "ACCEPTED" } });
  revalidatePath("/admin/factures");
  redirect(`/admin/factures/${inv.id}`);
}

// ---------------- Invoices (factures) ----------------

export async function createInvoice(fd: FormData) {
  const data = docFromForm(fd);
  const number = await nextNumber("FAC");
  const inv = await prisma.invoice.create({
    data: {
      ...data,
      number,
      status: "DRAFT",
      date: parseDate(fd.get("date")) ?? new Date(),
      dueDate: parseDate(fd.get("dueDate")),
    },
  });
  await ensureClient(data);
  revalidatePath("/admin/factures");
  redirect(`/admin/factures/${inv.id}`);
}

export async function updateInvoice(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  if (!id) return;
  const data = docFromForm(fd);
  await prisma.invoice.update({
    where: { id },
    data: {
      ...data,
      date: parseDate(fd.get("date")) ?? new Date(),
      dueDate: parseDate(fd.get("dueDate")),
    },
  });
  revalidatePath(`/admin/factures/${id}`);
  redirect(`/admin/factures/${id}`);
}

export async function setInvoiceStatus(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  const status = String(fd.get("status") ?? "");
  if (!id || !INVOICE_STATUSES.includes(status as never)) return;
  await prisma.invoice.update({ where: { id }, data: { status } });
  revalidatePath(`/admin/factures/${id}`);
  revalidatePath("/admin/factures");
}

export async function deleteInvoice(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  if (!id) return;
  await prisma.invoice.delete({ where: { id } });
  revalidatePath("/admin/factures");
  redirect("/admin/factures");
}

function idsFromForm(fd: FormData): string[] {
  return String(fd.get("ids") ?? "").split(",").map((s) => s.trim()).filter(Boolean);
}

export async function deleteQuotesBulk(fd: FormData) {
  const ids = idsFromForm(fd);
  if (!ids.length) return;
  await prisma.quote.deleteMany({ where: { id: { in: ids } } });
  revalidatePath("/admin/devis");
}

export async function deleteInvoicesBulk(fd: FormData) {
  const ids = idsFromForm(fd);
  if (!ids.length) return;
  await prisma.payment.deleteMany({ where: { invoiceId: { in: ids } } });
  await prisma.invoice.deleteMany({ where: { id: { in: ids } } });
  revalidatePath("/admin/factures");
}

// ---------------- Payments ----------------

async function refreshInvoiceStatus(invoiceId: string) {
  const inv = await prisma.invoice.findUnique({
    where: { id: invoiceId },
    include: { payments: true },
  });
  if (!inv) return;
  if (inv.status === "CANCELLED") return;
  const { total } = computeTotals(parseItems(inv.items), inv.taxRate, inv.discount);
  const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
  let status = inv.status;
  if (paid <= 0) status = inv.status === "DRAFT" ? "DRAFT" : "SENT";
  else if (paid + 0.5 >= total) status = "PAID";
  else status = "PARTIAL";
  await prisma.invoice.update({ where: { id: invoiceId }, data: { status } });
}

export async function addPayment(fd: FormData) {
  const invoiceId = String(fd.get("invoiceId") ?? "");
  const amount = Number(fd.get("amount"));
  const method = String(fd.get("method") ?? "Espèces");
  if (!invoiceId || !Number.isFinite(amount) || amount <= 0) return;
  await prisma.payment.create({
    data: {
      invoiceId,
      amount,
      method: PAYMENT_METHODS.includes(method as never) ? method : "Espèces",
      note: String(fd.get("note") ?? "").trim() || null,
      date: parseDate(fd.get("date")) ?? new Date(),
    },
  });
  await refreshInvoiceStatus(invoiceId);
  revalidatePath(`/admin/factures/${invoiceId}`);
  revalidatePath("/admin/finances");
}

export async function deletePayment(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  const invoiceId = String(fd.get("invoiceId") ?? "");
  if (!id) return;
  await prisma.payment.delete({ where: { id } });
  if (invoiceId) await refreshInvoiceStatus(invoiceId);
  revalidatePath(`/admin/factures/${invoiceId}`);
  revalidatePath("/admin/finances");
}

// ---------------- Email sending ----------------

function docEmailText(
  kind: "DEVIS" | "FACTURE",
  number: string,
  clientName: string,
  items: LineItem[],
  totals: { subtotal: number; tax: number; total: number },
) {
  const detail = items
    .map((i) => `- ${i.description} : ${i.quantity} × ${formatFCFA(i.unitPrice)} = ${formatFCFA(i.quantity * i.unitPrice)}`)
    .join("\n");
  return `${docSummary(kind, number, totals.total, clientName)}

Détail :
${detail}

Sous-total : ${formatFCFA(totals.subtotal)}
TVA : ${formatFCFA(totals.tax)}
Total TTC : ${formatFCFA(totals.total)}

SOKATF SARL — contact@sokatf.com`;
}

export async function sendQuoteEmail(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  if (!id) return;
  const q = await prisma.quote.findUnique({ where: { id } });
  if (!q || !q.clientEmail) return;
  const items = parseItems(q.items);
  const totals = computeTotals(items, q.taxRate, q.discount);
  const pdf = await renderDocumentPDF(q, "DEVIS", await getSettings(), 0);
  await sendMail({
    to: q.clientEmail,
    subject: `Devis ${q.number} — SOKATF SARL`,
    text: docEmailText("DEVIS", q.number, q.clientName, items, totals),
    attachments: [{ filename: `${q.number}.pdf`, content: pdf }],
  });
  if (q.status === "DRAFT") await prisma.quote.update({ where: { id }, data: { status: "SENT" } });
  revalidatePath(`/admin/devis/${id}`);
}

export async function sendInvoiceEmail(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  if (!id) return;
  const inv = await prisma.invoice.findUnique({ where: { id }, include: { payments: true } });
  if (!inv || !inv.clientEmail) return;
  const items = parseItems(inv.items);
  const totals = computeTotals(items, inv.taxRate, inv.discount);
  const paid = inv.payments.reduce((sum, p) => sum + p.amount, 0);
  const pdf = await renderDocumentPDF(inv, "FACTURE", await getSettings(), paid);
  await sendMail({
    to: inv.clientEmail,
    subject: `Facture ${inv.number} — SOKATF SARL`,
    text: docEmailText("FACTURE", inv.number, inv.clientName, items, totals),
    attachments: [{ filename: `${inv.number}.pdf`, content: pdf }],
  });
  if (inv.status === "DRAFT") await prisma.invoice.update({ where: { id }, data: { status: "SENT" } });
  revalidatePath(`/admin/factures/${id}`);
}

export async function duplicateQuote(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  if (!id) return;
  const q = await prisma.quote.findUnique({ where: { id } });
  if (!q) return;
  const number = await nextNumber("DEV");
  const copy = await prisma.quote.create({
    data: {
      number,
      status: "DRAFT",
      clientName: q.clientName,
      clientCompany: q.clientCompany,
      clientEmail: q.clientEmail,
      clientPhone: q.clientPhone,
      clientAddress: q.clientAddress,
      items: q.items,
      taxRate: q.taxRate,
      discount: q.discount,
      notes: q.notes,
      date: new Date(),
    },
  });
  revalidatePath("/admin/devis");
  redirect(`/admin/devis/${copy.id}`);
}

export async function duplicateInvoice(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  if (!id) return;
  const inv = await prisma.invoice.findUnique({ where: { id } });
  if (!inv) return;
  const number = await nextNumber("FAC");
  const due = new Date();
  due.setDate(due.getDate() + 30);
  const copy = await prisma.invoice.create({
    data: {
      number,
      status: "DRAFT",
      clientName: inv.clientName,
      clientCompany: inv.clientCompany,
      clientEmail: inv.clientEmail,
      clientPhone: inv.clientPhone,
      clientAddress: inv.clientAddress,
      items: inv.items,
      taxRate: inv.taxRate,
      discount: inv.discount,
      notes: inv.notes,
      date: new Date(),
      dueDate: due,
    },
  });
  revalidatePath("/admin/factures");
  redirect(`/admin/factures/${copy.id}`);
}

export async function sendInvoiceReminder(fd: FormData) {
  const id = String(fd.get("id") ?? "");
  if (!id) return;
  const inv = await prisma.invoice.findUnique({ where: { id }, include: { payments: true } });
  if (!inv || !inv.clientEmail) return;
  const { total } = computeTotals(parseItems(inv.items), inv.taxRate, inv.discount);
  const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
  const balance = total - paid;
  if (balance <= 0.5) return;
  const pdf = await renderDocumentPDF(inv, "FACTURE", await getSettings(), paid);
  await sendMail({
    to: inv.clientEmail,
    subject: `Rappel — Facture ${inv.number} — SOKATF SARL`,
    text: `${reminderText(inv.number, inv.clientName, balance)}

Total TTC : ${formatFCFA(total)}
Déjà réglé : ${formatFCFA(paid)}
Reste à payer : ${formatFCFA(balance)}`,
    attachments: [{ filename: `${inv.number}.pdf`, content: pdf }],
  });
  revalidatePath("/admin/finances");
  revalidatePath(`/admin/factures/${id}`);
}
