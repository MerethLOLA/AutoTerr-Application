<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OrdreTravail extends Model
{
    use HasFactory;

    protected $table = 'ordres_travail';

    protected $fillable = [
        'reference_ot',
        'id_voiture',
        'id_ticket_sav',
        'description',
        'priorite',
        'deadline',
        'statut',
        'id_technicien',
    ];

    protected function casts(): array
    {
        return [
            'deadline' => 'datetime',
        ];
    }

    public function voiture(): BelongsTo
    {
        return $this->belongsTo(Voiture::class, 'id_voiture');
    }

    public function ticketSav(): BelongsTo
    {
        return $this->belongsTo(TicketSav::class, 'id_ticket_sav');
    }

    public function technicien(): BelongsTo
    {
        return $this->belongsTo(Employe::class, 'id_technicien');
    }

    public function taches(): HasMany
    {
        return $this->hasMany(TacheAtelier::class, 'id_ordre_travail');
    }

    public function consommations(): HasMany
    {
        return $this->hasMany(ConsommationPiece::class, 'id_ordre_travail');
    }
}
