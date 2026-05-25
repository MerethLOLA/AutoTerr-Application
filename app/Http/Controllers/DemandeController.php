<?php

namespace App\Http\Controllers;

use App\Models\Demande;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DemandeController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $type = $request->input('type');

        $base = $request->validate([
            'type'       => ['required', 'in:information,reprise,essai,achat'],
            'nom'        => ['required', 'string', 'max:255'],
            'email'      => ['required', 'email'],
            'telephone'  => ['nullable', 'string', 'max:30'],
            'message'    => ['nullable', 'string', 'max:2000'],
            'id_voiture' => ['nullable', 'exists:voitures,id'],
        ]);

        if ($type === 'reprise') {
            $extra = $request->validate([
                'reprise_marque'      => ['required', 'string', 'max:100'],
                'reprise_modele'      => ['required', 'string', 'max:100'],
                'reprise_annee'       => ['nullable', 'integer', 'min:1970', 'max:' . (date('Y') + 1)],
                'reprise_kilometrage' => ['nullable', 'integer', 'min:0'],
                'reprise_etat'        => ['nullable', 'in:bon,moyen,mauvais'],
            ]);
            $base = array_merge($base, $extra);
        }

        if ($type === 'achat') {
            $extra = $request->validate([
                'rendez_vous_date'  => ['nullable', 'date', 'after_or_equal:today'],
                'rendez_vous_heure' => ['nullable', 'string', 'max:10'],
            ]);
            $base = array_merge($base, $extra);
        }

        $demande = Demande::query()->create($base);

        return response()->json([
            'message' => 'Demande envoyée avec succès.',
            'data'    => $demande,
        ], 201);
    }

    public function index(Request $request): JsonResponse
    {
        $this->ensureRole('admin', 'super_admin', 'commercial');

        $demandes = Demande::query()
            ->with('voiture:id,marque,modele')
            ->when($request->input('type'), fn ($q, $t) => $q->where('type', $t))
            ->when($request->input('statut'), fn ($q, $s) => $q->where('statut', $s))
            ->latest()
            ->paginate(20);

        return $this->apiCollection($demandes);
    }

    public function update(Request $request, Demande $demande): JsonResponse
    {
        $this->ensureRole('admin', 'super_admin', 'commercial');

        $data = $request->validate([
            'statut' => ['required', 'in:en_attente,traite,archive'],
        ]);

        $demande->update($data);

        return $this->apiItem($demande, 200, ['message' => 'Statut mis à jour.']);
    }
}
