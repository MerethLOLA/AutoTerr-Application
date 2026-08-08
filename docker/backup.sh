#!/usr/bin/env bash
# Sauvegarde des données Docker (MySQL, Redis, fichiers uploadés) de AutoTerr.
# Usage: ./docker/backup.sh [dossier_destination]
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT_DIR"

DEST="${1:-$ROOT_DIR/backups}"
TIMESTAMP="$(date +%Y%m%d_%H%M%S)"
OUT_DIR="$DEST/$TIMESTAMP"
mkdir -p "$OUT_DIR"

# Charge les identifiants depuis .env si présent
if [ -f .env ]; then
  DB_DATABASE="$(grep -E '^DB_DATABASE=' .env | cut -d= -f2-)"
  DB_USERNAME="$(grep -E '^DB_USERNAME=' .env | cut -d= -f2-)"
  DB_ROOT_PASSWORD="$(grep -E '^DB_ROOT_PASSWORD=' .env | cut -d= -f2-)"
fi
DB_DATABASE="${DB_DATABASE:-sunupark_db}"
DB_ROOT_PASSWORD="${DB_ROOT_PASSWORD:?DB_ROOT_PASSWORD manquant (verifier .env)}"

echo "==> Sauvegarde MySQL ($DB_DATABASE)"
docker compose exec -T mysql sh -c "exec mysqldump -uroot -p\"$DB_ROOT_PASSWORD\" --single-transaction --routines --triggers \"$DB_DATABASE\"" \
  | gzip > "$OUT_DIR/mysql_${DB_DATABASE}.sql.gz"

echo "==> Sauvegarde volume Redis (dump.rdb)"
MSYS_NO_PATHCONV=1 docker run --rm \
  -v autoterr_redis_data:/data:ro \
  -v "$OUT_DIR":/backup \
  alpine sh -c "cd /data && tar czf /backup/redis_data.tar.gz ."

echo "==> Sauvegarde des fichiers uploades (storage/app/public)"
tar czf "$OUT_DIR/storage_app_public.tar.gz" -C "$ROOT_DIR/storage/app" public

echo "==> Sauvegarde du fichier .env (config)"
[ -f .env ] && cp .env "$OUT_DIR/env.backup"

echo ""
echo "Sauvegarde terminee: $OUT_DIR"
du -sh "$OUT_DIR"/* 2>/dev/null || true
