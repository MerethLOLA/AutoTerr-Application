<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class TypeVehicule extends Model
{
    use HasFactory;

    protected $table = 'types_vehicules';

    public $timestamps = false;

    protected $fillable = [
        'nom',
        'type_gasoil',
        'type_boite',
        'carburant',
        'description',
    ];

    public function voitures(): HasMany
    {
        return $this->hasMany(Voiture::class, 'type_vehicule_id');
    }
}
