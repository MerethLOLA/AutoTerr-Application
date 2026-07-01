<?php

namespace App\Jobs;

use App\Events\NouvelleNotification;
use App\Models\Demande;
use App\Models\User;
use App\Notifications\NouvelleDemandeNotification;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Queue\InteractsWithQueue;
use Illuminate\Queue\SerializesModels;

class ProcessDemandeNotificationJob implements ShouldQueue
{
    use Dispatchable, InteractsWithQueue, Queueable, SerializesModels;

    public int $tries = 3;

    public function __construct(public readonly Demande $demande) {}

    public function handle(): void
    {
        $admins = User::query()
            ->whereIn('role', ['admin', 'super_admin', 'commercial'])
            ->where('statut', 'actif')
            ->whereNotNull('email')
            ->get();

        foreach ($admins as $admin) {
            $admin->notify(new NouvelleDemandeNotification($this->demande));
        }

        $labels = [
            'information' => "Demande d'information",
            'reprise'     => 'Demande de reprise',
            'essai'       => "Demande d'essai",
            'achat'       => "Demande d'achat / RDV",
        ];

        NouvelleNotification::dispatch(
            'demande_client',
            'info',
            $labels[$this->demande->type] ?? 'Nouvelle demande client',
            sprintf('%s (%s) a soumis une demande.', $this->demande->nom, $this->demande->email),
            '/demandes',
        );
    }
}
