---
title: Make the list and item-action rules generic and reusable
status: in-progress
created: 2026-10-27
updated: 2026-10-27
owner: azsonic
---

# Make the list and item-action rules generic and reusable

## Problem / Goal

PR #32 closed the 24 gaps from the Favorite mentors probe. A fresh-agent probe on the result (screen "Recently viewed mentors", 44 decisions) still guessed 14 times (32%, baseline about 40% to 49%). The acceptance criterion of `2026-10-27-design-system-favorites-gaps.md` (guessing at 0, or only items listed in "What is missing") is not met.

Goal: a fresh agent builds a list screen with filters and a per-item action (a different object, not favorites) with no guessing outside "What is missing". Success is measured by a new probe run (see Acceptance criteria).

Sources: `.ai/runs/2026-10-27-design-system-favorites-gaps.md` (second probe findings), the first probe's baseline report (its findings on skeleton height and the toast provider are included below).

## Scope

### In scope
The gaps G25 to G37 below: one reusable hook for item removal, generic wording of the rules, a neutral variant name, and the missing small rules and states.

### Out of scope
Building the "Recently viewed mentors" screen (it was a probe only). Backend, history tracking, paging, a combobox filter, an application shell (still listed in "What is missing"). Changing tokens.

## Requirements

### Gaps and proposed resolutions

