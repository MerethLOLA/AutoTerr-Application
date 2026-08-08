<?php

namespace App\Http\Controllers;

use App\Models\Assurance;
use App\Models\Carburant;
use App\Models\Client;
use App\Models\Demande;
use App\Models\Employe;
use App\Models\Entretien;
use App\Models\Facturation;
use App\Models\Location;
use App\Models\MouvementStock;
use App\Models\OrdreTravail;
use App\Models\Paiement;
use App\Models\PieceStock;
use App\Models\Sinistre;
use App\Models\TicketSav;
use App\Models\User;
use App\Models\Vente;
use App\Models\Voiture;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Symfony\Component\HttpFoundation\StreamedResponse;

/**
 * Fournit les données agrégées du tableau de bord et de la page reporting :
 * ventes/locations par mois, finances, stock, SAV, conformité véhicules,
 * commissions des commerciaux, activité récente. Les deux pages front
 * consomment le même endpoint {@see index()} — un ralentissement ici se
 * répercute donc sur les deux.
 */
class ReportingController extends Controller
{
    /**
     * Retourne l'ensemble des indicateurs du tableau de bord/reporting pour une année donnée.
     *
     * Toutes les séries doivent rester agrégées en base (GROUP BY / SUM / COUNT) plutôt que
     * calculées en PHP dans une boucle : chaque requête supplémentaire ajoute un aller-retour
     * réseau, ce qui devient très sensible dès que la base n'est plus en local (cf. les
     * anciennes boucles mensuelles et le calcul par employé, remplacés ci-dessous).
     */
    public function index(Request $request)
    {
        abort_unless($request->user()?->hasPermission('view_reporting'), 403);

        $year = (int) $request->integer('annee', now()->year);

        // ── Ventes par mois ──────────────────────────────────────────────
        // Une seule requête groupée par mois au lieu de 12 x 2 (évite les allers-retours
        // répétés vers la base distante, qui faisaient largement dépasser le délai côté front).
        $salesByMonth = Vente::query()
            ->whereYear('date_vente', $year)
            ->selectRaw('MONTH(date_vente) as mois, COUNT(*) as count, COALESCE(SUM(prix_final), 0) as amount')
            ->groupBy('mois')
            ->get()
            ->keyBy('mois');

        $salesMonthly = collect(range(1, 12))->map(function (int $month) use ($salesByMonth) {
            $row = $salesByMonth->get($month);

            return [
                'label' => now()->setMonth($month)->locale('fr')->translatedFormat('M'),
                'count' => $row ? (int) $row->count : 0,
                'amount' => $row ? (float) $row->amount : 0.0,
            ];
        });

        $locationsByMonth = Facturation::query()
            ->whereNotNull('id_location')
            ->whereYear('date_facture', $year)
            ->selectRaw('MONTH(date_facture) as mois, COUNT(*) as count, COALESCE(SUM(montant_ttc), 0) as amount')
            ->groupBy('mois')
            ->get()
            ->keyBy('mois');

        $locationsMonthly = collect(range(1, 12))->map(function (int $month) use ($locationsByMonth) {
            $row = $locationsByMonth->get($month);

            return [
                'label'  => now()->setMonth($month)->locale('fr')->translatedFormat('M'),
                'count'  => $row ? (int) $row->count : 0,
                'amount' => $row ? (float) $row->amount : 0.0,
            ];
        });

        $paymentModes = Paiement::query()
            ->selectRaw('mode_paiement, COUNT(*) as total, COALESCE(SUM(montant), 0) as montant')
            ->groupBy('mode_paiement')
            ->orderByDesc('montant')
            ->get();

        // ── Locations : compteurs par statut ─────────────────────────────
        $locationStats = [
            'en_cours' => Location::query()->where('statut', 'en_cours')->count(),
            'retards' => Location::query()
                ->where(function ($query) {
                    $query->where('statut', 'en_retard')
                        ->orWhere(function ($q) {
                            $q->whereIn('statut', ['planifiee', 'en_cours'])
                                ->whereDate('date_fin', '<', now()->toDateString())
                                ->whereNull('date_retour_effective');
                        });
                })
                ->count(),
            'retours_mois' => Location::query()
                ->whereNotNull('date_retour_effective')
                ->whereMonth('date_retour_effective', now()->month)
                ->whereYear('date_retour_effective', now()->year)
                ->count(),
            'reservations' => Location::query()->where('statut', 'planifiee')->count(),
        ];

        // ── SAV / atelier : tickets et ordres de travail ouverts ─────────
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

        // ── Stock pièces : valeur, alertes seuil, mouvements du mois ─────
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

        // ── Finances : impayés, retards, encaissements, reste à recouvrer ─
        // Le reste à recouvrer se calcule en une seule requête (sous-requête agrégée
        // sur les paiements) plutôt que facture par facture, pour la même raison de
        // performance que les sections ci-dessus.
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

        // ── Compteurs globaux simples ─────────────────────────────────────
        $voituresDisponibles = Voiture::query()->where('statut', 'disponible')->count();

        $utilisateursInscrits = Client::count();

        $enAttenteValidation = Demande::whereNotIn('statut', ['traite', 'refuse', 'annule'])->count();

        $totalVentesGlobal = Vente::count();

        // ── Répartition des ventes par marque (top 6) ────────────────────
        $ventesParMarque = DB::table('ventes')
            ->join('voitures', 'ventes.id_voiture', '=', 'voitures.id')
            ->select('voitures.marque', DB::raw('COUNT(*) as count'))
            ->groupBy('voitures.marque')
            ->orderByDesc('count')
            ->limit(6)
            ->get()
            ->map(fn($row) => [
                'marque' => $row->marque,
                'count'  => (int) $row->count,
                'pct'    => $totalVentesGlobal > 0 ? round(($row->count / $totalVentesGlobal) * 100) : 0,
            ]);

        // ── Top 5 des vendeurs par nombre de ventes ──────────────────────
        $topVendeurs = DB::table('ventes')
            ->join('employes', 'ventes.id_employe', '=', 'employes.id')
            ->select(
                'employes.prenom',
                'employes.nom',
                'employes.poste',
                DB::raw('COUNT(*) as count'),
                DB::raw('COALESCE(SUM(ventes.prix_final), 0) as total')
            )
            ->whereNotNull('ventes.id_employe')
            ->groupBy('employes.id', 'employes.prenom', 'employes.nom', 'employes.poste')
            ->orderByDesc('count')
            ->limit(5)
            ->get();

        // ── Commissions des commerciaux (paie du mois précédent) ─────────
        // Paie du mois qui vient de se terminer (et non le mois en cours, encore incomplet).
        $periodeSalaires = now()->subMonthNoOverflow();

        // Pré-agrégées en 2 requêtes globales plutôt qu'en 2 requêtes par employé.
        $ventesParEmploye = Vente::query()
            ->whereNotNull('id_employe')
            ->whereMonth('date_vente', $periodeSalaires->month)
            ->whereYear('date_vente', $periodeSalaires->year)
            ->selectRaw('id_employe, COALESCE(SUM(prix_final), 0) as total')
            ->groupBy('id_employe')
            ->pluck('total', 'id_employe');

        $locationsParAgent = Facturation::query()
            ->whereNotNull('id_location')
            ->whereMonth('date_facture', $periodeSalaires->month)
            ->whereYear('date_facture', $periodeSalaires->year)
            ->join('locations', 'facturations.id_location', '=', 'locations.id')
            ->whereNotNull('locations.id_agent')
            ->selectRaw('locations.id_agent as id_agent, COALESCE(SUM(facturations.montant_ttc), 0) as total')
            ->groupBy('locations.id_agent')
            ->pluck('total', 'id_agent');

        $salairesCommerciaux = Employe::query()
            ->where('statut', 'actif')
            ->get(['id', 'nom', 'prenom', 'poste', 'salaire', 'taux_commission'])
            ->map(function ($employe) use ($ventesParEmploye, $locationsParAgent) {
                $totalVentes = (float) ($ventesParEmploye[$employe->id] ?? 0);
                $totalLocations = (float) ($locationsParAgent[$employe->id] ?? 0);

                $totalActivite = $totalVentes + $totalLocations;
                $tauxCommission = (float) ($employe->taux_commission ?? 0);
                $commission = round($totalActivite * ($tauxCommission / 100));
                $salaireFixe = (float) ($employe->salaire ?? 0);

                return [
                    'id' => $employe->id,
                    'nom' => trim(($employe->prenom ?? '') . ' ' . $employe->nom),
                    'poste' => $employe->poste,
                    'salaire_fixe' => $salaireFixe,
                    'taux_commission' => $tauxCommission,
                    'total_ventes_mois' => $totalVentes,
                    'total_locations_mois' => $totalLocations,
                    'commission_mois' => $commission,
                    'salaire_total_mois' => $salaireFixe + $commission,
                ];
            })
            ->filter(fn ($e) => $e['taux_commission'] > 0)
            ->sortByDesc('salaire_total_mois')
            ->values();

        // ── Fil d'activité récente (dernières ventes + locations fusionnées) ─
        $recentVentes = Vente::with(['voiture', 'client'])
            ->latest()
            ->limit(4)
            ->get()
            ->map(fn($v) => [
                'type'  => 'vente',
                'label' => 'Nouvelle vente : ' . ($v->voiture ? $v->voiture->marque . ' ' . $v->voiture->modele . ($v->voiture->annee ? ' ' . $v->voiture->annee : '') : 'Véhicule #' . $v->id_voiture),
                'sub'   => $v->client ? trim($v->client->prenom . ' ' . $v->client->nom) : '',
                'at'    => $v->created_at?->toISOString() ?? now()->toISOString(),
            ]);

        $recentLocations = Location::with(['voiture', 'client'])
            ->latest()
            ->limit(4)
            ->get()
            ->map(fn($l) => [
                'type'  => 'location',
                'label' => 'Location : ' . ($l->voiture ? $l->voiture->marque . ' ' . $l->voiture->modele . ($l->voiture->annee ? ' ' . $l->voiture->annee : '') : 'Location #' . $l->id),
                'sub'   => $l->client ? trim($l->client->prenom . ' ' . $l->client->nom) : '',
                'at'    => $l->created_at?->toISOString() ?? now()->toISOString(),
            ]);

        $activiteRecente = collect($recentVentes)
            ->merge($recentLocations)
            ->sortByDesc('at')
            ->values()
            ->take(6);

        // ── Derniers véhicules ajoutés au catalogue ──────────────────────
        $dernieresVoitures = Voiture::with([
            'ventes' => fn($q) => $q->with('employe')->latest()->limit(1),
        ])
            ->latest()
            ->limit(5)
            ->get(['id', 'marque', 'modele', 'annee', 'prix_vente', 'prix', 'statut', 'image_principale', 'energie'])
            ->map(fn($v) => [
                'id'               => $v->id,
                'marque'           => $v->marque,
                'modele'           => $v->modele,
                'annee'            => $v->annee,
                'energie'          => $v->energie,
                'prix_vente'       => (float) ($v->prix_vente ?? $v->prix ?? 0),
                'prix'             => (float) ($v->prix ?? 0),
                'statut'           => $v->statut,
                'image_principale' => $v->image_principale,
                'vendeur'          => $v->ventes->isNotEmpty() && $v->ventes->first()->employe
                    ? mb_substr($v->ventes->first()->employe->prenom ?? '', 0, 1) . '. ' . ($v->ventes->first()->employe->nom ?? '')
                    : null,
            ]);

        // ── Conformité véhicules : assurances/entretiens à échéance, sinistres ─
        $conformiteStats = [
            'assurances_expirant' => Assurance::query()
                ->whereBetween('date_fin', [now()->toDateString(), now()->addDays(30)->toDateString()])
                ->where('statut', '!=', 'annulee')
                ->count(),
            'assurances_expirees' => Assurance::query()
                ->where('date_fin', '<', now()->toDateString())
                ->where('statut', '!=', 'annulee')
                ->count(),
            'sinistres_ouverts' => Sinistre::query()
                ->whereNotIn('statut', ['clos', 'annule', 'rejete'])
                ->count(),
            'entretiens_a_venir' => Entretien::query()
                ->where('statut', 'planifie')
                ->whereBetween('date_prevue', [now()->toDateString(), now()->addDays(30)->toDateString()])
                ->count(),
            'cout_entretien_mois' => (float) Entretien::query()
                ->whereMonth('date_realise', now()->month)
                ->whereYear('date_realise', now()->year)
                ->sum('cout'),
            'cout_carburant_mois' => (float) Carburant::query()
                ->whereMonth('date_plein', now()->month)
                ->whereYear('date_plein', now()->year)
                ->sum('montant_total'),
        ];

        $salairesPeriode = ucfirst($periodeSalaires->locale('fr')->translatedFormat('F Y'));

        $data = compact(
            'year',
            'salesMonthly',
            'locationsMonthly',
            'paymentModes',
            'locationStats',
            'savStats',
            'stockStats',
            'financeStats',
            'voituresDisponibles',
            'conformiteStats',
            'utilisateursInscrits',
            'enAttenteValidation',
            'ventesParMarque',
            'topVendeurs',
            'salairesCommerciaux',
            'salairesPeriode',
            'activiteRecente',
            'dernieresVoitures',
        );

        return $this->apiItem($data);
    }

