<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Carburant extends Model
{
    use HasFactory;

    protected $table = 'carburants';

    protected $fillable = [
        'id_voiture',
        'date_plein',
        'kilometrage_au_plein',
        'quantite_litres',
        'prix_par_litre',
        'montant_total',
        'type_carburant',
        'station',
        'notes',
    ];

    protected function casts(): array
    {
        return [
            'date_plein'           => 'date',
            'quantite_litres'      => 'decimal:2',
            'prix_par_litre'       => 'decimal:2',
            'montant_total'        => 'decimal:2',
            'kilometrage_au_plein' => 'integer',
        ];
    }

    public function voiture(): BelongsTo
    {
        return $this->belongsTo(Voiture::class, 'id_voiture');
    }
}
