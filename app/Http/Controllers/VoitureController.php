<?php

namespace App\Http\Controllers;

use App\Http\Requests\VoitureRequest;
use App\Models\Fournisseur;
use App\Models\ImageVoiture;
use App\Models\OrigineMarque;
use App\Models\TypeVehicule;
use App\Models\Voiture;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class VoitureController extends Controller
{
    public function publicIndex(Request $request)
    {
        $voitures = Voiture::query()
            ->select(['id', 'marque', 'modele', 'annee', 'prix', 'kilometrage', 'statut', 'energie', 'image_principale', 'created_at'])
            ->with('images:id,id_voiture,chemin')
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
                'energie', 'image_principale', 'type_vehicule_id', 'origine_marque_id', 'id_fournisseur', 'created_at',
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
            return $this->apiCollection($voitures);
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

        if ($request->hasFile('images')) {
            $firstImagePath = null;

            foreach ($request->file('images') as $image) {
                $path = $image->store('voitures', 'public');

                ImageVoiture::create([
                    'id_voiture' => $voiture->id,
                    'chemin' => $path,
                ]);

                if ($firstImagePath === null) {
                    $firstImagePath = $path;
                }
            }

            if ($firstImagePath) {
                $voiture->update(['image_principale' => $firstImagePath]);
            }
        }

        $this->logAction('create', 'voiture', $voiture, $data, $request);
        $this->resetDashboardCache();

        $voiture->load(['fournisseur', 'typeVehicule', 'origineMarque']);

        if ($request->wantsJson()) {
            return $this->apiItem($voiture, 201, [
                'message' => 'Vehicule cree',
            ]);
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
            return $this->apiItem($voiture);
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

        if ($request->hasFile('images')) {
            $firstImagePath = null;

            foreach ($request->file('images') as $image) {
                $path = $image->store('voitures', 'public');

                ImageVoiture::create([
                    'id_voiture' => $voiture->id,
                    'chemin' => $path,
                ]);

                if ($firstImagePath === null) {
                    $firstImagePath = $path;
                }
            }

            if ($firstImagePath) {
                $voiture->update(['image_principale' => $firstImagePath]);
            }
        }

        if (array_key_exists('prix', $details) && (float) $beforePrice !== (float) $details['prix']) {
            $details['ancien_prix'] = $beforePrice;
        }

        $this->logAction('update', 'voiture', $voiture, $details, $request);
        $this->resetDashboardCache();

        $voiture = $voiture->fresh()->load(['fournisseur', 'typeVehicule', 'origineMarque']);

        if ($request->wantsJson()) {
            return $this->apiItem($voiture, 200, [
                'message' => 'Vehicule mis a jour',
            ]);
        }

        return redirect()->route('voitures.show', $voiture)->with('success', 'Vehicule mis a jour.');
    }

    public function destroy(Voiture $voiture)
    {
        $this->ensurePermission('delete_voitures');
        $this->logAction('delete', 'voiture', $voiture, [], request());
        $voiture->delete();
        $this->resetDashboardCache();

        return $this->apiDeleted();
    }

    public function formOptions(): JsonResponse
    {
        return response()->json([
            'types_vehicules' => TypeVehicule::query()->orderBy('nom')->get(['id', 'nom']),
            'origines_marques' => OrigineMarque::query()->orderBy('nom')->get(['id', 'nom']),
            'fournisseurs' => Fournisseur::query()->orderBy('nom')->get(['id', 'nom']),
        ]);
    }

    public function deleteImage(Voiture $voiture, ImageVoiture $image): JsonResponse
    {
        $this->ensurePermission('view_voitures');

        Storage::disk('public')->delete($image->chemin);

        if ($voiture->image_principale === $image->chemin) {
            $next = $voiture->images()->where('id', '!=', $image->id)->first();
            $voiture->update(['image_principale' => $next?->chemin]);
        }

        $image->delete();

        return $this->apiDeleted();
    }

    public function historique(Request $request, Voiture $voiture): JsonResponse
    {
        $this->ensurePermission('view_voitures');

        $voiture->load([
            'ventes:id,id_voiture,reference_vente,date_vente,prix_final,statut',
            'locations:id,id_voiture,reference_location,date_debut,date_fin,statut,tarif_journalier',
            'ticketsSav:id,id_voiture,reference_ticket,objet,statut,date_ouverture,priorite',
            'ordresTravail:id,id_voiture,reference_ot,description,statut,created_at',
            'assurances:id,id_voiture,compagnie,type_assurance,date_debut,date_fin,statut',
            'controlesTechniques:id,id_voiture,type_controle,date_controle,date_expiration,resultat',
            'entretiens:id,id_voiture,type_entretien,date_prevue,date_realise,statut,cout',
            'sinistres:id,id_voiture,type_sinistre,date_sinistre,statut,montant_dommages',
            'carburants:id,id_voiture,date_plein,kilometrage_au_plein,montant_total,type_carburant',
        ]);

        return response()->json(['data' => $voiture]);
    }

    public function alertesExpirations(): JsonResponse
    {
        $this->ensurePermission('view_voitures');

        $horizon = now()->addDays(30);

        $assurancesExpirant = \App\Models\Assurance::query()
            ->with('voiture:id,marque,modele')
            ->where('statut', 'active')
            ->whereBetween('date_fin', [now(), $horizon])
            ->orderBy('date_fin')
            ->get(['id', 'id_voiture', 'compagnie', 'type_assurance', 'date_fin']);

        $assurancesExpirees = \App\Models\Assurance::query()
            ->with('voiture:id,marque,modele')
            ->where('statut', 'active')
            ->where('date_fin', '<', now())
            ->orderBy('date_fin', 'desc')
            ->get(['id', 'id_voiture', 'compagnie', 'type_assurance', 'date_fin']);

        $controlesExpirant = \App\Models\ControleTechnique::query()
            ->with('voiture:id,marque,modele')
            ->whereNotNull('date_expiration')
            ->whereBetween('date_expiration', [now(), $horizon])
            ->orderBy('date_expiration')
            ->get(['id', 'id_voiture', 'type_controle', 'date_expiration', 'resultat']);

        $controlesExpires = \App\Models\ControleTechnique::query()
            ->with('voiture:id,marque,modele')
            ->whereNotNull('date_expiration')
            ->where('date_expiration', '<', now())
            ->orderBy('date_expiration', 'desc')
            ->get(['id', 'id_voiture', 'type_controle', 'date_expiration', 'resultat']);

        $entretiensPrevus = \App\Models\Entretien::query()
            ->with(['voiture:id,marque,modele', 'technicien:id,nom,prenom'])
            ->where('statut', 'planifie')
            ->whereNotNull('date_prevue')
            ->where('date_prevue', '<=', $horizon)
            ->orderBy('date_prevue')
            ->get(['id', 'id_voiture', 'id_technicien', 'type_entretien', 'date_prevue', 'statut']);

        return response()->json([
            'data' => [
                'assurances_expirant' => $assurancesExpirant,
                'assurances_expirees' => $assurancesExpirees,
                'controles_expirant'  => $controlesExpirant,
                'controles_expires'   => $controlesExpires,
                'entretiens_prevus'   => $entretiensPrevus,
                'total_alertes'       => $assurancesExpirant->count()
                    + $assurancesExpirees->count()
                    + $controlesExpirant->count()
                    + $controlesExpires->count()
                    + $entretiensPrevus->count(),
            ],
        ]);
    }

    private function generateNumeroChassis(): string
    {
        do {
            $numero = 'CHS-'.now()->format('ymd').'-'.Str::upper(Str::random(8));
        } while (Voiture::query()->where('numero_chassis', $numero)->exists());

        return $numero;
    }
}
