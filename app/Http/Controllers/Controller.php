<?php

namespace App\Http\Controllers;

use App\Services\ActionLogger;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

abstract class Controller
{
    protected function ensurePermission(string $permission): void
    {
        $user = auth()->user();

        abort_unless($user && $user->hasPermission($permission), 403, 'Permission insuffisante.');
    }

    protected function logAction(string $action, string $module, ?Model $target = null, array $details = [], ?Request $request = null): void
    {
        app(ActionLogger::class)->log($action, $module, $target, $details, $request);
    }

    protected function resetDashboardCache(): void
    {
        Cache::forget('dashboard.kpis');
    }
}
