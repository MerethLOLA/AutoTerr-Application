<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('garanties', function (Blueprint $table) {
            $table->foreignId('id_employe')->nullable()->after('date_fin')
                ->constrained('employes')->nullOnDelete();
        });

        Schema::table('locations', function (Blueprint $table) {
            $table->foreignId('id_agent')->nullable()->after('observations')
                ->constrained('employes')->nullOnDelete();
        });

        Schema::table('assurances', function (Blueprint $table) {
            $table->foreignId('id_gestionnaire')->nullable()->after('notes')
                ->constrained('employes')->nullOnDelete();
        });

        Schema::table('sinistres', function (Blueprint $table) {
            $table->foreignId('id_gestionnaire')->nullable()->after('notes')
                ->constrained('employes')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('sinistres', function (Blueprint $table) {
            $table->dropForeign(['id_gestionnaire']);
            $table->dropColumn('id_gestionnaire');
        });

        Schema::table('assurances', function (Blueprint $table) {
            $table->dropForeign(['id_gestionnaire']);
            $table->dropColumn('id_gestionnaire');
        });

        Schema::table('locations', function (Blueprint $table) {
            $table->dropForeign(['id_agent']);
            $table->dropColumn('id_agent');
        });

        Schema::table('garanties', function (Blueprint $table) {
            $table->dropForeign(['id_employe']);
            $table->dropColumn('id_employe');
        });
    }
};
