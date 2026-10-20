---
title: Scaffold the DevMentor monorepo
date: 2026-10-20
agent: Cursor agent
spec: .ai/specs/implemented/2026-10-20-monorepo-scaffold.md
status: success
---

# Scaffold the DevMentor monorepo

## Goal

Implement the approved spec `.ai/specs/implemented/2026-10-20-monorepo-scaffold.md`.

All acceptance criteria are verified. The Docker check came last, after the owner installed Docker (see "Docker verification" below).

## Summary of changes

- **Workspace root:**
  - `package.json`: npm workspaces, delegating scripts, Node `>=22.17`.
  - `tsconfig.base.json`: shared strict TypeScript settings.
  - `docker-compose.yml`: PostgreSQL 17.
  - `.gitignore`: unanchored `node_modules/`, `.next/`, `out/`, `build/`, `dist/`, `coverage/`.
- **`packages/app`:**
  - Moved the create-next-app with `git mv`. Routes are in `src/app/`, split into `(frontend)/page.tsx` and `(backend)/admin/{layout,page}.tsx`.
  - `src/di/container.ts`: Awilix in PROXY mode with `strict`, a typed `Cradle`, and `createRequestScope()`.
  - `src/modules/health/health.service.ts`, `src/app/api/health/route.ts`: `await connection()`, scope disposed in `finally`, 503 on failure.
  - `next.config.ts`: loads the root `.env.local` with `process.loadEnvFile`.
  - `components.json` for the shadcn CLI. `CLAUDE.md` imports `AGENTS.md`, which `next dev` manages.
- **`packages/core`:** `AppError` plus the `Result`/`ok`/`err` helpers.
- **`packages/db`:**
  - MikroORM v7 dependencies, plus `@mikro-orm/cli` and `tsx` as dev dependencies.
  - `src/config.ts` (runtime config with the pool) and `src/mikro-orm.config.ts` (CLI entry with root env and `Migrator`).
  - `src/orm.ts`: `getOrm()` singleton cached on `globalThis`, marked `server-only`.
  - `src/entities/index.ts` (explicit registry, empty), `src/repositories/health.repository.ts`, and `src/migrations/.snapshot-devmentor.json`.
  - Scripts `db:migration:create`, `db:migrate`, `db:migration:list`, `db:migration:down`.
- **`packages/ui`:**
  - shadcn `base-nova` theme in `src/styles/globals.css`, including `@source` for the package.
  - `src/lib/utils.ts` re-exports `cn`. `src/components/{button,card}.tsx` came from `shadcn add`.
  - `src/frontend/hero.tsx` (custom Tailwind) and `components.json`.
- **Docs:**
  - `AGENTS.md`: the managed Next.js block was replaced by a pointer to `packages/app/AGENTS.md`, and the "current state" caveat removed. Conventions were updated with implementation facts (MikroORM v7 config split, env loading, `connection()`, PROXY mode, shadcn workflow, `cn(buttonVariants())`).
  - `README.md`: setup steps (Docker, migrations), full command table, health endpoint.
  - The spec's acceptance criteria and deviations are recorded.

## Verification

- `npm run lint`, `npm run typecheck` (all four packages) and `npm run build` pass from the root.
- **Database:** an `embedded-postgres` run from `/tmp/devmentor-pg`, outside the repo, with the `.env.example` credentials, on port 5432.
  - `GET /api/health` returns `200 {"status":"ok","db":"ok"}` in `next dev` and in `next start`.
  - After `pg_ctl stop` it returns `503 {"status":"error","db":"unavailable"}`. After `pg_ctl start` it returns `200` again without restarting the app.
  - With the database URL missing, it returns 503 with a clear log message.
- **Migrations:** `db:migration:list` worked. `db:migration:create` printed "No changes required" (no entities). A blank migration created with `--blank`, applied with `db:migrate` and reverted with `db:migration:down` all succeeded, and the file was then deleted.
- **Connection pool:** `pg_stat_activity` stayed at 1 connection across hot reloads of `health.repository.ts` (twice) and `di/container.ts`, and after the database restarted.
- **Browser:**
  - `/` renders the `Hero` from `@devmentor/ui` with Tailwind styles, so `@source` works.
  - `/admin` renders the shadcn `Card` and button-styled links. The accessibility snapshot shows them as `link` roles, and the outline border is present (checked with computed styles).
  - No Next.js error overlay. The dev log had no errors apart from the deliberate database-down test and one transient HMR race between two edits.

### Docker verification

Done after the owner installed Docker 29.9.1:
- `docker compose up -d` started a healthy `postgres:17-alpine` container.
- `npm run db:migrate` connected to it ("Successfully migrated up to the latest version").
- In `npm run dev`:
  - `GET /api/health` returned `200 {"status":"ok","db":"ok"}`.
  - `/` and `/admin` returned `200`.
  - `pg_stat_activity` showed 1 connection.
  - The dev log had no errors.

The spec was set to `implemented` and moved to `.ai/specs/implemented/`.

## Issues / follow-ups

- Problems hit and fixed along the way:
  1. `shadcn add` without base setup generated components with no theme or dependencies.
  2. `shadcn init` can't run in `packages/ui`.
  3. `loadEnvConfig` silently did nothing in `next.config.ts`.
  4. The outline button border disappeared without `cn()`.
  5. `<Button render={<Link/>}>` exposed `role="button"`.
- I wrongly removed the official `cn` package early on, then re-added it after checking shadcn's docs.
- `npm install` reported audit warnings for transitive dependencies. Not addressed here (out of scope).
- Nothing was committed. Changes are staged with `git add -A` for review.

## Lessons recorded

Added to `.ai/lessons.md`:
- Check current docs before calling a dependency bogus.
- `buttonVariants` must go through `cn()`.
- How to use the shadcn CLI in this monorepo.
- `loadEnvConfig` in `next.config.ts` is a no-op.
- `server-only` throws outside Next.js.

Updated: the MikroORM v7 lesson (zero-entities flag) and the Next.js lesson (managed `AGENTS.md` location).
