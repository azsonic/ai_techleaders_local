# Agent Guide

This file is the single source of truth for every AI agent working in this repository (Cursor, Claude Code, Codex, etc.). `CLAUDE.md` imports it. If the two ever disagree, this file wins.

> **Next.js:** this is NOT the Next.js you know from training data. Before writing any Next.js code, read `packages/app/AGENTS.md` (managed by `next dev`, don't edit it by hand) and the relevant guide in `node_modules/next/dist/docs/`.

## Project: DevMentor

These are binding architecture decisions. Do not introduce alternative frameworks, ORMs, DI containers or styling systems without an approved spec. See `README.md` for the human-oriented overview.

### Stack

| Concern | Choice |
|---|---|
| Framework | Next.js (latest, App Router), React (latest), TypeScript (strict) |
| Database | PostgreSQL |
| ORM | MikroORM (`@mikro-orm/postgresql`) — entities, migrations, connection pooling |
| Dependency injection | Awilix |
| Styling — frontend (public) pages | Tailwind CSS |
| Styling — backend (admin) pages | shadcn/ui (built on Tailwind) |
| Monorepo | npm workspaces (`packages/*`) |

### Monorepo layout

```
packages/
├── app/    @devmentor/app   Next.js application: routes, pages, server actions, feature modules, DI composition root
├── core/   @devmentor/core  Reusable, framework-agnostic code: domain types, errors, utilities, DI helpers/types
├── db/     @devmentor/db    MikroORM config, entities, repositories, migrations, seeders, DB helpers
└── ui/     @devmentor/ui    Reusable React components: shadcn/ui primitives (backend) + frontend components
```

**Dependency rules** (enforce strictly — no cycles):

- `core` depends on no other workspace package. No React, Next.js or MikroORM imports.
- `db` may depend on `core` only.
- `ui` may depend on `core` only (types, pure utils). No data access and no `db` imports.
- `app` may depend on all packages. Nothing depends on `app`.
- Import other packages only through their public entry (`@devmentor/<pkg>` or the subpaths declared in its `package.json` `exports`). Never use deep relative paths across packages (`../../db/src/...`).
- Put code in the lowest package that fits. If two features need it and it is framework-agnostic, it belongs in `core`. If it renders UI and has no app-specific logic, it belongs in `ui`.
- Install dependencies in the package that uses them (`npm install <dep> -w @devmentor/<pkg>`), not at the root. Root holds only shared dev tooling.
- These rules are enforced by ESLint (`no-restricted-imports` via the root `eslint.boundaries.mjs`). Don't loosen a boundary to make an import work; move the code to the right package instead.

### Engineering standards

`.ai/docs/engineering-standards.md` is binding for naming, placement, security minimums, code quality and the code review checklist. Read it before adding a domain concept, a route or a form. If it ever contradicts this file, this file wins and the standards doc gets fixed.

### Domain concept convention

Each domain concept (`auth`, `mentors`, `availability`, `bookings`, `payments`, `messages`, `favorites`, `reviews`, ...) is a same-named, plural sub-folder repeated across the layers that need it:

- `packages/db/src/entities/<concept>/<name>.entity.ts` and `packages/db/src/repositories/<concept>/<name>.repository.ts`
- `packages/app/src/modules/<concept>/<name>.service.ts` (business rules; registered in `container.ts`)
- `packages/core/src/validators/<concept>/<name>-<action>.schema.ts` (shared Zod schemas, when needed)
- `packages/app/src/app/api/<concept>/route.ts` and pages under `(frontend)/` or `(backend)/admin/`
- `packages/ui/src/components/<concept>/` for components tied to the concept's data shape

Create a concept folder only when its first file is added — never scaffold empty ones. This is a directory convention, not a module runtime: no per-concept setup, ACL or auto-discovery. Domain events (when the first one is needed) are named `concept.entity.action` (e.g. `bookings.booking.created`) and go through an in-process typed emitter in `packages/core/src/events`, registered as a singleton. There is no queue or worker.

### Reusable API & UI layer

Routes and pages reuse shared layers instead of re-implementing fetch, error handling and status mapping per feature:

- **Errors and envelope (`@devmentor/core`, `src/http/`).** Services throw the typed `AppError` subclasses (`ValidationError`, `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ConflictError`, `ServiceUnavailableError`), never build responses. Every API response is the `ApiResult<T>` envelope: `{ ok: true, data }` or `{ ok: false, error: { code, message, fieldErrors? } }`. Server and client share this one type.
- **Route handlers.** Wrap every handler in `apiHandler` from `@/http/api-handler`. It maps `AppError`s to status codes, logs unexpected errors and returns a generic 500. It also re-throws Next's control-flow errors (`notFound()`, `redirect()`). Run DB work through `withRequestScope` from `@/di/container`. No `try/catch` or hand-built `Response.json` in routes. `/api/health` is the reference example.
- **Client calls (`@devmentor/ui/backend/api/api-call`).** `apiCall` / `apiCallOrThrow` are the only way to call `/api/*` from the browser. They set the CSRF header and parse the envelope defensively. ESLint rejects `fetch("/api…")` anywhere else.
- **Feedback (`@devmentor/ui/backend/feedback/*`).** Use `LoadingMessage`, `ErrorMessage` and `EmptyState` instead of bespoke spinners or error text.
- **Deferred until their first consumer:** `makeCrudRoute`, `CrudForm`, `DataTable`, auth helpers (`requireSession`, ownership assertions), events, payment ports. Build each one in the layer above when the first concept needs it, then reuse it.

Where a new reusable component goes:

1. shadcn primitive → `ui/src/components/ui/`, via `npx shadcn@latest add` (never hand-written).
2. Generic, concept-agnostic admin pattern (form field, table cell, feedback state) → `ui/src/backend/<category>/`.
3. Component tied to one concept's data shape → `ui/src/components/<concept>/`.
4. Used by exactly one page → colocate it next to that `page.tsx` until a second page needs it.

File names are kebab-case (`api-call.ts`, `mentor-card.tsx`); components are PascalCase, functions camelCase.

### `packages/app` (Next.js)

- App Router lives in `packages/app/src/app/`. Use route groups to separate the two UI worlds:
  - `src/app/(frontend)/` — public pages, styled with Tailwind and `@devmentor/ui` frontend components.
  - `src/app/(backend)/admin/` — admin/back-office pages, built from shadcn/ui components.
  - Persona groups (e.g. `(student)`, `(mentor)`, `(auth)`) nest inside these two when their first page lands.
- Business logic lives in feature modules: `src/modules/<concept>/` (services and port adapters). Pages, route handlers and server actions stay thin: they resolve a service and call it.
- Database and DI code is server-only. Never import `@devmentor/db` or the container into a Client Component. Mark server-only modules with `import 'server-only'`.
- `cacheComponents` is enabled. Route handlers and pages that must run per request (DB reads, health checks) call `await connection()` from `next/server` before doing I/O. Don't use `export const dynamic = "force-dynamic"`: Next 16 removes that segment config when `cacheComponents` is on.
- Workspace packages are transpiled automatically by Next.js. Don't add them to `transpilePackages`. MikroORM currently bundles fine. Add packages to `serverExternalPackages` only if bundling fails.
- Env vars come from the root `.env.local`, loaded in `next.config.ts` with `process.loadEnvFile`. Don't use `@next/env`'s `loadEnvConfig` there: it caches Next's earlier call and silently does nothing.

### `packages/db` (PostgreSQL + MikroORM)

- MikroORM is **v7**: ESM-only and built on `kysely`, not knex. Check the installed `.d.ts` files rather than relying on v6 knowledge.
- Config is split:
  - `src/config.ts` — `createOrmConfig()`, the single runtime config. Reads `DATABASE_URL` and sets the connection pool via the `pool` option (`DATABASE_POOL_MAX`), never ad hoc.
  - `src/mikro-orm.config.ts` — CLI entry only (auto-discovered by the CLI, run through `tsx`). Loads the root `.env.local` and adds the `Migrator` extension and migration paths. The app never imports it.
- `import 'server-only'` goes only in runtime entry points (`src/orm.ts`). Never import it from anything the CLI loads, because it throws outside Next.js.
- Define entities with `defineEntity` (no decorators), so they work under Turbopack/SWC without decorator metadata. Keep one entity per file in `src/entities/`, and register each in `src/entities/index.ts` (discovery is explicit).
- Never use the global `EntityManager`. Every request or job uses a fork (`orm.em.fork()`), provided by the request-scoped DI container.
- `getOrm()` returns the single `MikroORM` instance per process, cached on `globalThis` so hot reload doesn't open new pools. Never call `MikroORM.init` anywhere else.
- Schema changes **only** through migrations in `src/migrations/`, generated with the MikroORM CLI. Commit them. Never edit a migration that has already been applied; add a new one. Never use `schema:update` against shared databases.
- Repositories expose intention-revealing methods. Don't leak query-builder details into `app`.

### Dependency injection (Awilix)

- The container is composed in one place, `packages/app/src/di/container.ts` (the composition root). Packages export registration functions or classes; only `app` builds the container.
- Injection mode is `PROXY` with `strict: true`. Constructors take one destructured dependencies object (`constructor({ healthRepository }: { healthRepository: HealthRepository })`). `CLASSIC` mode is not allowed, because it relies on parameter names that minification breaks.
- Use constructor injection. Don't call `container.resolve` inside services (no service locator). Only the request edge (route handler, server action, job) reads from `scope.cradle`.
- Lifetimes:
  - **singleton:** `MikroORM` instance, config, stateless utilities.
  - **scoped:** forked `EntityManager`, repositories, services, current user/request context.
- Each request, server action or job runs inside `withRequestScope(fn)`. It calls `createRequestScope()` (which forks the `EntityManager` into the scope) and disposes the scope in `finally`. If the database can't initialise, it throws `ServiceUnavailableError` (503). Use `createRequestScope()` directly only when the scope must outlive one function. Never resolve scoped services from the root container.
- Type the cradle: keep a `Cradle` interface next to the container, and update it with every registration.

### `packages/ui` (Tailwind + shadcn/ui)

- shadcn/ui (style `base-nova`, built on Base UI) primitives live in `packages/ui/src/components/ui/` (import as `@devmentor/ui/components/ui/<name>`). Add them by running `npx shadcn@latest add <component>` **from `packages/app`**. The CLI routes the files into `packages/ui` using both `components.json` files. Don't run `shadcn init` (it can't detect a framework in `packages/ui`), and don't hand-copy components. They are the building blocks for **backend** pages.
- Frontend (public) components are custom Tailwind components in `packages/ui/src/frontend/`. Don't use shadcn primitives on frontend pages unless a spec says so.
- Components are presentational: data comes in through props, with no data fetching or DI. Use `cn()` from `@devmentor/ui/lib/utils` (shadcn's official `cn` package) for class merging.
- To style a link as a button, use `<Link className={cn(buttonVariants(...))}>`. Always wrap `buttonVariants` in `cn()`, because `cva` doesn't resolve conflicting classes. Don't use `<Button render={<Link/>}>`: Base UI gives it `role="button"`.
- Tailwind is configured CSS-first. The theme lives in `packages/ui/src/styles/globals.css`, which also declares `@source` for the package. The app's `globals.css` imports it (`@import "@devmentor/ui/globals.css"`).

### Tests

Unit tests use [Vitest](https://vitest.dev). Colocate them with the source as `*.test.ts` or `*.test.tsx`.

- **Every new feature is 100% covered by unit tests.** That means statements, branches, functions, and lines. `npm run test` enforces the threshold on `packages/*/src/**/*.{ts,tsx}` and `packages/app/next.config.ts`, and it fails if coverage drops below 100%. A feature is not done while that command fails. Don't lower the threshold, and don't exclude a file to get a change through — test the behavior.
- Integration tests live in `packages/app/test/integration/`. They start PostgreSQL 17 with [Testcontainers](https://node.testcontainers.org), apply migrations, boot the production app (`next start`) against that database, and drive the pages with [`agent-browser`](https://agent-browser.dev). Run them with `npm run test:integration`. When a change has a user-visible flow, add a scenario there.
- Helpers for new scenarios: `startEphemeralApp()` in `ephemeral-app.ts` and `browser()` in `browser.ts`.
- Vitest aliases `server-only` to an empty module (`vitest/server-only.ts`) so server modules can be imported. Don't import the real `server-only` package from a unit test.

### Commands

Run from the repo root (npm workspaces):

- `docker compose up -d`: local PostgreSQL (matches `.env.example`).
- `npm run dev` / `npm run build` / `npm run start`: the Next.js app.
- `npm run lint` / `npm run typecheck`: every package.
- `npm run test`: unit tests. Coverage of application code must stay at 100%.
- `npm run test:integration`: build the app, install the agent-browser Chrome, and run the Testcontainers + agent-browser suite.
- `npm run db:migration:create` / `db:migrate` / `db:migration:list` / `db:migration:down`: MikroORM migrations (`@devmentor/db`). Commit `src/migrations/*` and `.snapshot-*.json`.
- `npm run <script> -w @devmentor/<pkg>`: a single package.
- Secrets go in the root `.env.local` (never committed). Every required variable must be listed in the committed root `.env.example`.

## The `.ai/` folder (mandatory)

All AI working metadata lives in `.ai/`. Using it is **not optional**: specs drive the work, runs record it, lessons preserve what was learned.

```
.ai/
├── docs/                       # Standing reference docs (e.g. engineering-standards.md); not dated, edited in place
├── lessons.md                  # Index of lessons learned (long-term memory) — read first
├── lessons/                    # Detailed lesson write-ups: YYYY-MM-DD-slug.md
├── runs/                       # Logs of AI autonomous runs: YYYY-MM-DD-slug.md
└── specs/                      # Spec-Driven Development (SDD)
    ├── YYYY-MM-DD-slug.md      # Active specs (draft / approved / in-progress)
    ├── implemented/            # Specs that are fully implemented
    └── archive/                # Superseded, abandoned or rejected specs
```

### Naming convention

Every file in `specs/`, `specs/implemented/`, `specs/archive/`, `runs/` and `lessons/` is named:

```
YYYY-MM-DD-slug.md
```

- `YYYY-MM-DD` — the date the file was **created** (local date). Never change it when the file moves or is updated.
- `slug` — lowercase kebab-case, ASCII only, 2–6 words describing the subject (e.g. `user-login-flow`, `fix-hydration-error`).
- Example: `2026-10-20-user-login-flow.md`.
- If the name is taken, add a suffix: `2026-10-20-user-login-flow-2.md`.
- A run that implements a spec should reuse the spec's slug so they are easy to pair.

## Workflow rules

### 1. Before starting any task

1. Read `.ai/lessons.md` and open any detailed lesson relevant to the task.
2. Check `.ai/specs/` for a spec covering the task. If one exists, it is the source of truth for scope and acceptance criteria.

### 2. Plan complex tasks — specs (`.ai/specs/`)

- Non-trivial features or behaviour changes start with a spec. Do not implement a non-trivial feature without one — draft it first and ask the user to approve it.
- The spec is the plan: invest effort here so implementation can be done in one pass. Resolve ambiguity in `Open questions` before coding, not during.
- For high-risk specs, have a separate agent/subagent review the plan as a sceptical staff engineer before asking for approval.
- If implementation goes sideways (wrong assumptions, repeated failures), stop and re-plan — update the spec instead of pushing through.
- Trivial changes (typos, small copy edits, dependency bumps) do not need a spec.
- New specs go directly in `.ai/specs/` with `status: draft`.
- Keep the `status` field current as work progresses.
- When every acceptance criterion is met, set `status: implemented` and `git mv` the file to `.ai/specs/implemented/`.
- When a spec is superseded, abandoned or rejected, set `status: archived`, explain why in the `Notes` section, and `git mv` it to `.ai/specs/archive/`.
- If implementation deviates from the spec, update the spec — do not let it drift from reality.

Spec template:

```markdown
---
title: <Human readable title>
status: draft | approved | in-progress | implemented | archived
created: YYYY-MM-DD
updated: YYYY-MM-DD
owner: <person>
---

# <Title>

## Problem / Goal
## Scope
### In scope
### Out of scope
## Requirements
## Acceptance criteria
- [ ] ...
## Technical approach
## Open questions
## Notes
```

### 3. Runs (`.ai/runs/`)

- Every autonomous AI run (agent mode, background/cloud agent, scheduled automation, or any multi-step task executed without step-by-step supervision) **must** write a log to `.ai/runs/YYYY-MM-DD-slug.md`.
- Create the log at the start of the run and keep it updated; finalise it before reporting completion.
- Logs are append-only history: never edit or delete another run's log.

Run log template:

```markdown
---
title: <What the run did>
date: YYYY-MM-DD
agent: <tool / model>
spec: <path to spec, or "none">
status: success | partial | failed | aborted
---

# <Title>

## Goal
## Summary of changes
- `path/to/file` — what changed and why
## Verification
<Commands run (lint, build, tests), manual/browser checks, and their results>
## Issues / follow-ups
## Lessons recorded
<Links to entries added to .ai/lessons.md, or "none">
```

### 4. Lessons (`.ai/lessons.md` + `.ai/lessons/`)

The project's long-term memory. Add a lesson whenever you:

- fix a bug whose root cause was non-obvious,
- discover a gotcha in the framework, tooling or codebase,
- get corrected by the user about a preference or convention,
- find an improvement or pattern worth reusing.

Rules:

- **After every user correction, record the lesson immediately**, before continuing the task. Write it as a rule for yourself that would have prevented the mistake. The goal is that the same mistake never happens twice.
- `.ai/lessons.md` is the index: one short entry per lesson, newest at the top. Entries must be actionable ("Do X / avoid Y because Z"), not narratives.
- If the lesson needs more than a few lines (reproduction steps, code samples, investigation notes), write the detail to `.ai/lessons/YYYY-MM-DD-slug.md` and link it from the index entry.
- Before adding, check for an existing lesson on the same topic and update it instead of duplicating.
- If a lesson turns out to be wrong or obsolete, edit or remove it — stale memory is worse than none.

Index entry format:

```markdown
- **YYYY-MM-DD — <Short title>** `#tag` — <One or two sentence actionable lesson.> [details](lessons/YYYY-MM-DD-slug.md)
```

### 5. Working principles

- **Verify, don't assume.** Prove every change works by running it: lint, build, and for UI changes load the page in `npm run dev` (browser) and check the behaviour and console. Never claim success without evidence.
- **Fix bugs autonomously.** Given a bug report, error log or failing check, reproduce it, find the root cause and fix it without asking how. Ask only when requirements, not implementation, are unclear.
- **Prefer the elegant solution.** If a fix turns out hacky, rethink it with everything you now know and replace it with the clean solution before finishing.
- **Self-review before handing off.** Critically review your own diff as a reviewer would (edge cases, regressions, spec compliance) before reporting done.
- **Use subagents** for broad research, exploration or independent sub-tasks, to keep the main context focused.
- **Parallel work uses separate git worktrees**, one agent per worktree, each with its own run log.
- **Automate repetition.** If a workflow is repeated often, propose turning it into a committed skill or command.

### 6. Definition of done

A task is only finished when:

1. `npm run lint`, `npm run typecheck`, `npm run test`, and `npm run build` pass, and the change has been verified to work as described in §5 (or failures are documented in the run log). User-visible changes also pass `npm run test:integration`. Unit coverage of application code stays at 100%.
2. The related spec's acceptance criteria are checked off, and it has the correct `status` and folder.
3. The run log exists in `.ai/runs/` (for autonomous runs).
4. Any lesson learned or correction received is recorded in `.ai/lessons.md`.
