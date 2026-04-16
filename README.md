# Trip Planner

[![Tests](https://github.com/nattapongsindhu/Trip-Planner/actions/workflows/test.yml/badge.svg)](https://github.com/nattapongsindhu/Trip-Planner/actions/workflows/test.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-98.6%25-blue.svg)](https://github.com/nattapongsindhu/Trip-Planner)

A full-stack multi-trip planning application built with Next.js 14, TypeScript, Supabase, and Tailwind CSS.

Designed as a portfolio project demonstrating CRUD operations, server-side authentication, Row Level Security, optimistic UI updates, and real-time budget tracking.

**Live demo:** https://trip-planner-rho-coral.vercel.app

---

## About the developer

Built by **Nattapong Sindhu** — a student studying IT Cybersecurity at Los Angeles City College while working full-time as a USPS Maintenance Mechanic. This project demonstrates production-grade security practices (Row Level Security, magic link authentication, environment variable validation) learned through coursework and self-study, applied to a real full-stack application.

**Focus areas:** IT Security · DevSecOps · Production workflows · Defense in depth

---

## Features

- **Multi-trip management** — create, edit, and delete multiple trips
- **Day-by-day itinerary** — 15-day itinerary with city, transport, highlights, and cost per day
- **Per-trip visibility control** — mark trips as public or private with database-enforced access policies
- **Day notes** — private notes on each day, editable by admin only
- **Hotel tracking** — compare options per city, mark selected accommodation
- **Budget tracker** — line items grouped by category, toggle between estimate and actual
- **Progress tracking** — mark days as done, visual progress bar
- **Public read / private write** — public trips viewable by anyone, editing requires authentication
- **Light + dark mode** — system preference detected, manual toggle available

---

## Tech stack

| Layer | Technology |
|---|---|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (magic link) |
| Styling | Tailwind CSS |
| Validation | Zod (environment variables) |
| Testing | Vitest |
| CI/CD | GitHub Actions → Vercel |

---

## Security

This project takes security seriously. Key measures:

- **Row Level Security** enforced at the PostgreSQL layer — not just in application code
- **Magic link authentication** — no passwords stored in the database
- **Environment variable validation** at startup via Zod (see `lib/env.ts`)
- **Separate `anon` and `service_role` keys** — service role key is never exposed to client code
- **Automated testing** on every pull request via GitHub Actions
- **HTTPS enforced** by Vercel
- **No secrets in source control** — `.env.local` in `.gitignore`

See [`SECURITY.md`](./SECURITY.md) for the vulnerability disclosure policy.

---

## Documentation

- [**Setup Guide**](./docs/SETUP.md) — local development and deployment
- [**Security Policy**](./SECURITY.md) — vulnerability disclosure
- [**Privacy Policy**](https://trip-planner-rho-coral.vercel.app/privacy) — data handling
- [**Terms of Service**](https://trip-planner-rho-coral.vercel.app/terms) — usage terms

---

## Quick start

```bash
git clone https://github.com/nattapongsindhu/Trip-Planner.git
cd Trip-Planner
npm install
cp .env.example .env.local  # fill in Supabase keys
npm run dev
```

Full instructions in [`docs/SETUP.md`](./docs/SETUP.md).

---

## Project structure

```
/app
  page.tsx                     trips list — Server Component
  layout.tsx                   root layout with ThemeProvider + Footer
  privacy/page.tsx             privacy policy page
  terms/page.tsx               terms of service page
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
  Footer.tsx                   legal links + copyright
  VisibilityToggle.tsx         public/private toggle per trip
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
  env.ts                       Zod-validated environment variables
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
    003_visibility.sql         is_public flag + privacy-aware RLS
  seed.ts                      Germany & Eastern Europe trip seed data

/.github/workflows
  test.yml                     automated tests on PR
```

---

## Key technical decisions

**App Router over Pages Router** — Server Components fetch data directly on the server without exposing Supabase keys to the client. `Promise.all()` fetches four tables in parallel on the trip detail page.

**Supabase Auth with magic link** — no passwords to store or hash. Row Level Security policies enforce public read and authenticated write at the database level, not just in application code.

**`useReducer` over multiple `useState`** — `DayList`, `HotelList`, and `BudgetTracker` each manage list state with a reducer. State transitions are explicit: `UPDATE_DAY`, `SET_SAVING`, `DELETE_ITEM`.

**Optimistic updates** — every toggle updates the UI immediately and reverts silently on failure. No loading spinners block interaction.

**Separate `supabaseClient.ts` and `supabaseServer.ts`** — the browser client uses `createBrowserClient`, the server client uses `createServerClient` with cookie handling. Mixing these causes session bugs.

**Zod environment validation** — `lib/env.ts` validates all environment variables at application startup. The app refuses to start if any required variable is missing or malformed, preventing silent configuration bugs.

---

## Running tests

```bash
npm run test           # run once
npm run test:watch     # watch mode
```

Tests run automatically on every pull request via GitHub Actions.

---

## Future improvements

**Near-term**
- Multi-user support with `user_id`-scoped RLS policies
- Rate limiting on API routes (Upstash Redis or Vercel Edge Config)
- Error tracking (Sentry or LogRocket)

**Medium-term**
- Photo upload per day (Supabase Storage)
- Packing checklist table
- Transport leg table with booking links

**Long-term**
- PDF export (Puppeteer / React PDF)
- Internationalization (next-intl)
- Google Maps integration

---

## License

MIT — see [`LICENSE`](./LICENSE).
