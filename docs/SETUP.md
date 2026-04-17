# Setup Guide

Complete setup instructions for running Trip Planner locally and deploying to production.

---

## Prerequisites

- Node.js 20 or higher
- A [Supabase](https://supabase.com) account (free tier is sufficient)
- A [Vercel](https://vercel.com) account (free tier is sufficient)
- Git installed locally

---

## Local Development

### 1. Clone and install

```bash
git clone https://github.com/nattapongsindhu/Trip-Planner.git
cd Trip-Planner
npm install
```

### 2. Create a Supabase project

1. Sign in at [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click **New project**
3. Enter project name, generate a strong database password, choose the closest region
4. Wait ~2 minutes for provisioning

### 3. Run database migrations

Open the Supabase **SQL Editor** and run each migration file in order:

```
supabase/migrations/001_init.sql        # creates tables
supabase/migrations/002_rls.sql         # enables Row Level Security
supabase/migrations/003_visibility.sql  # adds is_public column for privacy control
```

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in the four required values from **Supabase → Project Settings → API Keys**:

| Variable | Source | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API | Public — exposed to browser |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API Keys | Public — subject to RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API Keys | **SECRET — bypasses RLS** |
| `NEXT_PUBLIC_SITE_URL` | Your deployment URL | Used for magic link redirect |

> **Never commit `.env.local` to Git.** It is already listed in `.gitignore`.

### 5. Seed the database (optional)

```bash
DOTENV_CONFIG_PATH=.env.local npx ts-node -r dotenv/config supabase/seed.ts
```

This inserts a sample trip with 15 days, 10 hotels, and 9 budget items.

### 6. Run locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Deploying to Vercel

### 1. Push to GitHub

```bash
git push origin main
```

### 2. Import the repository on Vercel

1. Go to [vercel.com/new](https://vercel.com/new)
2. Import the `Trip-Planner` repository
3. Vercel auto-detects Next.js — no configuration needed

### 3. Add environment variables

In **Vercel → Project Settings → Environment Variables**, add the same four variables from step 4 above. For `NEXT_PUBLIC_SITE_URL`, use the Vercel deployment URL (e.g. `https://trip-planner-rho-coral.vercel.app`).

### 4. Update Supabase redirect URL

In **Supabase → Authentication → URL Configuration**, add your Vercel URL to **Redirect URLs**:

```
https://your-deployment.vercel.app/auth/callback
```

Without this step, magic link sign-in will redirect to `localhost` and fail.

### 5. Deploy

Vercel deploys automatically on every push to `main`.

---

## Running tests

```bash
npm run test           # run once
npm run test:watch     # watch mode
```

Tests run automatically on every pull request via GitHub Actions (see `.github/workflows/test.yml`).

---

## Troubleshooting

### Build fails with TypeScript error

If you see `Parameter 'cookiesToSet' implicitly has an 'any' type`, ensure the type annotation is present in `lib/supabaseServer.ts` and `middleware.ts`:

```typescript
setAll(cookiesToSet: { name: string; value: string; options?: object }[]) {
```

### Seed script cannot find environment variables

`ts-node` does not auto-load `.env.local`. Use:

```bash
DOTENV_CONFIG_PATH=.env.local npx ts-node -r dotenv/config supabase/seed.ts
```

### Supabase project paused

Supabase free tier pauses projects after 7 days of inactivity. Go to your Supabase dashboard and click **Restore project** — no data is lost.

### Magic link redirects to localhost in production

You forgot to update the redirect URL in Supabase. See **Deploying to Vercel → Step 4**.
