---
title: Implement the one-command DevMentor installer (npm run setup)
date: 2026-10-22
agent: Claude Code (Sonnet 5.5), om-auto-create-pr
spec: .ai/specs/2026-10-22-devmentor-installer.md
status: success
---

# Implement the one-command DevMentor installer (`npm run setup`)

## Goal

Ship `npm run setup`: a dependency-free, idempotent Node installer that does what README "Getting started" describes, with the README keeping the manual steps as an alternative. Issue #3; spec PR #4.

Source doc: .ai/specs/2026-10-22-devmentor-installer.md (lives on the spec PR #4 branch until that merges; not committed here).

## Scope

In scope: `scripts/setup.mjs` + `scripts/setup/**`, root `package.json` script, `vitest.config.ts` (measure and run the installer tests in the node environment), `README.md`, `AGENTS.md`, unit tests at 100%.

Non-goals (spec): starting the dev server, installing Node/Docker, native Windows, seeding, CI changes, changing `.env.example` / `docker-compose.yml` / existing scripts, linting root `scripts/`.

## Implementation Plan

Phase 1 — Installer (spec steps 1–9). Phase 2 — Documentation (spec steps 10–11). Each step leaves the app and `npm run test` working.

## Risks

- Coverage gate must stay at 100% with the widened `include`; no thresholds lowered, no files excluded.
- Vitest 5 has no per-glob environment setting (`environmentMatchGlobs` was removed), so every installer test file starts with `// @vitest-environment node`.
- `.env.example` is not readable in this environment (permission settings); the installer only copies it.
- Real `docker compose` / `npm install` runs are verified manually only where safe; unit tests use fakes.

## Progress

PR: #5

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Installer

- [x] 1.1 Widen the vitest gate (include, coverage include, node environment for scripts) — ac01d9c
- [x] 1.2 run-steps runner with tests — 4bae42a
- [x] 1.3 preflight step with tests — 4bae42a
- [x] 1.4 install-dependencies step with tests — 4bae42a
- [x] 1.5 create-env-file step with tests — 4bae42a
- [x] 1.6 ensure-database step with tests — 4bae42a
- [x] 1.7 migrate-database step with tests — 4bae42a
- [x] 1.8 system adapters with tests — f9da245
- [x] 1.9 main, entry file and root setup script with tests — f9da245

### Phase 2: Documentation

- [x] 2.1 README: setup first, manual steps kept as alternative — 8694f86
- [x] 2.2 AGENTS.md Commands list and lesson check — 8694f86

## Summary of changes

- `scripts/setup.mjs`, `scripts/setup/**` — the installer: step runner, five steps (Node check, install, `.env.local`, database, migrations), real adapters in `system.mjs`, unit tests beside each file.
- `package.json` — `setup` script.
- `vitest.config.ts` — run and measure `scripts/**/*.mjs` in the 100% gate.
- `README.md`, `AGENTS.md` — `npm run setup` documented; manual steps kept as the alternative.
- `.ai/lessons.md` — two lessons (root scripts in the test gate; `db:migration:list` shows executed migrations).

## Verification

- `npm run lint`, `npm run typecheck`, `npm run build`: pass.
- `npm run test`: 37 files, 109 tests; coverage 100% statements, branches, functions, lines (267/267, 116/116, 96/96, 255/255).
- `npm run test:integration`: 1 file, 1 test passed.
- Live `npm run setup` twice in the worktree against the already-running local PostgreSQL: run 1 copied `.env.local` and skipped Docker; run 2 skipped install, `.env.local` and Docker; both exited 0 and ended with the next-step hint.
- Not run live: the Docker start path, a missing-Docker failure and an old-Node failure (they would change or stop the developer's running database); each is covered by unit tests with fake adapters.

## Issues / follow-ups

- Root `scripts/` is still not linted or type-checked (spec assumption A5).
- After spec PR #4 merges, set the spec's status to `implemented` and move it to `.ai/specs/implemented/` (it is not on `main` yet, so this PR cannot do it).

## Lessons recorded

- `.ai/lessons.md`: "Root scripts need their own place in the test gate" and "`db:migration:list` shows executed migrations, not pending ones".
