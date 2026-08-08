<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Notifications\Notifiable;

class Employe extends Model
{
    use HasFactory, Notifiable;

    protected $table = 'employes';

    protected $fillable = [
        'nom',
        'prenom',
        'adresse',
        'date_embauche',
        'salaire',
        'taux_commission',
        'contrat',
        'poste',
        'telephone',
        'email',
        'statut',
    ];

    protected function casts(): array
    {
        return [
            'date_embauche' => 'date',
            'salaire' => 'decimal:2',
            'taux_commission' => 'decimal:2',
        ];
    }

    public function user(): HasOne
    {
        return $this->hasOne(User::class, 'id_employe');
    }

    public function ventes(): HasMany
    {
        return $this->hasMany(Vente::class, 'id_employe');
    }

    public function clientsAttribues(): HasMany
    {
        return $this->hasMany(Client::class, 'id_vendeur_attribue');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class, 'id_employe');
    }

    public function ticketsSavResponsable(): HasMany
    {
        return $this->hasMany(TicketSav::class, 'id_responsable');
    }

    public function ordresTravail(): HasMany
    {
        return $this->hasMany(OrdreTravail::class, 'id_technicien');
    }

    public function getNomCompletAttribute(): string
    {
        return trim("{$this->prenom} {$this->nom}");
    }

    public function scopeAvecCompte($query)
    {
        return $query->has('user');
    }

    public function scopeSansCompte($query)
    {
        return $query->doesntHave('user');
    }

    public function scopeParPoste($query, string $poste)
    {
        return $query->where('poste', $poste);
    }
}
