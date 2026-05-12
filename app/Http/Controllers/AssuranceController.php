<?php

namespace App\Http\Controllers;

use App\Models\Assurance;
use Illuminate\Http\Request;

class AssuranceController extends Controller
{
    public function index(Request $request)
    {
        $this->ensurePermission('view_voitures');

        $assurances = Assurance::query()
            ->with('voiture:id,marque,modele,numero_chassis')
            ->when($request->filled('search'), function ($q) use ($request) {
                $needle = '%'.$request->string('search')->trim().'%';
                $q->where(function ($sub) use ($needle) {
                    $sub->where('compagnie', 'like', $needle)
                        ->orWhere('numero_police', 'like', $needle)
                        ->orWhere('type_assurance', 'like', $needle);
                });
            })
            ->when($request->filled('id_voiture'), fn ($q) => $q->where('id_voiture', $request->integer('id_voiture')))
            ->latest()
            ->paginate(15);

        return $this->apiCollection($assurances);
    }

    public function store(Request $request)
    {
        $this->ensurePermission('view_voitures');

        $data = $request->validate([
            'id_voiture'      => 'required|exists:voitures,id',
            'id_gestionnaire' => 'nullable|exists:employes,id',
            'compagnie'       => 'required|string|max:255',
            'numero_police'   => 'nullable|string|max:255',
            'type_assurance'  => 'nullable|string|max:100',
            'date_debut'      => 'required|date',
            'date_fin'        => 'required|date|after:date_debut',
            'montant_prime'   => 'nullable|numeric|min:0',
            'statut'          => 'nullable|string|max:50',
            'notes'           => 'nullable|string',
        ]);

        $assurance = Assurance::query()->create($data);
        $this->logAction('create', 'assurance', $assurance, $data, $request);

        return $this->apiItem($assurance->load('voiture:id,marque,modele'), 201, [
            'message' => 'Assurance créée',
        ]);
    }

    public function show(Assurance $assurance)
    {
        $this->ensurePermission('view_voitures');

        return $this->apiItem($assurance->load(['voiture:id,marque,modele', 'sinistres']));
    }

    public function update(Request $request, Assurance $assurance)
    {
        $this->ensurePermission('view_voitures');

        $data = $request->validate([
            'id_voiture'      => 'sometimes|exists:voitures,id',
            'id_gestionnaire' => 'nullable|exists:employes,id',
            'compagnie'       => 'sometimes|string|max:255',
            'numero_police'   => 'nullable|string|max:255',
            'type_assurance'  => 'nullable|string|max:100',
            'date_debut'      => 'sometimes|date',
            'date_fin'        => 'sometimes|date',
            'montant_prime'   => 'nullable|numeric|min:0',
            'statut'          => 'nullable|string|max:50',
            'notes'           => 'nullable|string',
        ]);

        $assurance->update($data);
        $this->logAction('update', 'assurance', $assurance, $data, $request);

        return $this->apiItem($assurance->fresh()->load('voiture:id,marque,modele'), 200, [
            'message' => 'Assurance mise à jour',
        ]);
    }

    public function destroy(Assurance $assurance)
    {
        $this->ensurePermission('view_voitures');
        $this->logAction('delete', 'assurance', $assurance, [], request());
        $assurance->delete();

        return $this->apiDeleted();
    }
}
