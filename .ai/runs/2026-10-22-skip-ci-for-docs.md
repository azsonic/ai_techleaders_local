---
title: Skip CI checks for documentation-only PRs
date: 2026-10-22
agent: Claude Code (Sonnet 5.5)
spec: none
status: success
---

# Skip CI checks for documentation-only PRs

## Goal

Stop running lint, typecheck, build, unit and integration tests on PRs that only change documents.

## Summary of changes

- `.github/workflows/ci.yml` — `paths-ignore` on `pull_request`: `**/*.md`, `.ai/specs/**`, `.ai/runs/**`, `.ai/lessons/**`. Narrower than `.ai/**` on purpose, so `.ai/skills` and `.ai/scripts` still trigger CI.
- `README.md` — the sentence saying every PR is checked now names the exception.

## Verification

- The PR itself changes `ci.yml`, so it runs the full workflow: this confirms the file is valid.
- Not verified: the skip behavior itself. It shows the first time a docs-only PR is opened (the checks should not appear).

## Issues / follow-ups

- If these checks ever become required status checks in branch protection, skipped workflows stay "pending" and block docs-only PRs. Switch to an always-running gate job then.

## Lessons recorded

none
