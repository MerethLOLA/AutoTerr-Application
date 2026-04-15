<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Employe;
use App\Models\Facturation;
use App\Models\Paiement;
use App\Models\User;
use App\Models\Voiture;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class ApiSaleWorkflowTest extends TestCase
{
    use RefreshDatabase;

    public function test_api_sale_creates_invoice_with_discount_and_marks_vehicle_as_sold(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));

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
            'numero_chassis' => 'API-CHS-100',
            'statut' => 'disponible',
        ]);

        $response = $this->postJson('/api/ventes', [
            'date_vente' => '2026-04-01',
            'id_client' => $client->id,
            'id_voiture' => $voiture->id,
            'prix_final' => 9000000,
            'remise' => 1000000,
            'mode_paiement' => 'wave',
            'statut' => 'finalisee',
            'id_employe' => $employe->id,
            'observations' => 'Vente API',
        ]);

        $response
            ->assertCreated()
            ->assertJsonPath('client.id', $client->id)
            ->assertJsonPath('voiture.id', $voiture->id)
            ->assertJsonPath('facturation.remise', '1000000.00')
            ->assertJsonPath('facturation.montant_ht', '8000000.00')
            ->assertJsonPath('facturation.montant_ttc', '9440000.00')
            ->assertJsonPath('facturation.statut', 'impayee');

        $this->assertDatabaseHas('voitures', [
            'id' => $voiture->id,
            'statut' => 'vendu',
        ]);

        $this->assertDatabaseHas('facturations', [
            'id_vente' => $response->json('id'),
            'remise' => 1000000,
            'montant_ht' => 8000000,
            'montant_ttc' => 9440000,
            'statut' => 'impayee',
        ]);
    }

    public function test_api_sale_rejects_unavailable_vehicle(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));

        $employe = Employe::query()->create(['nom' => 'Fall', 'poste' => 'Vendeur']);
        $client = Client::query()->create(['nom' => 'Ba']);
        $voiture = Voiture::query()->create([
            'marque' => 'Hyundai',
            'modele' => 'i10',
            'prix' => 5000000,
            'numero_chassis' => 'API-CHS-200',
            'statut' => 'vendu',
        ]);

        $response = $this->postJson('/api/ventes', [
            'date_vente' => '2026-04-01',
            'id_client' => $client->id,
            'id_voiture' => $voiture->id,
            'prix_final' => 4800000,
            'statut' => 'finalisee',
            'id_employe' => $employe->id,
        ]);

        $response->assertUnprocessable();
        $this->assertDatabaseCount('ventes', 0);
        $this->assertDatabaseCount('facturations', 0);
    }

    public function test_api_payment_can_partially_then_fully_pay_generated_invoice(): void
    {
        Sanctum::actingAs(User::factory()->create(['role' => 'admin']));

        $employe = Employe::query()->create(['nom' => 'Sarr', 'poste' => 'Vendeur']);
        $client = Client::query()->create(['nom' => 'Seck']);
        $voiture = Voiture::query()->create([
            'marque' => 'Kia',
            'modele' => 'Sportage',
            'prix' => 15000000,
            'numero_chassis' => 'API-CHS-300',
            'statut' => 'disponible',
        ]);

        $sale = $this->postJson('/api/ventes', [
            'date_vente' => now()->toDateString(),
            'id_client' => $client->id,
            'id_voiture' => $voiture->id,
            'prix_final' => 12000000,
            'mode_paiement' => 'virement',
            'statut' => 'finalisee',
            'id_employe' => $employe->id,
        ])->assertCreated();

        $facture = Facturation::query()->where('id_vente', $sale->json('id'))->firstOrFail();

        $this->postJson('/api/paiements', [
            'date' => now()->toDateString(),
            'mode_paiement' => 'wave',
            'montant' => 5000000,
            'id_facture' => $facture->id,
        ])->assertCreated();

        $facture->refresh();
        $this->assertSame('partiellement_payee', $facture->statut);
        $this->assertEquals(9160000, (float) Paiement::query()->latest('id')->first()->reste);

        $this->postJson('/api/paiements', [
            'date' => now()->toDateString(),
            'mode_paiement' => 'orange_money',
            'montant' => 9160000,
            'id_facture' => $facture->id,
        ])->assertCreated();

        $facture->refresh();
        $this->assertSame('payee', $facture->statut);
        $this->assertEquals(14160000, (float) $facture->montant_paye);
        $this->assertEquals(0, (float) $facture->reste_a_payer);
    }
}
