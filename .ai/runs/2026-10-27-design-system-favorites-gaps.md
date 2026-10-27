---
title: Close the design system gaps found by the Favorite mentors screen
date: 2026-10-27
agent: Claude Code / claude-sonnet-5-5
spec: .ai/specs/2026-10-27-design-system-favorites-gaps.md
status: partial
---

# Close the design system gaps found by the Favorite mentors screen

## Goal
Resolve gaps G1 to G24 from the 2026-10-26 probe and turn the probe screen into a real feature.

## Summary of changes
- `packages/ui/src/components/lists/filtered-list.tsx` — shared filtered list; `MentorDirectory` rebuilt on it, its tests and stories unchanged.
- `packages/ui/src/components/mentors/mentor-card.tsx` — `headline`, `actions`, `variant="saved"`.
- `packages/ui/src/components/favorites/favorite-mentors.tsx` — the screen, with unit tests.
- `packages/ui/stories/product/favorites/` — component and screen stories; helpers in `.storybook/docs/favorites-*.ts(x)`.
- `docs/design-system.md` and Storybook pages — rules for lists and actions, content rules, dialog-or-direct decision, Favorites page, counts (19 screens, 145 states, from `index.json`).
- `scripts/check-design-system-docs/` and `npm run check:docs` — the three component lists must match.
- `AGENTS.md` — story location, file naming, American English, probe exception.
- British spellings in docs and code comments changed to American.

## Verification
- `npm run lint`, `typecheck`, `build`: pass.
- `npm run test`: 408 tests, 100% statements, branches, functions and lines.
- `test:stories` and `test:stories:dark`: 461 stories pass in both themes. `check:tokens`, `check:docs`: clean. `check:contrast`: 22 pairs ok.
- Browser sweep of all 18 favorites stories at 320, 768 and 1440 px: no horizontal overflow, no console errors. 14 changed docs pages render. Screenshots at 320 px checked.
- Not run: `test:integration` (no route or app code changed; `MentorDirectory` is not used by the app).
- Acceptance probe with a fresh agent: first run used a worktree of `main` (old design system) and is void; it is a baseline of 49 decisions with roughly 40% guessed. The second run, on this branch, was still running when the branch was pushed.

## Issues / follow-ups
- Spec stays `in-progress` until the second probe result is reviewed.
- Decision to confirm: status words keep "Cancelled" (stage 3 wording) as an exception to American spelling.
- `MentorCard variant="saved"` was added beyond the approved headline and actions (it hides price and slot).
- The first probe found things the docs still do not say: a skeleton height token rule, and where the Toast provider is mounted.

## Lessons recorded
Five entries dated 2026-10-26 and 2026-10-27 in `.ai/lessons.md`.
