import { betaZodTool } from "@anthropic-ai/sdk/helpers/beta/zod";
import { z } from "zod/v4";
import { prisma } from "@/lib/prisma";
import { computeTotals, parseItems, formatFCFA, nextNumber, COMPANY } from "@/lib/finance";
import { buildXlsx } from "@/lib/xlsx";
import { logActivity } from "@/lib/activity";
import { DOCS } from "@/lib/orgDocs";

export type Artifact = { kind: "pdf" | "excel"; label: string; url?: string; dataUri?: string };
export type ToolCtx = { actorEmail?: string; actorName?: string; artifacts: Artifact[] };

const XLSX_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
const lineItem = z.object({
  description: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
});

/** Build the full tool set for the assistant, bound to a request context. */
export function buildTools(ctx: ToolCtx) {
  const log = (action: Parameters<typeof logActivity>[0]["action"], entity: string, entityId: string | null, detail: string) =>
    logActivity({ action, entity, entityId, detail: `[Assistant] ${detail}`, actorEmail: ctx.actorEmail, actorName: ctx.actorName });

  return [
    /* ── Read: business KPIs ───────────────────────────────────────────── */
    betaZodTool({
      name: "get_stats",
      description: "Vue d'ensemble chiffrée de l'entreprise : CA facturé, encaissé, impayés, nombre de devis/factures/clients/prospects, et top clients. À utiliser pour toute question sur la santé financière ou l'activité.",
      inputSchema: z.object({}),
      run: async () => {
        const [invoices, quotesCount, clientsCount, leadsCount, catalogCount] = await Promise.all([
          prisma.invoice.findMany({ include: { payments: true } }),
          prisma.quote.count(),
          prisma.client.count(),
          prisma.lead.count(),
          prisma.catalogItem.count(),
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
        const topClients = [...byClient.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5)
          .map(([name, t]) => ({ name, facture: formatFCFA(t) }));
        return JSON.stringify({
          caFacture: formatFCFA(billed), encaisse: formatFCFA(collected), impayes: formatFCFA(outstanding),
          nbFactures: invoices.length, nbDevis: quotesCount, nbClients: clientsCount, nbProspects: leadsCount, nbArticles: catalogCount,
          topClients,
        });
      },
    }),

    /* ── Read: list / search records ───────────────────────────────────── */
    betaZodTool({
      name: "list_records",
      description: "Lister ou rechercher des enregistrements. entity: clients | quotes(devis) | invoices(factures) | leads(prospects) | products(produits) | services | payments | users. 'query' filtre par nom/numéro. Renvoie les champs clés (dont l'id, utile pour les autres outils).",
      inputSchema: z.object({
        entity: z.enum(["clients", "quotes", "invoices", "leads", "products", "services", "payments", "users"]),
        query: z.string().optional(),
        limit: z.number().optional(),
      }),
      run: async ({ entity, query, limit }) => {
        const take = Math.min(limit ?? 25, 100);
        const q = (query ?? "").trim();
        switch (entity) {
          case "clients": {
            const rows = await prisma.client.findMany({ where: q ? { OR: [{ name: { contains: q } }, { company: { contains: q } }, { email: { contains: q } }] } : undefined, take, orderBy: { name: "asc" } });
            return JSON.stringify(rows.map((c) => ({ id: c.id, name: c.name, company: c.company, email: c.email, phone: c.phone })));
          }
          case "quotes":
          case "invoices": {
            const model = entity === "quotes" ? prisma.quote : prisma.invoice;
            const rows = await (model as typeof prisma.quote).findMany({ where: q ? { OR: [{ number: { contains: q } }, { clientName: { contains: q } }] } : undefined, take, orderBy: { createdAt: "desc" } });
            return JSON.stringify(rows.map((r) => {
              const { total } = computeTotals(parseItems(r.items), r.taxRate, r.discount);
              return { id: r.id, number: r.number, client: r.clientName, status: r.status, total: formatFCFA(total), date: r.date.toISOString().slice(0, 10) };
            }));
          }
          case "leads": {
            const rows = await prisma.lead.findMany({ where: q ? { OR: [{ name: { contains: q } }, { company: { contains: q } }, { email: { contains: q } }] } : undefined, take, orderBy: { createdAt: "desc" } });
            return JSON.stringify(rows.map((l) => ({ id: l.id, type: l.type, status: l.status, name: l.name, email: l.email, company: l.company, message: l.message.slice(0, 140) })));
          }
          case "products":
          case "services": {
            const rows = await prisma.catalogItem.findMany({ where: { kind: entity === "products" ? "PRODUCT" : "SERVICE", ...(q ? { name: { contains: q } } : {}) }, take, orderBy: { name: "asc" } });
            return JSON.stringify(rows.map((i) => ({ id: i.id, name: i.name, unit: i.unit, price: i.price, reference: i.reference, active: i.active })));
          }
          case "payments": {
            const rows = await prisma.payment.findMany({ take, orderBy: { date: "desc" }, include: { invoice: { select: { number: true, clientName: true } } } });
            return JSON.stringify(rows.map((p) => ({ id: p.id, amount: p.amount, method: p.method, date: p.date.toISOString().slice(0, 10), invoice: p.invoice.number, client: p.invoice.clientName })));
          }
          case "users": {
            const rows = await prisma.user.findMany({ take, orderBy: { createdAt: "asc" } });
            return JSON.stringify(rows.map((u) => ({ id: u.id, name: u.name, email: u.email, role: u.role, active: u.active })));
          }
        }
      },
    }),

    /* ── Read: one record in full ──────────────────────────────────────── */
    betaZodTool({
      name: "get_record",
      description: "Détail complet d'un enregistrement par id. entity: client | quote | invoice | lead | catalog.",
      inputSchema: z.object({ entity: z.enum(["client", "quote", "invoice", "lead", "catalog"]), id: z.string() }),
      run: async ({ entity, id }) => {
        if (entity === "client") return JSON.stringify(await prisma.client.findUnique({ where: { id } }));
        if (entity === "lead") return JSON.stringify(await prisma.lead.findUnique({ where: { id } }));
        if (entity === "catalog") return JSON.stringify(await prisma.catalogItem.findUnique({ where: { id } }));
        if (entity === "quote") return JSON.stringify(await prisma.quote.findUnique({ where: { id } }));
        return JSON.stringify(await prisma.invoice.findUnique({ where: { id }, include: { payments: true } }));
      },
    }),

    /* ── Clients CRUD ──────────────────────────────────────────────────── */
    betaZodTool({
      name: "create_client",
      description: "Créer un client dans le carnet d'adresses.",
      inputSchema: z.object({ name: z.string(), company: z.string().optional(), email: z.string().optional(), phone: z.string().optional(), address: z.string().optional() }),
      run: async (i) => {
        const c = await prisma.client.create({ data: { name: i.name, company: i.company ?? null, email: i.email ?? null, phone: i.phone ?? null, address: i.address ?? null } });
        await log("CREATE", "Client", c.id, `Client « ${c.name} » créé`);
        return JSON.stringify({ ok: true, id: c.id });
      },
    }),
    betaZodTool({
      name: "update_client",
      description: "Modifier un client existant (fournir l'id + les champs à changer).",
      inputSchema: z.object({ id: z.string(), name: z.string().optional(), company: z.string().optional(), email: z.string().optional(), phone: z.string().optional(), address: z.string().optional() }),
      run: async ({ id, ...i }) => {
        await prisma.client.update({ where: { id }, data: i });
        await log("UPDATE", "Client", id, `Client mis à jour`);
        return JSON.stringify({ ok: true });
      },
    }),
    betaZodTool({
      name: "delete_client",
      description: "Supprimer un client. Action irréversible — confirmer avec l'utilisateur avant d'appeler.",
      inputSchema: z.object({ id: z.string() }),
      run: async ({ id }) => {
        const c = await prisma.client.findUnique({ where: { id }, select: { name: true } });
        await prisma.client.delete({ where: { id } });
        await log("DELETE", "Client", id, `Client « ${c?.name ?? id} » supprimé`);
        return JSON.stringify({ ok: true });
      },
    }),

    /* ── Catalogue CRUD ────────────────────────────────────────────────── */
    betaZodTool({
      name: "create_catalog_item",
      description: "Créer un produit ou service dans le catalogue.",
      inputSchema: z.object({ kind: z.enum(["PRODUCT", "SERVICE"]), name: z.string(), price: z.number(), unit: z.string().optional(), reference: z.string().optional(), category: z.string().optional(), description: z.string().optional() }),
      run: async (i) => {
        const it = await prisma.catalogItem.create({ data: { kind: i.kind, name: i.name, price: i.price, unit: i.unit ?? "unité", reference: i.reference ?? null, category: i.category ?? null, description: i.description ?? null, active: true } });
        await log("CREATE", "CatalogItem", it.id, `${i.kind === "SERVICE" ? "Service" : "Produit"} « ${i.name} » créé`);
        return JSON.stringify({ ok: true, id: it.id });
      },
    }),
    betaZodTool({
      name: "update_catalog_item",
      description: "Modifier un article du catalogue (id + champs).",
      inputSchema: z.object({ id: z.string(), name: z.string().optional(), price: z.number().optional(), unit: z.string().optional(), reference: z.string().optional(), category: z.string().optional(), active: z.boolean().optional() }),
      run: async ({ id, ...i }) => {
        await prisma.catalogItem.update({ where: { id }, data: i });
        await log("UPDATE", "CatalogItem", id, `Article catalogue mis à jour`);
        return JSON.stringify({ ok: true });
      },
    }),
    betaZodTool({
      name: "delete_catalog_item",
      description: "Supprimer un article du catalogue. Confirmer avant.",
      inputSchema: z.object({ id: z.string() }),
      run: async ({ id }) => {
        await prisma.catalogItem.delete({ where: { id } });
        await log("DELETE", "CatalogItem", id, `Article catalogue supprimé`);
        return JSON.stringify({ ok: true });
      },
    }),

    /* ── Devis / Factures + PDF ────────────────────────────────────────── */
    betaZodTool({
      name: "create_quote",
      description: "Créer un devis avec des lignes. Enregistre aussi le client dans le carnet. Renvoie le numéro et prépare le PDF téléchargeable.",
      inputSchema: z.object({
        clientName: z.string(), clientCompany: z.string().optional(), clientEmail: z.string().optional(), clientPhone: z.string().optional(), clientAddress: z.string().optional(),
        items: z.array(lineItem), taxRate: z.number().optional(), discount: z.number().optional(), notes: z.string().optional(), validUntil: z.string().optional(),
      }),
      run: async (i) => {
        const number = await nextNumber("DEV");
        const q = await prisma.quote.create({ data: {
          number, status: "DRAFT", clientName: i.clientName, clientCompany: i.clientCompany ?? null, clientEmail: i.clientEmail ?? null, clientPhone: i.clientPhone ?? null, clientAddress: i.clientAddress ?? null,
          items: JSON.stringify(i.items), taxRate: i.taxRate ?? 18, discount: i.discount ?? 0, notes: i.notes ?? null,
          validUntil: i.validUntil ? new Date(i.validUntil) : null,
        } });
        await ensureClient(i);
        await log("CREATE", "Quote", q.id, `Devis ${number} créé (${i.clientName})`);
        const { total } = computeTotals(i.items, q.taxRate, q.discount);
        ctx.artifacts.push({ kind: "pdf", label: `Devis ${number} (PDF)`, url: `/admin/devis/${q.id}/pdf` });
        return JSON.stringify({ ok: true, id: q.id, number, total: formatFCFA(total), pdf: `/admin/devis/${q.id}/pdf` });
      },
    }),
    betaZodTool({
      name: "create_invoice",
      description: "Créer une facture avec des lignes. Enregistre aussi le client. Renvoie le numéro et prépare le PDF téléchargeable.",
      inputSchema: z.object({
        clientName: z.string(), clientCompany: z.string().optional(), clientEmail: z.string().optional(), clientPhone: z.string().optional(), clientAddress: z.string().optional(),
        items: z.array(lineItem), taxRate: z.number().optional(), discount: z.number().optional(), notes: z.string().optional(), dueDate: z.string().optional(),
      }),
      run: async (i) => {
        const number = await nextNumber("FAC");
        const inv = await prisma.invoice.create({ data: {
          number, status: "DRAFT", clientName: i.clientName, clientCompany: i.clientCompany ?? null, clientEmail: i.clientEmail ?? null, clientPhone: i.clientPhone ?? null, clientAddress: i.clientAddress ?? null,
          items: JSON.stringify(i.items), taxRate: i.taxRate ?? 18, discount: i.discount ?? 0, notes: i.notes ?? null,
          dueDate: i.dueDate ? new Date(i.dueDate) : null,
        } });
        await ensureClient(i);
        await log("CREATE", "Invoice", inv.id, `Facture ${number} créée (${i.clientName})`);
        const { total } = computeTotals(i.items, inv.taxRate, inv.discount);
        ctx.artifacts.push({ kind: "pdf", label: `Facture ${number} (PDF)`, url: `/admin/factures/${inv.id}/pdf` });
        return JSON.stringify({ ok: true, id: inv.id, number, total: formatFCFA(total), pdf: `/admin/factures/${inv.id}/pdf` });
      },
    }),
    betaZodTool({
      name: "get_document_pdf",
      description: "Fournir le lien PDF téléchargeable d'un devis ou d'une facture existant(e).",
      inputSchema: z.object({ entity: z.enum(["quote", "invoice"]), id: z.string() }),
      run: async ({ entity, id }) => {
        const base = entity === "quote" ? "/admin/devis" : "/admin/factures";
        const rec = entity === "quote" ? await prisma.quote.findUnique({ where: { id }, select: { number: true } }) : await prisma.invoice.findUnique({ where: { id }, select: { number: true } });
        if (!rec) return JSON.stringify({ ok: false, error: "introuvable" });
        const url = `${base}/${id}/pdf`;
        ctx.artifacts.push({ kind: "pdf", label: `${entity === "quote" ? "Devis" : "Facture"} ${rec.number} (PDF)`, url });
        return JSON.stringify({ ok: true, pdf: url });
      },
    }),
    betaZodTool({
      name: "add_payment",
      description: "Enregistrer un paiement sur une facture.",
      inputSchema: z.object({ invoiceId: z.string(), amount: z.number(), method: z.string().optional(), note: z.string().optional() }),
      run: async (i) => {
        await prisma.payment.create({ data: { invoiceId: i.invoiceId, amount: i.amount, method: i.method ?? "Espèces", note: i.note ?? null } });
        await log("PAYMENT", "Invoice", i.invoiceId, `Paiement ${formatFCFA(i.amount)} enregistré`);
        return JSON.stringify({ ok: true });
      },
    }),

    /* ── Excel report ──────────────────────────────────────────────────── */
    betaZodTool({
      name: "generate_excel_report",
      description: "Générer un rapport Excel (.xlsx) téléchargeable. report: invoices | quotes | clients | payments | catalog | leads. Renvoie un fichier prêt à télécharger.",
      inputSchema: z.object({ report: z.enum(["invoices", "quotes", "clients", "payments", "catalog", "leads"]) }),
      run: async ({ report }) => {
        let columns: string[] = [], rows: (string | number)[][] = [], sheet = report;
        if (report === "invoices" || report === "quotes") {
          const recs = report === "invoices"
            ? await prisma.invoice.findMany({ orderBy: { date: "desc" }, include: { payments: true } })
            : await prisma.quote.findMany({ orderBy: { date: "desc" } });
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
        const buf = await buildXlsx({ sheet, columns, rows });
        const filename = `${report}-sokatf.xlsx`;
        ctx.artifacts.push({ kind: "excel", label: `Rapport ${report} (${rows.length} lignes)`, dataUri: `data:${XLSX_MIME};base64,${buf.toString("base64")}`, url: filename });
        return JSON.stringify({ ok: true, report, lignes: rows.length });
      },
    }),

    /* ── Documentation search (RAG) ────────────────────────────────────── */
    betaZodTool({
      name: "search_documentation",
      description: "Rechercher dans les documents d'organisation de l'entreprise (organigramme, règlement, politiques, business plan, KPI, etc.). Renvoie les passages pertinents. À utiliser pour toute question sur les procédures, l'organisation ou les politiques internes.",
      inputSchema: z.object({ query: z.string() }),
      run: async ({ query }) => {
        const terms = query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
        const results: { doc: string; title: string; snippet: string; score: number }[] = [];
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
            const idx = terms.map((t) => joined.toLowerCase().indexOf(t)).filter((n) => n >= 0).sort((a, b) => a - b)[0] ?? 0;
            results.push({ doc: doc.slug, title: doc.title, snippet: joined.slice(Math.max(0, idx - 80), idx + 400), score });
          }
        }
        results.sort((a, b) => b.score - a.score);
        return JSON.stringify(results.slice(0, 4).map((r) => ({ document: r.title, extrait: r.snippet })));
      },
    }),
  ];
}

/** Upsert a client into the address book from a document's client fields. */
async function ensureClient(i: { clientName: string; clientCompany?: string; clientEmail?: string; clientPhone?: string; clientAddress?: string }) {
  const existing = i.clientEmail
    ? await prisma.client.findFirst({ where: { email: i.clientEmail } })
    : await prisma.client.findFirst({ where: { name: i.clientName } });
  const data = { name: i.clientName, company: i.clientCompany ?? null, email: i.clientEmail ?? null, phone: i.clientPhone ?? null, address: i.clientAddress ?? null };
  if (existing) await prisma.client.update({ where: { id: existing.id }, data });
  else await prisma.client.create({ data });
}

export const COMPANY_NAME = COMPANY.name;
