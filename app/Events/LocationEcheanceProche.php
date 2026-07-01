<?php

namespace App\Events;

use App\Models\Location;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class LocationEcheanceProche
{
    use Dispatchable, SerializesModels;

    public function __construct(public readonly Location $location) {}
}
