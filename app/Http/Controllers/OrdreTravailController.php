<?php

namespace App\Http\Controllers;

use App\Models\ConsommationPiece;
use App\Models\MouvementStock;
use App\Models\OrdreTravail;
use App\Models\PieceStock;
use App\Models\Employe;
use App\Models\TicketSav;
use App\Models\Voiture;
use App\Http\Requests\OrdreTravailRequest;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrdreTravailController extends Controller
{
    public function index(Request $request)
    {
        $this->ensurePermission('manage_atelier');

        $ordres = OrdreTravail::query()
            ->with(['voiture', 'ticketSav', 'technicien', 'taches', 'consommations.piece'])
            ->when($request->filled('statut'), fn ($query) => $query->where('statut', $request->string('statut')->toString()))
            ->latest()
            ->paginate(15);

        if ($request->wantsJson()) {
            return response()->json($ordres);
        }

        return view('ordres-travail.index', compact('ordres'));
    }

    public function create(Request $request)
    {
        $this->ensurePermission('manage_atelier');

        return view('ordres-travail.create', [
            'ordreTravail' => new OrdreTravail([
                'id_ticket_sav' => $request->integer('ticket'),
                'priorite' => 'normale',
                'statut' => 'ouvert',
            ]),
            'voitures' => Voiture::query()->orderBy('marque')->get(['id', 'marque', 'modele', 'immatriculation']),
            'tickets' => TicketSav::query()->orderByDesc('date_ouverture')->get(['id', 'reference_ticket']),
            'techniciens' => Employe::query()->orderBy('nom')->get(['id', 'nom', 'prenom']),
            'isEdit' => false,
        ]);
    }

    public function store(OrdreTravailRequest $request)
    {
        $this->ensurePermission('manage_atelier');
        $data = $request->validated();
        $data['reference_ot'] = 'OT-'.now()->format('YmdHis').'-'.Str::upper(Str::random(4));

        $ordre = OrdreTravail::query()->create($data);
        $this->logAction('create', 'ordre_travail', $ordre, $data, $request);

        if (! $request->wantsJson()) {
            return redirect()->route('ordres-travail.show', $ordre)->with('success', 'Ordre de travail cree.');
        }

        return response()->json($ordre->load(['voiture', 'ticketSav', 'technicien']), 201);
    }

    public function show(Request $request, OrdreTravail $ordreTravail)
    {
        $this->ensurePermission('manage_atelier');

        $ordreTravail->load(['voiture', 'ticketSav', 'technicien', 'taches', 'consommations.piece']);

        if ($request->wantsJson()) {
            return response()->json($ordreTravail);
        }

        return view('ordres-travail.show', compact('ordreTravail'));
    }

    public function edit(OrdreTravail $ordreTravail)
    {
        $this->ensurePermission('manage_atelier');

        return view('ordres-travail.edit', [
            'ordreTravail' => $ordreTravail,
            'voitures' => Voiture::query()->orderBy('marque')->get(['id', 'marque', 'modele', 'immatriculation']),
            'tickets' => TicketSav::query()->orderByDesc('date_ouverture')->get(['id', 'reference_ticket']),
            'techniciens' => Employe::query()->orderBy('nom')->get(['id', 'nom', 'prenom']),
            'isEdit' => true,
        ]);
    }

    public function update(OrdreTravailRequest $request, OrdreTravail $ordreTravail)
    {
        $this->ensurePermission('manage_atelier');
        $ordreTravail->update($request->validated());
        $this->logAction('update', 'ordre_travail', $ordreTravail, $request->validated(), $request);

        if (! $request->wantsJson()) {
            return redirect()->route('ordres-travail.show', $ordreTravail)->with('success', 'Ordre de travail mis a jour.');
        }

        return response()->json($ordreTravail->fresh()->load(['voiture', 'ticketSav', 'technicien', 'taches', 'consommations']));
    }

    public function destroy(OrdreTravail $ordreTravail)
    {
        $this->ensurePermission('manage_atelier');
        $this->logAction('delete', 'ordre_travail', $ordreTravail, [], request());
        $ordreTravail->delete();

        if (! request()->wantsJson()) {
            return redirect()->route('ordres-travail.index')->with('success', 'Ordre de travail supprime.');
        }

        return response()->json([], 204);
    }

    public function consommerPiece(Request $request, OrdreTravail $ordreTravail)
    {
        $this->ensurePermission('assign_taches');
        $data = $request->validate([
            'id_piece_stock' => ['required', 'integer', 'exists:pieces_stock,id'],
            'quantite' => ['required', 'integer', 'min:1'],
        ]);

        $result = DB::transaction(function () use ($data, $ordreTravail) {
            $piece = PieceStock::query()->lockForUpdate()->findOrFail($data['id_piece_stock']);

            abort_if($piece->quantite_stock < $data['quantite'], 422, 'Stock insuffisant pour cette piece.');

            $piece->decrement('quantite_stock', $data['quantite']);

            $consommation = ConsommationPiece::query()->create([
                'id_ordre_travail' => $ordreTravail->id,
                'id_piece_stock' => $piece->id,
                'quantite' => $data['quantite'],
                'date_consommation' => now(),
            ]);

            MouvementStock::query()->create([
                'id_piece_stock' => $piece->id,
                'type_mouvement' => 'sortie',
                'quantite' => $data['quantite'],
                'source_mouvement' => 'atelier',
                'reference_source' => $ordreTravail->reference_ot,
                'date_mouvement' => now(),
            ]);

            return $consommation;
        });

        $this->logAction('consommation_piece', 'stock', $ordreTravail, $data, $request);

        if (! $request->wantsJson()) {
            return redirect()->route('ordres-travail.show', $ordreTravail)->with('success', 'Piece consommee depuis le stock.');
        }

        return response()->json($result, 201);
    }
}
