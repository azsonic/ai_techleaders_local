---
title: Close the design system gaps found by the Favorite mentors screen
status: implemented
created: 2026-10-27
updated: 2026-10-28
owner: azsonic
---

# Close the design system gaps found by the Favorite mentors screen

## Problem / Goal

A test build of a "Favorite mentors" screen (run log `.ai/runs/2026-10-26-favorite-mentors-ds-test.md`) needed 29 decisions: 12 were written rules, 7 had only an example, 10 were guesses. The test produced 24 gaps (G1 to G24). Goal: write down every answer so the next agent builds a list screen without guessing, and turn the probe screen into a real, tested feature that proves the rules.

## Scope

### In scope
All 24 gaps (below), the extraction of a shared filtered-list component, a `MentorCard` extension, and the Favorite mentors screen as a real feature.

### Out of scope
Backend, API route, persistence and the "save a mentor" button on the profile (the screen takes data by props and `onRemove`). Paging. A combobox filter with search. A real application shell (G3 documents the gap, it does not build a shell). Changing tokens.

## Requirements

Decisions already made by the user (2026-10-27):

- **D1 Spelling:** `favorites` everywhere, in code, folders and UI copy ("Remove from favorites", "Favorite mentors").
- **D2 Remove** is undoable: no confirmation dialog, a toast after the server confirms, no Undo button in the toast.
- **D3** All 24 gaps are fixed.
- **D4** `MentorCard` gets an optional `headline` and an `actions` slot.
- **D5** The filtered list is extracted into a shared component (not only documented).
- **D6** The story lives in `stories/product/favorites/`, the component in `src/components/favorites/`.
- **D7** The screen becomes a real feature: unit tests at 100%, kebab-case file, docs, catalogue entries.

### Gap by gap

| Gap | Resolution | Where |
|---|---|---|
| G1 mentor card has no headline or action | `MentorCard` takes `headline?: string` (muted `text-interface`, wraps, shown under the name, hidden when absent) and `actions?: ReactNode` (placed last, left aligned). Used by the directory (no change) and by favorites. | `mentor-card.tsx`, its tests and stories, `design-system.md`, Components page |
| G2 no reusable filtered list | Extract `StackFilter` (checkbox group, "Clear filters", count) and `FilteredListStates`-style rendering into one component `FilteredList` in `src/components/lists/`: props for items render function, selected values, loading, error, retry, two empty states' copy. `MentorDirectory` is rewritten on it with no visible change. | `src/components/lists/`, `mentor-directory.tsx`, tests |
| G3 no page frame | Document: `ScreenFrame` is a docs helper, not product; a page is `h1` + content inside `max-w-content`; the shell stays listed in "What is missing" with the exact needs. | `what-is-missing.mdx`, `spacing-and-layout.mdx` |
| G4 remove-failed state | Rule: a destructive `Alert` above the list, in words ("The mentor was not removed ... still in your favorites. Try again."), keeps the card, clears on the next attempt. Offline wording from `content.mdx`. Story for server error and offline. | filtered-list pattern, `content.mdx`, stories |
| G5 row-level pending | Rule: only the acted-on card's button is `loading` ("Removing..."); other cards stay usable (a second request on another card is allowed). | filtered-list pattern |
| G6 after removal | Rule: toast says who was removed; the count `role="status"` announces the new number; focus moves to the next card's heading link, or to the list heading/empty state when none is left. | pattern, component, story play function |
| G7 last item removed | Rule: unfiltered list becomes "nothing saved yet"; a filtered list that becomes empty shows "no results for these filters". | pattern |
| G8 filter vs pending data | Rule: while loading or refetching the filter stays usable and only the list area shows the state. | pattern |
| G9 partial data | Define partial for mentor items: no headline (omitted, no placeholder), no avatar image (initials), no stacks (the stack list is omitted). Story. | `mentor-card` docs, stories |
| G10 remove: dialog or direct | Add to the deletion-confirmation pattern a decision table: undoable (can be added again at once, no money, no data lost) means direct action plus toast; otherwise confirmation dialog. Favorites is the worked example. | `deletion-confirmation.mdx` |
| G11 per-card action | Rule: a secondary action on a card is `Button variant="secondary" size="dense"`, last in the card; `destructive` stays for irreversible actions. | `design-system.md`, button docs |
| G12 repeated button names | Rule: repeated actions keep the visible label and append the object name in `sr-only` text (`Remove from favorites : Anna Kowalska`). A helper is not added; the pattern is documented. | `design-system.md`, usage-and-accessibility |
| G13 headline typography and length | Rule: `text-interface text-muted-foreground`, wraps (`wrap-anywhere`), no truncation; content guide gives a maximum of 200 characters for the headline field and says longer text wraps. Maximum confirmed by the owner (2026-10-27). | `content.mdx`, mentor-card docs |
| G14 filter options | Rule: filter options are the fixed list of stacks, not derived from the visible items, so the filter does not jump. | filtered-list pattern |
| G15 heading levels | Rule: page `h1`, list item heading `h2` via `headingLevel` (default 2); a section inside the page uses `h2` and its items `h3`. | `usage-and-accessibility.mdx` |
| G16 phone layout of card actions | Rule and sweep: the action sits under the content, never beside the name; one column below `md`; test every favorites story at 320 px. | pattern, story, responsive notes |
| G17 toast copy | Add a toast copy table to `content.mdx` (title names the object and the outcome, one sentence of next step). | `content.mdx` |
| G18 spelling | Add a "Spelling" section to `content.mdx`: American English everywhere (favorites, color); "zloty" amounts stay `PLN`. Check existing copy for British spelling and fix any found. | `content.mdx`, grep |
| G19 technology vs stack | Rule: the product word is "Stack" (D07); lists of "technologies" in requests map to stacks. Added to the glossary in `content.mdx`. | `content.mdx` |
| G20 story location | Document the single location rule: component in `src/components/<concept>/`, stories in `stories/product/<concept>/` (Storybook only loads `stories/**`). Added to `AGENTS.md` and `contributing.mdx`. | `AGENTS.md`, `contributing.mdx` |
| G21 file naming | Component files are kebab-case (`favorite-mentors.tsx`); the task's PascalCase file is renamed. Stated in `AGENTS.md` (already) and contributing. | rename |
| G22 two sources | `design-system.md` is the summary and wins on conflicts; remove references to `lekcja-06/` as required reading, mark them as provenance only. Add a one-line test: Components page and `design-system.md` list the same components (a script check). | `design-system.md`, a check script under `scripts/` |
| G23 coverage vs test rule | Clarify in `AGENTS.md`: a probe or sufficiency test may skip tests only when the task says so and the files are then not committed. | `AGENTS.md` |
| G24 `ApiResult` for `onRemove` | Document the action-callback contract once: `(id) => Promise<ApiResult<unknown>>`, resolves (never rejects) with the envelope; component owns pending and failure. Added to the pattern page and `design-system.md`. | pattern, `design-system.md` |

