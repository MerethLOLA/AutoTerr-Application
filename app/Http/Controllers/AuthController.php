<?php

namespace App\Http\Controllers;

use App\Models\User;
use App\Notifications\ResetPasswordNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Password;
use PragmaRX\Google2FA\Google2FA;

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

        $hashedPassword = Hash::make($data['password']);

        $user = User::query()->create([
            'name'          => $data['name'],
            'email'         => $data['email'],
            'username'      => $data['username'],
            'password'      => $hashedPassword,
            'password_hash' => $hashedPassword,
            'role'          => 'client',
            'statut'        => 'actif',
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
            // Tant que la 2FA n'a pas été confirmée par un premier code valide, on
            // (re)génère un secret à chaque tentative de connexion : ça évite de
            // bloquer définitivement un utilisateur qui a fermé/rafraîchi la page
            // avant d'avoir scanné le QR (le secret précédent, jamais confirmé,
            // n'a aucune valeur à conserver).
            if (! $user->two_factor_confirmed_at) {
                $google2fa = new Google2FA();
                $secret = $google2fa->generateSecretKey();
                $user->update(['two_factor_secret' => $secret]);

                return $this->apiItem([
                    'two_factor_setup_required' => true,
                    'user_id' => $user->id,
                    'secret_key' => $secret,
                    'otpauth_url' => $google2fa->getQRCodeUrl('AutoTerr', $user->email, $secret),
                ], 200, [
                    'message' => 'Configuration de la double authentification requise',
                ]);
            }

            return $this->apiItem([
                'two_factor_required' => true,
                'user_id' => $user->id,
            ], 200, [
                'message' => 'Code de verification requis',
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

        if (! $user || ! $user->two_factor_enabled || ! $user->two_factor_secret) {
            return response()->json([
                'message' => 'Code invalide ou expire',
            ], 401);
        }

        $google2fa = new Google2FA();
        if (! $google2fa->verifyKey($user->two_factor_secret, $data['code'])) {
            return response()->json([
                'message' => 'Code invalide',
            ], 401);
        }

        if (! $user->two_factor_confirmed_at) {
            $user->update(['two_factor_confirmed_at' => now()]);
        }

        return $this->apiItem($this->issueSession($user), 200, [
            'message' => 'Connexion reussie',
        ]);
    }

    public function forgotPassword(Request $request): JsonResponse
    {
        $data = $request->validate([
            'email' => ['required', 'email'],
        ]);

        // On répond toujours le même message générique, que le compte existe ou
        // non, pour ne pas permettre l'énumération d'emails. Le lien renvoie vers
        // le parcours employé ou client selon le rôle réel du compte trouvé.
        $user = User::query()->where('email', $data['email'])->first();

        if ($user) {
            $loginPath = $user->role === 'client' ? 'login/client' : 'login/employee';
            $token = Password::broker()->createToken($user);
            $resetUrl = rtrim(env('FRONTEND_URL', 'http://localhost:3000'), '/')
                ."/{$loginPath}/reset-password?token=".$token.'&email='.urlencode($user->email);

            try {
                $user->notify(new ResetPasswordNotification($resetUrl));
            } catch (\Throwable $e) {
                report($e);
            }
        }

        return $this->apiItem([], 200, [
            'message' => 'Si un compte existe avec cette adresse, un e-mail de réinitialisation vient d\'être envoyé.',
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
