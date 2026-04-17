# Security Policy

## Supported Versions

This project is a portfolio demonstration. Only the latest version on the `main` branch receives security updates.

| Version | Supported |
|---|---|
| `main` (latest) | Yes |
| Any other branch or tag | No |

---

## Reporting a Vulnerability

If you discover a security vulnerability in Trip Planner, please report it privately. **Do not open a public GitHub issue.**

### How to report

Email: **nattapongsindhu@gmail.com**

Include the following information:

- A description of the vulnerability
- Steps to reproduce the issue
- The potential impact you observed
- Any suggested mitigation (optional)

### What to expect

- **Acknowledgment** within 72 hours
- **Initial assessment** within 7 days
- **Fix timeline** communicated based on severity:
  - Critical: patch within 7 days
  - High: patch within 14 days
  - Medium/Low: patch within 30 days

Once the issue is resolved, we will credit you in the release notes unless you prefer to remain anonymous.

---

## Scope

### In scope

- Source code in this repository
- The live deployment at `https://trip-planner-rho-coral.vercel.app`
- Row Level Security policies in `supabase/migrations/`
- Authentication flow (magic link sign-in)
- API routes under `/api/`

### Out of scope

- Vulnerabilities in third-party dependencies (report to the upstream project)
- Vulnerabilities in Supabase or Vercel infrastructure (report to those vendors directly)
- Denial-of-service attacks on the demo deployment
- Social engineering of the project maintainer
- Issues requiring physical access to the maintainer's machine

---

## Known Limitations

This project is a portfolio demonstration and has the following **documented security limitations** that are not considered vulnerabilities:

1. **Single-admin model** — any authenticated user currently has admin privileges on all trips. Multi-tenant isolation is on the roadmap.
2. **No rate limiting** — API routes do not enforce per-user request limits.
3. **Public read access by default** — existing trips are readable by anyone with the URL. Per-trip visibility controls (`is_public` flag) are being added.
4. **No automated backups** — Supabase free tier does not include automated database backups.

These limitations are documented in the README `Future improvements` section and are tracked for resolution.

---

## Security Best Practices Used

This project implements the following security measures:

- **Row Level Security (RLS)** enforced at the PostgreSQL layer, not application layer
- **Magic link authentication** — no passwords stored in the database
- **Environment variable validation** via Zod (`lib/env.ts`) at application startup
- **Separate anon and service role keys** — the service role key is never exposed to the client
- **Server-side session management** via middleware
- **HTTPS enforced** by Vercel's default deployment configuration
- **No secrets in source control** — `.env.local` is in `.gitignore` and protected

---

## Responsible Disclosure

We follow a 90-day coordinated disclosure timeline. If a fix is not deployed within 90 days of the initial report, researchers are free to disclose publicly after notifying the maintainer.

Thank you for helping keep Trip Planner and its users safe.
