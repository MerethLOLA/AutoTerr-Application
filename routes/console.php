<?php

use App\Console\Commands\CheckFactureEcheancesCommand;
use App\Console\Commands\CheckLocationEcheancesCommand;
use App\Services\AutomationAlertService;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('autoterr:sync-alerts', function (AutomationAlertService $service) {
    $count = $service->sync()->count();
    $this->info("Alertes synchronisées: {$count}");
})->purpose('Synchroniser les alertes automatiques AutoTerr');

// ── Planificateur ─────────────────────────────────────────────────────────────

// Alertes internes : toutes les 5 minutes
Schedule::command('autoterr:sync-alerts')->everyFiveMinutes();

// Rappels locations et factures : chaque jour à 8h00
Schedule::command(CheckLocationEcheancesCommand::class)->dailyAt('08:00');
Schedule::command(CheckFactureEcheancesCommand::class)->dailyAt('08:15');

// Nettoyage des jobs échoués : chaque semaine
Schedule::command('queue:prune-failed --hours=168')->weekly();
