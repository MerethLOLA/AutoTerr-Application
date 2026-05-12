<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Sinistre extends Model
{
    use HasFactory;

    protected $table = 'sinistres';

    protected $fillable = [
        'id_voiture',
        'id_client',
        'id_assurance',
        'id_gestionnaire',
        'date_sinistre',
        'type_sinistre',
        'description',
        'montant_dommages',
        'statut',
        'numero_declaration',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'date_sinistre'    => 'date',
            'montant_dommages' => 'decimal:2',
        ];
    }

    public function voiture(): BelongsTo
    {
        return $this->belongsTo(Voiture::class, 'id_voiture');
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'id_client');
    }

    public function assurance(): BelongsTo
    {
        return $this->belongsTo(Assurance::class, 'id_assurance');
    }

    public function gestionnaire(): BelongsTo
    {
        return $this->belongsTo(Employe::class, 'id_gestionnaire');
    }
}
