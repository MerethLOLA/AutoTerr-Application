<?php

namespace App\Http\Controllers;

use App\Http\Requests\VoitureRequest;
use App\Models\Fournisseur;
use App\Models\OrigineMarque;
use App\Models\TypeVehicule;
use App\Models\ImageVoiture;
use App\Models\Voiture;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class VoitureController extends Controller
{
    public function publicIndex(Request $request)
    {
        $voitures = Voiture::query()
            ->select(['id', 'marque', 'modele', 'annee', 'prix', 'kilometrage', 'statut', 'energie', 'created_at'])
            ->with('images:id,id_voiture,chemin_image')
            ->when($request->string('search')->toString(), function ($query, $term) {
                $query->where(function ($inner) use ($term) {
                    $inner->where('marque', 'like', "%{$term}%")
                        ->orWhere('modele', 'like', "%{$term}%")
                        ->orWhere('numero_chassis', 'like', "%{$term}%");
                });
            })
            ->where('statut', 'disponible')
            ->latest()
            ->paginate(12);

        // Si c'est une requête API
        if ($request->expectsJson()) {
            return response()->json($voitures);
        }

        return view('catalogue.index', compact('voitures'));
    }

    public function publicShow(Voiture $voiture, Request $request)
    {
        abort_if($voiture->statut !== 'disponible', 404);

        $voiture->load(['images:id,id_voiture,chemin,vue', 'documents:id,id_voiture,numero_document,type_document,created_at']);

        // Si c'est une requête API
        if ($request->expectsJson()) {
            return response()->json($voiture);
        }

        return view('catalogue.show', compact('voiture'));
    }

    public function create()
    {
        $this->ensurePermission('view_voitures');

        return view('voitures.create', [
            'voiture' => new Voiture([
                'statut' => 'disponible',
                'date_acquisition' => now()->toDateString(),
                'numero_chassis' => $this->generateNumeroChassis(),
            ]),
            'origines' => OrigineMarque::query()->orderBy('nom')->get(['id', 'nom']),
            'typesVehicules' => TypeVehicule::query()->orderBy('nom')->get(['id', 'nom']),
            'fournisseurs' => Fournisseur::query()->orderBy('nom')->get(['id', 'nom']),
            'isEdit' => false,
        ]);
    }

    public function index(Request $request)
    {
        $this->ensurePermission('view_voitures');

        $voitures = Voiture::query()
            ->select([
                'id', 'marque', 'modele', 'annee', 'prix', 'kilometrage', 'statut',
                'energie', 'type_vehicule_id', 'origine_marque_id', 'id_fournisseur', 'created_at',
            ])
            ->with([
                'fournisseur:id,nom',
                'typeVehicule:id,nom',
                'origineMarque:id,nom',
                'garantie:id_voiture,type_garantie,date_fin',
            ])
            ->when($request->string('search')->toString(), function ($query, $term) {
                $query->where(function ($inner) use ($term) {
                    $inner->where('marque', 'like', "%{$term}%")
                        ->orWhere('modele', 'like', "%{$term}%")
                        ->orWhere('numero_chassis', 'like', "%{$term}%");
                });
            })
            ->when($request->filled('statut'), fn ($query) => $query->where('statut', $request->string('statut')->toString()))
            ->when($request->filled('energie'), fn ($query) => $query->where('energie', $request->string('energie')->toString()))
            ->when($request->filled('type_vehicule_id'), fn ($query) => $query->where('type_vehicule_id', $request->integer('type_vehicule_id')))
            ->when($request->filled('origine_marque_id'), fn ($query) => $query->parOrigine((int) $request->integer('origine_marque_id')))
            ->latest()
            ->paginate(15);

        if ($request->wantsJson()) {
            return response()->json($voitures);
        }

        $origines = OrigineMarque::query()->orderBy('nom')->get(['id', 'nom']);
        $typesVehicules = TypeVehicule::query()->orderBy('nom')->get(['id', 'nom']);
        $energies = Voiture::query()->whereNotNull('energie')->distinct()->orderBy('energie')->pluck('energie');

        return view('voitures.index', compact('voitures', 'origines', 'typesVehicules', 'energies'));
    }

    public function store(VoitureRequest $request)
    {
        $this->ensurePermission('view_voitures');

        $data = $request->validated();
        $data['numero_chassis'] = $data['numero_chassis'] ?? $this->generateNumeroChassis();

        $voiture = Voiture::query()->create($data);

        // ✅ AJOUT IMAGE (corrigé proprement)
        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $image) {
                $path = $image->store('voitures', 'public');

                ImageVoiture::create([
                    'id_voiture' => $voiture->id,
                    'chemin' => $path,
                ]);
            }
        }

        $this->logAction('create', 'voiture', $voiture, $data, $request);
        $this->resetDashboardCache();

        $voiture->load(['fournisseur', 'typeVehicule', 'origineMarque']);

        if ($request->wantsJson()) {
            return response()->json($voiture, 201);
        }

        return redirect()->route('voitures.show', $voiture)
            ->with('success', 'Vehicule enregistre.');
    }

    public function show(Request $request, Voiture $voiture)
    {
        $this->ensurePermission('view_voitures');

        $voiture->load([
            'fournisseur:id,nom',
            'typeVehicule:id,nom',
            'origineMarque:id,nom',
            'garantie:id_voiture,type_garantie,date_fin',
            'ventes:id,id_voiture,reference_vente,prix_final',
            'images:id,id_voiture,chemin,vue,description',
            'documents:id,id_voiture,id_vente,type_document,numero_document,date_document,date_expiration',
        ]);

        if ($request->wantsJson()) {
            return response()->json($voiture);
        }

        return view('voitures.show', compact('voiture'));
    }

    public function edit(Voiture $voiture)
    {
        $this->ensurePermission('view_voitures');

        return view('voitures.edit', [
            'voiture' => $voiture,
            'origines' => OrigineMarque::query()->orderBy('nom')->get(['id', 'nom']),
            'typesVehicules' => TypeVehicule::query()->orderBy('nom')->get(['id', 'nom']),
            'fournisseurs' => Fournisseur::query()->orderBy('nom')->get(['id', 'nom']),
            'isEdit' => true,
        ]);
    }

    public function update(VoitureRequest $request, Voiture $voiture)
    {
        $this->ensurePermission('view_voitures');
        $beforePrice = $voiture->prix;
        $voiture->update($request->validated());
        $details = $request->validated();

        if (array_key_exists('prix', $details) && (float) $beforePrice !== (float) $details['prix']) {
            $details['ancien_prix'] = $beforePrice;
        }

        $this->logAction('update', 'voiture', $voiture, $details, $request);
        $this->resetDashboardCache();

        $voiture = $voiture->fresh()->load(['fournisseur', 'typeVehicule', 'origineMarque']);

        if ($request->wantsJson()) {
            return response()->json($voiture);
        }

        return redirect()->route('voitures.show', $voiture)->with('success', 'Vehicule mis a jour.');
    }

    public function destroy(Voiture $voiture)
    {
        $this->ensurePermission('view_voitures');
        $this->logAction('delete', 'voiture', $voiture, [], request());
        $voiture->delete();
        $this->resetDashboardCache();

        return response()->json([], 204);
    }

    private function generateNumeroChassis(): string
    {
        do {
            $numero = 'CHS-'.now()->format('ymd').'-'.Str::upper(Str::random(8));
        } while (Voiture::query()->where('numero_chassis', $numero)->exists());

        return $numero;
    }
}
