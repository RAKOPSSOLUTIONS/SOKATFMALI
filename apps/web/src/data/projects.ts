import { IMG, type ImgKey } from "./stitch";

export type Project = {
  category: string; // filter key
  badge: string;
  title: string;
  client: string;
  img: ImgKey;
};

export const projectFilters = [
  { key: "all", label: "Tous les secteurs" },
  { key: "btp", label: "BTP & Infrastructures" },
  { key: "it", label: "Solutions IT" },
  { key: "agro", label: "Agro-industrie" },
  { key: "mining", label: "Mines" },
];

export const projects: Project[] = [
  {
    category: "mining",
    badge: "Secteur Minier",
    title: "Modernisation de la Mine de Syama",
    client: "Client: Resolute Mining / Gouvernement du Mali",
    img: "mineSyama",
  },
  {
    category: "btp",
    badge: "BTP",
    title: "Complexe Administratif de Bamako",
    client: "Client: Ministère de l'Urbanisme",
    img: "bamakoAdmin",
  },
  {
    category: "it",
    badge: "IT & Digital",
    title: "Infrastructure Cloud National",
    client: "Client: AGETIC Mali",
    img: "cloudData",
  },
  {
    category: "agro",
    badge: "Agro-industrie",
    title: "Pôle Agro-Industriel de Sikasso",
    client: "Client: Office du Niger",
    img: "sikassoAgro",
  },
  {
    category: "btp",
    badge: "BTP & Transport",
    title: "Réhabilitation de l'Axe Bamako-Kayes",
    client: "Client: Gouvernement du Mali",
    img: "bamakoKayes",
  },
  {
    category: "it",
    badge: "IT & Innovation",
    title: "Centre d'Innovation SOKATF Tech",
    client: "Client: Projets Internes SOKATF",
    img: "sokatfTech",
  },
];

// Home page "Galerie de Projets" (3 featured, different copy from /projets).
export const homeProjects: { label: string; title: string; img: ImgKey }[] = [
  { label: "BTP / Infrastructure", title: "Corridor Routier National 7", img: "projRoad" },
  { label: "Industrie", title: "Complexe Agro-Industriel Sikasso", img: "projAgro" },
  { label: "Sécurité Technologique", title: "Centre de Commande Unifié", img: "projControl" },
];

export { IMG };
