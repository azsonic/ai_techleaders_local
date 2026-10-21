---
title: GitHub CI, unit tests, and integration tests
status: implemented
created: 2026-10-21
updated: 2026-10-21
owner: Arunas
---

# GitHub CI, unit tests, and integration tests

## Problem / Goal

Every pull request needs automatic checks that the app builds, lints, and is covered by tests. New features must be fully covered by unit tests. The suite also needs a way to boot a throwaway database and the app, then check the real pages in a browser.

## Scope

### In scope

- GitHub Actions on every pull request: lint, typecheck, build, unit tests, integration tests.
- Vitest as the TypeScript unit-test runner, with 100% statement, branch, function, and line coverage of existing application code.
- Unit tests for the code that exists today, at that threshold.
- An integration harness: Testcontainers PostgreSQL 17, the production Next.js server, and `agent-browser`.
- One integration scenario: home page loads, the admin link opens the admin page, and the page reports a healthy database.
- `AGENTS.md` (and the engineering standards that point at it) state that every new feature is 100% covered by unit tests, and that user-visible flows are added to the integration suite.

### Out of scope

- End-to-end coverage of features that do not exist yet.
- Changing product behavior.
- Hosting, deployment, or branch protection settings on GitHub (the workflow is the check; turning it into a required status is a repository setting).

## Requirements

- Pull requests run, as separate checks: lint, typecheck, build, unit tests, integration tests.
- `npm run test` fails if coverage of application code drops below 100% on statements, branches, functions, or lines.
- Measured code is `packages/*/src/**/*.{ts,tsx}` and `packages/app/next.config.ts`. Test files and the integration harness are not part of that number.
- Unit tests are colocated `*.test.ts` / `*.test.tsx` files.
- Integration tests live in `packages/app/test/integration/`. They start `postgres:17-alpine` with Testcontainers, apply migrations, start `next start` with that `DATABASE_URL`, and drive the browser with `agent-browser`.
- `AGENTS.md` tells every agent that a new feature is not done until its unit tests keep the 100% threshold, and that a new user-visible flow gets an `agent-browser` scenario.

## Acceptance criteria

- [x] `.github/workflows/ci.yml` runs lint, typecheck, build, unit tests, and integration tests on pull requests.
- [x] `npm run test` passes with 100% coverage of the measured code.
- [x] `npm run test:integration` boots a throwaway Postgres and the app, and `agent-browser` confirms the home page and a healthy admin database check.
- [x] `npm run lint`, `npm run typecheck`, and `npm run build` pass.
- [x] `AGENTS.md` states the 100% unit-test rule and the integration harness.

## Technical approach

- Vitest + V8 coverage at the repo root (shared tooling). `@testing-library/react` and jsdom for components.
- `@testcontainers/postgresql` and `agent-browser` are dependencies of `@devmentor/app`, which owns the harness.
- `server-only` is aliased to an empty module in Vitest so server modules can be imported.
- Typecheck stays a separate check because the repo already requires it before work is done.

## Open questions

None. Scope was set by the request on 2026-10-21.

## Notes

The user is not a programmer and asked not to reopen this as a questionnaire. Technical defaults (Vitest, coverage of application source, Testcontainers plus `agent-browser` for the home and admin health flow, typecheck as its own check) are recorded here.

V8 reports three re-export-only files as empty (`packages/core/src/index.ts`, `packages/db/src/index.ts`, `packages/ui/src/lib/utils.ts`). They have no executable lines. The modules they re-export are in the 100% total. `agent-browser@0.39` warns that it wants Node 24; that engines field is for building the CLI from source. The published binary runs on this repo's Node 22.