| Gap | Found by the probe | Proposed resolution | Where |
| --- | --- | --- | --- |
| G25 | `FilteredList` has no remove behavior: each consumer re-implements pending ids, failure alert, toast and the focus move (about 40 lines). | Add one hook `useItemRemoval` that owns pending ids, the failure, the toast call and the focus target, and returns what the list needs. `FavoriteMentors` becomes a thin consumer. Hook has unit tests at 100%. | `src/components/lists/use-item-removal.ts` (new), `favorite-mentors.tsx` |
| G26 | Rules are worded for favorites ("The mentor was not removed", "They are still in your favorites"). | Rewrite the "Rules for lists and actions" section and the Content tables in generic terms with a placeholder pattern (`The <object> was not removed` / `They are still in <list name>.`), keeping favorites as the worked example. | `docs/design-system.md`, `content.mdx`, `filtered-list.mdx`, `deletion-confirmation.mdx` |
| G27 | `MentorCard variant="saved"` is named and documented for favorites. | Rename the variant to `listed` (identity only, with `headline` and `actions`; no price, no slot). Update docs. No other API change. | `mentor-card.tsx`, tests, stories, docs |
| G28 | "Undoable" is defined as "can be added again at once" and is ambiguous for a history list (the mentor returns only if the person opens the profile again). | Define undoable precisely: the person can restore it themselves from a place named in the toast sentence, with no money moved, nobody notified and nothing typed lost. Anything else needs a confirmation dialog. Add a table of examples (favorite: yes; recently viewed entry: yes; availability window: no; booking: no). | `deletion-confirmation.mdx`, `design-system.md` |
| G29 | Name link versus a separate "View profile" link has no rule. | Rule: the name is the one link to the object (`MentorCard` already does this); no second link with the same target. | `design-system.md`, mentor card docs |
| G30 | List order and a "viewed at" time have no rule. | Rule: the page states its order in words above the list when it is not alphabetical or by relevance ("Most recent first"); the order is the server's. A time on an item uses `LocalTime` in a metadata line, and `MentorCard` gets an optional `meta` slot only when a second consumer needs it (not now: record in "What is missing"). | `filtered-list.mdx`, What is missing |
| G31 | Where `ToastProvider` is mounted is not stated; a component that calls `useToast` breaks without it. | Rule: the application shell mounts one `ToastProvider`; a component never mounts its own; every story that shows a toast wraps itself in a provider (the demo helpers do). Added to the Toast page and `contributing.mdx`. | `toast.mdx`, `contributing.mdx` |
| G32 | `FilteredList` hard-codes "Nothing was changed. Try again." (does not suit every load error). | Add an optional `errorMessage` prop with that text as default; document it. | `filtered-list.tsx`, tests, docs |
| G33 | The Code example on the Filtered list page has no `onRemove` or `notice`. | Replace it with a complete example using the new hook and a `notice`. | `filtered-list.mdx` |
| G34 | No state for an item whose object is no longer available (mentor suspended or unlisted). | Rule: a list shows only what is available; an item that disappears between loads is simply absent and the count reflects it. A direct link to an unavailable object uses the "does not exist or no access" state (Detail view). | `filtered-list.mdx` |
| G35 | The screen-in-folder convention for a screen that is not a domain concept is unclear (`recently-viewed/` or `mentors/`?). | Rule: a screen lives under the concept of the objects it lists (mentors in a list: `mentors/`); a new folder only when a new concept appears (AGENTS.md "create a concept folder only when its first file is added"). | `AGENTS.md`, `contributing.mdx` |
| G36 | Hard rule 3 requires lots-of-data and long-text stories on every data screen, but screen stories show them on only some screens. | Rule: component stories carry partial, lots (30) and long text; screen stories carry the states of the screen map. A new list screen gets both. Add a one-line checklist to Contributing. | `contributing.mdx`, `screens-and-state-maps.mdx` |
| G37 | The first probe used `h-24` on a skeleton (a scale utility, not a token); `check:tokens` did not flag it. | Rule: skeletons copy the footprint of the item they stand in for (reuse `MentorCardSkeleton`, or the item's own skeleton exported next to it); no free height utilities. `check:tokens` is not changed (about 111 existing numeric size utilities, mostly icon sizes). | `skeleton.mdx` |

### Probe procedure fix

The first probe silently ran on `main` (agent worktree isolation starts from the default branch). Add a short "How to run the agent test" section to `contributing.mdx`: commit first, create the worktree with `git worktree add --detach <path> HEAD`, symlink `node_modules`, give the agent absolute paths, and check `git -C <path> log -1` before trusting a result. The run log template for probes lists the commit tested.

## Acceptance criteria

- [x] G25 to G37 each resolved as in the table, or moved to "What is missing" with a reason.
- [x] `useItemRemoval` exists with unit tests at 100%; `FavoriteMentors` uses it and its tests and stories pass unchanged in behavior.
- [x] `MentorCard variant="listed"` replaces `saved` everywhere (code, tests, stories, docs).
- [x] Rules in `docs/design-system.md` and Storybook read generically; favorites appears only as the worked example.
- [x] `check:docs`, `check:tokens`, `lint`, `typecheck`, `test` (100%), `build`, `test:stories` in both themes pass; changed docs pages loaded in the browser; component stories swept at 320 px.
- [x] A new fresh-agent probe on a screen of another object type than mentors and than favorites ("Past sessions" for a mentee, with a status filter and a "Hide from list" action) run on the committed branch HEAD finishes with GUESSING at 0, or with every guess listed in "What is missing" in the same PR. The tested commit is recorded in the run log. If it still fails, record the new gaps and stop; do not loop more than two probe rounds without asking the owner. Result (commit `77eee29`, "Past sessions"): 12 of 52 guessed; criterion met by its second branch, all 12 guesses listed in "What is missing" in the same PR. Not zero.

## Technical approach

1. Work on `design-system-generic-list-rules`, cut from `design-system-favorites-gaps` (stacked on PR #32). Open the PR against that branch with the full label set and a rationale comment, as the SDLC requires; retarget to `main` after #32 merges.
2. Hook first (tests first), then migrate `FavoriteMentors`, then the `errorMessage` prop, then the rename to `listed`.
3. Docs per the table, one commit per group (code, rules, content, contributing and probe procedure).
4. Run the full gate, the browser sweep and the probe (committed HEAD, procedure above).
5. Run log with the tested commit, lessons, move this spec to `implemented/` only when the probe criterion is met.

## Open questions

None open. Answered 2026-10-27:

1. **Stacking:** stack on PR #32. This work lives on branch `design-system-generic-list-rules`, cut from `design-system-favorites-gaps`, and its PR targets that branch (retarget to `main` once #32 merges). Every PR carries the full `SDLC.md` label set with a rationale comment (one pipeline label, category, QA meta, one priority, one risk).
2. **Hook (G25):** use a hook, `useItemRemoval`.
3. **Variant name (G27):** `listed`.
4. **Undoable (G28):** the owner had no preference; the definition in the table is adopted (restorable by the person from a place the toast names; no money moved, nobody notified, nothing typed lost). Recently viewed entries and favorites are both "undoable".
5. **`check:tokens` and size utilities (G37):** do not change the check. The owner asked for a recommendation: a count of numeric size utilities (`h-4`, `size-4`, `w-80` and so on) in UI code found about 111 hits, mostly icon sizes in shadcn primitives, so a blanket check would be noisy and would need an allowlist. Decision: the skeleton rule is documentation only, plus a story/test note; revisit if a second slip appears.
6. **Probe screen:** the owner had no preference; "Past sessions" for a mentee (status filter, "Hide from list" action) is adopted.

## Notes

Stacked on PR #32 (`design-system-favorites-gaps`). The first probe's baseline (49 decisions, about 40% to 49% guessed) and the second probe's findings are in `.ai/runs/2026-10-27-design-system-favorites-gaps.md`. This spec is a draft until the owner approves it.
