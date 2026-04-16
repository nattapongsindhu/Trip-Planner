# Trip Planner

A full-stack multi-trip planning application built with Next.js 14, TypeScript, Supabase, and Tailwind CSS.

Designed as a portfolio project demonstrating CRUD operations, server-side authentication, Row Level Security, optimistic UI updates, and real-time budget tracking.

**Live demo:** `https://your-deployment.vercel.app`

---

## Features

- **Multi-trip management** — create, edit, and delete multiple trips
- **Day-by-day itinerary** — 15-day itinerary with city, transport, highlights, and cost per day
- **Day notes** — private notes on each day, editable by admin only
- **Hotel tracking** — compare options per city, mark selected accommodation
- **Budget tracker** — line items grouped by category, toggle between estimate and actual
- **Progress tracking** — mark days as done, visual progress bar
- **Public read / private write** — anyone can view, only authenticated admin can edit
- **Light + dark mode** — system preference detected, manual toggle available
- **Template trips** — flag any trip as a template to reuse for future trips
- **Seed data included** — Germany & Eastern Europe 15-day trip pre-loaded

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (magic link) |
| Styling | Tailwind CSS |
| Theme | next-themes |
| Testing | Vitest |
| Deployment | Vercel |

---

## Project structure

```
/app
  page.tsx                     trips list — Server Component
  layout.tsx                   root layout with ThemeProvider
  globals.css                  Tailwind base + CSS variables
  not-found.tsx                404 page
  middleware.ts                Supabase session refresh
  auth/callback/route.ts       magic link redirect handler
  trip/
    new/page.tsx               create trip — protected
    [id]/
      page.tsx                 trip detail — Server Component
      edit/page.tsx            edit trip — protected
  api/
    auth/route.ts              POST sign in / DELETE sign out
    trips/
      route.ts                 GET list / POST create
      [id]/
        route.ts               GET / PUT / DELETE single trip
        days/route.ts          GET days / PUT update day
        hotels/route.ts        GET / POST / PUT hotels
        budget/route.ts        GET / POST / PUT / DELETE budget items

/components
  ThemeProvider.tsx            next-themes wrapper
  ThemeToggle.tsx              light/dark toggle button
  AuthButton.tsx               magic link sign-in dropdown
  NewTripButton.tsx            navigates to /trip/new
  NewTripForm.tsx              create trip form
  TripEditForm.tsx             edit + delete trip form
  DayList.tsx                  useReducer state + optimistic updates
  DayCard.tsx                  collapsible day row
  DayNoteEditor.tsx            textarea with dirty-state save button
  HotelList.tsx                grouped by city with useReducer
  HotelCard.tsx                hotel row with select toggle
  BudgetTracker.tsx            summary cards + line items with useReducer

/lib
  supabaseClient.ts            browser client for Client Components
  supabaseServer.ts            server client for Server Components + Route Handlers
  formatters.ts                pure utility functions
  formatters.test.ts           Vitest unit tests

/types
  trip.ts  day.ts  hotel.ts  budget.ts  index.ts

/supabase
  migrations/
    001_init.sql               table definitions + indexes
    002_rls.sql                Row Level Security policies
  seed.ts                      Germany & Eastern Europe trip seed data
```

---

## Prerequisites

- Node.js 20+
- A [Supabase](https://supabase.com) account (free tier)
- A [Vercel](https://vercel.com) account (free tier)

---

## Local setup

### 1. Clone the repository

```bash
git clone https://github.com/your-username/trip-planner.git
cd trip-planner
```

### 2. Install dependencies

```bash
npm install
```

### 3. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Wait for provisioning to complete (~2 minutes)
3. Go to **Project Settings → API**
4. Copy your **Project URL** and **anon public** key

### 4. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

> `SUPABASE_SERVICE_ROLE_KEY` is under **Project Settings → API → service_role**.
> Never commit this key — it bypasses Row Level Security.

### 5. Run database migrations

Go to your Supabase project → **SQL Editor**, then run each file in order:

```
supabase/migrations/001_init.sql
supabase/migrations/002_rls.sql
```

Paste the contents of each file and click **Run**.

### 6. Seed the database

```bash
npx ts-node supabase/seed.ts
```

Inserts the Germany & Eastern Europe trip with all 15 days, 10 hotels, and 9 budget items.

### 7. Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Authentication

This app uses **Supabase magic link** — no passwords stored anywhere.

To sign in as admin:

1. Click **Sign in** in the top right corner
2. Enter your email address
3. Check your email for the magic link
4. Click the link — you will be redirected back and signed in automatically

Once signed in you can create trips, edit days, select hotels, manage budget items, and mark days as done.

---

## Running tests

```bash
npm run test
```

Tests cover utility functions in `/lib/formatters.ts`:

- `formatEur` — currency formatting
- `formatCostRange` — cost range display
- `tripDuration` — date difference calculation
- `countryFlag` — country code to emoji conversion
- `calcBudgetSummary` — budget aggregation logic
- `calcProgress` — trip completion percentage

---

## Deployment

### Deploy to Vercel

```bash
npm install -g vercel
vercel
```

Or connect the GitHub repository in the Vercel dashboard for automatic deploys on push.

### Environment variables on Vercel

Add these under **Vercel → Project → Settings → Environment Variables**:

| Key | Value |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Your Supabase service role key |
| `NEXT_PUBLIC_SITE_URL` | Your Vercel deployment URL |

### Update Supabase auth redirect URL

After deploying:

1. Go to Supabase → **Authentication → URL Configuration**
2. Add your Vercel URL to **Redirect URLs**:
   ```
   https://your-deployment.vercel.app/auth/callback
   ```

---

## Key technical decisions

**App Router over Pages Router** — Server Components fetch data directly on the server without exposing Supabase keys to the client. `Promise.all()` fetches four tables in parallel on the trip detail page.

**Supabase Auth with magic link** — no passwords to store or hash. Row Level Security policies enforce public read and authenticated write at the database level, not just in application code.

**`useReducer` over multiple `useState`** — `DayList`, `HotelList`, and `BudgetTracker` each manage list state with a reducer. State transitions are explicit: `UPDATE_DAY`, `SET_SAVING`, `DELETE_ITEM`.

**Optimistic updates** — every toggle updates the UI immediately and reverts silently on failure. No loading spinners block interaction.

**Separate `supabaseClient.ts` and `supabaseServer.ts`** — the browser client uses `createBrowserClient`, the server client uses `createServerClient` with cookie handling. Mixing these causes session bugs.

---

## Future improvements

- Row Level Security scoped per user (multi-user support)
- Photo URL field per day
- Packing checklist table
- Transport leg table with booking links
- PDF export via Puppeteer

---

## License

MIT
