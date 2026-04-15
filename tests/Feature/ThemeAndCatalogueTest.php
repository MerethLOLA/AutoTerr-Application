<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Voiture;
use Database\Seeders\PermissionRoleSeeder;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ThemeAndCatalogueTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(PermissionRoleSeeder::class);
        $this->withoutMiddleware(VerifyCsrfToken::class);
        $this->withoutMiddleware(ValidateCsrfToken::class);
    }

    public function test_authenticated_user_can_switch_theme(): void
    {
        $user = User::factory()->create(['theme' => 'light']);

        $response = $this
            ->actingAs($user)
            ->post(route('theme.switch', ['theme' => 'dark']));

        $response->assertOk()->assertJson(['ok' => true]);
        $this->assertSame('dark', $user->fresh()->theme);
    }

    public function test_public_catalogue_only_lists_available_vehicles_and_filters_by_search(): void
    {
        Voiture::query()->create([
            'marque' => 'Toyota',
            'modele' => 'Yaris',
            'prix' => 5000000,
            'numero_chassis' => 'CAT-100',
            'statut' => 'disponible',
        ]);
        Voiture::query()->create([
            'marque' => 'Peugeot',
            'modele' => '208',
            'prix' => 6500000,
            'numero_chassis' => 'CAT-200',
            'statut' => 'vendu',
        ]);

        $response = $this->get(route('catalogue.index', ['search' => 'Toyota']));

        $response->assertOk();
        $response->assertSee('Toyota');
        $response->assertDontSee('Peugeot');
    }

    public function test_public_catalogue_show_returns_404_for_unavailable_vehicle(): void
    {
        $voiture = Voiture::query()->create([
            'marque' => 'Renault',
            'modele' => 'Clio',
            'prix' => 4200000,
            'numero_chassis' => 'CAT-300',
            'statut' => 'vendu',
        ]);

        $this->get(route('catalogue.show', $voiture))
            ->assertNotFound();
    }

    public function test_general_login_screen_shows_client_and_employee_entry_points(): void
    {
        $this->get(route('login'))
            ->assertOk()
            ->assertSee('Espace client')
            ->assertSee('Espace employe');
    }

    public function test_vehicle_creation_generates_chassis_when_not_provided(): void
    {
        $user = User::factory()->create(['role' => 'admin']);

        $response = $this->actingAs($user)->post(route('voitures.store'), [
            'marque' => 'Nissan',
            'modele' => 'Qashqai',
            'prix' => 11000000,
            'statut' => 'disponible',
        ]);

        $response->assertRedirect();

        $voiture = Voiture::query()->latest('id')->first();

        $this->assertNotNull($voiture);
        $this->assertNotEmpty($voiture->numero_chassis);
        $this->assertStringStartsWith('CHS-', $voiture->numero_chassis);
    }
}
