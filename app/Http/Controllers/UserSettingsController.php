<?php

namespace App\Http\Controllers;

use App\Models\Demande;
use App\Models\NotificationInterne;
use App\Models\Facturation;
use App\Models\Location;
use App\Models\OrdreTravail;
use App\Models\PieceStock;
use App\Models\TicketSav;
use App\Services\AutomationAlertService;
use Illuminate\Database\QueryException;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;

class UserSettingsController extends Controller
{
    public function __construct(
        private readonly AutomationAlertService $automationAlertService
    ) {
    }

    private function userPayload($user): array
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

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', Rule::unique('users', 'email')->ignore($user->id)],
            'username' => ['required', 'string', 'max:255', Rule::unique('users', 'username')->ignore($user->id)],
        ]);

        $user->fill($data);
        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
        }
        $user->save();

        return $this->apiItem([
            'user' => $this->userPayload($user),
        ], 200, [
            'message' => 'Profil mis a jour',
        ]);
    }

    public function updateTwoFactor(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'enabled' => ['required', 'boolean'],
        ]);

        $user->update([
            'two_factor_enabled' => $data['enabled'],
            'two_factor_code' => null,
            'two_factor_expires_at' => null,
        ]);

        return $this->apiItem([
            'user' => $this->userPayload($user),
        ], 200, [
            'message' => $data['enabled']
                ? 'Double authentification activee'
                : 'Double authentification desactivee',
        ]);
    }

    public function updatePreferences(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'theme' => ['required', Rule::in(['system', 'light', 'dark'])],
            'locale' => ['required', Rule::in(['fr', 'en', 'es'])],
        ]);

        $user->update($data);

        return $this->apiItem([
            'user' => $this->userPayload($user),
        ], 200, [
            'message' => 'Preferences mises a jour',
        ]);
    }

    public function uploadPhoto(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate([
            'photo' => ['required', 'image', 'max:2048'],
        ]);

        if ($user->profile_photo_path) {
            Storage::disk('public')->delete($user->profile_photo_path);
        }

        $path = $request->file('photo')->store('profile_photos', 'public');
        $user->update(['profile_photo_path' => $path]);

        return $this->apiItem([
            'profile_photo_url' => $user->profilePhotoUrl(),
        ], 200, [
            'message' => 'Photo de profil mise à jour',
        ]);
    }

    public function updatePassword(Request $request): JsonResponse
    {
        $user = $request->user();

        $data = $request->validate([
            'current_password' => ['required', 'string'],
            'new_password' => ['required', 'string', 'min:8'],
        ]);

        if (! Hash::check($data['current_password'], $user->getAuthPassword())) {
            return response()->json([
                'message' => 'Mot de passe actuel invalide',
            ], 422);
        }

        $user->forceFill([
            'password'      => Hash::make($data['new_password']),
            'password_hash' => Hash::make($data['new_password']),
        ])->save();

        return $this->apiItem([], 200, [
            'message' => 'Mot de passe mis a jour',
        ]);
    }

    public function logoutAllDevices(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Non authentifie'], 401);
        }

        $currentTokenId = $user->currentAccessToken()?->id;
        $user->tokens()
            ->when($currentTokenId, fn ($query) => $query->where('id', '!=', $currentTokenId))
            ->delete();

        DB::table('sessions')
            ->where('user_id', $user->id)
            ->delete();

        return $this->apiItem([], 200, [
            'message' => 'Les autres appareils ont ete deconnectes',
        ]);
    }

    public function deleteAccount(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user) {
            return response()->json(['message' => 'Non authentifie'], 401);
        }

        try {
            DB::transaction(function () use ($user) {
                DB::table('sessions')->where('user_id', $user->id)->delete();
                $user->tokens()->delete();
                $user->delete();
            });
        } catch (QueryException) {
            return response()->json([
                'message' => 'La suppression du compte est impossible tant que des dependances metier existent.',
            ], 409);
        }

        return $this->apiItem([], 200, [
            'message' => 'Compte supprime',
        ]);
    }

    public function notificationCounts(Request $request): JsonResponse
    {
        abort_if(($request->user()?->role ?? null) === 'client', 403);

        $this->automationAlertService->syncIfStale();

        return $this->apiItem([
            'tickets_ouverts' => TicketSav::query()->whereIn('statut', ['ouvert', 'en_cours'])->count(),
            'ordres_ouverts' => OrdreTravail::query()->whereIn('statut', ['ouvert', 'en_cours'])->count(),
            'factures_impayees' => Facturation::query()->whereIn('statut', ['impayee', 'partiellement_payee', 'en_retard'])->count(),
            'reservations' => Location::query()->where('statut', 'planifiee')->count(),
            'alertes_stock' => PieceStock::query()->whereColumn('quantite_stock', '<=', 'seuil_alerte')->count(),
            'demandes_en_attente' => Demande::query()->where('statut', 'en_attente')->count(),
            'unread_total' => NotificationInterne::query()->whereNull('lue_at')->count(),
        ]);
    }

    public function notifications(Request $request): JsonResponse
    {
        abort_if(($request->user()?->role ?? null) === 'client', 403);

        $this->automationAlertService->syncIfStale();

        $items = NotificationInterne::query()
            ->latest('declenchee_at')
            ->limit((int) $request->integer('limit', 8))
            ->get()
            ->map(function (NotificationInterne $notification) {
                return [
                    'id' => $notification->id,
                    'type' => $notification->type,
                    'level' => $notification->niveau,
                    'title' => $notification->titre,
                    'message' => $notification->message,
                    'url' => $notification->url,
                    'triggered_at' => optional($notification->declenchee_at)?->toIso8601String(),
                    'read_at' => optional($notification->lue_at)?->toIso8601String(),
                ];
            })
            ->values();

        return $this->apiItem([
            'items' => $items,
        ]);
    }

    public function markNotificationAsRead(Request $request, NotificationInterne $notificationInterne): JsonResponse
    {
        abort_if(($request->user()?->role ?? null) === 'client', 403);

        $notificationInterne->update([
            'lue_at' => now(),
        ]);

        return $this->apiItem([
            'id' => $notificationInterne->id,
        ], 200, [
            'message' => 'Notification marquee comme lue',
        ]);
    }
}
