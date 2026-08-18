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
        // Les entretiens sont pris en charge par l'entreprise (maintenance de la
        // flotte) et ne sont pas facturés : le coût n'a pas lieu d'être ici.
        Schema::table('entretiens', function (Blueprint $table) {
            $table->dropColumn('cout');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('entretiens', function (Blueprint $table) {
            $table->decimal('cout', 15, 2)->nullable();
        });
    }
};
