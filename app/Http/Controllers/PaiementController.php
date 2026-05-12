<?php

namespace App\Http\Controllers;

use App\Http\Requests\PaiementRequest;
use App\Models\Client;
use App\Models\Facturation;
use App\Models\Paiement;
use App\Models\Vente;
use App\Services\DocumentExportService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PaiementController extends Controller
{
    public function create(Request $request)
    {
        $this->ensurePermission('manage_recouvrement');

        return view('paiements.create', [
            'paiement' => new Paiement(['date' => now()->toDateString()]),
            'factures' => Facturation::query()->with('vente.client')->orderByDesc('date_facture')->get(),
            'ventes' => Vente::query()->with('client')->orderByDesc('date_vente')->get(['id', 'reference_vente', 'id_client']),
            'clients' => Client::query()->orderBy('nom')->get(['id', 'nom', 'prenom', 'raison_sociale']),
            'isEdit' => false,
            'selectedFactureId' => $request->integer('facture'),
        ]);
    }

    public function index(Request $request)
    {
        $this->ensurePermission('view_paiements');

        $paiements = Paiement::query()
            ->with(['client', 'vente', 'facturation'])
            ->when($request->filled('mode_paiement'), fn ($query) => $query->parMode($request->string('mode_paiement')->toString()))
            ->latest('date')
            ->paginate(15);

        if ($request->wantsJson()) {
            return $this->apiCollection($paiements);
        }

        return view('paiements.index', compact('paiements'));
    }

    public function store(PaiementRequest $request)
    {
        $this->ensurePermission('manage_recouvrement');
        $data = $request->validated();

        $paiement = DB::transaction(function () use ($data) {
            $facture = isset($data['id_facture'])
                ? Facturation::query()->lockForUpdate()->findOrFail($data['id_facture'])
                : null;

            if ($facture) {
                abort_if((float) $data['montant'] > (float) $facture->reste_a_payer, 422, 'Le montant depasse le reste a payer.');
                $data['id_vente'] = $facture->id_vente;
                $data['id_client'] = $facture->vente->id_client;
                $reste = max((float) $facture->reste_a_payer - (float) $data['montant'], 0);
                $data['reste'] = $reste;
            }

            $paiement = Paiement::query()->create($data);

            if ($facture) {
                $facture->refresh()->load('paiements');
                $facture->syncStatut();
            }

            return $paiement;
        });

        $this->logAction('create', 'paiement', $paiement, $paiement->toArray(), $request);
        $this->resetDashboardCache();

        $paiement->load(['client', 'vente', 'facturation']);

        if ($request->wantsJson()) {
            return $this->apiItem($paiement, 201, [
                'message' => 'Paiement enregistre',
            ]);
        }

        return redirect()->route('paiements.show', $paiement)->with('success', 'Paiement enregistre.');
    }

    public function show(Paiement $paiement)
    {
        $this->ensurePermission('view_paiements');

        $paiement->load(['client', 'vente', 'facturation']);

        if (request()->wantsJson()) {
            return $this->apiItem($paiement);
        }

        return view('paiements.show', compact('paiement'));
    }

    public function edit(Paiement $paiement)
    {
        $this->ensurePermission('manage_recouvrement');

        return view('paiements.edit', [
            'paiement' => $paiement,
            'factures' => Facturation::query()->with('vente.client')->orderByDesc('date_facture')->get(),
            'ventes' => Vente::query()->with('client')->orderByDesc('date_vente')->get(['id', 'reference_vente', 'id_client']),
            'clients' => Client::query()->orderBy('nom')->get(['id', 'nom', 'prenom', 'raison_sociale']),
            'isEdit' => true,
            'selectedFactureId' => $paiement->id_facture,
        ]);
    }

    public function update(PaiementRequest $request, Paiement $paiement)
    {
        $this->ensurePermission('manage_recouvrement');
        $data = $request->validated();

        DB::transaction(function () use (&$data, $paiement) {
            $facture = isset($data['id_facture'])
                ? Facturation::query()->lockForUpdate()->findOrFail($data['id_facture'])
                : null;

            if ($facture) {
                $autresPaiements = (float) $facture->paiements()->whereKeyNot($paiement->id)->sum('montant');
                $resteDisponible = max((float) $facture->montant_ttc - $autresPaiements, 0);
                abort_if((float) $data['montant'] > $resteDisponible, 422, 'Le montant depasse le reste a payer.');
                $reste = max((float) $facture->montant_ttc - $autresPaiements - (float) $data['montant'], 0);
                $data['id_vente'] = $facture->id_vente;
                $data['id_client'] = $facture->vente->id_client;
                $data['reste'] = $reste;
            }

            $paiement->update($data);

            if ($facture) {
                $facture->refresh()->load('paiements');
                $facture->syncStatut();
            }
        });

        $this->logAction('update', 'paiement', $paiement, $data, $request);
        $this->resetDashboardCache();

        $paiement = $paiement->fresh()->load(['client', 'vente', 'facturation']);

        if ($request->wantsJson()) {
            return $this->apiItem($paiement, 200, [
                'message' => 'Paiement mis a jour',
            ]);
        }

        return redirect()->route('paiements.show', $paiement)->with('success', 'Paiement mis a jour.');
    }

    public function destroy(Paiement $paiement)
    {
        $this->ensurePermission('manage_recouvrement');
        DB::transaction(function () use ($paiement) {
            $facture = $paiement->id_facture
                ? Facturation::query()->lockForUpdate()->find($paiement->id_facture)
                : null;

            $paiement->delete();

            if ($facture) {
                $facture->refresh()->load('paiements');
                $facture->syncStatut();
            }
        });

        $this->logAction('delete', 'paiement', $paiement, [], request());
        $this->resetDashboardCache();

        return $this->apiDeleted();
    }

    public function export(Paiement $paiement, DocumentExportService $exportService)
    {
        $this->ensurePermission('view_paiements');
        $this->logAction('export', 'paiement', $paiement, [], request());

        return $exportService->paiement($paiement);
    }
}
