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

        return $this->apiCollection($fournisseurs);
    }

    public function store(FournisseurRequest $request)
    {
        $this->ensurePermission('view_fournisseurs');
        $fournisseur = Fournisseur::query()->create($request->validated());
        $this->logAction('create', 'fournisseur', $fournisseur, $request->validated(), $request);

        return $this->apiItem($fournisseur, 201, [
            'message' => 'Fournisseur cree',
        ]);
    }

    public function show(Fournisseur $fournisseur)
    {
        $this->ensurePermission('view_fournisseurs');

        return $this->apiItem($fournisseur->load('voitures'));
    }

    public function update(FournisseurRequest $request, Fournisseur $fournisseur)
    {
        $this->ensurePermission('view_fournisseurs');
        $fournisseur->update($request->validated());
        $this->logAction('update', 'fournisseur', $fournisseur, $request->validated(), $request);

        return $this->apiItem($fournisseur->fresh(), 200, [
            'message' => 'Fournisseur mis a jour',
        ]);
    }

    public function destroy(Fournisseur $fournisseur)
    {
        $this->ensurePermission('view_fournisseurs');
        $this->logAction('delete', 'fournisseur', $fournisseur, [], request());
        $fournisseur->delete();

        return $this->apiDeleted();
    }
}
