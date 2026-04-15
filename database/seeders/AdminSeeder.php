<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;

class AdminSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Créer ou mettre à jour l'admin Rebecca
        User::updateOrCreate(
            ['username' => 'rebecca'],
            [
                'id' => 12,
                'name' => 'REBECCA LOLA',
                'email' => 'lolarebecca@dksunu.com',
                'password' => '$2y$12$zOHvc7JqOU8BPRdd76ktIeDEQg4s8SmCmXLquHlBh8uD23NiS6.Pq',
                'password_hash' => '$2y$12$93etE1FM4BLNALxDHHGSte.CluFI7/ODP3G9JWJIC9weKCALi9iiW',
                'profile_photo_path' => 'profile-photos/VlxVHuh5IEhDCNAa0tzAODXCGXp9IJK3mSYRa28S.jpg',
                'role' => 'admin',
                'statut' => 'actif',
                'theme' => 'dark',
                'locale' => 'fr',
            ]
        );

        $this->command->info('Admin Rebecca créé/mis à jour avec succès!');
    }
}
