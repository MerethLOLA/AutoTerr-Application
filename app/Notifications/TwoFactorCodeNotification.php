<?php

namespace App\Notifications;

use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

// Volontairement pas ShouldQueue : le code doit partir immédiatement dans le
// cycle de la requête de connexion (aucun worker de file n'est déployé en prod).
class TwoFactorCodeNotification extends Notification
{
    public function __construct(public readonly string $code) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject("Votre code de connexion AutoTerr : {$this->code}")
            ->greeting("Bonjour {$notifiable->name},")
            ->line('Voici votre code de vérification pour terminer la connexion à votre compte AutoTerr :')
            ->line("## {$this->code}")
            ->line('Ce code expire dans 10 minutes.')
            ->line("Si vous n'êtes pas à l'origine de cette tentative de connexion, ignorez cet e-mail et changez votre mot de passe par précaution.");
    }
}
