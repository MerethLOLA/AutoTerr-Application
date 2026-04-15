# Migration vers Next.js - Guide de Déploiement

## Architecture

Le projet SunuPark a été restructuré pour séparer le backend Laravel de l'API et le frontend React avec Next.js.

### Structure

```
SunuPark/
├── app/               # Backend Laravel
├── routes/            # Routes Laravel (web.php et api.php)
├── frontend/          # Application Next.js (port 3000)
└── ...                # Autres fichiers Laravel
```

## Configuration

### Backend Laravel (Port 8000)

1. **Démarrer le serveur Laravel:**
```bash
cd c:\laragon\www\SunuPark
php artisan serve
```

2. **À vous assurer que les variables d'environnement sont configurées:**
```
FRONTEND_URL=http://localhost:3000
```

### Frontend Next.js (Port 3000)

1. **Installer les dépendances:**
```bash
cd c:\laragon\www\SunuPark\frontend
npm install
```

2. **Configurer l'URL de l'API:**
Créez ou éditez le fichier `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

3. **Démarrer le serveur de développement:**
```bash
npm run dev
```

L'application sera accessible à `http://localhost:3000`

## Endpoints API

### Authentification

- `POST /api/login` - Connexion (retourne un token)
- `POST /api/logout` - Déconnexion
- `GET /api/me` - Infos de l'utilisateur connecté

### Ressources Publiques

- `GET /api/voitures/public` - Liste des véhicules disponibles
- `GET /api/voitures/{id}/public` - Détails d'un véhicule

### Ressources Protégées (nécessite un token)

- `GET /api/voitures` - Liste des véhicules
- `POST /api/voitures` - Créer un véhicule
- `GET /api/voitures/{id}` - Détails d'un véhicule
- `PUT /api/voitures/{id}` - Modifier un véhicule
- `DELETE /api/voitures/{id}` - Supprimer un véhicule

Et de même pour:
- `/api/clients`
- `/api/locations`

## Flux d'Authentification

1. L'utilisateur se connecte via `/login/client` ou `/login/employee`
2. Le frontend envoie: `POST /api/login` avec email/username et password
3. L'API retourne un token et les infos utilisateur
4. Le frontend stocke le token dans `localStorage`
5. Les requêtes suivantes incluent le token dans l'header `Authorization: Bearer <token>`

## Migration des Données

Les routes Laravel existantes (web.php) continuent de fonctionner normalement. Vous pouvez utiliser des routes spécifiques dans `api.php` pour votre frontend Next.js.

## Middleware CORS

Le middleware CORS est configuré pour accepter les requêtes depuis `http://localhost:3000` en développement.

En production, assurez-vous de configurer:
```env
FRONTEND_URL=https://votre-domaine.com
```

## Points à Noter

1. **Le frontend Node.js a besoin de npm** - Assurez-vous que npm est installé
2. **Ports** - Laravel sur 8000, Next.js sur 3000. Ces ports ne doivent pas être en utilisation
3. **CORS** - Actuellement configuré pour localhost. À adapter pour la production
4. **Token Expiration** - Les tokens expirent après 7 jours par défaut

## Déploiement Concurrent

Pour développer en parallèle, utilisez deux terminaux:

**Terminal 1 - Backend:**
```bash
cd c:\laragon\www\SunuPark
php artisan serve
```

**Terminal 2 - Frontend:**
```bash
cd c:\laragon\www\SunuPark\frontend
npm run dev
```

## Prochaines Étapes

1. ✅ Créer des composants React pour toutes les pages du dashboard
2. ✅ Implémenter les formulaires de gestion (clients, véhicules, locations, SAV)
3. ✅ Ajouter des notifications et alertes
4. ✅ Implémenter le système de permissions côté frontend
5. ✅ Ajouter les graphiques et tableaux de bord
6. ✅ Implémenter la déconnexion et gestion des sessions

## Fonctionnalités Implémentées

### ✅ Pages CRUD Complètes
- **Véhicules** (`/voitures`) : Gestion complète avec recherche, filtres, CRUD
- **Clients** (`/clients`) : Base clients avec profils détaillés
- **Locations** (`/locations`) : Gestion des contrats de location
- **SAV** (`/sav`) : Service Après-Vente avec tickets et priorités

### ✅ Composants Réutilisables
- `DataTable` : Tables interactives avec tri et pagination
- `FormModal` : Modales responsives pour formulaires
- `ConfirmDialog` : Dialogues de confirmation
- `SearchBar` : Recherche et filtres avancés
- `Pagination` : Navigation paginée

### ✅ Dashboard Interactif
- Métriques en temps réel (véhicules, clients, locations, revenus)
- Graphiques d'état de la flotte
- Activités récentes
- Accès rapide aux fonctionnalités
- Interface responsive avec mode sombre

### ✅ Gestion Utilisateur
- Authentification avec tokens JWT
- Protection des routes
- Déconnexion sécurisée
- Gestion des sessions

### ✅ Catalogue Public
- Affichage des véhicules disponibles
- Interface publique pour les clients
- Images et détails des véhicules

### ✅ Paramètres
- Configuration d'affichage (thème sombre)
- Gestion du compte utilisateur
- Paramètres de sécurité
- Préférences linguistiques
