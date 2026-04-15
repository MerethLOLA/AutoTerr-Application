<?php

namespace App\Http\Controllers;

use App\Http\Requests\EtatLieuLocationRequest;
use App\Models\EtatLieuLocation;
use App\Models\Location;
use Illuminate\Http\Request;

class EtatLieuLocationController extends Controller
{
    public function index(Request $request)
    {
        $this->ensurePermission('manage_location');

        $etats = EtatLieuLocation::query()
            ->with('location')
            ->when($request->filled('type_etat'), fn ($query) => $query->where('type_etat', $request->string('type_etat')->toString()))
            ->latest()
            ->paginate(15);

        if (! $request->wantsJson()) {
            return view('etats-lieux-locations.index', compact('etats'));
        }

        return response()->json($etats);
    }

    public function create(Request $request)
    {
        $this->ensurePermission('manage_location');

        return view('etats-lieux-locations.create', [
            'etatLieuLocation' => new EtatLieuLocation([
                'id_location' => $request->integer('location'),
                'type_etat' => 'depart',
                'date_etat' => now(),
            ]),
            'locations' => Location::query()->orderByDesc('date_debut')->get(['id', 'reference_location']),
            'isEdit' => false,
        ]);
    }

    public function store(EtatLieuLocationRequest $request)
    {
        $this->ensurePermission('manage_location');
        $etat = EtatLieuLocation::query()->create($request->validated());
        $this->logAction('create', 'etat_lieu_location', $etat, $request->validated(), $request);

        if (! $request->wantsJson()) {
            return redirect()->route('locations.show', $etat->id_location)->with('success', 'Etat des lieux ajoute.');
        }

        return response()->json($etat->load('location'), 201);
    }

    public function show(Request $request, EtatLieuLocation $etatLieuLocation)
    {
        $this->ensurePermission('manage_location');

        if (! $request->wantsJson()) {
            return view('etats-lieux-locations.show', compact('etatLieuLocation'));
        }

        return response()->json($etatLieuLocation->load('location'));
    }

    public function edit(EtatLieuLocation $etatLieuLocation)
    {
        $this->ensurePermission('manage_location');

        return view('etats-lieux-locations.edit', [
            'etatLieuLocation' => $etatLieuLocation,
            'locations' => Location::query()->orderByDesc('date_debut')->get(['id', 'reference_location']),
            'isEdit' => true,
        ]);
    }

    public function update(EtatLieuLocationRequest $request, EtatLieuLocation $etatLieuLocation)
    {
        $this->ensurePermission('manage_location');
        $etatLieuLocation->update($request->validated());
        $this->logAction('update', 'etat_lieu_location', $etatLieuLocation, $request->validated(), $request);

        if (! $request->wantsJson()) {
            return redirect()->route('locations.show', $etatLieuLocation->id_location)->with('success', 'Etat des lieux mis a jour.');
        }

        return response()->json($etatLieuLocation->fresh()->load('location'));
    }

    public function destroy(EtatLieuLocation $etatLieuLocation)
    {
        $this->ensurePermission('manage_location');
        $this->logAction('delete', 'etat_lieu_location', $etatLieuLocation, [], request());
        $locationId = $etatLieuLocation->id_location;
        $etatLieuLocation->delete();

        if (! request()->wantsJson()) {
            return redirect()->route('locations.show', $locationId)->with('success', 'Etat des lieux supprime.');
        }

        return response()->json([], 204);
    }
}
