# Repository Governance

This document captures the repository rules that should be configured in GitHub to keep `main` stable and reviewable.

## Branch protection for `main`

Enable these settings in GitHub branch protection:

- Require a pull request before merging.
- Require at least 1 approving review.
- Dismiss stale approvals when new commits are pushed.
- Require status checks to pass before merging.
- Restrict direct pushes to `main`.
- Require linear history if your team prefers squash merges only.

## Required status checks

Mark these checks as required:

- `Quality`
- `Build`
- `Analyze`
- `TruffleHog`

## Workflow model

- Use GitHub Flow: branch from `main`, open a PR, review, merge, deploy.
- Keep PRs small enough to review in one sitting.
- Document schema or security changes in the PR summary.
- Use Conventional Commits for commit history and release note generation.

## Release management

- Track upcoming changes in `CHANGELOG.md` under `Unreleased`.
- Cut tags with semantic versions such as `v0.3.0`.
- Update documentation links, screenshots, and legal pages before a tagged release if behavior changed.
- Treat Supabase migrations as release artifacts and note rollback risk in the PR.

## Dependency management

- Dependabot opens weekly updates for npm packages and GitHub Actions.
- Security-sensitive updates should be prioritized ahead of feature work.
- Review lockfile diffs and rerun the full local validation suite before merging dependency PRs.
