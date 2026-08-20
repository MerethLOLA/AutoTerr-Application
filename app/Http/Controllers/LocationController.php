<?php

namespace App\Http\Controllers;

use App\Http\Requests\LocationRequest;
use App\Models\Client;
use App\Models\EtatLieuLocation;
use App\Models\Facturation;
use App\Models\Location;
use App\Models\Paiement;
use App\Models\Voiture;
use App\Services\BusinessReferenceService;
use App\Services\DocumentExportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class LocationController extends Controller
{
    public function reservations(Request $request)
    {
        $this->ensurePermission('manage_location');

        $reservations = Location::query()
            ->select([
                'id', 'reference_location', 'id_client', 'id_voiture', 'date_debut',
                'date_fin', 'tarif_journalier', 'statut', 'observations', 'created_at',
            ])
            ->with([
                'client:id,nom,prenom,telephone,email',
                'voiture:id,marque,modele,prix,statut',
            ])
            ->where('statut', 'planifiee')
            ->when($request->filled('search'), function ($query) use ($request) {
                $needle = '%'.$request->string('search')->trim().'%';

                $query->where(function ($subQuery) use ($needle) {
                    $subQuery->where('reference_location', 'like', $needle)
                        ->orWhereHas('client', fn ($clientQuery) => $clientQuery
                            ->where('nom', 'like', $needle)
                            ->orWhere('prenom', 'like', $needle)
                            ->orWhere('telephone', 'like', $needle)
                        )
                        ->orWhereHas('voiture', fn ($voitureQuery) => $voitureQuery
                            ->where('marque', 'like', $needle)
                            ->orWhere('modele', 'like', $needle)
                        );
                });
            })
            ->latest()
            ->paginate(12)
            ->withQueryString();

        return $this->apiCollection($reservations);
    }

    public function index(Request $request)
    {
        $this->ensurePermission('manage_location');

        $locations = Location::query()
            ->select([
                'id', 'reference_location', 'id_client', 'id_voiture', 'id_agent', 'date_debut',
                'date_fin', 'date_retour_effective', 'tarif_journalier', 'statut', 'created_at',
            ])
            ->with([
                'client:id,nom,prenom',
                'voiture:id,marque,modele,statut',
                'agent:id,nom,prenom',
            ])
            ->withCount('etatsDesLieux')
            ->when($request->filled('statut'), fn ($query) => $query->where('statut', $request->string('statut')->toString()))
            ->latest()
            ->paginate(15);

        return $this->apiCollection($locations);
    }

    public function create()
    {
        $this->ensurePermission('manage_location');

        return response()->json([
            'clients' => Client::query()->orderBy('nom')->get(['id', 'nom', 'prenom']),
            'voitures' => Voiture::query()->where('statut', 'disponible')->orderBy('marque')->get(['id', 'marque', 'modele', 'immatriculation']),
        ]);
    }

    public function confirmReservation(Request $request, Location $location)
    {
        $this->ensurePermission('manage_location');
        abort_if($location->statut !== 'planifiee', 422, 'Cette reservation ne peut plus etre confirmee.');

        $location->update(['statut' => 'en_cours']);
        $location->voiture?->update(['statut' => 'loue']);

        $this->logAction('update', 'reservation', $location, ['statut' => 'en_cours'], $request);
        $this->resetDashboardCache();

        return $this->apiItem($location->fresh()->load(['client', 'voiture']), 200, [
            'message' => 'Reservation confirmee',
        ]);
    }

    public function cancelReservation(Request $request, Location $location)
    {
        $this->ensurePermission('manage_location');
        abort_if($location->statut !== 'planifiee', 422, 'Cette reservation ne peut plus etre annulee.');

        $location->update(['statut' => 'annulee']);
        $location->voiture?->update(['statut' => 'disponible']);

        $this->logAction('update', 'reservation', $location, ['statut' => 'annulee'], $request);
        $this->resetDashboardCache();

        return $this->apiItem($location->fresh()->load(['client', 'voiture']), 200, [
            'message' => 'Reservation annulee',
        ]);
    }

    public function store(LocationRequest $request, BusinessReferenceService $referenceService)
    {
        $this->ensurePermission('manage_location');
        $data = $request->validated();

        $voiture = Voiture::query()->findOrFail($data['id_voiture']);
        abort_if($voiture->statut !== 'disponible', 422, 'Le vehicule doit etre disponible pour etre loue.');

        $this->syncClientPiece($data);

        $data['reference_location'] = 'LOC-'.now()->format('YmdHis').'-'.Str::upper(Str::random(4));
        $location = Location::query()->create($data);

        $voiture->update([
            'statut' => in_array($location->statut, ['planifiee', 'en_cours'], true) ? 'loue' : 'disponible',
        ]);

        // Auto-génération de la facture si tarif > 0
        $tarif = (float) $location->tarif_journalier;
        if ($tarif > 0) {
            $jours      = max(1, (int) ceil($location->date_debut->diffInSeconds($location->date_fin) / 86400));
            $tauxTva    = (float) ($data['taux_tva'] ?? 18.0);
            $montantHt  = round($tarif * $jours, 2);
            // XOF n'a pas de sous-unité : on arrondit au franc le plus proche.
            $montantTtc = round($montantHt * (1 + $tauxTva / 100));

            Facturation::query()->create([
                'numero_facture' => $referenceService->nextFacture(),
                'date_facture'   => now()->toDateString(),
                'montant'        => $montantHt,
                'montant_ht'     => $montantHt,
                'taux_tva'       => $tauxTva,
                'montant_ttc'    => $montantTtc,
                'statut'         => 'impayee',
                'id_location'    => $location->id,
                'date_echeance'  => $data['date_echeance'] ?? null,
            ]);
        }

        $this->logAction('create', 'location', $location, $data, $request);
        $this->resetDashboardCache();

        if (! $request->wantsJson()) {
            return redirect()->route('locations.show', $location)->with('success', 'Location creee.');
        }

        return $this->apiItem($location->load(['client', 'voiture', 'facturation.paiements']), 201, [
            'message' => 'Location creee',
        ]);
    }

    public function show(Location $location)
    {
        $this->ensurePermission('manage_location');

        $location->load([
            'client:id,nom,prenom',
            'voiture:id,marque,modele',
            'etatsDesLieux:id,id_location,type_etat,description,date_etat',
            'facturation.paiements',
        ]);

        return $this->apiItem($location);
    }

    public function edit(Location $location)
    {
        $this->ensurePermission('manage_location');

        return response()->json([
            'location' => $location,
            'clients' => Client::query()->orderBy('nom')->get(['id', 'nom', 'prenom']),
            'voitures' => Voiture::query()
                ->where('statut', 'disponible')
                ->orWhere('id', $location->id_voiture)
                ->orderBy('marque')
                ->get(['id', 'marque', 'modele', 'immatriculation']),
        ]);
    }

    public function update(LocationRequest $request, Location $location)
    {
        $this->ensurePermission('manage_location');
        $data = $request->validated();
        $originalVoitureId = $location->id_voiture;

        $this->syncClientPiece($data, $location);
        $this->verrouillerChamps($location, $data);

        if (isset($data['id_voiture']) && (int) $originalVoitureId !== (int) $data['id_voiture']) {
            $nouvelleVoiture = Voiture::query()->findOrFail($data['id_voiture']);
            abort_if($nouvelleVoiture->statut !== 'disponible', 422, 'Le vehicule selectionne n est pas disponible.');
            $location->voiture?->update(['statut' => 'disponible']);
            $nouvelleVoiture->update(['statut' => in_array($data['statut'] ?? $location->statut, ['planifiee', 'en_cours', 'en_retard'], true) ? 'loue' : 'disponible']);
        } elseif (isset($data['statut'])) {
            $location->voiture?->update([
                'statut' => in_array($data['statut'], ['planifiee', 'en_cours', 'en_retard'], true) ? 'loue' : 'disponible',
            ]);
        }

        $becameTerminee = ($data['statut'] ?? null) === 'terminee' && $location->statut !== 'terminee';

        $location->update($data);

        if ($becameTerminee && ! isset($data['date_retour_effective']) && ! $location->date_retour_effective) {
            $location->update(['date_retour_effective' => now()]);
        }

        if (in_array($location->statut, ['terminee', 'annulee'], true)) {
            $location->voiture?->update(['statut' => 'disponible']);
        }

        $this->logAction('update', 'location', $location, $request->validated(), $request);
        $this->resetDashboardCache();

        if (! $request->wantsJson()) {
            return redirect()->route('locations.show', $location)->with('success', 'Location mise a jour.');
        }

        return $this->apiItem($location->fresh()->load(['client', 'voiture', 'etatsDesLieux']), 200, [
            'message' => 'Location mise a jour',
        ]);
    }

    /**
     * Verrouille les champs d'une location selon son état :
     *  - véhicule et client : jamais modifiables après création ;
     *  - location terminée/annulée : entièrement figée (sauf observations) ;
     *  - location en cours : seuls statut/observations/date_retour_effective restent modifiables ;
     *  - location planifiée avec un paiement déjà enregistré : tarif/dates/caution figés.
     */
    private function verrouillerChamps(Location $location, array $data): void
    {
        if (! $location->exists) {
            return;
        }

        foreach (['id_voiture', 'id_client'] as $champ) {
            if (array_key_exists($champ, $data) && $this->valeurDifferente($champ, $data[$champ], $location->{$champ})) {
                abort(422, "Impossible de modifier « {$champ} » : le véhicule et le client d'une location sont définitifs après sa création.");
            }
        }

        if (in_array($location->statut, ['terminee', 'annulee'], true)) {
            foreach ($data as $champ => $valeur) {
                if ($champ === 'observations') {
                    continue;
                }
                if ($this->valeurDifferente($champ, $valeur, $location->{$champ})) {
                    abort(422, "Impossible de modifier « {$champ} » : cette location est {$location->statut} et ne peut plus être modifiée.");
                }
            }

            return;
        }

        if ($location->statut === 'en_cours') {
            $autorises = ['statut', 'observations', 'date_retour_effective'];
            foreach ($data as $champ => $valeur) {
                if (in_array($champ, $autorises, true)) {
                    continue;
                }
                if ($this->valeurDifferente($champ, $valeur, $location->{$champ})) {
                    abort(422, "Impossible de modifier « {$champ} » : la location est en cours.");
                }
            }

            return;
        }

        $facture = $location->facturation()->first();
        if ($facture && $facture->paiements()->exists()) {
            foreach (['tarif_journalier', 'date_debut', 'date_fin', 'caution'] as $champ) {
                if (! array_key_exists($champ, $data)) {
                    continue;
                }
                if ($this->valeurDifferente($champ, $data[$champ], $location->{$champ})) {
                    abort(422, "Impossible de modifier « {$champ} » : un paiement a déjà été enregistré sur la facture de cette location.");
                }
            }
        }
    }

    private function valeurDifferente(string $champ, mixed $nouveau, mixed $actuel): bool
    {
        if (in_array($champ, ['date_debut', 'date_fin', 'date_retour_effective', 'date_echeance'], true)) {
            if ($nouveau === null && $actuel === null) {
                return false;
            }
            if ($nouveau === null || $actuel === null) {
                return true;
            }

            return ! \Carbon\Carbon::parse($nouveau)->eq(\Carbon\Carbon::parse($actuel));
        }

        if (is_numeric($actuel) || is_numeric($nouveau)) {
            return abs((float) $nouveau - (float) $actuel) > 0.01;
        }

        return (string) $nouveau !== (string) $actuel;
    }

    private function syncClientPiece(array $data, ?Location $location = null): void
    {
        $clientId = $data['id_client'] ?? $location?->id_client;
        if (! $clientId) {
            return;
        }

        $client = Client::query()->find($clientId);
        $client?->appliquerPieceIdentite($data);
    }

    public function destroy(Location $location)
    {
        $this->ensurePermission('manage_location');
        $this->logAction('delete', 'location', $location, [], request());
        $location->voiture?->update(['statut' => 'disponible']);
        $location->delete();
        $this->resetDashboardCache();

        if (! request()->wantsJson()) {
            return redirect()->route('locations.index')->with('success', 'Location supprimee.');
        }

        return $this->apiDeleted();
    }

    public function markReturned(Request $request, Location $location)
    {
        $this->ensurePermission('manage_location');
        abort_if(! in_array($location->statut, ['planifiee', 'en_cours', 'en_retard'], true), 422, 'Cette location ne peut pas etre cloturee.');

        $location->update([
            'statut' => 'terminee',
            'date_retour_effective' => now(),
        ]);
        $location->voiture?->update(['statut' => 'disponible']);

        $this->logAction('retour', 'location', $location, ['statut' => 'terminee'], $request);
        $this->resetDashboardCache();

        return $this->apiItem($location->fresh()->load(['client', 'voiture']), 200, [
            'message' => 'Retour de location enregistre',
        ]);
    }

    public function addEtatLieu(Request $request, Location $location)
    {
        $this->ensurePermission('manage_location');

        $data = $request->validate([
            'type_etat'   => 'required|in:depart,retour',
            'date_etat'   => 'required|date',
            'description' => 'nullable|string|max:2000',
        ]);

        $data['id_location'] = $location->id;
        $etat = EtatLieuLocation::query()->create($data);
        $this->logAction('create', 'etat_lieu', $etat, $data, $request);

        // L'état des lieux de retour porte la date réelle de restitution du
        // véhicule : on la reporte sur la location pour que la clôture (mise à
        // jour du statut) ne se contente plus de l'horodatage du clic serveur.
        if ($data['type_etat'] === 'retour') {
            $location->update(['date_retour_effective' => $data['date_etat']]);
        }

        return $this->apiItem($etat, 201, ['message' => 'État des lieux enregistré']);
    }

    public function export(Location $location, DocumentExportService $exportService)
    {
        $this->ensurePermission('manage_location');
        $this->logAction('export', 'location', $location, [], request());

        return $exportService->location($location);
    }

    public function generateFacture(Request $request, Location $location, BusinessReferenceService $referenceService)
    {
        $this->ensurePermission('manage_location');
        abort_if($location->statut === 'annulee', 422, 'Impossible de facturer une location annulée.');
        abort_if($location->facturation()->exists(), 422, 'Une facture existe déjà pour cette location.');

        $data = $request->validate([
            'taux_tva'        => 'nullable|numeric|min:0|max:100',
            'tarif_journalier'=> 'nullable|numeric|min:0',
            'date_echeance'   => 'nullable|date',
            'observations'    => 'nullable|string|max:2000',
        ]);

        $debut = $location->date_debut;
        $fin   = $location->date_retour_effective ?? now();
        $jours = max(1, (int) ceil($debut->diffInSeconds($fin) / 86400));

        $tarif      = (float) ($data['tarif_journalier'] ?? $location->tarif_journalier);
        $montantHt  = round($tarif * $jours, 2);
        $tauxTva    = (float) ($data['taux_tva'] ?? 18.0);
        $montantTtc = round($montantHt * (1 + $tauxTva / 100), 2);

        $facture = Facturation::query()->create([
            'numero_facture' => $referenceService->nextFacture(),
            'date_facture'   => $fin->toDateString(),
            'montant'        => $montantHt,
            'montant_ht'     => $montantHt,
            'taux_tva'       => $tauxTva,
            'montant_ttc'    => $montantTtc,
            'statut'         => 'impayee',
            'id_location'    => $location->id,
            'date_echeance'  => $data['date_echeance'] ?? null,
            'observations'   => $data['observations'] ?? null,
        ]);

        $this->logAction('create', 'facture_location', $facture, $facture->toArray(), $request);

        return $this->apiItem($facture->load('paiements'), 201, [
            'message' => 'Facture générée avec succès',
        ]);
    }

    public function getFacture(Location $location)
    {
        $this->ensurePermission('manage_location');

        $facture = $location->facturation()->with('paiements')->first();
        abort_if(! $facture, 404, 'Aucune facture pour cette location.');

        return $this->apiItem($facture);
    }

    public function addPaiement(Request $request, Location $location)
    {
        $this->ensurePermission('manage_location');

        $facture = $location->facturation()->first();
        abort_if(! $facture, 422, "Générez d'abord une facture pour cette location.");
        abort_if($facture->statut === 'payee', 422, 'Cette facture est déjà entièrement payée.');

        $data = $request->validate([
            'montant'            => 'required|numeric|min:0.01',
            'mode_paiement'      => 'required|string|max:100',
            'reference_paiement' => 'nullable|string|max:100',
            'banque'             => 'nullable|string|max:150',
            'date'               => 'required|date',
        ]);

        $resteExact = round((float) $facture->reste_a_payer, 2);
        $montant    = round((float) $data['montant'], 2);
        abort_if(
            $montant > $resteExact + 0.01,
            422,
            'Le montant dépasse le reste à payer : '.number_format($resteExact, 0, ',', ' ').' XOF.'
        );

        $paiement = DB::transaction(function () use ($data, $facture, $location) {
            $p = Paiement::query()->create([
                'date'               => $data['date'],
                'mode_paiement'      => $data['mode_paiement'],
                'reference_paiement' => $data['reference_paiement'] ?? null,
                'banque'             => $data['banque'] ?? null,
                'montant'            => $data['montant'],
                'reste'              => max(round($facture->reste_a_payer - $data['montant'], 2), 0),
                'id_facture'         => $facture->id,
                'id_location'        => $location->id,
                'id_client'          => $location->id_client,
            ]);

            $facture->refresh()->load('paiements');
            $facture->syncStatut();

            return $p;
        });

        $this->logAction('create', 'paiement_location', $paiement, $paiement->toArray(), $request);
        $this->resetDashboardCache();

        return $this->apiItem($paiement, 201, [
            'message' => 'Paiement enregistré',
            'facture' => $facture->fresh()->load('paiements'),
        ]);
    }
}
