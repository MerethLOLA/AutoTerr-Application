<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Employe;
use App\Models\Facturation;
use App\Models\Location;
use App\Models\OrdreTravail;
use App\Models\Paiement;
use App\Models\PieceStock;
use App\Models\TicketSav;
use App\Models\User;
use App\Models\Vente;
use App\Models\Voiture;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ReportingTest extends TestCase
{
    use RefreshDatabase;

    public function test_employee_can_open_reporting_dashboard(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $client = Client::query()->create([
            'nom' => 'Ba',
            'prenom' => 'Awa',
            'telephone' => '770000040',
        ]);
        $employe = Employe::query()->create([
            'nom' => 'Ndiaye',
            'prenom' => 'Moussa',
            'poste' => 'Commercial',
        ]);
        $voiture = Voiture::query()->create([
            'marque' => 'Toyota',
            'modele' => 'Prado',
            'prix' => 25000000,
            'numero_chassis' => 'RPT-100',
            'statut' => 'loue',
        ]);
        $vente = Vente::query()->create([
            'reference_vente' => 'RPT-VTE-1',
            'date_vente' => now(),
            'id_client' => $client->id,
            'id_voiture' => $voiture->id,
            'prix_final' => 24000000,
            'mode_paiement' => 'Wave',
            'statut' => 'finalisee',
            'id_employe' => $employe->id,
        ]);
        $facture = Facturation::query()->create([
            'numero_facture' => 'RPT-FAC-1',
            'date_facture' => now(),
            'date_echeance' => now()->addDays(2),
            'montant' => 24000000,
            'montant_ht' => 24000000,
            'montant_ttc' => 28320000,
            'statut' => 'impayee',
            'id_vente' => $vente->id,
        ]);
        Paiement::query()->create([
            'date' => now(),
            'mode_paiement' => 'Wave',
            'montant' => 5000000,
            'reste' => 23320000,
            'id_facture' => $facture->id,
            'id_vente' => $vente->id,
            'id_client' => $client->id,
        ]);
        Location::query()->create([
            'reference_location' => 'RPT-LOC-1',
            'id_client' => $client->id,
            'id_voiture' => $voiture->id,
            'date_debut' => now()->subDay(),
            'date_fin' => now()->addDay(),
            'tarif_journalier' => 50000,
            'statut' => 'en_cours',
        ]);
        TicketSav::query()->create([
            'reference_ticket' => 'RPT-SAV-1',
            'id_client' => $client->id,
            'id_voiture' => $voiture->id,
            'id_responsable' => $employe->id,
            'objet' => 'Controle climatisation',
            'statut' => 'ouvert',
            'priorite' => 'normale',
        ]);
        OrdreTravail::query()->create([
            'reference_ot' => 'RPT-OT-1',
            'id_voiture' => $voiture->id,
            'description' => 'Revision avant livraison',
            'statut' => 'ouvert',
        ]);
        PieceStock::query()->create([
            'reference' => 'RPT-P-1',
            'designation' => 'Batterie',
            'prix_unitaire' => 65000,
            'quantite_stock' => 1,
            'seuil_alerte' => 2,
            'statut' => 'actif',
        ]);

        $response = $this->actingAs($user)->get(route('reporting.index'));

        $response->assertOk()
            ->assertSee('Reporting d exploitation')
            ->assertSee('Statistiques ventes detaillees')
            ->assertSee('Etat du stock');
    }

    public function test_employee_can_export_reporting_csv(): void
    {
        $user = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($user)->get(route('reporting.export'));

        $response->assertOk();
        $response->assertHeader('content-type', 'text/csv; charset=UTF-8');
        $this->assertStringContainsString('Bloc;Indicateur;Valeur', $response->streamedContent());
    }
}
