---
title: DevMentor Storybook, stage 1 (foundations)
date: 2026-10-25
agent: Claude Code / Sonnet 5.5
spec: none (driven by lekcja-06/prompt-storybook.md)
status: partial
---

# DevMentor Storybook, stage 1 (foundations)

## Goal
Stage 1 of `lekcja-06/prompt-storybook.md`: Storybook setup, tokens in code, Foundations pages, token-check script. Stages 2 to 5 are pending the user's approval.

## Summary of changes
- `packages/ui/.storybook/*`, `packages/ui/stories/foundations/*`, `packages/ui/vitest.storybook.config.ts`: Storybook with docs, a11y (error), vitest, theme switch on `<html>`.
- `packages/ui/src/styles/tokens.css`, `globals.css`: approved tokens from `lekcja-06/tokeny.md`, old stock values removed.
- `packages/ui/src/components/ui/button.tsx`: opacity-based hover, destructive and focus ring replaced by opaque tokens.
- `scripts/check-tokens*`: non-token value finder, unit tested.
- `packages/ui/scripts/contrast.mjs`: contrast measurement from saved values.
- `packages/ui/package.json`, `package.json`, lockfile: Storybook, Tailwind vite plugin, fontsource, playwright, msw dependencies (all in the stage 0 plan). The lockfile diff is large because npm 11 rewrote it.

## Verification
- `npm run lint`, `npm run typecheck`, `npm run build`: pass.
- `npm run test`: 130 tests, 100% coverage.
- `build-storybook`: passes. `test:stories` and `test:stories:dark`: 1 story each, pass.
- Browser (headless Chromium, 320 and 1440 px, both themes, 7 Foundations pages): no console errors, no horizontal overflow, tables render, dark class applied.
- `npm run check:contrast`: 21 of 21 pairs pass. `npm run check:tokens`: 10 findings in existing code (listed in POSTEP.md).

## Issues / follow-ups
- Not verified: keyboard operation of the theme switch, a11y of docs pages (only the Contrast check story is a test), the Storybook TOC is dim in dark mode (Storybook's own chrome).
- Proposals in `packages/ui/POSTEP.md` await decisions.

## Lessons recorded
Storybook in this monorepo needs three explicit fixes (`.ai/lessons.md`).

## Stage 2, batch 1 (appended 2026-10-25)
- Added tokens (destructive hover, control sizes, radii, focus), `focus-ring` utility, configured `cn`, adapted shadcn input, textarea, select, label, field, separator, custom TextLink, rewrote Button.
- 6 documentation pages (13 sections), 31 stories, 8 interaction tests, frozen-state mechanism via variant override.
- Verification: lint, typecheck, 157 unit tests at 100% coverage, app build, Storybook build, story tests in both themes (32 of 32), browser checks at 320/768/1440 in both themes. Details in `packages/ui/POSTEP.md`.
- Lessons recorded: `cn` and token utilities, Prettier scope, Storybook first-run cache.

## Stage 2, batch 2 (appended 2026-10-25)
- Adapted checkbox, radio group, switch, avatar, badge (shadcn CLI, no new dependency); documented separator. Added `lib/initials.ts` and `FieldContent` hint layout. Fixed 20px label rows to 28px.
- 6 documentation pages (13 sections), 30 stories, 5 interaction tests, unit tests for every new component and helper.
- Verification: lint, typecheck, 179 unit tests at 100% coverage, app build, Storybook build, story tests in both themes (62 of 62), browser checks at 320/768/1440 in both themes, target sizes measured.
- Lesson recorded: measure click targets in the browser.

## Stage 2, batch 3 (appended, new session)
- Adapted card, alert, skeleton, table (shadcn CLI, no new dependency) and the feedback components (empty state, error message, loading message). Docs: 6 pages (13 sections), 31 stories, 5 interaction tests.
- Verification: lint, typecheck, 186 unit tests at 100% coverage, app build, Storybook build, story tests in both themes (92 of 92), browser checks at 320/768/1440 in both themes, table row heights measured.
