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
