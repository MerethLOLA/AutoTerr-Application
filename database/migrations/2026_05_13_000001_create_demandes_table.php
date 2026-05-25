<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('demandes', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['information', 'reprise', 'essai'])->index();
            $table->enum('statut', ['en_attente', 'traite', 'archive'])->default('en_attente')->index();
            $table->string('nom');
            $table->string('email');
            $table->string('telephone')->nullable();
            $table->text('message')->nullable();
            $table->foreignId('id_voiture')->nullable()->constrained('voitures')->nullOnDelete();
            // Reprise
            $table->string('reprise_marque')->nullable();
            $table->string('reprise_modele')->nullable();
            $table->year('reprise_annee')->nullable();
            $table->unsignedInteger('reprise_kilometrage')->nullable();
            $table->string('reprise_etat')->nullable(); // bon / moyen / mauvais
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('demandes');
    }
};
