<?php

use App\Http\Controllers\AuthController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\EmployeController;
use App\Http\Controllers\FacturationController;
use App\Http\Controllers\FournisseurController;
use App\Http\Controllers\GarantieController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\MouvementStockController;
use App\Http\Controllers\OrdreTravailController;
use App\Http\Controllers\PaiementController;
use App\Http\Controllers\PieceStockController;
use App\Http\Controllers\ReportingController;
use App\Http\Controllers\TicketSavController;
use App\Http\Controllers\VenteController;
use App\Http\Controllers\VoitureController;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function () {
    Route::post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});

Route::middleware('auth:sanctum')->group(function () {
    Route::apiResources([
        'voitures' => VoitureController::class,
        'clients' => ClientController::class,
        'fournisseurs' => FournisseurController::class,
        'ventes' => VenteController::class,
        'facturations' => FacturationController::class,
        'paiements' => PaiementController::class,
        'documents' => DocumentController::class,
        'employes' => EmployeController::class,
        'locations' => LocationController::class,
    ]);

    Route::get('/garanties', [GarantieController::class, 'index']);
    Route::get('/garanties/{garantie}', [GarantieController::class, 'show']);
    Route::get('/garanties/{garantie}/export', [GarantieController::class, 'export']);
    Route::apiResource('tickets-sav', TicketSavController::class)->parameters(['tickets-sav' => 'ticketSav']);
    Route::apiResource('ordres-travail', OrdreTravailController::class)->parameters(['ordres-travail' => 'ordreTravail']);
    Route::apiResource('pieces-stock', PieceStockController::class)->parameters(['pieces-stock' => 'pieceStock']);
    Route::get('/mouvements-stock', [MouvementStockController::class, 'index']);
    Route::get('/mouvements-stock/{mouvementStock}', [MouvementStockController::class, 'show']);
    Route::get('/reporting', [ReportingController::class, 'index']);
    Route::get('/reporting/export', [ReportingController::class, 'export']);
});

Route::get('/voitures/public', [VoitureController::class, 'publicIndex']);
Route::get('/voitures/{voiture}/public', [VoitureController::class, 'publicShow']);

require __DIR__.'/api-internal.php';
