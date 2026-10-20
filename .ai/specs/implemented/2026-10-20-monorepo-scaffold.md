---
title: Scaffold the DevMentor monorepo
status: implemented
created: 2026-10-20
updated: 2026-10-20
owner: Arunas
---

# Scaffold the DevMentor monorepo

## Problem / Goal

The repo is a single create-next-app at the root. `AGENTS.md` and `README.md` describe a different target: an npm-workspaces monorepo with `packages/{app,core,db,ui}` using PostgreSQL + MikroORM, Awilix, Tailwind and shadcn/ui. Every feature built before the move adds migration cost.

Goal: move to the target layout with the whole stack wired end to end. A single request should travel route → DI scope → service → repository → PostgreSQL, and an admin page and a public page should both render, each with its own styling system. No product features yet.

## Scope

### In scope

1. **Workspace root**
   - Root `package.json`: `"private": true`, `"workspaces": ["packages/*"]`, and scripts that delegate to workspaces (`dev`, `build`, `lint`, `typecheck`, `db:*`).
   - `tsconfig.base.json` with strict settings, shared by all packages.
   - Root `node_modules` hoisting via npm. A single `package-lock.json`.
   - `engines.node` set to `>=22.17` (required by MikroORM v7).
2. **`packages/app` (`@devmentor/app`)**
   - `git mv` the existing app (`app/`, `public/`, `next.config.ts`, `next-env.d.ts`, `eslint.config.mjs`, Next dependencies) into `packages/app`, with routes under `src/app/`.
   - Route groups: `src/app/(frontend)/page.tsx` (current home page) and `src/app/(backend)/admin/page.tsx` (minimal admin page using shadcn components).
   - Awilix composition root `src/di/container.ts` with a typed `Cradle`, plus a `createRequestScope()` helper. The helper registers a forked `EntityManager` per scope.
   - `src/app/api/health/route.ts` resolves a `HealthService` from a request scope, runs `select 1` through the DB layer, and returns `{ status: "ok", db: "ok" }`, or a 503 status if the database is down.
3. **`packages/core` (`@devmentor/core`)**
   - `package.json` with `exports`, plus a `src/index.ts` containing a base `AppError` type and a `Result`/utility placeholder (minimal, no speculative APIs).
4. **`packages/db` (`@devmentor/db`)**
   - Dependencies: `@mikro-orm/core`, `@mikro-orm/postgresql`, `@mikro-orm/migrations`, `@mikro-orm/cli` (v7).
   - `src/mikro-orm.config.ts`: reads `DATABASE_URL`, sets the `pool` config, uses `defineEntity` with an explicit entity list, and points migrations at `src/migrations/`.
   - `src/orm.ts`: `getOrm()` returns a process-wide singleton, cached on `globalThis` in development.
   - `src/repositories/health.repository.ts`: `ping()` runs `select 1`.
   - Scripts: `db:migration:create`, `db:migrate`, `db:migration:list`, `db:migration:down`.
   - Marked server-only (`import 'server-only'` in runtime entry points).
5. **`packages/ui` (`@devmentor/ui`)**
   - Set up for the shadcn CLI (`components.json` in `packages/ui` and `packages/app`), with the `button` and `card` primitives added.
   - `src/lib/utils.ts` holds the `cn()` helper.
   - `src/frontend/` folder with one example Tailwind component used on the public home page.
   - The app's global CSS contains `@source` for `packages/ui`, so Tailwind generates the package's classes.
6. **Local database**
   - `docker-compose.yml` with a PostgreSQL service matching `.env.example`.
7. **Docs & agent files**
   - Move the `nextjs-agent-rules` block into `packages/app/AGENTS.md`, because `next dev` writes to the Next project directory after the move. Root `AGENTS.md` keeps a pointer to it.
   - Remove the "Current state" note from `AGENTS.md` and the status banner from `README.md`.
   - Update commands in `README.md` and `AGENTS.md` to match the real scripts.

### Out of scope

- Product features, domain entities, authentication, authorisation.
- Test framework setup (separate spec).
- CI/CD, deployment, production database provisioning.
- Turborepo/Nx or other build orchestration (npm workspaces only).
- Pre-building packages to JavaScript. Internal packages ship TypeScript source, and Next.js transpiles them.

## Requirements

- All packages are ESM (`"type": "module"`), because MikroORM v7 is ESM-only.
- Package dependency rules from `AGENTS.md` hold: `core` depends on no other package, `db` and `ui` depend only on `core`, and `app` depends on all three.
- Cross-package imports go only through `exports` entries. There are no relative imports across package folders.
- No global `EntityManager` use. Keep `allowGlobalContext` at its default (`false`).
- The schema changes only through migrations. No `schema:update` scripts.
- Secrets are read only from the environment. `.env.example` is the reference.

## Acceptance criteria

