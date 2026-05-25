<?php

namespace App\Http\Controllers;

use App\Http\Requests\DocumentRequest;
use App\Models\Client;
use App\Models\Document;
use App\Models\Employe;
use App\Models\Vente;
use App\Models\Voiture;
use Illuminate\Http\Request;

class DocumentController extends Controller
{
    public function create()
    {
        $this->ensurePermission('manage_ventes');

        return response()->json([
            'ventes' => Vente::query()->with(['client', 'voiture'])->orderByDesc('date_vente')->get(),
            'clients' => Client::query()->orderBy('nom')->get(['id', 'nom', 'prenom', 'raison_sociale']),
            'employes' => Employe::query()->orderBy('nom')->get(['id', 'nom', 'prenom']),
            'voitures' => Voiture::query()->orderBy('marque')->get(['id', 'marque', 'modele']),
        ]);
    }

    public function index(Request $request)
    {
        $this->ensurePermission('manage_ventes');

        $documents = Document::query()
            ->with(['vente', 'client', 'employe', 'voiture'])
            ->when($request->filled('type_document'), fn ($query) => $query->where('type_document', $request->string('type_document')->toString()))
            ->latest('date_production')
            ->paginate(15);

        return $this->apiCollection($documents);
    }

    public function store(DocumentRequest $request)
    {
        $this->ensurePermission('manage_ventes');
        $document = Document::query()->create($request->validated());
        $this->logAction('create', 'document', $document, $request->validated(), $request);

        $document->load(['vente', 'client', 'employe', 'voiture']);

        if ($request->wantsJson()) {
            return $this->apiItem($document, 201, [
                'message' => 'Document cree',
            ]);
        }

        return redirect()->route('documents.show', $document)->with('success', 'Document enregistre.');
    }

    public function show(Document $document)
    {
        $this->ensurePermission('manage_ventes');

        $document->load(['vente', 'client', 'employe', 'voiture']);

        return $this->apiItem($document);
    }

    public function edit(Document $document)
    {
        $this->ensurePermission('manage_ventes');

        return response()->json([
            'document' => $document,
            'ventes' => Vente::query()->with(['client', 'voiture'])->orderByDesc('date_vente')->get(),
            'clients' => Client::query()->orderBy('nom')->get(['id', 'nom', 'prenom', 'raison_sociale']),
            'employes' => Employe::query()->orderBy('nom')->get(['id', 'nom', 'prenom']),
            'voitures' => Voiture::query()->orderBy('marque')->get(['id', 'marque', 'modele']),
        ]);
    }

    public function update(DocumentRequest $request, Document $document)
    {
        $this->ensurePermission('manage_ventes');
        $document->update($request->validated());
        $this->logAction('update', 'document', $document, $request->validated(), $request);

        $document = $document->fresh()->load(['vente', 'client', 'employe', 'voiture']);

        if ($request->wantsJson()) {
            return $this->apiItem($document, 200, [
                'message' => 'Document mis a jour',
            ]);
        }

        return redirect()->route('documents.show', $document)->with('success', 'Document mis a jour.');
    }

    public function destroy(Document $document)
    {
        $this->ensurePermission('manage_ventes');
        $this->logAction('delete', 'document', $document, [], request());
        $document->delete();

        return $this->apiDeleted();
    }
}
