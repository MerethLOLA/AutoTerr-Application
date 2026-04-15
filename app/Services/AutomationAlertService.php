<?php

namespace App\Services;

use App\Models\Facturation;
use App\Models\Location;
use App\Models\NotificationInterne;
use App\Models\OrdreTravail;
use App\Models\PieceStock;
use App\Models\TicketSav;
use Illuminate\Support\Carbon;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Cache;

class AutomationAlertService
{
    public function syncIfStale(int $seconds = 300): void
    {
        $cacheKey = 'automation_alerts_last_sync_at';
        $lastSync = Cache::get($cacheKey);

        if ($lastSync && now()->diffInSeconds(Carbon::parse($lastSync)) < $seconds) {
            return;
        }

        $this->sync();
        Cache::put($cacheKey, now()->toIso8601String(), now()->addHour());
    }

    public function sync(): Collection
    {
        $alerts = collect()
            ->merge($this->buildUnpaidInvoiceAlerts())
            ->merge($this->buildLowStockAlerts())
            ->merge($this->buildLocationDueAlerts())
            ->merge($this->buildSavAlerts())
            ->merge($this->buildWorkshopAlerts());

        $signatures = $alerts->pluck('signature')->all();

        NotificationInterne::query()
            ->whereIn('type', ['impaye', 'stock_faible', 'echeance_location', 'sav', 'atelier'])
            ->when($signatures !== [], fn ($query) => $query->whereNotIn('signature', $signatures))
            ->delete();

        foreach ($alerts as $alert) {
            NotificationInterne::query()->updateOrCreate(
                ['signature' => $alert['signature']],
                $alert
            );
        }

        return NotificationInterne::query()
            ->latest('declenchee_at')
            ->get();
    }

    public function unread(): Collection
    {
        return NotificationInterne::query()
            ->whereNull('lue_at')
            ->latest('declenchee_at')
            ->limit(8)
            ->get();
    }

    private function buildUnpaidInvoiceAlerts(): Collection
    {
        return Facturation::query()
            ->whereIn('statut', ['impayee', 'partiellement_payee', 'en_retard'])
            ->whereDate('date_echeance', '<=', now()->addDays(3)->toDateString())
            ->with('vente.client')
            ->get()
            ->map(function (Facturation $facture) {
                $client = optional(optional($facture->vente)->client)->nom_complet ?? 'Client';
                $isLate = optional($facture->date_echeance)?->isPast() ?? false;

                return [
                    'type' => 'impaye',
                    'signature' => 'facture-'.$facture->id,
                    'niveau' => $isLate ? 'danger' : 'warning',
                    'titre' => $isLate ? 'Facture en retard' : 'Facture a relancer',
                    'message' => sprintf(
                        '%s - %s, reste %s XOF, echeance %s.',
                        $facture->numero_facture,
                        $client,
                        number_format((float) $facture->reste_a_payer, 0, ',', ' '),
                        optional($facture->date_echeance)?->format('d/m/Y') ?? '-'
                    ),
                    'url' => route('facturations.show', $facture),
                    'declenchee_at' => now(),
                ];
            });
    }

    private function buildLowStockAlerts(): Collection
    {
        return PieceStock::query()
            ->whereColumn('quantite_stock', '<=', 'seuil_alerte')
            ->get()
            ->map(fn (PieceStock $piece) => [
                'type' => 'stock_faible',
                'signature' => 'stock-'.$piece->id,
                'niveau' => 'danger',
                'titre' => 'Stock faible',
                'message' => sprintf(
                    '%s - stock %s, seuil %s.',
                    $piece->designation,
                    number_format((int) $piece->quantite_stock),
                    number_format((int) $piece->seuil_alerte)
                ),
                'url' => route('pieces-stock.show', $piece),
                'declenchee_at' => now(),
            ]);
    }

    private function buildLocationDueAlerts(): Collection
    {
        return Location::query()
            ->whereIn('statut', ['planifiee', 'en_cours'])
            ->whereDate('date_fin', '<=', now()->addDays(2)->toDateString())
            ->with(['client', 'voiture'])
            ->get()
            ->map(function (Location $location) {
                $isLate = optional($location->date_fin)?->isPast() ?? false;

                return [
                    'type' => 'echeance_location',
                    'signature' => 'location-'.$location->id,
                    'niveau' => $isLate ? 'danger' : 'warning',
                    'titre' => $isLate ? 'Location en retard' : 'Echeance location proche',
                    'message' => sprintf(
                        '%s - %s, fin prevue le %s.',
                        $location->reference_location,
                        trim(($location->voiture->marque ?? '').' '.($location->voiture->modele ?? '')) ?: 'Vehicule',
                        optional($location->date_fin)?->format('d/m/Y') ?? '-'
                    ),
                    'url' => route('locations.show', $location),
                    'declenchee_at' => now(),
                ];
            });
    }

    private function buildSavAlerts(): Collection
    {
        return TicketSav::query()
            ->whereIn('statut', ['ouvert', 'en_cours'])
            ->withCount('interventions')
            ->get()
            ->filter(fn (TicketSav $ticket) => $ticket->priorite === 'urgente' || $ticket->interventions_count === 0)
            ->map(function (TicketSav $ticket) {
                $isUrgent = $ticket->priorite === 'urgente';

                return [
                    'type' => 'sav',
                    'signature' => 'sav-'.$ticket->id,
                    'niveau' => $isUrgent ? 'danger' : 'warning',
                    'titre' => $isUrgent ? 'Ticket SAV urgent' : 'Ticket SAV sans intervention',
                    'message' => sprintf(
                        '%s - %s.',
                        $ticket->reference_ticket,
                        $isUrgent ? $ticket->objet : 'aucune intervention enregistree'
                    ),
                    'url' => route('tickets-sav.show', $ticket),
                    'declenchee_at' => now(),
                ];
            });
    }

    private function buildWorkshopAlerts(): Collection
    {
        return OrdreTravail::query()
            ->whereIn('statut', ['ouvert', 'en_cours'])
            ->withCount('taches')
            ->get()
            ->filter(function (OrdreTravail $ordre) {
                $late = $ordre->deadline && $ordre->deadline->isPast();

                return $late || $ordre->taches_count === 0;
            })
            ->map(function (OrdreTravail $ordre) {
                $late = $ordre->deadline && $ordre->deadline->isPast();

                return [
                    'type' => 'atelier',
                    'signature' => 'atelier-'.$ordre->id,
                    'niveau' => $late ? 'danger' : 'warning',
                    'titre' => $late ? 'Ordre atelier en retard' : 'Ordre atelier sans tache',
                    'message' => sprintf(
                        '%s - %s.',
                        $ordre->reference_ot,
                        $late ? 'echeance depassee' : 'aucune tache planifiee'
                    ),
                    'url' => route('ordres-travail.show', $ordre),
                    'declenchee_at' => now(),
                ];
            });
    }
}
