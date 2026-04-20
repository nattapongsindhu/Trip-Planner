# Trip Planner

![Next.js](https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=flat-square&logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-green?style=flat-square&logo=supabase)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38bdf8?style=flat-square&logo=tailwindcss)
![Vercel](https://img.shields.io/badge/Deployed-Vercel-black?style=flat-square&logo=vercel)
![License](https://img.shields.io/badge/License-MIT-yellow?style=flat-square)

A full-stack trip planning application built with Next.js, Supabase, and TypeScript.

## Features

- **Authentication** — Email/password and magic-link login via Supabase Auth
- **Role-based access** — Admin and Staff roles with RLS enforcement
- **Trip management** — Create, edit, and delete trips
- **Itinerary** — Add and manage day-by-day plans
- **Hotel** — Track accommodation per trip
- **Transportation** — Log flights, trains, buses, and other transport
- **Budget** — Track estimated and actual costs in USD
- **Notes** — Free-text notes per trip
- **Public trips** — Share trips via public link

## Demo Credentials

| Role  | Email                  | Password  |
|-------|------------------------|-----------|
| Admin | admin@company.com      | admin123  |
| Staff | staff@company.com      | staff123  |

## Tech Stack

- **Frontend** — Next.js 14, TypeScript, Tailwind CSS
- **Backend** — Supabase (Auth, PostgreSQL, RLS)
- **Deployment** — Vercel

## Local Development

```bash
# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Fill in your Supabase URL and keys

# Run development server
npm run dev
```

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
```
