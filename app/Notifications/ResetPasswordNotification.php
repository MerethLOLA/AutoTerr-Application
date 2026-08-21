<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

// Volontairement pas ShouldQueue : aucun worker de file n'est déployé en prod.
class ResetPasswordNotification extends Notification
{
    public function __construct(public readonly string $resetUrl) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Réinitialisation de votre mot de passe AutoTerr')
            ->greeting("Bonjour {$notifiable->name},")
            ->line("Vous recevez cet e-mail car une demande de réinitialisation de mot de passe a été effectuée pour votre compte.")
            ->action('Réinitialiser le mot de passe', $this->resetUrl)
            ->line('Ce lien expire dans 60 minutes.')
            ->line("Si vous n'êtes pas à l'origine de cette demande, aucune action n'est requise.");
    }
}
