/**
 * Public-site content, fetched from the API at build time. Falls back to the
 * baked-in DEFAULTS if the API is unreachable — so the build never fails and
 * the site is unchanged until content is edited in /admin/site.
 *
 * Requires PUBLIC_API_URL to point at the running API during `pnpm build`
 * (e.g. http://127.0.0.1:4100 on the VPS) for edits to take effect.
 */
export type Stat = { value: string; label: string; icon: string };
export type Service = { title: string; icon: string; text: string };

export type SiteContent = {
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

const DEFAULTS: SiteContent = {
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
    { title: "Matériel & Consommables Médicaux", icon: "medical_services", text: "Fourniture et distribution de matériel médical, dispositifs et consommables pour hôpitaux, cliniques et pharmacies." },
    { title: "BTP & Génie Civil", icon: "construction", text: "Construction d'infrastructures routières et de complexes immobiliers de haut standing." },
    { title: "Agro-industrie", icon: "agriculture", text: "Transformation de produits locaux et mécanisation agricole de pointe." },
    { title: "Sécurité & Gardiennage", icon: "shield_person", text: "Protection des sites, surveillance électronique et escorte de convois sensibles." },
    { title: "Solutions IT", icon: "computer", text: "Intégration de systèmes et transformation digitale pour entreprises." },
  ],
};

const API = import.meta.env.PUBLIC_API_URL ?? "http://localhost:3001";
let cache: Promise<SiteContent> | null = null;

export function getSiteContent(): Promise<SiteContent> {
  if (!cache) {
    cache = fetch(`${API}/api/site-content`, { signal: AbortSignal.timeout(4000) })
      .then((r) => (r.ok ? r.json() : DEFAULTS))
      .then((d) => ({ ...DEFAULTS, ...d }))
      .catch(() => DEFAULTS);
  }
  return cache;
}
