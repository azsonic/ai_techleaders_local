---
title: Find and book (E02): discovery, booking and my bookings
status: approved
created: 2026-10-24
updated: 2026-10-24
owner: Product owner
---

# Find and book (E02): discovery, booking and my bookings

Tracking issue: #9 (E02 — Find and book; stories #16, #17, #18, #28, and E02-S05 [#30]). Depends on `2026-10-24-platform-primitives.md` and `2026-10-24-mentor-supply.md` (E01) being implemented. Product authority: `.ai/specs/product-brief.md`. Backlog: `.ai/specs/backlog.md`. Architecture authority: `AGENTS.md` and the code in `packages/*`.

## 📝 TLDR

After E01, mentors can publish profiles and availability, but a mentee cannot find a mentor, see a price or a slot, or book. This spec (future behavior) delivers E02: a mentee opens a mentor by share link or in a directory, sees both prices and the nearest slot, picks a length and a slot at least two hours ahead, signs in, sends a question and gets a confirmed booking with notifications; then the mentee sees and cancels their bookings, and the mentor sees booked sessions and can cancel one. It introduces the booking aggregate, slot reservation, the booking state machine, the domain event emitter and notifications that E03 (payments), E04 (session) and E05 (gate, operator) build on.

## 📝 Problem Statement

Developers with a concrete blocker and no timely internal help are the observed users (working-developer and backend-developer interviews; Discord export: 23 of 109 threads unanswered, median first human reply 67 minutes). The pilot cannot test whether they book a paid text session until booking exists. Decided: the two-hour floor (D20, R08), both prices before the length is chosen (R05), auto-confirm with the question (D09, R04), mentee cancellation (D22, R09), notifications (D21, R10), mentee accounts (D28, R12). Backlog stories: #16, #17, #18, #28, plus E02-S05.

## 📝 What this spec reuses and what it creates

Reuses (platform and E01 specs): `AuthService` and `requireSession`, `Principal` and guards, `validateInput`, `Clock`, `MailPort`, the form kit, `AvailabilityService.listBookableSlots`, `MentorProfile` and `AvailabilityWindow`, `MentorCard`. (Directory and bookings use dedicated routes/services, not `makeCrudRoute`.)

Creates, and is the first consumer of: the `Booking` entity and state machine, `SlotReservationReader` and `Writer`, the event emitter, in-product notices plus an e-mail channel on events, and the seams for `PaymentGateway` and `LaunchGate`. Contracts for these were reserved in the platform spec.

## 📝 Resolved gate answers

Q1 the payment seam is a `BookingPayment` step behind the `PaymentGateway` contract, and booking stays closed in production behind `LaunchGate` until E03 ships; Q2 a new story E02-S05 gives the mentor a booked-sessions view and a cancel action (Product owner approved filing); Q3 times are shown in the viewer's browser time zone with the zone name, stored in UTC, with Europe/Warsaw where the pilot hours are stated; Q4 the mentee's question is plain text up to 2,000 characters with line breaks kept and no attachments; Q5 one spec in three build phases plus hardening.

**Review decisions applied (2026-10-24):** directory and “nearest slot” always use `listBookableSlots` (including reserved intervals once bookings exist); no payment test-double or gate override in composition (D13/R07) — E02 integration proves `booking_closed`, full book+pay E2E waits for E03 Stripe test mode; Phase 2 guards double-booking with the mentor-row lock and an overlap check, GiST exclusion deferred to Phase 4 hardening; cancel dialogs state refund *outcome / due*, not that money already moved; `BookingPayment` stays an app-level adapter only.

## 📝 Proposed Solution

A booking is a row that holds an exclusive interval on one mentor's calendar. Booking is three short transactions around one external call: reserve the slot (`pending`), charge outside any transaction, then confirm. Phase 2’s final guard against double booking is the `MentorProfile` row lock plus an overlap check before insert (same lock the window-removal path takes). A GiST exclusion constraint is optional hardening in Phase 4 once a short spike confirms MikroORM migrations stay clean. The booking row is also the record of money still owed: a cancellation writes its refund outcome on the row, and E03-S02 processes the rows marked due, so a missed event cannot lose a refund. In-product notices are written in the same confirm/cancel transaction as the booking change; after commit, an event drives e-mail only. E03 and E04 add subscribers and do not edit the booking service.

