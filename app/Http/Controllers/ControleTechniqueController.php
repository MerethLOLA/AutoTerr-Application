<?php

namespace App\Http\Controllers;

use App\Models\ControleTechnique;
use Illuminate\Http\Request;

class ControleTechniqueController extends Controller
{
    public function index(Request $request)
    {
        $this->ensurePermission('view_voitures');

        $controles = ControleTechnique::query()
            ->with('voiture:id,marque,modele,numero_chassis')
            ->when($request->filled('search'), function ($q) use ($request) {
                $needle = '%'.$request->string('search')->trim().'%';
                $q->where(function ($sub) use ($needle) {
                    $sub->where('type_controle', 'like', $needle)
                        ->orWhere('organisme', 'like', $needle)
                        ->orWhere('resultat', 'like', $needle);
                });
            })
            ->when($request->filled('id_voiture'), fn ($q) => $q->where('id_voiture', $request->integer('id_voiture')))
            ->latest('date_controle')
            ->paginate(15);

        return $this->apiCollection($controles);
    }

    public function store(Request $request)
    {
        $this->ensurePermission('view_voitures');

        $data = $request->validate([
            'id_voiture'      => 'required|exists:voitures,id',
            'type_controle'   => 'nullable|string|max:100',
            'date_controle'   => 'required|date',
            'date_expiration' => 'nullable|date|after:date_controle',
            'resultat'        => 'nullable|string|max:100',
            'organisme'       => 'nullable|string|max:255',
            'cout'            => 'nullable|numeric|min:0',
            'observations'    => 'nullable|string',
        ]);

        $controle = ControleTechnique::query()->create($data);
        $this->logAction('create', 'controle_technique', $controle, $data, $request);

        return $this->apiItem($controle->load('voiture:id,marque,modele'), 201, [
            'message' => 'Contrôle technique enregistré',
        ]);
    }

    public function show(ControleTechnique $controleTechnique)
    {
        $this->ensurePermission('view_voitures');

        return $this->apiItem($controleTechnique->load('voiture:id,marque,modele'));
    }

    public function update(Request $request, ControleTechnique $controleTechnique)
    {
        $this->ensurePermission('view_voitures');

        $data = $request->validate([
            'id_voiture'      => 'sometimes|exists:voitures,id',
            'type_controle'   => 'nullable|string|max:100',
            'date_controle'   => 'sometimes|date',
            'date_expiration' => 'nullable|date',
            'resultat'        => 'nullable|string|max:100',
            'organisme'       => 'nullable|string|max:255',
            'cout'            => 'nullable|numeric|min:0',
            'observations'    => 'nullable|string',
        ]);

        $controleTechnique->update($data);
        $this->logAction('update', 'controle_technique', $controleTechnique, $data, $request);

        return $this->apiItem($controleTechnique->fresh()->load('voiture:id,marque,modele'), 200, [
            'message' => 'Contrôle technique mis à jour',
        ]);
    }

    public function destroy(ControleTechnique $controleTechnique)
    {
        $this->ensurePermission('view_voitures');
        $this->logAction('delete', 'controle_technique', $controleTechnique, [], request());
        $controleTechnique->delete();

        return $this->apiDeleted();
    }
}
