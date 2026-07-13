/**
 * Canonical SOKATF-SARL sector catalogue, transcribed from the Stitch mockups.
 * Used to seed the database. The public Astro site keeps a mirror of this in
 * apps/web/src/data/sectors.ts (kept intentionally decoupled so the site builds
 * without the API running — see README "Connecting the two apps").
 */
export type SeedSector = {
  slug: string;
  name: string;
  tagline: string;
  description: string;
  icon: string;
  accent: string;
  featured: boolean;
  order: number;
};

export const SECTORS: SeedSector[] = [
  {
    slug: "btp-construction",
    name: "BTP & Construction",
    tagline: "Génie civil, infrastructures et bâtiment.",
    description:
      "Ingénierie civile, développement d'infrastructures et solutions de construction premium conçues pour la durabilité et l'esthétique moderne.",
    icon: "architecture",
    accent: "secondary",
    featured: true,
    order: 1,
  },
  {
    slug: "commerce-general",
    name: "Commerce Général",
    tagline: "Commerce et chaîne d'approvisionnement.",
    description:
      "Commerce international et gestion de la chaîne d'approvisionnement de biens à forte demande.",
    icon: "storefront",
    accent: "secondary",
    featured: false,
    order: 2,
  },
  {
    slug: "securite-gardiennage",
    name: "Sécurité & Gardiennage",
    tagline: "Sécurité professionnelle et surveillance.",
    description:
      "Services de sécurité professionnels et surveillance de sites et d'actifs.",
    icon: "security",
    accent: "primary",
    featured: false,
    order: 3,
  },
  {
    slug: "informatique",
    name: "Informatique",
    tagline: "Logiciels, réseaux et transformation digitale.",
    description:
      "Logiciels d'entreprise, réseaux et conseil en transformation digitale pour les entreprises modernes.",
    icon: "developer_board",
    accent: "tertiary-fixed-dim",
    featured: false,
    order: 4,
  },
  {
    slug: "agro-business",
    name: "Agro-business",
    tagline: "Agriculture durable et production alimentaire.",
    description:
      "Agriculture durable et initiatives de production alimentaire à grande échelle.",
    icon: "agriculture",
    accent: "secondary",
    featured: false,
    order: 5,
  },
  {
    slug: "produits-petroliers",
    name: "Produits Pétroliers",
    tagline: "Logistique et distribution pétrolière.",
    description:
      "Logistique fiable et distribution de produits pétroliers raffinés.",
    icon: "oil_barrel",
    accent: "error",
    featured: false,
    order: 6,
  },
  {
    slug: "nettoyage",
    name: "Nettoyage",
    tagline: "Propreté et entretien de sites.",
    description:
      "Services de nettoyage professionnel et d'entretien pour locaux commerciaux et industriels.",
    icon: "cleaning_services",
    accent: "primary",
    featured: false,
    order: 7,
  },
  {
    slug: "restauration",
    name: "Restauration",
    tagline: "Restauration collective et services traiteur.",
    description:
      "Restauration collective, services traiteur et gestion de cantines d'entreprise.",
    icon: "restaurant",
    accent: "primary",
    featured: false,
    order: 8,
  },
  {
    slug: "representation-commerciale",
    name: "Représentation Commerciale",
    tagline: "Représentation et intermédiation.",
    description:
      "Représentation commerciale et intermédiation pour marques et fournisseurs en Afrique de l'Ouest.",
    icon: "handshake",
    accent: "primary",
    featured: false,
    order: 9,
  },
  {
    slug: "prestations-de-services",
    name: "Prestations de Services",
    tagline: "Services techniques et généraux.",
    description:
      "Prestations de services techniques et généraux adaptées aux besoins des entreprises et institutions.",
    icon: "engineering",
    accent: "primary",
    featured: false,
    order: 10,
  },
];
