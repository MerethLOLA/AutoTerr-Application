<?php

namespace App\Providers;

use App\Events\DemandeClientRecue;
use App\Events\FactureEcheanceProche;
use App\Events\LocationEcheanceProche;
use App\Jobs\EnvoyerRappelFactureJob;
use App\Jobs\EnvoyerRappelLocationJob;
use App\Jobs\ProcessDemandeNotificationJob;
use App\Services\AutomationAlertService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\View;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void {}

    public function boot(): void
    {
        // ── Event → Job mappings ──────────────────────────────────────────────
        Event::listen(LocationEcheanceProche::class, function (LocationEcheanceProche $event) {
            EnvoyerRappelLocationJob::dispatch($event->location);
        });

        Event::listen(FactureEcheanceProche::class, function (FactureEcheanceProche $event) {
            EnvoyerRappelFactureJob::dispatch($event->facture);
        });

        Event::listen(DemandeClientRecue::class, function (DemandeClientRecue $event) {
            ProcessDemandeNotificationJob::dispatch($event->demande);
        });

        // ── Blade view composer (Breeze layouts) ─────────────────────────────
        View::composer('layouts.navigation', function ($view) {
            if (! Auth::check() || Auth::user()?->role === 'client') {
                $view->with('notificationsInternes', collect());
                return;
            }

            $service = app(AutomationAlertService::class);
            $service->syncIfStale();

            $view->with('notificationsInternes', $service->unread());
        });
    }
}
