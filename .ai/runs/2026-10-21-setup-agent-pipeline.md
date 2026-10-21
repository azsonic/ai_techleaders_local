---
title: Configure the agent PR pipeline
date: 2026-10-21
agent: Claude Code / Sonnet 5.5 (om-setup-agent-pipeline)
spec: none
status: success
---

# Configure the agent PR pipeline

## Goal
Write `.ai/agentic.config.json`, install the tracker and browser descriptors, create the label taxonomy, and generate the missing process docs.

## Summary of changes
- `.ai/agentic.config.json` — pipeline config: GitHub tracker, `agent-browser`, base branch `auto` (resolves to `main`), QA gate on, validation gate of `npm run lint`, `typecheck`, `test`, `build`, `test:integration` (mirrors CI and the AGENTS.md definition of done).
- `.ai/trackers/github.md`, `.ai/browsers/agent-browser.md` — shipped descriptors copied in.
- `.ai/{analysis,scripts,qa}/.gitkeep` — directories the skills write to.
- `.gitignore` — ignores per-run QA state (`.ai/qa/artifacts_*/`, `test-env.json`, `test-env.env`).
- `SDLC.md`, `CODE_REVIEW.md`, `BACKWARD_COMPATIBILITY.md` — generated from the repo (stack, AGENTS.md, engineering standards, actual public surfaces). `AGENTS.md` and `CLAUDE.md` already existed and were left untouched.
- GitHub labels — 25 created on `azsonic/ai_techleaders_local`; `bug` and `documentation` already existed and were left as they were.

## Verification
- Config parses as valid JSON.
- Cross-skill coverage check against `.claude/skills`: `SKILL_COVERAGE_OK`.
- The validation commands themselves were not run: this run changes no application code.

## Issues / follow-ups
- Changes are uncommitted on `main`; commit on a branch and open a PR (`om-check-and-commit` or `om-open-pr`).
- `BACKWARD_COMPATIBILITY.md` deprecation windows are short because the product is pre-release; tighten them at first production deploy.
- `om-setup-discovery-pipeline` is the optional product layer; not run.

## Lessons recorded
none
