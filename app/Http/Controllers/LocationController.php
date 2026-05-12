<?php

namespace App\Http\Controllers;

use App\Http\Requests\LocationRequest;
use App\Models\Client;
use App\Models\EtatLieuLocation;
use App\Models\Location;
use App\Models\Voiture;
use App\Services\DocumentExportService;
use Illuminate\Http\Request;
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

        return view('reservations.index', compact('reservations'));
    }

    public function index(Request $request)
    {
        $this->ensurePermission('manage_location');

        $locations = Location::query()
            ->select([
                'id', 'reference_location', 'id_client', 'id_voiture', 'date_debut',
                'date_fin', 'date_retour_effective', 'tarif_journalier', 'statut', 'created_at',
            ])
            ->with([
                'client:id,nom,prenom',
                'voiture:id,marque,modele,statut',
            ])
            ->withCount('etatsDesLieux')
            ->when($request->filled('statut'), fn ($query) => $query->where('statut', $request->string('statut')->toString()))
            ->latest()
            ->paginate(15);

        if ($request->wantsJson()) {
            return $this->apiCollection($locations);
        }

        return view('locations.index', compact('locations'));
    }

    public function create()
    {
        $this->ensurePermission('manage_location');

        return view('locations.create', [
            'location' => new Location([
                'date_debut' => now(),
                'date_fin' => now()->addDay(),
                'statut' => 'en_cours',
            ]),
            'clients' => Client::query()->orderBy('nom')->get(['id', 'nom', 'prenom']),
            'voitures' => Voiture::query()->where('statut', 'disponible')->orderBy('marque')->get(['id', 'marque', 'modele', 'immatriculation']),
            'isEdit' => false,
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

        return redirect()->route('reservations.index')->with('success', 'Reservation confirmee.');
    }

    public function cancelReservation(Request $request, Location $location)
    {
        $this->ensurePermission('manage_location');
        abort_if($location->statut !== 'planifiee', 422, 'Cette reservation ne peut plus etre annulee.');

        $location->update(['statut' => 'annulee']);
        $location->voiture?->update(['statut' => 'disponible']);

        $this->logAction('update', 'reservation', $location, ['statut' => 'annulee'], $request);
        $this->resetDashboardCache();

        return redirect()->route('reservations.index')->with('success', 'Reservation annulee.');
    }

    public function store(LocationRequest $request)
    {
        $this->ensurePermission('manage_location');
        $data = $request->validated();

        $voiture = Voiture::query()->findOrFail($data['id_voiture']);
        abort_if($voiture->statut !== 'disponible', 422, 'Le vehicule doit etre disponible pour etre loue.');

        $data['reference_location'] = 'LOC-'.now()->format('YmdHis').'-'.Str::upper(Str::random(4));
        $location = Location::query()->create($data);

        $voiture->update([
            'statut' => in_array($location->statut, ['planifiee', 'en_cours'], true) ? 'loue' : 'disponible',
        ]);
        $this->logAction('create', 'location', $location, $data, $request);
        $this->resetDashboardCache();

        if (! $request->wantsJson()) {
            return redirect()->route('locations.show', $location)->with('success', 'Location creee.');
        }

        return $this->apiItem($location->load(['client', 'voiture']), 201, [
            'message' => 'Location creee',
        ]);
    }

    public function show(Request $request, Location $location)
    {
        $this->ensurePermission('manage_location');

        $location->load([
            'client:id,nom,prenom',
            'voiture:id,marque,modele',
            'etatsDesLieux:id,id_location,type_etat,description,date_etat',
        ]);

        if ($request->wantsJson()) {
            return $this->apiItem($location);
        }

        return view('locations.show', compact('location'));
    }

    public function edit(Location $location)
    {
        $this->ensurePermission('manage_location');

        return view('locations.edit', [
            'location' => $location,
            'clients' => Client::query()->orderBy('nom')->get(['id', 'nom', 'prenom']),
            'voitures' => Voiture::query()
                ->where('statut', 'disponible')
                ->orWhere('id', $location->id_voiture)
                ->orderBy('marque')
                ->get(['id', 'marque', 'modele', 'immatriculation']),
            'isEdit' => true,
        ]);
    }

    public function update(LocationRequest $request, Location $location)
    {
        $this->ensurePermission('manage_location');
        $data = $request->validated();
        $originalVoitureId = $location->id_voiture;

        if ((int) $originalVoitureId !== (int) $data['id_voiture']) {
            $nouvelleVoiture = Voiture::query()->findOrFail($data['id_voiture']);
            abort_if($nouvelleVoiture->statut !== 'disponible', 422, 'Le vehicule selectionne n est pas disponible.');
            $location->voiture?->update(['statut' => 'disponible']);
            $nouvelleVoiture->update(['statut' => in_array($data['statut'] ?? $location->statut, ['planifiee', 'en_cours'], true) ? 'loue' : 'disponible']);
        } elseif (isset($data['statut'])) {
            $location->voiture?->update([
                'statut' => in_array($data['statut'], ['planifiee', 'en_cours'], true) ? 'loue' : 'disponible',
            ]);
        }

        $location->update($data);

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
        abort_if(! in_array($location->statut, ['planifiee', 'en_cours'], true), 422, 'Cette location ne peut pas etre cloturee.');

        $location->update([
            'statut' => 'terminee',
            'date_retour_effective' => now(),
        ]);
        $location->voiture?->update(['statut' => 'disponible']);

        $this->logAction('retour', 'location', $location, ['statut' => 'terminee'], $request);
        $this->resetDashboardCache();

        return redirect()->route('locations.show', $location)->with('success', 'Retour de location enregistre.');
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

        return $this->apiItem($etat, 201, ['message' => 'État des lieux enregistré']);
    }

    public function export(Location $location, DocumentExportService $exportService)
    {
        $this->ensurePermission('manage_location');
        $this->logAction('export', 'location', $location, [], request());

        return $exportService->location($location);
    }
}
