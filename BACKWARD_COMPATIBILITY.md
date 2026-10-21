# Backward compatibility

DevMentor is a single deployable app, not a published library, so "compatibility" here means: do not silently break the things other code, other environments or stored data already depend on. Review skills check every change against this file; implementation skills warn when a change violates it.

Pre-release note: the product has no production users or data yet, so the deprecation windows below are deliberately short. Tighten them when the first production deploy happens, and record the date here.

## Protected surfaces

| # | Surface | Where it lives | Breaking change | Required path |
|---|---|---|---|---|
| 1 | **API envelope and error codes** | `ApiResult<T>`, `ApiErrorBody`, `CSRF_HEADER`, the `AppError` subclasses and their status mapping (`packages/core/src/http/`) | Changing the `{ ok, data }` / `{ ok: false, error: { code, message, fieldErrors? } }` shape; renaming or removing an error `code`; changing a status mapping; renaming the CSRF header | Additive changes only (new optional fields, new codes). A breaking change needs a spec, an update of every consumer (`apiCall`, routes, tests) in the same PR, and a lesson/note if clients outside the repo could exist. |
| 2 | **HTTP routes under `/api/*`** | `packages/app/src/app/api/**/route.ts` (today: `GET /api/health`) | Removing or renaming a route or method; removing or retyping a response field; making a request field required; tightening validation of previously accepted input | Keep the old route/field working for one release behind the new one, or version the route; document the change in the PR body. |
| 3 | **Workspace package public entries** | `@devmentor/core` and `@devmentor/db` (`.` → `src/index.ts`); `@devmentor/ui` subpaths declared in `exports` (`./globals.css`, `./components/*`, `./frontend/*`, `./backend/api/*`, `./backend/feedback/*`, `./lib/*`, `./hooks/*`) | Removing, renaming or changing the signature or behavior of an exported symbol or subpath; adding a deep import path that bypasses `exports` | Update every in-repo consumer in the same PR (lint's `no-restricted-imports` and `npm run typecheck` must pass); for a rename, re-export the old name for one release when more than one consumer exists. |
| 4 | **Database schema and migrations** | `packages/db/src/migrations/` and `.snapshot-*.json`; entities in `packages/db/src/entities/` | Editing an already-applied migration; dropping or renaming a column/table in one step; adding a non-null column without a default to a populated table; changing a column type lossily | Always add a new migration (never edit an applied one). Use expand/contract: add → backfill → switch code → drop in a later PR. Test the migration up and down and state the rollback plan in the PR body (`risk-high`). |
| 5 | **Environment variables and config** | root `.env.example`, `.env.local` loading in `next.config.ts`, `DATABASE_URL`, `DATABASE_POOL_MAX`, `docker-compose.yml` | Renaming or removing a variable; making an optional variable required; changing a default that alters behavior | Add the new name, keep reading the old one (with a deprecation note) for one release, and update `.env.example` in the same PR. Every required variable must be listed in `.env.example`. |
| 6 | **Root commands** | `package.json` scripts (`dev`, `build`, `start`, `lint`, `typecheck`, `test`, `test:integration`, `db:*`) and `.ai/agentic.config.json` `validation.commands` | Renaming or removing a script that CI, `AGENTS.md`, `SDLC.md` or the pipeline config invoke | Update CI (`.github/workflows/ci.yml`), `AGENTS.md`, `SDLC.md` and the config in the same PR. |
| 7 | **Test harness contracts** | `startEphemeralApp()` (`ephemeral-app.ts`), `browser()` (`browser.ts`) in `packages/app/test/integration/`; the 100% coverage threshold in `vitest.config.ts` | Changing helper signatures without updating all scenarios; lowering the coverage threshold or excluding files | Update every scenario in the same PR. Never lower the threshold (see `AGENTS.md`). |
| 8 | **Domain events** (once the first exists) | `packages/core/src/events`, names `concept.entity.action` | Renaming an event or changing its payload | Additive payload changes only; for a rename emit both names for one release. |

Not present today (do not invent compatibility rules for them): CLI tools, webhooks, public SDKs, or a message queue.

## Process for a deliberate breaking change

1. Say so in the spec (or the PR body when no spec exists) and name the surface number above.
2. Land the additive/compat step first when the surface has more than one consumer.
3. Update all in-repo consumers and tests in the same PR; run the full validation gate.
4. Label the PR `risk-high` when it touches surfaces 1, 3 or 4; `om-code-review` treats an unannounced break as a **blocker**.
5. Record any non-obvious gotcha in `.ai/lessons.md`.
