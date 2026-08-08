<?php

namespace App\Http\Controllers;

use App\Http\Requests\ClientRequest;
use App\Models\Client;
use App\Models\Document;
use Illuminate\Http\Request;

class ClientController extends Controller
{
    public function index(Request $request)
    {
        $this->ensurePermission('view_clients');

        $clients = Client::query()
            ->select([
                'id', 'nom', 'prenom', 'contact', 'telephone', 'email',
                'type_client', 'raison_sociale', 'id_vendeur_attribue', 'created_at',
                'piece_identite', 'numero_piece',
            ])
            ->with(['vendeurAttribue:id,nom,prenom'])
            ->withCount(['ventes', 'paiements'])
            ->when($request->string('search')->toString(), fn ($query, $term) => $query->recherche($term))
            ->latest()
            ->paginate(15);

        return $this->apiCollection($clients);
    }

    public function store(ClientRequest $request)
    {
        $this->ensurePermission('view_clients');
        $data = $request->validated();
        unset($data['piece_identite_fichier']);

        $client = Client::query()->create($data);
        $this->storePieceIdentite($request, $client);
        $this->logAction('create', 'client', $client, $data, $request);

        return $this->apiItem($client->load(['vendeurAttribue', 'documents']), 201, [
            'message' => 'Client cree',
        ]);
    }

    public function show(Client $client)
    {
        $this->ensurePermission('view_clients');

        $client->load(['ventes.facturation', 'paiements', 'locations', 'documents', 'vendeurAttribue']);

        return $this->apiItem($client);
    }

    public function update(ClientRequest $request, Client $client)
    {
        $this->ensurePermission('view_clients');
        $data = $request->validated();
        unset($data['piece_identite_fichier']);

        $client->appliquerPieceIdentite($data);
        unset($data['piece_identite'], $data['numero_piece']);
        $client->update($data);
        $this->storePieceIdentite($request, $client);
        $this->logAction('update', 'client', $client, $data, $request);

        return $this->apiItem($client->fresh()->load(['vendeurAttribue', 'documents']), 200, [
            'message' => 'Client mis a jour',
        ]);
    }

    private function storePieceIdentite(Request $request, Client $client): void
    {
        if (! $request->hasFile('piece_identite_fichier')) {
            return;
        }

        $path = $request->file('piece_identite_fichier')->store('clients/pieces', 'public');

        Document::create([
            'id_client' => $client->id,
            'type_document' => $client->piece_identite ?? 'piece_identite',
            'numero_document' => $client->numero_piece,
            'date_document' => now(),
            'chemin_fichier' => $path,
        ]);
    }

    public function destroy(Client $client)
    {
        $this->ensurePermission('view_clients');
        $this->logAction('delete', 'client', $client, [], request());
        $client->delete();

        return $this->apiDeleted();
    }
}
