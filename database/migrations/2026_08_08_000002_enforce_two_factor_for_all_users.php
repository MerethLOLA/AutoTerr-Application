<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

// Raw SQL plutôt que Blueprint::change() : évite d'ajouter doctrine/dbal
// comme dépendance juste pour modifier un défaut de colonne.
return new class extends Migration
{
    public function up(): void
    {
        DB::statement('ALTER TABLE users ALTER COLUMN two_factor_enabled SET DEFAULT 1');
        DB::table('users')->update(['two_factor_enabled' => true]);
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE users ALTER COLUMN two_factor_enabled SET DEFAULT 0');
    }
};
