<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    private array $indexes = [
        ['voitures',               'statut',     'idx_voitures_statut'],
        ['voitures',               'type_usage',  'idx_voitures_type_usage'],
        ['voitures',               'created_at',  'idx_voitures_created_at'],
        ['locations',              'statut',      'idx_locations_statut'],
        ['locations',              'date_fin',    'idx_locations_date_fin'],
        ['facturations',           'statut',      'idx_facturations_statut'],
        ['ventes',                 'date_vente',  'idx_ventes_date_vente'],
        ['notifications_internes', 'user_id',     'idx_notifications_user_id'],
        ['notifications_internes', 'read_at',     'idx_notifications_read_at'],
    ];

    public function up(): void
    {
        foreach ($this->indexes as [$table, $column, $name]) {
            try {
                if (!Schema::hasTable($table)) continue;
                if (!Schema::hasColumn($table, $column)) continue;
                DB::statement("ALTER TABLE `{$table}` ADD INDEX `{$name}` (`{$column}`)");
            } catch (\Throwable) {
                // Index already exists or not supported — skip silently
            }
        }
    }

    public function down(): void
    {
        foreach ($this->indexes as [$table, $column, $name]) {
            try {
                if (!Schema::hasTable($table)) continue;
                DB::statement("ALTER TABLE `{$table}` DROP INDEX IF EXISTS `{$name}`");
            } catch (\Throwable) {
                // Index doesn't exist — skip silently
            }
        }
    }
};
