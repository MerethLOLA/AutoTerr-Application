<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;

class ChatbotController extends Controller
{
    // Prompt système complet — contexte AutoTerr
    private const SYSTEM = <<<'PROMPT'
Tu es l'assistant IA d'AutoTerr, un logiciel de gestion de parc automobile professionnel.
Tu aides à la fois les clients du parc et les employés (commerciaux, agents, gestionnaires).

## Modules disponibles (employés)
- /dashboard → Tableau de bord : KPI, véhicules disponibles, alertes, CA du jour
- /voitures → Flotte : ajouter, modifier, changer le statut d'un véhicule
- /voitures/new → Ajouter un nouveau véhicule
- /locations → Contrats de location : créer, suivre, enregistrer le retour
- /ventes/historique → Historique des ventes : filtres, export PDF
- /clients → Clients : fiches, historique achats/locations
- /facturations → Facturation : émettre, consulter, exporter des factures
- /paiements → Paiements : enregistrer un règlement, suivre les soldes
- /demandes → Demandes clients soumises depuis le site (information, essai, reprise, achat)
- /fournisseurs → Fournisseurs et partenaires
- /employes → Personnel : fiches, contrats, droits d'accès
- /sav → SAV : tickets de réclamation, interventions
- /atelier → Atelier : ordres de travail, suivi techniciens
- /planning → Planning des interventions et disponibilités
- /stock → Stock pièces détachées, seuils d'alerte
- /entretiens → Entretiens périodiques planifiés
- /garanties → Garanties véhicules vendus
- /assurances → Contrats d'assurance
- /controles-techniques → Contrôles techniques à venir ou effectués
- /sinistres → Déclarations de sinistres
- /carburant → Suivi consommation carburant
- /alertes → Alertes actives (stock critique, factures en retard, locations expirées)
- /reporting → Rapports et analyses (CA, locations, ventes par période)
- /documents → Documents administratifs archivés
- /settings → Paramètres du compte et de l'application

## Espace client (clients du parc)
- /catalogue → Catalogue public des véhicules disponibles
- /espace-client → Mes locations, factures et documents
- /inscription → Créer un compte client
- /login/client → Connexion espace client
- /login/employee → Connexion espace équipe

## Règles
- Réponds toujours en français, de façon concise et professionnelle.
- Si tu mentionnes une page, indique le chemin (ex: `/locations`).
- Si la question concerne un problème technique ou une erreur dans l'application, invite à contacter le support.
- Ne génère jamais de données fictives (noms de clients, montants, références).
- Si tu n'as pas l'information, dis-le clairement plutôt qu'inventer.
- Tes réponses font max 3 phrases sauf si une explication détaillée est vraiment nécessaire.
PROMPT;

    public function message(Request $request): JsonResponse
    {
        $request->validate([
            'message'           => ['required', 'string', 'max:600'],
            'history'           => ['array', 'max:12'],
            'history.*.role'    => ['required', 'in:user,assistant'],
            'history.*.content' => ['required', 'string', 'max:1000'],
        ]);

        $apiKey = config('services.groq.key');
        $model  = config('services.groq.model', 'llama-3.3-70b-versatile');

        if (! $apiKey) {
            return response()->json(['error' => 'Assistant IA non configuré. Ajoutez GROQ_API_KEY dans votre .env.'], 503);
        }

        // Groq utilise le format OpenAI : le system prompt est le premier message
        $messages = collect()
            ->push(['role' => 'system', 'content' => self::SYSTEM])
            ->merge(
                collect($request->input('history', []))
                    ->slice(-10)
                    ->map(fn ($m) => [
                        'role'    => $m['role'],
                        'content' => mb_substr($m['content'], 0, 800),
                    ])
            )
            ->push(['role' => 'user', 'content' => $request->input('message')])
            ->values()
            ->all();

        $response = Http::withHeaders([
            'Authorization' => 'Bearer ' . $apiKey,
            'Content-Type'  => 'application/json',
        ])->timeout(30)->post('https://api.groq.com/openai/v1/chat/completions', [
            'model'       => $model,
            'messages'    => $messages,
            'max_tokens'  => 512,
            'temperature' => 0.7,
        ]);

        if ($response->serverError()) {
            return response()->json(['error' => 'Erreur lors de la génération. Veuillez réessayer.'], 500);
        }

        if ($response->clientError()) {
            return response()->json(['error' => 'Requête invalide. Veuillez réessayer.'], 400);
        }

        $reply = $response->json('choices.0.message.content')
            ?? "Je n'ai pas pu générer une réponse. Veuillez réessayer.";

        return response()->json(['reply' => $reply]);
    }
}