## Acceptance criteria

- [x] G1 to G24 each resolved as in the table; each written rule names its source (reference, decision, WCAG) or is marked as a proposal.
- [x] `MentorCard` has `headline` and `actions`, with tests and stories; directory screens unchanged visually.
- [x] `FilteredList` extracted; `MentorDirectory` rebuilt on it; its existing stories and tests pass unchanged.
- [x] `src/components/favorites/favorite-mentors.tsx` exists with unit tests at 100% (statements, branches, functions, lines).
- [x] Stories in `stories/product/favorites/`: list, loading, nothing saved, no results, load error, remove pending, remove server error, remove offline, partial data, lots of data (30), long text, narrow screen, filter and remove interaction.
- [x] An epic page (or section of the Screens page) lists the favorites screen and its state map; counts come from the built `index.json`, not memory.
- [x] `design-system.md`, Components, Start here, Filtered list, Deletion confirmation, Content, What is missing, Contributing updated and consistent.
- [x] `check:tokens` clean; `check:contrast` all ok; Storybook tests pass in both themes; every favorites story swept at 320 px with no overflow.
- [ ] Re-run of the probe with a fresh agent finishes with GUESSING at 0 or only items listed in "What is missing". Not met: run on 2026-10-27 gave 14 of 44 guessed (see the run log for the new gaps).
- [x] `npm run lint`, `typecheck`, `test`, `build` pass; `test:integration` unaffected (no user-visible route changed).

## Technical approach

1. Branch `design-system-favorites-gaps` from `main` (check the current branch first, per the lesson on pushes).
2. Rename the probe files, switch copy to "favorites", move the story.
3. `MentorCard` extension (tests first), then `FilteredList` extraction (the directory's tests are the safety net), then favorites rebuilt on both.
4. Documentation per the gap table, one commit per group (components, pattern docs, content, agent docs).
5. Verification as in the acceptance criteria, then the fresh-agent re-run of the probe, in a separate subagent so it has no memory of the answers.
6. Record lessons; write the run log; move this spec to `implemented/`.

## Open questions

None. Answered 2026-10-27: (1) yes, work on a branch and open a PR at the end (no push without the user's say); (2) the headline maximum is 200 characters, confirmed by the owner, not a proposal; (3) the user is the Product owner and approves rule changes.

## Notes

Probe files from 2026-10-26 (`FavoriteMentors.tsx`, `FavoriteMentors.stories.tsx`) are untracked and become the starting point of this work. High risk item: extracting `FilteredList` touches the directory screen; mitigated by keeping its tests and stories unchanged.

Closed by the owner on 2026-10-28 as implemented. The agent-test criterion was not met on its own terms (the second probe still guessed 14 of 44); the remaining gaps were handled by `2026-10-27-design-system-generic-list-rules.md` and `2026-10-28-past-sessions-decisions.md`.
