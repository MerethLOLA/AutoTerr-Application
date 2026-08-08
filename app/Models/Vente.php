<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Vente extends Model
{
    use HasFactory;

    protected $table = 'ventes';

    protected $fillable = [
        'reference_vente',
        'date_vente',
        'id_client',
        'id_voiture',
        'prix_catalogue',
        'remise',
        'motif_remise',
        'prix_final',
        'mode_paiement',
        'statut',
        'id_employe',
        'observations',
    ];

    protected function casts(): array
    {
        return [
            'date_vente' => 'date',
            'prix_catalogue' => 'decimal:2',
            'remise' => 'decimal:2',
            'prix_final' => 'decimal:2',
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

    public function employe(): BelongsTo
    {
        return $this->belongsTo(Employe::class, 'id_employe');
    }

    public function facturation(): HasOne
    {
        return $this->hasOne(Facturation::class, 'id_vente');
    }

    public function paiements(): HasMany
    {
        return $this->hasMany(Paiement::class, 'id_vente');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class, 'id_vente');
    }

    public function scopeFinalisees($query)
    {
        return $query->where('statut', 'finalisee');
    }
}
