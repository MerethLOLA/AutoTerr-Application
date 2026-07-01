<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $data = $request->validate([
            'name'                  => ['required', 'string', 'max:255'],
            'email'                 => ['required', 'email', 'unique:users,email'],
            'username'              => ['required', 'string', 'min:3', 'max:50', 'unique:users,username', 'regex:/^[a-zA-Z0-9_]+$/'],
            'password'              => ['required', 'string', 'min:8', 'confirmed'],
            'password_confirmation' => ['required', 'string'],
        ]);

        $user = User::query()->create([
            'name'     => $data['name'],
            'email'    => $data['email'],
            'username' => $data['username'],
            'password' => Hash::make($data['password']),
            'role'     => 'client',
            'statut'   => 'actif',
        ]);

        $token = $user->createToken('frontend')->plainTextToken;

        return $this->apiItem([
            'token' => $token,
            'user'  => [
                'id'                => $user->id,
                'name'              => $user->name,
                'email'             => $user->email,
                'username'          => $user->username,
                'role'              => $user->role,
                'theme'             => $user->theme,
                'locale'            => $user->locale,
                'profile_photo_url' => $user->profilePhotoUrl(),
            ],
        ], 201, ['message' => 'Compte créé avec succès']);
    }

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => 'nullable|email',
            'username' => 'nullable|string',
            'password' => 'required|string',
        ]);

        $user = User::query()
            ->when(
                ! empty($credentials['email']),
                fn ($query) => $query->where('email', $credentials['email'])
            )
            ->when(
                empty($credentials['email']) && ! empty($credentials['username']),
                fn ($query) => $query->where('username', $credentials['username'])
            )
            ->first();

        if (! $user || ! Hash::check($credentials['password'], $user->getAuthPassword())) {
            return response()->json([
                'message' => 'Identifiants invalides',
            ], 401);
        }

        if ($user->statut !== 'actif') {
            return response()->json([
                'message' => 'Compte desactive',
            ], 401);
        }

        $user->tokens()->delete();
        $token = $user->createToken('frontend')->plainTextToken;
        $user->update(['last_login' => now()]);

        return $this->apiItem([
            'token' => $token,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'username' => $user->username,
                'role' => $user->role,
                'theme' => $user->theme,
                'locale' => $user->locale,
                'profile_photo_url' => $user->profilePhotoUrl(),
            ],
        ], 200, [
            'message' => 'Connexion reussie',
        ]);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        return response()->json([
            'message' => 'Deconnexion reussie',
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return response()->json([
                'message' => 'Non authentifie',
            ], 401);
        }

        return $this->apiItem([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'username' => $user->username,
                'role' => $user->role,
                'theme' => $user->theme,
                'locale' => $user->locale,
                'profile_photo_url' => $user->profilePhotoUrl(),
            ],
        ]);
    }
}
