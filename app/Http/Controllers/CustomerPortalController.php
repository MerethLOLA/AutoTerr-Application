<?php

namespace App\Http\Controllers;

use App\Models\Client;
use App\Models\Demande;
use App\Models\Document;
use App\Models\Facturation;
use App\Models\Location;
use App\Models\Voiture;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CustomerPortalController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        abort_unless($request->user()?->role === 'client', 403);

        $client = Client::query()->firstWhere('email', $request->user()->email);
        $reservations = collect();

        if ($client) {
            $reservations = Location::query()
                ->with('voiture:id,marque,modele,prix')
                ->where('id_client', $client->id)
                ->where('statut', 'planifiee')
                ->latest('date_debut')
                ->get();
        }

        $voitures = Voiture::query()
            ->select(['id', 'marque', 'modele', 'annee', 'prix', 'energie'])
            ->disponibles()
            ->pourLocation()
            ->latest()
            ->take(12)
            ->get();

        return response()->json(compact('client', 'reservations', 'voitures'));
    }

    public function summary(Request $request): JsonResponse
    {
        abort_unless($request->user()?->role === 'client', 403);

        $client = Client::query()->firstWhere('email', $request->user()->email);

        $locations = $client
            ? Location::query()
                ->with('voiture:id,marque,modele,image_principale')
                ->where('id_client', $client->id)
                ->latest('date_debut')
                ->get()
            : collect();

        $facturations = $client
            ? Facturation::query()
                ->with([
                    'vente:id,id_client,id_voiture,reference_vente', 'vente.voiture:id,marque,modele',
                    'location:id,id_client,reference_location,id_voiture', 'location.voiture:id,marque,modele',
                ])
                ->where(function ($query) use ($client) {
                    $query->whereHas('vente', fn ($q) => $q->where('id_client', $client->id))
                        ->orWhereHas('location', fn ($q) => $q->where('id_client', $client->id));
                })
                ->latest('date_facture')
                ->get()
            : collect();

        $documents = $client
            ? Document::query()
                ->with(['voiture:id,marque,modele', 'vente:id,reference_vente'])
                ->where('id_client', $client->id)
                ->latest('date_production')
                ->get()
            : collect();

        $demandes = Demande::query()
            ->with('voiture:id,marque,modele')
            ->where('email', $request->user()->email)
            ->latest()
            ->get();

        return response()->json([
            'profile' => [
                'id' => $request->user()->id,
                'name' => $request->user()->name,
                'username' => $request->user()->username,
                'email' => $request->user()->email,
                'role' => $request->user()->role,
                'client_id' => $client?->id,
                'profile_photo_url' => $request->user()->profilePhotoUrl(),
            ],
            'locations' => $locations,
            'facturations' => $facturations,
            'documents' => $documents,
            'demandes' => $demandes,
        ]);
    }

    public function reserve(Request $request): JsonResponse
    {
        abort_unless($request->user()?->role === 'client', 403);

        $data = $request->validate([
            'id_voiture' => ['required', 'exists:voitures,id'],
            'date_debut' => ['required', 'date', 'after_or_equal:today'],
            'date_fin' => ['required', 'date', 'after_or_equal:date_debut'],
            'observations' => ['nullable', 'string', 'max:1000'],
        ]);

        $client = Client::query()->firstOrCreate(
            ['email' => $request->user()->email],
            [
                'nom' => $request->user()->name ?: $request->user()->username,
                'prenom' => null,
                'telephone' => null,
                'contact' => $request->user()->name ?: $request->user()->username,
                'type_client' => 'particulier',
            ]
        );

        $voiture = Voiture::query()->findOrFail($data['id_voiture']);
        abort_if($voiture->statut !== 'disponible', 422, 'Le vehicule selectionne n est plus disponible.');
        abort_if(!in_array($voiture->type_usage, ['location', 'les_deux']), 422, 'Ce vehicule n est pas disponible a la location.');

        $reservation = Location::query()->create([
            'reference_location' => 'RES-'.now()->format('YmdHis'),
            'id_client' => $client->id,
            'id_voiture' => $voiture->id,
            'date_debut' => $data['date_debut'],
            'date_fin' => $data['date_fin'],
            'tarif_journalier' => 0,
            'statut' => 'planifiee',
            'caution' => 0,
            'observations' => $data['observations'] ?? 'Reservation client depuis Next.js.',
        ]);

        return response()->json(
            $reservation->load('voiture:id,marque,modele'),
            201
        );
    }
}
