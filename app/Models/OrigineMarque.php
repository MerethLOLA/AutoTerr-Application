<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class OrigineMarque extends Model
{
    use HasFactory;

    protected $table = 'origines_marques';

    public $timestamps = false;

    protected $fillable = [
        'nom',
        'description',
    ];

    public function voitures(): HasMany
    {
        return $this->hasMany(Voiture::class, 'origine_marque_id');
    }
}
