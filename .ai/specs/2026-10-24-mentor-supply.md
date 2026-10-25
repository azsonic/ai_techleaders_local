---
title: Mentor supply (E01): invitations, profile and availability
status: draft
created: 2026-10-24
updated: 2026-10-24
owner: Product owner
---

# Mentor supply (E01): invitations, profile and availability

Tracking issue: #8 (E01 — Mentor supply; stories #14, #15). Depends on `2026-10-24-platform-primitives.md` (all three phases complete; build order is in that spec). Platform tracking issue: E01-T01. Product authority: `.ai/specs/product-brief.md`. Backlog: `.ai/specs/backlog.md`.

## 📝 TLDR

Mentors cannot yet register, describe themselves or publish availability. This spec (future behavior) delivers E01 on the primitives from the platform spec: an operator invites a mentor, the invited mentor signs in and sets up a profile, chooses to be listed in the directory or link-only, and publishes dated availability windows inside 10:00–22:00 Europe/Warsaw.

## 📝 Problem Statement

Supply is the riskiest assumption in the brief (A02): all 50 mentor prospects are uncontacted, and the staff engineer interviewed would publish only after seeing who else is on. The pilot cannot start without mentors who can register and publish bookable time (D12, D16). E05-S01 reads its invited, accepted and published counts from the data this spec creates. "Published" is defined in D24.

## 📝 Proposed Solution

Registration is by invitation only (D23): the operator creates single-use, expiring invitation links, and a mentor profile exists only after an invitation is accepted. Revoking an invitation sets `revokedAt` and keeps the row, so the supply-gate counts still include it. Mentors publish dated windows inside the pilot hours band (D24). Slots are derived at booking time on a 25-minute grid; leftover minutes at the end of a window are dropped, and a 50-minute option exists only when two consecutive steps fit. Weekly rules and hours outside 10:00–22:00 Europe/Warsaw come after the first mentor batch (D17, narrowed by D24). A mentor is a user with a profile, not a separate account type.

Alternatives considered: open sign-up (rejected: the gate needs invited and accepted counts); deleting revoked invitations (rejected: the gate must still count them); pre-cut slots (rejected: the mentor must cut each slot by hand and 25/50-minute lengths would need two sets); weekly recurring rules now (rejected: more model and UI for a pilot whose hours are provisional); a database exclusion constraint in this spec (rejected: a service-level overlap check is enough until bookings exist).

## 📝 Verified in the installed packages

See the platform spec for the MikroORM 7.2.5, Zod 4.6.7 and Next 16.4.2 checks. Relevant here: `text[]` is used for stacks, not an enum array; datetime columns set `columnType('timestamptz')`. Overlap is enforced in `AvailabilityService`, not by a GiST exclusion constraint.

## 📝 Architecture

```
packages/core/src/
  validators/{mentors,invitations,availability}/*.schema.ts
  mentors/pricing.ts          R05 bounds and PLN display
  availability/windows.ts     Warsaw hours, 25-minute grid, two-hour lead (R08, D24)
packages/db/src/
  entities/{invitations,mentors,availability}/…   Invitation, MentorProfile, AvailabilityWindow
  repositories/…
packages/app/src/
  modules/invitations/invitation.service.ts   create, list, revoke, accept
  modules/mentors/mentor-profile.service.ts
  modules/availability/availability.service.ts   add, list, remove, listBookableSlots
  modules/auth/principal roles   adds the `mentor` role (profile exists)
  app/api/{invitations,mentors}/…   thin routes; pages under (frontend)/(mentor)/, (frontend)/join, (frontend)/mentors/[slug], (backend)/admin/invitations
packages/ui/src/
  frontend/mentors/       MentorCard, StackBadge, ShareLink
  frontend/availability/  WindowForm, WindowList, SlotPreview
  components/ui/          table, input, label (shadcn, added for the admin page only)
```

`listBookableSlots({ mentorProfileId, durationMinutes, now })` does not call `SlotReservationReader`. E02-S03 adds that reader when bookings exist, and then subtracts reserved intervals and refuses removal of a window that overlaps a booking. E01 does not claim those rules.

