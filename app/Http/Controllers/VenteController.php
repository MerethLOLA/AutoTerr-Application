<?php

namespace App\Http\Controllers;

use App\Http\Requests\VenteRequest;
use App\Models\Client;
use App\Models\Employe;
use App\Models\Facturation;
use App\Models\Vente;
use App\Models\Voiture;
use App\Services\BusinessReferenceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class VenteController extends Controller
{
    public function create(Request $request)
    {
        $this->ensurePermission('create_vente');

        $selectedVoiture = $request->integer('voiture');

        return view('ventes.create', [
            'vente' => new Vente(['date_vente' => now()->toDateString(), 'statut' => 'finalisee', 'id_voiture' => $selectedVoiture ?: null]),
            'clients' => Client::query()->orderBy('nom')->get(['id', 'nom', 'prenom', 'raison_sociale']),
            'voitures' => Voiture::query()->where('statut', 'disponible')->orderBy('marque')->get(['id', 'marque', 'modele', 'prix', 'statut']),
            'employes' => Employe::query()->orderBy('nom')->get(['id', 'nom', 'prenom', 'poste']),
            'isEdit' => false,
        ]);
    }

    public function index(Request $request)
    {
        $this->ensurePermission('manage_ventes');

        $ventes = Vente::query()
            ->select([
                'id', 'reference_vente', 'date_vente', 'id_client', 'id_voiture',
                'prix_final', 'statut', 'id_employe',
            ])
            ->with([
                'client:id,nom,prenom',
                'voiture:id,marque,modele',
                'employe:id,nom,prenom',
                'facturation:id,id_vente,numero_facture,statut,montant_ttc',
            ])
            ->withSum('paiements', 'montant')
            ->when($request->filled('statut'), fn ($query) => $query->where('statut', $request->string('statut')->toString()))
            ->latest('date_vente')
            ->paginate(15);

        if ($request->wantsJson()) {
            return response()->json($ventes);
        }

        return view('ventes.index', compact('ventes'));
    }

    public function store(VenteRequest $request, BusinessReferenceService $referenceService)
    {
        $this->ensurePermission('create_vente');
        $data = $request->validated();
        $result = DB::transaction(function () use ($data, $referenceService) {
            $remise = (float) ($data['remise'] ?? 0);
            unset($data['remise']);

            $voiture = Voiture::query()->lockForUpdate()->findOrFail($data['id_voiture']);

            abort_if($voiture->statut !== 'disponible', 422, 'Le vehicule doit etre disponible pour etre vendu.');

            $data['reference_vente'] = 'VTE-'.now()->format('YmdHis').'-'.Str::upper(Str::random(4));

            $vente = Vente::query()->create($data);

            $montantHt = max((float) $vente->prix_final - $remise, 0);
            $tauxTva = 18.0;
            $montantTtc = round($montantHt * (1 + ($tauxTva / 100)), 2);

            $facture = Facturation::query()->create([
                'numero_facture' => $referenceService->nextFacture(),
                'date_facture' => $vente->date_vente,
                'mode_livraison' => 'sur_place',
                'montant' => $vente->prix_final,
                'remise' => $remise,
                'montant_ht' => $montantHt,
                'taux_tva' => $tauxTva,
                'montant_ttc' => $montantTtc,
                'statut' => 'impayee',
                'date_echeance' => $vente->date_vente?->copy()->addDays(7),
                'observations' => $vente->observations,
                'id_vente' => $vente->id,
            ]);

            $voiture->update(['statut' => 'vendu']);

            return [$vente, $facture];
        });

        [$vente, $facture] = $result;
        $this->logAction('create', 'vente', $vente, $data, $request);
        $this->logAction('create', 'facturation', $facture, $facture->toArray(), $request);
        $this->resetDashboardCache();

        $vente->load(['client', 'voiture', 'employe', 'facturation']);

        if ($request->wantsJson()) {
            return response()->json($vente, 201);
        }

        return redirect()->route('ventes.show', $vente)->with('success', 'Vente enregistree avec facture automatique.');
    }

    public function show(Request $request, Vente $vente)
    {
        $this->ensurePermission('manage_ventes');

        $vente->load([
            'client:id,nom,prenom',
            'voiture:id,marque,modele',
            'facturation:id,id_vente,numero_facture,montant_ttc,statut',
            'paiements:id,id_vente,date,montant',
        ]);

        if ($request->wantsJson()) {
            return response()->json($vente);
        }

        return view('ventes.show', compact('vente'));
    }

    public function edit(Vente $vente)
    {
        $this->ensurePermission('manage_ventes');

        return view('ventes.edit', [
            'vente' => $vente,
            'clients' => Client::query()->orderBy('nom')->get(['id', 'nom', 'prenom', 'raison_sociale']),
            'voitures' => Voiture::query()
                ->where('statut', 'disponible')
                ->orWhereKey($vente->id_voiture)
                ->orderBy('marque')
                ->get(['id', 'marque', 'modele', 'prix', 'statut']),
            'employes' => Employe::query()->orderBy('nom')->get(['id', 'nom', 'prenom', 'poste']),
            'isEdit' => true,
        ]);
    }

    public function update(VenteRequest $request, Vente $vente)
    {
        $this->ensurePermission('manage_ventes');
        $data = $request->validated();

        DB::transaction(function () use ($vente, $data) {
            $vente->update($data);

            if ($vente->facturation) {
                $montantBase = (float) $vente->prix_final;
                $remise = (float) ($vente->facturation->remise ?? 0);
                $tauxTva = (float) ($vente->facturation->taux_tva ?? 18);
                $montantHt = max($montantBase - $remise, 0);
                $montantTtc = round($montantHt * (1 + ($tauxTva / 100)), 2);

                $vente->facturation->update([
                    'date_facture' => $vente->date_vente,
                    'montant' => $montantBase,
                    'montant_ht' => $montantHt,
                    'montant_ttc' => $montantTtc,
                    'observations' => $vente->observations,
                ]);
                $vente->facturation->refresh();
                $vente->facturation->syncStatut();
            }
        });

        $this->logAction('update', 'vente', $vente, $data, $request);
        $this->resetDashboardCache();

        $vente = $vente->fresh()->load(['client', 'voiture', 'employe', 'facturation']);

        if ($request->wantsJson()) {
            return response()->json($vente);
        }

        return redirect()->route('ventes.show', $vente)->with('success', 'Vente mise a jour.');
    }

    public function destroy(Vente $vente)
    {
        $this->ensurePermission('manage_ventes');
        $this->logAction('delete', 'vente', $vente, [], request());
        $vente->delete();
        $this->resetDashboardCache();

        return response()->json([], 204);
    }
}
