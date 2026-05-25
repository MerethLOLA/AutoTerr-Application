<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('voitures', function (Blueprint $table) {
            $table->decimal('prix_vente', 15, 2)->nullable()->after('prix');
        });

        Schema::table('demandes', function (Blueprint $table) {
            $table->date('rendez_vous_date')->nullable()->after('message');
            $table->string('rendez_vous_heure', 10)->nullable()->after('rendez_vous_date');
        });

        // Étendre l'enum type pour inclure 'achat'
        DB::statement("ALTER TABLE demandes MODIFY COLUMN type ENUM('information','reprise','essai','achat') NOT NULL");
    }

    public function down(): void
    {
        Schema::table('voitures', function (Blueprint $table) {
            $table->dropColumn('prix_vente');
        });
        Schema::table('demandes', function (Blueprint $table) {
            $table->dropColumn(['rendez_vous_date', 'rendez_vous_heure']);
        });
        DB::statement("ALTER TABLE demandes MODIFY COLUMN type ENUM('information','reprise','essai') NOT NULL");
    }
};
