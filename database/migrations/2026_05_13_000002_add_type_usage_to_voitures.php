<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('voitures', function (Blueprint $table) {
            $table->enum('type_usage', ['location', 'vente', 'les_deux'])
                  ->default('les_deux')
                  ->after('statut');
        });
    }

    public function down(): void
    {
        Schema::table('voitures', function (Blueprint $table) {
            $table->dropColumn('type_usage');
        });
    }
};
