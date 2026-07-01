<?php

namespace App\Http\Controllers;

use App\Http\Requests\EmployeRequest;
use App\Models\Employe;
use Illuminate\Http\Request;

class EmployeController extends Controller
{
    public function forSelect(Request $request)
    {
        $query = Employe::query()->orderBy('nom');

        if ($request->filled('role')) {
            $role = $request->string('role')->toString();
            $query->where(function ($q) use ($role) {
                $q->whereHas('user', fn ($uq) => $uq->where('role', $role))
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

        return $this->apiItem($employe->load(['user', 'ventes', 'documents', 'clientsAttribues']));
    }

    public function update(EmployeRequest $request, Employe $employe)
    {
        $this->ensureRole('admin', 'super_admin');
        $employe->update($request->validated());
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
}
