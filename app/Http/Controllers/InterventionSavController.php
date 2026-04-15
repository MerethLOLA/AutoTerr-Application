<?php

namespace App\Http\Controllers;

use App\Http\Requests\InterventionSavRequest;
use App\Models\Employe;
use App\Models\InterventionSav;
use App\Models\TicketSav;
use Illuminate\Http\Request;

class InterventionSavController extends Controller
{
    public function index(Request $request)
    {
        $this->ensurePermission('manage_sav');

        $interventions = InterventionSav::query()
            ->with(['ticketSav', 'employe'])
            ->when($request->filled('statut'), fn ($query) => $query->where('statut', $request->string('statut')->toString()))
            ->latest()
            ->paginate(15);

        if ($request->wantsJson()) {
            return response()->json($interventions);
        }

        return view('interventions-sav.index', compact('interventions'));
    }

    public function create(Request $request)
    {
        $this->ensurePermission('manage_sav');

        return view('interventions-sav.create', [
            'interventionSav' => new InterventionSav([
                'id_ticket_sav' => $request->integer('ticket'),
                'statut' => 'en_cours',
                'date_intervention' => now(),
            ]),
            'tickets' => TicketSav::query()->orderByDesc('date_ouverture')->get(['id', 'reference_ticket']),
            'employes' => Employe::query()->orderBy('nom')->get(['id', 'nom', 'prenom']),
            'isEdit' => false,
        ]);
    }

    public function store(InterventionSavRequest $request)
    {
        $this->ensurePermission('manage_sav');
        $intervention = InterventionSav::query()->create($request->validated());
        $this->logAction('create', 'intervention_sav', $intervention, $request->validated(), $request);

        if (! $request->wantsJson()) {
            return redirect()->route('interventions-sav.show', $intervention)->with('success', 'Intervention SAV creee.');
        }

        return response()->json($intervention->load(['ticketSav', 'employe']), 201);
    }

    public function show(Request $request, InterventionSav $interventionSav)
    {
        $this->ensurePermission('manage_sav');

        $interventionSav->load(['ticketSav', 'employe']);

        if ($request->wantsJson()) {
            return response()->json($interventionSav);
        }

        return view('interventions-sav.show', compact('interventionSav'));
    }

    public function edit(InterventionSav $interventionSav)
    {
        $this->ensurePermission('manage_sav');

        return view('interventions-sav.edit', [
            'interventionSav' => $interventionSav,
            'tickets' => TicketSav::query()->orderByDesc('date_ouverture')->get(['id', 'reference_ticket']),
            'employes' => Employe::query()->orderBy('nom')->get(['id', 'nom', 'prenom']),
            'isEdit' => true,
        ]);
    }

    public function update(InterventionSavRequest $request, InterventionSav $interventionSav)
    {
        $this->ensurePermission('manage_sav');
        $interventionSav->update($request->validated());
        $this->logAction('update', 'intervention_sav', $interventionSav, $request->validated(), $request);

        if (! $request->wantsJson()) {
            return redirect()->route('interventions-sav.show', $interventionSav)->with('success', 'Intervention SAV mise a jour.');
        }

        return response()->json($interventionSav->fresh()->load(['ticketSav', 'employe']));
    }

    public function destroy(InterventionSav $interventionSav)
    {
        $this->ensurePermission('manage_sav');
        $this->logAction('delete', 'intervention_sav', $interventionSav, [], request());
        $interventionSav->delete();

        if (! request()->wantsJson()) {
            return redirect()->route('interventions-sav.index')->with('success', 'Intervention SAV supprimee.');
        }

        return response()->json([], 204);
    }
}
