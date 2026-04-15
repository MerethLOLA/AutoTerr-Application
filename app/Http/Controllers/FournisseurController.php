<?php

namespace App\Http\Controllers;

use App\Http\Requests\FournisseurRequest;
use App\Models\Fournisseur;
use Illuminate\Http\Request;

class FournisseurController extends Controller
{
    public function index(Request $request)
    {
        $this->ensurePermission('view_fournisseurs');

        $fournisseurs = Fournisseur::query()
            ->withCount('voitures')
            ->when($request->string('search')->toString(), fn ($query, $term) => $query->recherche($term))
            ->latest()
            ->paginate(15);

        return response()->json($fournisseurs);
    }

    public function store(FournisseurRequest $request)
    {
        $this->ensurePermission('view_fournisseurs');
        $fournisseur = Fournisseur::query()->create($request->validated());
        $this->logAction('create', 'fournisseur', $fournisseur, $request->validated(), $request);

        return response()->json($fournisseur, 201);
    }

    public function show(Fournisseur $fournisseur)
    {
        $this->ensurePermission('view_fournisseurs');

        return response()->json($fournisseur->load('voitures'));
    }

    public function update(FournisseurRequest $request, Fournisseur $fournisseur)
    {
        $this->ensurePermission('view_fournisseurs');
        $fournisseur->update($request->validated());
        $this->logAction('update', 'fournisseur', $fournisseur, $request->validated(), $request);

        return response()->json($fournisseur->fresh());
    }

    public function destroy(Fournisseur $fournisseur)
    {
        $this->ensurePermission('view_fournisseurs');
        $this->logAction('delete', 'fournisseur', $fournisseur, [], request());
        $fournisseur->delete();

        return response()->json([], 204);
    }
}
