<?php

namespace App\Events;

use App\Models\Facturation;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class FactureEcheanceProche
{
    use Dispatchable, SerializesModels;

    public function __construct(public readonly Facturation $facture) {}
}
