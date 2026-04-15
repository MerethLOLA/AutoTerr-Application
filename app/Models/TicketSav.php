<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TicketSav extends Model
{
    use HasFactory;

    protected $table = 'tickets_sav';

    protected $fillable = [
        'reference_ticket',
        'id_client',
        'id_voiture',
        'id_responsable',
        'id_garantie',
        'objet',
        'description',
        'statut',
        'priorite',
        'date_ouverture',
        'date_resolution',
    ];

    protected function casts(): array
    {
        return [
            'date_ouverture' => 'datetime',
            'date_resolution' => 'datetime',
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

    public function responsable(): BelongsTo
    {
        return $this->belongsTo(Employe::class, 'id_responsable');
    }

    public function garantie(): BelongsTo
    {
        return $this->belongsTo(Garantie::class, 'id_garantie');
    }

    public function interventions(): HasMany
    {
        return $this->hasMany(InterventionSav::class, 'id_ticket_sav');
    }
}
