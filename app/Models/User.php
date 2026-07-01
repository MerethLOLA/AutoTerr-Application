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
        'password',
        'profile_photo_path',
        'role',
        'statut',
        'theme',
        'locale',
        'last_login',
        'token_expiration',
        'id_employe',
    ];

    protected $hidden = [
        'password',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login' => 'datetime',
            'token_expiration' => 'datetime',
            'password' => 'hashed',
            'password_hash' => 'hashed',
        ];
    }

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
        return $this->profile_photo_path ? '/storage/'.$this->profile_photo_path : null;
    }
}
