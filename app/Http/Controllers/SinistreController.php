<?php

namespace App\Http\Controllers;

use App\Models\Sinistre;
use App\Services\DocumentExportService;
use Illuminate\Http\Request;

class SinistreController extends Controller
{
    public function index(Request $request)
    {
        $this->ensurePermission('view_voitures');

        $sinistres = Sinistre::query()
            ->with([
                'voiture:id,marque,modele',
                'client:id,nom,prenom',
                'assurance:id,compagnie,numero_police',
            ])
            ->when($request->filled('search'), function ($q) use ($request) {
                $needle = '%'.$request->string('search')->trim().'%';
                $q->where(function ($sub) use ($needle) {
                    $sub->where('type_sinistre', 'like', $needle)
                        ->orWhere('numero_declaration', 'like', $needle)
                        ->orWhere('statut', 'like', $needle);
                });
            })
            ->when($request->filled('id_voiture'), fn ($q) => $q->where('id_voiture', $request->integer('id_voiture')))
            ->latest('date_sinistre')
            ->paginate(15);

        return $this->apiCollection($sinistres);
    }

    public function store(Request $request)
    {
        $this->ensurePermission('view_voitures');

        $data = $request->validate([
            'id_voiture'         => 'required|exists:voitures,id',
            'id_client'          => 'nullable|exists:clients,id',
            'id_assurance'       => 'nullable|exists:assurances,id',
            'id_gestionnaire'    => 'nullable|exists:employes,id',
            'date_sinistre'      => 'required|date',
            'type_sinistre'      => 'nullable|string|max:100',
            'description'        => 'required|string',
            'montant_dommages'   => 'nullable|numeric|min:0',
            'statut'             => 'nullable|string|max:50',
            'numero_declaration' => 'nullable|string|max:255',
            'notes'              => 'nullable|string',
        ]);

        $sinistre = Sinistre::query()->create($data);
        $this->logAction('create', 'sinistre', $sinistre, $data, $request);

        return $this->apiItem($sinistre->load(['voiture:id,marque,modele', 'client:id,nom,prenom']), 201, [
            'message' => 'Sinistre enregistré',
        ]);
    }

    public function show(Sinistre $sinistre)
    {
        $this->ensurePermission('view_voitures');

        return $this->apiItem($sinistre->load([
            'voiture:id,marque,modele',
            'client:id,nom,prenom',
            'assurance:id,compagnie,numero_police',
        ]));
    }

    public function update(Request $request, Sinistre $sinistre)
    {
        $this->ensurePermission('view_voitures');

        $data = $request->validate([
            'id_voiture'         => 'sometimes|exists:voitures,id',
            'id_client'          => 'nullable|exists:clients,id',
            'id_assurance'       => 'nullable|exists:assurances,id',
            'date_sinistre'      => 'sometimes|date',
            'type_sinistre'      => 'nullable|string|max:100',
            'description'        => 'sometimes|string',
            'montant_dommages'   => 'nullable|numeric|min:0',
            'statut'             => 'nullable|string|max:50',
            'numero_declaration' => 'nullable|string|max:255',
            'notes'              => 'nullable|string',
        ]);

        $sinistre->update($data);
        $this->logAction('update', 'sinistre', $sinistre, $data, $request);

        return $this->apiItem($sinistre->fresh()->load(['voiture:id,marque,modele', 'client:id,nom,prenom']), 200, [
            'message' => 'Sinistre mis à jour',
        ]);
    }

    public function destroy(Sinistre $sinistre)
    {
        $this->ensurePermission('view_voitures');
        $this->logAction('delete', 'sinistre', $sinistre, [], request());
        $sinistre->delete();

        return $this->apiDeleted();
    }

    public function export(Sinistre $sinistre, DocumentExportService $exportService)
    {
        $this->ensurePermission('view_voitures');
        $this->logAction('export', 'sinistre', $sinistre, [], request());

        return $exportService->sinistre($sinistre);
    }
}
