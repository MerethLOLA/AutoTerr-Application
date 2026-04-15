<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Fournisseur extends Model
{
    use HasFactory;

    protected $table = 'fournisseurs';

    protected $fillable = [
        'nom',
        'adresse',
        'telephone',
        'contact',
        'email',
        'lien',
        'adresse_bureau',
        'pays_origine',
        'vehicule_fournis',
    ];


    public function voitures(): HasMany
    {
        return $this->hasMany(Voiture::class, 'id_fournisseur');
    }

    public function piecesStock(): HasMany
    {
        return $this->hasMany(PieceStock::class, 'id_fournisseur');
    }

    public function scopeRecherche($query, $term)
    {
        return $query->where('nom', 'like', "%{$term}%");
    }
}
