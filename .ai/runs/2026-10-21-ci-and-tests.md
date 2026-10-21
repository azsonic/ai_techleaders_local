---
title: GitHub CI, unit tests, and integration tests
date: 2026-10-21
agent: Cursor Grok 4.7
spec: .ai/specs/implemented/2026-10-21-ci-and-tests.md
status: success
---

# GitHub CI, unit tests, and integration tests

## Goal

Add pull-request checks for lint, typecheck, build, unit tests at 100% coverage, and an integration run that boots Postgres with Testcontainers and drives the app with agent-browser. Record the 100% unit-test rule in AGENTS.md. Cover the existing application code with unit tests.

## Summary of changes

- `.github/workflows/ci.yml` — pull-request checks: lint, typecheck, build, unit tests, integration tests.
- `vitest.config.ts`, `vitest.integration.config.ts`, `vitest.setup.ts`, `vitest/server-only.ts` — Vitest, 100% coverage gate, and a stand-in for `server-only`.
- `packages/**/*.test.ts` and `*.test.tsx` — unit tests for the current application code.
- `packages/app/test/integration/` — Testcontainers Postgres 17, `next start`, and an agent-browser walk from the home page to a healthy admin database check.
- `package.json` — `npm run test` and `npm run test:integration`. Vitest at the repo root; `@testcontainers/postgresql` and `agent-browser` on `@devmentor/app`.
- `AGENTS.md`, `.ai/docs/engineering-standards.md`, `README.md` — 100% unit-test rule and the integration harness.

## Verification

- `npm run lint` — pass.
- `npm run typecheck` — pass.
- `npm run test` — 27 files, 63 tests, pass. Coverage: statements 147/147, branches 66/66, functions 54/54, lines 142/142.
- `npm run test:integration` — production build pass; Chrome installed for agent-browser; 1 integration test pass (home page, admin link, "Database connection is healthy.").

## Issues / follow-ups

- GitHub branch protection (marking these checks as required) is a repository setting and is not changed from here.
- V8 skips three re-export-only files with no executable lines (`core` and `db` package entries, `ui` `cn` re-export). The code they re-export is in the 100% total.

## Lessons recorded

- [jsdom's URL resolves file paths against the page](../lessons.md)
- [`agent-browser` engines field is for a source build](../lessons.md)
