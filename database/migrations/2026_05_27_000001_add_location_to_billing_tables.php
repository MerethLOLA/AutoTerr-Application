<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        // Rendre id_vente nullable dans facturations + ajouter id_location
        DB::statement('ALTER TABLE facturations MODIFY COLUMN id_vente BIGINT UNSIGNED NULL');
        DB::statement('ALTER TABLE facturations ADD COLUMN id_location BIGINT UNSIGNED NULL AFTER id_vente');
        DB::statement('ALTER TABLE facturations ADD CONSTRAINT fk_fact_location FOREIGN KEY (id_location) REFERENCES locations(id) ON DELETE SET NULL');

        // Rendre id_vente nullable dans paiements + ajouter id_location
        DB::statement('ALTER TABLE paiements MODIFY COLUMN id_vente BIGINT UNSIGNED NULL');
        DB::statement('ALTER TABLE paiements ADD COLUMN id_location BIGINT UNSIGNED NULL AFTER id_vente');
        DB::statement('ALTER TABLE paiements ADD CONSTRAINT fk_paie_location FOREIGN KEY (id_location) REFERENCES locations(id) ON DELETE SET NULL');
    }

    public function down(): void
    {
        DB::statement('ALTER TABLE paiements DROP FOREIGN KEY fk_paie_location');
        DB::statement('ALTER TABLE paiements DROP COLUMN id_location');
        DB::statement('ALTER TABLE paiements MODIFY COLUMN id_vente BIGINT UNSIGNED NOT NULL');

        DB::statement('ALTER TABLE facturations DROP FOREIGN KEY fk_fact_location');
        DB::statement('ALTER TABLE facturations DROP COLUMN id_location');
        DB::statement('ALTER TABLE facturations MODIFY COLUMN id_vente BIGINT UNSIGNED NOT NULL');
    }
};
