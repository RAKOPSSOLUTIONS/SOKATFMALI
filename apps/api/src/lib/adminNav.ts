/** Full admin navigation. The dashboard layout filters it by role (canAccess). */
export const ADMIN_NAV = [
  { href: "/admin", label: "Tableau de bord", icon: "dashboard", exact: true },
  { href: "/admin/leads", label: "Prospects", icon: "inbox", exact: false },
  { href: "/admin/clients", label: "Clients", icon: "contacts", exact: false },
  { href: "/admin/produits", label: "Produits", icon: "inventory_2", exact: false },
  { href: "/admin/services", label: "Services", icon: "home_repair_service", exact: false },
  { href: "/admin/devis", label: "Devis", icon: "request_quote", exact: false },
  { href: "/admin/factures", label: "Factures", icon: "receipt_long", exact: false },
  { href: "/admin/finances", label: "Finances", icon: "account_balance_wallet", exact: false },
  { href: "/admin/rapports", label: "Rapports", icon: "monitoring", exact: false },
  { href: "/admin/sectors", label: "Secteurs", icon: "category", exact: false },
  { href: "/admin/projects", label: "Réalisations", icon: "workspaces", exact: false },
  { href: "/admin/documentation", label: "Documentation", icon: "folder_open", exact: false },
  { href: "/admin/activite", label: "Journal", icon: "history", exact: false },
  { href: "/admin/utilisateurs", label: "Utilisateurs", icon: "group", exact: false },
  { href: "/admin/sauvegarde", label: "Sauvegarde", icon: "database", exact: false },
  { href: "/admin/parametres", label: "Paramètres", icon: "settings", exact: false },
];

export type NavItem = (typeof ADMIN_NAV)[number];
