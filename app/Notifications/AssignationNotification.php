<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class AssignationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    /**
     * @param  array<int, string>  $details
     */
    public function __construct(
        public readonly string $sujet,
        public readonly string $intro,
        public readonly array $details = [],
        public readonly ?string $actionUrl = null,
        public readonly string $actionLabel = 'Voir dans AutoTerr',
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $message = (new MailMessage)
            ->subject($this->sujet)
            ->greeting("Bonjour {$notifiable->prenom} {$notifiable->nom},")
            ->line($this->intro);

        foreach ($this->details as $ligne) {
            $message->line($ligne);
        }

        if ($this->actionUrl) {
            $message->action($this->actionLabel, $this->actionUrl);
        }

        return $message->line("— L'équipe AutoTerr.");
    }
}
