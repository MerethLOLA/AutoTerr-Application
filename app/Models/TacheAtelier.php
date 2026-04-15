<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class TacheAtelier extends Model
{
    use HasFactory;

    protected $table = 'taches_atelier';

    protected $fillable = [
        'id_ordre_travail',
        'description',
        'statut',
        'temps_passe_minutes',
    ];

    protected function casts(): array
    {
        return [
            'temps_passe_minutes' => 'integer',
        ];
    }

    public function ordreTravail(): BelongsTo
    {
        return $this->belongsTo(OrdreTravail::class, 'id_ordre_travail');
    }
}
