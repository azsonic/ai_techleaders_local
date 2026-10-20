<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Agent Guide

This file is the single source of truth for every AI agent working in this repository (Cursor, Claude Code, Codex, etc.). `CLAUDE.md` imports it. If the two ever disagree, this file wins.

## Project

- Next.js 16 (App Router, `app/`), React 19, TypeScript, Tailwind CSS 4.
- Commands: `npm run dev`, `npm run build`, `npm run lint`.

## The `.ai/` folder (mandatory)

All AI working metadata lives in `.ai/`. Using it is **not optional**: specs drive the work, runs record it, lessons preserve what was learned.

```
.ai/
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

1. `npm run lint` and `npm run build` pass, and the change has been verified to work as described in §5 (or failures are documented in the run log).
2. The related spec's acceptance criteria are checked off, and it has the correct `status` and folder.
3. The run log exists in `.ai/runs/` (for autonomous runs).
4. Any lesson learned or correction received is recorded in `.ai/lessons.md`.
