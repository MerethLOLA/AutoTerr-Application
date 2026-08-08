<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('ventes', function (Blueprint $table) {
            $table->decimal('prix_catalogue', 15, 2)->nullable()->after('id_voiture');
            $table->decimal('remise', 15, 2)->default(0)->after('prix_catalogue');
            $table->string('motif_remise')->nullable()->after('remise');
        });

        // Pour les ventes existantes : le prix_final actuel devient le prix catalogue (remise = 0, aucune donnée perdue).
        DB::table('ventes')->whereNull('prix_catalogue')->update([
            'prix_catalogue' => DB::raw('prix_final'),
        ]);
    }

    public function down(): void
    {
        Schema::table('ventes', function (Blueprint $table) {
            $table->dropColumn(['prix_catalogue', 'remise', 'motif_remise']);
        });
    }
};
