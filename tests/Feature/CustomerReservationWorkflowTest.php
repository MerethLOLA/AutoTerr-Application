<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Location;
use App\Models\User;
use App\Models\Voiture;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class CustomerReservationWorkflowTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(VerifyCsrfToken::class);
        $this->withoutMiddleware(ValidateCsrfToken::class);
    }

    public function test_client_can_create_a_reservation_from_customer_portal(): void
    {
        $user = User::factory()->create([
            'role' => 'client',
            'email' => 'client@example.com',
            'name' => 'Client Test',
        ]);
        $voiture = Voiture::query()->create([
            'marque' => 'Peugeot',
            'modele' => '3008',
            'prix' => 17500000,
            'numero_chassis' => 'RES-100',
            'statut' => 'disponible',
        ]);

        $response = $this->actingAs($user)->post(route('customer.reservations.store'), [
            'id_voiture' => $voiture->id,
            'date_debut' => now()->addDay()->toDateString(),
            'date_fin' => now()->addDays(3)->toDateString(),
            'observations' => 'Je souhaite visiter le vehicule.',
        ]);

        $response->assertRedirect(route('customer.portal'));
        $this->assertDatabaseHas('locations', [
            'id_voiture' => $voiture->id,
            'statut' => 'planifiee',
        ]);
        $this->assertDatabaseHas('clients', [
            'email' => 'client@example.com',
        ]);
    }

    public function test_employee_can_confirm_customer_reservation(): void
    {
        $employee = User::factory()->create(['role' => 'admin']);
        $client = Client::query()->create([
            'nom' => 'Diallo',
            'prenom' => 'Aminata',
            'telephone' => '770000001',
            'email' => 'reservation@example.com',
        ]);
        $voiture = Voiture::query()->create([
            'marque' => 'Renault',
            'modele' => 'Clio',
            'prix' => 6500000,
            'numero_chassis' => 'RES-200',
            'statut' => 'disponible',
        ]);
        $reservation = Location::query()->create([
            'reference_location' => 'RES-TEST',
            'id_client' => $client->id,
            'id_voiture' => $voiture->id,
            'date_debut' => now()->addDay(),
            'date_fin' => now()->addDays(2),
            'tarif_journalier' => 0,
            'statut' => 'planifiee',
            'caution' => 0,
            'observations' => 'Reservation test',
        ]);

        $response = $this->actingAs($employee)->patch(route('reservations.confirm', $reservation));

        $response->assertRedirect(route('reservations.index'));
        $this->assertDatabaseHas('locations', [
            'id' => $reservation->id,
            'statut' => 'en_cours',
        ]);
        $this->assertDatabaseHas('voitures', [
            'id' => $voiture->id,
            'statut' => 'loue',
        ]);
    }
}