## 📝 Data Model

| Entity | Fields | Notes |
|---|---|---|
| `Invitation` | id, tokenHash (unique), email (optional), createdByUserId, expiresAt, acceptedAt, acceptedByUserId, revokedAt | Single use, 14 days; token shown once at creation. Revoke sets `revokedAt`. The row is never deleted. |
| `MentorProfile` | id, userId (unique), slug (unique), experience (text, ≤ 1000), stacks (`text[]`, values `typescript`, `react`, `python`, `ai-agents` per D07, validated by Zod), publicLinks (JSON array of `{ label, url }`, ≤ 5, https only), price25Pln, price50Pln (integers, whole zloty, nullable until saved), listed (bool, default false per D06), createdAt, updatedAt | Slug defaults to the GitHub login or a slugified display name with a numeric suffix and never changes. No rating or score column (N02). |
| `AvailabilityWindow` | id, mentorProfileId, startsAt, endsAt, createdAt | Dated windows only. No exclusion constraint in this spec. |

Price bounds are constants in `core`, not database constraints, because the Product owner can change them.

A mentor counts as **published** for D16 when all of these are true: both prices are saved, `stacks` has at least one value, and `listBookableSlots` for 25 minutes returns at least one slot. That check is computed, not stored. E05-S01 uses this definition.

## 📝 API Contracts

JSON routes use the `ApiResult<T>` envelope; state-changing routes require the CSRF header and Origin check from the platform spec.

| Route | Who | Request → response |
|---|---|---|
| `POST /api/invitations` | operator | `{ email? }` → invitation link once. `Conflict` when `email` belongs to a user who already has a profile. |
| `GET /api/invitations` | operator | list with status: pending, accepted, revoked, expired |
| `POST /api/invitations/{id}/revoke` | operator | sets `revokedAt`; no row is removed |
| `POST /api/invitations/accept` | session | `{ token }`. See accept outcomes below. |
| `GET`, `PUT /api/mentors/profile` | mentor | own profile; `PUT` validates stacks, links and prices within R05 bounds. `listed: true` is rejected until both prices are saved and `stacks` is non-empty. Returns the share path `/mentors/{slug}`. |
| `GET`, `POST /api/mentors/availability`; `DELETE /api/mentors/availability/{id}` | mentor | `{ startsAt, endsAt }`: one Europe/Warsaw calendar day, inside 10:00–22:00, at least 25 minutes, ending in the future, not overlapping another of this mentor's windows. Delete removes the window. Booking overlap is not checked here. |

Accept outcomes:

- Valid unused invite, no profile yet → creates the `MentorProfile` (unlisted, no prices yet) and returns it.
- Signed-in user already has a profile → does not create another profile, does not set `acceptedAt`, and tells the client they are already registered so the join page can open their profile.
- Expired, revoked, or already accepted by someone else → `Conflict`.
- Invite email is set and the account's verified email differs → `Forbidden`.
- Invite email is set and the account has no verified email (GitHub without one) → `Forbidden`, telling them to sign in with the magic link for that address.
- Invite email is empty → any signed-in user may accept it, once.

The invitations collection (`GET` list, `POST` create) and availability use `makeCrudRoute` from the platform spec (its second consumer is the invitations collection); revoke, accept and the profile use `apiHandler` directly, because they are not plain CRUD.

## 📝 UI/UX

Mentor pages are public-world pages for a signed-in persona, so they use custom Tailwind components; only the operator page uses shadcn (AGENTS.md).

