<?php

namespace Tests\Feature;

use App\Models\Client;
use App\Models\Employe;
use App\Models\Facturation;
use App\Models\Location;
use App\Models\NotificationInterne;
use App\Models\OrdreTravail;
use App\Models\PieceStock;
use App\Models\TicketSav;
use App\Models\User;
use App\Models\Vente;
use App\Models\Voiture;
use App\Services\AutomationAlertService;
use Illuminate\Foundation\Http\Middleware\ValidateCsrfToken;
use Illuminate\Foundation\Http\Middleware\VerifyCsrfToken;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AutomationAlertsTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutMiddleware(VerifyCsrfToken::class);
        $this->withoutMiddleware(ValidateCsrfToken::class);
    }

    public function test_alert_service_creates_notifications_for_business_risks(): void
    {
        $client = Client::query()->create([
            'nom' => 'Fall',
            'prenom' => 'Aminata',
            'telephone' => '770000030',
        ]);
        $responsable = Employe::query()->create([
            'nom' => 'Diouf',
            'prenom' => 'Mariama',
            'poste' => 'Responsable SAV',
        ]);
        $commercial = Employe::query()->create([
            'nom' => 'Sarr',
            'prenom' => 'Alioune',
            'poste' => 'Commercial',
        ]);
        $voiture = Voiture::query()->create([
            'marque' => 'Suzuki',
            'modele' => 'Swift',
            'prix' => 6200000,
            'numero_chassis' => 'ALR-100',
            'statut' => 'loue',
        ]);
        $vente = Vente::query()->create([
            'reference_vente' => 'ALR-VTE-1',
            'date_vente' => now()->subDays(4),
            'id_client' => $client->id,
            'id_voiture' => $voiture->id,
            'prix_final' => 6000000,
            'mode_paiement' => 'Wave',
            'statut' => 'finalisee',
            'id_employe' => $commercial->id,
        ]);
        Facturation::query()->create([
            'numero_facture' => 'ALR-FAC-1',
            'date_facture' => now()->subDays(4),
            'date_echeance' => now()->subDay(),
            'montant' => 6000000,
            'montant_ht' => 6000000,
            'montant_ttc' => 7080000,
            'statut' => 'impayee',
            'id_vente' => $vente->id,
        ]);
        PieceStock::query()->create([
            'reference' => 'ALR-P-1',
            'designation' => 'Plaquettes',
            'prix_unitaire' => 15000,
            'quantite_stock' => 2,
            'seuil_alerte' => 2,
            'statut' => 'actif',
        ]);
        Location::query()->create([
            'reference_location' => 'ALR-LOC-1',
            'id_client' => $client->id,
            'id_voiture' => $voiture->id,
            'date_debut' => now()->subDays(3),
            'date_fin' => now()->subDay(),
            'tarif_journalier' => 25000,
            'statut' => 'en_cours',
        ]);
        TicketSav::query()->create([
            'reference_ticket' => 'ALR-SAV-1',
            'id_client' => $client->id,
            'id_voiture' => $voiture->id,
            'id_responsable' => $responsable->id,
            'objet' => 'Fuite huile',
            'statut' => 'ouvert',
            'priorite' => 'urgente',
        ]);
        OrdreTravail::query()->create([
            'reference_ot' => 'ALR-OT-1',
            'id_voiture' => $voiture->id,
            'description' => 'Controle complet',
            'deadline' => now()->subDay(),
            'statut' => 'ouvert',
        ]);

        app(AutomationAlertService::class)->sync();

        $this->assertDatabaseCount('notifications_internes', 5);
        $this->assertDatabaseHas('notifications_internes', ['type' => 'impaye']);
        $this->assertDatabaseHas('notifications_internes', ['type' => 'stock_faible']);
        $this->assertDatabaseHas('notifications_internes', ['type' => 'echeance_location']);
        $this->assertDatabaseHas('notifications_internes', ['type' => 'sav']);
        $this->assertDatabaseHas('notifications_internes', ['type' => 'atelier']);
    }

    public function test_employee_can_mark_notification_as_read(): void
    {
        $user = User::factory()->create(['role' => 'admin']);
        $notification = NotificationInterne::query()->create([
            'type' => 'impaye',
            'signature' => 'manual-1',
            'niveau' => 'warning',
            'titre' => 'Alerte test',
            'message' => 'Message test',
            'declenchee_at' => now(),
        ]);

        $response = $this->actingAs($user)->patchJson("/api/notifications/{$notification->id}/read");

        $response->assertOk();
        $this->assertNotNull($notification->fresh()->lue_at);
    }
}
