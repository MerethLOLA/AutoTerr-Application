<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NouvelleNotification implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public readonly string  $type,
        public readonly string  $niveau,
        public readonly string  $titre,
        public readonly string  $message,
        public readonly ?string $url = null,
    ) {}

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
        return [
            'type'    => $this->type,
            'niveau'  => $this->niveau,
            'titre'   => $this->titre,
            'message' => $this->message,
            'url'     => $this->url,
            'ts'      => now()->toIso8601String(),
        ];
    }
}
