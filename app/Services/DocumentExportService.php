<?php

namespace App\Services;

use App\Models\Facturation;
use App\Models\Garantie;
use App\Models\Location;
use App\Models\Paiement;
use Barryvdh\DomPDF\Facade\Pdf;
use Symfony\Component\HttpFoundation\Response;

class DocumentExportService
{
    private const ENTREPRISE = [
        'nom' => 'SunuPark Auto Services',
        'adresse' => 'Dakar, Senegal',
        'ninea' => 'SN-DKR-2026-001',
        'rccm' => 'RCCM-SN-DKR-2026-A-001',
    ];

    public function facture(Facturation $facturation): Response
    {
        $facturation->loadMissing(['vente.client', 'vente.voiture', 'paiements']);

        return Pdf::loadView('pdf.document', [
            'title' => 'Facture',
            'entreprise' => self::ENTREPRISE,
            'rows' => [
                'Numero facture' => $facturation->numero_facture,
                'Date facture' => optional($facturation->date_facture)->format('Y-m-d'),
                'Client' => $facturation->vente?->client?->nom_complet,
                'Vehicule' => trim(($facturation->vente?->voiture?->marque ?? '').' '.($facturation->vente?->voiture?->modele ?? '')),
                'Reference vente' => $facturation->vente?->reference_vente,
                'Montant HT' => $facturation->montant_ht.' XOF',
                'TVA' => $facturation->taux_tva.' %',
                'Montant TTC' => $facturation->montant_ttc.' XOF',
                'Montant paye' => number_format($facturation->montant_paye, 0, ',', ' ').' XOF',
                'Reste a payer' => number_format(max($facturation->reste_a_payer, 0), 0, ',', ' ').' XOF',
                'Date echeance' => optional($facturation->date_echeance)->format('Y-m-d'),
                'Statut' => $facturation->statut,
            ],
        ])->download("facture-{$facturation->numero_facture}.pdf");
    }

    public function paiement(Paiement $paiement): Response
    {
        $paiement->loadMissing(['client', 'vente', 'facturation']);

        return Pdf::loadView('pdf.document', [
            'title' => 'Recu de paiement',
            'entreprise' => self::ENTREPRISE,
            'rows' => [
                'Client' => $paiement->client?->nom_complet,
                'Date' => optional($paiement->date)->format('Y-m-d'),
                'Mode de paiement' => $paiement->mode_paiement,
                'Montant' => $paiement->montant.' XOF',
                'Reste' => $paiement->reste.' XOF',
                'Reference vente' => $paiement->vente?->reference_vente,
                'Facture' => $paiement->facturation?->numero_facture,
            ],
        ])->download("paiement-{$paiement->id}.pdf");
    }

    public function location(Location $location): Response
    {
        $location->loadMissing(['client', 'voiture']);

        return Pdf::loadView('pdf.document', [
            'title' => 'Contrat de location',
            'entreprise' => self::ENTREPRISE,
            'rows' => [
                'Reference' => $location->reference_location,
                'Client' => $location->client?->nom_complet,
                'Vehicule' => trim(($location->voiture?->marque ?? '').' '.($location->voiture?->modele ?? '')),
                'Date debut' => optional($location->date_debut)->format('Y-m-d H:i'),
                'Date fin' => optional($location->date_fin)->format('Y-m-d H:i'),
                'Tarif journalier' => $location->tarif_journalier.' XOF',
                'Caution' => $location->caution.' XOF',
                'Statut' => $location->statut,
            ],
        ])->download("location-{$location->reference_location}.pdf");
    }

    public function garantie(Garantie $garantie): Response
    {
        $garantie->loadMissing('voiture');

        return Pdf::loadView('pdf.document', [
            'title' => 'Certificat de garantie',
            'entreprise' => self::ENTREPRISE,
            'rows' => [
                'Vehicule' => trim(($garantie->voiture?->marque ?? '').' '.($garantie->voiture?->modele ?? '')),
                'Type garantie' => $garantie->type_garantie,
                'Duree' => $garantie->duree_garantie.' mois',
                'Date debut' => optional($garantie->date_debut)->format('Y-m-d'),
                'Date fin' => optional($garantie->date_fin)->format('Y-m-d'),
            ],
        ])->download("garantie-{$garantie->id}.pdf");
    }
}
