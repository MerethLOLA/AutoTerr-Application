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
    public function create(Request $request)
    {
        $this->ensurePermission('manage_ventes');

        return view('facturations.create', [
            'facturation' => new Facturation([
                'date_facture' => now()->toDateString(),
                'date_echeance' => now()->addDays(7)->toDateString(),
                'taux_tva' => 18,
                'id_vente' => $request->integer('vente'),
            ]),
            'ventes' => Vente::query()->with(['client', 'voiture'])->orderByDesc('date_vente')->get(),
            'isEdit' => false,
        ]);
    }

    public function index(Request $request)
    {
        $this->ensurePermission('manage_ventes');

        $factures = Facturation::query()
            ->with(['vente.client', 'vente.voiture', 'paiements'])
            ->when($request->filled('statut'), fn ($query) => $query->where('statut', $request->string('statut')->toString()))
            ->latest('date_facture')
            ->paginate(15);

        if ($request->wantsJson()) {
            return response()->json($factures);
        }

        return view('facturations.index', compact('factures'));
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
            return response()->json($facture, 201);
        }

        return redirect()->route('facturations.show', $facture)->with('success', 'Facture enregistree.');
    }

    public function show(Request $request, Facturation $facturation)
    {
        $this->ensurePermission('manage_ventes');

        $facturation->load(['vente.client', 'vente.voiture', 'paiements']);

        if ($request->wantsJson()) {
            return response()->json($facturation);
        }

        return view('facturations.show', compact('facturation'));
    }

    public function edit(Facturation $facturation)
    {
        $this->ensurePermission('manage_ventes');

        return view('facturations.edit', [
            'facturation' => $facturation,
            'ventes' => Vente::query()->with(['client', 'voiture'])->orderByDesc('date_vente')->get(),
            'isEdit' => true,
        ]);
    }

    public function update(FacturationRequest $request, Facturation $facturation)
    {
        $this->ensurePermission('manage_ventes');
        $data = $this->normalizeFactureData($request->validated(), $facturation);
        $facturation->update($data);
        $facturation->syncStatut();
        $this->logAction('update', 'facturation', $facturation, $data, $request);
        $this->resetDashboardCache();

        $facturation = $facturation->fresh()->load(['vente', 'paiements']);

        if ($request->wantsJson()) {
            return response()->json($facturation);
        }

        return redirect()->route('facturations.show', $facturation)->with('success', 'Facture mise a jour.');
    }

    public function destroy(Facturation $facturation)
    {
        $this->ensurePermission('manage_ventes');
        $this->logAction('delete', 'facturation', $facturation, [], request());
        $facturation->delete();
        $this->resetDashboardCache();

        return response()->json([], 204);
    }

    public function export(Facturation $facturation, DocumentExportService $exportService)
    {
        $this->ensurePermission('manage_ventes');
        $this->logAction('export', 'facturation', $facturation, [], request());

        return $exportService->facture($facturation);
    }

    private function normalizeFactureData(array $data, ?Facturation $facturation = null): array
    {
        $montantBase = (float) ($data['montant'] ?? $facturation?->montant ?? 0);
        $remise = (float) ($data['remise'] ?? $facturation?->remise ?? 0);
        $tauxTva = (float) ($data['taux_tva'] ?? $facturation?->taux_tva ?? 18);
        $montantHt = max($montantBase - $remise, 0);
        $montantTtc = round($montantHt * (1 + ($tauxTva / 100)), 2);

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