- **Join** (`/join/[token]`): shows what the invitation is for, with a link to the privacy notice (`/privacy`, a placeholder until the legal owner under Q11 supplies the text); signed out, it sends the visitor to sign-in and returns. A successful accept opens the profile form. An already-registered user sees that message and a link to their profile.
- **Profile** (`/mentor/profile`): experience, stacks, public-work links and both prices with the bounds shown beside them; a visibility switch (listed or link-only) that stays off until both prices and at least one stack are saved; the share link with a copy action; field errors from the envelope.
- **Availability** (`/mentor/availability`): date, start and end time in Europe/Warsaw with the 10:00–22:00 limit stated; upcoming windows with remove; a preview of the bookable slots a mentee would see.
- **Public profile** (`/mentors/[slug]`): a read-only card with the mentor's display name, stacks and a line that sessions are text only (N01). Prices and slots are added when booking is built (E02-S01). The share link is copied from the mentor's own profile page.
- **Operator invitations** (`/admin/invitations`): create (e-mail optional and empty by default, so the invitation is a bearer link unless the operator binds it), list with status, revoke; the link is shown once. Creating an invite for an email that already has a profile shows the conflict.

## 📝 Edge Cases & Failure Scenarios

- **Invitation expired, revoked, or bound to another verified e-mail:** accept fails with a specific `AppError`.
- **GitHub account with no verified e-mail, invite bound to an e-mail:** accept is forbidden until they sign in with the magic link for that address.
- **User who already has a profile:** accept does not consume the invite; the join page sends them to their profile and says they are already registered. The operator cannot create an email-bound invite for that person.
- **Two sessions editing one profile:** last write wins (no version column in the pilot); a known limitation.
- **Account deletion:** the pilot has no self-service deletion; the operator deletes a mentor's profile and account manually on request. Known limitation (D27).
- **Overlapping or out-of-hours windows:** rejected with field errors by the service. A concurrent double submit is checked again before insert and returns `Conflict`.
- **Daylight-saving:** a window lies on one Europe/Warsaw calendar day inside 10:00–22:00 local time, so the night-time clock change cannot fall inside it. Hours are validated in local time and duration in absolute time.
- **Windows in the past or starting within two hours:** past windows and windows that end in the past are rejected. A window that starts within two hours is accepted, and `listBookableSlots` returns no slot that starts less than two hours ahead (R08). The preview shows that.
- **Grid remainder:** minutes after the last full 25-minute step are dropped. A 50-minute call is offered only when two consecutive steps fit in the window.
- **Deleting a window:** allowed in E01. Refusal when a booking overlaps is E02-S03, not this spec.
- **Listed without prices or stacks:** `PUT` rejects `listed: true`.
- **Unlisted mentor:** the share link works; any directory query (E02-S01) must filter `listed = true`.

## 📝 Risks & Impact Review

- **Hard to reverse:** the `MentorProfile` table and the slug as a public URL. Invitation rows are kept after revoke.
- **Unverified:** the slug scheme when a GitHub login is already taken. Slugs live under `/mentors/{slug}`; the generator reserves `api`, `admin`, `join`, `book`, `bookings`, `profile`, `availability` and `notifications` so no slug shadows an application path.
- **Product direction call:** invite-only registration is D23. Pilot hours, the published-mentor definition, listing requirements and invite accept/revoke behavior are D24, applied to this spec on 2026-10-24.
- **Cost:** the Tech Lead's estimate (Q08) may force a first cut that defers Phase 2; any paid thin slice needs a superseding scope row (D14). The public profile page in this spec is only the card above.

## 📝 Decisions in play

Relies on: D05 (links and directory), D06 (opt-in, unlisted by default, no ratings), D07 (stacks), D08 and R05 (price bounds), D12 and D16 (gate data), R08 (two-hour floor), D23 (invitation-only registration), D24 (pilot hours band, published definition, listing, invite accept and revoke), N01, N02, A02.

## 📋 Phasing

1. **Invitations and profile:** entities, services, pages and routes for invitations, joining and the profile, including the public profile card.
2. **Availability:** window entity, rules in `core`, the service, the schedule page and the slot preview.
3. **Hardening and end-to-end:** ownership and security tests, the integration scenario, the run log.

## 📋 Implementation Plan

### Phase 1 — Invitations and profile

