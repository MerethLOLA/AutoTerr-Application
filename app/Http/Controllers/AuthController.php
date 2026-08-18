<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use App\Notifications\TwoFactorCodeNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;

class AuthController extends Controller
{
    private function userPayload(User $user): array
    {
        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'username' => $user->username,
            'role' => $user->role,
            'theme' => $user->theme,
            'locale' => $user->locale,
            'profile_photo_url' => $user->profilePhotoUrl(),
            'two_factor_enabled' => (bool) $user->two_factor_enabled,
        ];
    }

    private function issueSession(User $user): array
    {
        $user->tokens()->delete();
        $token = $user->createToken('frontend')->plainTextToken;
        $user->update(['last_login' => now()]);

        return ['token' => $token, 'user' => $this->userPayload($user)];
    }
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
            'user'  => $this->userPayload($user),
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
                // Le champ "nom d'utilisateur" accepte aussi une adresse email par confort.
                fn ($query) => $query->where('username', $credentials['username'])
                    ->orWhere('email', $credentials['username'])
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

        if ($user->two_factor_enabled) {
            $code = (string) random_int(100000, 999999);
            $user->update([
                'two_factor_code' => Hash::make($code),
                'two_factor_expires_at' => now()->addMinutes(10),
            ]);

            try {
                $user->notify(new TwoFactorCodeNotification($code));
            } catch (\Throwable $e) {
                // L'envoi (SMTP synchrone, pas de worker de file en prod) peut échouer
                // ou timeout selon l'hébergeur. On ne bloque pas la connexion pour
                // autant : mieux vaut laisser passer que verrouiller tout le monde
                // hors de l'application tant que la livraison mail n'est pas fiabilisee.
                report($e);

                return $this->apiItem($this->issueSession($user), 200, [
                    'message' => 'Connexion reussie (code de verification indisponible)',
                ]);
            }

            return $this->apiItem([
                'two_factor_required' => true,
                'user_id' => $user->id,
            ], 200, [
                'message' => 'Code de verification envoye par e-mail',
            ]);
        }

        return $this->apiItem($this->issueSession($user), 200, [
            'message' => 'Connexion reussie',
        ]);
    }

    public function verifyTwoFactor(Request $request): JsonResponse
    {
        $data = $request->validate([
            'user_id' => ['required', 'integer'],
            'code' => ['required', 'string'],
        ]);

        $user = User::query()->find($data['user_id']);

        if (! $user
            || ! $user->two_factor_enabled
            || ! $user->two_factor_code
            || ! $user->two_factor_expires_at
            || $user->two_factor_expires_at->isPast()
            || ! Hash::check($data['code'], $user->two_factor_code)
        ) {
            return response()->json([
                'message' => 'Code invalide ou expire',
            ], 401);
        }

        $user->update([
            'two_factor_code' => null,
            'two_factor_expires_at' => null,
        ]);

        return $this->apiItem($this->issueSession($user), 200, [
            'message' => 'Connexion reussie',
        ]);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
        ]);

        // Réservé aux comptes employés (le client a son propre parcours) : on
        // cherche le compte mais on répond toujours le même message générique,
        // que le compte existe ou non, pour ne pas permettre l'énumération d'emails.
        $user = User::query()
            ->where('email', $data['email'])
            ->where('role', '!=', 'client')
            ->first();

        if ($user) {
            $token = Password::broker()->createToken($user);
            $resetUrl = rtrim(env('FRONTEND_URL', 'http://localhost:3000'), '/')
                .'/login/employee/reset-password?token='.$token.'&email='.urlencode($user->email);

            try {
                $user->notify(new ResetPasswordNotification($resetUrl));
            } catch (\Throwable $e) {
                report($e);
            }
        }

        return $this->apiItem([], 200, [
            'message' => 'Si un compte employé existe avec cette adresse, un e-mail de réinitialisation vient d\'être envoyé.',
        ]);
    }

    public function resetPassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'token' => ['required', 'string'],
            'email' => ['required', 'email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
            'password_confirmation' => ['required', 'string'],
        ]);

        $status = Password::broker()->reset(
            $data,
            function (User $user, string $password) {
                $user->forceFill([
                    'password' => Hash::make($password),
                    'password_hash' => Hash::make($password),
                ])->save();

                $user->tokens()->delete();
            }
        );

        if ($status !== Password::PASSWORD_RESET) {
            return response()->json([
                'message' => 'Ce lien de réinitialisation est invalide ou a expiré.',
            ], 422);
        }

        return $this->apiItem([], 200, [
            'message' => 'Mot de passe réinitialisé avec succès.',
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
            'user' => $this->userPayload($user),
        ]);
    }
}
