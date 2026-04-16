# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project aims to follow [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- CI quality gates for linting, type checking, coverage, CodeQL, and secret scanning.
- Repository governance docs, issue templates, and pull request template.
- Route-level loading and error states for the dashboard and trip detail page.

### Changed

- Environment variables are validated through shared helpers before Supabase clients are created.
- Seed workflow now runs through `npm run seed` with `.env.local` loading built in.
- Supabase config now prefers publishable and secret API keys, while temporarily accepting legacy anon and service-role names during rollout.

## [0.2.0] - 2026-04-16

### Added

- Per-trip visibility controls with privacy-aware RLS.
- Security policy, setup guide, and baseline GitHub Actions workflow.
- Zod environment schema for Supabase configuration.
