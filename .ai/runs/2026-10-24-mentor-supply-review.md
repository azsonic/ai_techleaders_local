---
title: Apply mentor-supply review recommendations
date: 2026-10-24
agent: Cursor Grok 4.7
spec: .ai/specs/2026-10-24-mentor-supply.md
status: success
---

# Apply mentor-supply review recommendations

## Goal

Write the Product owner's accepted review recommendations into the E01 spec and the product record.

## Summary of changes

- `.ai/specs/2026-10-24-mentor-supply.md` — one accept outcome for existing mentors, revoke keeps the row, 10:00–22:00 stays a hard pilot limit, email match rules, published and listing definitions, 25-minute remainder rule, invitations off generic CRUD, no GiST constraint, one pricing helper and one availability helper, public page is a card.
- `.ai/specs/research/decisions/2026-10-24-mvp-pilot-supply-payments.md` — D24.
- `.ai/specs/product-brief.md` — D24 row, R08, D17, Q10, decision summary.
- `.ai/specs/2026-10-24-platform-primitives.md` — invitations do not use `makeCrudRoute`; E01 does not call `SlotReservationReader`.

## Verification

Spec and brief edits only. No lint, typecheck, test or build.

## Issues / follow-ups

Invitation text, the first-profile check and the warm-contact source in Q10 are still open.

## Lessons recorded

none
