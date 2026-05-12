<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // Assurances véhicule
        Schema::create('assurances', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_voiture')->constrained('voitures')->cascadeOnDelete();
            $table->string('compagnie');
            $table->string('numero_police')->nullable();
            $table->string('type_assurance')->default('tous_risques');
            $table->date('date_debut');
            $table->date('date_fin');
            $table->decimal('montant_prime', 15, 2)->nullable();
            $table->string('statut')->default('active');
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // Relevés carburant
        Schema::create('carburants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_voiture')->constrained('voitures')->cascadeOnDelete();
            $table->date('date_plein');
            $table->unsignedInteger('kilometrage_au_plein')->nullable();
            $table->decimal('quantite_litres', 8, 2)->nullable();
            $table->decimal('prix_par_litre', 8, 2)->nullable();
            $table->decimal('montant_total', 15, 2);
            $table->string('type_carburant')->default('essence');
            $table->string('station')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // Contrôles techniques
        Schema::create('controles_techniques', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_voiture')->constrained('voitures')->cascadeOnDelete();
            $table->string('type_controle')->default('periodique');
            $table->date('date_controle');
            $table->date('date_expiration')->nullable();
            $table->string('resultat')->default('favorable');
            $table->string('organisme')->nullable();
            $table->decimal('cout', 15, 2)->nullable();
            $table->text('observations')->nullable();
            $table->timestamps();
        });

        // Sinistres / accidents
        Schema::create('sinistres', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_voiture')->constrained('voitures')->cascadeOnDelete();
            $table->foreignId('id_client')->nullable()->constrained('clients')->nullOnDelete();
            $table->foreignId('id_assurance')->nullable()->constrained('assurances')->nullOnDelete();
            $table->date('date_sinistre');
            $table->string('type_sinistre')->default('accident');
            $table->text('description');
            $table->decimal('montant_dommages', 15, 2)->nullable();
            $table->string('statut')->default('declare');
            $table->string('numero_declaration')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // Entretiens / maintenance préventive
        Schema::create('entretiens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_voiture')->constrained('voitures')->cascadeOnDelete();
            $table->foreignId('id_technicien')->nullable()->constrained('employes')->nullOnDelete();
            $table->string('type_entretien');
            $table->date('date_prevue')->nullable();
            $table->date('date_realise')->nullable();
            $table->unsignedInteger('kilometrage_prevu')->nullable();
            $table->unsignedInteger('kilometrage_realise')->nullable();
            $table->decimal('cout', 15, 2)->nullable();
            $table->string('statut')->default('planifie');
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('entretiens');
        Schema::dropIfExists('sinistres');
        Schema::dropIfExists('controles_techniques');
        Schema::dropIfExists('carburants');
        Schema::dropIfExists('assurances');
    }
};
