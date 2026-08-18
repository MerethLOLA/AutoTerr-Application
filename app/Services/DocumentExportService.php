<?php

namespace App\Services;

use App\Models\Assurance;
use App\Models\Employe;
use App\Models\Entretien;
use App\Models\Facturation;
use App\Models\Garantie;
use App\Models\Location;
use App\Models\Paiement;
use App\Models\Sinistre;
use App\Models\Vente;
use Barryvdh\DomPDF\Facade\Pdf;
use Symfony\Component\HttpFoundation\Response;

class DocumentExportService
{
    private const ENTREPRISE = [
        'nom' => 'AutoTerr Auto Services',
        'adresse' => 'Route de la Corniche Ouest, Dakar, Sénégal',
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
        $paiement->loadMissing(['client', 'vente.voiture', 'location.voiture', 'facturation']);

        $voiture = $paiement->vente?->voiture ?? $paiement->location?->voiture;
        $objet = $paiement->vente
            ? 'Vente '.$paiement->vente->reference_vente
            : ($paiement->location ? 'Location '.$paiement->location->reference_location : null);

        return Pdf::loadView('pdf.recu_paiement', [
            'entreprise' => self::ENTREPRISE,
            'client' => $paiement->client,
            'paiement' => $paiement,
            'reference' => 'REC-'.str_pad((string) $paiement->id, 6, '0', STR_PAD_LEFT),
            'resteAPayer' => max((float) ($paiement->facturation?->reste_a_payer ?? 0), 0),
            'rows' => array_filter([
                'Concerne' => $objet,
                'Véhicule' => $voiture ? trim($voiture->marque.' '.$voiture->modele) : null,
                'Facture réglée' => $paiement->facturation?->numero_facture,
                'Mode de paiement' => ucfirst(str_replace('_', ' ', $paiement->mode_paiement)),
                'Référence / banque' => trim(($paiement->reference_paiement ?? '').($paiement->banque ? ' · '.$paiement->banque : '')) ?: null,
            ], fn ($v) => $v !== null && $v !== ''),
        ])->setPaper('a4')->download("recu-{$paiement->id}.pdf");
    }

    public function location(Location $location): Response
    {
        $location->loadMissing(['client', 'voiture']);

        return Pdf::loadView('pdf.document', [
            'title' => 'Contrat de location',
            'entreprise' => self::ENTREPRISE,
            'reference' => $location->reference_location,
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
            'reference' => 'GAR-'.str_pad((string) $garantie->id, 6, '0', STR_PAD_LEFT),
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
            'reference' => $assurance->numero_police ?? ('ASS-'.str_pad((string) $assurance->id, 6, '0', STR_PAD_LEFT)),
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
            'reference' => $sinistre->numero_declaration ?? ('SIN-'.str_pad((string) $sinistre->id, 6, '0', STR_PAD_LEFT)),
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
            'reference' => 'ENT-'.str_pad((string) $entretien->id, 6, '0', STR_PAD_LEFT),
            'rows' => [
                'Type entretien' => $entretien->type_entretien,
                'Vehicule' => $vehicule,
                'Technicien' => $entretien->technicien ? trim(($entretien->technicien->nom ?? '').' '.($entretien->technicien->prenom ?? '')) : '-',
                'Date prevue' => optional($entretien->date_prevue)->format('d/m/Y') ?? '-',
                'Date realise' => optional($entretien->date_realise)->format('d/m/Y') ?? '-',
                'Kilometrage prevu' => $entretien->kilometrage_prevu ? number_format($entretien->kilometrage_prevu, 0, ',', ' ').' km' : '-',
                'Kilometrage realise' => $entretien->kilometrage_realise ? number_format($entretien->kilometrage_realise, 0, ',', ' ').' km' : '-',
                'Statut' => $entretien->statut,
                'Notes' => $entretien->notes ?? '-',
            ],
        ])->download("entretien-{$entretien->id}.pdf");
    }

    public function fichePaie(Employe $employe): Response
    {
        // Paie du mois qui vient de se terminer (et non le mois en cours, encore incomplet).
        $periode = now()->subMonthNoOverflow();

        $totalVentes = (float) Vente::query()
            ->where('id_employe', $employe->id)
            ->whereMonth('date_vente', $periode->month)
            ->whereYear('date_vente', $periode->year)
            ->sum('prix_final');

        $totalLocations = (float) Facturation::query()
            ->whereNotNull('id_location')
            ->whereHas('location', fn ($q) => $q->where('id_agent', $employe->id))
            ->whereMonth('date_facture', $periode->month)
            ->whereYear('date_facture', $periode->year)
            ->sum('montant_ttc');

        $totalActivite = $totalVentes + $totalLocations;
        $tauxCommission = (float) ($employe->taux_commission ?? 0);
        $commission = round($totalActivite * ($tauxCommission / 100));
        $salaireFixe = (float) ($employe->salaire ?? 0);

        return Pdf::loadView('pdf.fiche_paie', [
            'entreprise' => self::ENTREPRISE,
            'employe' => $employe,
            'reference' => 'PAIE-'.$employe->id.'-'.$periode->format('Ym'),
            'periode' => ucfirst($periode->locale('fr')->translatedFormat('F Y')),
            'totalActivite' => $totalActivite,
            'tauxCommission' => $tauxCommission,
            'commission' => $commission,
            'salaireFixe' => $salaireFixe,
        ])->setPaper('a4')->download('fiche-paie-'.$employe->id.'-'.$periode->format('Ym').'.pdf');
    }
}
