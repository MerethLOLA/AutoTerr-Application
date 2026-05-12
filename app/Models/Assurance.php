<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Assurance extends Model
{
    use HasFactory;

    protected $table = 'assurances';

    protected $fillable = [
        'id_voiture',
        'id_gestionnaire',
        'compagnie',
        'numero_police',
        'type_assurance',
        'date_debut',
        'date_fin',
        'montant_prime',
        'statut',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'date_debut'    => 'date',
            'date_fin'      => 'date',
            'montant_prime' => 'decimal:2',
        ];
    }

    public function voiture(): BelongsTo
    {
        return $this->belongsTo(Voiture::class, 'id_voiture');
    }

    public function gestionnaire(): BelongsTo
    {
        return $this->belongsTo(Employe::class, 'id_gestionnaire');
    }

    public function sinistres(): HasMany
    {
        return $this->hasMany(Sinistre::class, 'id_assurance');
    }
}
