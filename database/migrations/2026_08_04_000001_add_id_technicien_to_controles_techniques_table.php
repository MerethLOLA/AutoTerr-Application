<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('controles_techniques', function (Blueprint $table) {
            $table->foreignId('id_technicien')->nullable()->after('id_voiture')
                ->constrained('employes')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('controles_techniques', function (Blueprint $table) {
            $table->dropConstrainedForeignId('id_technicien');
        });
    }
};
