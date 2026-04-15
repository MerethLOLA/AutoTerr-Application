<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class InterventionSav extends Model
{
    use HasFactory;

    protected $table = 'interventions_sav';

    protected $fillable = [
        'id_ticket_sav',
        'id_employe',
        'description',
        'statut',
        'temps_passe_minutes',
        'date_intervention',
    ];

    protected function casts(): array
    {
        return [
            'date_intervention' => 'datetime',
            'temps_passe_minutes' => 'integer',
        ];
    }

    public function ticketSav(): BelongsTo
    {
        return $this->belongsTo(TicketSav::class, 'id_ticket_sav');
    }

    public function employe(): BelongsTo
    {
        return $this->belongsTo(Employe::class, 'id_employe');
    }
}
