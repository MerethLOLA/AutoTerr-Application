<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Location extends Model
{
    use HasFactory;

    protected $table = 'locations';

    protected $fillable = [
        'reference_location',
        'id_client',
        'id_voiture',
        'date_debut',
        'date_fin',
        'date_retour_effective',
        'tarif_journalier',
        'statut',
        'caution',
        'observations',
    ];

    protected function casts(): array
    {
        return [
            'date_debut' => 'datetime',
            'date_fin' => 'datetime',
            'date_retour_effective' => 'datetime',
            'tarif_journalier' => 'decimal:2',
            'caution' => 'decimal:2',
        ];
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'id_client');
    }

    public function voiture(): BelongsTo
    {
        return $this->belongsTo(Voiture::class, 'id_voiture');
    }

    public function etatsDesLieux(): HasMany
    {
        return $this->hasMany(EtatLieuLocation::class, 'id_location');
    }
}
