# SOKATF-SARL — Portail multiservices

Monorepo pour le portail de **SOKATF-SARL** (conglomérat multiservices, Abidjan) :

| App | Stack | Rôle | Port dev |
| --- | --- | --- | --- |
| [`apps/web`](apps/web) | **Astro 5** + Tailwind | Site vitrine public (Accueil, Secteurs, À propos, Contact) | `4321` |
| [`apps/api`](apps/api) | **Next.js 15** + Prisma | API publique + tableau de bord d'administration | `3001` |
| [`packages/tokens`](packages/tokens) | Preset Tailwind | Design system partagé (issu de `DESIGN.md`) | — |

Le design system provient des maquettes Stitch dans
`stitch_portail_multiservices_sokatf_sarl/` et de son `DESIGN.md`.

## Prérequis

- Node ≥ 20 (testé sur 22)
- pnpm ≥ 11 (`npm i -g pnpm`)

## Démarrage rapide

```bash
# 1. Installer + créer la base SQLite + données de démo
pnpm install
pnpm setup            # = db:push + db:seed (apps/api)

# 2. Lancer les deux apps en parallèle
pnpm dev
```

- Site : http://localhost:4321
- API / Admin : http://localhost:3001 → tableau de bord sur http://localhost:3001/admin

Identifiants admin par défaut (voir `apps/api/.env`) :
`admin@sokatf-sarl.com` / `changeme` — **à changer avant toute mise en ligne.**

### Lancer une seule app

```bash
pnpm dev:web    # Astro
pnpm dev:api    # Next.js
```

## Backend (`apps/api`)

### API publique

| Méthode | Route | Description |
| --- | --- | --- |
| `GET` | `/api/health` | État du service et de la base. |
| `GET` | `/api/sectors` | Secteurs publiés (JSON). |
| `POST` | `/api/contact` | Message du formulaire de contact. |
| `POST` | `/api/quote` | Demande de devis. |

Les routes `POST` valident via **Zod**, incluent un **honeypot** anti-spam,
enregistrent un `Lead` en base et notifient l'équipe par email (voir SMTP).
CORS est limité à l'origine `WEB_ORIGIN`.

### Tableau de bord `/admin`

Authentification simple (email + mot de passe via variables d'environnement,
cookie de session signé avec `jose`, middleware sur `/admin/*`) :

- **Prospects** — messages & devis, changement de statut, suppression.
- **Secteurs** — CRUD des secteurs affichés sur le site.
- **Réalisations** — CRUD des projets de référence.

### Base de données

Prisma avec **SQLite en dev** (`apps/api/prisma/dev.db`) — zéro configuration.

Scripts (depuis la racine) :

```bash
pnpm db:push      # applique le schéma
pnpm db:seed      # données de démo
pnpm db:studio    # explorateur Prisma Studio
```

**Passer à PostgreSQL en production :** dans
[`apps/api/prisma/schema.prisma`](apps/api/prisma/schema.prisma), remplacer
`provider = "sqlite"` par `"postgresql"`, pointer `DATABASE_URL` vers votre
instance, puis `pnpm db:push`.

### Emails

Sans configuration SMTP, les notifications sont **affichées dans la console**
(pratique en dev). Renseignez les variables `SMTP_*` dans `.env` pour l'envoi réel.

## Frontend (`apps/web`)

Site statique Astro. Le formulaire de contact appelle l'API via
`PUBLIC_API_URL` (voir `apps/web/.env`).

Les images des maquettes Stitch (hébergées temporairement par Google) ont été
remplacées par des blocs dégradés `.img-placeholder` — repérez les commentaires
« Remplacer par une photo réelle » pour insérer vos visuels.

### Connexion des deux apps

Le site rend ses secteurs depuis un miroir statique
([`apps/web/src/data/sectors.ts`](apps/web/src/data/sectors.ts)) afin de builder
**sans dépendre de l'API**. La même liste alimente la base
([`apps/api/src/lib/sectors-data.ts`](apps/api/src/lib/sectors-data.ts)) et est
exposée sur `GET /api/sectors`. Pour rendre le site 100 % piloté par la base,
remplacez l'import statique par un `fetch(`${PUBLIC_API_URL}/api/sectors`)`
(SSR ou au build).

## Structure

```
SOKATF/
├─ apps/
│  ├─ web/                 # Astro (site public)
│  └─ api/                 # Next.js (API + admin) + Prisma
├─ packages/
│  └─ tokens/              # Preset Tailwind partagé (design system)
├─ stitch_portail_.../     # Maquettes Stitch d'origine (référence)
├─ pnpm-workspace.yaml
└─ package.json            # scripts racine
```

## Variables d'environnement

Copiez les `.env.example` en `.env` dans chaque app. Points clés
(`apps/api/.env`) : `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `AUTH_SECRET` (≥ 16
caractères), `WEB_ORIGIN`, `DATABASE_URL`, `SMTP_*`.

> ⚠️ Avant la production : changez `ADMIN_PASSWORD` et générez un `AUTH_SECRET`
> aléatoire (`node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"`).
