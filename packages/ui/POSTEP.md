# POSTEP: DevMentor design system and Storybook

Driver: `lekcja-06/prompt-storybook.md`. Work stage by stage; wait for "continue" after each stage. In a new session read this file first.

## Status

| Stage | State |
|---|---|
| 0. Inventory and plan | Done |
| 1. Foundations | Done (proposals approved) |
| 2. Base components | Done (batch 4 proposals approved) |
| 3. Product components, patterns, screens | Batch A (E01) done. Batch B (E02) done (proposals approved). Batch C (E03, E04) done (proposals approved). Batch D (E05, operator action pattern, state maps) done, proposals waiting for a decision. Stage 4 next after "continue" |
| 4. Pages that teach | Done, proposals waiting for a decision |
| 5. Verification and report | not started |

## Materials read (stage 0)

`.ai/specs/product-brief.md`, `.ai/specs/backlog.md`, specs `2026-10-24-{platform-primitives,mentor-supply,find-and-book}.md`, decisions N01/N02, `lekcja-06/referencje.md`, `lekcja-06/tokeny.md`, `.ai/lessons.md`, `AGENTS.md`. Interview/benchmark research was not re-read; the references file already cites it. Audit report: none.

## Repository facts

- npm workspaces, Node 26 locally (engines `>=22.17`), Next.js 16.4.2, React 19.3, Tailwind 4 (CSS-first, theme in `packages/ui/src/styles/globals.css`).
- `packages/ui` today: `components/ui/{button,card}`, `backend/feedback/{empty-state,error-message,loading-message}`, `backend/api/api-call`, `frontend/hero`, `lib/utils`. No Storybook, no `tokens.css`.
- Component base actually installed: shadcn style `base-nova` on **Base UI** (`@base-ui/react`), not Radix. No `@radix-ui/*` in `node_modules`.
- `globals.css` still holds the stock shadcn neutral/oklch values; the approved tokens in `tokeny.md` are not implemented yet. `button.tsx` still uses opacity-based hover/destructive and `ring/50`, which `tokeny.md` marks as failing.
- Root Vitest enforces 100% coverage on `packages/*/src/**/*.{ts,tsx}`.

## Decisions approved by the user

Stage 0 answers (2026-10-25):

1. Component base stays shadcn `base-nova` on Base UI (not Radix).
2. E03–E05 screens are designed from the brief decisions and marked as proposals.
3. Avatar is added (initials or image; exact use to be proposed in stage 2).
4. Toast notification is built.
5. Stories live in `packages/ui/stories/`, outside `src/` and the 100% coverage glob. Components stay in `src/` with unit tests.
6. Item 7 approved as proposed: replace stock values in `globals.css` with the approved `tokeny.md` tokens, remove opacity-based hover/destructive/`ring/50` from `button.tsx`, keep `@theme inline` as the bridge, do not touch `hero.tsx` and frontend colours before the stage 5 list.

## Stage 1 result

- Storybook 10.6.3 (`@storybook/nextjs-vite`) in `packages/ui/.storybook`, addons docs (remark-gfm), a11y (`test: "error"`), vitest. Tailwind runs through `@tailwindcss/vite`. Geist fonts bundled with `@fontsource-variable/*`. Onboarding checklist and what's-new messages off. Brand title "DevMentor".
- Tokens: `packages/ui/src/styles/tokens.css` (raw, semantic, component), imported by `globals.css`. Every semantic token has its source in a comment. Contrast recalculated from the saved values: all 21 pairs pass in both themes.
- Theme switch sets `dark` on `<html>`, also on documentation pages.
- Foundations pages: color, typography, spacing and layout, shape and depth, motion, icons, themes, plus "Contrast check" story (interaction test).
- Scripts: `npm run storybook`, `build-storybook`, `test:stories`, `test:stories:dark` (in `packages/ui`), `check:contrast` (ui), `npm run check:tokens` (root, unit-tested at 100%).
- Approved changes to existing code: `globals.css` values replaced by tokens, `button.tsx` opacity hover/destructive/ring removed.

## Stage 1 decisions (approved 2026-10-25)

Proposals 1–5 below are approved. Proposal 6: leave `contrast.mjs` where it is. Not yet implemented: heading tokens (1), max content width (2) and the 150 ms functional duration (3) are applied at the start of stage 2, with contrast and `check:tokens` rerun. Shape (4) is confirmed again before the first component batch. Tabular figures (5) are already shown on the Typography page.

## Proposals (stage 1, now decided)

1. Heading sizes: tokens have none (page heading, section heading). Propose `--font-size-heading-page` and `--font-size-heading-section` on existing Tailwind steps.
2. Maximum content width: `72rem` for browsing and booking, `max-w-prose` for forms and conversation.
3. Motion: one functional duration (150 ms, color and border only). Reduced-motion rule was added to `globals.css` as a proposal (WCAG 2.3.3).
4. Shape: keep `--radius` (0.625rem)? Shadows: none. Both decided in stage 2 before the first batch.
5. Numbers in tabular figures (no source).
6. `packages/ui/scripts/contrast.mjs` is not under the root 100% coverage glob. Move it to root `scripts/` with tests, or leave it?

## Known violations found by `check:tokens` (not yet changed)

`button.tsx` `text-[0.8rem]` (stage 2 rewrite); `hero.tsx` and `packages/app/src/app/(frontend)/page.tsx` use indigo, zinc and white palette classes and a gradient (A01). Rule 11 and the approved plan: listed in stage 5, not touched.

## Open questions

none

## Stage 2 plan

Stage 1 proposals applied (2026-10-25): heading tokens (`text-heading-page` 24/32, `text-heading-section` 18/28), `--size-content-browse` 72rem (`max-w-content`), `--duration-functional` 150 ms (default transition duration). Contrast 21/21 unchanged, lint, typecheck, 130 unit tests (100%), build, Storybook build and both story test runs pass.

Batches (about six each, stop after each):
1. Button, text action and link, text input, textarea, label and form field, select.
2. Checkbox, radio group, switch, avatar, status badge, separator.
3. Card and panel, alert, loading skeleton, empty state, error state, table.
4. Dialog, confirmation dialog, menu, popover, tooltip, tabs, toast.


## Stage 2 decisions (approved 2026-10-25, answer "ok" to questions 1–5)

1. Heights: default 40px (forms, booking, conversation), dense 32px (browsing, tables), xs 24px. Horizontal padding 16px and 12px.
2. Radii: controls 8px (`--radius-control`), panels 10px (`--radius-panel`).
3. Focus: 2px ring in `--ring`, offset 2px (utility `focus-ring`).
4. Disabled: `--muted` fill, muted text, border, no opacity, reason as text with `aria-describedby`. Loading: label kept or replaced, `aria-busy`, no spinner.
5. Destructive hover and pressed: new token `--destructive-hover` (red 800 light, red 200 dark), contrast 8.02:1 and 13.63:1.
Also approved as proposals: no movement on press; selected option shows a check and semibold text, never fill alone.

