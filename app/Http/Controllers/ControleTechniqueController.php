<?php

namespace App\Http\Controllers;

use App\Models\ControleTechnique;
use App\Notifications\AssignationNotification;
use Illuminate\Http\Request;

class ControleTechniqueController extends Controller
{
    private function notifierTechnicienAssigne(ControleTechnique $controle): void
    {
        $technicien = $controle->technicien;

        if (! $technicien?->email) {
            return;
        }

        $technicien->notify(new AssignationNotification(
            sujet: "Contrôle technique assigné — {$controle->type_controle}",
            intro: "Un contrôle technique vous a été assigné.",
            details: array_filter([
                "Type : {$controle->type_controle}",
                "Date du contrôle : {$controle->date_controle->format('d/m/Y')}",
                $controle->organisme ? "Organisme : {$controle->organisme}" : null,
            ]),
            actionUrl: url('/controles-techniques'),
            actionLabel: 'Voir le contrôle',
        ));
    }

    public function index(Request $request)
    {
        $this->ensurePermission('view_voitures');

        $controles = ControleTechnique::query()
            ->with(['voiture:id,marque,modele,numero_chassis', 'technicien:id,nom,prenom'])
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
            'id_technicien'   => 'nullable|exists:employes,id',
            'type_controle'   => 'nullable|string|max:100',
            'date_controle'   => 'required|date',
            'date_expiration' => 'nullable|date|after:date_controle',
            'statut'          => 'nullable|string|max:50',
            'resultat'        => ['nullable', 'string', 'max:100', 'required_if:statut,effectue'],
            'organisme'       => 'nullable|string|max:255',
            'cout'            => 'nullable|numeric|min:0',
            'observations'    => 'nullable|string',
        ], [
            'resultat.required_if' => "Le résultat est obligatoire pour marquer le contrôle comme effectué.",
        ]);

        $controle = ControleTechnique::query()->create($data);
        $this->logAction('create', 'controle_technique', $controle, $data, $request);
        $this->notifierTechnicienAssigne($controle);

        return $this->apiItem($controle->load(['voiture:id,marque,modele', 'technicien:id,nom,prenom']), 201, [
            'message' => 'Contrôle technique enregistré',
        ]);
    }

    public function show(ControleTechnique $controleTechnique)
    {
        $this->ensurePermission('view_voitures');

        return $this->apiItem($controleTechnique->load(['voiture:id,marque,modele', 'technicien:id,nom,prenom']));
    }

    public function update(Request $request, ControleTechnique $controleTechnique)
    {
        $this->ensurePermission('view_voitures');

        $data = $request->validate([
            'id_voiture'      => 'sometimes|exists:voitures,id',
            'id_technicien'   => 'nullable|exists:employes,id',
            'type_controle'   => 'nullable|string|max:100',
            'date_controle'   => 'sometimes|date',
            'date_expiration' => 'nullable|date',
            'statut'          => 'nullable|string|max:50',
            'resultat'        => ['nullable', 'string', 'max:100', 'required_if:statut,effectue'],
            'organisme'       => 'nullable|string|max:255',
            'cout'            => 'nullable|numeric|min:0',
            'observations'    => 'nullable|string',
        ], [
            'resultat.required_if' => "Le résultat est obligatoire pour marquer le contrôle comme effectué.",
        ]);

        $technicienChange = $controleTechnique->id_technicien !== ($data['id_technicien'] ?? $controleTechnique->id_technicien);
        $controleTechnique->update($data);
        $this->logAction('update', 'controle_technique', $controleTechnique, $data, $request);

        if ($technicienChange) {
            $this->notifierTechnicienAssigne($controleTechnique->fresh());
        }

        return $this->apiItem($controleTechnique->fresh()->load(['voiture:id,marque,modele', 'technicien:id,nom,prenom']), 200, [
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
