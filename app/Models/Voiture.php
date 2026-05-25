<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Voiture extends Model
{
    use HasFactory;

    protected $table = 'voitures';
    protected $primaryKey = 'id'; // Par défaut c'est id, vérifiez que ce n'est pas écrasé

    protected $fillable = [
        'marque',
        'modele',
        'annee',
        'couleur',
        'prix',
        'kilometrage',
        'numero_chassis',
        'date_acquisition',
        'statut',
        'type_usage',
        'prix_vente',
        'etat',
        'energie',
        'type_boite',
        'type_vehicule_id',
        'origine_marque_id',
        'id_fournisseur',
        'description',
        'image_principale',
    ];

    protected function casts(): array
    {
        return [
            'annee'       => 'integer',
            'prix'        => 'decimal:2',
            'prix_vente'  => 'decimal:2',
            'kilometrage' => 'integer',
            'date_acquisition' => 'date',
        ];
    }

    public function images(): HasMany
    {
        return $this->hasMany(ImageVoiture::class, 'id_voiture');
    }

    public function fournisseur(): BelongsTo
    {
        return $this->belongsTo(Fournisseur::class, 'id_fournisseur');
    }

    public function typeVehicule(): BelongsTo
    {
        return $this->belongsTo(TypeVehicule::class, 'type_vehicule_id');
    }

    public function origineMarque(): BelongsTo
    {
        return $this->belongsTo(OrigineMarque::class, 'origine_marque_id');
    }

    public function ventes(): HasMany
    {
        return $this->hasMany(Vente::class, 'id_voiture');
    }

    public function locations(): HasMany
    {
        return $this->hasMany(Location::class, 'id_voiture');
    }

    public function ticketsSav(): HasMany
    {
        return $this->hasMany(TicketSav::class, 'id_voiture');
    }

    public function ordresTravail(): HasMany
    {
        return $this->hasMany(OrdreTravail::class, 'id_voiture');
    }

    public function garantie(): HasOne
    {
        return $this->hasOne(Garantie::class, 'id_voiture');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class, 'id_voiture');
    }

    public function assurances(): HasMany
    {
        return $this->hasMany(Assurance::class, 'id_voiture');
    }

    public function carburants(): HasMany
    {
        return $this->hasMany(Carburant::class, 'id_voiture');
    }

    public function controlesTechniques(): HasMany
    {
        return $this->hasMany(ControleTechnique::class, 'id_voiture');
    }

    public function sinistres(): HasMany
    {
        return $this->hasMany(Sinistre::class, 'id_voiture');
    }

    public function entretiens(): HasMany
    {
        return $this->hasMany(Entretien::class, 'id_voiture');
    }

    public function scopeDisponibles($query)
    {
        return $query->where('statut', 'disponible');
    }

    public function scopePourLocation($query)
    {
        return $query->whereIn('type_usage', ['location', 'les_deux']);
    }

    public function scopePourVente($query)
    {
        return $query->whereIn('type_usage', ['vente', 'les_deux']);
    }

    public function scopeParOrigine($query, int $origineId)
    {
        return $query->where('origine_marque_id', $origineId);
    }
}