Alternatives considered:

- **Merge E02 and E03 into one spec:** rejected (gate Q1): the payment integration is the riskiest part and has its own legal prerequisite (Q11).
- **Unpaid bookings until E03:** rejected: R04 and D13 say no paid launch on mock payments, and an unpaid state would need removing later.
- **Integration payment double / gate override to book before E03:** rejected (D13, R07): mocks stay in unit tests only; E02’s integration scenario is `booking_closed`; end-to-end book+pay lands with E03 Stripe test mode.
- **GiST exclusion as the Phase 2 gate:** deferred: lock + overlap is enough for the pilot path; GiST is Phase 4 if the spike is cheap.
- **A message queue or job runner for e-mail:** rejected: AGENTS.md says no queue or worker; e-mail is sent after the transaction commits and failures are recorded.
- **In-product notices via event subscribers only:** rejected: writing the notice row in the booking transaction keeps the in-product record even when e-mail fails.

## 📝 Architecture

```
packages/core/src/
  bookings/booking-policy.ts      cancellationOutcome(booking, actor, now) → { status, refund: 'full' | 'none', payMentor }; mentee: full refund inside the 15-minute grace after booking (D33, R15) or at least two hours before the start, otherwise none; mentor: full refund
  bookings/booking-state.ts       states and legal transitions (pure)
  bookings/booking-hold.ts        hold length constant (10 minutes)
  events/                         typed in-process emitter: emit/on, event map {'bookings.booking.confirmed', 'bookings.booking.cancelled'}
  ports/payments/                 PaymentGateway contract only (platform spec); not built here
  ports/launch/launch-gate.port.ts    LaunchGate.isPaidBookingOpen()
  ports/notifications/notification-channel.port.ts   NotificationChannel.deliver(userId, notice) — e-mail channel only in E02
  validators/bookings/*.schema.ts, validators/mentors/directory-query.schema.ts
packages/db/src/
  entities/bookings/booking.entity.ts, entities/notifications/notification.entity.ts
  repositories/bookings/booking.repository.ts       reserve, confirm, cancel, expire, listForMentee/Mentor, reservedIntervals, overlapsActive
  repositories/mentors/mentor-directory.repository.ts   candidates({ stack }): listed, both prices saved, at least one stack, not suspended
packages/app/src/
  modules/bookings/booking.service.ts            create (reserve → charge → confirm), get, listMine, cancel; writes in-product notice rows in its own transactions
  modules/bookings/booking-payment.ts            BookingPayment interface (application-level adapter, not a core port): charge(booking) → success | failure; adapts to PaymentGateway.charge; E03-S01 implements it
  modules/bookings/slot-reservation.ts           SlotReservationReader/Writer over the repository
  modules/mentors/directory.service.ts           discoverable rule = candidates + at least one bookable slot from AvailabilityService.listBookableSlots; nearest slot from that same call (never from raw windows alone)
  modules/notifications/{notification.service,email-channel}.ts   notice rows written by BookingService; e-mail channel subscribes to events after commit
  app/api/{bookings,notifications}/…, app/api/mentors/…/slots, pages below
packages/ui/src/
  frontend/mentors/       DirectoryList, StackFilter (extends MentorCard with price range and nearest slot)
  frontend/bookings/      SlotPicker, BookingSummary, BookingCard, CancelDialog (shows R09 outcome / due, not “already refunded”), LocalTime
  frontend/notifications/ NotificationBadge, NotificationList
```

`AvailabilityService.listBookableSlots` (E01) gains the real `SlotReservationReader`: it subtracts reserved intervals, and `remove window` refuses a window that overlaps an active booking. That satisfies E01-S02's two criteria deferred to E02. Directory, mentor page “nearest slot”, and the slots API all go through this method so a taken interval cannot appear free.

