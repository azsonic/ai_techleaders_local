---
title: DevMentor Storybook, stage 4 (pages that teach and the agent file)
date: 2026-10-25
agent: Claude Code / Sonnet 5.5
spec: none (driven by lekcja-06/prompt-storybook.md)
status: success
---

# DevMentor Storybook, stage 4

## Goal
Stage 4 of `lekcja-06/prompt-storybook.md`: the pages that teach (Start here, Components, How to choose, Usage and accessibility, Content, What to avoid, What is missing, Contributing) and the agent file `docs/design-system.md`.

## Summary of changes
- `packages/ui/stories/design-system/{start-here,components,how-to-choose,usage-and-accessibility,content,what-to-avoid,what-is-missing,contributing}.mdx`: the eight pages. `components.mdx` has 54 working previews (each component's Playground story).
- `docs/design-system.md`: new agent file. `AGENTS.md`: one bullet linking it.
- `packages/ui/.storybook/preview.tsx`: menu order of the Design system pages.
- `packages/ui/stories/product/e04/session-header.stories.tsx`: stories default to `headingLevel: 2` so a documentation page keeps one `h1`.
- `packages/ui/POSTEP.md`, `.ai/lessons.md`: results, six proposals, gaps, two lessons.

## Verification
- `npm run lint`, `typecheck`, `build`, `test` (380 tests, 100%): pass.
- `build-storybook`: passes. `test:stories` and `test:stories:dark`: 443 of 443. All 556 story links in the MDX pages resolve.
- `check:contrast` 22 of 22. `check:tokens`: 9 findings, all in untouched `hero.tsx` and `app/(frontend)/page.tsx`.
- Browser (headless Chromium): the 8 pages at 320/768/1440 px in both themes (48 loads): no console errors, correct theme class, one `h1`, tables render, 54 previews render. Screenshots reviewed.

## Issues / follow-ups
- Six proposals in `packages/ui/POSTEP.md` await the user's decision.
- Not verified: reading the pages cold (stage 5 agent test), screen reader output.

## Lessons recorded
MDX braces outside code spans; `check:tokens` scans MDX (`.ai/lessons.md`).
