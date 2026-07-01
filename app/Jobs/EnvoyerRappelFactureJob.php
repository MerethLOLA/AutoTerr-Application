<?php

namespace App\Jobs;

use App\Events\NouvelleNotification;
use App\Models\Facturation;
use App\Notifications\RappelFactureNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class EnvoyerRappelFactureJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;
    public int $backoff = 60;

    public function __construct(public readonly Facturation $facture) {}

    public function handle(): void
    {
        $facture = $this->facture->load(['vente.client']);
        $client  = optional($facture->vente)->client;

        if (! $client || ! $client->email) {
            return;
        }

        $client->notify(new RappelFactureNotification($facture));

        NouvelleNotification::dispatch(
            'impaye',
            optional($facture->date_echeance)?->isPast() ? 'danger' : 'warning',
            'Rappel facture envoyé',
            sprintf('Email de rappel envoyé à %s pour la facture %s.', $client->email, $facture->numero_facture),
            '/facturations/' . $facture->id,
        );
    }
}
