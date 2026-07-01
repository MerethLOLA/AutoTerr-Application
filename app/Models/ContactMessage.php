<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ContactMessage extends Model
{
    protected $fillable = ['nom', 'telephone', 'email', 'message', 'lu'];

    protected $casts = ['lu' => 'boolean'];
}
