<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Employe;
use App\Models\Facturation;
use App\Models\Paiement;
use App\Models\User;
use App\Models\Vente;
use App\Models\Voiture;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CommercialWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(VerifyCsrfToken::class);
        $this->withoutMiddleware(ValidateCsrfToken::class);
    }

    public function test_creating_a_sale_generates_an_invoice_and_updates_vehicle_status(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $employe = Employe::query()->create([
            'nom' => 'Ndiaye',
            'prenom' => 'Awa',
            'poste' => 'Vendeur',
        ]);
        $client = Client::query()->create([
            'nom' => 'Diallo',
            'prenom' => 'Moussa',
            'telephone' => '770000000',
        ]);
        $voiture = Voiture::query()->create([
            'marque' => 'Toyota',
            'modele' => 'Corolla',
            'prix' => 10000000,
            'numero_chassis' => 'CHS-100',
            'statut' => 'disponible',
        ]);

        $response = $this->actingAs($user)->post(route('ventes.store'), [
            'date_vente' => '2026-04-01',
            'id_client' => $client->id,
            'id_voiture' => $voiture->id,
            'prix_final' => 9000000,
            'mode_paiement' => 'Wave',
            'statut' => 'finalisee',
            'id_employe' => $employe->id,
            'observations' => 'Vente test',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseCount('ventes', 1);
        $this->assertDatabaseCount('facturations', 1);
        $this->assertDatabaseHas('voitures', [
            'id' => $voiture->id,
            'statut' => 'vendu',
        ]);

        $vente = Vente::query()->first();
        $facture = Facturation::query()->first();

        $this->assertSame($vente->id, $facture->id_vente);
        $this->assertSame('impayee', $facture->statut);
        $this->assertEquals(9000000, (float) $facture->montant);
        $this->assertEquals(9000000, (float) $facture->montant_ht);
        $this->assertEquals(10620000, (float) $facture->montant_ttc);
        $this->assertStringStartsWith('FAC-'.now()->format('Ymd').'-', $facture->numero_facture);
    }

    public function test_sale_is_rejected_when_vehicle_is_not_available(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $employe = Employe::query()->create([
            'nom' => 'Fall',
            'prenom' => 'Cheikh',
            'poste' => 'Vendeur',
        ]);
        $client = Client::query()->create([
            'nom' => 'Ba',
            'prenom' => 'Aminata',
            'telephone' => '780000000',
        ]);
        $voiture = Voiture::query()->create([
            'marque' => 'Hyundai',
            'modele' => 'i10',
            'prix' => 5000000,
            'numero_chassis' => 'CHS-200',
            'statut' => 'vendu',
        ]);

        $response = $this->actingAs($user)->post(route('ventes.store'), [
            'date_vente' => '2026-04-01',
            'id_client' => $client->id,
            'id_voiture' => $voiture->id,
            'prix_final' => 4800000,
            'mode_paiement' => 'Especes',
            'statut' => 'finalisee',
            'id_employe' => $employe->id,
        ]);

        $response->assertStatus(422);
        $this->assertDatabaseCount('ventes', 0);
        $this->assertDatabaseCount('facturations', 0);
    }

    public function test_payment_updates_invoice_balance_and_status(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $employe = Employe::query()->create([
            'nom' => 'Sarr',
            'prenom' => 'Mame',
            'poste' => 'Vendeur',
        ]);
        $client = Client::query()->create([
            'nom' => 'Seck',
            'prenom' => 'Alioune',
            'telephone' => '760000000',
        ]);
        $voiture = Voiture::query()->create([
            'marque' => 'Kia',
            'modele' => 'Sportage',
            'prix' => 15000000,
            'numero_chassis' => 'CHS-300',
            'statut' => 'disponible',
        ]);
        $vente = Vente::query()->create([
            'reference_vente' => 'VTE-TEST',
            'date_vente' => '2026-04-01',
            'id_client' => $client->id,
            'id_voiture' => $voiture->id,
            'prix_final' => 12000000,
            'mode_paiement' => 'Virement bancaire',
            'statut' => 'finalisee',
            'id_employe' => $employe->id,
        ]);
        $facture = Facturation::query()->create([
            'numero_facture' => 'FAC-TEST',
            'date_facture' => '2026-04-01',
            'montant' => 12000000,
            'remise' => 0,
            'montant_ht' => 12000000,
            'taux_tva' => 18,
            'montant_ttc' => 14160000,
            'statut' => 'impayee',
            'date_echeance' => now()->addDays(7)->toDateString(),
            'id_vente' => $vente->id,
        ]);

        $firstPayment = $this->actingAs($user)->post(route('paiements.store'), [
            'date' => '2026-04-02',
            'mode_paiement' => 'Wave',
            'montant' => 5000000,
            'id_facture' => $facture->id,
        ]);

        $firstPayment->assertRedirect();
        $facture->refresh();
        $this->assertSame('partiellement_payee', $facture->statut);

        $paiement = Paiement::query()->latest('id')->first();
        $this->assertEquals(9160000, (float) $paiement->reste);

        $secondPayment = $this->actingAs($user)->post(route('paiements.store'), [
            'date' => '2026-04-03',
            'mode_paiement' => 'Virement bancaire',
            'montant' => 9160000,
            'id_facture' => $facture->id,
        ]);

        $secondPayment->assertRedirect();
        $facture->refresh();
        $this->assertSame('payee', $facture->statut);
        $this->assertEquals(14160000, (float) $facture->montant_paye);
        $this->assertEquals(0, (float) $facture->reste_a_payer);
    }
}
