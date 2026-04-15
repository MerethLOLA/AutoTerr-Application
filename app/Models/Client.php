<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Client extends Model
{
    use HasFactory;

    protected $table = 'clients';

    protected $fillable = [
        'nom',
        'prenom',
        'adresse',
        'contact',
        'telephone',
        'email',
        'piece_identite',
        'numero_piece',
        'numero_piece2',
        'type_client',
        'classe',
        'raison_sociale',
        'numero_siret',
        'date_naissance',
        'id_vendeur_attribue',
    ];

    protected function casts(): array
    {
        return [
            'date_naissance' => 'date',
        ];
    }

    public function ventes(): HasMany
    {
        return $this->hasMany(Vente::class, 'id_client');
    }

    public function paiements(): HasMany
    {
        return $this->hasMany(Paiement::class, 'id_client');
    }

    public function documents(): HasMany
    {
        return $this->hasMany(Document::class, 'id_client');
    }

    public function locations(): HasMany
    {
        return $this->hasMany(Location::class, 'id_client');
    }

    public function ticketsSav(): HasMany
    {
        return $this->hasMany(TicketSav::class, 'id_client');
    }

    public function vendeurAttribue(): BelongsTo
    {
        return $this->belongsTo(Employe::class, 'id_vendeur_attribue');
    }

    public function getNomCompletAttribute(): string
    {
        return trim("{$this->prenom} {$this->nom}");
    }

    public function scopeRecherche($query, $term)
    {
        return $query->where(function ($q) use ($term) {
            $q->where('nom', 'like', "%{$term}%")
                ->orWhere('prenom', 'like', "%{$term}%")
                ->orWhere('email', 'like', "%{$term}%")
                ->orWhere('telephone', 'like', "%{$term}%")
                ->orWhere('numero_piece', 'like', "%{$term}%");
        });
    }
}
