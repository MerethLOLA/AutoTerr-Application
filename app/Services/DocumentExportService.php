<?php

namespace App\Services;

use App\Models\Assurance;
use App\Models\Entretien;
use App\Models\Facturation;
use App\Models\Garantie;
use App\Models\Location;
use App\Models\Paiement;
use App\Models\Sinistre;
use Barryvdh\DomPDF\Facade\Pdf;
use Symfony\Component\HttpFoundation\Response;

class DocumentExportService
{
    private const ENTREPRISE = [
        'nom' => 'AutoTerr Auto Services',
        'adresse' => 'Dakar, Senegal',
        'ninea' => 'SN-DKR-2026-001',
        'rccm' => 'RCCM-SN-DKR-2026-A-001',
    ];

    public function facture(Facturation $facturation): Response
    {
        $facturation->loadMissing(['vente.client', 'vente.voiture', 'vente.employe', 'paiements']);

        return Pdf::loadView('pdf.facture', [
            'facture' => $facturation,
        ])->setPaper('a4')->download("facture-{$facturation->numero_facture}.pdf");
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

    public function assurance(Assurance $assurance): Response
    {
        $assurance->loadMissing(['voiture', 'gestionnaire']);

        $vehicule = trim(($assurance->voiture?->marque ?? '').' '.($assurance->voiture?->modele ?? ''));

        return Pdf::loadView('pdf.document', [
            'title' => 'Attestation d\'assurance',
            'entreprise' => self::ENTREPRISE,
            'rows' => [
                'Compagnie' => $assurance->compagnie,
                'Numero police' => $assurance->numero_police ?? '-',
                'Type assurance' => $assurance->type_assurance,
                'Vehicule' => $vehicule,
                'Date debut' => optional($assurance->date_debut)->format('d/m/Y'),
                'Date fin' => optional($assurance->date_fin)->format('d/m/Y'),
                'Prime' => $assurance->montant_prime ? number_format($assurance->montant_prime, 0, ',', ' ').' XOF' : '-',
                'Statut' => $assurance->statut,
                'Gestionnaire' => $assurance->gestionnaire ? trim(($assurance->gestionnaire->nom ?? '').' '.($assurance->gestionnaire->prenom ?? '')) : '-',
            ],
        ])->download("assurance-{$assurance->id}.pdf");
    }

    public function sinistre(Sinistre $sinistre): Response
    {
        $sinistre->loadMissing(['voiture', 'client', 'assurance']);

        $vehicule = trim(($sinistre->voiture?->marque ?? '').' '.($sinistre->voiture?->modele ?? ''));

        return Pdf::loadView('pdf.document', [
            'title' => 'Declaration de sinistre',
            'entreprise' => self::ENTREPRISE,
            'rows' => [
                'Numero declaration' => $sinistre->numero_declaration ?? '-',
                'Type sinistre' => $sinistre->type_sinistre,
                'Date sinistre' => optional($sinistre->date_sinistre)->format('d/m/Y'),
                'Vehicule' => $vehicule,
                'Client' => $sinistre->client ? trim(($sinistre->client->nom ?? '').' '.($sinistre->client->prenom ?? '')) : '-',
                'Assurance' => $sinistre->assurance ? $sinistre->assurance->compagnie.' ('.$sinistre->assurance->numero_police.')' : '-',
                'Montant dommages' => $sinistre->montant_dommages ? number_format($sinistre->montant_dommages, 0, ',', ' ').' XOF' : '-',
                'Statut' => $sinistre->statut,
                'Description' => $sinistre->description,
            ],
        ])->download("sinistre-{$sinistre->id}.pdf");
    }

    public function entretien(Entretien $entretien): Response
    {
        $entretien->loadMissing(['voiture', 'technicien']);

        $vehicule = trim(($entretien->voiture?->marque ?? '').' '.($entretien->voiture?->modele ?? ''));

        return Pdf::loadView('pdf.document', [
            'title' => 'Fiche d\'entretien',
            'entreprise' => self::ENTREPRISE,
            'rows' => [
                'Type entretien' => $entretien->type_entretien,
                'Vehicule' => $vehicule,
                'Technicien' => $entretien->technicien ? trim(($entretien->technicien->nom ?? '').' '.($entretien->technicien->prenom ?? '')) : '-',
                'Date prevue' => optional($entretien->date_prevue)->format('d/m/Y') ?? '-',
                'Date realise' => optional($entretien->date_realise)->format('d/m/Y') ?? '-',
                'Kilometrage prevu' => $entretien->kilometrage_prevu ? number_format($entretien->kilometrage_prevu, 0, ',', ' ').' km' : '-',
                'Kilometrage realise' => $entretien->kilometrage_realise ? number_format($entretien->kilometrage_realise, 0, ',', ' ').' km' : '-',
                'Cout' => $entretien->cout ? number_format($entretien->cout, 0, ',', ' ').' XOF' : '-',
                'Statut' => $entretien->statut,
                'Notes' => $entretien->notes ?? '-',
            ],
        ])->download("entretien-{$entretien->id}.pdf");
    }
}
