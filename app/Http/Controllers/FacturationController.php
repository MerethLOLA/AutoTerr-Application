<?php

namespace App\Http\Controllers;

use App\Http\Requests\FacturationRequest;
use App\Models\Facturation;
use App\Models\Vente;
use App\Services\BusinessReferenceService;
use App\Services\DocumentExportService;
use Illuminate\Http\Request;

class FacturationController extends Controller
{
    public function create()
    {
        $this->ensurePermission('manage_ventes');

        return response()->json([
            'ventes' => Vente::query()->with(['client', 'voiture'])->orderByDesc('date_vente')->get(),
        ]);
    }

    public function index(Request $request)
    {
        $this->ensurePermission('manage_ventes');

        $factures = Facturation::query()
            ->with(['vente.client', 'vente.voiture', 'location', 'paiements'])
            ->when($request->filled('statut'), fn ($query) => $query->where('statut', $request->string('statut')->toString()))
            ->latest('date_facture')
            ->paginate(15);

        return $this->apiCollection($factures);
    }

    public function store(FacturationRequest $request)
    {
        $this->ensurePermission('manage_ventes');
        $data = $this->normalizeFactureData($request->validated());
        $facture = Facturation::query()->create($data);
        $facture->syncStatut();
        $this->logAction('create', 'facturation', $facture, $data, $request);
        $this->resetDashboardCache();

        $facture->load(['vente', 'paiements']);

        if ($request->wantsJson()) {
            return $this->apiItem($facture, 201, [
                'message' => 'Facture creee',
            ]);
        }

        return redirect()->route('facturations.show', $facture)->with('success', 'Facture enregistree.');
    }

    public function show(Facturation $facturation)
    {
        $this->ensurePermission('manage_ventes');

        $facturation->load(['vente.client', 'vente.voiture', 'paiements']);

        return $this->apiItem($facturation);
    }

    public function edit(Facturation $facturation)
    {
        $this->ensurePermission('manage_ventes');

        return response()->json([
            'facturation' => $facturation,
            'ventes' => Vente::query()->with(['client', 'voiture'])->orderByDesc('date_vente')->get(),
        ]);
    }

    public function update(FacturationRequest $request, Facturation $facturation)
    {
        $this->ensurePermission('manage_ventes');
        $data = $this->normalizeFactureData($request->validated(), $facturation);
        $this->refuserModifSiPayee($facturation, $data);
        $facturation->update($data);
        $facturation->syncStatut();
        $this->logAction('update', 'facturation', $facturation, $data, $request);
        $this->resetDashboardCache();

        $facturation = $facturation->fresh()->load(['vente', 'paiements']);

        if ($request->wantsJson()) {
            return $this->apiItem($facturation, 200, [
                'message' => 'Facture mise a jour',
            ]);
        }

        return redirect()->route('facturations.show', $facturation)->with('success', 'Facture mise a jour.');
    }

    public function destroy(Facturation $facturation)
    {
        $this->ensurePermission('manage_ventes');
        $this->logAction('delete', 'facturation', $facturation, [], request());
        $facturation->delete();
        $this->resetDashboardCache();

        return $this->apiDeleted();
    }

    public function export(Facturation $facturation, DocumentExportService $exportService)
    {
        $this->ensurePermission('manage_ventes');
        $this->logAction('export', 'facturation', $facturation, [], request());

        return $exportService->facture($facturation);
    }

    /** Empêche de modifier le montant/rattachement d'une facture après qu'un paiement y a été enregistré. */
    private function refuserModifSiPayee(Facturation $facturation, array $data): void
    {
        if (! $facturation->exists || ! $facturation->paiements()->exists()) {
            return;
        }

        foreach (['id_vente', 'id_location', 'montant', 'remise', 'taux_tva'] as $champ) {
            if (! array_key_exists($champ, $data)) {
                continue;
            }
            $actuel = $facturation->{$champ};
            $nouveau = $data[$champ];
            $modifie = is_numeric($actuel) || is_numeric($nouveau)
                ? abs((float) $nouveau - (float) $actuel) > 0.01
                : $nouveau != $actuel;

            abort_if($modifie, 422, "Impossible de modifier « {$champ} » : un paiement a déjà été enregistré sur cette facture.");
        }
    }

    private function normalizeFactureData(array $data, ?Facturation $facturation = null): array
    {
        $montantBase = (float) ($data['montant'] ?? $facturation?->montant ?? 0);
        $remise = (float) ($data['remise'] ?? $facturation?->remise ?? 0);
        $tauxTva = (float) ($data['taux_tva'] ?? $facturation?->taux_tva ?? 18);
        $montantHt = max($montantBase - $remise, 0);
        // XOF n'a pas de sous-unité : on arrondit au franc le plus proche.
        $montantTtc = round($montantHt * (1 + ($tauxTva / 100)));

        $data['numero_facture'] = $data['numero_facture']
            ?? $facturation?->numero_facture
            ?? app(BusinessReferenceService::class)->nextFacture();
        $data['montant'] = $montantBase;
        $data['remise'] = $remise;
        $data['montant_ht'] = $montantHt;
        $data['taux_tva'] = $tauxTva;
        $data['montant_ttc'] = $montantTtc;

        return $data;
    }
}
