<?php

use App\Services\AutomationAlertService;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('sunupark:sync-alerts', function (AutomationAlertService $service) {
    $count = $service->sync()->count();

    $this->info("Alertes synchronisees: {$count}");
})->purpose('Synchroniser les alertes automatiques SunuPark');

Schedule::command('sunupark:sync-alerts')->everyFiveMinutes();
