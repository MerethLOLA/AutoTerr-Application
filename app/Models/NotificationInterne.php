<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NotificationInterne extends Model
{
    use HasFactory;

    protected $table = 'notifications_internes';

    protected $fillable = [
        'type',
        'signature',
        'niveau',
        'titre',
        'message',
        'url',
        'declenchee_at',
        'lue_at',
    ];

    protected function casts(): array
    {
        return [
            'declenchee_at' => 'datetime',
            'lue_at' => 'datetime',
        ];
    }
}
