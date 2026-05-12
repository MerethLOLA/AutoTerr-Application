<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
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
