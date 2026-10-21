---
title: Adopt the engineering standards (foundation pass)
status: implemented
created: 2026-10-20
updated: 2026-10-20
owner: Arunas
---

# Adopt the engineering standards (foundation pass)

## Problem / Goal

`.ai/docs/engineering-standards.md` defines naming, placement, a reusable API/UI layer, security rules and a review checklist for DevMentor. It was written against a different bootstrap, and it contradicts the binding architecture in `AGENTS.md` in several places:

| Topic | Standards doc | Repo / `AGENTS.md` |
|---|---|---|
| Dependency direction | `app → core → db`; `ui` must not import `core` | `db → core`, `ui → core`; `core` imports nothing |
| Services & DI | `core/src/services/<concept>/`, container in `core`, no `modules/` | `app/src/modules/<feature>/`, container in `app/src/di/container.ts` (services need the `EntityManager`; `core` can't import MikroORM) |
| Per-request routes | `export const dynamic = "force-dynamic"` | `cacheComponents` is on; Next 16 removes `dynamic` under it, so `await connection()` is used |
| Route groups | persona groups `(marketing)`, `(auth)`, `(student)`, `(mentor)` | `(frontend)` and `(backend)/admin` |
| Migration steps 1 and 3 | move `user.entity.ts`, `mentor-profile.entity.ts`, `user.service.ts`; refactor `/admin/users` | none of these exist; only `/api/health` exists |
| `docs/product-scope.md` | update the "no DI container" line | file isn't in this repo |

Goal: adopt the standards **translated onto the current architecture** (decision 2026-10-20, Arunas: `AGENTS.md` stays binding), and build only the foundation layers now, proven on `/api/health`.

## Scope

### In scope

1. **Reconcile the docs.**
   - Edit `.ai/docs/engineering-standards.md` so it matches the repo: placement table, dependency direction, `connection()` instead of `force-dynamic`, route groups, shared envelope type, kebab-case file names, migration steps rewritten for the real repo. Keep everything else (principles, security rules, code quality, review checklist) as is.
   - `AGENTS.md`: add "Domain concept convention" and "Reusable API & UI layer" subsections after "Monorepo layout" (adapted from section 3 of the doc). Add `.ai/docs/` to the `.ai/` folder map. Point to the standards doc as the source of the naming table, security rules and review checklist.
   - `README.md`: small update to the architecture section (shared layers, ESLint boundaries).
2. **ESLint import boundaries** (`no-restricted-imports`), from one shared root helper `eslint.boundaries.mjs` used by each package's config:
   - `core`: no `react*`, `next*`, `@mikro-orm/*`, `awilix`, `@devmentor/*`.
   - `db`: no `react*`, `next*`, `awilix`, `@devmentor/app`, `@devmentor/ui`.
   - `ui`: no `@mikro-orm/*`, `awilix`, `@devmentor/db`, `@devmentor/app`.
   - All packages: no deep imports across packages (relative `../…/<pkg>/src/…` or `@devmentor/<pkg>/src/…`).
   - `app` + `ui`: no `fetch("/api…")` outside `ui/src/backend/api/api-call.ts` (`no-restricted-syntax`).
3. **`packages/core/src/http/`**
   - `errors.ts`: `AppError` gains an HTTP-agnostic `kind`. Subclasses: `ValidationError` (with `fieldErrors`), `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ConflictError`, and `ServiceUnavailableError`. The last one isn't in the doc; it's needed so the health check keeps returning 503. `AppError` moves from `core/src/errors.ts` into this file.
   - `envelope.ts`: `ApiResult<T>` (`{ ok: true, data }` / `{ ok: false, error: { code, message, fieldErrors? } }`) and the `CSRF_HEADER` name. One definition shared by server and client, because `ui` may import `core`.
   - `api-handler.ts`: `createApiHandler({ rethrow })` builds `apiHandler(fn)`, which wraps a route handler using standard `Request`/`Response` (no Next import). It maps `AppError` kinds to status codes and the envelope. It logs unexpected errors and 5xx `AppError`s with `console.error`, and returns a generic 500 message for unexpected errors (no stack traces sent to the client). The app's configured instance is `packages/app/src/http/api-handler.ts`, which passes `unstable_rethrow`.
   - Exported from `@devmentor/core`. The existing `Result` helper stays.
4. **`packages/ui/src/backend/`** (new exports `@devmentor/ui/backend/api/*`, `@devmentor/ui/backend/feedback/*`)
   - `api/api-call.ts`: `apiCall<T>(path, init?)` returns `ApiResult<T>`. It always sends `CSRF_HEADER`, parses the body defensively (`readJsonSafe`), and turns network errors and non-envelope bodies into `{ ok: false }`. `apiCallOrThrow<T>` returns `data` or throws `ApiCallError`.
   - `feedback/loading-message.tsx`, `feedback/error-message.tsx`, `feedback/empty-state.tsx`: presentational, shadcn-token styling.
5. **shadcn primitives move to `ui/src/components/ui/`** (`button`, `card`). Update the `ui` alias in both `components.json` files and the admin page imports, so concept components (`components/<concept>/`) don't mix with primitives. Check with the shadcn CLI that new primitives still land in `components/ui/`.
6. **Reference example: `/api/health`.**
   - `app/src/di/container.ts`: add `withRequestScope(fn)`. It creates the scope, runs `fn(cradle)` and disposes the scope in `finally`. If the root container can't initialise (the database is unreachable), it throws `ServiceUnavailableError` with the original error as `cause`.
   - `HealthService.check()` returns `{ status: "ok", db: "ok" }` or throws `ServiceUnavailableError`. No `console.error`, no catch-and-return.
   - `api/health/route.ts` becomes `export const GET = apiHandler(async () => { await connection(); return withRequestScope(...) })`, with no `try/catch`.
   - `HealthRepository` moves to `db/src/repositories/health/health.repository.ts` (concept-folder convention).
   - Admin dashboard: a colocated client component `(backend)/admin/health-status-panel.tsx` (`HealthStatusPanel`) calls `apiCall("/api/health")` and renders the result with `LoadingMessage` / `ErrorMessage`. It replaces the raw "Health check" link.

### Out of scope (deferred until the first concept needs them; recorded in the doc's migration steps)

- `makeCrudRoute`, `CrudForm`, `DataTable`, Zod and `core/src/validators/`.
- `core/src/http/auth.ts` (`requireSession`, ownership checks), JWT, cookies, bcrypt, rate limiting, server-side CSRF header check (no session or state-changing route exists yet).
- `core/src/events/`, ports/adapters, pino logger, zod-validated `env.ts`.
- Persona route groups (added inside `(frontend)` when their first page lands).
- Test framework (separate spec). This pass is verified by lint, typecheck, build and manual checks.

## Requirements

- `core` stays free of React, Next.js, MikroORM and Awilix. `apiHandler` uses only web-standard `Request`/`Response`.
- No route writes its own `try/catch`. No component calls `fetch("/api…")` directly.
- **Contract change:** `/api/health` returns the envelope, `200 {"ok":true,"data":{"status":"ok","db":"ok"}}` or `503 {"ok":false,"error":{"code":"database_unavailable","message":"…"}}`. Status codes are unchanged. Nothing reads this response from code today.
- File names in `ui` are kebab-case (matching shadcn and `hero.tsx`); component and function names are PascalCase / camelCase.
- No new runtime dependencies.

## Acceptance criteria

- [x] `.ai/docs/engineering-standards.md` no longer contradicts `AGENTS.md`, and `AGENTS.md` has the two new subsections and the `.ai/docs/` entry.
- [x] Each boundary rule fires: a temporary forbidden import in `core`, `db` and `ui`, and a raw `fetch("/api/health")` in `app`, fail `npm run lint`. They are removed afterwards.
- [x] `npm run lint`, `npm run typecheck` and `npm run build` pass.
- [x] Database up: `GET /api/health` returns `200` with `{ ok: true, data: { status: "ok", db: "ok" } }`.
- [x] Database stopped: `GET /api/health` returns `503` with `{ ok: false, error: { code: "database_unavailable" } }`, no stack trace in the body, and it recovers without a restart. Checked both when the stop happens before the first request (ORM init fails) and after (ping fails).
- [x] `/admin` shows the health widget: loading, then healthy; with the database stopped, the shared error message. No console errors.
- [x] `/` and `/admin` still render with correct styles after the shadcn move. The shadcn CLI resolves new primitives to `packages/ui/src/components/ui/`.
- [x] `npm audit` was run, and its result is recorded in the run log.

## Technical approach

1. Docs first (standards doc, `AGENTS.md`, `README.md`), so the convention is written down before the code.
2. ESLint boundaries helper and per-package configs. Prove each rule fires.
3. `core/src/http` (errors, envelope, `apiHandler`). Run typecheck.
4. Move shadcn primitives, update aliases and imports, and check with the CLI.
5. `ui/src/backend` (`apiCall`, feedback components) and the new `exports`.
6. Health refactor (`withRequestScope`, service, route, repository move), then the admin widget.
7. Full verification against the acceptance criteria using Docker PostgreSQL, and the browser for `/admin`. Write the run log `.ai/runs/2026-10-20-engineering-standards-foundation.md`.

Status mapping in `apiHandler`: `validation` → 400, `unauthorized` → 401, `forbidden` → 403, `not_found` → 404, `conflict` → 409, `unavailable` → 503, anything else → 500 with code `internal_error`.

## Open questions

None. Resolved 2026-10-20 (Arunas): adapt the doc to `AGENTS.md`; foundation scope only.

## Notes
