/**
 * SOKATF SARL — database seeder.
 *
 * Idempotent: safe to run repeatedly (upserts on unique keys; finance demo
 * data is keyed by document number, payments are rebuilt per seeded invoice).
 *
 *   pnpm --filter @sokatf/api db:seed
 *
 * Demo user passwords can be overridden with env vars (see USERS below);
 * otherwise sensible defaults are used and printed at the end.
 */
import { PrismaClient } from "@prisma/client";
import { SECTORS } from "../src/lib/sectors-data";
import { hashPassword } from "../src/lib/password";
import { ORG } from "../src/lib/orgDocs";

const prisma = new PrismaClient();

// ── date helpers (relative, so demo statuses stay realistic over time) ──────
const DAY = 86_400_000;
const daysAgo = (n: number) => new Date(Date.now() - n * DAY);
const daysAhead = (n: number) => new Date(Date.now() + n * DAY);
const YY = String(new Date().getFullYear()).slice(-2);
const docNo = (prefix: string, mm: string, seq: number) =>
  `${prefix} - ${YY}-${mm}-${String(seq).padStart(4, "0")}`;
const items = (rows: [string, number, number][]) =>
  JSON.stringify(rows.map(([description, quantity, unitPrice]) => ({ description, quantity, unitPrice })));

// ── 1. Settings (singleton) ─────────────────────────────────────────────────
async function seedSettings() {
  const data = {
    companyName: "SOKATF SARL",
    defaultTaxRate: 18,
    paymentTerms:
      "Règlement à 30 jours date de facture. Tout retard de paiement pourra entraîner des pénalités conformément à la réglementation en vigueur.",
    bankDetails:
      "Banque : BDM-SA — Bamako\nCompte : ML000 0000 0000 0000 0000\nMobile Money (Orange Money) : (+223) 66 77 32 75",
    documentFooter: "SOKATF SARL — Commerce général multisectoriel. Merci de votre confiance.",
    quotePrefix: "Devis",
    invoicePrefix: "Facture",
    numberIncludeMonth: true,
    numberPadding: 4,
  };
  await prisma.setting.upsert({ where: { id: "singleton" }, update: data, create: { id: "singleton", ...data } });
  console.log("✓ Paramètres (singleton)");
}

// ── 2. Users (back-office, one per role) ────────────────────────────────────
async function seedUsers() {
  const USERS = [
    { name: ORG.pdg, email: "admin@sokatf.com", role: "admin", pw: process.env.SEED_ADMIN_PASSWORD || "Admin@2026" },
    { name: ORG.finrh, email: "comptable@sokatf.com", role: "comptable", pw: process.env.SEED_COMPTABLE_PASSWORD || "Compta@2026" },
    { name: ORG.dga, email: "commercial@sokatf.com", role: "commercial", pw: process.env.SEED_COMMERCIAL_PASSWORD || "Commercial@2026" },
  ];
  for (const u of USERS) {
    await prisma.user.upsert({
      where: { email: u.email },
      update: { name: u.name, role: u.role, active: true },
      // only (re)set the password on create, so a rerun never clobbers a changed one
      create: { name: u.name, email: u.email, role: u.role, active: true, passwordHash: hashPassword(u.pw) },
    });
  }
  console.log("✓ Utilisateurs (admin / comptable / commercial)");
  return USERS;
}

// ── 3. Sectors ──────────────────────────────────────────────────────────────
async function seedSectors() {
  for (const s of SECTORS) {
    await prisma.sector.upsert({ where: { slug: s.slug }, update: { ...s }, create: { ...s } });
  }
  console.log(`✓ Secteurs (${SECTORS.length})`);
}

