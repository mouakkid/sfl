# SHOP FROM LONDON — Gestion des Commandes (Next.js 14 + Supabase)

Application simple et efficace pour gérer:
- commandes et achats
- export Excel
- statistiques (CA, marge, nbre de commandes)
- authentification email + mot de passe via Supabase

## 1) Prérequis
- Node.js 20+ et pnpm/npm
- Compte gratuit **Supabase**

## 2) Installation
```bash
pnpm install        # ou npm i
cp .env.example .env.local
```
Renseignez dans `.env.local` :
```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...   # nécessaire pour /api/export/orders
SEED_EMAIL=admin@example.com
SEED_PASSWORD=ChangeMe123!
```

## 3) Supabase (DB + Auth)
- Créez un projet Supabase
- Dans *SQL Editor*, collez `supabase/schema.sql` et exécutez
- Dans *Authentication* > *Providers*, activez **Email** (password)
- Créez votre utilisateur admin dans *Users* (ou inscrivez-vous via /login)

## 4) Lancer en local
```bash
pnpm dev  # ou npm run dev
```
- Ouvrez **http://localhost:3000/login** et connectez-vous
- Accédez au Dashboard, ajoutez des commandes, exportez en Excel

## 5) Déploiement
- **Vercel** (recommandé): Importez le repo, ajoutez les variables d'environnement
- **Render/Fly/Netlify**: idem
- Assurez-vous d'ajouter `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`

## 6) Notes
- Les routes sont protégées par un middleware qui redirige vers `/login`
- L'export Excel utilise l'API `/api/export/orders` (service role côté serveur)
- Design Tailwind minimal + animations (framer-motion). Libre à vous d'améliorer.

Bon usage !
