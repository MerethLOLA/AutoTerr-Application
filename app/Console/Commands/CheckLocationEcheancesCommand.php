<?php

namespace App\Console\Commands;

use App\Jobs\EnvoyerRappelLocationJob;
use App\Models\Location;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Cache;

class CheckLocationEcheancesCommand extends Command
{
    protected $signature   = 'autoterr:check-locations';
    protected $description = 'Envoyer des rappels pour les locations arrivant à échéance';

    public function handle(): int
    {
        $bascules = Location::query()
            ->whereIn('statut', ['planifiee', 'en_cours'])
            ->whereDate('date_fin', '<', now()->toDateString())
            ->whereNull('date_retour_effective')
            ->update(['statut' => 'en_retard']);

        $locations = Location::query()
            ->whereIn('statut', ['planifiee', 'en_cours', 'en_retard'])
            ->where(function ($q) {
                // Locations finissant dans exactement 2 jours ou déjà en retard (non notifiées aujourd'hui)
                $q->whereDate('date_fin', now()->addDays(2)->toDateString())
                  ->orWhere(function ($q2) {
                      $q2->whereDate('date_fin', '<', now()->toDateString())
                         ->where('date_fin', '>=', now()->subDays(3));
                  });
            })
            ->with(['client', 'voiture'])
            ->get();

        $sent = 0;

        foreach ($locations as $location) {
            $cacheKey = "rappel_location_{$location->id}_" . now()->format('Y-m-d');

            if (Cache::has($cacheKey)) {
                continue;
            }

            EnvoyerRappelLocationJob::dispatch($location);
            Cache::put($cacheKey, true, now()->addDay());
            $sent++;
        }

        $this->info("Locations basculées en retard : {$bascules}. Rappels : {$sent} envoyé(s) sur {$locations->count()} trouvé(s).");

        return self::SUCCESS;
    }
}
