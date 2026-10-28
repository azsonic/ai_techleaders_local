---
title: Apply the owner's Past sessions decisions to the design system
status: draft
created: 2026-10-28
updated: 2026-10-28
owner: azsonic
---

# Apply the owner's Past sessions decisions to the design system

## Problem / Goal

Agent test 3 ("Past sessions") left 12 guesses, listed in "What is missing" in PR #33. Most were product decisions. The owner answered them on 2026-10-28. This spec turns the answers into design system changes and removes the resolved items from "What is missing".

## Scope

### In scope
The decisions D1 to D8 below.

### Out of scope
A separate Past sessions screen, a hide action, a hidden-sessions view, a date-only time, backend and API. Building a session row component.

## Requirements

Decisions (owner, 2026-10-28):

| # | Question | Decision |
| --- | --- | --- |
| D1 | Which screen shows past sessions | One screen: **My bookings**. Its "Past" tab stays; no separate Past sessions screen. |
| D2 | Hide a past session | **No hide action.** History stays complete. |
| D3 | Row action slot | Chosen: an `actions` slot on `BookingCard`. **Premise changed** (D2 removed the only action that needed it): see Open question 1. |
| D4 | The two no-show states | **Two options with different words, in the badge and in the filter.** |
| D5 | Date of a session | `LocalTime` as it is. No date-only variant. |
| D6 | The order line ("Most recent first") | An optional `description` prop on `FilteredList`, shown between the count and the list. |
| D7 | Copy for new lists | I draft a copy table; the owner approves it in the PR; rows stay marked as proposals until then. |
| D8 | Status filter | The "Past" tab of My bookings gets an outcome filter built on `FilteredList`. |

### Changes

| Change | Detail | Where |
| --- | --- | --- |
| C1 No-show wording (D4) | `BookingStatus` labels: mentee sees "You did not attend" (`no_show_mentee`) and "Mentor did not attend" (`no_show_mentor`); mentor sees "Mentee did not attend" (`no_show_mentee`) and "You did not attend" (`no_show_mentor`). This reverses the stage 3 wording "No-show" for both states, approved by the owner. Update tests, stories, the Statuses line in Content and every place that quotes "No-show". | `booking-status.tsx`, tests, stories, `content.mdx` |
| C2 Outcome filter (D1, D4, D8) | The Past tab of My bookings lists its bookings through `FilteredList` with the filter legend "Outcome" and the options Completed, You did not attend, Mentor did not attend. Loading, error and empty states of the tab stay as the screen defines them unless Open question 2 says otherwise. Add a story for the filter and for "no results for this outcome". | `.storybook/docs/bookings-screen.tsx`, `screen-my-bookings.stories.tsx`, E02 page |
| C3 Description line (D6) | `FilteredList` gets an optional `description` (a short string) rendered between the count and the list as `text-interface text-muted-foreground`. Unit test. Use it on the Past tab: "Most recent first". | `filtered-list.tsx`, tests, `filtered-list.mdx`, `design-system.md` "Order" row |
| C4 Copy table (D7) | Add proposal rows to Content: bookings/sessions empty state per tab and for a filter with no results, load error, loading label, and the filter option words. Mark every row "Proposal, to be approved". | `content.mdx` |
| C5 Resolved items | Remove from "What is missing": which screen owns past sessions, a restore place for hidden sessions, a date-only display, an order line inside `FilteredList`, mapping several statuses to one filter option, and the copy table for lists (kept only for the objects not covered). Remove the "A session hidden from Past sessions" example row from the Deletion confirmation table (no hide action exists). Add a short note under "Undoable" that there is no hide action for sessions (D2). | `what-is-missing.mdx`, `deletion-confirmation.mdx` |
| C6 Row with actions | Not built. Keep "A session or booking row with an actions slot" in "What is missing" with a note: needed only when a second action on a booking row exists (rule: a component is added when needed in two places). See Open question 1. | `what-is-missing.mdx` |

## Acceptance criteria

- [ ] C1 to C6 done as in the table; the status words are the same in the badge, the filter, the stories and the docs (grep for "No-show" finds only historical notes).
- [ ] `FilteredList description` has a unit test; coverage stays 100%.
- [ ] My bookings Past tab filters by outcome in Storybook, with a "no results" story, and passes axe in both themes.
- [ ] Content copy rows added and marked as proposals; "What is missing" lists only what is still undecided.
- [ ] `lint`, `typecheck`, `test` (100%), `build`, `check:tokens`, `check:docs`, `test:stories` in both themes pass; changed docs pages loaded in the browser; the Past tab story swept at 320 px.
- [ ] Labeled PR (full `SDLC.md` set with a rationale comment), stacked on PR #33.

## Technical approach

1. Branch `design-system-past-sessions-decisions`, cut from `design-system-generic-list-rules` (stacked on #33, which is stacked on #32). PR targets the previous branch; retarget when its base merges.
2. C3 first (tests first), then C1 (wording, with tests updated), then C2 (screen story), then docs C4 and C5.
3. Full gate, browser check, labels and rationale comment.
4. No new agent test round: the changes answer recorded guesses. A fourth probe is optional and only if the owner asks.

## Open questions

1. **BookingCard `actions` slot (D3):** the owner chose the slot when "hide" was an option. With no hide action, nothing needs it today, and the rule is to add a component or slot when it is needed in two places. Recommendation: do not build it now; keep it in "What is missing" (C6). Confirm, or say which action needs it.
2. **Past tab and `FilteredList` states (C2):** the tab already has its own loading, error and empty states. Recommendation: the tab keeps loading and error; `FilteredList` renders only the filter, count, description and the two empty states for the Past tab. If that is awkward to build, fall back to a filter outside the list and report it.
3. **Mentor view:** does the mentor's "Mentor bookings" Past tab get the same outcome filter? Recommendation: yes, with the mentor's words ("Mentee did not attend", "You did not attend"), in this change since the words come from the same component.

## Notes

Stacked on #33 and #32. Wording change C1 reverses the stage 3 status words; the owner approved it by answering the question on 2026-10-28.
