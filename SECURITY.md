# Security Policy

## Supported versions

This repository is maintained as a portfolio application. Only the latest code on the `main` branch is supported for security fixes.

| Version | Supported |
| --- | --- |
| `main` | Yes |
| Older branches or tags | No |

## Reporting a vulnerability

Please report vulnerabilities privately. Do not open a public GitHub issue for security problems.

- Email: **nattapongsindhu@gmail.com**
- Include impact, reproduction steps, affected routes or tables, and suggested mitigation if you have one.

## Response targets

- Acknowledgment within 72 hours
- Initial triage within 7 days
- Remediation target based on severity

## Scope

In scope:

- Source code in this repository
- The live deployment at `https://trip-planner-rho-coral.vercel.app`
- Supabase schema and RLS migrations
- API routes and auth flows

Out of scope:

- Third-party vulnerabilities in Supabase, Vercel, or npm packages that are not caused by this repository
- Social engineering of the maintainer
- Denial-of-service testing against the public demo

## Security controls in place

- Row Level Security enforced at the database layer
- Magic link authentication with no locally stored passwords
- Shared environment validation before Supabase clients are created
- Separate public and service-role credentials
- GitHub Actions quality gates for linting, type checking, tests, and production builds
- CodeQL analysis for static application security testing
- TruffleHog secret scanning on pull requests and pushes
- Dependabot updates for dependencies and GitHub Actions

## Secret handling requirements

- Never commit `.env`, `.env.local`, service role keys, or third-party tokens.
- Store deployment secrets in Vercel Environment Variables.
- If a secret is ever exposed, rotate it immediately and purge it from git history when appropriate.
- Treat historical secret exposure as an incident even if the file was later deleted.

## Known limitations

The following are documented limitations, not hidden vulnerabilities:

1. The app still follows a single-admin model rather than per-user ownership.
2. API routes do not yet enforce rate limits.
3. Public trips are discoverable by URL unless marked private.
4. Free-tier Supabase does not provide production-grade backup guarantees.

## Responsible disclosure

This project follows coordinated disclosure. Once a fix is available, public disclosure is welcome. If no fix is deployed within 90 days, coordinated public disclosure may proceed after notifying the maintainer.
