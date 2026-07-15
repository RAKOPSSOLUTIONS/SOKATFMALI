import { prisma } from "./prisma";

export type LineItem = { description: string; quantity: number; unitPrice: number };

export const QUOTE_STATUSES = ["DRAFT", "SENT", "ACCEPTED", "REJECTED"] as const;
export const INVOICE_STATUSES = ["DRAFT", "SENT", "PARTIAL", "PAID", "OVERDUE", "CANCELLED"] as const;
export const PAYMENT_METHODS = ["Espèces", "Virement", "Chèque", "Mobile Money"] as const;

export const STATUS_STYLE: Record<string, string> = {
  DRAFT: "bg-surface-container-high text-on-surface-variant",
  SENT: "bg-tertiary-fixed text-on-tertiary-fixed",
  ACCEPTED: "bg-secondary-container text-on-secondary-container",
  REJECTED: "bg-error-container text-on-error-container",
  PARTIAL: "bg-tertiary-fixed text-on-tertiary-fixed",
  PAID: "bg-secondary-container text-on-secondary-container",
  OVERDUE: "bg-error-container text-on-error-container",
  CANCELLED: "bg-surface-container-high text-on-surface-variant",
};

export const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Brouillon",
  SENT: "Envoyé",
  ACCEPTED: "Accepté",
  REJECTED: "Refusé",
  PARTIAL: "Partiel",
  PAID: "Payé",
  OVERDUE: "En retard",
  CANCELLED: "Annulé",
};

/** SOKATF SARL company block for document headers. */
export const COMPANY = {
  name: "SOKATF SARL",
  tagline: "Commerce général multisectoriel au Mali",
  address: "Quartier Hamdallaye ACI 2000, Immeuble Assan Thiero — Bamako, Mali",
  phone: "(+223) 66 77 32 75 / 70 04 02 13",
  email: "contact@sokatf.com",
  nif: "084153962X",
  rccm: "MA.BKo-2026-B-1280",
};

export function parseItems(json: string | null | undefined): LineItem[] {
  try {
    const v = JSON.parse(json || "[]");
    if (!Array.isArray(v)) return [];
    return v
      .map((i) => ({
        description: String(i.description ?? ""),
        quantity: Number(i.quantity) || 0,
        unitPrice: Number(i.unitPrice) || 0,
      }))
      .filter((i) => i.description || i.quantity || i.unitPrice);
  } catch {
    return [];
  }
}

export function computeTotals(items: LineItem[], taxRate: number, discount: number) {
  const subtotal = items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
  const taxable = Math.max(0, subtotal - discount);
  const tax = taxable * (taxRate / 100);
  const total = taxable + tax;
  return { subtotal, discount, tax, total };
}

export function formatFCFA(n: number): string {
  const rounded = Math.round(n || 0);
  return new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(rounded) + " FCFA";
}

export function formatDate(d: Date | string | null | undefined): string {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
}

/** WhatsApp deep link (wa.me) with a prefilled message. */
export function waLink(phone: string | null | undefined, text: string): string {
  const digits = (phone || "").replace(/\D/g, "");
  const base = digits ? `https://wa.me/${digits}` : "https://wa.me/";
  return `${base}?text=${encodeURIComponent(text)}`;
}

/** Short message describing a document, for email/WhatsApp. */
export function docSummary(kind: "DEVIS" | "FACTURE", number: string, total: number, clientName: string): string {
  const label = kind === "DEVIS" ? "votre devis" : "votre facture";
  return `Bonjour ${clientName}, veuillez trouver ${label} ${number} d'un montant de ${formatFCFA(total)}. Cordialement, SOKATF SARL.`;
}

/** CSV field escaping (French Excel: ';' separator, BOM for accents). */
export function csvEscape(v: unknown): string {
  const s = String(v ?? "");
  return /[";\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
}
export function toCSV(header: string[], rows: (string | number)[][]): string {
  const lines = [header.map(csvEscape).join(";"), ...rows.map((r) => r.map(csvEscape).join(";"))];
  return "﻿" + lines.join("\r\n");
}

/**
 * Next sequential document number in the format: "Devis - 26-01-0077"
 * (label - YY-MM-NNNN). The sequence runs per year (continuous across months);
 * the month reflects the creation date.
 */
export async function nextNumber(kind: "DEV" | "FAC"): Promise<string> {
  const now = new Date();
  const yy = String(now.getFullYear()).slice(-2);
  const mm = String(now.getMonth() + 1).padStart(2, "0");
  const label = kind === "DEV" ? "Devis" : "Facture";
  const yearPrefix = `${label} - ${yy}-`;
  const count =
    kind === "DEV"
      ? await prisma.quote.count({ where: { number: { startsWith: yearPrefix } } })
      : await prisma.invoice.count({ where: { number: { startsWith: yearPrefix } } });
  return `${label} - ${yy}-${mm}-${String(count + 1).padStart(4, "0")}`;
}