- [x] `npm install` at the root produces one lockfile and links all four `@devmentor/*` packages.
- [x] `npm run dev` serves `/` (public page, Tailwind, frontend component from `@devmentor/ui`) and `/admin` (shadcn `Card` plus button-styled links rendered with correct styles), with no console errors.
- [x] `npm run build`, `npm run lint` and `npm run typecheck` pass from the root.
- [x] With PostgreSQL running, `GET /api/health` returns `200 {"status":"ok","db":"ok"}` (dev and `next start`). With the database stopped, it returns `503`, and it recovers without a restart. Verified with an embedded PostgreSQL; see the item below for Docker.
- [x] `docker compose up -d` starts the database defined in `docker-compose.yml`. Verified 2026-10-20 (Docker 29.9.1): container healthy, `db:migrate` connects, and `GET /api/health` returns `200 {"status":"ok","db":"ok"}` against it.
- [x] `npm run db:migration:create` generates a migration file in `packages/db/src/migrations/`, and `npm run db:migrate` applies it. Verified with a blank migration, which was then rolled back with `db:migration:down` and deleted.
- [x] Repeated hot reloads in dev don't increase the number of PostgreSQL connections (stayed at 1 across reloads of the repository and the container module, via `pg_stat_activity`).
- [x] `app/`, `public/` and the Next config no longer exist at the repo root. Files moved without major edits are detected as renames, so history follows them. Rewritten files (`page.tsx`, `globals.css`, `next.config.ts`, the app's `package.json`) show as new.
- [x] `packages/app/AGENTS.md` contains the Next.js managed blocks (written by `next dev`). With it committed, `next dev` leaves the tree clean.
- [x] `README.md` and `AGENTS.md` describe the real structure and commands, and the "target/current state" caveats are removed.

## Technical approach

1. Create the workspace root files (`package.json` workspaces, `tsconfig.base.json`).
2. `git mv` the Next app into `packages/app`. Move routes under `src/app/`, restructure into the `(frontend)` and `(backend)/admin` route groups, and fix paths and `tsconfig`. Verify `dev`/`build` before continuing.
3. Add `core` and `ui`. Run `npx shadcn@latest init` inside `packages/ui`, then add `button` and `card`. Wire the `@source` directive and the admin page.
4. Add `db` with the MikroORM v7 config, the singleton, the health repository and the migration scripts. Add `docker-compose.yml`.
5. Add the Awilix container in `app`: singleton `orm`, and scoped `em` (fork), `healthRepository` and `healthService`. Add the `/api/health` route.
6. Read the Next.js docs in `node_modules/next/dist/docs/` for route groups, route handlers and the monorepo setup before writing each part. If bundling MikroORM, `kysely` or `pg` fails, add the failing package to `serverExternalPackages`.
7. Update docs and agent files, then run the full verification from the acceptance criteria. Write the run log `.ai/runs/YYYY-MM-DD-monorepo-scaffold.md`.

Versions at time of writing: `next` 16.4.2, MikroORM 7.2.5, `awilix` 13.0.5, `shadcn` CLI 4.22.1, `tailwindcss` 4.3.3. Use the latest versions at implementation time.

## Open questions

All resolved (2026-10-20, Arunas). The spec was approved with these answers:

1. **Local PostgreSQL:** Docker Compose in the repo.
2. **Admin URL:** `/admin`.
3. **Package manager:** npm workspaces.
4. **MikroORM CLI with TypeScript config:** `tsx` as a dev dependency.

## Notes

Deviations from the plan above, made during implementation (2026-10-20):

- **MikroORM config split:** `src/config.ts` holds the runtime `createOrmConfig()`. `src/mikro-orm.config.ts` is the CLI-only entry: it loads the root `.env.local` and adds the `Migrator` extension and migration paths. This keeps CLI-only concerns, and the `server-only` guard (which throws in plain Node), apart.
- **Env loading:** a single root `.env.local`. `next.config.ts` loads it with `process.loadEnvFile`, because `@next/env`'s `loadEnvConfig` caches Next's first call and silently does nothing there.
- **Tailwind `@source`:** declared in `packages/ui/src/styles/globals.css` (next to the package it registers) instead of the app's stylesheet. The app imports `@devmentor/ui/globals.css`.
- **shadcn setup:** `shadcn init` can't detect a framework in `packages/ui`, so the base setup is manual, following shadcn's manual-installation docs (deps, theme CSS, `lib/utils.ts`). `button` and `card` were added with `shadcn add` from `packages/app`. Style: `base-nova` (Base UI).
- **Admin page links:** they use `cn(buttonVariants(...))` on real `<a>`/`<Link>` elements rather than `<Button render={<Link/>}>`, because Base UI gives the latter `role="button"`.
- **Extras:** `packages/app/CLAUDE.md` (imports the managed `AGENTS.md`). `.gitignore` patterns are no longer anchored to the root, so they apply inside packages.

- After the move, `next dev` writes its managed agent block to `packages/app/AGENTS.md`, not the root (see `node_modules/next/dist/server/lib/generate-agent-files.js`). The root copy would otherwise go stale.
- MikroORM v7 replaced knex with `@mikro-orm/sql` + `kysely`. `@mikro-orm/core` and `pg` are on Next's built-in `serverExternalPackages` list, but `@mikro-orm/postgresql`, `@mikro-orm/sql` and `kysely` are not.