## 📝 Data Model

UUID ids, `timestamptz` columns set explicitly, `defineEntity`, registered in `entities/index.ts`.

| Entity | Fields | Notes |
|---|---|---|
| `Booking` | id, mentorProfileId, menteeUserId, startsAt, endsAt, durationMinutes (25 \| 50), pricePln (snapshot taken when the hold is created, integer; the charge uses only this value), question (text, ≤ 2000), status, requestKey, requestHash, bookedAt, holdExpiresAt (nullable), cancelledAt, cancelledBy (`mentee` \| `mentor` \| `operator`, nullable; `operator` is written by E05-S03), refundOutcome (`full` \| `none`, nullable), refundStatus (`due` \| `done`, nullable), cancelReason (`out_of_scope` \| `unavailable` \| `other`, nullable; required when `cancelledBy` is `mentor`), cancelNote (text ≤ 500, nullable), createdAt | `status` is text with a check constraint: `pending`, `confirmed`, `expired`, `cancelled_by_mentee`, `cancelled_by_mentor`, `completed`, `no_show_mentee`, `no_show_mentor`. `completed` and the no-show states are set by E03 and E04. Unique (menteeUserId, requestKey) makes a double submit return the same booking; `requestHash` is a SHA-256 of mentor, start, length and question, and reusing a key with different parameters returns `Conflict('request_key_reused')`. A key belongs to one attempt: when its booking ended `expired` (payment failed), the retry uses a new key and the form generates one per attempt. `refundOutcome` and `refundStatus` are written in the cancel transaction (`due` when a refund is owed); E03-S02 processes rows with `refundStatus = 'due'`, which is the retry-safe record that replaces an in-process event for money. `bookedAt` and `startsAt` give the booking-to-start time that D20 records; the grace window is `bookedAt + 15 minutes` (computed, not stored), and the notice a mentor gave is `startsAt − cancelledAt` (computed, D34). |
| `Notification` | id, userId, kind (`booking.confirmed` \| `booking.cancelled`), bookingId, readAt, emailSentAt, emailFailedAt, createdAt | Written by `BookingService` in the confirm or cancel transaction; the e-mail goes after commit through the event, and its failure sets `emailFailedAt` (no retry queue). E-mails carry the mentor, time and a link, never the question, so no question text leaves the database. |
| `MentorProfile` (E01) | adds `suspendedAt` (nullable) | Added by this spec's Phase 2 migration so the directory and `create` can already filter on it; E05-S03 is the only writer. |

**No double booking (Phase 2).** Reserve locks the mentor’s `MentorProfile` row (`for update`), expires that mentor’s stale holds, checks `overlapsActive` for the interval, then inserts `pending`. A concurrent loser gets `ConflictError('slot_taken')`. Holds past `holdExpiresAt` are treated as free by every read (`reservedIntervals`, slot lists).

**Optional hardening (Phase 4).** A GiST exclusion constraint may be added after a spike confirms the partial `exclude … where (status in (…))` form and an empty follow-up `migration:create` diff. Until then there is no GiST dependency.

State machine (pure functions in `core`):

```
pending → confirmed | expired
confirmed → cancelled_by_mentee | cancelled_by_mentor | completed | no_show_mentee | no_show_mentor
```

`expired` and the two cancelled states free the interval. This extends the platform spec's contract table with `pending` and `expired`, and with charge outside the DB transaction. A hold lasts 10 minutes, longer than any gateway timeout.

## 📝 API Contracts

JSON routes use the `ApiResult<T>` envelope; state-changing routes need the CSRF header and Origin check (platform spec). Public routes need no session.

