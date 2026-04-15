<?php

namespace Tests\Feature\Auth;

use App\Models\User;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthenticationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(VerifyCsrfToken::class);
        $this->withoutMiddleware(ValidateCsrfToken::class);
    }

    public function test_login_screen_can_be_rendered(): void
    {
        $response = $this->get('/login');

        $response->assertStatus(200);
    }

    public function test_client_and_employee_login_screens_can_be_rendered(): void
    {
        $this->get('/login/client')
            ->assertOk()
            ->assertSee('Connexion client');

        $this->get('/login/employe')
            ->assertOk()
            ->assertSee('Connexion employe');
    }

    public function test_users_can_authenticate_using_the_login_screen(): void
    {
        $user = User::factory()->create();

        $response = $this->post('/login', [
            'email' => $user->email,
            'password' => 'password',
        ]);

        $this->assertAuthenticated();
        $response->assertRedirect(route('voitures.index', absolute: false));
    }

    public function test_users_can_not_authenticate_with_invalid_password(): void
    {
        $user = User::factory()->create();

        $this->post('/login', [
            'email' => $user->email,
            'password' => 'wrong-password',
        ]);

        $this->assertGuest();
    }

    public function test_client_cannot_authenticate_from_employee_login(): void
    {
        $user = User::factory()->create(['role' => 'client']);

        $this->post('/login', [
            'login' => $user->email,
            'password' => 'password',
            'login_mode' => 'employee',
        ])->assertSessionHasErrors('login');

        $this->assertGuest();
    }

    public function test_employee_cannot_authenticate_from_client_login(): void
    {
        $user = User::factory()->create(['role' => 'admin']);

        $this->post('/login', [
            'login' => $user->email,
            'password' => 'password',
            'login_mode' => 'client',
        ])->assertSessionHasErrors('login');

        $this->assertGuest();
    }

    public function test_users_can_logout(): void
    {
        $user = User::factory()->create();

        $response = $this->actingAs($user)->post('/logout');

        $this->assertGuest();
        $response->assertRedirect('/');
    }
}
