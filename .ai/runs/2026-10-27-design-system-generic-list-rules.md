---
title: Make the list and item-action rules generic and reusable
date: 2026-10-27
agent: Claude Code / claude-sonnet-5-5
spec: .ai/specs/2026-10-27-design-system-generic-list-rules.md
status: partial
---

# Make the list and item-action rules generic and reusable

## Goal
Close gaps G25 to G37 from the second probe of PR #32 and bring a fresh agent to no guessing on a new list screen.

## Summary of changes
- `packages/ui/src/hooks/use-item-removal.ts` (+ test) — pending, toast, failure message and focus for removing an item; `FavoriteMentors` now uses it.
- `packages/ui/src/components/mentors/mentor-card.tsx` — variant `saved` renamed `listed`.
- `packages/ui/src/components/lists/filtered-list.tsx` — optional `errorMessage`.
- `docs/design-system.md` and Storybook pages — generic rules (order, link, unavailable items, toast provider, skeleton, hook, folder, story naming), precise "undoable" with an example table, list-screen checklist, "How to run the agent test", new hook row in the three component lists.
- `AGENTS.md` — where a list screen lives.

## Verification
- `lint`, `typecheck`, `build`: pass. `test`: 413 tests, 100% statements, branches, functions, lines.
- `test:stories` and `test:stories:dark`: 461 stories pass. `check:tokens`, `check:docs`: clean. `check:contrast`: 22 pairs ok.
- Browser sweep: 18 favorites stories at 320, 768 and 1440 px, no overflow; 16 docs pages render.
- Not run: `test:integration` (no app code or route changed).
- Agent test 3, tested commit `77eee29` (worktree created from that commit, verified): "Past sessions", 52 decisions: RULE 32, EXAMPLE 8, GUESSING 12 (23%; earlier runs: about 45% on the old docs, 32% on PR #32). The agent says several RULE labels were copied by analogy from mentor and favorites wording.

## Issues / follow-ups
- Acceptance criterion met by its second branch, not the first: guessing is not zero. The 12 remaining guesses are recorded in "What is missing" (session row with actions, date-only time, order line slot, copy table for lists, restore place for hidden sessions, pending announcement, status-to-filter mapping, which screen owns past sessions, phone sweep of a row).
- After the probe, three wording fixes were made in docs without a new probe: the link rule (main text, inside `h2`), the "hide with no restore place needs a dialog" example, and the story folder naming. They are not covered by a re-run.
- Most remaining items are product decisions (copy, ownership of past sessions), not design system gaps. Recommend asking the Product owner before another round; the spec allows two probe rounds and this is the first.

## Lessons recorded
Two entries dated 2026-10-27 in `.ai/lessons.md` (a rule needs its "no place" branch; probe RULE counts overstate).
