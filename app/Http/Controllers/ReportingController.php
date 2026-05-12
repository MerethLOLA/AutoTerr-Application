<?php

namespace App\Http\Controllers;

use App\Models\Facturation;
use App\Models\Location;
use App\Models\MouvementStock;
use App\Models\OrdreTravail;
use App\Models\Paiement;
use App\Models\PieceStock;
use App\Models\TicketSav;
use App\Models\Vente;
use App\Models\Voiture;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportingController extends Controller
{
    public function index(Request $request)
    {
        abort_unless($request->user()?->hasPermission('view_reporting'), 403);

        $year = (int) $request->integer('annee', now()->year);

        $salesMonthly = collect(range(1, 12))->map(function (int $month) use ($year) {
            $ventes = Vente::query()
                ->whereYear('date_vente', $year)
                ->whereMonth('date_vente', $month);

            return [
                'label' => now()->setMonth($month)->locale('fr')->translatedFormat('M'),
                'count' => (clone $ventes)->count(),
                'amount' => (float) (clone $ventes)->sum('prix_final'),
            ];
        });

        $paymentModes = Paiement::query()
            ->selectRaw('mode_paiement, COUNT(*) as total, COALESCE(SUM(montant), 0) as montant')
            ->groupBy('mode_paiement')
            ->orderByDesc('montant')
            ->get();

        $locationStats = [
            'en_cours' => Location::query()->where('statut', 'en_cours')->count(),
            'retards' => Location::query()
                ->whereIn('statut', ['planifiee', 'en_cours'])
                ->whereDate('date_fin', '<', now()->toDateString())
                ->whereNull('date_retour_effective')
                ->count(),
            'retours_mois' => Location::query()
                ->whereNotNull('date_retour_effective')
                ->whereMonth('date_retour_effective', now()->month)
                ->whereYear('date_retour_effective', now()->year)
                ->count(),
            'reservations' => Location::query()->where('statut', 'planifiee')->count(),
        ];

        $savStats = [
            'tickets_ouverts' => TicketSav::query()->whereIn('statut', ['ouvert', 'en_cours'])->count(),
            'tickets_resolus_mois' => TicketSav::query()
                ->where('statut', 'resolu')
                ->whereMonth('updated_at', now()->month)
                ->whereYear('updated_at', now()->year)
                ->count(),
            'ordres_ouverts' => OrdreTravail::query()->whereIn('statut', ['ouvert', 'en_cours'])->count(),
            'ordres_en_retard' => OrdreTravail::query()
                ->whereIn('statut', ['ouvert', 'en_cours'])
                ->whereNotNull('deadline')
                ->where('deadline', '<', now())
                ->count(),
        ];

        $stockStats = [
            'valeur_stock' => (float) PieceStock::query()
                ->selectRaw('COALESCE(SUM(prix_unitaire * quantite_stock), 0) as total')
                ->value('total'),
            'references' => PieceStock::query()->count(),
            'alertes' => PieceStock::query()->whereColumn('quantite_stock', '<=', 'seuil_alerte')->count(),
            'entrees_mois' => (int) MouvementStock::query()
                ->where('type_mouvement', 'entree')
                ->whereMonth('date_mouvement', now()->month)
                ->whereYear('date_mouvement', now()->year)
                ->sum('quantite'),
            'sorties_mois' => (int) MouvementStock::query()
                ->where('type_mouvement', 'sortie')
                ->whereMonth('date_mouvement', now()->month)
                ->whereYear('date_mouvement', now()->year)
                ->sum('quantite'),
            'top_alerts' => PieceStock::query()
                ->whereColumn('quantite_stock', '<=', 'seuil_alerte')
                ->orderBy('quantite_stock')
                ->limit(5)
                ->get(['id', 'designation', 'quantite_stock', 'seuil_alerte']),
        ];

        $financeStats = [
            'factures_impayees' => Facturation::query()->impayees()->count(),
            'factures_en_retard' => Facturation::query()->enRetard()->count(),
            'encaissements_mois' => (float) Paiement::query()->duMois()->sum('montant'),
            'reste_global' => (float) DB::table('facturations')
                ->leftJoin(
                    DB::raw('(SELECT id_facture, COALESCE(SUM(montant), 0) as total FROM paiements GROUP BY id_facture) as paiements_agg'),
                    'facturations.id', '=', 'paiements_agg.id_facture'
                )
                ->where('facturations.statut', '!=', 'payee')
                ->selectRaw('COALESCE(SUM(facturations.montant_ttc - COALESCE(paiements_agg.total, 0)), 0) as reste')
                ->value('reste'),
        ];

        $voituresDisponibles = Voiture::query()->where('statut', 'disponible')->count();

        $data = compact(
            'year',
            'salesMonthly',
            'paymentModes',
            'locationStats',
            'savStats',
            'stockStats',
            'financeStats',
            'voituresDisponibles',
        );

        if ($request->wantsJson()) {
            return $this->apiItem($data);
        }

        return view('reporting.index', $data);
    }

    public function export(Request $request): StreamedResponse
    {
        abort_unless($request->user()?->hasPermission('view_reporting'), 403);

        $rows = [
            ['Bloc', 'Indicateur', 'Valeur'],
            ['Ventes', 'Total ventes', Vente::query()->count()],
            ['Ventes', 'Montant total ventes', (float) Vente::query()->sum('prix_final')],
            ['Finance', 'Factures impayees', Facturation::query()->impayees()->count()],
            ['Finance', 'Factures en retard', Facturation::query()->enRetard()->count()],
            ['Finance', 'Encaissements total', (float) Paiement::query()->sum('montant')],
            ['Locations', 'Locations en cours', Location::query()->where('statut', 'en_cours')->count()],
            ['Locations', 'Retards restitution', Location::query()->whereIn('statut', ['planifiee', 'en_cours'])->whereDate('date_fin', '<', now()->toDateString())->whereNull('date_retour_effective')->count()],
            ['SAV', 'Tickets ouverts', TicketSav::query()->whereIn('statut', ['ouvert', 'en_cours'])->count()],
            ['Atelier', 'Ordres ouverts', OrdreTravail::query()->whereIn('statut', ['ouvert', 'en_cours'])->count()],
            ['Stock', 'References', PieceStock::query()->count()],
            ['Stock', 'Alertes stock', PieceStock::query()->whereColumn('quantite_stock', '<=', 'seuil_alerte')->count()],
            ['Stock', 'Valeur stock', (float) PieceStock::query()->selectRaw('COALESCE(SUM(prix_unitaire * quantite_stock), 0) as total')->value('total')],
        ];

        return response()->streamDownload(function () use ($rows) {
            $handle = fopen('php://output', 'w');
            foreach ($rows as $row) {
                fputcsv($handle, $row, ';');
            }
            fclose($handle);
        }, 'reporting-sunupark.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
