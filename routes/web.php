<?php

use Illuminate\Support\Facades\Route;

// Le frontend (Next.js) est un service séparé — ce backend est API-only.
// La vue Blade "auth.login" référencée ici auparavant a été retirée quand
// le projet est passé à ce modèle, laissant GET / planter en 500.
Route::get('/', function () {
    $frontendUrl = env('FRONTEND_URL');

    if ($frontendUrl) {
        return redirect()->away($frontendUrl);
    }

    return response()->json(['status' => 'ok', 'service' => 'AutoTerr API']);
})->name('home');

// Laravel's default auth middleware redirects unauthenticated non-JSON requests
// to route('login'). Without this named route, that redirect itself throws
// (RouteNotFoundException), turning every 401 into an unrelated 500.
Route::get('/login', fn () => response()->json(['message' => 'Unauthenticated.'], 401))->name('login');
