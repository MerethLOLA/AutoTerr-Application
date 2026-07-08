<?php

namespace App\Http\Controllers;

use App\Models\Employe;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;

class UserManagementController extends Controller
{
    private const ROLES = ['admin', 'manager', 'commercial', 'agent_location', 'sav', 'atelier', 'stock', 'assurance', 'accountant', 'client'];

    public function index(): JsonResponse
    {
        $this->ensureRole('admin', 'super_admin');

        $users = User::query()
            ->with('employe:id,nom,prenom,poste')
            ->select(['id', 'name', 'username', 'email', 'role', 'statut', 'last_login', 'id_employe', 'created_at'])
            ->latest()
            ->paginate(20);

        return $this->apiCollection($users);
    }

    public function store(Request $request): JsonResponse
    {
        $this->ensureRole('admin', 'super_admin');

        $data = $request->validate([
            'name'       => ['required', 'string', 'max:255'],
            'username'   => ['required', 'string', 'min:3', 'max:50', 'unique:users,username', 'regex:/^[a-zA-Z0-9_]+$/'],
            'email'      => ['required', 'email', 'unique:users,email'],
            'password'   => ['required', 'string', 'min:6'],
            'role'       => ['required', Rule::in(self::ROLES)],
            'id_employe' => ['nullable', 'integer', 'exists:employes,id', 'unique:users,id_employe'],
        ]);

        $user = User::query()->create([
            'name'          => $data['name'],
            'username'      => $data['username'],
            'email'         => $data['email'],
            'password'      => Hash::make($data['password']),
            'password_hash' => Hash::make($data['password']),
            'role'          => $data['role'],
            'statut'        => 'actif',
            'id_employe'    => $data['id_employe'] ?? null,
        ]);

        $this->logAction('create', 'user', $user, ['username' => $user->username, 'role' => $user->role], $request);

        return $this->apiItem($user->load('employe'), 201, ['message' => 'Utilisateur créé']);
    }

    public function update(Request $request, User $user): JsonResponse
    {
        $this->ensureRole('admin', 'super_admin');

        $data = $request->validate([
            'name'       => ['sometimes', 'string', 'max:255'],
            'username'   => ['sometimes', 'string', 'min:3', 'max:50', 'unique:users,username,'.$user->id, 'regex:/^[a-zA-Z0-9_]+$/'],
            'email'      => ['sometimes', 'email', 'unique:users,email,'.$user->id],
            'password'   => ['nullable', 'string', 'min:6'],
            'role'       => ['sometimes', Rule::in(self::ROLES)],
            'statut'     => ['sometimes', 'string', Rule::in(['actif', 'inactif', 'suspendu'])],
            'id_employe' => ['nullable', 'integer', 'exists:employes,id'],
        ]);

        if (isset($data['password'])) {
            $data['password_hash'] = Hash::make($data['password']);
            $data['password'] = Hash::make($data['password']);
        }

        $user->update($data);
        $this->logAction('update', 'user', $user, $data, $request);

        return $this->apiItem($user->fresh()->load('employe'), 200, ['message' => 'Utilisateur mis à jour']);
    }

    public function destroy(User $user): JsonResponse
    {
        $this->ensureRole('admin', 'super_admin');

        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'Impossible de supprimer votre propre compte'], 422);
        }

        $this->logAction('delete', 'user', $user, [], request());
        $user->tokens()->delete();
        $user->delete();

        return $this->apiDeleted();
    }

    public function emploiesSansCompte(): JsonResponse
    {
        $this->ensureRole('admin', 'super_admin');

        $employes = Employe::query()
            ->doesntHave('user')
            ->orderBy('nom')
            ->get(['id', 'nom', 'prenom', 'poste']);

        return response()->json($employes);
    }
}
