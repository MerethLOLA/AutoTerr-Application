<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Paiement extends Model
{
    use HasFactory;

    protected $table = 'paiements';

    const UPDATED_AT = null;

    protected $fillable = [
        'date',
        'mode_paiement',
        'montant',
        'reste',
        'id_facture',
        'id_vente',
        'id_location',
        'id_client',
    ];

    protected $casts = [
        'date' => 'date',
        'montant' => 'decimal:2',
        'reste' => 'decimal:2',
        'created_at' => 'datetime',
    ];

    public function facturation(): BelongsTo
    {
        return $this->belongsTo(Facturation::class, 'id_facture');
    }

    public function vente(): BelongsTo
    {
        return $this->belongsTo(Vente::class, 'id_vente');
    }


    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'id_client');
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'id_location');
    }

    public function scopeDuMois($query, $mois = null, $annee = null)
    {
        $mois = $mois ?? now()->month;
        $annee = $annee ?? now()->year;

        return $query->whereMonth('date', $mois)
            ->whereYear('date', $annee);
    }


    public function scopeParMode($query, $mode)
    {
        return $query->where('mode_paiement', $mode);
    }
}
