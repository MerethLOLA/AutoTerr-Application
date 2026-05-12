<?php

use App\Http\Controllers\AssuranceController;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\CarburantController;
use App\Http\Controllers\ClientController;
use App\Http\Controllers\ControleTechniqueController;
use App\Http\Controllers\CustomerPortalController;
use App\Http\Controllers\DocumentController;
use App\Http\Controllers\EmployeController;
use App\Http\Controllers\EntretienController;
use App\Http\Controllers\FacturationController;
use App\Http\Controllers\FournisseurController;
use App\Http\Controllers\GarantieController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\MouvementStockController;
use App\Http\Controllers\OrdreTravailController;
use App\Http\Controllers\PaiementController;
use App\Http\Controllers\PieceStockController;
use App\Http\Controllers\ReportingController;
use App\Http\Controllers\SinistreController;
use App\Http\Controllers\TicketSavController;
use App\Http\Controllers\UserSettingsController;
use App\Http\Controllers\VenteController;
use App\Http\Controllers\VoitureController;
use Illuminate\Support\Facades\Route;

Route::get('/voitures/public', [VoitureController::class, 'publicIndex']);
Route::get('/voitures/{voiture}/public', [VoitureController::class, 'publicShow']);

Route::prefix('auth')->group(function () {
    Route::middleware('throttle:10,1')->post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});

Route::middleware('auth:sanctum')->group(function () {
    // Routes statiques voitures avant le resource (évite conflit avec {voiture})
    Route::get('/voitures/form-options', [VoitureController::class, 'formOptions']);
    Route::delete('/voitures/{voiture}/images/{image}', [VoitureController::class, 'deleteImage']);

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
        'garanties' => GarantieController::class,
    ]);

    Route::post('/locations/{location}/etats-lieux', [LocationController::class, 'addEtatLieu']);
    Route::get('/garanties/{garantie}/export',      [GarantieController::class,    'export']);
    Route::get('/facturations/{facturation}/export', [FacturationController::class, 'export']);
    Route::get('/paiements/{paiement}/export',       [PaiementController::class,    'export']);
    Route::get('/locations/{location}/export',       [LocationController::class,    'export']);
    Route::apiResource('tickets-sav', TicketSavController::class)->parameters(['tickets-sav' => 'ticketSav']);
    Route::apiResource('ordres-travail', OrdreTravailController::class)->parameters(['ordres-travail' => 'ordreTravail']);
    Route::apiResource('pieces-stock', PieceStockController::class)->parameters(['pieces-stock' => 'pieceStock']);
    Route::get('/mouvements-stock', [MouvementStockController::class, 'index']);
    Route::get('/mouvements-stock/{mouvementStock}', [MouvementStockController::class, 'show']);

    // Nouveaux modules parc complet
    Route::apiResource('assurances', AssuranceController::class);
    Route::apiResource('carburants', CarburantController::class);
    Route::apiResource('controles-techniques', ControleTechniqueController::class)
        ->parameters(['controles-techniques' => 'controleTechnique']);
    Route::apiResource('sinistres', SinistreController::class);
    Route::apiResource('entretiens', EntretienController::class);

    // Historique complet d'un véhicule
    Route::get('/voitures/{voiture}/historique', [VoitureController::class, 'historique']);

    // Alertes d'expiration (assurances, CT, entretiens)
    Route::get('/alertes/expirations', [VoitureController::class, 'alertesExpirations']);
    Route::get('/reporting', [ReportingController::class, 'index']);
    Route::get('/reporting/export', [ReportingController::class, 'export']);
    Route::get('/customer/portal', [CustomerPortalController::class, 'summary']);
    Route::post('/customer/reservations', [CustomerPortalController::class, 'reserve']);
    Route::put('/user/profile', [UserSettingsController::class, 'updateProfile']);
    Route::put('/user/preferences', [UserSettingsController::class, 'updatePreferences']);
    Route::put('/user/password', [UserSettingsController::class, 'updatePassword']);
    Route::post('/user/logout-all-devices', [UserSettingsController::class, 'logoutAllDevices']);
    Route::delete('/user/account', [UserSettingsController::class, 'deleteAccount']);
    Route::get('/notifications/counts', [UserSettingsController::class, 'notificationCounts']);
    Route::get('/notifications', [UserSettingsController::class, 'notifications']);
    Route::patch('/notifications/{notificationInterne}/read', [UserSettingsController::class, 'markNotificationAsRead']);
});

require __DIR__.'/api-internal.php';
