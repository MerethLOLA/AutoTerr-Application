<?php

namespace Database\Seeders;

use App\Models\Voiture;
use Illuminate\Database\Seeder;

class VoitureSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $voitures = [
            [
                'marque' => 'Toyota',
                'modele' => 'Corolla',
                'annee' => 2020,
                'prix' => 45000.00,
                'statut' => 'disponible',
                'numero_chassis' => 'JT123456789',
                'kilometrage' => 50000,
                'energie' => 'Essence',
                'couleur' => 'Blanc',
            ],
            [
                'marque' => 'Renault',
                'modele' => 'Clio',
                'annee' => 2019,
                'prix' => 35000.00,
                'statut' => 'location',
                'numero_chassis' => 'VF123456789',
                'kilometrage' => 75000,
                'energie' => 'Diesel',
                'couleur' => 'Bleu',
            ],
            [
                'marque' => 'Peugeot',
                'modele' => '208',
                'annee' => 2021,
                'prix' => 42000.00,
                'statut' => 'maintenance',
                'numero_chassis' => 'VF223456789',
                'kilometrage' => 30000,
                'energie' => 'Essence',
                'couleur' => 'Rouge',
            ],
        ];

        foreach ($voitures as $voiture) {
            Voiture::create($voiture);
        }
    }
}