// ── 4. Projects (Mali context, commerce général au cœur) ────────────────────
async function seedProjects() {
  const projects = [
    {
      slug: "approvisionnement-multiproduits-bamako",
      title: "Approvisionnement multi-produits — Bamako",
      sector: "commerce-general",
      description:
        "Contrat-cadre d'approvisionnement en fournitures, matériels et consommables pour une administration à Bamako : sourcing, importation et livraison multi-secteurs.",
      location: "Bamako, Mali",
      year: 2026,
      status: "IN_PROGRESS",
      featured: true,
    },
    {
      slug: "fourniture-materiaux-btp-aci2000",
      title: "Fourniture de matériaux BTP — ACI 2000",
      sector: "btp-construction",
      description:
        "Fourniture et logistique de matériaux de construction pour un chantier d'immeuble à Hamdallaye ACI 2000.",
      location: "Bamako, Mali",
      year: 2025,
      status: "COMPLETED",
      featured: true,
    },
    {
      slug: "gardiennage-site-industriel-sotuba",
      title: "Dispositif de gardiennage — Sotuba",
      sector: "securite-gardiennage",
      description:
        "Déploiement d'un dispositif de gardiennage et de surveillance 24/7 pour un site industriel de la zone de Sotuba.",
      location: "Bamako, Mali",
      year: 2025,
      status: "COMPLETED",
      featured: false,
    },
    {
      slug: "distribution-produits-petroliers-kayes",
      title: "Distribution de produits pétroliers — Kayes",
      sector: "produits-petroliers",
      description:
        "Logistique et distribution de produits pétroliers raffinés vers plusieurs points de vente de la région de Kayes.",
      location: "Kayes, Mali",
      year: 2026,
      status: "IN_PROGRESS",
      featured: false,
    },
    {
      slug: "plateforme-si-cooperative-segou",
      title: "Plateforme SI & réseau — coopérative de Ségou",
      sector: "informatique",
      description:
        "Mise en place d'une plateforme de gestion et de traçabilité, avec réseau et équipements, pour une coopérative agricole de Ségou.",
      location: "Ségou, Mali",
      year: 2025,
      status: "COMPLETED",
      featured: false,
    },
  ];
  for (const p of projects) {
    await prisma.project.upsert({ where: { slug: p.slug }, update: { ...p }, create: { ...p } });
  }
  console.log(`✓ Projets (${projects.length})`);
}

// ── 5. Leads (prospects) ────────────────────────────────────────────────────
async function seedLeads() {
  const leads = [
    {
      type: "QUOTE",
      status: "NEW",
      name: "Aminata Diarra",
      email: "a.diarra@example.ml",
      phone: "(+223) 76 12 34 56",
      company: "Établissements Diarra & Fils",
      sector: "commerce-general",
      budget: "10-50M FCFA",
      message: "Nous cherchons un fournisseur pour l'approvisionnement régulier de fournitures et consommables.",
      source: "/contact",
    },
    {
      type: "CONTACT",
      status: "IN_PROGRESS",
      name: "Ibrahim Coulibaly",
      email: "i.coulibaly@example.ml",
      phone: "(+223) 65 98 76 54",
      company: "Mairie de la Commune IV",
      sector: "prestations-de-services",
      message: "Demande d'information sur vos prestations de services techniques et de nettoyage de locaux.",
      source: "/services",
    },
    {
      type: "QUOTE",
      status: "CLOSED",
      name: "Fatoumata Keïta",
      email: "f.keita@example.ml",
      phone: "(+223) 70 11 22 33",
      company: "Agro Sahel SA",
      sector: "btp-construction",
      budget: "50-100M FCFA",
      message: "Devis pour la fourniture de matériaux de construction d'un entrepôt de 1 500 m².",
      source: "/commerce-general",
    },
  ];
  for (const l of leads) {
    const existing = await prisma.lead.findFirst({ where: { email: l.email, name: l.name } });
    if (existing) await prisma.lead.update({ where: { id: existing.id }, data: l });
    else await prisma.lead.create({ data: l });
  }
  console.log(`✓ Prospects (${leads.length})`);
}

