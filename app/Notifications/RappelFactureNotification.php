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
        $joursRetard = $isLate ? (int) optional($this->facture->date_echeance)?->diffInDays(now()) : 0;
        $isUrgent  = $isLate && $joursRetard >= 2;
        $montant   = number_format((float) $this->facture->reste_a_payer, 0, ',', ' ') . ' XOF';

        $subject = match (true) {
            $isUrgent => "🚨 Facture {$this->facture->numero_facture} — {$joursRetard} jours de retard, régularisation urgente",
            $isLate   => "⚠️ Facture {$this->facture->numero_facture} — paiement en retard",
            default   => "Rappel : facture {$this->facture->numero_facture} à régler avant le {$echeance}",
        };

        $message = (new MailMessage)->subject($subject)->greeting("Bonjour {$notifiable->nom_complet},");

        if ($isUrgent) {
            $message->line("La facture **{$this->facture->numero_facture}** (montant restant : **{$montant}**) est impayée depuis **{$joursRetard} jours** (échéance dépassée le **{$echeance}**).")
                ->line("Merci de régulariser votre situation dans les plus brefs délais afin d'éviter toute suspension de service.");
        } elseif ($isLate) {
            $message->line("La facture **{$this->facture->numero_facture}** (montant restant : **{$montant}**) était échue le **{$echeance}**. Elle n'a pas encore été intégralement réglée.")
                ->line("Pour éviter tout frais de retard, nous vous invitons à procéder au règlement dans les meilleurs délais.");
        } else {
            $message->line("La facture **{$this->facture->numero_facture}** (montant restant : **{$montant}**) arrive à échéance le **{$echeance}**.")
                ->line("Pour éviter tout frais de retard, nous vous invitons à procéder au règlement dans les meilleurs délais.");
        }

        return $message->action('Voir ma facture', url('/espace-client'))
            ->line("Merci de votre confiance — l'équipe AutoTerr.");
    }
}
