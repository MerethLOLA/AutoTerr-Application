<?php

namespace App\Http\Controllers;

use App\Http\Requests\EmployeRequest;
use App\Models\Employe;
use App\Models\Facturation;
use App\Models\Vente;
use App\Services\DocumentExportService;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EmployeController extends Controller
{
    public function forSelect(Request $request)
    {
        $query = Employe::query()->orderBy('nom');

        if ($request->filled('role')) {
            $role = $request->string('role')->toString();
            // "assurance" et "conformite" n'existent pas comme role de compte : c'est le
            // Responsable Commercial (manager) et l'admin qui supervisent ce perimetre.
            $userRoles = in_array($role, ['assurance', 'conformite'], true)
                ? [$role, 'manager', 'admin', 'super_admin']
                : [$role];
            $query->where(function ($q) use ($role, $userRoles) {
                $q->whereHas('user', fn ($uq) => $uq->whereIn('role', $userRoles))
                  ->orWhereRaw('LOWER(poste) LIKE ?', ['%'.strtolower($role).'%']);
            });
        }

        if ($request->filled('poste')) {
            $poste = $request->string('poste')->toString();
            $query->whereRaw('LOWER(poste) LIKE ?', ['%'.strtolower($poste).'%']);
        }

        return response()->json($query->get(['id', 'nom', 'prenom', 'poste']));
    }

    public function index()
    {
        $this->ensureRole('admin', 'super_admin');

        return $this->apiCollection(
            Employe::query()->with('user')->latest()->paginate(15)
        );
    }

    public function store(EmployeRequest $request)
    {
        $this->ensureRole('admin', 'super_admin');
        $employe = Employe::query()->create($request->validated());
        $this->logAction('create', 'employe', $employe, $request->validated(), $request);

        return $this->apiItem($employe, 201, [
            'message' => 'Employe cree',
        ]);
    }

    public function show(Employe $employe)
    {
        $this->ensureRole('admin', 'super_admin');

        $employe->load(['user', 'ventes', 'documents', 'clientsAttribues']);
        $employe->setAttribute('activite_mois', $this->activiteMois($employe));

        return $this->apiItem($employe);
    }

    public function update(EmployeRequest $request, Employe $employe)
    {
        $this->ensureRole('admin', 'super_admin');
        $employe->update($request->validated());

        if ($employe->wasChanged('statut') && $employe->user) {
            $employe->user->update([
                'statut' => $employe->statut === 'actif' ? 'actif' : 'inactif',
            ]);
        }

        $this->logAction('update', 'employe', $employe, $request->validated(), $request);

        return $this->apiItem($employe->fresh(), 200, [
            'message' => 'Employe mis a jour',
        ]);
    }

    public function destroy(Employe $employe)
    {
        $this->ensureRole('admin', 'super_admin');
        $this->logAction('delete', 'employe', $employe, [], request());
        $employe->delete();

        return $this->apiDeleted();
    }

    public function export(Employe $employe, DocumentExportService $exportService): Response
    {
        $this->ensureRole('admin', 'super_admin');

        return $exportService->fichePaie($employe);
    }

    private function activiteMois(Employe $employe): array
    {
        // Paie du mois qui vient de se terminer (et non le mois en cours, encore incomplet).
        $periode = now()->subMonthNoOverflow();

        $totalVentes = (float) Vente::query()
            ->where('id_employe', $employe->id)
            ->whereMonth('date_vente', $periode->month)
            ->whereYear('date_vente', $periode->year)
            ->sum('prix_final');

        $totalLocations = (float) Facturation::query()
            ->whereNotNull('id_location')
            ->whereHas('location', fn ($q) => $q->where('id_agent', $employe->id))
            ->whereMonth('date_facture', $periode->month)
            ->whereYear('date_facture', $periode->year)
            ->sum('montant_ttc');

        $totalActivite = $totalVentes + $totalLocations;
        $tauxCommission = (float) ($employe->taux_commission ?? 0);
        $commission = round($totalActivite * ($tauxCommission / 100));
        $salaireFixe = (float) ($employe->salaire ?? 0);

        return [
            'periode' => ucfirst($periode->locale('fr')->translatedFormat('F Y')),
            'total_ventes_mois' => $totalVentes,
            'total_locations_mois' => $totalLocations,
            'taux_commission' => $tauxCommission,
            'commission_mois' => $commission,
            'salaire_fixe' => $salaireFixe,
            'salaire_total_mois' => $salaireFixe + $commission,
        ];
    }
}
