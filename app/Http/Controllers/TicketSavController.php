<?php

namespace App\Http\Controllers;

use App\Http\Requests\TicketSavRequest;
use App\Models\Client;
use App\Models\Employe;
use App\Models\Garantie;
use App\Models\TicketSav;
use App\Models\Voiture;
use App\Services\BusinessReferenceService;
use Illuminate\Http\Request;

class TicketSavController extends Controller
{
    public function index(Request $request)
    {
        $this->ensurePermission('manage_sav');

        $tickets = TicketSav::query()
            ->select([
                'id', 'reference_ticket', 'id_client', 'id_voiture', 'id_responsable',
                'id_garantie', 'objet', 'statut', 'priorite', 'date_ouverture', 'created_at',
            ])
            ->with([
                'client:id,nom,prenom',
                'voiture:id,marque,modele',
                'responsable:id,nom,prenom',
                'garantie:id,type_garantie,date_fin',
            ])
            ->withCount('interventions')
            ->when($request->filled('statut'), fn ($query) => $query->where('statut', $request->string('statut')->toString()))
            ->latest()
            ->paginate(15);

        if ($request->wantsJson()) {
            return response()->json($tickets);
        }

        return view('tickets-sav.index', compact('tickets'));
    }

    public function create()
    {
        $this->ensurePermission('create_ticket');

        return view('tickets-sav.create', [
            'ticketSav' => new TicketSav([
                'statut' => 'ouvert',
                'priorite' => 'normale',
                'date_ouverture' => now(),
            ]),
            'clients' => Client::query()->orderBy('nom')->get(['id', 'nom', 'prenom']),
            'voitures' => Voiture::query()->orderBy('marque')->get(['id', 'marque', 'modele', 'immatriculation']),
            'responsables' => Employe::query()->orderBy('nom')->get(['id', 'nom', 'prenom']),
            'garanties' => Garantie::query()->orderByDesc('date_fin')->get(['id', 'type_garantie', 'date_fin']),
            'isEdit' => false,
        ]);
    }

    public function store(TicketSavRequest $request, BusinessReferenceService $referenceService)
    {
        $this->ensurePermission('create_ticket');
        $data = $request->validated();
        $data['reference_ticket'] = $referenceService->nextTicketSav();
        $data['date_ouverture'] = $data['date_ouverture'] ?? now();

        $ticket = TicketSav::query()->create($data);
        $this->logAction('create', 'ticket_sav', $ticket, $data, $request);
        $this->resetDashboardCache();

        if (! $request->wantsJson()) {
            return redirect()->route('tickets-sav.show', $ticket)->with('success', 'Ticket SAV cree.');
        }

        return response()->json($ticket->load(['client', 'voiture', 'responsable', 'garantie']), 201);
    }

    public function show(Request $request, TicketSav $ticketSav)
    {
        $this->ensurePermission('manage_sav');

        $ticketSav->load([
            'client:id,nom,prenom',
            'voiture:id,marque,modele',
            'responsable:id,nom,prenom',
            'interventions:id,id_ticket_sav,id_employe,description',
            'interventions.employe:id,nom,prenom',
        ]);

        if ($request->wantsJson()) {
            return response()->json($ticketSav);
        }

        return view('tickets-sav.show', compact('ticketSav'));
    }

    public function edit(TicketSav $ticketSav)
    {
        $this->ensurePermission('manage_sav');

        return view('tickets-sav.edit', [
            'ticketSav' => $ticketSav,
            'clients' => Client::query()->orderBy('nom')->get(['id', 'nom', 'prenom']),
            'voitures' => Voiture::query()->orderBy('marque')->get(['id', 'marque', 'modele', 'immatriculation']),
            'responsables' => Employe::query()->orderBy('nom')->get(['id', 'nom', 'prenom']),
            'garanties' => Garantie::query()->orderByDesc('date_fin')->get(['id', 'type_garantie', 'date_fin']),
            'isEdit' => true,
        ]);
    }

    public function update(TicketSavRequest $request, TicketSav $ticketSav)
    {
        $this->ensurePermission('manage_sav');
        $ticketSav->update($request->validated());
        $this->logAction('update', 'ticket_sav', $ticketSav, $request->validated(), $request);
        $this->resetDashboardCache();

        if (! $request->wantsJson()) {
            return redirect()->route('tickets-sav.show', $ticketSav)->with('success', 'Ticket SAV mis a jour.');
        }

        return response()->json($ticketSav->fresh()->load(['client', 'voiture', 'responsable', 'garantie', 'interventions']));
    }

    public function destroy(TicketSav $ticketSav)
    {
        $this->ensurePermission('manage_sav');
        $this->logAction('delete', 'ticket_sav', $ticketSav, [], request());
        $ticketSav->delete();
        $this->resetDashboardCache();

        if (! request()->wantsJson()) {
            return redirect()->route('tickets-sav.index')->with('success', 'Ticket SAV supprime.');
        }

        return response()->json([], 204);
    }
}
