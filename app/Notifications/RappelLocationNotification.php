<?php

namespace App\Notifications;

use App\Models\Location;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RappelLocationNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly Location $location) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $voiture  = $this->location->voiture;
        $label    = trim(($voiture?->marque ?? '') . ' ' . ($voiture?->modele ?? '')) ?: 'Véhicule';
        $dateFin  = optional($this->location->date_fin)?->format('d/m/Y') ?? '-';
        $isLate   = optional($this->location->date_fin)?->isPast() ?? false;

        $subject = $isLate
            ? "⚠️ Location {$this->location->reference_location} — retour en retard"
            : "Rappel : votre location arrive à échéance le {$dateFin}";

        return (new MailMessage)
            ->subject($subject)
            ->greeting("Bonjour {$notifiable->name},")
            ->line($isLate
                ? "La location **{$this->location->reference_location}** ({$label}) était prévue pour le retour le **{$dateFin}**. Le véhicule n'a pas encore été restitué."
                : "Votre location **{$this->location->reference_location}** ({$label}) arrive à échéance le **{$dateFin}**."
            )
            ->line("Merci de procéder au retour du véhicule dans les délais convenus ou de contacter notre équipe pour tout arrangement.")
            ->action('Voir ma location', url('/espace-client'))
            ->line("L'équipe AutoTerr reste disponible pour toute question.");
    }
}
