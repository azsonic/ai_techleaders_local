---
title: Implement the one-command DevMentor installer (npm run setup)
date: 2026-10-22
agent: Claude Code (Sonnet 5.5), om-auto-create-pr
spec: .ai/specs/2026-10-22-devmentor-installer.md
status: partial
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
- Vitest 5 per-glob environment setting is unverified; fall back to `// @vitest-environment node` per test file.
- `.env.example` is not readable in this environment (permission settings); the installer only copies it.
- Real `docker compose` / `npm install` runs are verified manually only where safe; unit tests use fakes.

## Progress

> Convention: `- [ ]` pending, `- [x]` done. Append ` — <commit sha>` when a step lands. Do not rename step titles.

### Phase 1: Installer

- [ ] 1.1 Widen the vitest gate (include, coverage include, node environment for scripts)
- [ ] 1.2 run-steps runner with tests
- [ ] 1.3 preflight step with tests
- [ ] 1.4 install-dependencies step with tests
- [ ] 1.5 create-env-file step with tests
- [ ] 1.6 ensure-database step with tests
- [ ] 1.7 migrate-database step with tests
- [ ] 1.8 system adapters with tests
- [ ] 1.9 main, entry file and root setup script with tests

### Phase 2: Documentation

- [ ] 2.1 README: setup first, manual steps kept as alternative
- [ ] 2.2 AGENTS.md Commands list and lesson check

## Verification

_Filled in at completion._

## Issues / follow-ups

_Filled in at completion._

## Lessons recorded

_Filled in at completion._
