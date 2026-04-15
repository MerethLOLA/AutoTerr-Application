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
        Schema::create('employes', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('prenom')->nullable();
            $table->string('adresse')->nullable();
            $table->date('date_embauche')->nullable();
            $table->decimal('salaire', 15, 2)->nullable();
            $table->string('contrat')->nullable();
            $table->string('poste');
            $table->string('telephone')->nullable();
            $table->string('email')->nullable()->unique();
            $table->string('statut')->default('actif');
            $table->timestamps();
        });

        Schema::create('users', function (Blueprint $table) {
            $table->id();
            $table->string('name')->nullable();
            $table->string('username')->unique();
            $table->string('email')->unique();
            $table->timestamp('email_verified_at')->nullable();
            $table->string('password')->nullable();
            $table->string('password_hash');
            $table->string('role')->default('vendeur');
            $table->string('statut')->default('actif');
            $table->timestamp('last_login')->nullable();
            $table->timestamp('token_expiration')->nullable();
            $table->foreignId('id_employe')->nullable()->constrained('employes')->nullOnDelete();
            $table->rememberToken();
            $table->timestamps();
        });

        Schema::create('password_reset_tokens', function (Blueprint $table) {
            $table->string('email')->primary();
            $table->string('token');
            $table->timestamp('created_at')->nullable();
        });

        Schema::create('sessions', function (Blueprint $table) {
            $table->string('id')->primary();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete()->index();
            $table->string('ip_address', 45)->nullable();
            $table->text('user_agent')->nullable();
            $table->longText('payload');
            $table->integer('last_activity')->index();
        });

        Schema::create('permissions', function (Blueprint $table) {
            $table->id();
            $table->string('nom')->unique();
            $table->string('type')->nullable();
            $table->string('description', 500)->nullable();
        });

        Schema::create('role_permissions', function (Blueprint $table) {
            $table->id();
            $table->string('role');
            $table->foreignId('permission_id')->constrained('permissions')->cascadeOnDelete();
            $table->unique(['role', 'permission_id']);
        });

        Schema::create('action_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('action')->index();
            $table->string('module')->index();
            $table->string('target_type')->nullable();
            $table->unsignedBigInteger('target_id')->nullable();
            $table->json('details')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();
        });

        Schema::create('fournisseurs', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('adresse')->nullable();
            $table->string('telephone')->nullable();
            $table->string('contact')->nullable();
            $table->string('email')->nullable();
            $table->string('lien')->nullable();
            $table->string('adresse_bureau')->nullable();
            $table->string('pays_origine')->nullable();
            $table->text('vehicule_fournis')->nullable();
            $table->timestamps();
        });

        Schema::create('types_vehicules', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('type_gasoil')->nullable();
            $table->string('type_boite')->nullable();
            $table->string('carburant')->nullable();
            $table->text('description')->nullable();
        });

        Schema::create('origines_marques', function (Blueprint $table) {
            $table->id();
            $table->string('nom')->unique();
            $table->text('description')->nullable();
        });

        Schema::create('clients', function (Blueprint $table) {
            $table->id();
            $table->string('nom');
            $table->string('prenom')->nullable();
            $table->string('adresse')->nullable();
            $table->string('contact')->nullable();
            $table->string('telephone')->nullable();
            $table->string('email')->nullable()->unique();
            $table->string('piece_identite')->nullable();
            $table->string('numero_piece')->nullable();
            $table->string('numero_piece2')->nullable();
            $table->string('type_client')->nullable();
            $table->string('classe')->nullable();
            $table->string('raison_sociale')->nullable();
            $table->string('numero_siret')->nullable();
            $table->date('date_naissance')->nullable();
            $table->foreignId('id_vendeur_attribue')->nullable()->constrained('employes')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('voitures', function (Blueprint $table) {
            $table->id();
            $table->string('marque');
            $table->string('modele');
            $table->unsignedSmallInteger('annee')->nullable();
            $table->string('couleur')->nullable();
            $table->decimal('prix', 15, 2);
            $table->unsignedInteger('kilometrage')->nullable();
            $table->string('numero_chassis')->unique();
            $table->date('date_acquisition')->nullable();
            $table->string('statut')->default('disponible');
            $table->string('etat')->nullable();
            $table->string('energie')->nullable();
            $table->string('type_boite')->nullable();
            $table->foreignId('type_vehicule_id')->nullable()->constrained('types_vehicules')->nullOnDelete();
            $table->foreignId('origine_marque_id')->nullable()->constrained('origines_marques')->nullOnDelete();
            $table->foreignId('id_fournisseur')->nullable()->constrained('fournisseurs')->nullOnDelete();
            $table->text('description')->nullable();
            $table->timestamps();
        });

        Schema::create('image_voitures', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_voiture')->constrained('voitures')->cascadeOnDelete();
            $table->string('chemin');
            $table->string('vue')->nullable();
            $table->text('description')->nullable();
            $table->unsignedInteger('largeur')->nullable();
            $table->unsignedInteger('hauteur')->nullable();
            $table->unsignedBigInteger('taille')->nullable();
            $table->boolean('legible')->default(true);
        });

        Schema::create('ventes', function (Blueprint $table) {
            $table->id();
            $table->string('reference_vente')->unique();
            $table->date('date_vente');
            $table->foreignId('id_client')->constrained('clients')->cascadeOnDelete();
            $table->foreignId('id_voiture')->constrained('voitures')->restrictOnDelete();
            $table->decimal('prix_final', 15, 2);
            $table->string('mode_paiement')->nullable();
            $table->string('statut')->default('en_cours');
            $table->foreignId('id_employe')->constrained('employes')->restrictOnDelete();
            $table->text('observations')->nullable();
            $table->timestamps();
        });

        Schema::create('facturations', function (Blueprint $table) {
            $table->id();
            $table->string('numero_facture')->unique();
            $table->date('date_facture');
            $table->string('mode_livraison')->nullable();
            $table->decimal('montant', 15, 2)->nullable();
            $table->decimal('remise', 15, 2)->nullable();
            $table->decimal('montant_ht', 15, 2);
            $table->decimal('taux_tva', 5, 2)->default(18.00);
            $table->decimal('montant_ttc', 15, 2);
            $table->string('statut')->default('impayee');
            $table->date('date_echeance')->nullable();
            $table->text('observations')->nullable();
            $table->foreignId('id_vente')->unique()->constrained('ventes')->cascadeOnDelete();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('paiements', function (Blueprint $table) {
            $table->id();
            $table->date('date');
            $table->string('mode_paiement');
            $table->decimal('montant', 15, 2);
            $table->decimal('reste', 15, 2)->nullable();
            $table->foreignId('id_facture')->nullable()->constrained('facturations')->nullOnDelete();
            $table->foreignId('id_vente')->constrained('ventes')->cascadeOnDelete();
            $table->foreignId('id_client')->constrained('clients')->cascadeOnDelete();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('garanties', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_voiture')->unique()->constrained('voitures')->cascadeOnDelete();
            $table->unsignedInteger('duree_garantie')->nullable();
            $table->string('type_garantie')->nullable();
            $table->date('date_debut')->nullable();
            $table->date('date_fin')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_vente')->nullable()->constrained('ventes')->nullOnDelete();
            $table->foreignId('id_client')->nullable()->constrained('clients')->nullOnDelete();
            $table->foreignId('id_employe')->nullable()->constrained('employes')->nullOnDelete();
            $table->foreignId('id_voiture')->nullable()->constrained('voitures')->nullOnDelete();
            $table->string('type_document');
            $table->date('date_document')->nullable();
            $table->string('numero_document')->nullable();
            $table->date('date_production')->nullable();
            $table->date('date_expiration')->nullable();
            $table->string('chemin_fichier')->nullable();
            $table->timestamp('created_at')->useCurrent();
        });

        Schema::create('tickets_sav', function (Blueprint $table) {
            $table->id();
            $table->string('reference_ticket')->unique();
            $table->foreignId('id_client')->constrained('clients')->cascadeOnDelete();
            $table->foreignId('id_voiture')->constrained('voitures')->cascadeOnDelete();
            $table->foreignId('id_responsable')->constrained('employes')->restrictOnDelete();
            $table->foreignId('id_garantie')->nullable()->constrained('garanties')->nullOnDelete();
            $table->string('objet');
            $table->text('description')->nullable();
            $table->string('statut')->default('ouvert')->index();
            $table->string('priorite')->default('normale');
            $table->timestamp('date_ouverture')->useCurrent();
            $table->timestamp('date_resolution')->nullable();
            $table->timestamps();
        });

        Schema::create('interventions_sav', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_ticket_sav')->constrained('tickets_sav')->cascadeOnDelete();
            $table->foreignId('id_employe')->nullable()->constrained('employes')->nullOnDelete();
            $table->text('description');
            $table->string('statut')->default('en_cours')->index();
            $table->unsignedInteger('temps_passe_minutes')->default(0);
            $table->timestamp('date_intervention')->useCurrent();
            $table->timestamps();
        });

        Schema::create('pieces_stock', function (Blueprint $table) {
            $table->id();
            $table->string('reference')->unique();
            $table->string('designation');
            $table->text('description')->nullable();
            $table->decimal('prix_unitaire', 15, 2);
            $table->unsignedInteger('quantite_stock')->default(0);
            $table->unsignedInteger('seuil_alerte')->default(0);
            $table->foreignId('id_fournisseur')->nullable()->constrained('fournisseurs')->nullOnDelete();
            $table->string('statut')->default('actif')->index();
            $table->timestamps();
        });

        Schema::create('mouvements_stock', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_piece_stock')->constrained('pieces_stock')->cascadeOnDelete();
            $table->string('type_mouvement')->index();
            $table->unsignedInteger('quantite');
            $table->string('source_mouvement')->nullable();
            $table->string('reference_source')->nullable();
            $table->text('observations')->nullable();
            $table->timestamp('date_mouvement')->useCurrent()->index();
            $table->timestamps();
        });

        Schema::create('ordres_travail', function (Blueprint $table) {
            $table->id();
            $table->string('reference_ot')->unique();
            $table->foreignId('id_voiture')->constrained('voitures')->cascadeOnDelete();
            $table->foreignId('id_ticket_sav')->nullable()->constrained('tickets_sav')->nullOnDelete();
            $table->text('description');
            $table->string('priorite')->default('normale')->index();
            $table->timestamp('deadline')->nullable()->index();
            $table->string('statut')->default('ouvert')->index();
            $table->foreignId('id_technicien')->nullable()->constrained('employes')->nullOnDelete();
            $table->timestamps();
        });

        Schema::create('taches_atelier', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_ordre_travail')->constrained('ordres_travail')->cascadeOnDelete();
            $table->text('description');
            $table->string('statut')->default('a_faire')->index();
            $table->unsignedInteger('temps_passe_minutes')->default(0);
            $table->timestamps();
        });

        Schema::create('consommations_pieces', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_ordre_travail')->constrained('ordres_travail')->cascadeOnDelete();
            $table->foreignId('id_piece_stock')->constrained('pieces_stock')->restrictOnDelete();
            $table->unsignedInteger('quantite');
            $table->timestamp('date_consommation')->useCurrent();
            $table->timestamps();
        });

        Schema::create('locations', function (Blueprint $table) {
            $table->id();
            $table->string('reference_location')->unique();
            $table->foreignId('id_client')->constrained('clients')->cascadeOnDelete();
            $table->foreignId('id_voiture')->constrained('voitures')->restrictOnDelete();
            $table->timestamp('date_debut')->index();
            $table->timestamp('date_fin')->index();
            $table->timestamp('date_retour_effective')->nullable();
            $table->decimal('tarif_journalier', 15, 2);
            $table->decimal('caution', 15, 2)->nullable();
            $table->string('statut')->default('planifiee')->index();
            $table->text('observations')->nullable();
            $table->timestamps();
        });

        Schema::create('etats_lieux_locations', function (Blueprint $table) {
            $table->id();
            $table->foreignId('id_location')->constrained('locations')->cascadeOnDelete();
            $table->string('type_etat')->index();
            $table->text('description')->nullable();
            $table->string('chemin_photo')->nullable();
            $table->timestamp('date_etat')->useCurrent();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('documents');
        Schema::dropIfExists('etats_lieux_locations');
        Schema::dropIfExists('locations');
        Schema::dropIfExists('consommations_pieces');
        Schema::dropIfExists('taches_atelier');
        Schema::dropIfExists('ordres_travail');
        Schema::dropIfExists('mouvements_stock');
        Schema::dropIfExists('pieces_stock');
        Schema::dropIfExists('interventions_sav');
        Schema::dropIfExists('tickets_sav');
        Schema::dropIfExists('garanties');
        Schema::dropIfExists('paiements');
        Schema::dropIfExists('facturations');
        Schema::dropIfExists('ventes');
        Schema::dropIfExists('image_voitures');
        Schema::dropIfExists('voitures');
        Schema::dropIfExists('clients');
        Schema::dropIfExists('origines_marques');
        Schema::dropIfExists('types_vehicules');
        Schema::dropIfExists('fournisseurs');
        Schema::dropIfExists('action_logs');
        Schema::dropIfExists('role_permissions');
        Schema::dropIfExists('permissions');
        Schema::dropIfExists('users');
        Schema::dropIfExists('employes');
        Schema::dropIfExists('password_reset_tokens');
        Schema::dropIfExists('sessions');
    }
};
