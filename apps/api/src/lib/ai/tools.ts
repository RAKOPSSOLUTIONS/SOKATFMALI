import type OpenAI from "openai";
import { prisma } from "@/lib/prisma";
import { computeTotals, parseItems, formatFCFA, nextNumber, COMPANY } from "@/lib/finance";
import { buildXlsx } from "@/lib/xlsx";
import { logActivity } from "@/lib/activity";
import { DOCS } from "@/lib/orgDocs";

export type Artifact = { kind: "pdf" | "excel"; label: string; url?: string; dataUri?: string };
export type ToolCtx = { actorEmail?: string; actorName?: string; artifacts: Artifact[] };

export type Tool = {
  spec: OpenAI.Chat.Completions.ChatCompletionFunctionTool;
  run: (args: Record<string, unknown>) => Promise<string>;
};

const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const S = { type: "string" } as const;
const N = { type: "number" } as const;
const lineItems = {
  type: "array",
  description: "Lignes du document",
  items: {
    type: "object",
    properties: { description: S, quantity: N, unitPrice: N },
    required: ["description", "quantity", "unitPrice"],
    additionalProperties: false,
  },
} as const;

function fn(
  name: string,
  description: string,
  properties: Record<string, unknown>,
  required: string[],
  run: (a: Record<string, unknown>) => Promise<string>,
): Tool {
  return {
    spec: { type: "function", function: { name, description, parameters: { type: "object", properties, required, additionalProperties: false } } },
    run,
  };
}

