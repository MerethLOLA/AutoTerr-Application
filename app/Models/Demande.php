<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Demande extends Model
{
    protected $fillable = [
        'type', 'statut', 'nom', 'email', 'telephone', 'message',
        'id_voiture', 'rendez_vous_date', 'rendez_vous_heure',
        'reprise_marque', 'reprise_modele', 'reprise_annee',
        'reprise_kilometrage', 'reprise_etat',
    ];

    public function voiture(): BelongsTo
    {
        return $this->belongsTo(Voiture::class, 'id_voiture');
    }
}
