<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PieceStock extends Model
{
    use HasFactory;

    protected $table = 'pieces_stock';

    protected $fillable = [
        'reference',
        'designation',
        'description',
        'prix_unitaire',
        'quantite_stock',
        'seuil_alerte',
        'id_fournisseur',
        'statut',
    ];

    protected function casts(): array
    {
        return [
            'prix_unitaire' => 'decimal:2',
            'quantite_stock' => 'integer',
            'seuil_alerte' => 'integer',
        ];
    }

    public function fournisseur(): BelongsTo
    {
        return $this->belongsTo(Fournisseur::class, 'id_fournisseur');
    }

    public function mouvements(): HasMany
    {
        return $this->hasMany(MouvementStock::class, 'id_piece_stock');
    }

    public function consommations(): HasMany
    {
        return $this->hasMany(ConsommationPiece::class, 'id_piece_stock');
    }

    public function getValeurStockAttribute(): float
    {
        return (float) $this->prix_unitaire * (int) $this->quantite_stock;
    }

    public function getAlerteStockAttribute(): bool
    {
        return (int) $this->quantite_stock <= (int) $this->seuil_alerte;
    }
}
