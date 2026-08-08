<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Notifications\Notifiable;

class Client extends Model
{
    use HasFactory, Notifiable;

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

    /**
     * Applique le type/numéro de pièce d'identité, en écriture unique : une fois qu'une
     * valeur est enregistrée, toute tentative de la modifier est refusée (422).
     */
    public function appliquerPieceIdentite(array $data): void
    {
        $updates = [];

        foreach (['piece_identite', 'numero_piece'] as $champ) {
            if (! array_key_exists($champ, $data) || $data[$champ] === null || $data[$champ] === '') {
                continue;
            }

            if (! empty($this->{$champ}) && $this->{$champ} !== $data[$champ]) {
                abort(422, "Impossible de modifier « {$champ} » : la pièce d'identité de ce client est déjà enregistrée et ne peut plus être modifiée.");
            }

            $updates[$champ] = $data[$champ];
        }

        if ($updates) {
            $this->update($updates);
        }
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
