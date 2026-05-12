<?php

use App\Http\Controllers\CustomerPortalController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\FacturationController;
use App\Http\Controllers\InterventionSavController;
use App\Http\Controllers\LocationController;
use App\Http\Controllers\MouvementStockController;
use App\Http\Controllers\NotificationInterneController;
use App\Http\Controllers\OrdreTravailController;
use App\Http\Controllers\PaiementController;
use App\Http\Controllers\PieceStockController;
use App\Http\Controllers\PreferencesController;
use App\Http\Controllers\ProfileController;
use App\Http\Controllers\ReportingController;
use App\Http\Controllers\TacheAtelierController;
use App\Http\Controllers\TicketSavController;
use App\Http\Controllers\VenteController;
use App\Http\Controllers\VoitureController;
use Illuminate\Support\Facades\Route;

Route::view('/', 'auth.login')->name('home');

Route::middleware('auth')->group(function () {
    Route::get('/dashboard', [DashboardController::class, 'index'])->name('dashboard');
    Route::get('/dashboard/live', [DashboardController::class, 'live'])->name('dashboard.live');

    Route::post('/theme/{theme}', [PreferencesController::class, 'setTheme'])->name('theme.switch');
    Route::post('/locale/{locale}', [PreferencesController::class, 'setLanguage'])->name('locale.switch');

    Route::get('/customer/portal', [CustomerPortalController::class, 'index'])->name('customer.portal');
    Route::post('/customer/reservations', [CustomerPortalController::class, 'store'])->name('customer.reservations.store');

    Route::get('/reporting', [ReportingController::class, 'index'])->name('reporting.index');
    Route::get('/reporting/export', [ReportingController::class, 'export'])->name('reporting.export');

    Route::patch('/notifications-internes/{notificationInterne}/read', [NotificationInterneController::class, 'read'])
        ->name('notifications-internes.read');

    Route::patch('/locations/{location}/return', [LocationController::class, 'markReturned'])->name('locations.return');
    Route::get('/reservations', [LocationController::class, 'reservations'])->name('reservations.index');
    Route::patch('/reservations/{location}/confirm', [LocationController::class, 'confirmReservation'])->name('reservations.confirm');
    Route::patch('/reservations/{location}/cancel', [LocationController::class, 'cancelReservation'])->name('reservations.cancel');

    Route::post('/ordres-travail/{ordreTravail}/consommer-piece', [OrdreTravailController::class, 'consommerPiece'])
        ->name('ordres-travail.consommer-piece');
    Route::post('/pieces-stock/{pieceStock}/approvisionner', [PieceStockController::class, 'approvisionner'])
        ->name('pieces-stock.approvisionner');

    Route::resource('voitures', VoitureController::class);
    Route::resource('ventes', VenteController::class);
    Route::resource('locations', LocationController::class);
    Route::resource('tickets-sav', TicketSavController::class);
    Route::resource('ordres-travail', OrdreTravailController::class);
    Route::resource('pieces-stock', PieceStockController::class);
    Route::resource('facturations', FacturationController::class);
    Route::resource('paiements', PaiementController::class);
    Route::resource('interventions-sav', InterventionSavController::class);
    Route::resource('taches-atelier', TacheAtelierController::class);

    Route::get('/mouvements-stock', [MouvementStockController::class, 'index'])->name('mouvements-stock.index');
    Route::get('/mouvements-stock/{mouvementStock}', [MouvementStockController::class, 'show'])->name('mouvements-stock.show');

    Route::get('/facturations/{facturation}/export', [FacturationController::class, 'export'])->name('facturations.export');
    Route::get('/paiements/{paiement}/export', [PaiementController::class, 'export'])->name('paiements.export');
    Route::get('/locations/{location}/export', [LocationController::class, 'export'])->name('locations.export');
});

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
});

require __DIR__.'/auth.php';
