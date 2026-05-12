<?php

namespace App\Http\Controllers;

use App\Http\Requests\PieceStockRequest;
use App\Models\Fournisseur;
use App\Models\MouvementStock;
use App\Models\PieceStock;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class PieceStockController extends Controller
{
    public function index(Request $request)
    {
        $this->ensurePermission('view_stock');

        $pieces = PieceStock::query()
            ->select([
                'id', 'reference', 'designation', 'prix_unitaire', 'quantite_stock',
                'seuil_alerte', 'id_fournisseur', 'statut', 'created_at',
            ])
            ->with(['fournisseur:id,nom'])
            ->withCount('mouvements')
            ->when($request->filled('alerte'), fn ($query) => $query->whereColumn('quantite_stock', '<=', 'seuil_alerte'))
            ->latest()
            ->paginate(15);

        if ($request->wantsJson()) {
            return $this->apiCollection($pieces);
        }

        return view('pieces-stock.index', compact('pieces'));
    }

    public function create()
    {
        $this->ensurePermission('manage_stock');

        return view('pieces-stock.create', [
            'pieceStock' => new PieceStock([
                'statut' => 'actif',
                'quantite_stock' => 0,
                'seuil_alerte' => 0,
            ]),
            'fournisseurs' => Fournisseur::query()->orderBy('nom')->get(['id', 'nom']),
            'isEdit' => false,
        ]);
    }

    public function store(PieceStockRequest $request)
    {
        $this->ensurePermission('manage_stock');
        $piece = PieceStock::query()->create($request->validated());
        $this->logAction('create', 'piece_stock', $piece, $request->validated(), $request);
        $this->resetDashboardCache();

        if (! $request->wantsJson()) {
            return redirect()->route('pieces-stock.show', $piece)->with('success', 'Piece de stock creee.');
        }

        return $this->apiItem($piece->load('fournisseur'), 201, [
            'message' => 'Piece de stock creee',
        ]);
    }

    public function show(Request $request, PieceStock $pieceStock)
    {
        $this->ensurePermission('view_stock');

        $pieceStock->load([
            'fournisseur:id,nom',
            'mouvements:id,id_piece_stock,type_mouvement,quantite,date_mouvement',
        ]);

        if ($request->wantsJson()) {
            return $this->apiItem($pieceStock);
        }

        return view('pieces-stock.show', compact('pieceStock'));
    }

    public function edit(PieceStock $pieceStock)
    {
        $this->ensurePermission('manage_stock');

        return view('pieces-stock.edit', [
            'pieceStock' => $pieceStock,
            'fournisseurs' => Fournisseur::query()->orderBy('nom')->get(['id', 'nom']),
            'isEdit' => true,
        ]);
    }

    public function update(PieceStockRequest $request, PieceStock $pieceStock)
    {
        $this->ensurePermission('manage_stock');
        $pieceStock->update($request->validated());
        $this->logAction('update', 'piece_stock', $pieceStock, $request->validated(), $request);
        $this->resetDashboardCache();

        if (! $request->wantsJson()) {
            return redirect()->route('pieces-stock.show', $pieceStock)->with('success', 'Piece de stock mise a jour.');
        }

        return $this->apiItem($pieceStock->fresh()->load('fournisseur'), 200, [
            'message' => 'Piece de stock mise a jour',
        ]);
    }

    public function destroy(PieceStock $pieceStock)
    {
        $this->ensurePermission('manage_stock');
        $this->logAction('delete', 'piece_stock', $pieceStock, [], request());
        $pieceStock->delete();
        $this->resetDashboardCache();

        if (! request()->wantsJson()) {
            return redirect()->route('pieces-stock.index')->with('success', 'Piece de stock supprimee.');
        }

        return $this->apiDeleted();
    }

    public function approvisionner(Request $request, PieceStock $pieceStock)
    {
        $this->ensurePermission('manage_stock');
        $data = $request->validate([
            'quantite' => ['required', 'integer', 'min:1'],
            'reference_source' => ['nullable', 'string', 'max:255'],
            'observations' => ['nullable', 'string'],
        ]);

        DB::transaction(function () use ($data, $pieceStock) {
            $pieceStock->increment('quantite_stock', $data['quantite']);

            MouvementStock::query()->create([
                'id_piece_stock' => $pieceStock->id,
                'type_mouvement' => 'entree',
                'quantite' => $data['quantite'],
                'source_mouvement' => 'fournisseur',
                'reference_source' => $data['reference_source'] ?? null,
                'observations' => $data['observations'] ?? null,
                'date_mouvement' => now(),
            ]);
        });

        $this->logAction('approvisionnement', 'stock', $pieceStock, $data, $request);
        $this->resetDashboardCache();

        if (! $request->wantsJson()) {
            return redirect()->route('pieces-stock.show', $pieceStock)->with('success', 'Approvisionnement enregistre.');
        }

        return $this->apiItem($pieceStock->fresh(), 200, [
            'message' => 'Approvisionnement enregistre',
        ]);
    }
}