## Batch 1 result (button, text link, text input, textarea, form field, select)

- Components: `components/ui/{button,input,textarea,select,label,field,field-context,separator}.tsx`, `frontend/text-link.tsx`. Field, label, input, textarea, select and separator came from the shadcn CLI and were adapted; no new dependency was added by the CLI. Separator (batch 2 in the plan) was pulled in by the CLI and adapted now so coverage stays at 100%.
- Removed from the base: `outline` button variant (secondary now has a border), `sm`/`lg` sizes, shadcn `FieldSeparator`, `FieldTitle`, `responsive` orientation, enter/exit animation classes in Select.
- `Field` wires label, hint and error to the control through context (`aria-describedby`, `aria-invalid`).
- `lib/utils.ts` `cn` now knows the token utilities (`text-conversation`, `font-emphasis`, `p-panel`, ...). Components import it from `lib/utils`.
- Frozen previews: `preview.css` redefines the `hover`, `focus-visible` and `active` variants to also match `data-preview-state`, so components declare nothing twice.
- Docs: 6 pages with 13 sections each. 31 stories, 8 play-function tests.
- Verified: unit tests 157 (100% coverage), lint, typecheck, app build, Storybook build, `test:stories` and `test:stories:dark` 32 of 32, a11y gate proven to fail on an unlabelled button, 6 pages at 320/768/1440 px in both themes (13 sections, no overflow, no console errors), frozen states measured in the browser.

## Proposals waiting for a decision (batch 1)

1. Input, textarea and select show typed or chosen values at the conversation size (16px) and dense variants at 14px. No reference source; chosen so mobile browsers do not zoom.
2. `Select` list opens below the trigger (`alignItemWithTrigger` is off by default) and has no animation.
3. Optional fields are marked "(optional)" in text; required is the default and unmarked.
4. Buttons in forms span full width at 320px (proposal in the Button page).
5. A search field with results is not in the system: recorded for "What is missing".

## Known gaps in batch 1

