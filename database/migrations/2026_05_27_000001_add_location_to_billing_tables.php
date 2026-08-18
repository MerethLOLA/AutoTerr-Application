<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('facturations', function (Blueprint $table) {
            $table->unsignedBigInteger('id_vente')->nullable()->change();
            $table->foreignId('id_location')->nullable()->after('id_vente')
                ->constrained('locations')->nullOnDelete();
        });

        Schema::table('paiements', function (Blueprint $table) {
            $table->unsignedBigInteger('id_vente')->nullable()->change();
            $table->foreignId('id_location')->nullable()->after('id_vente')
                ->constrained('locations')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('paiements', function (Blueprint $table) {
            $table->dropConstrainedForeignId('id_location');
            $table->unsignedBigInteger('id_vente')->nullable(false)->change();
        });

        Schema::table('facturations', function (Blueprint $table) {
            $table->dropConstrainedForeignId('id_location');
            $table->unsignedBigInteger('id_vente')->nullable(false)->change();
        });
    }
};
