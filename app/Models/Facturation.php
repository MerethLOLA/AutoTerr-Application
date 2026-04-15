<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Facturation extends Model
{
    use HasFactory;

    protected $table = 'facturations';

    const UPDATED_AT = null;

    protected $fillable = [
        'numero_facture',
        'date_facture',
        'mode_livraison',
        'montant',
        'remise',
        'montant_ht',
        'taux_tva',
        'montant_ttc',
        'statut',
        'date_echeance',
        'observations',
        'id_vente',
    ];

    protected $casts = [
        'date_facture' => 'date',
        'date_echeance' => 'date',
        'montant' => 'decimal:2',
        'remise' => 'decimal:2',
        'montant_ht' => 'decimal:2',
        'taux_tva' => 'decimal:2',
        'montant_ttc' => 'decimal:2',
        'created_at' => 'datetime',
    ];

    public function vente(): BelongsTo
    {
        return $this->belongsTo(Vente::class, 'id_vente');
    }

    public function paiements(): HasMany
    {
        return $this->hasMany(Paiement::class, 'id_facture');
    }

    public function getMontantPayeAttribute(): float
    {
        return (float) $this->paiements()->sum('montant');
    }


    public function getResteAPayerAttribute(): float
    {
        return $this->montant_ttc - $this->montant_paye;
    }

    public function getEstPayeeAttribute(): bool
    {
        return $this->montant_paye >= $this->montant_ttc;
    }

    public function getEstEnRetardAttribute(): bool
    {
        return $this->date_echeance &&
            $this->date_echeance->isPast() &&
            !$this->est_payee;
    }

    public function syncStatut(): void
    {
        $reste = max((float) $this->reste_a_payer, 0);

        $statut = 'impayee';

        if ($reste <= 0.0) {
            $statut = 'payee';
        } elseif ($this->date_echeance && $this->date_echeance->isPast()) {
            $statut = 'en_retard';
        } elseif ($this->montant_paye > 0) {
            $statut = 'partiellement_payee';
        }

        if ($this->statut !== $statut) {
            $this->forceFill(['statut' => $statut])->save();
        }
    }

    public function scopePayees($query)
    {
        return $query->where('statut', 'payee');
    }

    public function scopeImpayees($query)
    {
        return $query->where('statut', '!=', 'payee');
    }

    public function scopeEnRetard($query)
    {
        return $query->where('date_echeance', '<', now())
            ->where('statut', '!=', 'payee');
    }
}
