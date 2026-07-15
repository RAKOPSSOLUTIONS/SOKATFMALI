/** The ten SOKATF service poles (verbatim from the Services mockup). */
export type Service = {
  n: number;
  title: string;
  icon: string;
  description: string;
  featured?: boolean; // the dark image card (Produits Pétroliers)
};

export const services: Service[] = [
  {
    n: 1,
    title: "Commerce Général",
    icon: "shopping_cart",
    description:
      "Notre cœur de métier. Importation, distribution et négoce de biens de consommation et d'équipements industriels. Notre maîtrise de la chaîne d'approvisionnement irrigue l'ensemble de nos secteurs d'activité, garantissant qualité et disponibilité sur tout le territoire.",
  },
  {
    n: 2,
    title: "BTP",
    icon: "architecture",
    description:
      "Construction de bâtiments résidentiels, industriels et travaux de génie civil. Notre expertise technique assure des réalisations durables respectant les normes de sécurité internationales.",
  },
  {
    n: 3,
    title: "Sécurité & Gardiennage",
    icon: "shield",
    description:
      "Protection des biens et des personnes via des agents hautement qualifiés et des solutions de surveillance électronique de pointe pour les entreprises et les particuliers.",
  },
  {
    n: 8,
    title: "Produits Pétroliers",
    icon: "local_gas_station",
    description:
      "Logistique, stockage et distribution de carburants et lubrifiants. SOKATF SARL est un acteur clé de l'autonomie énergétique industrielle au Mali.",
    featured: true,
  },
  {
    n: 4,
    title: "Nettoyage Professionnel",
    icon: "cleaning_services",
    description:
      "Services d'entretien pour bureaux, sites industriels et centres commerciaux utilisant des équipements écologiques et des protocoles d'hygiène rigoureux.",
  },
  {
    n: 5,
    title: "Agro Business",
    icon: "agriculture",
    description:
      "Valorisation des produits locaux, transformation agro-industrielle et promotion de techniques agricoles modernes pour la souveraineté alimentaire.",
  },
  {
    n: 6,
    title: "Services IT & Solutions",
    icon: "terminal",
    description:
      "Transformation digitale, infrastructure réseau, cybersécurité et développement de logiciels sur mesure pour optimiser la performance des entreprises.",
  },
  {
    n: 7,
    title: "Représentation",
    icon: "handshake",
    description:
      "Intermédiation commerciale et représentation de marques internationales souhaitant s'implanter durablement sur le marché malien et sous-régional.",
  },
  {
    n: 9,
    title: "Restauration & Catering",
    icon: "restaurant",
    description:
      "Gestion de cantines d'entreprise, catering événementiel et services de restauration collective avec un accent sur la qualité nutritionnelle.",
  },
  {
    n: 10,
    title: "Services Professionnels",
    icon: "apps",
    description:
      "Assistance administrative, consulting en gestion et solutions logistiques personnalisées pour répondre à des besoins spécifiques complexes.",
  },
];
