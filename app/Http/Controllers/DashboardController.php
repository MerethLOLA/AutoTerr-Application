<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Facturation;
use App\Models\Location;
use App\Models\Paiement;
use App\Models\PieceStock;
use App\Models\TicketSav;
use App\Models\Vente;
use App\Models\Voiture;
use Illuminate\Support\Facades\Cache;

class DashboardController extends Controller
{
    protected function kpis(bool $live = false): array
    {
        $resolver = function () {
            $ventesDuMois = Vente::query()
                ->whereMonth('date_vente', now()->month)
                ->whereYear('date_vente', now()->year);

            return [
                'voitures_total' => Voiture::query()->count(),
                'voitures_disponibles' => Voiture::query()->disponibles()->count(),
                'voitures_avec_photos' => Voiture::query()->has('images')->count(),
                'clients_total' => Client::query()->count(),
                'ventes_total' => Vente::query()->count(),
                'ventes_du_mois' => (clone $ventesDuMois)->count(),
                'chiffre_affaires_mois' => (float) (clone $ventesDuMois)->sum('prix_final'),
                'factures_impayees' => Facturation::query()->impayees()->count(),
                'factures_en_retard' => Facturation::query()->enRetard()->count(),
                'encaissements_total' => (float) Paiement::query()->sum('montant'),
                'tickets_sav_ouverts' => TicketSav::query()->whereIn('statut', ['ouvert', 'en_cours'])->count(),
                'locations_en_cours' => Location::query()->where('statut', 'en_cours')->count(),
                'reservations_clients' => Location::query()->where('statut', 'planifiee')->count(),
                'locations_expirant_48h' => Location::query()
                    ->whereIn('statut', ['planifiee', 'en_cours'])
                    ->whereBetween('date_fin', [now(), now()->copy()->addHours(48)])
                    ->count(),
                'retards_restitution' => Location::query()
                    ->whereIn('statut', ['planifiee', 'en_cours'])
                    ->where('date_fin', '<', now())
                    ->whereNull('date_retour_effective')
                    ->count(),
                'pieces_en_alerte' => PieceStock::query()->whereColumn('quantite_stock', '<=', 'seuil_alerte')->count(),
                'valeur_stock' => (float) PieceStock::query()
                    ->selectRaw('COALESCE(SUM(prix_unitaire * quantite_stock), 0) as total')
                    ->value('total'),
            ];
        };

        return $live
            ? $resolver()
            : Cache::remember('dashboard.kpis', now()->addMinutes(5), $resolver);
    }

    public function index()
    {
        abort_unless(auth()->user()?->hasPermission('view_dashboard'), 403);

        $kpis = $this->kpis();

        $catalogueVoitures = Voiture::query()
            ->select(['id', 'marque', 'modele', 'annee', 'energie', 'kilometrage', 'prix', 'statut', 'created_at'])
            ->latest()
            ->take(6)
            ->get();

        return view('dashboard', compact('kpis', 'catalogueVoitures'));
    }

    public function live()
    {
        abort_unless(auth()->user()?->hasPermission('view_dashboard'), 403);

        return response()->json([
            'kpis' => $this->kpis(true),
            'generated_at' => now()->toIso8601String(),
        ]);
    }
}