// ── 6. Clients (carnet d'adresses) ──────────────────────────────────────────
async function seedClients() {
  const clients = [
    { name: "Aminata Diarra", company: "Établissements Diarra & Fils", email: "a.diarra@example.ml", phone: "(+223) 76 12 34 56", address: "Marché de Médine, Bamako, Mali" },
    { name: "Agro Sahel SA", company: "Agro Sahel SA", email: "contact@agrosahel.ml", phone: "(+223) 20 22 44 66", address: "Zone industrielle, Ségou, Mali" },
    { name: "Mairie de la Commune IV", company: "Commune IV du District de Bamako", email: "contact@communeiv.ml", phone: "(+223) 20 29 30 31", address: "Lafiabougou, Bamako, Mali" },
    { name: "Sahel Petroleum", company: "Sahel Petroleum SARL", email: "achats@sahelpetro.ml", phone: "(+223) 21 32 43 54", address: "Kayes, Mali" },
  ];
  for (const c of clients) {
    const existing = await prisma.client.findFirst({ where: { email: c.email } });
    if (existing) await prisma.client.update({ where: { id: existing.id }, data: c });
    else await prisma.client.create({ data: c });
  }
  console.log(`✓ Clients (${clients.length})`);
}

// ── 6b. Catalogue (produits & services) ─────────────────────────────────────
async function seedCatalog() {
  const products = [
    { name: "Ciment CPA 45", unit: "tonne", price: 95_000, reference: "CIM-45", category: "btp-construction", description: "Ciment Portland artificiel classe 45." },
    { name: "Fer à béton Ø12", unit: "barre", price: 6_500, reference: "FER-12", category: "btp-construction", description: "Barre de fer à béton haute adhérence, 12 mm." },
    { name: "Gravier concassé", unit: "m³", price: 18_000, reference: "GRV-01", category: "btp-construction", description: "Gravier concassé pour béton." },
    { name: "Fournitures de bureau (lot)", unit: "lot", price: 1_250_000, reference: "BUR-LOT", category: "commerce-general", description: "Lot trimestriel de fournitures de bureau." },
    { name: "Consommables informatiques", unit: "lot", price: 185_000, reference: "INFO-CONS", category: "informatique", description: "Cartouches, câbles et petits consommables." },
    { name: "Carburant / gasoil (livraison)", unit: "litre", price: 815, reference: "PET-GO", category: "produits-petroliers", description: "Distribution de gasoil, prix indicatif au litre." },
  ];
  const services = [
    { name: "Gardiennage 24/7 (agent)", unit: "mois", price: 180_000, reference: "SEC-24", category: "securite-gardiennage", description: "Agent de sécurité, poste continu 24/7." },
    { name: "Nettoyage de locaux", unit: "mois", price: 450_000, reference: "NET-LOC", category: "nettoyage", description: "Prestation d'entretien et nettoyage de locaux." },
    { name: "Transport & logistique", unit: "forfait", price: 150_000, reference: "LOG-01", category: "commerce-general", description: "Transport et logistique de marchandises." },
    { name: "Prestation informatique (jour/homme)", unit: "jour", price: 120_000, reference: "IT-JH", category: "informatique", description: "Intervention technique, installation ou maintenance." },
    { name: "Restauration collective (couvert)", unit: "unité", price: 2_500, reference: "RES-CVT", category: "restauration", description: "Repas en restauration collective, par couvert." },
  ];
  const all = [
    ...products.map((p) => ({ ...p, kind: "PRODUCT" as const })),
    ...services.map((s) => ({ ...s, kind: "SERVICE" as const })),
  ];
  for (const it of all) {
    const existing = await prisma.catalogItem.findFirst({ where: { kind: it.kind, name: it.name } });
    if (existing) await prisma.catalogItem.update({ where: { id: existing.id }, data: { ...it, active: true } });
    else await prisma.catalogItem.create({ data: { ...it, active: true } });
  }
  console.log(`✓ Catalogue (${products.length} produits + ${services.length} services)`);
}