    /**
     * Exporte un instantané des principaux indicateurs (tous statuts confondus,
     * pas seulement l'année sélectionnée dans index()) au format CSV.
     */
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
            ['Locations', 'Retards restitution', Location::query()->where(function ($query) {
                $query->where('statut', 'en_retard')
                    ->orWhere(function ($q) {
                        $q->whereIn('statut', ['planifiee', 'en_cours'])
                            ->whereDate('date_fin', '<', now()->toDateString())
                            ->whereNull('date_retour_effective');
                    });
            })->count()],
            ['SAV', 'Tickets ouverts', TicketSav::query()->whereIn('statut', ['ouvert', 'en_cours'])->count()],
            ['Atelier', 'Ordres ouverts', OrdreTravail::query()->whereIn('statut', ['ouvert', 'en_cours'])->count()],
            ['Stock', 'References', PieceStock::query()->count()],
            ['Stock', 'Alertes stock', PieceStock::query()->whereColumn('quantite_stock', '<=', 'seuil_alerte')->count()],
            ['Stock', 'Valeur stock', (float) PieceStock::query()->selectRaw('COALESCE(SUM(prix_unitaire * quantite_stock), 0) as total')->value('total')],
            ['Assurances', 'Total assurances actives', Assurance::query()->where('statut', 'active')->count()],
            ['Assurances', 'Expirant dans 30 jours', Assurance::query()->whereBetween('date_fin', [now()->toDateString(), now()->addDays(30)->toDateString()])->where('statut', '!=', 'annulee')->count()],
            ['Assurances', 'Expirees', Assurance::query()->where('date_fin', '<', now()->toDateString())->where('statut', '!=', 'annulee')->count()],
            ['Sinistres', 'Sinistres declares', Sinistre::query()->count()],
            ['Sinistres', 'Sinistres ouverts', Sinistre::query()->whereNotIn('statut', ['clos', 'annule', 'rejete'])->count()],
            ['Sinistres', 'Montant total dommages', (float) Sinistre::query()->sum('montant_dommages')],
            ['Entretiens', 'Total entretiens', Entretien::query()->count()],
            ['Entretiens', 'Entretiens planifies', Entretien::query()->where('statut', 'planifie')->count()],
            ['Entretiens', 'Cout entretiens mois en cours', (float) Entretien::query()->whereMonth('date_realise', now()->month)->whereYear('date_realise', now()->year)->sum('cout')],
            ['Carburant', 'Total pleins', \App\Models\Carburant::query()->count()],
            ['Carburant', 'Cout carburant mois en cours', (float) \App\Models\Carburant::query()->whereMonth('date_plein', now()->month)->whereYear('date_plein', now()->year)->sum('montant_total')],
            ['Carburant', 'Volume total litres', (float) \App\Models\Carburant::query()->sum('quantite_litres')],
        ];

        return response()->streamDownload(function () use ($rows) {
            $handle = fopen('php://output', 'w');
            foreach ($rows as $row) {
                fputcsv($handle, $row, ';');
            }
            fclose($handle);
        }, 'reporting-autoterr.csv', [
            'Content-Type' => 'text/csv; charset=UTF-8',
        ]);
    }
}