1. Zod schemas for invitation and profile; `mentors/pricing.ts` (bounds and PLN formatting) with tests at each bound and one unit outside it.
2. Entities `Invitation` and `MentorProfile` (`columnType('timestamptz')`, `text[]` stacks, `p.json` links), registered; migration; repositories; slug generation with collision handling; tests.
3. `InvitationService` (create, list, revoke, accept) and `MentorProfileService`; the `mentor` role added to principal resolution; register in `container.ts` and the `Cradle` type; ownership tests. Accept and create follow the outcomes in API Contracts.
4. Routes: `/api/invitations` list and create via `makeCrudRoute` (collection handlers only), revoke and accept via `apiHandler`, and `/api/mentors/profile` via `apiHandler`.
5. Pages `/admin/invitations` (add shadcn `table`, `input`, `label` from `packages/app`), `/join/[token]`, `/mentor/profile`, `/mentors/[slug]`; `MentorCard`, `StackBadge`, `ShareLink` with tests. The public card shows display name, stacks and the text-only line.
   Verify: lint, typecheck, test, build; integration scenario: operator creates an invitation, an invited user signs in by seeded magic link, accepts, saves a profile with both prices and one stack, the visibility switch can then turn on, and the unlisted profile is reachable by its link.

### Phase 2 — Availability

1. Entity `AvailabilityWindow` (`columnType('timestamptz')`), registered; migration; repository.
2. `availability/windows.ts` and the window schema: Warsaw 10:00–22:00, one calendar day, 25-minute grid with leftover minutes dropped, 50-minute option only when two steps fit, two-hour lead. Tests for the band edges, the grid remainder, the 50-minute fit and the two-hour lead.
3. `AvailabilityService` (add, list, remove, `listBookableSlots`) with an overlap check before insert; tests for the floor, grid, edges and overlaps. No `SlotReservationReader`.
4. Routes via `makeCrudRoute`; `WindowForm`, `WindowList`, `SlotPreview`; the `/mentor/availability` page.
   Verify: lint, typecheck, test, build; the integration scenario extends with publishing a window and rejecting an out-of-hours and an overlapping one. A mentor who meets the D24 published check is distinguishable from one who only saved a profile.

### Phase 3 — Hardening and end-to-end

1. Security tests: ownership on every mentor route (a second mentor is denied), invitation reuse, expiry, revoke, wrong-email and missing-verified-email, operator-only routes, no token in clear in the database, `listed: true` rejected without prices and a stack.
2. Confirm `npm run test` stays at 100% and `npm run test:integration` passes; record the run in `.ai/runs/` and any lesson in `.ai/lessons.md`.
3. Set the spec status to `implemented` and move it to `implemented/` when every criterion below is met.

## ✅ Acceptance criteria

- [ ] An operator can create and list invitations and revoke one without deleting the row. Create is refused when the email already has a mentor profile. A mentor can register only with a valid, unused, unexpired invitation.
- [ ] Accepting while already registered does not create a second profile and does not mark the invitation accepted; the mentor is told they are already registered.
- [ ] An email-bound invitation is accepted only by the account whose verified email matches. A GitHub account with no verified email is told to use the magic link.
- [ ] A mentor can save a profile with stacks, public-work links and prices within R05 bounds; prices outside them are rejected with the bound shown.
- [ ] A new profile is unlisted. Listing turns on only after both prices and at least one stack are saved. The share link resolves for listed and unlisted mentors.
- [ ] The public profile shows the display name, stacks and the text-only notice.
- [ ] A mentor can publish and remove dated windows inside 10:00–22:00 Europe/Warsaw; out-of-hours, past and overlapping windows are rejected.
- [ ] `listBookableSlots` returns no slot starting less than two hours ahead, uses a 25-minute grid, drops leftover minutes, and offers 50 minutes only when two steps fit. The availability page shows the preview.
- [ ] A mentor counts as published only when both prices, at least one stack and at least one bookable 25-minute slot are present.
- [ ] Every mentor route denies another mentor's data; every operator route denies non-operators.
- [ ] Removing a window that overlaps a booking is verified in E02-S03 (not claimed here).
- [ ] `npm run lint`, `typecheck`, `test` (100% coverage), `build` and `test:integration` pass.

## ⚠️ Open questions (non-blocking)

- **Slug source:** default is the GitHub login (a mentor who signed in by e-mail gets a slugified display name). Confirm that profiles may be reached by that public slug.
