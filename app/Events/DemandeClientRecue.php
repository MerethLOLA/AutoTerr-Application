<?php

namespace App\Events;

use App\Models\Demande;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DemandeClientRecue implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(public readonly Demande $demande) {}

    public function broadcastOn(): Channel
    {
        return new Channel('autoterr-notifications');
    }

    public function broadcastAs(): string
    {
        return 'NouvelleNotification';
    }

    public function broadcastWith(): array
    {
        $labels = [
            'information' => "Demande d'information",
            'reprise'     => 'Demande de reprise',
            'essai'       => "Demande d'essai",
            'achat'       => "Demande d'achat / RDV",
        ];

        return [
            'type'    => 'demande_client',
            'niveau'  => 'info',
            'titre'   => $labels[$this->demande->type] ?? 'Nouvelle demande client',
            'message' => sprintf('%s (%s) a envoyé une demande.', $this->demande->nom, $this->demande->email),
            'url'     => '/demandes',
            'ts'      => now()->toIso8601String(),
        ];
    }
}
