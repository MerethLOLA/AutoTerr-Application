<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Document extends Model
{
    use HasFactory;

    protected $table = 'documents';

    const UPDATED_AT = null;

    protected $fillable = [
        'id_vente',
        'id_client',
        'id_employe',
        'id_voiture',
        'type_document',
        'date_document',
        'numero_document',
        'date_production',
        'date_expiration',
        'chemin_fichier',
    ];

    protected $casts = [
        'date_document' => 'date',
        'date_production' => 'date',
        'date_expiration' => 'date',
        'created_at' => 'datetime',
    ];

    public function voiture(): BelongsTo
    {
        return $this->belongsTo(Voiture::class, 'id_voiture');
    }

    public function vente(): BelongsTo
    {
        return $this->belongsTo(Vente::class, 'id_vente');
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'id_client');
    }

    public function employe(): BelongsTo
    {
        return $this->belongsTo(Employe::class, 'id_employe');
    }

    public function getEstExpireAttribute(): bool
    {
        return $this->date_expiration && $this->date_expiration->isPast();
    }
    public function scopeExpires($query)
    {
        return $query->where('date_expiration', '<', now());
    }
    public function scopeValides($query)
    {
        return $query->where('date_expiration', '>=', now())
            ->orWhereNull('date_expiration');
    }
}
