<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Entretien extends Model
{
    use HasFactory;

    protected $table = 'entretiens';

    protected $fillable = [
        'id_voiture',
        'id_technicien',
        'type_entretien',
        'date_prevue',
        'date_realise',
        'kilometrage_prevu',
        'kilometrage_realise',
        'cout',
        'statut',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'date_prevue'         => 'date',
            'date_realise'        => 'date',
            'cout'                => 'decimal:2',
            'kilometrage_prevu'   => 'integer',
            'kilometrage_realise' => 'integer',
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
