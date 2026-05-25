<?php

namespace App\Http\Controllers;

use App\Models\Entretien;
use App\Services\DocumentExportService;
use Illuminate\Http\Request;

class EntretienController extends Controller
{
    public function index(Request $request)
    {
        $this->ensurePermission('view_voitures');

        $entretiens = Entretien::query()
            ->with([
                'voiture:id,marque,modele,numero_chassis',
                'technicien:id,nom,prenom',
            ])
            ->when($request->filled('search'), function ($q) use ($request) {
                $needle = '%'.$request->string('search')->trim().'%';
                $q->where(function ($sub) use ($needle) {
                    $sub->where('type_entretien', 'like', $needle)
                        ->orWhere('statut', 'like', $needle);
                });
            })
            ->when($request->filled('id_voiture'), fn ($q) => $q->where('id_voiture', $request->integer('id_voiture')))
            ->when($request->filled('statut'), fn ($q) => $q->where('statut', $request->string('statut')->toString()))
            ->latest()
            ->paginate(15);

        return $this->apiCollection($entretiens);
    }

    public function store(Request $request)
    {
        $this->ensurePermission('view_voitures');

        $data = $request->validate([
            'id_voiture'          => 'required|exists:voitures,id',
            'id_technicien'       => 'nullable|exists:employes,id',
            'type_entretien'      => 'required|string|max:255',
            'date_prevue'         => 'nullable|date',
            'date_realise'        => 'nullable|date',
            'kilometrage_prevu'   => 'nullable|integer|min:0',
            'kilometrage_realise' => 'nullable|integer|min:0',
            'cout'                => 'nullable|numeric|min:0',
            'statut'              => 'nullable|string|max:50',
            'notes'               => 'nullable|string',
        ]);

        $entretien = Entretien::query()->create($data);
        $this->logAction('create', 'entretien', $entretien, $data, $request);

        return $this->apiItem($entretien->load(['voiture:id,marque,modele', 'technicien:id,nom,prenom']), 201, [
            'message' => 'Entretien planifié',
        ]);
    }

    public function show(Entretien $entretien)
    {
        $this->ensurePermission('view_voitures');

        return $this->apiItem($entretien->load(['voiture:id,marque,modele', 'technicien:id,nom,prenom']));
    }

    public function update(Request $request, Entretien $entretien)
    {
        $this->ensurePermission('view_voitures');

        $data = $request->validate([
            'id_voiture'          => 'sometimes|exists:voitures,id',
            'id_technicien'       => 'nullable|exists:employes,id',
            'type_entretien'      => 'sometimes|string|max:255',
            'date_prevue'         => 'nullable|date',
            'date_realise'        => 'nullable|date',
            'kilometrage_prevu'   => 'nullable|integer|min:0',
            'kilometrage_realise' => 'nullable|integer|min:0',
            'cout'                => 'nullable|numeric|min:0',
            'statut'              => 'nullable|string|max:50',
            'notes'               => 'nullable|string',
        ]);

        $entretien->update($data);
        $this->logAction('update', 'entretien', $entretien, $data, $request);

        return $this->apiItem($entretien->fresh()->load(['voiture:id,marque,modele', 'technicien:id,nom,prenom']), 200, [
            'message' => 'Entretien mis à jour',
        ]);
    }

    public function destroy(Entretien $entretien)
    {
        $this->ensurePermission('view_voitures');
        $this->logAction('delete', 'entretien', $entretien, [], request());
        $entretien->delete();

        return $this->apiDeleted();
    }

    public function export(Entretien $entretien, DocumentExportService $exportService)
    {
        $this->ensurePermission('view_voitures');
        $this->logAction('export', 'entretien', $entretien, [], request());

        return $exportService->entretien($entretien);
    }
}
