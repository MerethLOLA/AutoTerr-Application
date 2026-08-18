<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('controles_techniques', function (Blueprint $table) {
            $table->string('statut')->default('planifie')->after('id_technicien');
        });

        // Le résultat n'a de sens qu'une fois le contrôle effectué : plus de valeur par défaut forcée.
        Schema::table('controles_techniques', function (Blueprint $table) {
            $table->string('resultat', 100)->nullable()->default(null)->change();
        });
    }

    public function down(): void
    {
        Schema::table('controles_techniques', function (Blueprint $table) {
            $table->dropColumn('statut');
        });

        Schema::table('controles_techniques', function (Blueprint $table) {
            $table->string('resultat', 100)->nullable(false)->default('favorable')->change();
        });
    }
};
