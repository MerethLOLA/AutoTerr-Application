<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ControleTechnique extends Model
{
    use HasFactory;

    protected $table = 'controles_techniques';

    protected $fillable = [
        'id_voiture',
        'id_technicien',
        'type_controle',
        'date_controle',
        'date_expiration',
        'statut',
        'resultat',
        'organisme',
        'cout',
        'observations',
    ];

    protected function casts(): array
    {
        return [
            'date_controle'   => 'date',
            'date_expiration' => 'date',
            'cout'            => 'decimal:2',
        ];
    }

    public function voiture(): BelongsTo
    {
        return $this->belongsTo(Voiture::class, 'id_voiture');
    }

    public function technicien(): BelongsTo
    {
        return $this->belongsTo(Employe::class, 'id_technicien');
    }
}