| Route | Who | Request → response |
|---|---|---|
| `GET /api/mentors?stack=` | anyone | discoverable mentors (listed, both prices saved, at least one stack, at least one bookable slot via `listBookableSlots`, not suspended) with display name, stacks, price range and nearest slot from that same call, ordered by soonest slot (D06); `stack` is one of the four D07 stacks |
| `GET /api/mentors/{slug}/slots?duration=25\|50` | anyone | bookable slots for the next 14 days (start ≥ now + 2 hours, 25-minute grid, minus reserved intervals); also works for an unlisted mentor by link (D06) |
| `POST /api/bookings` | mentee | `{ mentorSlug, startsAt, durationMinutes, question, expectedPricePln, requestKey }` → booking. Runs the three booking transactions below: slot on the grid, inside a published window and at least two hours ahead (R08), not the caller's own profile (R12), mentor not suspended and with prices saved, `expectedPricePln` equal to the current price else `Conflict('price_changed')`. `booking_closed` when `LaunchGate` is closed |
| `GET /api/bookings` | mentee | own bookings, upcoming and past, with mentor name, status and the question |
| `GET /api/bookings/{id}` | mentee or mentor of the booking | the booking; anyone else gets `NotFound` (the operator's view is E05-S03) |
| `POST /api/bookings/{id}/cancel` | mentee or mentor of the booking | `{ reason?, note? }`; `reason` is required for a mentor (D34). Applies `cancellationOutcome`: mentee inside the 15-minute grace (R15) → full refund outcome; mentee otherwise ≥ 2 hours before the start → full refund outcome; mentee later → no refund, mentor paid; mentor any time before the start → full refund outcome. Emits `bookings.booking.cancelled` carrying the outcome; E03-S02 performs refunds. After the start, `Conflict` |
| `GET /api/mentors/bookings` | mentor (a reserved path, see slugs below) | own upcoming bookings with the mentee's name and question (E02-S05) |
| `GET /api/notifications`, `POST /api/notifications/read` | session | own notices; mark read |

The booking page does not trust the client's slot list or the slot carried through sign-in in the query string: every rule is re-checked in `BookingService.create` using `Clock.now()`.

**Reserved slugs.** The E01 slug generator reserves `api`, `admin`, `join`, `book`, `bookings`, `profile`, `availability` and `notifications`, so no mentor slug can shadow an application path (applied to the E01 spec's slug rule).

### Booking transactions

1. **Reserve** (one transaction): lock the mentor's `MentorProfile` row (`for update`, the same lock the window-removal path takes), mark that mentor's stale holds `expired`, re-check every rule (slot on the 25-minute grid and inside a published window, start at least two hours after `Clock.now()`, not the caller's own profile, mentor not suspended, prices saved, `expectedPricePln` equals the current price, interval does not overlap an active booking), insert the `pending` row with the price snapshot and `holdExpiresAt = now + 10 min`. A lost race answers `slot_taken`.
2. **Charge** (outside any transaction): `BookingPayment.charge(booking)` with `requestKey` as the idempotency key. In E02 unit tests this is a fake; the production/composition path still requires the gate to be open before create runs, and E03-S01 supplies the real Stripe-backed adapter.
3. **Confirm** (one transaction): `update … set status = 'confirmed' where id = ? and status = 'pending' and holdExpiresAt > now`, then write the two in-product notices. After commit, emit `bookings.booking.confirmed`.

If the charge fails, a short transaction marks the row `expired`. If the charge succeeded but confirm updates no row (the hold expired or was cleaned), the service refunds through the gateway with the same idempotency key and answers `Conflict('hold_expired')`; if that refund also fails, the row keeps `refundStatus = 'due'` and the error is logged for the operator.

### Cancellation transaction

`update … set status = 'cancelled_by_<actor>', cancelledAt, cancelledBy, refundOutcome, refundStatus where id = ? and status = 'confirmed' and startsAt > now`, with the outcome from `cancellationOutcome`, and the notices written in the same transaction. A cancel that updates no row (already cancelled, completed or started) answers `Conflict('booking_not_cancellable')`. After commit, `bookings.booking.cancelled` is emitted for e-mail. A confirmed booking that E04 never closes stays confirmed; cancelling after the start is refused regardless.

### Cancellation notices

The cancelled notice to the mentee includes the mentor's reason (D34); the operator-facing count of mentor cancellations and the notice given is read by E05-S03. Grace cancellations are unlimited (D33); the operator sees repeats in the same records.

### Payment and launch seams

`BookingPayment.charge(booking)` returns success or failure; it is a small application-level interface in the bookings module, not a new port, and E03-S01 implements it on top of the `PaymentGateway` contract (idempotency key = `requestKey`). Which story owns what: E02-S03 owns the reserve, confirm and expire behavior and this interface; E03-S01 owns the real charge and its "failed payment leaves no booking" criterion, which here means the row ends `expired`. `LaunchGate.isPaidBookingOpen()` is asked first; E05-S01 implements it, and until then the production composition provides a closed gate, so `POST /api/bookings` answers `booking_closed`. Unit tests inject an open gate and a payment fake. There is no `PAYMENTS_MODE=test-double` or `BOOKING_GATE_OVERRIDE` in composition (D13, R07). The E02 integration suite asserts `booking_closed` under defaults. End-to-end “mentee books and both are notified” runs when E03 Stripe test mode exists.

## 📝 UI/UX

Public-world pages use custom Tailwind components (AGENTS.md).

- **While booking is closed** (D31): the directory and mentor pages stay public with prices; the slot picker is replaced by one fixed sentence, "Booking opens soon", with no date; sign-in stays open; there is no waitlist. The page reads `LaunchGate` and `POST /api/bookings` still answers `booking_closed`.
- **Directory** (`/mentors`): stack filter (four stacks), a list of mentor cards with display name, stacks, "from 90 PLN" style price range and the nearest **bookable** slot as local time; empty state when no mentor has a bookable slot. No ratings (N02). Public, no sign-in.
- **Mentor page** (`/mentors/[slug]`, extends the E01 card): experience, links, both prices side by side before a length is chosen (R05), the nearest bookable slot, a length choice (25 or 50) and a slot picker grouped by day for 14 days. Text-only notice (N01).
- **Booking page** (`/book/[slug]`): summary of mentor, length, time (local time with zone name, and Europe/Warsaw where the hours limit is stated), price, a question field (≤ 2,000 characters, plain text), and the cancellation rule in one sentence. Signed out, the visitor goes to sign-in and returns to the same selection (`next` plus the slot in the query). The submit button disables while the hold runs; a taken slot or changed price shows a clear message and the refreshed choices.
- **My bookings** (`/bookings`): upcoming and past with status and the question sent; a booking opens `/bookings/[id]` with the session link once E04 lands and a cancel action. A booking made less than 15 minutes ago shows that the cancellation is free (R15). Until E03-S02 ships, the cancel dialog states the R09 **outcome** as “full refund due when payments process”, “no refund — mentor is paid when payments process”, or equivalent — never “you have been refunded”.
- **Mentor bookings** (`/mentor/bookings`, and booked slots on the availability page): upcoming sessions with the mentee's name and question and a cancel action with a required reason (out of scope, unavailable, other with an optional note) whose dialog says the mentee gets a **full refund due when payments process** (until E03-S02) and that the reason is shown to the mentee and the operator.
- **Notifications:** an unread count in the header and `/notifications`; e-mail uses Europe/Warsaw with the zone label, since the recipient's zone is unknown there.

Time display: server code passes UTC ISO strings; the `LocalTime` client component formats them with `Intl.DateTimeFormat` in the browser's zone and renders the UTC value until mounted, to avoid a hydration mismatch. Accessibility: every control labeled, keyboard-only booking, errors tied to fields, focus to the first error.

## 📝 Edge Cases & Failure Scenarios

- **Slot taken at the same moment:** overlap check or lost lock race → `Conflict('slot_taken')`, the page refreshes the slots. (After Phase 4 GiST, `23P01` maps the same way.)
- **Slot falls under two hours while the mentee is on the page:** re-checked at `POST`; refused with the refreshed list. The boundary is inclusive: exactly two hours ahead is bookable.
- **Price changed after the page loaded:** `price_changed` with the new price; the booking stores the price at the hold and the charge uses only that value.
- **Double submit or retry:** the same `requestKey` returns the same booking.
- **Payment step fails:** the hold is released (`expired`), no booking exists for the mentee, and a clear error shows (E03-S01 criterion; exercised in unit tests in E02, integration in E03).
- **Process dies after the hold:** reads ignore the hold after 10 minutes and the next reserve marks it `expired`.
- **Charge succeeds, confirm finds the hold gone:** refund with the same idempotency key, `Conflict('hold_expired')`; a failed refund leaves `refundStatus = 'due'` and a logged error.
- **Cancel races a second cancel or the session start:** the conditional update changes one row at most; the loser gets `booking_not_cancellable`.
- **Window removal races a reservation:** both take the `MentorProfile` row lock, so the removal re-reads bookings after any reservation commits.
- **Mentor profile unlisted, suspended or prices cleared after the page loaded:** `create` re-checks; a share link keeps working for an unlisted mentor (D06), a suspended mentor cannot be booked (E05-S03).
- **Mentor deletes a window with a booking:** refused (the reader reports the overlap); the mentor must cancel the booking first.
- **Mentor books their own slot:** refused (R12). A user who is both mentor and mentee sees their own profile as unbookable.
- **Cancel exactly two hours before:** full-refund outcome (the rule says "at least two hours"). **Cancel at 14 or 16 minutes after booking:** the first is free under the grace (R15), the second follows the two-hour rule. Cancelling after the start is refused here; completion and no-show are E03 and E04.
- **E-mail fails:** the in-product notice already exists; `emailFailedAt` is set and logged; the booking is unaffected.
- **Directory with nobody bookable:** an empty state with a note; unlisted mentors are never listed, and mentors without a bookable slot are hidden until they publish one.
- **Directory after a booking fills the nearest slot:** nearest slot and discoverability recompute from `listBookableSlots` (with reservations), so a fully booked mentor drops out of the directory until a free slot exists.
- **Daylight-saving days:** slots come from UTC instants and the 25-minute grid; local display is the browser's, tested on both change days.

## 📝 Risks & Impact Review

- **Money seam:** a wrong seam would force rework in E03. Mitigation: the `BookingPayment` contract and the `requestKey` idempotency are fixed here and reviewed against E03-S01 and E03-S02 before Phase 2.
- **Hard to reverse:** the `Booking` table and its statuses. Migrations are forward-only. GiST, if added in Phase 4, is also forward-only.
- **Unverified:** Phase 4 GiST spike (partial exclusion + empty `migration:create` diff); deferred so it does not block booking. Event placement is decided: notices in the booking transaction, e-mail after commit.
- **Public data:** the directory publishes the profile fields of mentors who opted in (D06), and a share link publishes the profile of an unlisted mentor to anyone who has it. The privacy notice from D27 covers the wording.
- **Cost:** the Tech Lead's estimate (Q08) may split this epic; any paid thin slice needs a superseding scope row (D14). Scope cut already applied: no composition payment double, GiST not on the Phase 2 critical path.

## 📝 Decisions in play

Relies on: D05 (links and directory), D06 (opt-in, filter, soonest slot first, no ratings), D08 and R05 (prices shown first), D09 and R04 (auto-confirm, charge at booking), D10 (sign-in before booking), D13 and R07 (mocks only in unit tests; no payment double in composition), D17, D20 and R08 (two-hour floor), D21 and R10 (notifications), D22 and R09 (mentee cancellation), D24 (published definition), D28 and R12 (mentee accounts, no booking of own slots), D26 (31 Oct ships closed), D31 (closed-state page), D33 and R15 (grace cancellation), D34 and R17 (mentor cancellation reasons), N01, N02, A01, A02.

Attendance, disputes and the payout hold (D32, R16) are specified for E03 and E04, not built here; this spec only leaves the `completed`, `no_show_mentee` and `no_show_mentor` states for them.

Proposes / records (Product owner approved with the 2026-10-24 review application):
- **E02-S05** filed under #9: a mentor sees booked sessions and can cancel one.
- **Directory hides mentors with no bookable slot** until they publish one (consistent with D24's "published" definition); nearest slot always from `listBookableSlots`.
- **Hold length of 10 minutes** and the `requestKey` idempotency convention.
- **Cancel copy until E03-S02:** outcome / “due when payments process”, not “already refunded”.
- **No composition payment double:** E02 integration = `booking_closed`; book+pay E2E with E03.

## 📋 Phasing

1. **Discovery** (#16, #17): public reads: directory, mentor page with prices and the nearest bookable slot, slot list. No writes. Nearest slot from `listBookableSlots` (no reservations yet until Phase 2).
2. **Booking** (#18): the booking entity, state machine, reservation (lock + overlap), events, payment and launch seams, notifications and the booking page.
3. **My bookings and the mentor view** (#28, E02-S05): lists, cancellation with the R09 outcome recorded, soft cancel copy, and the E01 criteria deferred to E02.
4. **Hardening and end-to-end** (optional GiST spike).

Prerequisites outside this spec: the platform and E01 specs implemented. E03 and E05-S01 are not prerequisites; production booking stays closed until they ship. Full book+pay integration waits for E03.

## 📋 Implementation Plan

### Phase 1 — Discovery

0. Closed-state rendering (D31): the mentor page reads `LaunchGate` and replaces the slot picker with the fixed sentence; test both states.
1. Validators `directory-query` and slot-query schemas; tests.
2. `MentorDirectoryRepository.candidates` (listed, both prices saved, a stack, not suspended) and `DirectoryService`, which owns the whole rule and computes discoverability and the nearest slot **only** via `AvailabilityService.listBookableSlots` (14-day horizon); tests for each exclusion (unlisted, prices missing, no stack, suspended, no bookable slot) and the ordering. Do not derive nearest slot from raw windows alone.
3. Routes `GET /api/mentors` and `GET /api/mentors/{slug}/slots` (public, `connection()` first); tests.
4. Extend `MentorCard`; add `DirectoryList`, `StackFilter`, `SlotPicker`, `LocalTime`; pages `/mentors` and the extended `/mentors/[slug]` with tests (prices before length, local time with zone, empty state).
   Verify: lint, typecheck, test, build; integration scenario: seeded mentors, a stack filter changes the list, the share link works for an unlisted mentor.

### Phase 2 — Booking

1. `Booking` and `Notification` entities, the `MentorProfile.suspendedAt` column, migration (no GiST yet), repositories (`reserve` with stale-hold cleanup and `overlapsActive`, `confirm`, `expire`, `cancel` with the conditional update, `reservedIntervals` ignoring stale holds); tests including the lock and overlap race.
2. `core`: `booking-state`, `booking-policy`, the event emitter, the ports (`LaunchGate`, `NotificationChannel` for e-mail); exhaustive tests of transitions and `cancellationOutcome` at the two-hour boundary. `BookingPayment` is declared in `modules/bookings/`, not under `core` ports.
3. `SlotReservationReader/Writer` over the repository; wire the reader into `AvailabilityService` (subtract reserved intervals; window removal takes the profile row lock and refuses an overlapping booking); update E01 tests; confirm `DirectoryService` still uses `listBookableSlots` so nearest slot excludes reserved intervals.
4. `BookingService.create` (the three transactions, compensation and emit) with a fake payment and open gate in unit tests, including charge-succeeds-confirm-fails, reused key with different parameters, and expired retry; production composition with the closed gate only (no payment-mode or gate-override env vars).
5. `NotificationService`: rows written by `BookingService` in its transactions and the e-mail channel subscribed to the events (after commit, `emailFailedAt` on failure, no question text in the mail); `/api/notifications`, the header badge and `/notifications`.
6. Route `POST /api/bookings`; booking page with the question field, sign-in return and error states.
   Verify: lint, typecheck, test, build; integration scenario: under defaults, `POST /api/bookings` answers `booking_closed`. (No second boot with a payment double.)

### Phase 3 — My bookings and the mentor view

1. `GET /api/bookings`, `GET /api/bookings/{id}`, `GET /api/mentors/bookings`, and `POST /api/bookings/{id}/cancel` using `cancellationOutcome` for both actors; tests for ownership (a third user gets `NotFound`) and each outcome.
2. Pages `/bookings`, `/bookings/[id]`, `/mentor/bookings`; `BookingCard` and `CancelDialog` (the mentor's dialog requires a reason; the mentee's shows the grace) with soft copy (“refund due when payments process” / “no refund — mentor paid when payments process”) until E03-S02; booked slots on the mentor's availability page.
3. Tracker: E02-S05 is [#30](https://github.com/azsonic/ai_techleaders_local/issues/30) under #9.
   Verify: lint, typecheck, test, build; integration scenario: mentee cancel records full-refund vs no-refund outcomes, including inside and outside the 15-minute grace; mentor cancel records full-refund outcome; both sides get in-product notices. (Money movement remains E03-S02; #28 stays dependent on it for “done”.)

### Phase 4 — Hardening and end-to-end

1. Security tests: ownership on every booking route, the CSRF and Origin check, no booking of one's own slot, price tampering, replayed `requestKey`.
2. **Optional GiST spike:** add the partial exclusion constraint, edit the migration for `btree_gist`, confirm empty follow-up `migration:create`; map `23P01` to `slot_taken`. Skip or abort the spike if it burns disproportionate time; lock + overlap remain sufficient for the pilot.
3. Confirm `npm run test` stays at 100% and `npm run test:integration` passes; run log in `.ai/runs/`, lessons in `.ai/lessons.md`.
4. Set the spec status to `implemented` and move it to `implemented/` when every criterion below is met.

## ✅ Acceptance criteria

- [ ] The directory lists only discoverable mentors, filtered by stack and ordered by soonest **bookable** slot (via `listBookableSlots`, including reserved intervals once bookings exist), with no ratings; an unlisted mentor is reachable by share link only.
- [ ] A mentor page shows both prices before a length is chosen and the nearest bookable slot; slots start at least two hours ahead and are shown in the viewer's time zone with the zone name.
- [ ] A signed-out visitor who chooses a slot signs in and returns to the same selection.
- [ ] A booking with a question is confirmed without mentor acceptance when payment succeeds (unit-tested with a fake; production path gated closed until LaunchGate/E03), and both sides are notified in-product and by e-mail.
- [ ] Two mentees cannot hold the same interval (lock + overlap); a double submit with the same `requestKey` returns one booking, and the same key with different parameters is refused.
- [ ] A charge that succeeds while the hold has expired is refunded with the same idempotency key; a cancel that races another change updates one row only.
- [ ] A booking without a question, for a slot under two hours away, at a stale price, or on the caller's own profile is refused.
- [ ] Production booking is closed (`booking_closed`) until `LaunchGate` opens; no payment test-double exists in composition.
- [ ] A mentee sees only their own bookings; a mentee cancelling within 15 minutes of booking or at least two hours before the start records a full-refund outcome (`refundStatus = due`), later records no refund with the mentor paid, and the dialog states outcome / “due when payments process” (not “already refunded”); a mentor cancelling always records the full-refund outcome, requires a reason, and the reason reaches the mentee's notice. The money itself moves in E03-S02, so the "refunded in full" criteria of #28 are complete only when that story ships.
- [ ] A mentor sees booked sessions with the mentee's question, and cannot remove a window that overlaps a booking (E01-S02's deferred criteria).
- [ ] While booking is closed the directory and mentor pages show prices and "Booking opens soon", no slot picker, and sign-in works.
- [ ] Every booking route denies a third party; cancel after the start is refused.
- [ ] `npm run lint`, `typecheck`, `test` (100% coverage), `build` and `test:integration` pass.

## ⚠️ Open questions (non-blocking)

- **Directory horizon and size:** 14 days and no pagination suit a pilot of tens of mentors; revisit when the directory has more than 100 discoverable mentors.
- **Backlog dependency of #28:** its build can precede E03-S02 because this spec records the outcome and E03-S02 moves the money; the tracker keeps the dependency so the story is not closed early.
- **GiST in Phase 4:** skip if the spike is costly; lock + overlap remain the pilot guard.
