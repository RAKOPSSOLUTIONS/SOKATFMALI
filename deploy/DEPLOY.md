# Déploiement — SOKATF MALI (VPS + nginx + pm2)

Guide de mise en production sur un VPS Linux (Ubuntu/Debian) avec **nginx** en
reverse proxy et **pm2** pour le backend.

> **Domaine** : ce guide utilise `sokatf.com` (cohérent avec votre email
> `contact@sokatf.com`). Vous aviez écrit `sofatf.com` — si c'est le bon
> domaine, remplacez `sokatf.com` partout (fichier nginx + commande certbot).

## Architecture & ports

| Composant | Détail | Port |
| --- | --- | --- |
| **Front (Astro)** | build **statique** servi directement par nginx (`apps/web/dist`) | — (aucun) |
| **Backend (Next.js)** | API `/api/*` + tableau de bord `/admin` via **pm2** | `127.0.0.1:4100` |
| **nginx** | TLS + reverse proxy public | `80` / `443` |

nginx route `/api/`, `/admin`, `/_next/` vers le backend (4100) et **tout le
reste** vers le build statique Astro. Les formulaires (accueil, contact,
partenaires) postent en **same-origin** vers `https://sokatf.com/api/...` → pas de CORS.

> **Vérifier que le port 4100 est libre sur le VPS :**
> ```bash
> ss -ltnp | grep ':4100' || echo "4100 libre ✅"
> ```
> S'il est pris, choisissez-en un autre (ex. 4110) et changez-le dans
> `deploy/ecosystem.config.cjs` (PORT) **et** `deploy/nginx/sokatf.com.conf` (proxy_pass).

## 1. Prérequis (VPS)

```bash
# Node 20+ et pnpm
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx
sudo npm i -g pnpm pm2

# certbot
sudo apt install -y certbot python3-certbot-nginx
```

## 2. Cloner le projet

```bash
sudo mkdir -p /var/www && cd /var/www
sudo git clone https://github.com/RAKOPSSOLUTIONS/SOKATFMALI.git sokatf
sudo chown -R $USER:$USER /var/www/sokatf
cd /var/www/sokatf
```

## 3. Variables d'environnement

**Backend** — `apps/api/.env` (copiez depuis `.env.example`) :

```bash
cp apps/api/.env.example apps/api/.env
nano apps/api/.env
```
Réglez au minimum :
```
DATABASE_URL="file:./prod.db"          # SQLite (simple) ou Postgres
ADMIN_EMAIL="admin@sokatf.com"
ADMIN_PASSWORD="<mot de passe fort>"    # ⚠️ à changer
AUTH_SECRET="<32+ octets aléatoires>"   # node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
WEB_ORIGIN="https://sokatf.com"
# SMTP_* facultatif — sans SMTP, les notifications de leads sont loggées.
```

**Front** — `apps/web/.env` :
```bash
echo 'PUBLIC_API_URL="https://sokatf.com"' > apps/web/.env
```
> `PUBLIC_API_URL` est **injecté au build**. Toujours rebuild le front après l'avoir changé.

## 4. Installer, préparer la base, builder

```bash
pnpm install
pnpm --filter @sokatf/api db:push     # crée le schéma
pnpm --filter @sokatf/api db:seed     # données de démo (secteurs/projets) — optionnel
pnpm build                            # build front (statique) + backend (Next)
```

## 5. Lancer le backend avec pm2

```bash
pm2 start deploy/ecosystem.config.cjs
pm2 save            # persiste la liste
pm2 startup         # (suivez la commande affichée pour démarrer au boot)

# vérifier
curl -s http://127.0.0.1:4100/api/health   # -> {"status":"ok","db":"up",...}
```

## 6. nginx

```bash
# 1) map WebSocket (une seule fois)
sudo cp deploy/nginx/websocket-upgrade.conf /etc/nginx/conf.d/websocket-upgrade.conf

# 2) le site
sudo cp deploy/nginx/sokatf.com.conf /etc/nginx/sites-available/sokatf.com.conf
sudo ln -s /etc/nginx/sites-available/sokatf.com.conf /etc/nginx/sites-enabled/

# 3) tester + recharger
sudo nginx -t
sudo systemctl reload nginx
```

> Ajustez la ligne `root /var/www/sokatf/apps/web/dist;` si vous avez cloné ailleurs.

## 7. Certificat SSL (Let's Encrypt)

```bash
sudo certbot --nginx -d sokatf.com -d www.sokatf.com
```
certbot remplit les lignes `ssl_certificate*` et gère le renouvellement auto.

## 8. Vérifier

- `https://sokatf.com` → le site
- `https://sokatf.com/admin` → tableau de bord (login `ADMIN_EMAIL` / `ADMIN_PASSWORD`)
- Soumettez le formulaire de contact → le prospect apparaît dans `/admin`.

## Mettre à jour (déploiement d'une nouvelle version)

```bash
cd /var/www/sokatf
git pull
pnpm install
pnpm --filter @sokatf/api db:push     # si le schéma a changé
pnpm build
pm2 reload sokatf-api                  # recharge le backend sans coupure
# le front statique est déjà à jour (nginx sert apps/web/dist)
```

## Notes
- **DNS** : faites pointer `sokatf.com` et `www.sokatf.com` (enregistrements A/AAAA) vers l'IP du VPS avant certbot.
- **Base de données** : SQLite convient pour un trafic modéré. Pour Postgres, changez `provider` dans `apps/api/prisma/schema.prisma` et `DATABASE_URL`.
- **Secrets** : `.env` n'est jamais commité (voir `.gitignore`). Configurez-les sur le serveur.
- **Front sur un port** (au lieu de statique) : voir le bloc *ALTERNATIVE* en bas de `deploy/nginx/sokatf.com.conf` et l'app commentée dans `ecosystem.config.cjs`.
