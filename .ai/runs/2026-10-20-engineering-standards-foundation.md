---
title: Adopt the engineering standards (foundation pass)
date: 2026-10-20
agent: Cursor agent
spec: .ai/specs/2026-10-20-engineering-standards-foundation.md
status: success
---

# Adopt the engineering standards (foundation pass)

## Goal

Implement `.ai/docs/engineering-standards.md` translated onto the existing architecture, foundation layers only (spec approved 2026-10-20).

## Summary of changes

- `.ai/docs/engineering-standards.md` — rewritten so placement, dependency direction, `connection()`, route groups and migration status match `AGENTS.md`. Principles, security rules and the review checklist kept.
- `AGENTS.md` — added Engineering standards, Domain concept convention, Reusable API & UI layer; noted ESLint boundaries, `withRequestScope`, `components/ui/`, `.ai/docs/`.
- `README.md` — envelope, `apiCall`, concept folders, `components/ui` + `backend`.
- `eslint.boundaries.mjs` + each package's eslint config — `no-restricted-imports` for package rules and deep imports; `no-restricted-syntax` forbids `fetch("/api…")` except in `api-call.ts`.
- `packages/core/src/http/` — `AppError` hierarchy (`kind` + `code`), `ApiResult` envelope, `createApiHandler`. Old `core/src/errors.ts` removed.
- `packages/app/src/http/api-handler.ts` — `apiHandler` with `unstable_rethrow`.
- `packages/ui/src/backend/` — `apiCall` / `apiCallOrThrow`, `LoadingMessage`, `ErrorMessage`, `EmptyState`. `@devmentor/core` added as a `ui` dependency.
- shadcn primitives moved to `ui/src/components/ui/`; both `components.json` `ui` aliases updated.
- `HealthRepository` → `db/src/repositories/health/`. `withRequestScope` added; `HealthService` throws `ServiceUnavailableError`. `/api/health` is the `apiHandler` reference. Admin health panel uses `apiCall` + feedback components.

## Verification

- `npm run lint`, `npm run typecheck`, `npm run build` — pass.
- Temporary forbidden imports in `core`/`db`/`ui` and `fetch("/api/health")` in `app` each failed lint (17 errors across the four files); files deleted afterwards. External `fetch("https://example.com/api")` was not flagged.
- `npx shadcn@latest add badge button --dry-run` from `packages/app` targets `../ui/src/components/ui/` (`badge` create, `button` skip identical).
- Docker PostgreSQL, `npm run start`:
  - DB down at first request: `503 {"ok":false,"error":{"code":"database_unavailable","message":"Database is unavailable"}}` (no stack in the body).
  - DB started: `200 {"ok":true,"data":{"status":"ok","db":"ok"}}` without restarting the app.
  - DB stopped after init: same 503; recovered again to 200.
- Browser `/admin`: loading → "Database connection is healthy." With DB down: shared `ErrorMessage` "Health check failed / Database is unavailable". `/` still renders the frontend hero.
- `npm audit`: 10 high (transitive `braces`/`micromatch`/`fast-glob` via `awilix`, `eslint-config-next`, `shadcn`). No new runtime deps added this pass. Not fixed here.

## Issues / follow-ups

- Deferred (recorded in the standards doc §5): `makeCrudRoute`, `CrudForm`, `DataTable`, Zod/`validators/`, `auth.ts`, events, ports, pino, zod `env.ts`.
- `npm audit` findings are pre-existing / transitive; leave for a dedicated hygiene pass.

## Lessons recorded

- [Check imported standards docs against `AGENTS.md` first](../lessons.md)
- [Catch-all route wrappers must call `unstable_rethrow`](../lessons.md)