// ── 7. Quotes (devis) ───────────────────────────────────────────────────────
async function seedQuotes() {
  const quotes = [
    {
      number: docNo("Devis", "06", 1),
      status: "ACCEPTED",
      clientName: "Aminata Diarra",
      clientCompany: "Établissements Diarra & Fils",
      clientEmail: "a.diarra@example.ml",
      clientPhone: "(+223) 76 12 34 56",
      clientAddress: "Marché de Médine, Bamako, Mali",
      date: daysAgo(35),
      validUntil: daysAgo(5),
      items: items([
        ["Fournitures de bureau (lot trimestriel)", 1, 1_250_000],
        ["Consommables informatiques", 3, 185_000],
        ["Transport & logistique", 1, 150_000],
      ]),
      taxRate: 18,
      discount: 50_000,
      notes: "Devis accepté — converti en facture.",
    },
    {
      number: docNo("Devis", "07", 2),
      status: "SENT",
      clientName: "Agro Sahel SA",
      clientCompany: "Agro Sahel SA",
      clientEmail: "contact@agrosahel.ml",
      clientPhone: "(+223) 20 22 44 66",
      clientAddress: "Zone industrielle, Ségou, Mali",
      date: daysAgo(6),
      validUntil: daysAhead(24),
      items: items([
        ["Ciment CPA 45 (tonne)", 40, 95_000],
        ["Fer à béton Ø12 (barre)", 300, 6_500],
        ["Gravier concassé (m³)", 60, 18_000],
      ]),
      taxRate: 18,
      discount: 0,
      notes: "Fourniture de matériaux pour entrepôt de 1 500 m².",
    },
    {
      number: docNo("Devis", "07", 3),
      status: "DRAFT",
      clientName: "Mairie de la Commune IV",
      clientCompany: "Commune IV du District de Bamako",
      clientEmail: "contact@communeiv.ml",
      clientPhone: "(+223) 20 29 30 31",
      clientAddress: "Lafiabougou, Bamako, Mali",
      date: daysAgo(1),
      validUntil: daysAhead(29),
      items: items([
        ["Prestation de nettoyage de locaux (mois)", 12, 450_000],
        ["Produits d'entretien (lot)", 12, 75_000],
      ]),
      taxRate: 18,
      discount: 0,
      notes: "Contrat annuel — brouillon en préparation.",
    },
  ];
  for (const q of quotes) {
    await prisma.quote.upsert({ where: { number: q.number }, update: q, create: q });
  }
  console.log(`✓ Devis (${quotes.length})`);
}

