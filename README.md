<div align="center">

# Trip Planner

<p>
  <strong>Plan gentle trips with clear details, tidy budgets, and a little floral charm.</strong>
</p>

<p>
  ✿ minimal travel planning app • public/private trips • day-by-day itinerary • budget tracking ✿
</p>

<p>
  <a href="https://github.com/nattapongsindhu/Trip-Planner/actions/workflows/test.yml">
    <img src="https://github.com/nattapongsindhu/Trip-Planner/actions/workflows/test.yml/badge.svg" alt="Tests">
  </a>
  <a href="https://trip-planner-rho-coral.vercel.app">
    <img src="https://img.shields.io/badge/demo-live-7fb685?style=flat-square" alt="Live Demo">
  </a>
  <a href="https://nextjs.org/">
    <img src="https://img.shields.io/badge/Next.js_14-App_Router-111111?style=flat-square&logo=nextdotjs&logoColor=white" alt="Next.js 14">
  </a>
  <a href="https://www.typescriptlang.org/">
    <img src="https://img.shields.io/badge/TypeScript-5.x-3178c6?style=flat-square&logo=typescript&logoColor=white" alt="TypeScript">
  </a>
  <a href="https://supabase.com/">
    <img src="https://img.shields.io/badge/Supabase-Postgres_+_Auth-3ecf8e?style=flat-square&logo=supabase&logoColor=white" alt="Supabase">
  </a>
  <a href="https://tailwindcss.com/">
    <img src="https://img.shields.io/badge/Tailwind_CSS-3.4-38bdf8?style=flat-square&logo=tailwindcss&logoColor=white" alt="Tailwind CSS">
  </a>
  <a href="https://vitest.dev/">
    <img src="https://img.shields.io/badge/Vitest-tested-729b79?style=flat-square&logo=vitest&logoColor=white" alt="Vitest">
  </a>
  <a href="./LICENSE">
    <img src="https://img.shields.io/badge/license-MIT-f4c2c2?style=flat-square" alt="MIT License">
  </a>
</p>

<p>
  <a href="https://trip-planner-rho-coral.vercel.app"><strong>Live Demo</strong></a>
  ·
  <a href="./docs/SETUP.md"><strong>Setup Guide</strong></a>
  ·
  <a href="./SECURITY.md"><strong>Security Policy</strong></a>
</p>

</div>

## Overview

Trip Planner is a full-stack multi-trip planning app built with Next.js 14, TypeScript, Supabase, and Tailwind CSS.
It is designed to keep trip details calm and organized: destinations, hotels, budgets, day notes, progress, and privacy controls all live in one tidy flow.

This project also serves as a portfolio piece focused on practical full-stack fundamentals:

- Clean CRUD flows for trips, hotels, days, and budget items
- Server-side auth with Supabase magic links
- Row Level Security enforced at the database layer
- Optimistic UI for fast editing without blocking the experience
- Environment validation and test coverage for safer deployments

## Flower Notes

> ❀ Soft look, serious structure.  
> Plan the pretty parts and the practical parts together.

## Features

| Feature | What it does |
|---|---|
| Multi-trip dashboard | Create, browse, edit, and delete multiple trips from one clean home page |
| Day-by-day itinerary | Manage up to 15 days with city, transport, highlights, and daily cost |
| Public or private visibility | Share selected trips publicly while keeping others private |
| Hotel comparison | Track hotel options by city and mark the chosen stay |
| Budget tracker | Organize estimated and actual costs by category |
| Day notes | Save private notes for planning details and reminders |
| Progress view | Mark itinerary days complete and monitor trip progress |
| Light and dark mode | Match system theme or switch manually |

## Why This Repo Feels Solid

- Server Components fetch trip data on the server, which keeps sensitive logic out of the browser
- Supabase RLS protects data at the database layer instead of relying only on UI checks
- `useReducer` is used in complex list flows so updates stay explicit and predictable
- Zod validates environment variables at startup to catch config mistakes early
- Vitest covers pure utility logic and GitHub Actions runs tests automatically

## Tech Stack

| Layer | Tooling |
|---|---|
| Framework | Next.js 14 with App Router |
| Language | TypeScript |
| Database | Supabase PostgreSQL |
| Authentication | Supabase Auth with magic link |
| Styling | Tailwind CSS |
| Theme | `next-themes` |
| Validation | Zod |
| Testing | Vitest |
| Deployment | Vercel |

## Quick Start

```bash
git clone https://github.com/nattapongsindhu/Trip-Planner.git
cd Trip-Planner
npm install
cp .env.example .env.local
npm run dev
```

Open `http://localhost:3000` after adding your Supabase keys to `.env.local`.

For the full local setup, migrations, and deployment steps, see [docs/SETUP.md](./docs/SETUP.md).

## Environment Variables

Add these values to `.env.local`:

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public client key protected by RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only key used for privileged operations |
| `NEXT_PUBLIC_SITE_URL` | Base URL for auth redirects |

## Project Structure

```text
app/
  page.tsx                 trips dashboard
  trip/[id]/page.tsx       trip detail page
  trip/new/page.tsx        create trip page
  trip/[id]/edit/page.tsx  edit trip page
  api/                     auth + trip CRUD routes

components/
  BudgetTracker.tsx
  DayList.tsx
  HotelList.tsx
  NewTripForm.tsx
  TripEditForm.tsx

lib/
  env.ts                   environment validation
  formatters.ts            pure helpers
  supabaseClient.ts        browser client
  supabaseServer.ts        server client

supabase/
  migrations/              schema + RLS + visibility rules
  seed.ts                  sample trip data
```

## Security

Security is part of the design, not a later add-on:

- Row Level Security is enforced in PostgreSQL
- Magic link authentication avoids password storage
- Service role secrets stay server-side
- `.env.local` is ignored by Git
- Tests run on pull requests via GitHub Actions

Read the full policy in [SECURITY.md](./SECURITY.md).

## Documentation

- [Setup Guide](./docs/SETUP.md)
- [Security Policy](./SECURITY.md)
- [Privacy Policy](https://trip-planner-rho-coral.vercel.app/privacy)
- [Terms of Service](https://trip-planner-rho-coral.vercel.app/terms)

## Roadmap

- Multi-user support with user-scoped policies
- Rate limiting on API routes
- Error tracking integration
- Photo uploads for itinerary days
- Packing checklist support
- PDF export for printable trip summaries
- Internationalization
- Maps integration

## About the Developer

Built by **Nattapong Sindhu**, an IT Cybersecurity student at Los Angeles City College and a full-time USPS Maintenance Mechanic.
This project reflects an interest in secure app design, production-friendly workflows, and thoughtful full-stack engineering.

## License

Released under the [MIT License](./LICENSE).

<div align="center">
  <sub>✿ made for calm planning, neat details, and lovely little trips ✿</sub>
</div>
