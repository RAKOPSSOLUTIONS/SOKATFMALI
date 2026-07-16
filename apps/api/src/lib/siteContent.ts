import { prisma } from "./prisma";

export type Stat = { value: string; label: string; icon: string };
export type Service = { title: string; icon: string; text: string };

export type SiteContentData = {
  heroEyebrow: string;
  heroTitle: string;
  heroTitleAccent: string;
  heroSubtitle: string;
  stats: Stat[];
  aboutEyebrow: string;
  aboutTitle: string;
  aboutText: string;
  contactCity: string;
  contactAddress: string;
  phoneDisplay: string;
  phoneTel: string;
  email: string;
  whatsapp: string;
  whatsappLink: string;
  nif: string;
  rccm: string;
  blurb: string;
  partners: string[];
  services: Service[];
};

/** Defaults mirror the current hard-coded homepage so the site is unchanged
 *  until the content is edited (and stays valid if the DB is unavailable). */
export const SITE_DEFAULTS: SiteContentData = {
  heroEyebrow: "Commerce Général · Import · Distribution",
  heroTitle: "Le Commerce Général",
  heroTitleAccent: "au Service du Mali",
  heroSubtitle:
    "Cœur de métier de SOKATF SARL, le commerce général irrigue tous les secteurs : nous importons, distribuons et négocions biens et équipements à travers toute l'économie malienne.",
  stats: [
    { value: "12+", label: "Années d'Expertise", icon: "military_tech" },
    { value: "450+", label: "Projets Livrés", icon: "task_alt" },
    { value: "80+", label: "Partenaires Mondiaux", icon: "handshake" },
    { value: "1.2k", label: "Collaborateurs", icon: "group" },
  ],
  aboutEyebrow: "Notre Institution",
  aboutTitle: "Le Commerce Général, Notre Cœur de Métier",
  aboutText:
    "Basée à Bamako, SOKATF SARL a bâti son excellence sur le commerce général — importation, distribution et approvisionnement — qu'elle décline dans chacun de ses secteurs d'activité, avec une rigueur opérationnelle sans compromis.",
  contactCity: "Bamako, Mali",
  contactAddress: "Quartier Hamdallaye ACI 2000, Immeuble Assan Thiero",
  phoneDisplay: "(+223) 66 77 32 75 / 70 04 02 13",
  phoneTel: "+22366773275",
  email: "contact@sokatf.com",
  whatsapp: "+223 65 26 51 93",
  whatsappLink: "https://wa.me/22365265193",
  nif: "084153962X",
  rccm: "MA.BKo-2026-B-1280",
  blurb:
    "Spécialiste du commerce général au Mali, SOKATF SARL importe, distribue et approvisionne l'ensemble des secteurs stratégiques de l'économie nationale.",
  partners: ["BANK OF MALI", "GOLD MINING INC", "MINISTRY TRANS.", "AFRI-TECH", "BUILD AFRICA", "AGRO-MAL"],
  services: [
    { title: "Commerce Général", icon: "shopping_cart", text: "Notre cœur de métier : importation, distribution et négoce de biens et d'équipements à travers tous les secteurs de l'économie malienne." },
    { title: "BTP & Génie Civil", icon: "construction", text: "Construction d'infrastructures routières et de complexes immobiliers de haut standing." },
    { title: "Agro-industrie", icon: "agriculture", text: "Transformation de produits locaux et mécanisation agricole de pointe." },
    { title: "Sécurité & Gardiennage", icon: "shield_person", text: "Protection des sites, surveillance électronique et escorte de convois sensibles." },
    { title: "Solutions IT", icon: "computer", text: "Intégration de systèmes et transformation digitale pour entreprises." },
  ],
};

function parseArr<T>(json: string | null | undefined, fallback: T[]): T[] {
  try {
    const v = JSON.parse(json || "[]");
    return Array.isArray(v) && v.length ? v : fallback;
  } catch {
    return fallback;
  }
}

/** Read the singleton site content, filling any unset field with the default. */
export async function getSiteContent(): Promise<SiteContentData> {
  const s = await prisma.siteContent.findUnique({ where: { id: "singleton" } }).catch(() => null);
  const d = SITE_DEFAULTS;
  if (!s) return d;
  const t = (v: string | null, def: string) => (v && v.trim() ? v : def);
  return {
    heroEyebrow: t(s.heroEyebrow, d.heroEyebrow),
    heroTitle: t(s.heroTitle, d.heroTitle),
    heroTitleAccent: t(s.heroTitleAccent, d.heroTitleAccent),
    heroSubtitle: t(s.heroSubtitle, d.heroSubtitle),
    stats: parseArr<Stat>(s.stats, d.stats),
    aboutEyebrow: t(s.aboutEyebrow, d.aboutEyebrow),
    aboutTitle: t(s.aboutTitle, d.aboutTitle),
    aboutText: t(s.aboutText, d.aboutText),
    contactCity: t(s.contactCity, d.contactCity),
    contactAddress: t(s.contactAddress, d.contactAddress),
    phoneDisplay: t(s.phoneDisplay, d.phoneDisplay),
    phoneTel: t(s.phoneTel, d.phoneTel),
    email: t(s.email, d.email),
    whatsapp: t(s.whatsapp, d.whatsapp),
    whatsappLink: t(s.whatsappLink, d.whatsappLink),
    nif: t(s.nif, d.nif),
    rccm: t(s.rccm, d.rccm),
    blurb: t(s.blurb, d.blurb),
    partners: parseArr<string>(s.partners, d.partners),
    services: parseArr<Service>(s.services, d.services),
  };
}
