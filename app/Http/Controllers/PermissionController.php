<?php

namespace App\Http\Controllers;

use App\Http\Requests\PermissionRequest;
use App\Models\Permission;

class PermissionController extends Controller
{
    public function index()
    {
        $this->ensurePermission('manage_ventes');

        return response()->json(Permission::query()->with('rolePermissions')->paginate(15));
    }

    public function store(PermissionRequest $request)
    {
        $this->ensurePermission('manage_ventes');
        $permission = Permission::query()->create($request->validated());
        $this->logAction('create', 'permission', $permission, $request->validated(), $request);

        return response()->json($permission, 201);
    }

    public function show(Permission $permission)
    {
        $this->ensurePermission('manage_ventes');

        return response()->json($permission->load('rolePermissions'));
    }

    public function update(PermissionRequest $request, Permission $permission)
    {
        $this->ensurePermission('manage_ventes');
        $permission->update($request->validated());
        $this->logAction('update', 'permission', $permission, $request->validated(), $request);

        return response()->json($permission->fresh());
    }

    public function destroy(Permission $permission)
    {
        $this->ensurePermission('manage_ventes');
        $this->logAction('delete', 'permission', $permission, [], request());
        $permission->delete();

        return response()->json([], 204);
    }
}
