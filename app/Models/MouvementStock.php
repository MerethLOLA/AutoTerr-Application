<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MouvementStock extends Model
{
    use HasFactory;

    protected $table = 'mouvements_stock';

    protected $fillable = [
        'id_piece_stock',
        'type_mouvement',
        'quantite',
        'source_mouvement',
        'reference_source',
        'observations',
        'date_mouvement',
    ];

    protected function casts(): array
    {
        return [
            'quantite' => 'integer',
            'date_mouvement' => 'datetime',
        ];
    }

    public function piece(): BelongsTo
    {
        return $this->belongsTo(PieceStock::class, 'id_piece_stock');
    }
}
