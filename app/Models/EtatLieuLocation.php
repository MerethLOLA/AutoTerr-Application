<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EtatLieuLocation extends Model
{
    use HasFactory;

    protected $table = 'etats_lieux_locations';

    protected $fillable = [
        'id_location',
        'type_etat',
        'description',
        'chemin_photo',
        'date_etat',
    ];

    protected function casts(): array
    {
        return [
            'date_etat' => 'datetime',
        ];
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class, 'id_location');
    }
}
