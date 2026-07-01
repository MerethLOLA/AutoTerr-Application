<?php

namespace App\Console\Commands;

use App\Jobs\EnvoyerRappelFactureJob;
use App\Models\Facturation;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

class CheckFactureEcheancesCommand extends Command
{
    protected $signature   = 'autoterr:check-factures';
    protected $description = 'Envoyer des rappels pour les factures arrivant à échéance';

    public function handle(): int
    {
        $factures = Facturation::query()
            ->whereIn('statut', ['impayee', 'partiellement_payee', 'en_retard'])
            ->where(function ($q) {
                $q->whereDate('date_echeance', now()->addDays(3)->toDateString())
                  ->orWhere(function ($q2) {
                      $q2->whereDate('date_echeance', '<', now()->toDateString())
                         ->where('date_echeance', '>=', now()->subDays(7));
                  });
            })
            ->with(['vente.client'])
            ->get();

        $sent = 0;

        foreach ($factures as $facture) {
            $client = optional($facture->vente)->client;

            if (! $client || ! $client->email) {
                continue;
            }

            $cacheKey = "rappel_facture_{$facture->id}_" . now()->format('Y-m-d');

            if (Cache::has($cacheKey)) {
                continue;
            }

            EnvoyerRappelFactureJob::dispatch($facture);
            Cache::put($cacheKey, true, now()->addDay());
            $sent++;
        }

        $this->info("Rappels factures : {$sent} envoyé(s) sur {$factures->count()} trouvé(s).");

        return self::SUCCESS;
    }
}
