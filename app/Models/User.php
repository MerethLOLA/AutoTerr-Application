<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\QueryException;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $table = 'users';

    protected $fillable = [
        'username',
        'name',
        'email',
        'password_hash',
        'password',
        'profile_photo_path',
        'role',
        'statut',
        'theme',
        'locale',
        'last_login',
        'token_expiration',
        'id_employe',
        'two_factor_enabled',
        'two_factor_secret',
        'two_factor_confirmed_at',
    ];

    protected $hidden = [
        'password',
        'two_factor_secret',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'last_login' => 'datetime',
        'token_expiration' => 'datetime',
        'password' => 'hashed',
        'password_hash' => 'hashed',
        'two_factor_enabled' => 'boolean',
        'two_factor_secret' => 'encrypted',
        'two_factor_confirmed_at' => 'datetime',
    ];

    public function employe(): BelongsTo
    {
        return $this->belongsTo(Employe::class, 'id_employe');
    }

    public function rolePermissions(): HasMany
    {
        return $this->hasMany(RolePermission::class, 'role', 'role');
    }

    public function getAuthPassword(): string
    {
        return (string) ($this->password ?: $this->password_hash);
    }

    public function getAuthPasswordName(): string
    {
        return $this->password ? 'password' : 'password_hash';
    }

    public function hasPermission(string $permission): bool
    {
        if (in_array($this->role, ['admin', 'super_admin'], true)) {
            return true;
        }

        try {
            return RolePermission::query()
                ->join('permissions', 'permissions.id', '=', 'role_permissions.permission_id')
                ->where('role_permissions.role', $this->role)
                ->where('permissions.nom', $permission)
                ->exists();
        } catch (QueryException) {
            return false;
        }
    }

    public function hasAnyPermission(array $permissions): bool
    {
        if (in_array($this->role, ['admin', 'super_admin'], true)) {
            return true;
        }

        foreach ($permissions as $permission) {
            if ($this->hasPermission($permission)) {
                return true;
            }
        }

        return false;
    }

    public function profilePhotoUrl(): ?string
    {
        // URL absolue (pas juste "/storage/...") : le frontend et le backend sont sur des
        // domaines différents en production (Vercel / Render), donc un chemin relatif
        // pointerait par erreur vers le domaine du frontend.
        return $this->profile_photo_path ? url('/storage/'.$this->profile_photo_path) : null;
    }
}
