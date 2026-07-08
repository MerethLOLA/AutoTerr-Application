<?php

use App\Http\Controllers\AssuranceController;
use App\Http\Controllers\ChatbotController;
use App\Http\Controllers\ContactController;
use App\Http\Controllers\DemandeController;
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
use App\Http\Controllers\UserManagementController;
use App\Http\Controllers\UserSettingsController;
use App\Http\Controllers\VenteController;
use App\Http\Controllers\LikeController;
use App\Http\Controllers\VoitureController;
use Illuminate\Support\Facades\Route;

// ── Health check (Docker) ────────────────────────────────────────────────────
Route::get('/health', fn () => response()->json(['status' => 'ok', 'ts' => now()->toISOString()]));

// ── Routes publiques ──────────────────────────────────────────────────────────
Route::get('/voitures/public', [VoitureController::class, 'publicIndex']);
Route::get('/voitures/{voiture}/public', [VoitureController::class, 'publicShow']);
Route::post('/voitures/{voiture}/like', [LikeController::class, 'toggle']);
Route::get('/voitures/{voiture}/like/status', [LikeController::class, 'status']);
Route::middleware('throttle:10,1')->post('/demandes', [DemandeController::class, 'store']);
Route::middleware('throttle:5,1')->post('/contact', [ContactController::class, 'store']);

// ── Chatbot IA (limité à 15 req/min par IP) ───────────────────────────────────
Route::middleware('throttle:15,1')->post('/chatbot/message', [ChatbotController::class, 'message']);

// ── Authentification ──────────────────────────────────────────────────────────
Route::prefix('auth')->group(function () {
    Route::middleware('throttle:5,1')->post('/register', [AuthController::class, 'register']);
    Route::middleware('throttle:10,1')->post('/login', [AuthController::class, 'login']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::post('/logout', [AuthController::class, 'logout']);
        Route::get('/me', [AuthController::class, 'me']);
    });
});

// ── Paramètres utilisateur (tout utilisateur authentifié) ─────────────────────
Route::middleware('auth:sanctum')->group(function () {
    Route::put('/user/profile', [UserSettingsController::class, 'updateProfile']);
    Route::post('/user/photo', [UserSettingsController::class, 'uploadPhoto']);
    Route::put('/user/preferences', [UserSettingsController::class, 'updatePreferences']);
    Route::put('/user/password', [UserSettingsController::class, 'updatePassword']);
    Route::post('/user/logout-all-devices', [UserSettingsController::class, 'logoutAllDevices']);
    Route::delete('/user/account', [UserSettingsController::class, 'deleteAccount']);
    Route::get('/notifications/counts', [UserSettingsController::class, 'notificationCounts']);
    Route::get('/notifications', [UserSettingsController::class, 'notifications']);
    Route::patch('/notifications/{notificationInterne}/read', [UserSettingsController::class, 'markNotificationAsRead']);
});

// ── Portail client (rôle client uniquement) ───────────────────────────────────
Route::middleware(['auth:sanctum', 'role:client'])->group(function () {
    Route::get('/customer/portal', [CustomerPortalController::class, 'summary']);
    Route::post('/customer/reservations', [CustomerPortalController::class, 'reserve']);
});

// ── Routes employés (tous sauf client) ───────────────────────────────────────
$employeeRoles = 'admin,super_admin,manager,commercial,agent_location,sav,atelier,stock,assurance,accountant';

Route::middleware(['auth:sanctum', "role:{$employeeRoles}"])->group(function () {

    // Sélecteur d'employés filtrable (accessible à tous les rôles employé)
    Route::get('/employes/select', [EmployeController::class, 'forSelect']);

    // Voitures
    Route::get('/voitures/form-options', [VoitureController::class, 'formOptions']);
    Route::delete('/voitures/{voiture}/images/{image}', [VoitureController::class, 'deleteImage']);
    Route::get('/voitures/{voiture}/historique', [VoitureController::class, 'historique']);
    Route::apiResource('voitures', VoitureController::class);

    // Commercial
    Route::apiResource('clients', ClientController::class);
    Route::apiResource('ventes', VenteController::class);
    Route::apiResource('facturations', FacturationController::class);
    Route::get('/facturations/{facturation}/export', [FacturationController::class, 'export']);
    Route::apiResource('paiements', PaiementController::class);
    Route::get('/paiements/{paiement}/export', [PaiementController::class, 'export']);
    Route::apiResource('documents', DocumentController::class);

    // Locations
    Route::apiResource('locations', LocationController::class);
    Route::post('/locations/{location}/etats-lieux', [LocationController::class, 'addEtatLieu']);
    Route::get('/locations/{location}/export', [LocationController::class, 'export']);
    Route::post('/locations/{location}/facture', [LocationController::class, 'generateFacture']);
    Route::get('/locations/{location}/facture', [LocationController::class, 'getFacture']);
    Route::post('/locations/{location}/paiements', [LocationController::class, 'addPaiement']);

    // Garanties
    Route::apiResource('garanties', GarantieController::class);
    Route::get('/garanties/{garantie}/export', [GarantieController::class, 'export']);

    // SAV & Atelier
    Route::apiResource('tickets-sav', TicketSavController::class)
        ->parameters(['tickets-sav' => 'ticketSav']);
    Route::apiResource('ordres-travail', OrdreTravailController::class)
        ->parameters(['ordres-travail' => 'ordreTravail']);
    Route::apiResource('entretiens', EntretienController::class);
    Route::get('/entretiens/{entretien}/export', [EntretienController::class, 'export']);

    // Stock & Fournisseurs
    Route::apiResource('pieces-stock', PieceStockController::class)
        ->parameters(['pieces-stock' => 'pieceStock']);
    Route::get('/mouvements-stock', [MouvementStockController::class, 'index']);
    Route::get('/mouvements-stock/{mouvementStock}', [MouvementStockController::class, 'show']);
    Route::apiResource('fournisseurs', FournisseurController::class);

    // Conformité parc
    Route::apiResource('assurances', AssuranceController::class);
    Route::get('/assurances/{assurance}/export', [AssuranceController::class, 'export']);
    Route::apiResource('carburants', CarburantController::class);
    Route::apiResource('controles-techniques', ControleTechniqueController::class)
        ->parameters(['controles-techniques' => 'controleTechnique']);
    Route::apiResource('sinistres', SinistreController::class);
    Route::get('/sinistres/{sinistre}/export', [SinistreController::class, 'export']);

    // Demandes clients
    Route::get('/demandes', [DemandeController::class, 'index']);
    Route::patch('/demandes/{demande}', [DemandeController::class, 'update']);

    // Messages de contact
    Route::get('/contact', [ContactController::class, 'index']);
    Route::patch('/contact/{contactMessage}/read', [ContactController::class, 'markRead']);

    // Alertes & Reporting
    Route::get('/alertes/expirations', [VoitureController::class, 'alertesExpirations']);
    Route::get('/reporting', [ReportingController::class, 'index']);
    Route::get('/reporting/export', [ReportingController::class, 'export']);
});

// ── Routes admin uniquement ───────────────────────────────────────────────────
Route::middleware(['auth:sanctum', 'role:admin,super_admin'])->group(function () {
    Route::apiResource('employes', EmployeController::class);

    // Gestion des comptes utilisateurs
    Route::get('/admin/employes-sans-compte', [UserManagementController::class, 'emploiesSansCompte']);
    Route::apiResource('admin/users', UserManagementController::class)
        ->parameters(['users' => 'user']);
});

require __DIR__.'/api-internal.php';
