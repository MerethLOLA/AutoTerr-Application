<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ImageVoiture extends Model
{
    use HasFactory;

    protected $table = 'image_voitures';

    public $timestamps = false;

    protected $fillable = [
        'id_voiture',
        'chemin',
        'vue',
        'description',
        'largeur',
        'hauteur',
        'taille',
        'legible',
    ];

    protected function casts(): array
    {
        return [
            'largeur' => 'integer',
            'hauteur' => 'integer',
            'taille' => 'integer',
            'legible' => 'boolean',
        ];
    }

    public function voiture(): BelongsTo
    {
        return $this->belongsTo(Voiture::class, 'id_voiture');
    }
}
