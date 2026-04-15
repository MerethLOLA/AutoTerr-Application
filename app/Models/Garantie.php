<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Garantie extends Model
{
    use HasFactory;

    protected $table = 'garanties';

    const UPDATED_AT = null;

    protected $fillable = [
        'id_voiture',
        'duree_garantie',
        'type_garantie',
        'date_debut',
        'date_fin',
    ];

    protected $casts = [
        'date_debut' => 'date',
        'date_fin' => 'date',
        'duree_garantie' => 'integer',
        'created_at' => 'datetime',
    ];

    public function voiture(): BelongsTo
    {
        return $this->belongsTo(Voiture::class, 'id_voiture');
    }

    public function ticketsSav(): HasMany
    {
        return $this->hasMany(TicketSav::class, 'id_garantie');
    }

    public function getEstActiveAttribute(): bool
    {
        $now = now();
        return $this->date_debut <= $now && $this->date_fin >= $now;
    }

    public function getEstExpireeAttribute(): bool
    {
        return $this->date_fin && $this->date_fin->isPast();
    }

    public function scopeActives($query)
    {
        return $query->where('date_debut', '<=', now())
            ->where('date_fin', '>=', now());
    }

    public function scopeExpirees($query)
    {
        return $query->where('date_fin', '<', now());
    }
}
