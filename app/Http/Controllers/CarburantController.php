<?php

namespace App\Http\Controllers;

use App\Models\Carburant;
use Illuminate\Http\Request;

class CarburantController extends Controller
{
    public function index(Request $request)
    {
        $this->ensurePermission('view_voitures');

        $carburants = Carburant::query()
            ->with('voiture:id,marque,modele,numero_chassis')
            ->when($request->filled('search'), function ($q) use ($request) {
                $needle = '%'.$request->string('search')->trim().'%';
                $q->where(function ($sub) use ($needle) {
                    $sub->where('type_carburant', 'like', $needle)
                        ->orWhere('station', 'like', $needle);
                });
            })
            ->when($request->filled('id_voiture'), fn ($q) => $q->where('id_voiture', $request->integer('id_voiture')))
            ->latest('date_plein')
            ->paginate(15);

        return $this->apiCollection($carburants);
    }

    public function store(Request $request)
    {
        $this->ensurePermission('view_voitures');

        $data = $request->validate([
            'id_voiture'           => 'required|exists:voitures,id',
            'date_plein'           => 'required|date',
            'kilometrage_au_plein' => 'nullable|integer|min:0',
            'quantite_litres'      => 'nullable|numeric|min:0',
            'prix_par_litre'       => 'nullable|numeric|min:0',
            'montant_total'        => 'required|numeric|min:0',
            'type_carburant'       => 'nullable|string|max:50',
            'station'              => 'nullable|string|max:255',
            'notes'                => 'nullable|string',
        ]);

        $carburant = Carburant::query()->create($data);

        // Mettre à jour le kilométrage du véhicule si plus élevé
        if (!empty($data['kilometrage_au_plein'])) {
            $voiture = $carburant->voiture;
            if ($voiture && $data['kilometrage_au_plein'] > ($voiture->kilometrage ?? 0)) {
                $voiture->update(['kilometrage' => $data['kilometrage_au_plein']]);
            }
        }

        $this->logAction('create', 'carburant', $carburant, $data, $request);

        return $this->apiItem($carburant->load('voiture:id,marque,modele'), 201, [
            'message' => 'Plein enregistré',
        ]);
    }

    public function show(Carburant $carburant)
    {
        $this->ensurePermission('view_voitures');

        return $this->apiItem($carburant->load('voiture:id,marque,modele'));
    }

    public function update(Request $request, Carburant $carburant)
    {
        $this->ensurePermission('view_voitures');

        $data = $request->validate([
            'id_voiture'           => 'sometimes|exists:voitures,id',
            'date_plein'           => 'sometimes|date',
            'kilometrage_au_plein' => 'nullable|integer|min:0',
            'quantite_litres'      => 'nullable|numeric|min:0',
            'prix_par_litre'       => 'nullable|numeric|min:0',
            'montant_total'        => 'sometimes|numeric|min:0',
            'type_carburant'       => 'nullable|string|max:50',
            'station'              => 'nullable|string|max:255',
            'notes'                => 'nullable|string',
        ]);

        $carburant->update($data);
        $this->logAction('update', 'carburant', $carburant, $data, $request);

        return $this->apiItem($carburant->fresh()->load('voiture:id,marque,modele'), 200, [
            'message' => 'Plein mis à jour',
        ]);
    }

    public function destroy(Carburant $carburant)
    {
        $this->ensurePermission('view_voitures');
        $this->logAction('delete', 'carburant', $carburant, [], request());
        $carburant->delete();

        return $this->apiDeleted();
    }
}
