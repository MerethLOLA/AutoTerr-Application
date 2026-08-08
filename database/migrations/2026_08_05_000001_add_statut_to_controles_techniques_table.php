<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('controles_techniques', function (Blueprint $table) {
            $table->string('statut')->default('planifie')->after('id_technicien');
        });

        // Le résultat n'a de sens qu'une fois le contrôle effectué : plus de valeur par défaut forcée.
        DB::statement("ALTER TABLE controles_techniques MODIFY resultat VARCHAR(100) NULL DEFAULT NULL");
    }

    public function down(): void
    {
        Schema::table('controles_techniques', function (Blueprint $table) {
            $table->dropColumn('statut');
        });

        DB::statement("ALTER TABLE controles_techniques MODIFY resultat VARCHAR(100) NOT NULL DEFAULT 'favorable'");
    }
};
