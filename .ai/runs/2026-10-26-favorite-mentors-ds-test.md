---
title: Favourite mentors screen as a design system sufficiency test
date: 2026-10-26
agent: Claude Code / claude-sonnet-5-5
spec: none (test task; no spec, no tests, no exports by instruction)
status: partial
---

# Favourite mentors screen as a design system sufficiency test

## Goal
Build the screen from existing design system parts only and record every gap.

## Summary of changes
- `packages/ui/src/components/favorites/FavoriteMentors.tsx` — screen composed from existing components.
- `packages/ui/src/components/favorites/FavoriteMentors.stories.tsx` — states as stories.

## Verification
- `npx tsc --noEmit` and `npx eslint src/components/favorites` in packages/ui: clean.
- `npm run check:tokens`: "No non-token values found."
- Not run: `npm run test` (new file has no unit test by instruction, so the 100% threshold would fail), build, browser check. The story sits outside the Storybook glob (`stories/**`), so it is not rendered.

## Issues / follow-ups
See the gap report in the final message of the run.

## Lessons recorded
none
