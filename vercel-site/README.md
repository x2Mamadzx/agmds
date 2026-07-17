# MDS Marketing — Vercel Deployment

Projet standalone construit pour Vercel. Aucune dépendance monorepo Replit.

## Stack

- **Frontend**: React + Vite + Tailwind CSS + Framer Motion + wouter
- **Backend**: Express (Vercel Serverless Function à `/api/*`)
- **DB**: PostgreSQL via Drizzle ORM + pg
- **Déploiement**: Vercel

## Configuration Vercel

### 1. Root Directory
Dans les paramètres du projet Vercel :
```
Root Directory: vercel-site
```

### 2. Variables d'environnement
Ajouter dans Vercel → Settings → Environment Variables :

| Variable | Description |
|---|---|
| `DATABASE_URL` | URL PostgreSQL (ex: Neon, Supabase, Railway) |
| `ADMIN_PASSWORD` | Mot de passe pour l'espace admin |

> `SESSION_SECRET` n'est pas requis dans cette version.

### 3. Build settings (auto-détectés)
- Framework: **Vite**
- Build Command: `npm run build`
- Output Directory: `dist`

## Initialisation de la base de données

Exécuter ce SQL **une seule fois** sur votre base PostgreSQL :

```sql
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nom TEXT NOT NULL,
  entreprise TEXT,
  courriel TEXT NOT NULL,
  telephone TEXT NOT NULL,
  service TEXT NOT NULL,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'nouveau',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS visits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL UNIQUE,
  started_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_seen_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  converted BOOLEAN NOT NULL DEFAULT FALSE
);
```

## Développement local

```bash
cd vercel-site
npm install
npm run dev
```

## Pages

| URL | Description |
|---|---|
| `/` | Accueil (landing page) |
| `/reserver-appel` | Formulaire 6 étapes |
| `/admin` | Dashboard admin (mot de passe requis) |
| `/politique-de-confidentialite` | Politique de confidentialité |
