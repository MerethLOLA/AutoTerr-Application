<?php

namespace App\Http\Controllers;

use App\Http\Requests\EmployeRequest;
use App\Models\Employe;

class EmployeController extends Controller
{
    public function index()
    {
        $this->ensurePermission('manage_ventes');

        return response()->json(
            Employe::query()->with('user')->latest()->paginate(15)
        );
    }

    public function store(EmployeRequest $request)
    {
        $this->ensurePermission('manage_ventes');
        $employe = Employe::query()->create($request->validated());
        $this->logAction('create', 'employe', $employe, $request->validated(), $request);

        return response()->json($employe, 201);
    }

    public function show(Employe $employe)
    {
        $this->ensurePermission('manage_ventes');

        return response()->json($employe->load(['user', 'ventes', 'documents', 'clientsAttribues']));
    }

    public function update(EmployeRequest $request, Employe $employe)
    {
        $this->ensurePermission('manage_ventes');
        $employe->update($request->validated());
        $this->logAction('update', 'employe', $employe, $request->validated(), $request);

        return response()->json($employe->fresh());
    }

    public function destroy(Employe $employe)
    {
        $this->ensurePermission('manage_ventes');
        $this->logAction('delete', 'employe', $employe, [], request());
        $employe->delete();

        return response()->json([], 204);
    }
}
