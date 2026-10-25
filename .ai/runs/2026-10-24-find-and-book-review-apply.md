---
title: Apply find-and-book design-review recommendations
date: 2026-10-24
agent: Cursor / Composer
spec: .ai/specs/2026-10-24-find-and-book.md
status: success
---

# Apply find-and-book design-review recommendations

## Goal

Apply the product-owner-facing design-review recommendations to the find-and-book spec and align the platform contracts, without implementing code.

## Summary of changes

- `.ai/specs/2026-10-24-find-and-book.md` — directory/nearest slot via `listBookableSlots`; no composition payment double (D13/R07); Phase 2 lock+overlap, GiST deferred to Phase 4; soft cancel copy; `BookingPayment` app-only; E02-S05 approved; open questions closed where decided.
- `.ai/specs/2026-10-24-platform-primitives.md` — booking three-step contract; notification split (rows in txn / e-mail on events); `makeCrudRoute` no longer claimed for E02 directory/bookings; payment mocks unit-test only.
- `.ai/specs/backlog.md` — E02-S05 as [#30](https://github.com/azsonic/ai_techleaders_local/issues/30).

## Verification

Spec text cross-read for internal consistency (directory path, payment seams, Phase 2/4, cancel copy). No code or automated checks (docs-only). GitHub issue #30 created.

## Issues / follow-ups

- E03 spec (when written) should own book+pay integration and cancel-dialog copy switch to “refunded” after money moves.
- Optionally link #30 on the epic #9 body in GitHub.
- Spec status set to `approved` (2026-10-24) on Product owner request.

## Lessons recorded

none
