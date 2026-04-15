<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('image_voitures', function (Blueprint $table) {
            // Ajouter colonne ordre si elle n'existe pas
            if (!Schema::hasColumn('image_voitures', 'ordre')) {
                $table->integer('ordre')->default(0)->after('legible');
            }
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('image_voitures', function (Blueprint $table) {
            $table->dropColumn('ordre');
        });
    }
};
