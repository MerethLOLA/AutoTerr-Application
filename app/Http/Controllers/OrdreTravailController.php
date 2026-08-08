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
use App\Notifications\AssignationNotification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class OrdreTravailController extends Controller
{
    private function notifierTechnicienAssigne(OrdreTravail $ordre): void
    {
        $technicien = $ordre->technicien;

        if (! $technicien?->email) {
            return;
        }

        $technicien->notify(new AssignationNotification(
            sujet: "Ordre de travail assigné — {$ordre->reference_ot}",
            intro: "Un ordre de travail vous a été assigné : « {$ordre->description} ».",
            details: array_filter([
                "Référence : {$ordre->reference_ot}",
                "Priorité : {$ordre->priorite}",
                $ordre->deadline ? "Échéance : {$ordre->deadline->format('d/m/Y')}" : null,
            ]),
            actionUrl: url("/atelier/{$ordre->id}"),
            actionLabel: "Voir l'ordre de travail",
        ));
    }

    public function index(Request $request)
    {
        $this->ensurePermission('manage_atelier');

        $ordres = OrdreTravail::query()
            ->with(['voiture', 'ticketSav', 'technicien', 'taches', 'consommations.piece'])
            ->when($request->filled('statut'), fn ($query) => $query->where('statut', $request->string('statut')->toString()))
            ->latest()
            ->paginate(15);

        return $this->apiCollection($ordres);
    }

    public function create()
    {
        $this->ensurePermission('manage_atelier');

        return response()->json([
            'voitures' => Voiture::query()->orderBy('marque')->get(['id', 'marque', 'modele', 'immatriculation']),
            'tickets' => TicketSav::query()->orderByDesc('date_ouverture')->get(['id', 'reference_ticket']),
            'techniciens' => Employe::query()->orderBy('nom')->get(['id', 'nom', 'prenom']),
        ]);
    }

    private function estResponsableAtelier($user): bool
    {
        return in_array($user->role, ['admin', 'super_admin', 'manager'], true);
    }

    public function store(OrdreTravailRequest $request)
    {
        $this->ensurePermission('manage_atelier');
        $data = $request->validated();
        $data['reference_ot'] = 'OT-'.now()->format('YmdHis').'-'.Str::upper(Str::random(4));

        $user = auth()->user();
        if (! $this->estResponsableAtelier($user)) {
            abort_unless($user->id_employe, 422, "Votre compte n'est pas lié à une fiche employé.");
            $data['id_technicien'] = $user->id_employe;
        }

        $ordre = OrdreTravail::query()->create($data);
        $this->logAction('create', 'ordre_travail', $ordre, $data, $request);
        $this->notifierTechnicienAssigne($ordre);

        if (! $request->wantsJson()) {
            return redirect()->route('ordres-travail.show', $ordre)->with('success', 'Ordre de travail cree.');
        }

        return $this->apiItem($ordre->load(['voiture', 'ticketSav', 'technicien']), 201, [
            'message' => 'Ordre de travail cree',
        ]);
    }

    public function show(OrdreTravail $ordreTravail)
    {
        $this->ensurePermission('manage_atelier');

        $ordreTravail->load(['voiture', 'ticketSav', 'technicien', 'taches', 'consommations.piece']);

        return $this->apiItem($ordreTravail);
    }

    public function edit(OrdreTravail $ordreTravail)
    {
        $this->ensurePermission('manage_atelier');

        return response()->json([
            'ordreTravail' => $ordreTravail,
            'voitures' => Voiture::query()->orderBy('marque')->get(['id', 'marque', 'modele', 'immatriculation']),
            'tickets' => TicketSav::query()->orderByDesc('date_ouverture')->get(['id', 'reference_ticket']),
            'techniciens' => Employe::query()->orderBy('nom')->get(['id', 'nom', 'prenom']),
        ]);
    }

    public function update(OrdreTravailRequest $request, OrdreTravail $ordreTravail)
    {
        $this->ensurePermission('manage_atelier');
        $data = $request->validated();

        $user = auth()->user();
        $nouveauTechnicien = $data['id_technicien'] ?? $ordreTravail->id_technicien;
        if (! $this->estResponsableAtelier($user) && (int) $nouveauTechnicien !== (int) $ordreTravail->id_technicien) {
            abort(403, 'Seul un responsable peut réassigner un ordre de travail à un autre technicien.');
        }

        $technicienChange = $ordreTravail->id_technicien !== $nouveauTechnicien;
        $ordreTravail->update($data);
        $this->logAction('update', 'ordre_travail', $ordreTravail, $data, $request);

        if ($technicienChange) {
            $this->notifierTechnicienAssigne($ordreTravail->fresh());
        }

        if (! $request->wantsJson()) {
            return redirect()->route('ordres-travail.show', $ordreTravail)->with('success', 'Ordre de travail mis a jour.');
        }

        return $this->apiItem($ordreTravail->fresh()->load(['voiture', 'ticketSav', 'technicien', 'taches', 'consommations']), 200, [
            'message' => 'Ordre de travail mis a jour',
        ]);
    }

    public function destroy(OrdreTravail $ordreTravail)
    {
        $this->ensurePermission('manage_atelier');
        $this->logAction('delete', 'ordre_travail', $ordreTravail, [], request());
        $ordreTravail->delete();

        if (! request()->wantsJson()) {
            return redirect()->route('ordres-travail.index')->with('success', 'Ordre de travail supprime.');
        }

        return $this->apiDeleted();
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

        return $this->apiItem($result, 201, [
            'message' => 'Piece consommee depuis le stock',
        ]);
    }
}
