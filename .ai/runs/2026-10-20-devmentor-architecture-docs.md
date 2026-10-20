---
title: Document DevMentor architecture in AGENTS.md and README
date: 2026-10-20
agent: Cursor agent
spec: none (documentation only)
status: success
---

# Document DevMentor architecture in AGENTS.md and README

## Goal

Record the DevMentor stack and monorepo decisions so that coding agents follow them: Next.js, TypeScript, React, PostgreSQL, MikroORM, Awilix, Tailwind (frontend), shadcn/ui (backend), and the `packages/{app,core,db,ui}` layout.

## Summary of changes

- `AGENTS.md`: replaced the "Project" section with "Project: DevMentor". It covers the stack, monorepo layout, package dependency rules, and conventions for app, db, DI and ui. It also notes that the monorepo is the target and not yet in place.
- `README.md`: replaced the create-next-app boilerplate with a DevMentor overview, the stack, architecture notes (including a dependency graph), getting started, and the AI workflow.
- `.env.example`: added `DATABASE_URL`.
- `.gitignore`: un-ignored `.env.example`, because `.env*` was hiding it.

## Verification

- Checked the bundled Next.js 16 docs. `transpilePackages`: workspace packages are transpiled automatically under Turbopack. `serverExternalPackages`: `@mikro-orm/core`, `@mikro-orm/knex` and `pg` are opted out by default. `AGENTS.md` follows both.
- `git check-ignore .env.example` confirms the file is no longer ignored.
- No code changed, so lint and build are not affected.

## Issues / follow-ups

- The monorepo itself is not scaffolded yet: the app is still at the repo root. This needs a spec, e.g. `.ai/specs/2026-10-20-monorepo-scaffold.md`.
- The package scripts (`db:*` migrations) referenced in the conventions don't exist yet. Add them during scaffolding.

## Lessons recorded

none
