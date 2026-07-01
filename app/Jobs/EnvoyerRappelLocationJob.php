<?php

namespace App\Jobs;

use App\Events\NouvelleNotification;
use App\Models\Location;
use App\Notifications\RappelLocationNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class EnvoyerRappelLocationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    public function __construct(public readonly Location $location) {}

    public function handle(): void
    {
        $location = $this->location->load(['client', 'voiture']);
        $client   = $location->client;

        if (! $client || ! $client->email) {
            return;
        }

        $client->notify(new RappelLocationNotification($location));

        NouvelleNotification::dispatch(
            'echeance_location',
            'warning',
            'Rappel location envoyé',
            sprintf('Email de rappel envoyé à %s pour la location %s.', $client->email, $location->reference_location),
            '/locations/' . $location->id,
        );
    }
}
