<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Employe;
use Illuminate\Database\Seeder;

class EmployeClientDemoSeeder extends Seeder
{
    public function run(): void
    {
        $this->call(RolesTableSeeder::class);

        $employes = [
            ['nom' => 'Ndiaye', 'prenom' => 'Moussa', 'poste' => 'Commercial', 'telephone' => '771000001', 'email' => 'moussa.ndiaye@sunupark.sn', 'adresse' => 'Dakar, Plateau', 'date_embauche' => '2024-02-01', 'salaire' => 250000, 'contrat' => 'CDI', 'statut' => 'actif'],
            ['nom' => 'Diop', 'prenom' => 'Awa', 'poste' => 'Responsable Commercial', 'telephone' => '771000002', 'email' => 'awa.diop@sunupark.sn', 'adresse' => 'Dakar, Almadies', 'date_embauche' => '2023-09-15', 'salaire' => 400000, 'contrat' => 'CDI', 'statut' => 'actif'],
            ['nom' => 'Fall', 'prenom' => 'Cheikh', 'poste' => 'Technicien Atelier', 'telephone' => '771000003', 'email' => 'cheikh.fall@sunupark.sn', 'adresse' => 'Pikine', 'date_embauche' => '2024-05-10', 'salaire' => 200000, 'contrat' => 'CDD', 'statut' => 'actif'],
            ['nom' => 'Sarr', 'prenom' => 'Bineta', 'poste' => 'Conseiller SAV', 'telephone' => '771000004', 'email' => 'bineta.sarr@sunupark.sn', 'adresse' => 'Guédiawaye', 'date_embauche' => '2024-01-20', 'salaire' => 220000, 'contrat' => 'CDI', 'statut' => 'actif'],
            ['nom' => 'Gueye', 'prenom' => 'Ousmane', 'poste' => 'Commercial', 'telephone' => '771000005', 'email' => 'ousmane.gueye@sunupark.sn', 'adresse' => 'Rufisque', 'date_embauche' => '2024-06-01', 'salaire' => 210000, 'contrat' => 'CDI', 'statut' => 'actif'],
            ['nom' => 'Ba', 'prenom' => 'Aissatou', 'poste' => 'Comptable', 'telephone' => '771000006', 'email' => 'aissatou.ba@sunupark.sn', 'adresse' => 'Dakar, Sacré-Cœur', 'date_embauche' => '2023-11-05', 'salaire' => 350000, 'contrat' => 'CDI', 'statut' => 'actif'],
            ['nom' => 'Sy', 'prenom' => 'Modou', 'poste' => 'Responsable Commercial', 'telephone' => '771000007', 'email' => 'modou.sy@sunupark.sn', 'adresse' => 'Dakar, Mermoz', 'date_embauche' => '2024-03-18', 'salaire' => 260000, 'contrat' => 'CDD', 'statut' => 'actif'],
            ['nom' => 'Diallo', 'prenom' => 'Khady', 'poste' => 'Administrateur', 'telephone' => '771000008', 'email' => 'khady.diallo@sunupark.sn', 'adresse' => 'Dakar, Yoff', 'date_embauche' => '2023-06-01', 'salaire' => 450000, 'contrat' => 'CDI', 'statut' => 'actif'],
        ];

        foreach ($employes as $e) {
            Employe::updateOrCreate(['email' => $e['email']], $e);
        }

        $clients = [
            ['nom' => 'Diagne', 'prenom' => 'Fatou', 'telephone' => '772000001', 'email' => 'fatou.diagne@gmail.com', 'adresse' => 'Dakar, Ouakam', 'type_client' => 'particulier', 'piece_identite' => 'CNI', 'numero_piece' => 'SN10012345', 'date_naissance' => '1990-04-12'],
            ['nom' => 'Sow', 'prenom' => 'Ibrahima', 'telephone' => '772000002', 'email' => 'ibrahima.sow@gmail.com', 'adresse' => 'Thiès', 'type_client' => 'particulier', 'piece_identite' => 'CNI', 'numero_piece' => 'SN10012346', 'date_naissance' => '1985-11-23'],
            ['nom' => 'Camara', 'prenom' => 'Aminata', 'telephone' => '772000003', 'email' => 'aminata.camara@gmail.com', 'adresse' => 'Dakar, Parcelles Assainies', 'type_client' => 'particulier', 'piece_identite' => 'Passeport', 'numero_piece' => 'SNPP001234', 'date_naissance' => '1995-07-03'],
            ['nom' => 'Kane', 'prenom' => 'Mamadou', 'telephone' => '772000004', 'email' => 'mamadou.kane@gmail.com', 'adresse' => 'Saint-Louis', 'type_client' => 'particulier', 'piece_identite' => 'CNI', 'numero_piece' => 'SN10012347', 'date_naissance' => '1988-01-30'],
            ['nom' => 'Transports Baobab', 'prenom' => null, 'telephone' => '338000001', 'email' => 'contact@baobab-transport.sn', 'adresse' => 'Dakar, Zone Industrielle', 'type_client' => 'entreprise', 'raison_sociale' => 'Transports Baobab SARL', 'numero_siret' => 'SN-RC-2019-B-1234'],
            ['nom' => 'Groupe Teranga', 'prenom' => null, 'telephone' => '338000002', 'email' => 'info@groupeteranga.sn', 'adresse' => 'Dakar, Point E', 'type_client' => 'entreprise', 'raison_sociale' => 'Groupe Teranga SA', 'numero_siret' => 'SN-RC-2018-A-5678'],
            ['nom' => 'Ndoye', 'prenom' => 'Ramatoulaye', 'telephone' => '772000005', 'email' => 'ramatoulaye.ndoye@gmail.com', 'adresse' => 'Dakar, Liberté 6', 'type_client' => 'particulier', 'piece_identite' => 'CNI', 'numero_piece' => 'SN10012348', 'date_naissance' => '1992-09-17'],
            ['nom' => 'Faye', 'prenom' => 'Alioune', 'telephone' => '772000006', 'email' => 'alioune.faye@gmail.com', 'adresse' => 'Mbour', 'type_client' => 'particulier', 'piece_identite' => 'CNI', 'numero_piece' => 'SN10012349', 'date_naissance' => '1998-03-05'],
        ];

        foreach ($clients as $c) {
            Client::updateOrCreate(['email' => $c['email']], $c);
        }

        $this->command->info('Démo employés/clients créée — employes: ' . Employe::count() . ', clients: ' . Client::count());
    }
}
