<?php

namespace App\Providers;

use App\Services\AutomationAlertService;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\ServiceProvider;
use Illuminate\Support\Facades\View;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
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
