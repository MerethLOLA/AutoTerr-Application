<?php

namespace App\Http\Controllers;

use App\Http\Requests\VenteRequest;
use App\Models\Client;
use App\Models\Employe;
use App\Models\Facturation;
use App\Models\Vente;
use App\Models\Voiture;
use App\Notifications\AssignationNotification;
use App\Services\BusinessReferenceService;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class VenteController extends Controller
{
    /** Rôles habilités à valider une remise au-delà du seuil. */
    private const ROLES_VALIDATION_REMISE = ['manager', 'admin', 'super_admin'];

    private function notifierValidateursRemise(Vente $vente): void
    {
        $validateurs = Employe::query()
            ->whereHas('user', fn ($q) => $q->whereIn('role', self::ROLES_VALIDATION_REMISE))
            ->get();

        $montantRemise = number_format((float) $vente->remise, 0, ',', ' ').' XOF';
        $vendeur = $vente->employe?->nom_complet ?? 'Un commercial';

        foreach ($validateurs as $validateur) {
            if (! $validateur->email) {
                continue;
            }

            $validateur->notify(new AssignationNotification(
                sujet: "Remise à valider — vente {$vente->reference_vente}",
                intro: "{$vendeur} a soumis une vente avec une remise de {$montantRemise}, ".
                    'au-delà du seuil autorisé ('.self::SEUIL_REMISE_POURCENT.'% du prix catalogue).',
                details: array_filter([
                    'Véhicule : '.trim(($vente->voiture?->marque ?? '').' '.($vente->voiture?->modele ?? '')),
                    $vente->client ? "Client : {$vente->client->nom_complet}" : null,
                    'Motif : '.($vente->motif_remise ?: 'non précisé'),
                ]),
                actionUrl: url("/ventes/{$vente->id}"),
                actionLabel: 'Examiner la vente',
            ));
        }
    }

    private function notifierCommercialDecisionRemise(Vente $vente, bool $approuvee, ?string $motif = null): void
    {
        $commercial = $vente->employe;

        if (! $commercial?->email) {
            return;
        }

        $commercial->notify(new AssignationNotification(
            sujet: $approuvee
                ? "Vente {$vente->reference_vente} validée"
                : "Vente {$vente->reference_vente} refusée",
            intro: $approuvee
                ? 'Votre vente avec remise a été validée : la facture a été générée.'
                : 'Votre vente avec remise a été refusée par un responsable.'.($motif ? " Motif : {$motif}." : ''),
            actionUrl: url("/ventes/{$vente->id}"),
            actionLabel: 'Voir la vente',
        ));
    }

    public function create()
    {
        $this->ensurePermission('create_vente');

        return response()->json([
            'clients' => Client::query()->orderBy('nom')->get(['id', 'nom', 'prenom', 'raison_sociale']),
            'voitures' => Voiture::query()->where('statut', 'disponible')->orderBy('marque')->get(['id', 'marque', 'modele', 'prix', 'statut']),
            'employes' => Employe::query()->orderBy('nom')->get(['id', 'nom', 'prenom', 'poste']),
        ]);
    }

    public function index(Request $request)
    {
        $this->ensurePermission('manage_ventes');

        $ventes = Vente::query()
            ->select([
                'id', 'reference_vente', 'date_vente', 'id_client', 'id_voiture',
                'prix_catalogue', 'remise', 'motif_remise', 'prix_final', 'statut', 'id_employe',
            ])
            ->with([
                'client:id,nom,prenom',
                'voiture:id,marque,modele',
                'employe:id,nom,prenom',
                'facturation:id,id_vente,numero_facture,statut,montant_ttc',
            ])
            ->withSum('paiements', 'montant')
            ->when($request->filled('statut'), fn ($query) => $query->where('statut', $request->string('statut')->toString()))
            ->latest('date_vente')
            ->paginate(15);

        return $this->apiCollection($ventes);
    }

    /** Remises au-delà de ce pourcentage du prix catalogue nécessitent l'accord d'un gestionnaire/admin. */
    private const SEUIL_REMISE_POURCENT = 5.0;

    private function verifierSeuilRemise(Request $request, float $prixCatalogue, float $remise): void
    {
        $seuil = $prixCatalogue * (self::SEUIL_REMISE_POURCENT / 100);
        $role = $request->user()?->role;
        $roleAutorise = in_array($role, ['admin', 'super_admin', 'manager'], true);

        abort_if(
            $remise > $seuil && ! $roleAutorise,
            422,
            'Cette remise depasse le seuil autorise ('.self::SEUIL_REMISE_POURCENT.'% du prix catalogue) et necessite la validation d\'un gestionnaire ou administrateur.'
        );
    }

    private function syncClientPiece(array $data): void
    {
        if (empty($data['id_client'])) {
            return;
        }

        $client = Client::query()->find($data['id_client']);
        $client?->appliquerPieceIdentite($data);
    }

    public function store(VenteRequest $request, BusinessReferenceService $referenceService)
    {
        $this->ensurePermission('create_vente');
        $data = $request->validated();
        $this->syncClientPiece($data);

        $prixCatalogue = (float) $data['prix_catalogue'];
        $remise = (float) ($data['remise'] ?? 0);
        $seuil = $prixCatalogue * (self::SEUIL_REMISE_POURCENT / 100);
        $roleAutorise = in_array($request->user()?->role, self::ROLES_VALIDATION_REMISE, true);
        $enAttenteValidation = $remise > $seuil && ! $roleAutorise;

        $data['prix_catalogue'] = $prixCatalogue;
        $data['remise'] = $remise;
        $data['prix_final'] = max($prixCatalogue - $remise, 0);

        if ($enAttenteValidation) {
            $data['statut'] = 'en_attente_validation';
            $data['reference_vente'] = 'VTE-'.now()->format('YmdHis').'-'.Str::upper(Str::random(4));

            $vente = DB::transaction(function () use ($data) {
                $voiture = Voiture::query()->lockForUpdate()->findOrFail($data['id_voiture']);
                abort_if($voiture->statut !== 'disponible', 422, 'Le vehicule doit etre disponible pour etre vendu.');

                $vente = Vente::query()->create($data);
                $voiture->update(['statut' => 'reservee']);

                return $vente;
            });

            $this->logAction('create', 'vente', $vente, $data, $request);
            $this->resetDashboardCache();

            $vente->load(['client', 'voiture', 'employe']);
            $this->notifierValidateursRemise($vente);

            if ($request->wantsJson()) {
                return response()->json(array_merge($vente->toArray(), [
                    'message' => 'Remise superieure au seuil autorise ('.self::SEUIL_REMISE_POURCENT.'% du prix catalogue) : vente en attente de validation par un responsable commercial.',
                ]), 202);
            }

            return redirect()->route('ventes.show', $vente)->with('success', 'Vente en attente de validation.');
        }

        $result = DB::transaction(function () use ($data, $referenceService) {
            $voiture = Voiture::query()->lockForUpdate()->findOrFail($data['id_voiture']);

            abort_if($voiture->statut !== 'disponible', 422, 'Le vehicule doit etre disponible pour etre vendu.');

            $data['reference_vente'] = 'VTE-'.now()->format('YmdHis').'-'.Str::upper(Str::random(4));

            $vente = Vente::query()->create($data);

            $montantHt = (float) $vente->prix_final;
            $tauxTva = 18.0;
            // XOF n'a pas de sous-unité : on arrondit au franc le plus proche.
            $montantTtc = round($montantHt * (1 + ($tauxTva / 100)));

            $facture = Facturation::query()->create([
                'numero_facture' => $referenceService->nextFacture(),
                'date_facture' => $vente->date_vente,
                'mode_livraison' => 'sur_place',
                'montant' => $vente->prix_catalogue,
                'remise' => $vente->remise,
                'montant_ht' => $montantHt,
                'taux_tva' => $tauxTva,
                'montant_ttc' => $montantTtc,
                'statut' => 'impayee',
                'date_echeance' => $vente->date_vente?->copy()->addDays(7),
                'observations' => $vente->observations,
                'id_vente' => $vente->id,
            ]);

            $voiture->update(['statut' => 'vendu']);

            return [$vente, $facture];
        });

        [$vente, $facture] = $result;
        $this->logAction('create', 'vente', $vente, $data, $request);
        $this->logAction('create', 'facturation', $facture, $facture->toArray(), $request);
        $this->resetDashboardCache();

        $vente->load(['client', 'voiture', 'employe', 'facturation']);

        if ($request->wantsJson()) {
            return response()->json(array_merge($vente->toArray(), [
                'message' => 'Vente enregistree avec facture automatique',
            ]), 201);
        }

        return redirect()->route('ventes.show', $vente)->with('success', 'Vente enregistree avec facture automatique.');
    }

    public function valider(Vente $vente, BusinessReferenceService $referenceService)
    {
        $this->ensureRole(...self::ROLES_VALIDATION_REMISE);
        abort_if($vente->statut !== 'en_attente_validation', 422, "Cette vente n'est pas en attente de validation.");

        $facture = DB::transaction(function () use ($vente, $referenceService) {
            $voiture = Voiture::query()->lockForUpdate()->findOrFail($vente->id_voiture);
            abort_if($voiture->statut !== 'reservee', 422, "Le vehicule n'est plus disponible pour cette vente.");

            $montantHt = (float) $vente->prix_final;
            $tauxTva = 18.0;
            $montantTtc = round($montantHt * (1 + ($tauxTva / 100)));

            $facture = Facturation::query()->create([
                'numero_facture' => $referenceService->nextFacture(),
                'date_facture' => $vente->date_vente,
                'mode_livraison' => 'sur_place',
                'montant' => $vente->prix_catalogue,
                'remise' => $vente->remise,
                'montant_ht' => $montantHt,
                'taux_tva' => $tauxTva,
                'montant_ttc' => $montantTtc,
                'statut' => 'impayee',
                'date_echeance' => $vente->date_vente?->copy()->addDays(7),
                'observations' => $vente->observations,
                'id_vente' => $vente->id,
            ]);

            $voiture->update(['statut' => 'vendu']);
            $vente->update(['statut' => 'finalisee']);

            return $facture;
        });

        $this->logAction('valider_remise', 'vente', $vente, [], request());
        $this->resetDashboardCache();

        $vente = $vente->fresh()->load(['client', 'voiture', 'employe', 'facturation']);
        $this->notifierCommercialDecisionRemise($vente, approuvee: true);

        return $this->apiItem($vente, 200, [
            'message' => 'Vente validee et facture generee',
        ]);
    }

    public function refuser(Request $request, Vente $vente)
    {
        $this->ensureRole(...self::ROLES_VALIDATION_REMISE);
        abort_if($vente->statut !== 'en_attente_validation', 422, "Cette vente n'est pas en attente de validation.");

        $motif = $request->string('motif')->toString();

        DB::transaction(function () use ($vente) {
            $voiture = Voiture::query()->lockForUpdate()->find($vente->id_voiture);

            if ($voiture && $voiture->statut === 'reservee') {
                $voiture->update(['statut' => 'disponible']);
            }

            $vente->update(['statut' => 'refusee']);
        });

        $this->logAction('refuser_remise', 'vente', $vente, ['motif' => $motif], $request);
        $this->resetDashboardCache();

        $vente = $vente->fresh()->load(['client', 'voiture', 'employe']);
        $this->notifierCommercialDecisionRemise($vente, approuvee: false, motif: $motif ?: null);

        return $this->apiItem($vente, 200, [
            'message' => 'Vente refusee',
        ]);
    }

    public function show(Vente $vente)
    {
        $this->ensurePermission('manage_ventes');

        $vente->load([
            'client:id,nom,prenom',
            'voiture:id,marque,modele',
            'facturation:id,id_vente,numero_facture,montant_ttc,statut',
            'paiements:id,id_vente,date,montant',
        ]);

        return $this->apiItem($vente);
    }

    public function edit(Vente $vente)
    {
        $this->ensurePermission('manage_ventes');

        return response()->json([
            'vente' => $vente,
            'clients' => Client::query()->orderBy('nom')->get(['id', 'nom', 'prenom', 'raison_sociale']),
            'voitures' => Voiture::query()
                ->where('statut', 'disponible')
                ->orWhereKey($vente->id_voiture)
                ->orderBy('marque')
                ->get(['id', 'marque', 'modele', 'prix', 'statut']),
            'employes' => Employe::query()->orderBy('nom')->get(['id', 'nom', 'prenom', 'poste']),
        ]);
    }

    public function update(VenteRequest $request, Vente $vente)
    {
        $this->ensurePermission('manage_ventes');
        $data = $request->validated();
        $this->syncClientPiece($data);

        $prixCatalogue = (float) ($data['prix_catalogue'] ?? $vente->prix_catalogue ?? $vente->prix_final);
        $remise = (float) ($data['remise'] ?? $vente->remise ?? 0);
        $this->verifierSeuilRemise($request, $prixCatalogue, $remise);

        $data['prix_catalogue'] = $prixCatalogue;
        $data['remise'] = $remise;
        $data['prix_final'] = max($prixCatalogue - $remise, 0);

        DB::transaction(function () use ($vente, $data) {
            $vente->update($data);

            if ($vente->facturation) {
                $montantHt = (float) $vente->prix_final;
                $tauxTva = (float) ($vente->facturation->taux_tva ?? 18);
                // XOF n'a pas de sous-unité : on arrondit au franc le plus proche.
                $montantTtc = round($montantHt * (1 + ($tauxTva / 100)));

                $vente->facturation->update([
                    'date_facture' => $vente->date_vente,
                    'montant' => $vente->prix_catalogue,
                    'remise' => $vente->remise,
                    'montant_ht' => $montantHt,
                    'montant_ttc' => $montantTtc,
                    'observations' => $vente->observations,
                ]);
                $vente->facturation->refresh();
                $vente->facturation->syncStatut();
            }
        });

        $this->logAction('update', 'vente', $vente, $data, $request);
        $this->resetDashboardCache();

        $vente = $vente->fresh()->load(['client', 'voiture', 'employe', 'facturation']);

        if ($request->wantsJson()) {
            return $this->apiItem($vente, 200, [
                'message' => 'Vente mise a jour',
            ]);
        }

        return redirect()->route('ventes.show', $vente)->with('success', 'Vente mise a jour.');
    }

    public function destroy(Vente $vente)
    {
        $this->ensurePermission('manage_ventes');
        $this->logAction('delete', 'vente', $vente, [], request());
        $vente->delete();
        $this->resetDashboardCache();

        return $this->apiDeleted();
    }
}
