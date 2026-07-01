<?php

namespace App\Notifications;

use App\Models\Demande;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NouvelleDemandeNotification extends Notification implements ShouldQueue
{
    use Queueable;

    private const LABELS = [
        'information' => "Demande d'information",
        'reprise'     => 'Demande de reprise',
        'essai'       => "Demande d'essai",
        'achat'       => "Demande d'achat / RDV",
    ];

    public function __construct(public readonly Demande $demande) {}

    public function via(object $notifiable): array
    {
        return ['mail', 'database'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $label = self::LABELS[$this->demande->type] ?? 'Nouvelle demande';

        return (new MailMessage)
            ->subject("🔔 {$label} reçue — AutoTerr")
            ->greeting("Bonjour {$notifiable->name},")
            ->line("Une nouvelle demande client vient d'être soumise sur le site.")
            ->line("**Client :** {$this->demande->nom} ({$this->demande->email})")
            ->line("**Type :** {$label}")
            ->when($this->demande->message, fn ($mail) => $mail->line("**Message :** {$this->demande->message}"))
            ->action('Voir la demande', url('/demandes'))
            ->line('Traitez-la rapidement pour garantir une bonne expérience client.');
    }

    public function toDatabase(object $notifiable): array
    {
        return [
            'type'    => 'demande_client',
            'titre'   => self::LABELS[$this->demande->type] ?? 'Nouvelle demande',
            'message' => sprintf('%s (%s) a soumis une demande.', $this->demande->nom, $this->demande->email),
            'url'     => '/demandes',
        ];
    }
}
