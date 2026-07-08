<?php
namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class RolesTableSeeder extends Seeder
{
    /**
     * Run the database seeds.
     *
     * @return void
     */
    public function run()
    {
        $now = now();

        $roles = [
            ['key' => 'role_insurance', 'name' => 'Assureur', 'description' => 'Gestion des dossiers sinistres et liaison avec les compagnies d\'assurance'],
            ['key' => 'role_service_advisor', 'name' => 'Conseiller SAV', 'description' => 'Réception et suivi des réclamations SAV, communication client'],
            ['key' => 'role_technician', 'name' => 'Technicien Atelier', 'description' => 'Diagnostic, interventions et mise à jour des ordres de travail'],
            ['key' => 'role_rental_agent', 'name' => 'Agent Location', 'description' => 'Gestion des contrats de location et états véhicules'],
            ['key' => 'role_sales', 'name' => 'Commercial', 'description' => 'Ventes, offres et gestion des prospects'],
            ['key' => 'role_fleet_manager', 'name' => 'Responsable Parc', 'description' => 'Supervision de la flotte et plannings de maintenance'],
            ['key' => 'role_accountant', 'name' => 'Comptable', 'description' => 'Facturation, encaissements et rapprochements'],
            ['key' => 'role_admin', 'name' => 'Administrateur', 'description' => 'Gestion des utilisateurs, droits et rapports'],
            ['key' => 'role_client', 'name' => 'Client', 'description' => 'Accès front‑office pour gestion personnelle, réservations et historique']
        ];

        foreach ($roles as $role) {
            DB::table('roles')->updateOrInsert(
                ['key' => $role['key']],
                [
                    'name' => $role['name'],
                    'description' => $role['description'],
                    'created_at' => $now,
                    'updated_at' => $now,
                ]
            );
        }
    }
}
