<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ApiTokenAuth
{
    public function handle(Request $request, Closure $next)
    {
        $token = $request->bearerToken();

        if (!$token) {
            return response()->json([
                'message' => 'Token non fourni'
            ], 401);
        }

        // Récupérer l'ID utilisateur depuis le cache
        $userId = cache()->get('api_token_' . $token);

        if (!$userId) {
            return response()->json([
                'message' => 'Token invalide ou expiré'
            ], 401);
        }

        // Récupérer l'utilisateur
        $user = \App\Models\User::find($userId);

        if (!$user || $user->statut !== 'actif') {
            return response()->json([
                'message' => 'Utilisateur non trouvé ou inactif'
            ], 401);
        }

        // Vérifier l'expiration du token
        if ($user->token_expiration && $user->token_expiration < now()) {
            // Supprimer le token expiré
            cache()->forget('api_token_' . $token);
            return response()->json([
                'message' => 'Token expiré'
            ], 401);
        }

        // Authentifier l'utilisateur pour cette requête
        Auth::guard('api')->setUser($user);

        return $next($request);
    }
}
