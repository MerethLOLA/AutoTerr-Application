<?php

namespace App\Http\Controllers;

use App\Http\Requests\ClientRequest;
use App\Models\Client;
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
            ])
            ->with(['vendeurAttribue:id,nom,prenom'])
            ->withCount(['ventes', 'paiements'])
            ->when($request->string('search')->toString(), fn ($query, $term) => $query->recherche($term))
            ->latest()
            ->paginate(15);

        if ($request->wantsJson()) {
            return $this->apiCollection($clients);
        }

        return view('clients.index', compact('clients'));
    }

    public function store(ClientRequest $request)
    {
        $this->ensurePermission('view_clients');
        $data = $request->validated();

        $client = Client::query()->create($data);
        $this->logAction('create', 'client', $client, $data, $request);

        return $this->apiItem($client->load('vendeurAttribue'), 201, [
            'message' => 'Client cree',
        ]);
    }

    public function show(Request $request, Client $client)
    {
        $this->ensurePermission('view_clients');

        $client->load(['ventes.facturation', 'paiements', 'documents', 'vendeurAttribue']);

        if ($request->wantsJson()) {
            return $this->apiItem($client);
        }

        return view('clients.show', compact('client'));
    }

    public function update(ClientRequest $request, Client $client)
    {
        $this->ensurePermission('view_clients');
        $data = $request->validated();

        $client->update($data);
        $this->logAction('update', 'client', $client, $data, $request);

        return $this->apiItem($client->fresh()->load('vendeurAttribue'), 200, [
            'message' => 'Client mis a jour',
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
