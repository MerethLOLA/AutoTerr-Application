#!/bin/bash
set -e

echo "==> Creating storage symlink..."
php artisan storage:link --force

echo "==> Running migrations..."
php artisan migrate --force

echo "==> Syncing role permissions..."
php artisan db:seed --class=PermissionRoleSeeder --force

echo "==> Caching config/routes/views..."
php artisan config:cache
php artisan route:cache && echo "Route cache OK" || echo "Warning: route:cache skipped (duplicate names)"
php artisan view:cache

echo "==> Fixing storage permissions..."
chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage /var/www/html/bootstrap/cache

echo "==> Starting server..."
exec "$@"
