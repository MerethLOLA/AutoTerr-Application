<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\RolePermission;
use Illuminate\Database\Seeder;

class PermissionRoleSeeder extends Seeder
{
    public function run(): void
    {
        $permissions = [
            'view_dashboard' => ['type' => 'general', 'description' => 'Acceder au tableau de bord'],
            'view_reporting' => ['type' => 'general', 'description' => 'Consulter les syntheses et exports de reporting'],
            'view_voitures' => ['type' => 'commercial', 'description' => 'Consulter les vehicules'],
            'view_clients' => ['type' => 'commercial', 'description' => 'Consulter les clients'],
            'view_fournisseurs' => ['type' => 'stock', 'description' => 'Consulter les fournisseurs'],
            'view_paiements' => ['type' => 'finance', 'description' => 'Consulter les paiements'],
            'view_stock' => ['type' => 'stock', 'description' => 'Consulter le stock'],
            'create_vente' => ['type' => 'commercial', 'description' => 'Creer une vente'],
            'manage_ventes' => ['type' => 'commercial', 'description' => 'Piloter ventes et facturation'],
            'manage_recouvrement' => ['type' => 'finance', 'description' => 'Piloter paiements et recouvrement'],
            'manage_location' => ['type' => 'location', 'description' => 'Piloter reservations et locations'],
            'create_ticket' => ['type' => 'sav', 'description' => 'Ouvrir un ticket SAV'],
            'manage_sav' => ['type' => 'sav', 'description' => 'Piloter SAV et interventions'],
            'manage_atelier' => ['type' => 'atelier', 'description' => 'Piloter ordres de travail atelier'],
            'assign_taches' => ['type' => 'atelier', 'description' => 'Assigner taches et consommations atelier'],
            'manage_stock' => ['type' => 'stock', 'description' => 'Piloter stock et approvisionnements'],
        ];

        foreach ($permissions as $name => $meta) {
            Permission::query()->updateOrCreate(
                ['nom' => $name],
                $meta
            );
        }

        $matrix = [
            'commercial' => [
                'view_dashboard',
                'view_reporting',
                'view_voitures',
                'view_clients',
                'create_vente',
                'manage_ventes',
                'manage_recouvrement',
                'view_paiements',
            ],
            'agent_location' => [
                'view_dashboard',
                'view_reporting',
                'view_voitures',
                'view_clients',
                'manage_location',
            ],
            'sav' => [
                'view_dashboard',
                'view_reporting',
                'view_voitures',
                'view_clients',
                'create_ticket',
                'manage_sav',
            ],
            'atelier' => [
                'view_dashboard',
                'view_reporting',
                'view_voitures',
                'manage_atelier',
                'assign_taches',
                'view_stock',
            ],
            'stock' => [
                'view_dashboard',
                'view_reporting',
                'view_stock',
                'manage_stock',
                'view_fournisseurs',
            ],
            'client' => [],
        ];

        RolePermission::query()->delete();

        foreach ($matrix as $role => $permissionNames) {
            $permissionIds = Permission::query()
                ->whereIn('nom', $permissionNames)
                ->pluck('id');

            foreach ($permissionIds as $permissionId) {
                RolePermission::query()->create([
                    'role' => $role,
                    'permission_id' => $permissionId,
                ]);
            }
        }
    }
}
