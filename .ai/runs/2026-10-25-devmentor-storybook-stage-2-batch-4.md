---
title: DevMentor Storybook, stage 2 batch 4 (overlays and tabs)
date: 2026-10-25
agent: Claude Code / Sonnet 5.5
spec: none (driven by lekcja-06/prompt-storybook.md)
status: success
---

# DevMentor Storybook, stage 2 batch 4 (overlays and tabs)

## Goal
Continue from `packages/ui/POSTEP.md`: batch 4 of stage 2 (dialog, confirmation dialog, menu, popover, tooltip, tabs, toast), then stop for the user's decisions.

## Summary of changes
- `packages/ui/src/components/ui/{dialog,alert-dialog,dropdown-menu,popover,tooltip,tabs,toast}.tsx` and unit tests: shadcn CLI output rewritten to tokens (opaque, bordered, no shadow, blur or animation); toast written on Base UI Toast.
- `packages/ui/src/styles/{tokens,globals}.css`: new `--scrim` token and `bg-scrim` bridge.
- `packages/ui/stories/primitives/*`: 7 stories files and 7 documentation pages (13 sections each).
- `packages/ui/.storybook/preview.tsx`: stories in their own docs frame follow the docs page theme.
- `packages/ui/POSTEP.md`, `.ai/lessons.md`: results, proposals, gaps, two lessons.

## Verification
- `npm run lint`, `typecheck`, `build`: pass. `npm run test`: 208 tests, 100% statements, branches, functions and lines.
- `build-storybook`: passes. `test:stories` and `test:stories:dark`: 125 of 125, a11y gate as error.
- `check:contrast` 22 of 22. `check:tokens`: 9 findings, all in untouched `hero.tsx` and `app/(frontend)/page.tsx`.
- Browser (headless Chromium): 7 pages at 320/768/1440 px in both themes (13 sections, no overflow, no console errors); dark class on docs page and nested frames; dialog and toast geometry, footer order, initial focus, menu highlight outline and tab states measured.
- `packages/ui/package.json` and the lockfile are unchanged after the shadcn CLI run (checked against a snapshot).

## Issues / follow-ups
- Not verified: screen reader output, touch behavior on a real device.
- Proposals 1 to 7 in `packages/ui/POSTEP.md` await the user's decision.

## Lessons recorded
Tailwind `outline-none` cancels `outline-2`; framed docs stories and the theme (`.ai/lessons.md`).
