<?php

namespace App\Http\Controllers;

use App\Services\ActionLogger;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

abstract class Controller
{
    protected function ensurePermission(string $permission): void
    {
        $user = auth()->user();

        abort_unless($user && $user->hasPermission($permission), 403, 'Permission insuffisante.');
    }

    protected function ensureRole(string ...$roles): void
    {
        $user = auth()->user();

        abort_unless($user && in_array($user->role, $roles, true), 403, 'Rôle insuffisant.');
    }

    protected function logAction(string $action, string $module, ?Model $target = null, array $details = [], ?Request $request = null): void
    {
        app(ActionLogger::class)->log($action, $module, $target, $details, $request);
    }

    protected function resetDashboardCache(): void
    {
        Cache::forget('dashboard.kpis');
    }

    protected function apiItem(mixed $data, int $status = 200, array $extra = []): JsonResponse
    {
        return response()->json(array_merge([
            'data' => $data,
        ], $extra), $status);
    }

    protected function apiCollection(LengthAwarePaginator $paginator, array $extra = []): JsonResponse
    {
        return response()->json(array_merge([
            'data' => $paginator->items(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'per_page' => $paginator->perPage(),
                'total' => $paginator->total(),
            ],
        ], $extra));
    }

    protected function apiDeleted(): JsonResponse
    {
        return response()->json([
            'message' => 'Suppression effectuee',
        ]);
    }
}
