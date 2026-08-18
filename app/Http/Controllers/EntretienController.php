<?php

namespace App\Http\Controllers;

use App\Models\Entretien;
use App\Notifications\AssignationNotification;
use App\Services\DocumentExportService;
use Illuminate\Http\Request;

class EntretienController extends Controller
{
    private function notifierTechnicienAssigne(Entretien $entretien): void
    {
        $technicien = $entretien->technicien;

        if (! $technicien?->email) {
            return;
        }

        $technicien->notify(new AssignationNotification(
            sujet: "Entretien véhicule assigné — {$entretien->type_entretien}",
            intro: "Un entretien vous a été assigné : « {$entretien->type_entretien} ».",
            details: array_filter([
                $entretien->date_prevue ? "Date prévue : {$entretien->date_prevue->format('d/m/Y')}" : null,
                $entretien->kilometrage_prevu ? "Kilométrage prévu : {$entretien->kilometrage_prevu} km" : null,
            ]),
            actionUrl: url('/entretiens'),
            actionLabel: "Voir l'entretien",
        ));
    }

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
        $this->ensureRole('atelier', 'admin', 'super_admin');

        $data = $request->validate([
            'id_voiture'          => 'required|exists:voitures,id',
            'id_technicien'       => 'nullable|exists:employes,id',
            'type_entretien'      => 'required|string|max:255',
            'date_prevue'         => 'nullable|date',
            'date_realise'        => 'nullable|date',
            'kilometrage_prevu'   => 'nullable|integer|min:0',
            'kilometrage_realise' => ['nullable', 'integer', 'min:0', 'required_if:statut,effectue'],
            'statut'              => 'nullable|string|max:50',
            'notes'               => 'nullable|string',
        ], [
            'kilometrage_realise.required_if' => "Le kilométrage réalisé est obligatoire pour marquer l'entretien comme effectué.",
        ]);

        $entretien = Entretien::query()->create($data);
        $this->logAction('create', 'entretien', $entretien, $data, $request);
        $this->notifierTechnicienAssigne($entretien);

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
        $this->ensureRole('atelier', 'admin', 'super_admin');

        $data = $request->validate([
            'id_voiture'          => 'sometimes|exists:voitures,id',
            'id_technicien'       => 'nullable|exists:employes,id',
            'type_entretien'      => 'sometimes|string|max:255',
            'date_prevue'         => 'nullable|date',
            'date_realise'        => 'nullable|date',
            'kilometrage_prevu'   => 'nullable|integer|min:0',
            'kilometrage_realise' => ['nullable', 'integer', 'min:0', 'required_if:statut,effectue'],
            'statut'              => 'nullable|string|max:50',
            'notes'               => 'nullable|string',
        ], [
            'kilometrage_realise.required_if' => "Le kilométrage réalisé est obligatoire pour marquer l'entretien comme effectué.",
        ]);

        $technicienChange = $entretien->id_technicien !== ($data['id_technicien'] ?? $entretien->id_technicien);
        $entretien->update($data);
        $this->logAction('update', 'entretien', $entretien, $data, $request);

        if ($technicienChange) {
            $this->notifierTechnicienAssigne($entretien->fresh());
        }

        return $this->apiItem($entretien->fresh()->load(['voiture:id,marque,modele', 'technicien:id,nom,prenom']), 200, [
            'message' => 'Entretien mis à jour',
        ]);
    }

    public function destroy(Entretien $entretien)
    {
        $this->ensureRole('atelier', 'admin', 'super_admin');
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