- Not checked: screen reader output (no screen reader was run), the Select list at 320px with a real mobile keyboard, the docs code blocks stay light in dark theme (Storybook's syntax highlighter).
- `check:tokens` still reports 9 findings, all in `hero.tsx` and `app/(frontend)/page.tsx` (not touched, listed for stage 5).

## Batch 1 decisions (approved 2026-10-25, "ok")

Batch 1 proposals 1–5 approved (conversation-size values in inputs, Select list opens below the trigger, "(optional)" in text, full-width form buttons at 320px, search field recorded for "What is missing").

## Batch 2 result (checkbox, radio group, switch, avatar, status badge, separator)

- Components: `components/ui/{checkbox,radio-group,switch,avatar,badge}.tsx` (from the shadcn CLI, adapted; no new dependency) and `lib/initials.ts`. Separator was adapted in batch 1 and is documented now.
- Removed from the CLI output: `AvatarBadge`, `AvatarGroup`, `AvatarGroupCount`, the `sm` switch size, badge variants `outline`, `ghost`, `link`.
- Checked and mixed states show a check or a dash, a radio shows a dot, a switch thumb is left or right: state is never fill alone. The switch moves instantly (P11.1).
- Click targets measured in the browser: horizontal field rows are 28px high (was 20px: fixed with `py-inline` on the label), controls have a 28px hit area.
- `Field orientation="horizontal"` with a hint needs `FieldContent` around label and hint.
- Docs: 6 pages with 13 sections each (12 pages in total with batch 1). 61 stories, 13 play-function tests across primitives.
- Verified: unit tests 179 (100% coverage), lint, typecheck, app build, Storybook build, `test:stories` and `test:stories:dark` 62 of 62 (a11y gate as error), all 12 primitive pages at 320/768/1440 px in both themes (13 sections, no overflow, no console errors), switch thumb positions measured, contrast 22 of 22.

## Proposals waiting for a decision (batch 2)

1. Avatar is a square with the control radius (8px), not a circle. No reference source; a circle is the common default and would read as more generic (A01).
2. Avatar sizes 24, 32 and 40px, and where it appears (mentor card, message attribution): proposal, the brief does not mention photos.
3. Badge: three variants (filled for the current status, bordered neutral for waiting or finished, bordered red for negative). Status names are not final until stage 3. Badge is rounded like a control, not a pill.
4. The switch in the mentor profile saves with the form, not instantly (E01 spec shows it inside the profile form). Documented as such.
5. Checkbox, radio and switch label rows are 28px high with a top-aligned control.

## Known gaps in batch 2

- No screen reader was run; Base UI roles and names were checked with axe and attribute assertions only.
- The stack filter in the directory (E02 spec) is not decided between checkboxes and another control; it is built in stage 3.
- `check:tokens` still reports 9 findings in `hero.tsx` and `app/(frontend)/page.tsx`.

## Batch 2 decisions (approved 2026-10-25, "ok")

Batch 2 proposals 1–5 approved (square avatar with control radius, avatar sizes and use, three badge variants, switch saves with the form, 28px label rows). Batch 3 started on "continue" in a new session.

## Batch 3 result (card and panel, alert, loading skeleton, empty state, error state, table)

- Components: `components/ui/{card,alert,skeleton,table}.tsx` (alert, skeleton, table from the shadcn CLI, adapted; no new dependency). Existing `backend/feedback/{empty-state,error-message,loading-message}.tsx` are the empty state, error state and loading text. They were adapted in place: same exports and props, `ErrorMessage` gained an optional `action`.
- Card: opaque fill, 1px border, panel radius, no ring or shadow, footer on an opaque muted band. Removed image-corner rules. API unchanged (`size="sm"` is the compact card).
- Alert: icon always present (added by the component), `role="status"` by default and `role="alert"` for destructive. Removed `AlertAction` (not dismissible).
- Skeleton: static, `aria-hidden`, no pulse. `LoadingMessage`: plain text, no spinner (P11.1).
- Empty state: left aligned, solid border (the dashed border and centering are gone).
- Table: `label` is required (names the scroll region, focusable). Rows 32px, 1px separators, no zebra, no selected state.
- Docs: 6 pages with 13 sections each (18 component pages in total). 92 stories in total (91 in primitives), 19 play-function tests in primitives.
- Verified: unit tests 186 (100% coverage), lint, typecheck, app build, Storybook build, `test:stories` and `test:stories:dark` 92 of 92 (a11y as error), 9 primitive pages re-checked at 320/768/1440 px in both themes (13 sections, no overflow, no console errors), contrast 22 of 22, table row heights measured (fixed after row with a button was 41px).

## Proposals waiting for a decision (batch 3)

1. The existing feedback components (`EmptyState`, `ErrorMessage`, `LoadingMessage`) changed look and `LoadingMessage` lost its spinner. Approval needed under rule 12; reasons: dashed border, centering, `text-destructive/80` opacity and `animate-spin` conflict with A01 and P11.1.
2. Error state keeps the name `ErrorMessage` in code; the documentation page is called "Error state".
3. Alert always shows an icon and cannot be dismissed. A dismissible notice would be a toast (batch 4).
4. Card title is a `div`; a heading goes inside `CardTitle` when the card heads a section.
5. Table has no selected, sortable or striped variants.

## Known gaps in batch 3

- Screen readers not run. `aria-busy` and `role` behavior checked by assertions and axe only.
- No search field with results (recorded for "What is missing").
- Product components in stage 3 build the data states (loading, empty, error, partial, lots of data, long text) from these parts.

## Batch 3 decisions (approved 2026-10-25, "ok")

Approved: the in-place changes to `EmptyState`, `ErrorMessage` and `LoadingMessage` (rule 12), the "Error state" docs name for `ErrorMessage`, icon-always and non-dismissible alert, heading inside `CardTitle`, no selected, sortable or striped table. Next: batch 4 (dialog, confirmation dialog, menu, popover, tooltip, tabs, toast) after "continue".

## Batch 4 result (dialog, confirmation dialog, menu, popover, tooltip, tabs, toast)

- Components: `components/ui/{dialog,alert-dialog,dropdown-menu,popover,tooltip,tabs}.tsx` (from the shadcn CLI, then rewritten to tokens; no new dependency, `package.json` and lockfile unchanged) and `components/ui/toast.tsx` (written on Base UI Toast, because the CLI's toast is Sonner, which is not in the plan).
- Removed from the CLI output: enter and exit animation, shadows, rings, `backdrop-blur`, tooltip arrow, `AlertDialogMedia` and `size`, all menu sub-menu parts and shortcut, the default (pill) and `line` tabs variants, `outline` button usage.
- Overlay surface: opaque `--popover`, 1px `--border`, panel radius, no shadow, no animation (A01.2, P11.1). Footers are a `--muted` band with Cancel first in the DOM.
- New token `--scrim` (flat dim behind a modal dialog) in `tokens.css`, bridged as `bg-scrim`.
- Docs: 7 pages with 13 sections each (25 component pages in total): Dialog, Confirmation dialog, Popover, Tooltip, Tabs, Menu, Toast. 125 stories in total (33 new), 7 new interaction tests (26 in primitives). Open overlays render in their own frame in the docs.
- Fixed in `.storybook/preview.tsx`: a story shown in its own frame inside a docs page now follows the docs page theme (it stayed light in dark mode, and its initial globals flipped the docs page back to light).
- Verified: unit tests 208 (100% statements, branches, functions, lines), lint, typecheck, app build, Storybook build, `test:stories` and `test:stories:dark` 125 of 125 (a11y as error), contrast 22 of 22, all 7 pages at 320/768/1440 px in both themes (13 sections, no overflow, no console errors), dark class on docs page and on every nested frame, dialog and toast fit at 320 px (16px margins), footer stacks with the action on top, Cancel has initial focus, menu highlight outline measured (fixed: `outline-none` had cancelled it), tab bar and weights measured, toast close 24x24.

## Proposals waiting for a decision (batch 4)

1. Scrim: `--scrim` is stone 950 at 60%, flat, no blur. The references describe no overlay. In dark the page is already stone 950, so only the border separates the panel.
2. Dialog width is one size (`max-w-md`, 28rem); a larger task is a page. The corner close button is on by default.
3. Tooltip is an inverted chip (`--foreground` fill) with no arrow and shows at once (delay 0). No reference source for the inversion.
4. Menu has no sub-menus and no shortcut hints. Items are 32px; the highlighted item has an accent fill and a 2px inset outline. Destructive items use `--destructive` text and always open a confirmation dialog first.
5. Tabs: one flat underline style (2px bar and semibold text), 32px high, arrow keys select at once. A disabled tab looks like an unselected one, so the docs say not to disable tabs.
6. Toast: one variant (a confirmation with a check icon), 8 seconds, pauses on hover or focus, bottom right on wide screens and full width at 320px, at most three. Never for an error that needs action. The 8 seconds is a proposal (WCAG 2.2.1 context only).
7. `AlertDialogAction` does not close the dialog by itself; the page closes it after the server confirms (P12.1).

## Known gaps in batch 4

- No screen reader was run. Roles, names and focus were checked with axe, attribute assertions and the story interaction tests only.
- Toast: Base UI hides the close button from assistive technology until the toast is hovered or focused. Not tested with a screen reader.
- Tooltip and popover on touch were not checked on a real device. Popover flipping at 320px is documented from the library's behavior, not measured.
- The confirmation dialog's loading and error states are documented but have no story: they need the form pattern with mocked API responses (stage 3).
- `check:tokens` still reports 9 findings in `hero.tsx` and `app/(frontend)/page.tsx` (not touched, listed for stage 5).
- A search field with results is still missing (recorded for "What is missing").
- Vite re-optimizes new Base UI imports on the first `test:stories` run after adding components; the run fails once and passes on rerun.

## Batch 4 decisions (approved 2026-10-25, "ok")

Batch 4 proposals 1–7 approved (scrim, one dialog width with corner close button, inverted tooltip chip shown at once, menu without sub-menus, flat underline tabs with no disabled tabs, single-variant 8 s toast, confirmation action closed by the page after server confirmation).

## Next step (superseded by the batch A next step at the end of this file)

Stage 3: product components and patterns for every backlog epic, then key screens with state maps.

## Stage 3 plan (approved 2026-10-25, "ok" to questions 1–4)

Sources read for the plan: `backlog.md`, UI/UX sections of the E01, E02 and platform specs, brief decisions D07–D34 and rules R01–R17. E03–E05 have no spec: their screens come from brief decisions and are proposals (approved in stage 0, question 2).

Placement: components tied to a concept go in `packages/ui/src/components/<concept>/` (AGENTS.md; the E01 spec says `frontend/<concept>/`, AGENTS.md wins), unit tested at 100%, built only from the 25 base components. Stories in `stories/product/<epic>/` and `stories/patterns/`, screens in `stories/screens/<epic>/`. Data states per product component: loading, empty, error, partial, lots of data, long text.

### Product components (name: screen that needs it)

| Epic | Component | Screen |
|---|---|---|
| E01 | `StackBadge` (stack name on `Badge`) | Directory card, mentor page, profile form |
| E01 | `MentorCard` (name, stacks, price range, nearest slot) | Directory, public profile |
| E01 | `ShareLink` (link field with copy button, tooltip, toast) | Mentor profile page |
| E01 | `WindowForm`, `WindowList`, `SlotPreview` | Mentor availability |
| E01 | `InvitationRow` status (`Badge` + revoke menu) | Admin invitations (table) |
| E02 | `PriceOption` and `LengthChoice` (both prices side by side, 25 or 50) | Mentor page, booking page |
| E02 | `SlotPicker` (14 days, grouped by day) and `LocalTime` (zone name) | Mentor page |
| E02 | `BookingClosedNotice` ("Booking opens soon", an Alert) | Directory, mentor page |
| E02 | `BookingSummary` and cancellation rule line | Booking page |
| E02 | `BookingCard` (list row: time, person, status, question) | My bookings, mentor bookings |
| E02 | `BookingStatus` (badge from the state machine) | Same, session header |
| E02 | `CancelDialog` (mentee: outcome and 15-minute grace; mentor: required reason) | My bookings, mentor bookings |
| E02 | `NotificationRow` | Notifications |
| E03 (proposal) | `RefundOutcome` line, `PayoutRow` | Cancel dialog, mentor earnings |
| E04 (proposal) | `MessageItem` (author, time, sending, sent, not sent with retry), `Composer` (always visible), `SessionHeader` | Session screen |
| E04 (proposal) | `UsefulnessCheck` | After the session |
| E05 (proposal) | `GateStatus` (x of 5 mentors published), `MetricRow`, `OperatorActionDialog` (reason required), `AuditRow` | Operator pages |

### Patterns (each state as its own story)

Form (with API response states through msw: success, pending, field error, server error, offline), filtered list (directory by stack), detail view (mentor page, booking), deletion confirmation (availability window), operator action with a required reason, session conversation (R02: composer always visible, P12 message states).

### Key screens (fullscreen stories with a state map)

E01 join, profile, availability, admin invitations. E02 directory, mentor page, booking page, my bookings, mentor bookings. E03 payment step and mentor earnings (proposal). E04 session, usefulness check (proposal). E05 gate status, metrics, suspend a mentor (proposal).

### Batches (stop after each)

A. E01 components, form pattern, deletion confirmation pattern, E01 screens.
B. E02 components, filtered list, detail view, E02 screens.
C. E03 and E04 components, conversation pattern, their screens.
D. E05 components, operator action pattern, state maps for all epics.

### Questions

1. Approve the component, pattern and batch lists above (rule 6: nothing outside an approved plan)? Remove or add rows as needed.
2. Place product components in `components/<concept>/` as AGENTS.md says (recommended), not `frontend/<concept>/` as the E01 spec says?
3. Forms: plain React state plus Zod schemas from `@devmentor/core`, no form library and no new dependency (recommended). msw is already installed for the mocked responses. OK?
4. Booking status labels from the state machine, in English: Pending, Confirmed, Cancelled by you, Cancelled by mentor, Completed, No-show. Proposal; OK?

## Stage 3 decisions (approved 2026-10-25)

Component, pattern and batch lists approved as written. Product components go in `components/<concept>/`. Forms use plain React state, no form library, no new dependency. Booking status labels approved: Pending, Confirmed, Cancelled by you, Cancelled by mentor, Completed, No-show.

Interpretation made while building batch A (flag if wrong): `@devmentor/core` has no Zod schemas yet (only http errors and `ApiResult`), and rule 11 forbids adding them outside the design system, so form validation is small pure functions next to each component. R05 price bounds and D07 stacks are constants in `components/mentors/pricing.ts` until `core` gets them.

## Batch A result (E01 components, form and deletion confirmation patterns, E01 screens)

- Components in `components/mentors/` (StackBadge, MentorCard and its skeleton, ShareLink, ProfileForm, pricing constants), `components/availability/` (WindowForm, WindowList with the removal dialog, SlotPreview, window rules), `components/invitations/` (InvitationRow). Shared: `hooks/use-form.ts` (the form pattern) and `components/form-feedback.tsx`. `ProfileForm`, `useForm` and `FormFeedback` are part of the Form pattern, not extra rows; they are not in the approved table, so listed here for your confirmation.
- Pure validation lives next to the components (`validateProfile`, `validateWindow`): `@devmentor/core` has no mentor schemas yet and rule 11 forbids adding them.
- Patterns (MDX pages with live stories): **Form** (10 rules with sources, 9 states each a story, five API responses through the real `apiCall` with `fetch` answered by `.storybook/docs/mock-api.ts`) and **Deletion confirmation** (7 rules, question, pending, server error, offline).
- Screens (fullscreen stories, 28 states): Join (8), Profile (5), Availability (6), Admin invitations (7). The state map is the page `Design system / E01 Mentor supply` (flow, components, state map with source per state, source files, work that remains).
- Closes the batch 4 gap: the confirmation dialog's loading, server error and offline states now have stories (Window list).
- Numbers: 76 new stories (201 in total), 279 unit tests (100% statements, branches, functions, lines), `package.json` dependencies, exports and the lockfile unchanged.
- Verified: lint, typecheck, app build, Storybook build, `test:stories` and `test:stories:dark` 201 of 201 (a11y as error), contrast 22 of 22, `check:tokens` still 9 findings in untouched `hero.tsx` and `app/(frontend)/page.tsx`. Browser: all 28 screen states and the 3 new docs pages at 320/768/1440 px in both themes, 174 page loads, no horizontal overflow, no console errors, one `h1` per screen, theme class correct.

## Proposals waiting for a decision (batch A)

1. Prices in the profile form may stay empty (the E01 spec allows saving before pricing); listing is enabled by the page through `canList`, derived from the saved profile, with the reason in text while it is off.
2. The window form uses native date and time inputs (browser-localised), validates the 10:00 to 22:00 Warsaw band and the 25-minute minimum client-side, and clears its fields after a confirmed save while keeping the "Window added" message until the next edit.
3. Slot preview marks times that also fit 50 minutes with a bold weight and a bordered chip, plus hidden text; no icon, no colour.
4. Mentor card (listing) shows "Price from X PLN" and "Nearest slot", with "Prices not set yet" and "No bookable slot yet" for partial data. Avatar is decorative (the name is next to it).
5. Share link result ("Link copied.") appears as text beside the button, not as a toast.
6. Invitation status badges: Pending (filled), Accepted and Expired (bordered neutral), Revoked (bordered red).
7. Screens are story compositions inside the design system. Page chrome (header, shell) is a documentation helper, because the application shell is not in the plan.

## Known gaps in batch A

- Not built, and for "What is missing": the mentor's public work links (up to five, https only) in the profile form; the sign-in page; the revoke action with a required reason (operator action pattern, batch D); where focus goes after a window is removed (page decision).
- A search or stack-filter control for the directory is not part of E01 (batch B).
- Not checked: screen reader output; real mobile browsers (native date and time inputs); dragging the table sideways by touch.
- Join, profile, availability and invitations screens use `ScreenFrame`, a minimal header, not a real shell.

## Next step (superseded by the batch C next step at the end of this file)

Wait for the batch A decisions and "continue". Then batch B: E02 components (PriceOption, LengthChoice, SlotPicker, LocalTime, BookingClosedNotice, BookingSummary, BookingCard, BookingStatus, CancelDialog, NotificationRow), filtered list and detail view patterns, E02 screens with the state map.

## Batch A decisions (approved 2026-10-25, "ok")

Batch A proposals 1–7 approved, and `ProfileForm`, `useForm` and `FormFeedback` confirmed as part of the Form pattern. Gaps (public work links, sign-in page, revoke with reason in batch D, focus after removal) stay recorded for "What is missing". Batch B starts on "continue".

## Batch B result (E02 components, filtered list and detail view patterns, E02 screens)

- Components in `components/bookings/`: LocalTime (with `formatMoment`, `zoneName`), BookingStatus, BookingClosedNotice, LengthChoice (with PriceOption), SlotPicker, BookingSummary (with the cancellation rule text), BookingCard, CancelDialog (mentee: confirmation dialog with the refund outcome; mentor: dialog with a required reason), NotificationRow, and `refund-outcome.ts` (outcome wording). In `components/mentors/`: MentorDirectory (the filtered list). Hook: `hooks/use-viewer-zone.ts` (browser zone, UTC on the server, via `useSyncExternalStore`).
- `MentorDirectory` and `useViewerZone` are not rows in the approved table. `MentorDirectory` is the realisation of the filtered list pattern for E02-S01 (like `ProfileForm` was for the form); `useViewerZone` is the "zone" part of `LocalTime` and `SlotPicker`. Listed for your confirmation.
- Patterns: **Filtered list** (7 rules, states as stories, two different empty states) and **Detail view** (7 rules, mentor page states incl. "does not exist or no access").
- Screens (47 states): Directory (7), Mentor page (7), Booking page (11), My bookings (10), Mentor bookings (7), Notifications (5). State map on the page `Design system / E02 Find and book`, with a source for every state. The cancel dialog's pending, server error and offline states have stories.
- Headings: BookingCard and NotificationRow take `headingLevel` (axe `heading-order` failed with a fixed `h3` under an `h1`).
- Numbers: 101 new stories (302 in total), 331 unit tests (100% statements, branches, functions, lines), `package.json` dependencies and exports and the lockfile unchanged.
- Verified: lint, typecheck, app build, Storybook build, `test:stories` and `test:stories:dark` 302 of 302 (a11y as error), contrast 22 of 22, `check:tokens` still 9 findings in untouched `hero.tsx` and `app/(frontend)/page.tsx`, all story links in the MDX pages resolve to real stories. Browser: 47 screen states and 3 docs pages at 320/768/1440 px in both themes (300 page loads): no overflow, no console errors, one `h1` per screen, correct theme class. Screenshots at 320 px reviewed; found and fixed a duplicated "Sessions are text only." line.

## Proposals waiting for a decision (batch B)

1. Directory filter is a checkbox group of the four stacks (visible, one click removes one), with a "Clear filters" action and an announced result count. No removable chips, because the checked boxes already are the visible filters.
2. "Nothing here yet" in the directory has no create action (a mentee cannot create a mentor); it says when mentors appear.
3. Slot picker is one radio group (one tab stop, arrows move) with a check and a heavier border on the chosen slot; times use the viewer's zone, named once above the list.
4. Length choice shows both prices side by side as two radio rows; nothing is preselected, and the main button stays disabled with a visible reason until a length and a slot are chosen.
5. Booking status labels follow the approved list; cancellations are worded from the viewer's side ("Cancelled by mentee" for a mentor). "No-show" has no suffix; the booking row says who. Cancelled and no-show use the red-bordered badge, Confirmed the filled one.
6. Cancellation outcome wording: "due when payments process" for full refunds and "no refund. The mentor is paid when payments process" until E03-S02 ships; the cancellation rule on the booking page is one sentence.
7. Mentor cancellation reasons are the fixed list (question out of scope, I am unavailable, other) plus an optional note; the mentee dialog is a confirmation dialog, the mentor's is a dialog with a form.
8. Notification rows say "New" in words and semibold for unread; there is no dot and no count in a header.
9. The booking page's question is required, plain text up to 2000 characters with a visible count.

## Known gaps in batch B

- Not built, for "What is missing": a booking's own page `/bookings/[id]`; the unread count in a header (no shell in the plan); a search field with results; paging; the sign-in page; a combobox filter with many values.
- Not checked: screen reader output; real mobile browsers (native date inputs were E01); the viewer-zone path on a real device in another zone (stories pin zones; the browser-zone path is covered by unit tests and a smoke check).
- The mock API replaces `fetch` for one `apiCall` at a time; the real CSRF and envelope code runs, but nothing is sent over a network.

## Batch B decisions (approved 2026-10-25, "ok")

Batch B proposals 1–9 approved, and `MentorDirectory` and `useViewerZone` confirmed as part of the filtered list pattern and of LocalTime and SlotPicker. Gaps (booking's own page, header unread count, search field, paging, sign-in page) stay recorded for "What is missing". Next after "continue": batch C (E03 and E04 components, conversation pattern, their screens).

## Batch C result (E03 and E04 components, conversation pattern, E03 and E04 screens)

No E03 or E04 specification exists: everything in this batch is a proposal drawn from the brief (R02, R04, R05, R09, R15, R16, D10, D11, D18, D32, D33) and the references (R02.1 to R02.5, P10 to P12). The epic pages say so.

- Components, each with unit tests (100%): `components/payments/` (`RefundOutcomeLine`, `PayoutRow`, `payout.ts` with the 20% split in grosze), `components/messages/` (`MessageItem`, `Composer`, `Conversation`), `components/sessions/` (`SessionHeader`, `session-phase.ts`, `UsefulnessCheck`).
- `Conversation` is not a row in the approved table. It is the realisation of the conversation pattern, like `ProfileForm` and `MentorDirectory`; listed for your confirmation.
- Pattern page **Conversation** (14 rules with sources, states as stories, the one-screen layout with the composer in view).
- Epic pages `Design system / E03 Payments` and `Design system / E04 Text session`: flow, components, state map with a source for every state, source files, work that remains.
- Screens (36 states): Payment step (8), Mentor earnings (6), Session (15, four of them real sends through `apiCall` with a mocked answer), Usefulness check (7).
- Documentation helpers (not exported): `.storybook/docs/{e03-data,e04-data,session-screen,stripe-placeholder}`; `mock-api.ts` gained a `declined` mode (402). `session-screen.tsx` exports `useMockMessages`, which the Conversation stories share.
- Numbers: 87 new stories (389 in total, 31 of them interaction stories), 3 new documentation pages, 35 new unit tests (366 in total, 100% statements, branches, functions, lines). `package.json` dependencies and exports and the lockfile were not touched by this batch.
- Verified: lint, typecheck, app build, Storybook build, `test:stories` and `test:stories:dark` 389 of 389 (a11y as error), `check:contrast` 22 of 22, `check:tokens` still 9 findings in untouched `hero.tsx` and `app/(frontend)/page.tsx`, all 342 story links in the MDX pages resolve. Browser (headless Chromium): the 36 screen states and the 3 new docs pages at 320/768/1440 px in both themes (234 page loads): no horizontal overflow, no console errors, one `h1` per screen, correct theme class, Markdown tables render as tables. Screenshots at 320 px and 1440 px dark reviewed (session, payment step, earnings). The composer is in view with 60 messages (play test).

## Proposals waiting for a decision (batch C)

1. Payment is the last step of the booking page, not a separate page. The question is shown as text above the Stripe form; the button reads "Pay 120 PLN and book". A declined card is an alert ("Your card was declined. Nothing was charged. Use another card."), never a toast.
2. Stripe's payment form is not designed: a documentation helper marks its place. Its fields and errors belong to Stripe.
3. `RefundOutcomeLine` has seven outcomes (grace, full, late, mentor cancelled, mentor absent, nobody present, mentee absent), amount first. "The same day" is said only where R04 says it. It is the E03 wording; the E02 cancel dialog keeps "due when payments process" until you decide E03-S02.
4. Mentor earnings: columns Session, Price, Commission (20%), You receive, Status; statuses Held, Paid, Refunded, In dispute; two totals (held until the report window closes, paid). Amounts are right-aligned in tabular figures; whole zloty without grosze, otherwise two decimals.
5. Session screen: one screen tall, a small header, a scrolling log, the composer below it. One column, no bubbles, no avatars, "You" for your own messages. The booking question is the first message, with the caption "Booking question".
6. Delivery states in words beside the message: "Sending…", "Sent", "Message wasn't sent." with "Try again". "Sent" stays only on your latest message. The composer clears at once and stays usable while a message is sending.
7. Enter adds a line; the "Send message" button sends. No keyboard shortcut and no message length limit (none is decided).
8. After the session ends the composer stays, disabled, with "This session has ended." beside it. The header names the phase (Not started, In progress, Ended) and writes the end time; nothing counts down.
9. Usefulness check: one required question "Did the help from {mentor} arrive before your deadline?" with two answers ("Yes, it arrived in time", "No, it arrived too late"), button "Send answer", answer shown as text once saved. Open question: add "I had no deadline"?
10. `session-phase.ts`, `payout.ts` and the other plain `.ts` modules are imported by relative path from stories (the package exports only `.tsx` under `components/*`).

## Known gaps in batch C

- Not built, for "What is missing": Stripe's payment form and its errors; mentor Stripe Connect onboarding and payout details (E03-S03-T01 is open); receipt or invoice; "Report a problem" (D32, 24 hours, two reasons, 1000 characters); attendance ("has not joined yet", R16); code in messages (R01.2, P09.2); message length limit; send shortcut; the operator's read-only session view (D29, R13); a booking's own page with the session link.
- Not checked: screen reader output (role="log" announcements, the failure `role="alert"`); real mobile browsers (on-screen keyboard height with the composer); the real clock-driven phase change (stories pin `now`).
- The booking page in E02 still has its own "Book session" button; merging it with the payment step is the page's job once E03-S01 is specified.

## Next step (superseded by the batch D next step at the end of this file)

Wait for the batch C decisions and "continue". Then batch D: E05 components (`GateStatus`, `MetricRow`, `OperatorActionDialog` with a required reason, `AuditRow`), the operator action pattern, E05 screens, and state maps for all epics. Stage 3 ends with batch D.


## Batch C decisions (approved 2026-10-25, "approve")

Batch C proposals 1–10 approved as recommended: payment as the last step of the booking page with Stripe's form not designed, declined card as an alert, delivery states in words with "Sent" only on the latest own message, one-column session with no bubbles, avatars or countdown, disabled composer with a reason after the session, `Conversation` confirmed as part of the pattern, no send shortcut and no length limit until E04 is specified (ask the Tech Lead for the limit), phase badge with a written end time, relative imports for plain `.ts` modules. Proposal 9 is resolved by adding a third usefulness answer, "I had no deadline" (`UsefulnessAnswer` is now `"yes" | "no" | "no-deadline"`). Moving the E02 cancel dialog to `RefundOutcomeLine` waits for E03-S02. Gaps stay recorded for "What is missing". Batch D starts on "continue".

## Batch D result (E05 components, operator action pattern, E05 screens, state maps for all epics)

No E05 specification exists: everything is a proposal drawn from the brief (D11, D12, D16, D19, D20, D24, D25, D29, R06, R13, R16) and the references (P10 to P12, N01). The epic page says so.

- Components with unit tests (100%): `components/operator/` (`GateStatus`, `MetricRow`, `OperatorActionDialog`, `AuditRow`).
- Pattern page **Operator action** (10 rules with sources, states as stories, suspend and revoke shown).
- Epic page `Design system / E05 Supply gate and pilot` and the overview page `Design system / Screens and state maps` (all 18 screens, 138 states, basis specified or proposal, patterns used).
- Screens (29 states): Gate (7), Metrics (5), Suspend a mentor (11), Audit log (6).
- Documentation helper (not exported): `.storybook/docs/e05-data.ts`.
- Numbers: 52 new stories (441 in total, 9 of them interaction tests), 3 new documentation pages (the Operator action pattern, the E05 epic page and the overview; 44 documentation entries in total), 13 new unit tests (379 in total, 100% statements, branches, functions, lines). `package.json` dependencies and exports and the lockfile were not touched by this batch.
- Measured screen states per epic (from the built Storybook): E01 26 (this file said 28 earlier, a miscount), E02 47, E03 14, E04 22, E05 29, 138 in total.
- Verified: lint, typecheck, app build, Storybook build, `test:stories` and `test:stories:dark` 441 of 441 (a11y as error), `check:contrast` 22 of 22, `check:tokens` still 9 findings in untouched `hero.tsx` and `app/(frontend)/page.tsx`, all 415 story links in the MDX pages resolve. Browser (headless Chromium): the 29 E05 screen states and the 3 new docs pages at 320/768/1440 px in both themes (192 page loads): no overflow, no console errors, one `h1` per screen, correct theme class, tables render. Screenshots at 320 px reviewed (suspend dialog, measures).
- Found and fixed by the a11y gate: `MetricRow` as a `div` with a nested `p` inside a `dl` failed axe `definition-list`; it is now a `dt` with `dd`s in one grid.

## Proposals waiting for a decision (batch D)

1. Gate status shows "x of 5" in words and a state badge (Closed, Open, Stopped), with the invited, accepted and published counts. No progress bar: it would read as course progress (N01.1, NR03).
2. The operator action dialog names the object, states the consequence, requires a reason ("Logged with your e-mail and the time."), and has "Keep as it is" first and the verb button second. Success is shown by the page after the server confirmed.
3. Metrics page: four groups (Timing, Payments and refunds, Booking source, Outcome). A measure with no data says "No data yet", never 0. The numbers in the stories are made up; definitions (median, week boundaries) are not specified.
4. Audit log: four columns (When, Operator, Action, Reason), read only, newest first.
5. Suspend page: a "Listed" or "Suspended" badge, the e-mail and future bookings, one "Suspend mentor" action; after confirmation an alert with the consequence and a link to the audit log.
6. No limit on the length of a reason (no source). Decide whether E05 sets one.
7. Wire the revoke button of the E01 invitations screen to `OperatorActionDialog`? It is inert today (rule 12: not changed without approval). Recommendation: yes.
8. The overview page `Screens and state maps` is an addition to the target structure (each epic page already has its map). Keep or fold into "Start here" in stage 4?

## Known gaps in batch D

- Not built, for "What is missing": viewing a session in dispute and recording its outcome (R16, D29); the operator sign-in page and the "session older than 12 hours" state (D25); audit log filters and paging; a mentor's cancellation reasons and counts (D34); the mentor list that leads to a mentor's page; the two-week clock per mentor on the gate.
- Not checked: screen reader output; a real operator session with the 12-hour rule; real data volumes.

## Stage 3 summary

All four batches are built. Product components are listed on each epic page. Patterns: Form, Deletion confirmation, Filtered list, Detail view, Conversation, Operator action. Screens: 18, with 138 states. Stage 3 is complete once the batch D decisions are in.

## Next step (superseded by the stage 4 next step at the end of this file)

Wait for the batch D decisions and "continue". Then stage 4, pages that teach: Start here, Components catalog, How to choose, Usage and accessibility, Content, What to avoid, What is missing, Contributing, and the agent file `docs/design-system.md` linked from `AGENTS.md`.


## Batch D decisions (approved 2026-10-25, "ok")

Batch D proposals 1–8 approved as recommended: gate status in words with a badge and no progress bar, operator action dialog (names the object, states the consequence, required reason, "Keep as it is" first), metrics layout with "No data yet" (definitions to be set by the Tech Lead when E05 is specified), four-column audit log, suspend page, the overview page `Screens and state maps` (a short version goes into "Start here" in stage 4). Two decisions were applied:

- A reason has at most 1000 characters (same limit as D32, a proposal without its own source), with a visible count: `REASON_MAX` in `OperatorActionDialog`, unit test, pattern rule 10.
- The revoke button of the E01 invitations screen now opens `OperatorActionDialog`; the row is marked revoked only after the server confirmed. Two new stories (Revoke: reason required, Revoked after the server confirmed). E01 has 28 screen states now (26 before), 140 in total.

Verified after the change: lint, typecheck, 380 unit tests (100%), `test:stories` and `test:stories:dark` 443 of 443, Storybook build, all 420 MDX story links resolve, the invitations screens and 3 docs pages at 320/768/1440 px in both themes (72 loads, no problems), `check:tokens` unchanged (9 findings in untouched files). Stage 3 is complete. Stage 4 starts on "continue".

## Stage 4 result (pages that teach)

- Eight new pages under **Design system**, in the order of the target structure (menu order set in `.storybook/preview.tsx`): **Start here** (product in three sentences, character and anti-character, the five steps, the table of all 56 components, commands), **Components** (54 working previews with group, one-sentence description, import and documentation link), **How to choose** (eight "if then use" groups with product examples and a source for every row), **Usage and accessibility** (keyboard and focus, forms and messages, color, motion, content, widths, product rules the UI enforces; every rule cites a source), **Content** (three things the product says and three it does not, buttons, errors, empty states, statuses, formats), **What to avoid** (the product's anti-patterns, generic AI appearance, implementation mistakes; how to recognise each in code), **What is missing** (readiness and backlog coverage for every backlog item, parts the system lacks, what was not checked), **Contributing** (when to add a component, what it needs, after a token change, who approves, commands).
- Agent file `docs/design-system.md` (new, linked from `AGENTS.md` in the `packages/ui` section): hard rules, product character, component table with imports, patterns, semantic tokens and their utilities, "if then use", what to avoid, commands, where things live.
- The table in Start here, the Components page and the agent file were generated from one data set, so they list the same 54 components plus the two shared parts (`FormFeedback`, `useForm`).
- Session header stories now default to `headingLevel: 2` (the component default stays 1) so a documentation page keeps one `h1`.
- Numbers: 8 new documentation pages (52 documentation entries in total), 443 stories (unchanged), 380 unit tests (100%).
- Verified: lint, typecheck, app build, Storybook build, `test:stories` and `test:stories:dark` 443 of 443, `check:contrast` 22 of 22, `check:tokens` 9 findings (the same untouched files), all 556 story links in the MDX pages resolve. Browser (headless Chromium): the 8 new pages at 320/768/1440 px in both themes (48 loads): no console errors, correct theme class, one `h1`, tables render as tables, 54 working previews on the Components page.
- Found and fixed: MDX read `{ Button }` outside a code span as an expression and the whole page failed to render; the import lists are now inside code spans. `check:tokens` scans MDX, so the "what to avoid" examples describe palette classes and arbitrary values in words instead of quoting them.

## Proposals waiting for a decision (stage 4)

1. Priority column in "What is missing" (P1 blocks the first paid session, P2 needed in the pilot, P3 can wait). Your materials give no priorities; every value is my proposal.
2. Approvers in Contributing: the Product owner for tokens, shape, density, states and variants and for any change to an existing theme or token; the Product owner and the Tech Lead for a new component. Only the Product owner's role is sourced; the Tech Lead's part is a proposal.
3. "Pills everywhere", "three identical icon cards" and "everything centered" in What to avoid have no reference source of their own (they come from your prompt's list and stage 2 and 3 decisions). They are marked as proposals.
4. Wording of the three product sentences in Start here, and the eight "if then use" groups, are my synthesis of the references and the component pages. Please read them.
5. The agent file lives at `docs/design-system.md` and `AGENTS.md` got one bullet linking it (`AGENTS.md` is the shared guide; this is the one edit outside `packages/ui` besides the new file).
6. `check:tokens` scans `stories/**/*.mdx`, so documentation pages cannot quote bad examples literally. Keep as is (the check stays strict), or exclude the "what to avoid" page? Recommendation: keep.

## Known gaps in stage 4

- Not checked: the pages read by someone who did not follow the build (the agent test is stage 5); screen reader output; code blocks in the docs stay light in the dark theme (Storybook's syntax highlighter).
- No automated check keeps the component table, the Components page and the agent file in step with the code. They share one generator only while it exists; Contributing says to update all three by hand.
- Previews in the Components page are each component's Playground story with its default data.

## Next step

Wait for the stage 4 decisions and "continue". Then stage 5: build Storybook and run typecheck and lint, run the token script and list every non-token value with file and line, check accessibility of all stories, check 320, 768 and 1440 px in both themes with keyboard and overlays, choose one new backlog screen for the agent test and record its description here (the test itself is run by you in a new session), and count pages, components, stories and interaction tests.


## Stage 4 decisions (approved 2026-10-25, "ok")

Stage 4 proposals 1–6 approved as recommended: the priority column in "What is missing" (P1/P2/P3, proposals), approvers in Contributing (Product owner for tokens, shape, density, states and variants; Product owner and Tech Lead for a new component), the three "what to avoid" items without a reference source kept as marked proposals (pills everywhere, three identical icon cards, everything centered), the product sentences in Start here and the eight "how to choose" groups, the one-line `AGENTS.md` link to `docs/design-system.md`, and `check:tokens` kept strict over MDX. Stage 5 starts on "continue".

## Agent test: screen chosen (stage 5)

The test is not run in this session, because this conversation holds answers that are not in the files. Run it in a new session with a separate prompt. The agent reads `docs/design-system.md` and the Storybook, and builds the screen below as a story in `packages/ui/stories/`, using only the design system. Then document every point where the agent guessed, or add it to "What is missing".

**Screen: Sign-in (`/sign-in`)** — E01-T01 platform primitives, needed before booking (D10). It is not in Storybook. Source for the agent: `.ai/specs/2026-10-24-platform-primitives.md`, section UI/UX ("Sign-in") and the edge cases for sign-in. Product language: English.

The agent must not read `packages/ui/POSTEP.md` or `.ai/runs/` (they contain the answers and this comparison list). It may read `docs/design-system.md`, the Storybook, the sign-in spec above and the repository code.

Description to give the agent:

- A public page where a visitor signs in with GitHub or with an e-mail address (a magic link is sent).
- A GitHub button and an e-mail field with a button that sends the link. A link to the privacy notice (`/privacy`) is on the page.
- After the link is sent, the page shows a "check your e-mail" state. It looks the same for an address nobody has used.
- The page can show an error carried in the address (`?error=`): GitHub unreachable or consent denied, or a GitHub account with no verified primary e-mail. In both cases the e-mail option stays available.
- Sending the e-mail can fail: the visitor is told it could not be sent and can try again.
- Deliver: a fullscreen screen story with a state map (one story per state), covering the states a screen with an action needs (loading, empty or first view, error, pending, server error, offline, success after the server confirmed, long text, narrow screen), stories that pass the accessibility checks in both themes, and a list of every decision the agent made without a source.

What to compare afterwards (do not give this to the agent): whether the agent picked the Form pattern with `Field` and `useForm`, `FormFeedback` or `Alert` for the errors and not a toast, a visible label on the e-mail field, "check your e-mail" as text rather than an animation, a verb-and-object button ("Send sign-in link"), no emoji or gradient, only semantic tokens (`npm run check:tokens` clean), and the same wording rules as the Content page. Points where the documentation had no answer (for example the GitHub button's look, since the system has no icon-and-text button rule, or how a magic-link confirmation page differs) are the findings.

## Stage 5 result (verification)

Checked on the final build (`storybook-static`), 2026-10-25.

| Check | Result |
| --- | --- |
| `npm run lint`, `npm run typecheck` | No errors |
| `npm run test` | 380 tests, 100% statements, branches, functions, lines |
| `build-storybook` | Passes |
| `test:stories`, `test:stories:dark` | 443 of 443 each, a11y as error |
| `check:contrast` | 22 of 22 |
| `check:tokens` | 9 findings, all in files this work did not touch: `packages/ui/src/frontend/hero.tsx` lines 17, 17, 19, 20; `packages/app/src/app/(frontend)/page.tsx` lines 7, 7, 15, 15, 15 |
| 320, 768, 1440 px, both themes, all 443 stories (2,658 loads) | No overflow and no console errors, except the expected avatar fallback story (`ERR_UNSAFE_PORT`, by design) |
| Keyboard and focus, 140 screen states, both themes, 1440 px | About 909 focus stops, each with a visible indicator; no trap |
| Overlays (dialog, confirmation, menu, popover), both themes | Open, take the theme, close on Escape, focus returns to the trigger |

Defects found and fixed in this stage: status badge long content and tooltip long content overflowed at 320 px (`badge.tsx`, `tooltip.tsx`, with the Badge test updated); three textarea stories overflowed because of the centered story layout (story `layout: "padded"`). All were rechecked at 320/768/1440 in both themes.

Counts (measured): 52 documentation entries (Design system 14, Foundations 7, Primitives 25, Patterns 6); 54 components (25 base, 29 product) plus `FormFeedback` and `useForm`; 443 stories, of which 140 are screen states; 105 interaction stories (measured at runtime; Storybook's `play-fn` tag shows 69 because it misses stories built by a factory); 65 unit test files.

Not checked: screen reader output, real mobile browsers or touch, a real operator session, a cold read of the pages by a person who did not write them, the clock-driven phase change in the session header, the agent test (prepared above, not run).

Open for your decision:
1. `AGENTS.md` says public pages use custom Tailwind components and not shadcn, unless a spec says so. The design system uses one primitive set for public and admin screens. Decide whether to amend `AGENTS.md` or keep two sets.
2. The 9 `check:tokens` findings in `hero.tsx` and the app home page: migrate to tokens, or leave. I did not change them (rule 12).
