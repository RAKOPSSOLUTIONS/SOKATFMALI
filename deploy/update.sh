#!/usr/bin/env bash
#
# Met à jour SOKATF en production (nouvelle version / nouveaux modules).
# À lancer SUR LE VPS :
#
#     cd /var/www/apis/sokatf && bash deploy/update.sh
#
# Ce que fait le script, en une commande :
#   1. récupère le code (git pull)
#   2. sauvegarde la base SQLite (au cas où)
#   3. installe les nouvelles dépendances (si package.json a changé)
#   4. applique les changements de schéma Prisma (nouveaux modèles/champs)
#   5. rebuild le front Astro (statique) + le backend Next.js
#   6. recharge le backend pm2 sans coupure
#
set -euo pipefail

APP_DIR="${APP_DIR:-/var/www/apis/sokatf}"
PM2_APP="${PM2_APP:-sokatf-api}"
cd "$APP_DIR"

echo "▶ 1/6  git pull"
git pull --ff-only

# --- sauvegarde de la base (SQLite) avant toute migration -------------------
DB="apps/api/prod.db"
if [ -f "$DB" ]; then
  mkdir -p backups
  STAMP="$(date +%Y%m%d-%H%M%S)"
  cp "$DB" "backups/prod-$STAMP.db"
  echo "▶ 2/6  base sauvegardée → backups/prod-$STAMP.db"
  # ne garde que les 20 dernières sauvegardes
  ls -1t backups/prod-*.db 2>/dev/null | tail -n +21 | xargs -r rm -f
else
  echo "▶ 2/6  pas de $DB (rien à sauvegarder)"
fi

echo "▶ 3/6  pnpm install"
pnpm install

echo "▶ 4/6  prisma db push (applique les nouveaux modèles/champs)"
pnpm --filter @sokatf/api db:push

echo "▶ 5/6  build (front statique + backend)"
pnpm build

echo "▶ 6/6  reload pm2 ($PM2_APP)"
pm2 reload "$PM2_APP"

echo
echo "✅ Mise à jour terminée."
curl -s http://127.0.0.1:4100/api/health && echo || true
