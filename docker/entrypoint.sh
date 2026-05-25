#!/bin/bash
set -e

echo "==> Creating storage symlink..."
php artisan storage:link --force

echo "==> Running migrations..."
php artisan migrate --force

echo "==> Caching config/routes/views..."
php artisan config:cache
php artisan route:cache && echo "Route cache OK" || echo "Warning: route:cache skipped (duplicate names)"
php artisan view:cache

echo "==> Starting server..."
exec "$@"
