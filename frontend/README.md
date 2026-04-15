# SunuPark Frontend

Frontend Next.js pour l'application de gestion de parc automobile SunuPark.

## Installation

```bash
npm install
```

## Développement

```bash
npm run dev
```

L'application sera accessible à `http://localhost:3000`

## Build pour production

```bash
npm run build
npm start
```

## Configuration

Créez un fichier `.env.local` basé sur `.env.example` et configurez l'URL de l'API :

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

## Structure du projet

- `app/` - Pages Next.js (App Router)
- `components/` - Composants React réutilisables
- `lib/` - Utilitaires et services
- `public/` - Fichiers statiques

## Technologies

- **Next.js 14** - Framework React
- **Tailwind CSS** - Framework CSS
- **Axios** - Client HTTP
- **TypeScript** - Typage statique
