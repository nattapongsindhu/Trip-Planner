# Contributing

Thanks for contributing to Trip Planner. This repository follows a lightweight GitHub Flow so changes stay easy to review, test, and deploy.

## Before you start

- Read the [Setup Guide](./docs/SETUP.md) and verify `npm run lint`, `npm run typecheck`, and `npm run test:coverage` pass locally.
- Review the [Security Policy](./SECURITY.md) before touching auth, API routes, or environment handling.
- Open an issue or draft PR early for work that changes the schema, access control, or deployment workflow.

## Branching strategy

- Branch from `main`.
- Keep branches short-lived and focused on one concern.
- Rebase or merge `main` before opening a PR if the branch is more than a day old.
- Merge through pull requests only. Do not push directly to `main`.

## Commit conventions

Use Conventional Commits so release notes and changelog entries stay readable.

- `feat: add itinerary loading skeleton`
- `fix(auth): validate redirect URL before sign-in`
- `docs: update setup guide for seed script`
- `chore(deps): bump next to patched release`

## Pull requests

- Use the pull request template.
- Include screenshots or short recordings when UI behavior changes.
- Call out Supabase migrations, policy changes, or new environment variables explicitly.
- Update docs and `CHANGELOG.md` when behavior or workflow changes in a user-visible way.

## Required local checks

Run these commands before asking for review:

```bash
npm run lint
npm run typecheck
npm run test:coverage
npm run build
```

If you touched the seed data or migrations, also run:

```bash
npm run seed
```

## Security expectations

- Never commit `.env`, `.env.local`, secret or service-role keys, or third-party tokens.
- Use Vercel environment variables for deployment secrets.
- Rotate any credential immediately if it is ever exposed, then purge it from git history if needed.
- Report vulnerabilities privately as described in [SECURITY.md](./SECURITY.md).

## Releases

- Update `CHANGELOG.md` under `Unreleased`.
- Tag releases with semantic versions such as `v0.3.0`.
- Keep the `main` branch deployable at all times.

## Branch protection

Recommended branch protection settings for `main` are documented in [Repository Governance](./docs/REPOSITORY-GOVERNANCE.md).
