<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('voitures', function (Blueprint $table) {
            $table->unsignedSmallInteger('puissance')->nullable()->after('energie');
            $table->string('cylindree', 20)->nullable()->after('puissance');
            $table->unsignedTinyInteger('nombre_vitesses')->nullable()->after('type_boite');
            $table->string('transmission', 20)->nullable()->after('nombre_vitesses');
            $table->unsignedTinyInteger('nombre_portes')->nullable()->after('transmission');
            $table->unsignedTinyInteger('nombre_places')->nullable()->after('nombre_portes');
            $table->decimal('consommation', 5, 2)->nullable()->after('kilometrage');
            $table->unsignedSmallInteger('emissions_co2')->nullable()->after('consommation');
        });
    }

    public function down(): void
    {
        Schema::table('voitures', function (Blueprint $table) {
            $table->dropColumn([
                'puissance', 'cylindree', 'nombre_vitesses', 'transmission',
                'nombre_portes', 'nombre_places', 'consommation', 'emissions_co2',
            ]);
        });
    }
};
