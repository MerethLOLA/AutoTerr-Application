<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ConsommationPiece extends Model
{
    use HasFactory;

    protected $table = 'consommations_pieces';

    protected $fillable = [
        'id_ordre_travail',
        'id_piece_stock',
        'quantite',
        'date_consommation',
    ];

    protected function casts(): array
    {
        return [
            'quantite' => 'integer',
            'date_consommation' => 'datetime',
        ];
    }

    public function ordreTravail(): BelongsTo
    {
        return $this->belongsTo(OrdreTravail::class, 'id_ordre_travail');
    }

    public function piece(): BelongsTo
    {
        return $this->belongsTo(PieceStock::class, 'id_piece_stock');
    }
}
