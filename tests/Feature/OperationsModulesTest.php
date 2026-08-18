<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Employe;
use App\Models\Location;
use App\Models\OrdreTravail;
use App\Models\PieceStock;
use App\Models\TicketSav;
use App\Models\User;
use App\Models\Voiture;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class OperationsModulesTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(VerifyCsrfToken::class);
        $this->withoutMiddleware(ValidateCsrfToken::class);
    }

    public function test_employee_can_create_sav_ticket_from_web_form(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $responsable = Employe::query()->create([
            'nom' => 'Diop',
            'prenom' => 'Awa',
            'poste' => 'Responsable SAV',
        ]);
        $client = Client::query()->create([
            'nom' => 'Ba',
            'prenom' => 'Moussa',
            'telephone' => '770000010',
        ]);
        $voiture = Voiture::query()->create([
            'marque' => 'Toyota',
            'modele' => 'Hilux',
            'prix' => 18000000,
            'numero_chassis' => 'OPS-100',
            'statut' => 'disponible',
        ]);

        $response = $this->actingAs($user)->post(route('tickets-sav.store'), [
            'id_client' => $client->id,
            'id_voiture' => $voiture->id,
            'id_responsable' => $responsable->id,
            'objet' => 'Bruit moteur',
            'description' => 'Controle a faire',
            'statut' => 'ouvert',
            'priorite' => 'haute',
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('tickets_sav', [
            'id_client' => $client->id,
            'id_voiture' => $voiture->id,
            'objet' => 'Bruit moteur',
        ]);
        $this->assertStringStartsWith('SAV-'.now()->format('Ymd').'-', TicketSav::query()->latest('id')->value('reference_ticket'));
    }

    public function test_consuming_stock_from_work_order_updates_inventory_and_movements(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $voiture = Voiture::query()->create([
            'marque' => 'Kia',
            'modele' => 'Rio',
            'prix' => 7000000,
            'numero_chassis' => 'OPS-200',
            'statut' => 'disponible',
        ]);
        $ordre = OrdreTravail::query()->create([
            'reference_ot' => 'OT-OPS-1',
            'id_voiture' => $voiture->id,
            'description' => 'Revision complete',
            'priorite' => 'normale',
            'statut' => 'ouvert',
        ]);
        $piece = PieceStock::query()->create([
            'reference' => 'P-001',
            'designation' => 'Filtre a huile',
            'prix_unitaire' => 7500,
            'quantite_stock' => 10,
            'seuil_alerte' => 2,
            'statut' => 'actif',
        ]);

        $response = $this->actingAs($user)->postJson(route('ordres-travail.consommer-piece', $ordre), [
            'id_piece_stock' => $piece->id,
            'quantite' => 3,
        ]);

        $response->assertCreated();
        $this->assertDatabaseHas('pieces_stock', [
            'id' => $piece->id,
            'quantite_stock' => 7,
        ]);
        $this->assertDatabaseHas('consommations_pieces', [
            'id_ordre_travail' => $ordre->id,
            'id_piece_stock' => $piece->id,
            'quantite' => 3,
        ]);
        $this->assertDatabaseHas('mouvements_stock', [
            'id_piece_stock' => $piece->id,
            'type_mouvement' => 'sortie',
            'quantite' => 3,
        ]);
    }

    public function test_marking_a_location_as_returned_closes_contract_and_releases_vehicle(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $client = Client::query()->create([
            'nom' => 'Ndiaye',
            'prenom' => 'Fatou',
            'telephone' => '770000020',
        ]);
        $voiture = Voiture::query()->create([
            'marque' => 'Hyundai',
            'modele' => 'Tucson',
            'prix' => 14500000,
            'numero_chassis' => 'OPS-300',
            'statut' => 'loue',
        ]);
        $location = Location::query()->create([
            'reference_location' => 'LOC-OPS-1',
            'id_client' => $client->id,
            'id_voiture' => $voiture->id,
            'date_debut' => now()->subDays(2),
            'date_fin' => now()->addDay(),
            'tarif_journalier' => 35000,
            'statut' => 'en_cours',
            'caution' => 100000,
        ]);

        $response = $this->actingAs($user)->patchJson(route('locations.return', $location));

        $response->assertOk();
        $this->assertDatabaseHas('locations', [
            'id' => $location->id,
            'statut' => 'terminee',
        ]);
        $this->assertDatabaseHas('voitures', [
            'id' => $voiture->id,
            'statut' => 'disponible',
        ]);
    }
}
