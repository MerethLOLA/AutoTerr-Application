<?php

namespace Database\Seeders;

use App\Models\Client;
use App\Models\Employe;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class UserAccountsDemoSeeder extends Seeder
{
    public function run(): void
    {
        $hash = Hash::make('passer');

        $roleByPoste = [
            'Commercial' => 'commercial',
            'Responsable Commercial' => 'manager',
            'Technicien Atelier' => 'atelier',
            'Conseiller SAV' => 'sav',
            'Comptable' => 'accountant',
            'Administrateur' => 'admin',
        ];

        Employe::query()->each(function (Employe $employe) use ($hash, $roleByPoste) {
            if (! $employe->email) {
                return;
            }

            User::updateOrCreate(
                ['email' => $employe->email],
                [
                    'username' => Str::before($employe->email, '@'),
                    'name' => trim("{$employe->prenom} {$employe->nom}"),
                    'password' => $hash,
                    'password_hash' => $hash,
                    'role' => $roleByPoste[$employe->poste] ?? 'commercial',
                    'statut' => 'actif',
                    'id_employe' => $employe->id,
                ]
            );
        });

        Client::query()->each(function (Client $client) use ($hash) {
            if (! $client->email) {
                return;
            }

            User::updateOrCreate(
                ['email' => $client->email],
                [
                    'username' => Str::before($client->email, '@'),
                    'name' => trim("{$client->prenom} {$client->nom}"),
                    'password' => $hash,
                    'password_hash' => $hash,
                    'role' => 'client',
                    'statut' => 'actif',
                ]
            );
        });

        $this->command->info('Comptes utilisateurs démo créés: ' . User::count());
    }
}