// ── 8. Invoices (factures) + payments ───────────────────────────────────────
async function seedInvoices() {
  const invoices: {
    inv: any;
    payments: { amount: number; date: Date; method: string; note?: string }[];
  }[] = [
    {
      inv: {
        number: docNo("Facture", "06", 1),
        status: "PAID",
        clientName: "Aminata Diarra",
        clientCompany: "Établissements Diarra & Fils",
        clientEmail: "a.diarra@example.ml",
        clientPhone: "(+223) 76 12 34 56",
        clientAddress: "Marché de Médine, Bamako, Mali",
        date: daysAgo(30),
        dueDate: daysAgo(0),
        items: items([
          ["Fournitures de bureau (lot trimestriel)", 1, 1_250_000],
          ["Consommables informatiques", 3, 185_000],
          ["Transport & logistique", 1, 150_000],
        ]),
        taxRate: 18,
        discount: 50_000,
        notes: "Facture soldée. Merci de votre confiance.",
      },
      payments: [{ amount: 2_183_900, date: daysAgo(12), method: "Virement", note: "Règlement intégral" }],
    },
    {
      inv: {
        number: docNo("Facture", "07", 2),
        status: "PARTIAL",
        clientName: "Sahel Petroleum",
        clientCompany: "Sahel Petroleum SARL",
        clientEmail: "achats@sahelpetro.ml",
        clientPhone: "(+223) 21 32 43 54",
        clientAddress: "Kayes, Mali",
        date: daysAgo(10),
        dueDate: daysAhead(20),
        items: items([
          ["Distribution produits pétroliers (livraison)", 4, 3_500_000],
          ["Frais de logistique", 1, 600_000],
        ]),
        taxRate: 18,
        discount: 0,
        notes: "Acompte reçu, solde à 30 jours.",
      },
      payments: [{ amount: 5_000_000, date: daysAgo(8), method: "Mobile Money", note: "Acompte" }],
    },
    {
      inv: {
        number: docNo("Facture", "07", 3),
        status: "SENT",
        clientName: "Agro Sahel SA",
        clientCompany: "Agro Sahel SA",
        clientEmail: "contact@agrosahel.ml",
        clientPhone: "(+223) 20 22 44 66",
        clientAddress: "Zone industrielle, Ségou, Mali",
        date: daysAgo(4),
        dueDate: daysAhead(26),
        items: items([
          ["Ciment CPA 45 (tonne)", 40, 95_000],
          ["Fer à béton Ø12 (barre)", 300, 6_500],
        ]),
        taxRate: 18,
        discount: 0,
        notes: "En attente de règlement.",
      },
      payments: [],
    },
    {
      inv: {
        number: docNo("Facture", "05", 4),
        status: "OVERDUE",
        clientName: "Mairie de la Commune IV",
        clientCompany: "Commune IV du District de Bamako",
        clientEmail: "contact@communeiv.ml",
        clientPhone: "(+223) 20 29 30 31",
        clientAddress: "Lafiabougou, Bamako, Mali",
        date: daysAgo(60),
        dueDate: daysAgo(15),
        items: items([
          ["Prestation de nettoyage de locaux (mois)", 2, 450_000],
          ["Produits d'entretien (lot)", 2, 75_000],
        ]),
        taxRate: 18,
        discount: 0,
        notes: "Échéance dépassée — relance envoyée.",
      },
      payments: [],
    },
  ];

  for (const { inv, payments } of invoices) {
    const record = await prisma.invoice.upsert({ where: { number: inv.number }, update: inv, create: inv });
    // rebuild payments so reruns stay idempotent
    await prisma.payment.deleteMany({ where: { invoiceId: record.id } });
    for (const p of payments) {
      await prisma.payment.create({ data: { ...p, invoiceId: record.id } });
    }
  }
  console.log(`✓ Factures (${invoices.length}) + paiements`);
}

// Opt-in clean slate: wipes seed-managed content (keeps Users & Settings so
// nobody gets locked out). Enable with SEED_RESET=1.
async function reset() {
  await prisma.payment.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.quote.deleteMany();
  await prisma.client.deleteMany();
  await prisma.catalogItem.deleteMany();
  await prisma.lead.deleteMany();
  await prisma.project.deleteMany();
  await prisma.sector.deleteMany();
  console.log("🧹 Reset: contenu de démo effacé (utilisateurs & paramètres conservés)");
}

async function main() {
  console.log("\n🌱 Seeding SOKATF SARL…\n");
  if (process.env.SEED_RESET === "1") await reset();
  await seedSettings();
  const users = await seedUsers();
  await seedSectors();
  await seedProjects();
  await seedLeads();
  await seedClients();
  await seedCatalog();
  await seedQuotes();
  await seedInvoices();

  const counts = {
    settings: await prisma.setting.count(),
    users: await prisma.user.count(),
    sectors: await prisma.sector.count(),
    projects: await prisma.project.count(),
    leads: await prisma.lead.count(),
    clients: await prisma.client.count(),
    catalog: await prisma.catalogItem.count(),
    quotes: await prisma.quote.count(),
    invoices: await prisma.invoice.count(),
    payments: await prisma.payment.count(),
  };
  console.log("\n📊 Totaux:", counts);

  console.log("\n🔑 Comptes de démonstration (à changer en production) :");
  for (const u of users) console.log(`   • ${u.role.padEnd(11)} ${u.email}  —  mot de passe : ${u.pw}`);
  console.log("");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
