<?php

namespace Tests\Feature;

use App\Models\User;
use Database\Seeders\PermissionRoleSeeder;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class RolePermissionsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->seed(PermissionRoleSeeder::class);
        $this->withoutMiddleware(VerifyCsrfToken::class);
        $this->withoutMiddleware(ValidateCsrfToken::class);
    }

    public function test_admin_has_access_to_critical_back_office_routes(): void
    {
        $user = User::factory()->create(['role' => 'admin']);

        $this->actingAs($user)->get(route('dashboard'))->assertOk();
        $this->actingAs($user)->get(route('reporting.index'))->assertOk();
        $this->actingAs($user)->get(route('ventes.index'))->assertOk();
        $this->actingAs($user)->get(route('locations.index'))->assertOk();
        $this->actingAs($user)->get(route('tickets-sav.index'))->assertOk();
        $this->actingAs($user)->get(route('ordres-travail.index'))->assertOk();
        $this->actingAs($user)->get(route('pieces-stock.index'))->assertOk();
    }

    public function test_commercial_access_is_limited_to_sales_finance_and_reporting(): void
    {
        $user = User::factory()->create(['role' => 'commercial']);

        $this->actingAs($user)->get(route('dashboard'))->assertOk();
        $this->actingAs($user)->get(route('reporting.index'))->assertOk();
        $this->actingAs($user)->get(route('ventes.index'))->assertOk();
        $this->actingAs($user)->get(route('facturations.index'))->assertOk();
        $this->actingAs($user)->get(route('locations.index'))->assertForbidden();
        $this->actingAs($user)->get(route('tickets-sav.index'))->assertForbidden();
        $this->actingAs($user)->get(route('ordres-travail.index'))->assertForbidden();
        $this->actingAs($user)->get(route('pieces-stock.index'))->assertForbidden();
    }

    public function test_agent_location_can_manage_reservations_and_locations_only(): void
    {
        $user = User::factory()->create(['role' => 'agent_location']);

        $this->actingAs($user)->get(route('dashboard'))->assertOk();
        $this->actingAs($user)->get(route('reporting.index'))->assertOk();
        $this->actingAs($user)->get(route('reservations.index'))->assertOk();
        $this->actingAs($user)->get(route('locations.index'))->assertOk();
        $this->actingAs($user)->get(route('ventes.index'))->assertForbidden();
        $this->actingAs($user)->get(route('tickets-sav.index'))->assertForbidden();
        $this->actingAs($user)->get(route('ordres-travail.index'))->assertForbidden();
        $this->actingAs($user)->get(route('pieces-stock.index'))->assertForbidden();
    }

    public function test_sav_role_can_manage_sav_but_not_sales_or_stock(): void
    {
        $user = User::factory()->create(['role' => 'sav']);

        $this->actingAs($user)->get(route('dashboard'))->assertOk();
        $this->actingAs($user)->get(route('reporting.index'))->assertOk();
        $this->actingAs($user)->get(route('tickets-sav.index'))->assertOk();
        $this->actingAs($user)->get(route('interventions-sav.index'))->assertOk();
        $this->actingAs($user)->get(route('ventes.index'))->assertForbidden();
        $this->actingAs($user)->get(route('locations.index'))->assertForbidden();
        $this->actingAs($user)->get(route('ordres-travail.index'))->assertForbidden();
        $this->actingAs($user)->get(route('pieces-stock.index'))->assertForbidden();
    }

    public function test_atelier_role_can_manage_work_orders_and_tasks(): void
    {
        $user = User::factory()->create(['role' => 'atelier']);

        $this->actingAs($user)->get(route('dashboard'))->assertOk();
        $this->actingAs($user)->get(route('reporting.index'))->assertOk();
        $this->actingAs($user)->get(route('ordres-travail.index'))->assertOk();
        $this->actingAs($user)->get(route('taches-atelier.index'))->assertOk();
        $this->actingAs($user)->get(route('pieces-stock.index'))->assertOk();
        $this->actingAs($user)->get(route('ventes.index'))->assertForbidden();
        $this->actingAs($user)->get(route('locations.index'))->assertForbidden();
        $this->actingAs($user)->get(route('tickets-sav.index'))->assertForbidden();
    }

    public function test_stock_role_can_access_stock_and_reporting_only(): void
    {
        $user = User::factory()->create(['role' => 'stock']);

        $this->actingAs($user)->get(route('dashboard'))->assertOk();
        $this->actingAs($user)->get(route('reporting.index'))->assertOk();
        $this->actingAs($user)->get(route('pieces-stock.index'))->assertOk();
        $this->actingAs($user)->get(route('mouvements-stock.index'))->assertOk();
        $this->actingAs($user)->get(route('ventes.index'))->assertForbidden();
        $this->actingAs($user)->get(route('locations.index'))->assertForbidden();
        $this->actingAs($user)->get(route('tickets-sav.index'))->assertForbidden();
        $this->actingAs($user)->get(route('ordres-travail.index'))->assertForbidden();
    }

    public function test_client_is_confined_to_customer_space(): void
    {
        $user = User::factory()->create(['role' => 'client']);

        $this->actingAs($user)->get(route('customer.portal'))->assertOk();
        $this->actingAs($user)->get(route('dashboard'))->assertForbidden();
        $this->actingAs($user)->get(route('reporting.index'))->assertForbidden();
        $this->actingAs($user)->get(route('ventes.index'))->assertForbidden();
        $this->actingAs($user)->get(route('locations.index'))->assertForbidden();
        $this->actingAs($user)->get(route('tickets-sav.index'))->assertForbidden();
        $this->actingAs($user)->get(route('pieces-stock.index'))->assertForbidden();
    }
}
