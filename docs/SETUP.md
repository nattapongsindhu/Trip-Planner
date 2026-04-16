# Setup Guide

Complete setup instructions for running Trip Planner locally and deploying it to Vercel.

## Prerequisites

- Node.js 20 or higher
- Git
- A [Supabase](https://supabase.com) account
- A [Vercel](https://vercel.com) account

## Local development

### 1. Clone and install

```bash
git clone https://github.com/nattapongsindhu/Trip-Planner.git
cd Trip-Planner
npm install
```

### 2. Create a Supabase project

1. Sign in at [supabase.com/dashboard](https://supabase.com/dashboard).
2. Create a new project.
3. Save the project URL, publishable key, and secret key from **Project Settings -> API Keys**.

### 3. Run database migrations

Open the Supabase SQL Editor and run each migration in order:

```text
supabase/migrations/001_init.sql
supabase/migrations/002_rls.sql
supabase/migrations/003_visibility.sql
```

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in these values:

| Variable | Source | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase API settings | Public browser value |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Supabase API keys | Public browser value, still governed by RLS |
| `SUPABASE_SECRET_KEY` | Supabase API keys | Secret, server-only, never commit |
| `NEXT_PUBLIC_SITE_URL` | Local or deployed URL | Used for auth redirects |

Legacy fallback during rotation:

| Variable | Status | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Optional temporary fallback | Accepted while you roll out the publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Optional temporary fallback | Accepted while you roll out the secret key |

### 5. Seed sample data

```bash
npm run seed
```

This command loads `.env.local` automatically and inserts the sample trip, itinerary, hotels, and budget items.

### 6. Start the app

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Local validation checklist

Before pushing changes, run:

```bash
npm run lint
npm run typecheck
npm run test:coverage
npm run build
```

## Deploying to Vercel

### 1. Push to GitHub

```bash
git push origin main
```

### 2. Import the repository in Vercel

1. Go to [vercel.com/new](https://vercel.com/new).
2. Import the `Trip-Planner` repository.
3. Accept the default Next.js build settings.

### 3. Add environment variables

Copy the same four preferred variables from `.env.local` into **Vercel -> Project Settings -> Environment Variables**.

For a safe rotation:

1. Add the new publishable and secret keys in Vercel first.
2. Redeploy production and preview.
3. Verify auth, reads, and write flows still work.
4. Remove legacy fallback variables and revoke the old key only after the new deployment is healthy.

### 4. Update Supabase auth redirect URLs

In **Supabase -> Authentication -> URL Configuration**, add:

```text
https://your-deployment.vercel.app/auth/callback
```

### 5. Configure repository protections

After the first successful GitHub Actions run, enable the recommended branch protection settings from [Repository Governance](./REPOSITORY-GOVERNANCE.md).

## Troubleshooting

### Build fails because of missing environment variables

The app now validates environment variables before creating Supabase clients. Double-check `.env.local` against `.env.example`.

### Seed command fails with a missing admin key

`npm run seed` requires `SUPABASE_SECRET_KEY` in `.env.local`. `SUPABASE_SERVICE_ROLE_KEY` is still accepted as a temporary fallback during migration.

### Magic link redirects to localhost in production

`NEXT_PUBLIC_SITE_URL` or the Supabase redirect URL is still pointing to `http://localhost:3000`.

### Supabase project appears offline

Supabase free-tier projects may pause after inactivity. Restore the project in the dashboard and rerun the request.
