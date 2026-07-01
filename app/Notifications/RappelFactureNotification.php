<?php

namespace App\Notifications;

use App\Models\Facturation;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class RappelFactureNotification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(public readonly Facturation $facture) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $echeance  = optional($this->facture->date_echeance)?->format('d/m/Y') ?? '-';
        $isLate    = optional($this->facture->date_echeance)?->isPast() ?? false;
        $montant   = number_format((float) $this->facture->reste_a_payer, 0, ',', ' ') . ' XOF';

        $subject = $isLate
            ? "⚠️ Facture {$this->facture->numero_facture} — paiement en retard"
            : "Rappel : facture {$this->facture->numero_facture} à régler avant le {$echeance}";

        return (new MailMessage)
            ->subject($subject)
            ->greeting("Bonjour {$notifiable->name},")
            ->line($isLate
                ? "La facture **{$this->facture->numero_facture}** (montant restant : **{$montant}**) était échue le **{$echeance}**. Elle n'a pas encore été intégralement réglée."
                : "La facture **{$this->facture->numero_facture}** (montant restant : **{$montant}**) arrive à échéance le **{$echeance}**."
            )
            ->line("Pour éviter tout frais de retard, nous vous invitons à procéder au règlement dans les meilleurs délais.")
            ->action('Voir ma facture', url('/espace-client'))
            ->line("Merci de votre confiance — l'équipe AutoTerr.");
    }
}