/** Build the full tool set for the assistant, bound to a request context. */
export function buildTools(ctx: ToolCtx): Tool[] {
  const log = (action: Parameters<typeof logActivity>[0]["action"], entity: string, entityId: string | null, detail: string) =>
    logActivity({ action, entity, entityId, detail: `[Assistant] ${detail}`, actorEmail: ctx.actorEmail, actorName: ctx.actorName });

  return [
    fn("get_stats", "Vue d'ensemble chiffrée de l'entreprise : CA facturé, encaissé, impayés, nombre de devis/factures/clients/prospects, et top clients. À utiliser pour toute question sur la santé financière ou l'activité.", {}, [], async () => {
      const [invoices, quotesCount, clientsCount, leadsCount, catalogCount] = await Promise.all([
        prisma.invoice.findMany({ include: { payments: true } }),
        prisma.quote.count(), prisma.client.count(), prisma.lead.count(), prisma.catalogItem.count(),
      ]);
      let billed = 0, collected = 0, outstanding = 0;
      const byClient = new Map<string, number>();
      for (const inv of invoices) {
        if (inv.status === "CANCELLED") continue;
        const { total } = computeTotals(parseItems(inv.items), inv.taxRate, inv.discount);
        const paid = inv.payments.reduce((s, p) => s + p.amount, 0);
        collected += paid;
        if (inv.status !== "DRAFT") { billed += total; outstanding += Math.max(0, total - paid); }
        byClient.set(inv.clientName, (byClient.get(inv.clientName) ?? 0) + total);
      }
      const topClients = [...byClient.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5).map(([name, t]) => ({ name, facture: formatFCFA(t) }));
      return JSON.stringify({ caFacture: formatFCFA(billed), encaisse: formatFCFA(collected), impayes: formatFCFA(outstanding), nbFactures: invoices.length, nbDevis: quotesCount, nbClients: clientsCount, nbProspects: leadsCount, nbArticles: catalogCount, topClients });
    }),

    fn("list_records", "Lister ou rechercher des enregistrements. entity: clients | quotes(devis) | invoices(factures) | leads(prospects) | products | services | payments | users. 'query' filtre par nom/numéro. Renvoie les champs clés dont l'id.", {
      entity: { type: "string", enum: ["clients", "quotes", "invoices", "leads", "products", "services", "payments", "users"] },
      query: S, limit: N,
    }, ["entity"], async (a) => {
      const entity = String(a.entity);
      const take = Math.min(Number(a.limit) || 25, 100);
      const q = String(a.query ?? "").trim();
      if (entity === "clients") {
        const rows = await prisma.client.findMany({ where: q ? { OR: [{ name: { contains: q } }, { company: { contains: q } }, { email: { contains: q } }] } : undefined, take, orderBy: { name: "asc" } });
        return JSON.stringify(rows.map((c) => ({ id: c.id, name: c.name, company: c.company, email: c.email, phone: c.phone })));
      }
      if (entity === "quotes" || entity === "invoices") {
        const model = entity === "quotes" ? prisma.quote : prisma.invoice;
        const rows = await (model as typeof prisma.quote).findMany({ where: q ? { OR: [{ number: { contains: q } }, { clientName: { contains: q } }] } : undefined, take, orderBy: { createdAt: "desc" } });
        return JSON.stringify(rows.map((r) => { const { total } = computeTotals(parseItems(r.items), r.taxRate, r.discount); return { id: r.id, number: r.number, client: r.clientName, status: r.status, total: formatFCFA(total), date: r.date.toISOString().slice(0, 10) }; }));
      }
      if (entity === "leads") {
        const rows = await prisma.lead.findMany({ where: q ? { OR: [{ name: { contains: q } }, { company: { contains: q } }, { email: { contains: q } }] } : undefined, take, orderBy: { createdAt: "desc" } });
        return JSON.stringify(rows.map((l) => ({ id: l.id, type: l.type, status: l.status, name: l.name, email: l.email, company: l.company, message: l.message.slice(0, 140) })));
      }
      if (entity === "products" || entity === "services") {
        const rows = await prisma.catalogItem.findMany({ where: { kind: entity === "products" ? "PRODUCT" : "SERVICE", ...(q ? { name: { contains: q } } : {}) }, take, orderBy: { name: "asc" } });
        return JSON.stringify(rows.map((i) => ({ id: i.id, name: i.name, unit: i.unit, price: i.price, reference: i.reference, active: i.active })));
      }
      if (entity === "payments") {
        const rows = await prisma.payment.findMany({ take, orderBy: { date: "desc" }, include: { invoice: { select: { number: true, clientName: true } } } });
        return JSON.stringify(rows.map((p) => ({ id: p.id, amount: p.amount, method: p.method, date: p.date.toISOString().slice(0, 10), invoice: p.invoice.number, client: p.invoice.clientName })));
      }
      const rows = await prisma.user.findMany({ take, orderBy: { createdAt: "asc" } });
      return JSON.stringify(rows.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, active: u.active })));
    }),

    fn("get_record", "Détail complet d'un enregistrement par id. entity: client | quote | invoice | lead | catalog.", {
      entity: { type: "string", enum: ["client", "quote", "invoice", "lead", "catalog"] }, id: S,
    }, ["entity", "id"], async (a) => {
      const id = String(a.id);
      switch (String(a.entity)) {
        case "client": return JSON.stringify(await prisma.client.findUnique({ where: { id } }));
        case "lead": return JSON.stringify(await prisma.lead.findUnique({ where: { id } }));
        case "catalog": return JSON.stringify(await prisma.catalogItem.findUnique({ where: { id } }));
        case "quote": return JSON.stringify(await prisma.quote.findUnique({ where: { id } }));
        default: return JSON.stringify(await prisma.invoice.findUnique({ where: { id }, include: { payments: true } }));
      }
    }),

    fn("create_client", "Créer un client dans le carnet d'adresses.", { name: S, company: S, email: S, phone: S, address: S }, ["name"], async (a) => {
      const c = await prisma.client.create({ data: { name: String(a.name), company: (a.company as string) ?? null, email: (a.email as string) ?? null, phone: (a.phone as string) ?? null, address: (a.address as string) ?? null } });
      await log("CREATE", "Client", c.id, `Client « ${c.name} » créé`);
      return JSON.stringify({ ok: true, id: c.id });
    }),
    fn("update_client", "Modifier un client existant (id + champs à changer).", { id: S, name: S, company: S, email: S, phone: S, address: S }, ["id"], async (a) => {
      const { id, ...rest } = a as Record<string, string>;
      await prisma.client.update({ where: { id }, data: rest });
      await log("UPDATE", "Client", id, "Client mis à jour");
      return JSON.stringify({ ok: true });
    }),
    fn("delete_client", "Supprimer un client. Irréversible — confirmer avec l'utilisateur avant d'appeler.", { id: S }, ["id"], async (a) => {
      const id = String(a.id);
      const c = await prisma.client.findUnique({ where: { id }, select: { name: true } });
      await prisma.client.delete({ where: { id } });
      await log("DELETE", "Client", id, `Client « ${c?.name ?? id} » supprimé`);
      return JSON.stringify({ ok: true });
    }),

    fn("create_catalog_item", "Créer un produit ou service dans le catalogue.", { kind: { type: "string", enum: ["PRODUCT", "SERVICE"] }, name: S, price: N, unit: S, reference: S, category: S, description: S }, ["kind", "name", "price"], async (a) => {
      const it = await prisma.catalogItem.create({ data: { kind: String(a.kind), name: String(a.name), price: Number(a.price), unit: (a.unit as string) ?? "unité", reference: (a.reference as string) ?? null, category: (a.category as string) ?? null, description: (a.description as string) ?? null, active: true } });
      await log("CREATE", "CatalogItem", it.id, `${a.kind === "SERVICE" ? "Service" : "Produit"} « ${a.name} » créé`);
      return JSON.stringify({ ok: true, id: it.id });
    }),
    fn("update_catalog_item", "Modifier un article du catalogue (id + champs).", { id: S, name: S, price: N, unit: S, reference: S, category: S, active: { type: "boolean" } }, ["id"], async (a) => {
      const { id, ...rest } = a as Record<string, unknown>;
      await prisma.catalogItem.update({ where: { id: String(id) }, data: rest });
      await log("UPDATE", "CatalogItem", String(id), "Article catalogue mis à jour");
      return JSON.stringify({ ok: true });
    }),
    fn("delete_catalog_item", "Supprimer un article du catalogue. Confirmer avant.", { id: S }, ["id"], async (a) => {
      const id = String(a.id);
      await prisma.catalogItem.delete({ where: { id } });
      await log("DELETE", "CatalogItem", id, "Article catalogue supprimé");
      return JSON.stringify({ ok: true });
    }),

    fn("create_quote", "Créer un devis avec des lignes. Enregistre aussi le client. Prépare le PDF téléchargeable.", {
      clientName: S, clientCompany: S, clientEmail: S, clientPhone: S, clientAddress: S, items: lineItems, taxRate: N, discount: N, notes: S, validUntil: S,
    }, ["clientName", "items"], async (a) => {
      const i = a as any;
      const number = await nextNumber("DEV");
      const q = await prisma.quote.create({ data: { number, status: "DRAFT", clientName: i.clientName, clientCompany: i.clientCompany ?? null, clientEmail: i.clientEmail ?? null, clientPhone: i.clientPhone ?? null, clientAddress: i.clientAddress ?? null, items: JSON.stringify(i.items ?? []), taxRate: i.taxRate ?? 18, discount: i.discount ?? 0, notes: i.notes ?? null, validUntil: i.validUntil ? new Date(i.validUntil) : null } });
      await ensureClient(i);
      await log("CREATE", "Quote", q.id, `Devis ${number} créé (${i.clientName})`);
      const { total } = computeTotals(i.items ?? [], q.taxRate, q.discount);
      ctx.artifacts.push({ kind: "pdf", label: `Devis ${number} (PDF)`, url: `/admin/devis/${q.id}/pdf` });
      return JSON.stringify({ ok: true, id: q.id, number, total: formatFCFA(total), pdf: `/admin/devis/${q.id}/pdf` });
    }),
    fn("create_invoice", "Créer une facture avec des lignes. Enregistre aussi le client. Prépare le PDF téléchargeable.", {
      clientName: S, clientCompany: S, clientEmail: S, clientPhone: S, clientAddress: S, items: lineItems, taxRate: N, discount: N, notes: S, dueDate: S,
    }, ["clientName", "items"], async (a) => {
      const i = a as any;
      const number = await nextNumber("FAC");
      const inv = await prisma.invoice.create({ data: { number, status: "DRAFT", clientName: i.clientName, clientCompany: i.clientCompany ?? null, clientEmail: i.clientEmail ?? null, clientPhone: i.clientPhone ?? null, clientAddress: i.clientAddress ?? null, items: JSON.stringify(i.items ?? []), taxRate: i.taxRate ?? 18, discount: i.discount ?? 0, notes: i.notes ?? null, dueDate: i.dueDate ? new Date(i.dueDate) : null } });
      await ensureClient(i);
      await log("CREATE", "Invoice", inv.id, `Facture ${number} créée (${i.clientName})`);
      const { total } = computeTotals(i.items ?? [], inv.taxRate, inv.discount);
      ctx.artifacts.push({ kind: "pdf", label: `Facture ${number} (PDF)`, url: `/admin/factures/${inv.id}/pdf` });
      return JSON.stringify({ ok: true, id: inv.id, number, total: formatFCFA(total), pdf: `/admin/factures/${inv.id}/pdf` });
    }),
    fn("get_document_pdf", "Fournir le lien PDF d'un devis ou d'une facture existant(e).", { entity: { type: "string", enum: ["quote", "invoice"] }, id: S }, ["entity", "id"], async (a) => {
      const entity = String(a.entity), id = String(a.id);
      const base = entity === "quote" ? "/admin/devis" : "/admin/factures";
      const rec = entity === "quote" ? await prisma.quote.findUnique({ where: { id }, select: { number: true } }) : await prisma.invoice.findUnique({ where: { id }, select: { number: true } });
      if (!rec) return JSON.stringify({ ok: false, error: "introuvable" });
      const url = `${base}/${id}/pdf`;
      ctx.artifacts.push({ kind: "pdf", label: `${entity === "quote" ? "Devis" : "Facture"} ${rec.number} (PDF)`, url });
      return JSON.stringify({ ok: true, pdf: url });
    }),
    fn("add_payment", "Enregistrer un paiement sur une facture.", { invoiceId: S, amount: N, method: S, note: S }, ["invoiceId", "amount"], async (a) => {
      await prisma.payment.create({ data: { invoiceId: String(a.invoiceId), amount: Number(a.amount), method: (a.method as string) ?? "Espèces", note: (a.note as string) ?? null } });
      await log("PAYMENT", "Invoice", String(a.invoiceId), `Paiement ${formatFCFA(Number(a.amount))} enregistré`);
      return JSON.stringify({ ok: true });
    }),

    fn("generate_excel_report", "Générer un rapport Excel (.xlsx) téléchargeable. report: invoices | quotes | clients | payments | catalog | leads.", { report: { type: "string", enum: ["invoices", "quotes", "clients", "payments", "catalog", "leads"] } }, ["report"], async (a) => {
      const report = String(a.report);
      let columns: string[] = [], rows: (string | number)[][] = [];
      if (report === "invoices" || report === "quotes") {
        const recs = report === "invoices" ? await prisma.invoice.findMany({ orderBy: { date: "desc" }, include: { payments: true } }) : await prisma.quote.findMany({ orderBy: { date: "desc" } });
        columns = report === "invoices" ? ["Numéro", "Date", "Client", "Total TTC", "Payé", "Reste", "Statut"] : ["Numéro", "Date", "Client", "Total TTC", "Statut"];
        rows = recs.map((r: any) => {
          const { total } = computeTotals(parseItems(r.items), r.taxRate, r.discount);
          const paid = (r.payments ?? []).reduce((s: number, p: any) => s + p.amount, 0);
          const base = [r.number, r.date.toISOString().slice(0, 10), r.clientName];
          return report === "invoices" ? [...base, Math.round(total), Math.round(paid), Math.round(total - paid), r.status] : [...base, Math.round(total), r.status];
        });
      } else if (report === "clients") {
        const recs = await prisma.client.findMany({ orderBy: { name: "asc" } });
        columns = ["Nom", "Société", "Email", "Téléphone", "Adresse"];
        rows = recs.map((c) => [c.name, c.company ?? "", c.email ?? "", c.phone ?? "", c.address ?? ""]);
      } else if (report === "payments") {
        const recs = await prisma.payment.findMany({ orderBy: { date: "desc" }, include: { invoice: { select: { number: true, clientName: true } } } });
        columns = ["Date", "Facture", "Client", "Montant", "Méthode", "Note"];
        rows = recs.map((p) => [p.date.toISOString().slice(0, 10), p.invoice.number, p.invoice.clientName, Math.round(p.amount), p.method, p.note ?? ""]);
      } else if (report === "catalog") {
        const recs = await prisma.catalogItem.findMany({ orderBy: { name: "asc" } });
        columns = ["Désignation", "Type", "Référence", "Unité", "Prix", "Actif"];
        rows = recs.map((i) => [i.name, i.kind === "SERVICE" ? "Service" : "Produit", i.reference ?? "", i.unit, i.price, i.active ? "Oui" : "Non"]);
      } else {
        const recs = await prisma.lead.findMany({ orderBy: { createdAt: "desc" } });
        columns = ["Type", "Statut", "Nom", "Email", "Téléphone", "Société", "Message", "Date"];
        rows = recs.map((l) => [l.type, l.status, l.name, l.email, l.phone ?? "", l.company ?? "", l.message, new Date(l.createdAt).toLocaleString("fr-FR")]);
      }
      const buf = await buildXlsx({ sheet: report, columns, rows });
      ctx.artifacts.push({ kind: "excel", label: `Rapport ${report} (${rows.length} lignes)`, dataUri: `data:${XLSX_MIME};base64,${buf.toString("base64")}`, url: `${report}-sokatf.xlsx` });
      return JSON.stringify({ ok: true, report, lignes: rows.length });
    }),

    fn("search_documentation", "Rechercher dans les documents d'organisation (organigramme, règlement, politiques, business plan, KPI…). Renvoie les passages pertinents. À utiliser pour toute question sur les procédures, l'organisation ou les politiques internes.", { query: S }, ["query"], async (a) => {
      const terms = String(a.query).toLowerCase().split(/\s+/).filter((t) => t.length > 2);
      const results: { title: string; snippet: string; score: number }[] = [];
      for (const doc of DOCS) {
        const texts: string[] = [];
        for (const b of doc.blocks) {
          if (b.type === "p" || b.type === "h2") texts.push(b.text);
          else if (b.type === "ul" || b.type === "ol") texts.push(b.items.join(" "));
          else if (b.type === "table") texts.push([b.head.join(" "), ...b.rows.map((r) => r.join(" "))].join(" "));
          else if (b.type === "org") texts.push(b.levels.map((l) => `${l.role} ${l.name}`).join(" "));
        }
        const hay = (doc.title + " " + (doc.subtitle ?? "") + " " + texts.join(" ")).toLowerCase();
        const score = terms.reduce((s, t) => s + (hay.includes(t) ? 1 : 0), 0);
        if (score > 0) {
          const joined = texts.join(" \n");
          const idx = terms.map((t) => joined.toLowerCase().indexOf(t)).filter((n) => n >= 0).sort((x, y) => x - y)[0] ?? 0;
          results.push({ title: doc.title, snippet: joined.slice(Math.max(0, idx - 80), idx + 400), score });
        }
      }
      results.sort((a, b) => b.score - a.score);
      return JSON.stringify(results.slice(0, 4).map((r) => ({ document: r.title, extrait: r.snippet })));
    }),
  ];
}

async function ensureClient(i: { clientName: string; clientCompany?: string; clientEmail?: string; clientPhone?: string; clientAddress?: string }) {
  const existing = i.clientEmail ? await prisma.client.findFirst({ where: { email: i.clientEmail } }) : await prisma.client.findFirst({ where: { name: i.clientName } });
  const data = { name: i.clientName, company: i.clientCompany ?? null, email: i.clientEmail ?? null, phone: i.clientPhone ?? null, address: i.clientAddress ?? null };
  if (existing) await prisma.client.update({ where: { id: existing.id }, data });
  else await prisma.client.create({ data });
}

export const COMPANY_NAME = COMPANY.name;
