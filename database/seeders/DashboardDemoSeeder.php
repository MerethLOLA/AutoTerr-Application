<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Employe;
use App\Models\Location;
use App\Models\Vente;
use App\Models\Voiture;
use Carbon\Carbon;
use Illuminate\Database\Seeder;

class DashboardDemoSeeder extends Seeder
{
    public function run(): void
    {
        $employes = Employe::orderBy('id')->limit(5)->pluck('id')->toArray();
        $clients  = Client::pluck('id')->toArray();
        $voitures = Voiture::pluck('id')->toArray();

        if (empty($employes) || empty($clients) || empty($voitures)) {
            $this->command->warn('Données de base manquantes (employes/clients/voitures).');
            return;
        }

        // Créer quelques clients supplémentaires si nécessaire
        if (count($clients) < 5) {
            foreach ([
                ['nom' => 'Diallo', 'prenom' => 'Fatou',    'telephone' => '771234561', 'type_client' => 'particulier'],
                ['nom' => 'Sow',    'prenom' => 'Ibrahima', 'telephone' => '771234562', 'type_client' => 'particulier'],
                ['nom' => 'Ba',     'prenom' => 'Aminata',  'telephone' => '771234563', 'type_client' => 'particulier'],
            ] as $c) {
                $new = Client::create($c);
                $clients[] = $new->id;
            }
        }

        // Distribution ventes : [emp0 => 8, emp1 => 6, emp2 => 4, emp3 => 3, emp4 => 2]
        $distribution = [8, 6, 4, 3, 2];
        $vidx = 0;
        $modes = ['especes', 'virement', 'cheque', 'carte'];

        foreach ($employes as $k => $empId) {
            $nbVentes = $distribution[$k] ?? 1;
            for ($i = 0; $i < $nbVentes; $i++) {
                if ($vidx >= count($voitures)) break;
                $voitureId = $voitures[$vidx++];
                $clientId  = $clients[array_rand($clients)];
                $prix      = rand(3_000_000, 18_000_000);

                Vente::create([
                    'reference_vente' => 'VT-' . strtoupper(substr(uniqid(), -6)),
                    'date_vente'      => Carbon::now()->subDays(rand(1, 60)),
                    'id_client'       => $clientId,
                    'id_voiture'      => $voitureId,
                    'prix_final'      => $prix,
                    'mode_paiement'   => $modes[array_rand($modes)],
                    'statut'          => 'finalisee',
                    'id_employe'      => $empId,
                ]);
            }
        }

        // Locations récentes
        $locVoitures = array_slice($voitures, $vidx, 4);
        foreach ($locVoitures as $lv) {
            $clientId = $clients[array_rand($clients)];
            try {
                Location::create([
                    'id_voiture'       => $lv,
                    'id_client'        => $clientId,
                    'date_debut'       => Carbon::now()->subDays(rand(1, 10)),
                    'date_fin'         => Carbon::now()->addDays(rand(2, 7)),
                    'statut'           => 'en_cours',
                    'tarif_journalier' => rand(25_000, 75_000),
                ]);
            } catch (\Throwable) {
                // Champ manquant éventuel — on ignore pour le démo
            }
        }

        $this->command->info('Démo créée — ventes: ' . Vente::count() . ', locations: ' . Location::count());
    }
}
