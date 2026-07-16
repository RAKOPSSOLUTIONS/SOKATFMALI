/**
 * Company organisation documents for SOKATF SARL, rendered to PDF (.pdf) and
 * Word (.docx) from this structured content. Edit here to update the documents.
 */

export type Block =
  | { type: "h2"; text: string }
  | { type: "p"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "ol"; items: string[] }
  | { type: "table"; head: string[]; rows: string[][] }
  | { type: "org"; levels: { role: string; name: string }[] };

export type OrgDoc = {
  slug: string;
  title: string;
  subtitle?: string;
  blocks: Block[];
};

export const ORG = {
  pdg: "Cheick A. Thiero",
  dg: "Abdoulaye Anaïssoum Touré",
  dga: "Sidi Mohamed Thiero",
  finrh: "Abdrahamane Dembélé",
  manager: "Oumar Mahdi",
};

export const DOCS: OrgDoc[] = [
  {
    slug: "organigramme",
    title: "Organigramme de l'entreprise",
    subtitle: "Structure de direction — SOKATF SARL",
    blocks: [
      { type: "p", text: "L'organigramme présente la structure hiérarchique et fonctionnelle de SOKATF SARL. Il définit les lignes de responsabilité et de reporting entre les organes de direction." },
      {
        type: "org",
        levels: [
          { role: "Président Directeur Général (PDG)", name: ORG.pdg },
          { role: "Directeur Général (DG)", name: ORG.dg },
          { role: "Directeur Général Adjoint & Commercial (DGA)", name: ORG.dga },
          { role: "Administrateur Financier & Ressources Humaines", name: ORG.finrh },
          { role: "Manager & Conseiller", name: ORG.manager },
        ],
      },
      { type: "h2", text: "Rôles clés" },
      { type: "ul", items: [
        "Le PDG définit la vision stratégique et représente l'entreprise auprès des tiers.",
        "Le DG pilote l'exploitation et coordonne l'ensemble des directions.",
        "Le DGA & Commercial dirige le développement commercial et les partenariats.",
        "L'Administrateur Financier & RH assure la gestion financière, comptable et des ressources humaines.",
        "Le Manager & Conseiller encadre les équipes opérationnelles et conseille la direction.",
      ] },
      { type: "p", text: "Note : la structure évolue avec la croissance de l'entreprise ; les fiches de poste détaillées figurent dans le document dédié." },
    ],
  },
  {
    slug: "presentation",
    title: "Présentation de l'entreprise",
    subtitle: "Vision, Mission et Valeurs",
    blocks: [
      { type: "h2", text: "Qui sommes-nous" },
      { type: "p", text: "SOKATF SARL est une société de commerce général multisectoriel basée à Bamako (Mali). Notre cœur de métier — l'importation, la distribution, le négoce et l'approvisionnement — irrigue l'ensemble des secteurs stratégiques de l'économie nationale : BTP, agro-industrie, énergie, sécurité, informatique et services." },
      { type: "h2", text: "Notre Vision" },
      { type: "p", text: "Devenir un acteur de référence du commerce général et de l'approvisionnement au Mali et en Afrique de l'Ouest, reconnu pour sa fiabilité, la qualité de ses produits et la solidité de son réseau de partenaires." },
      { type: "h2", text: "Notre Mission" },
      { type: "p", text: "Faire du commerce général le moteur de l'économie malienne en important, distribuant et approvisionnant l'ensemble des secteurs stratégiques avec les plus hauts standards de qualité, de fiabilité et de disponibilité." },
      { type: "h2", text: "Nos Valeurs" },
      { type: "ul", items: [
        "Intégrité — transparence et éthique dans toutes nos relations d'affaires.",
        "Fiabilité — des engagements tenus et une qualité constante.",
        "Excellence opérationnelle — rigueur dans l'exécution et respect des délais.",
        "Proximité — connaissance du terrain et service client attentif.",
        "Engagement local — contribution au développement économique du Mali.",
      ] },
    ],
  },
  {
    slug: "objectifs",
    title: "Objectifs de l'entreprise",
    subtitle: "Court, moyen et long terme",
    blocks: [
      { type: "h2", text: "Court terme (0 – 12 mois)" },
      { type: "ul", items: [
        "Structurer l'organisation interne (procédures, fiches de poste, outils).",
        "Consolider le portefeuille clients et fournisseurs.",
        "Mettre en place les outils de gestion (devis, factures, suivi financier).",
        "Renforcer la visibilité (site web, présence commerciale).",
      ] },
      { type: "h2", text: "Moyen terme (1 – 3 ans)" },
      { type: "ul", items: [
        "Développer de nouveaux pôles d'activité et gammes de produits.",
        "Élargir le réseau de distribution aux principales régions du Mali.",
        "Nouer des partenariats stratégiques avec des fournisseurs internationaux.",
        "Atteindre les objectifs de chiffre d'affaires et de rentabilité fixés.",
      ] },
      { type: "h2", text: "Long terme (3 – 5 ans et +)" },
      { type: "ul", items: [
        "S'imposer comme un leader régional du commerce général.",
        "Étendre les activités à la sous-région (CEDEAO).",
        "Investir dans la logistique, le stockage et la digitalisation.",
        "Créer de l'emploi durable et renforcer l'impact social.",
      ] },
    ],
  },
  {
    slug: "fiches-poste",
    title: "Fiches de poste",
    subtitle: "Descriptions des postes de direction",
    blocks: [
      { type: "h2", text: `PDG — ${ORG.pdg}` },
      { type: "p", text: "Rattachement : Conseil / Actionnaires. Mission : définir la stratégie, garantir la pérennité et représenter l'entreprise." },
      { type: "ul", items: ["Définit la vision et les orientations stratégiques.", "Valide les décisions majeures (investissements, partenariats).", "Représente l'entreprise auprès des institutions et grands comptes."] },
      { type: "h2", text: `DG — ${ORG.dg}` },
      { type: "p", text: "Rattachement : PDG. Mission : piloter l'exploitation et coordonner les directions." },
      { type: "ul", items: ["Met en œuvre la stratégie définie par la direction.", "Coordonne les activités commerciales, financières et RH.", "Assure le reporting de performance au PDG."] },
      { type: "h2", text: `DGA & Commercial — ${ORG.dga}` },
      { type: "p", text: "Rattachement : DG. Mission : développer le chiffre d'affaires et les partenariats." },
      { type: "ul", items: ["Élabore et pilote la stratégie commerciale.", "Développe le portefeuille clients et fournisseurs.", "Négocie les contrats et suit la satisfaction client."] },
      { type: "h2", text: `Administrateur Financier & RH — ${ORG.finrh}` },
      { type: "p", text: "Rattachement : DG. Mission : gérer les finances, la comptabilité et les ressources humaines." },
      { type: "ul", items: ["Assure la gestion financière et comptable (trésorerie, facturation, budget).", "Gère la paie, les contrats et les dossiers du personnel.", "Veille à la conformité fiscale et sociale (OHADA)."] },
      { type: "h2", text: `Manager & Conseiller — ${ORG.manager}` },
      { type: "p", text: "Rattachement : DG. Mission : encadrer les équipes opérationnelles et conseiller la direction." },
      { type: "ul", items: ["Supervise les opérations et la qualité de service.", "Encadre et forme les collaborateurs.", "Apporte un conseil stratégique et opérationnel à la direction."] },
    ],
  },
  {
    slug: "reglement-interieur",
    title: "Règlement intérieur",
    blocks: [
      { type: "p", text: "Le présent règlement intérieur fixe les règles applicables à l'ensemble du personnel de SOKATF SARL en matière de discipline, d'hygiène et de sécurité, conformément à la législation du travail en vigueur au Mali." },
      { type: "h2", text: "1. Discipline générale" },
      { type: "ul", items: ["Respect des horaires de travail et des consignes hiérarchiques.", "Comportement professionnel et courtois envers collègues, clients et partenaires.", "Interdiction de toute activité étrangère au service pendant les heures de travail."] },
      { type: "h2", text: "2. Hygiène et sécurité" },
      { type: "ul", items: ["Respect des consignes de sécurité sur les sites et lors des opérations.", "Port des équipements de protection lorsque requis.", "Maintien de la propreté des locaux et du matériel."] },
      { type: "h2", text: "3. Absences et retards" },
      { type: "ul", items: ["Toute absence doit être justifiée et communiquée dans les meilleurs délais.", "Les congés sont soumis à autorisation préalable de la hiérarchie."] },
      { type: "h2", text: "4. Sanctions" },
      { type: "p", text: "Tout manquement peut donner lieu, selon sa gravité, à un avertissement, un blâme, une mise à pied ou un licenciement, dans le respect de la procédure légale." },
    ],
  },
  {
    slug: "politique-rh",
    title: "Politique des Ressources Humaines",
    subtitle: "Congés, horaires, absences et gestion du personnel",
    blocks: [
      { type: "h2", text: "Horaires de travail" },
      { type: "p", text: "Les horaires standards sont du lundi au vendredi, de 08h00 à 17h00 (avec pause). Les horaires spécifiques (terrain, sécurité) sont définis par service." },
      { type: "h2", text: "Congés et absences" },
      { type: "ul", items: ["Congés annuels payés conformément au Code du travail malien.", "Demande de congé soumise et validée par la hiérarchie via le formulaire dédié.", "Absences maladie justifiées par un certificat médical.", "Autorisations exceptionnelles (événements familiaux) selon les dispositions légales."] },
      { type: "h2", text: "Recrutement et intégration" },
      { type: "ul", items: ["Processus de recrutement transparent basé sur les compétences.", "Contrat de travail écrit et fiche de poste remis à l'embauche.", "Parcours d'intégration pour chaque nouveau collaborateur."] },
      { type: "h2", text: "Formation et évolution" },
      { type: "p", text: "SOKATF SARL encourage la formation continue et la mobilité interne afin de développer les compétences et de valoriser les talents locaux." },
      { type: "h2", text: "Rémunération" },
      { type: "p", text: "La rémunération est fixée selon le poste, l'expérience et la grille interne, versée mensuellement, dans le respect des minima légaux." },
    ],
  },
  {
    slug: "charte-informatique",
    title: "Charte informatique et de sécurité",
    blocks: [
      { type: "p", text: "Cette charte définit les règles d'utilisation des ressources informatiques de SOKATF SARL afin de garantir la sécurité, la confidentialité et la bonne gestion des systèmes." },
      { type: "h2", text: "Utilisation des équipements" },
      { type: "ul", items: ["Les équipements et comptes sont réservés à un usage professionnel.", "Chaque utilisateur est responsable de ses identifiants et mots de passe.", "Interdiction d'installer des logiciels non autorisés."] },
      { type: "h2", text: "Sécurité" },
      { type: "ul", items: ["Mots de passe robustes et renouvelés régulièrement.", "Verrouillage des sessions en cas d'absence.", "Vigilance face aux emails et liens suspects (hameçonnage).", "Signalement immédiat de tout incident de sécurité."] },
      { type: "h2", text: "Données et sauvegardes" },
      { type: "ul", items: ["Les données professionnelles sont stockées sur les espaces prévus.", "Les sauvegardes sont réalisées selon le plan de sauvegarde.", "La divulgation de données confidentielles est strictement interdite."] },
    ],
  },
  {
    slug: "politique-confidentialite",
    title: "Politique de confidentialité et de protection des données",
    blocks: [
      { type: "p", text: "SOKATF SARL s'engage à protéger les données personnelles de ses clients, partenaires et collaborateurs, dans le respect de la réglementation applicable." },
      { type: "h2", text: "Données collectées" },
      { type: "ul", items: ["Identité et coordonnées (nom, société, email, téléphone, adresse).", "Données commerciales (devis, commandes, factures, paiements).", "Données strictement nécessaires à l'activité."] },
      { type: "h2", text: "Utilisation" },
      { type: "ul", items: ["Gestion de la relation commerciale et du suivi des commandes.", "Facturation, comptabilité et obligations légales.", "Communication d'informations liées aux services."] },
      { type: "h2", text: "Protection et droits" },
      { type: "ul", items: ["Accès aux données limité aux personnes habilitées.", "Mesures de sécurité techniques et organisationnelles.", "Les personnes concernées peuvent demander l'accès, la rectification ou la suppression de leurs données."] },
      { type: "p", text: "Contact : contact@sokatf.com" },
    ],
  },
  {
    slug: "procedure-documents",
    title: "Procédure de gestion des documents",
    blocks: [
      { type: "p", text: "Cette procédure encadre la création, la validation, le classement et l'archivage des documents de l'entreprise." },
      { type: "h2", text: "Cycle de vie d'un document" },
      { type: "ol", items: ["Création selon un modèle validé.", "Vérification et validation par le responsable concerné.", "Diffusion aux destinataires autorisés.", "Classement et archivage (numérique et/ou papier).", "Révision périodique et destruction contrôlée en fin de vie."] },
      { type: "h2", text: "Nommage et classement" },
      { type: "ul", items: ["Nommage normalisé : Type - Date - Objet (ex. Facture - 26-07-0001).", "Classement par catégorie (commercial, financier, RH, juridique).", "Versionnage des documents modifiés."] },
      { type: "h2", text: "Confidentialité" },
      { type: "p", text: "L'accès aux documents est restreint selon les rôles ; les documents sensibles sont protégés et tracés." },
    ],
  },
  {
    slug: "plan-sauvegarde",
    title: "Plan de sauvegarde des données",
    blocks: [
      { type: "p", text: "Le plan de sauvegarde garantit la disponibilité et la restauration des données en cas d'incident." },
      { type: "h2", text: "Principes" },
      { type: "ul", items: ["Sauvegardes régulières des données critiques (base de données, documents).", "Règle 3-2-1 : 3 copies, sur 2 supports, dont 1 hors site.", "Chiffrement des sauvegardes sensibles."] },
      { type: "h2", text: "Fréquence" },
      { type: "table", head: ["Donnée", "Fréquence", "Rétention"], rows: [
        ["Base de données (devis, factures, clients)", "Quotidienne", "30 jours"],
        ["Documents & fichiers", "Hebdomadaire", "3 mois"],
        ["Archive complète", "Mensuelle", "12 mois"],
      ] },
      { type: "h2", text: "Restauration" },
      { type: "p", text: "Des tests de restauration sont réalisés périodiquement pour vérifier l'intégrité des sauvegardes." },
    ],
  },
  {
    slug: "plan-communication",
    title: "Plan de communication interne et externe",
    blocks: [
      { type: "h2", text: "Communication interne" },
      { type: "ul", items: ["Réunions d'équipe régulières et comptes rendus.", "Canaux officiels (email, groupe interne) pour les informations importantes.", "Diffusion des procédures et mises à jour organisationnelles."] },
      { type: "h2", text: "Communication externe" },
      { type: "ul", items: ["Site web et présence en ligne (sokatf.com).", "Relation client via email, téléphone et WhatsApp.", "Supports commerciaux (présentation, catalogues, devis).", "Relations partenaires et institutionnelles."] },
      { type: "h2", text: "Ligne éditoriale" },
      { type: "p", text: "Une communication professionnelle, fiable et cohérente, reflétant les valeurs de l'entreprise." },
    ],
  },
  {
    slug: "business-plan",
    title: "Business Plan",
    subtitle: "Structure de référence",
    blocks: [
      { type: "p", text: "Ce document présente la structure du business plan de SOKATF SARL, à compléter avec les données chiffrées." },
      { type: "ol", items: [
        "Résumé exécutif — présentation synthétique du projet et des ambitions.",
        "Présentation de l'entreprise — historique, structure, dirigeants.",
        "Offre — produits, gammes et services (commerce général multisectoriel).",
        "Marché — analyse du marché malien, clients cibles, concurrence.",
        "Stratégie — positionnement, développement commercial, partenariats.",
        "Organisation — équipe, organigramme, moyens.",
        "Plan opérationnel — approvisionnement, logistique, distribution.",
        "Plan financier — investissements, prévisions de CA, charges, seuil de rentabilité, trésorerie.",
        "Analyse des risques et plan de mitigation.",
      ] },
    ],
  },
  {
    slug: "plan-action",
    title: "Plan d'action annuel",
    blocks: [
      { type: "p", text: "Le plan d'action décline les objectifs annuels en actions concrètes, responsables et échéances." },
      { type: "table", head: ["Axe", "Action", "Responsable", "Échéance"], rows: [
        ["Commercial", "Développer le portefeuille clients", "DGA & Commercial", "T1–T4"],
        ["Approvisionnement", "Sécuriser les fournisseurs clés", "DG", "T1–T2"],
        ["Finances", "Mettre en place le suivi budgétaire", "Admin. Financier", "T1"],
        ["RH", "Formaliser les procédures et fiches de poste", "Admin. RH", "T1–T2"],
        ["Digital", "Renforcer la visibilité en ligne", "Manager", "T2–T3"],
      ] },
      { type: "p", text: "Un suivi trimestriel permet d'évaluer l'avancement et d'ajuster les priorités." },
    ],
  },
  {
    slug: "kpi",
    title: "Tableau de bord — Indicateurs de performance (KPI)",
    blocks: [
      { type: "p", text: "Les indicateurs clés permettent de piloter la performance de l'entreprise." },
      { type: "table", head: ["Domaine", "Indicateur", "Cible"], rows: [
        ["Commercial", "Chiffre d'affaires facturé", "À définir"],
        ["Commercial", "Taux de conversion devis → facture", "> 40 %"],
        ["Finances", "Taux d'encaissement", "> 90 %"],
        ["Finances", "Délai moyen de paiement", "< 30 jours"],
        ["Clients", "Taux de satisfaction client", "> 95 %"],
        ["Clients", "Nombre de clients actifs", "En hausse"],
        ["Opérations", "Délai moyen de livraison", "24–72 h (stock)"],
      ] },
      { type: "p", text: "Ces KPI sont suivis dans le back-office (module Finances) et revus périodiquement." },
    ],
  },
  {
    slug: "conditions-generales-vente",
    title: "Conditions Générales de Vente",
    subtitle: "CGV — SOKATF SARL",
    blocks: [
      { type: "p", text: "Les présentes Conditions Générales de Vente (CGV) régissent les ventes de biens et prestations de SOKATF SARL, sauf convention particulière écrite." },
      { type: "h2", text: "Commandes" },
      { type: "ul", items: [
        "Toute commande est ferme après acceptation écrite d'un devis (bon de commande signé).",
        "Les modifications éventuelles doivent être notifiées par écrit avant exécution.",
      ] },
      { type: "h2", text: "Prix et paiement" },
      { type: "ul", items: [
        "Les prix sont exprimés en francs CFA (FCFA), hors taxes sauf mention contraire. TVA en vigueur : 18 %.",
        "Sauf accord particulier, le règlement s'effectue à 30 jours date de facture.",
        "Moyens acceptés : virement bancaire, chèque, espèces, Mobile Money.",
        "Tout retard de paiement peut entraîner des pénalités conformément à la réglementation.",
      ] },
      { type: "h2", text: "Livraison" },
      { type: "ul", items: [
        "Les délais de livraison sont donnés à titre indicatif et courent à compter de la confirmation de commande.",
        "Les risques sont transférés au client à la remise des marchandises.",
      ] },
      { type: "h2", text: "Garanties et réclamations" },
      { type: "ul", items: [
        "Les produits bénéficient des garanties légales et, le cas échéant, de la garantie constructeur.",
        "Toute réclamation doit être formulée par écrit dans un délai de 7 jours après réception.",
      ] },
      { type: "h2", text: "Droit applicable et litiges" },
      { type: "p", text: "Les présentes CGV sont soumises au droit malien. À défaut de règlement amiable, les tribunaux compétents de Bamako seront seuls saisis." },
    ],
  },
  {
    slug: "procedure-achats",
    title: "Procédure d'Achat et d'Approvisionnement",
    subtitle: "Processus interne",
    blocks: [
      { type: "p", text: "Cette procédure encadre les achats de biens et services afin de garantir la qualité, la maîtrise des coûts et la traçabilité." },
      { type: "h2", text: "Étapes du processus" },
      { type: "ol", items: [
        "Expression du besoin par le service demandeur (avec spécifications).",
        "Consultation d'au moins deux à trois fournisseurs et comparaison des offres.",
        "Validation selon le seuil de dépense (voir tableau).",
        "Émission du bon de commande et suivi de la livraison.",
        "Contrôle de conformité à la réception et validation de la facture.",
        "Archivage des pièces (devis, bon de commande, bon de livraison, facture).",
      ] },
      { type: "h2", text: "Seuils de validation" },
      { type: "table", head: ["Montant (FCFA)", "Validation requise"], rows: [
        ["< 500 000", "Responsable du service"],
        ["500 000 – 5 000 000", "Administrateur Financier & RH"],
        ["> 5 000 000", "Direction Générale"],
      ] },
      { type: "h2", text: "Sélection des fournisseurs" },
      { type: "ul", items: [
        "Qualité et conformité des produits.",
        "Prix, conditions de paiement et délais de livraison.",
        "Fiabilité, références et service après-vente.",
      ] },
    ],
  },
  {
    slug: "gestion-stocks",
    title: "Procédure de Gestion des Stocks",
    subtitle: "Réception, stockage et inventaire",
    blocks: [
      { type: "p", text: "La gestion des stocks vise à assurer la disponibilité des produits tout en limitant les immobilisations et les pertes." },
      { type: "h2", text: "Réception" },
      { type: "ul", items: [
        "Contrôle quantitatif et qualitatif à l'arrivée (conformité au bon de livraison).",
        "Enregistrement des entrées et signalement immédiat des écarts ou avaries.",
      ] },
      { type: "h2", text: "Stockage" },
      { type: "ul", items: [
        "Rangement par catégorie, avec rotation FIFO (premier entré, premier sorti).",
        "Conditions adaptées (température, sécurité) pour les produits sensibles.",
      ] },
      { type: "h2", text: "Inventaire" },
      { type: "ul", items: [
        "Inventaire physique périodique et rapprochement avec les stocks théoriques.",
        "Analyse des écarts et mise à jour des niveaux d'alerte.",
      ] },
      { type: "table", head: ["Indicateur", "Objectif"], rows: [
        ["Taux de rupture", "< 5 %"],
        ["Écart d'inventaire", "< 2 %"],
        ["Rotation des stocks", "Optimisée par famille"],
      ] },
    ],
  },
  {
    slug: "code-conduite",
    title: "Code de Conduite et d'Éthique",
    subtitle: "Engagements de SOKATF SARL",
    blocks: [
      { type: "p", text: "Ce code définit les principes de comportement attendus de tous les collaborateurs et partenaires de SOKATF SARL." },
      { type: "h2", text: "Principes fondamentaux" },
      { type: "ul", items: [
        "Intégrité et honnêteté dans toutes les relations professionnelles.",
        "Respect des lois et réglementations en vigueur.",
        "Respect des personnes, sans discrimination ni harcèlement.",
        "Confidentialité des informations de l'entreprise et des clients.",
      ] },
      { type: "h2", text: "Conflits d'intérêts" },
      { type: "p", text: "Tout collaborateur doit éviter les situations où son intérêt personnel entre en conflit avec celui de l'entreprise, et déclarer sans délai tout conflit potentiel." },
      { type: "h2", text: "Lutte contre la corruption" },
      { type: "ul", items: [
        "Interdiction de solliciter ou d'accepter des paiements indus.",
        "Encadrement strict des cadeaux et invitations.",
        "Transparence des transactions.",
      ] },
      { type: "h2", text: "Sanctions" },
      { type: "p", text: "Tout manquement au présent code expose son auteur à des sanctions disciplinaires, sans préjudice des poursuites légales éventuelles." },
    ],
  },
  {
    slug: "politique-qualite",
    title: "Politique Qualité",
    subtitle: "Engagement d'excellence",
    blocks: [
      { type: "p", text: "SOKATF SARL place la satisfaction client et la qualité au cœur de son activité de commerce général et de ses prestations." },
      { type: "h2", text: "Nos engagements" },
      { type: "ul", items: [
        "Proposer des produits conformes et fiables.",
        "Respecter les délais et les engagements pris.",
        "Écouter les clients et traiter les réclamations avec diligence.",
        "Former et impliquer les collaborateurs dans la démarche qualité.",
      ] },
      { type: "h2", text: "Amélioration continue" },
      { type: "p", text: "La performance est mesurée par des indicateurs (satisfaction, conformité, délais) et fait l'objet de revues régulières visant l'amélioration continue." },
    ],
  },
  {
    slug: "politique-hse",
    title: "Politique Hygiène, Sécurité & Environnement",
    subtitle: "HSE — SOKATF SARL",
    blocks: [
      { type: "p", text: "SOKATF SARL s'engage à protéger la santé et la sécurité de ses collaborateurs et à limiter l'impact de ses activités sur l'environnement." },
      { type: "h2", text: "Sécurité au travail" },
      { type: "ul", items: [
        "Fourniture et port des équipements de protection individuelle (EPI).",
        "Sensibilisation et formation aux risques professionnels.",
        "Prévention des accidents sur les sites et chantiers.",
      ] },
      { type: "h2", text: "Environnement" },
      { type: "ul", items: [
        "Gestion responsable des déchets.",
        "Utilisation raisonnée des ressources (énergie, eau).",
        "Choix de fournisseurs et pratiques respectueux de l'environnement.",
      ] },
      { type: "h2", text: "Responsabilités" },
      { type: "p", text: "Chaque collaborateur est responsable de l'application des règles HSE. La direction veille à leur mise en œuvre et à leur amélioration continue." },
    ],
  },
  {
    slug: "procedure-recrutement",
    title: "Procédure de Recrutement",
    subtitle: "Ressources Humaines",
    blocks: [
      { type: "p", text: "Cette procédure garantit un recrutement équitable, transparent et adapté aux besoins de l'entreprise." },
      { type: "h2", text: "Étapes" },
      { type: "ol", items: [
        "Définition du besoin et du profil (fiche de poste).",
        "Diffusion de l'offre (interne et/ou externe).",
        "Présélection des candidatures.",
        "Entretiens et évaluation des compétences.",
        "Décision et proposition d'embauche.",
        "Intégration et période d'essai.",
      ] },
      { type: "h2", text: "Documents requis à l'embauche" },
      { type: "ul", items: [
        "Pièce d'identité et documents administratifs.",
        "CV, diplômes et attestations.",
        "Références professionnelles.",
      ] },
    ],
  },
  {
    slug: "plan-formation",
    title: "Plan de Formation du Personnel",
    subtitle: "Développement des compétences",
    blocks: [
      { type: "p", text: "Le plan de formation vise à développer les compétences des collaborateurs et à accompagner la croissance de l'entreprise." },
      { type: "table", head: ["Domaine", "Public", "Fréquence"], rows: [
        ["Techniques commerciales & négociation", "Équipe commerciale", "Annuelle"],
        ["Gestion & finances", "Encadrement", "Annuelle"],
        ["Sécurité & HSE", "Personnel de terrain", "Semestrielle"],
        ["Outils informatiques & back-office", "Personnel administratif", "Selon besoin"],
      ] },
      { type: "h2", text: "Suivi" },
      { type: "ul", items: [
        "Évaluation des acquis après chaque formation.",
        "Mise à jour du plan selon les besoins et la performance.",
      ] },
    ],
  },
];

export function findDoc(slug: string): OrgDoc | undefined {
  return DOCS.find((d) => d.slug === slug);
}
