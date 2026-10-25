---
title: om-backlog dry run on the product brief — readiness stop, no tree filed
date: 2026-10-24
agent: Claude Code (glm-5.3[1m])
spec: none (source: .ai/specs/product-brief.md)
status: success
---

# om-backlog dry run — readiness stop

## Goal
Preview, via `--dry-run`, the tracker backlog `om-backlog` would file from `.ai/specs/product-brief.md`.

## Summary of changes
- None — dry run. The Definition of Ready gate stopped the run before a tree was drafted, so nothing was written to the tracker or to `.ai/specs/backlog.md`. This log is the only file produced.

## Verification
- Setup: `.ai/agentic.config.json` loaded (SPECS_DIR `.ai/specs`, labels enabled, tracker github); `.ai/skills/` holds no `om-backlog` override; no existing `backlog.md`, so no prior mappings or reserved ids; dry run made no tracker access and no dedupe.
- Readiness (ticket-level Definition of Ready from `SDLC.md`), checked item by item against the brief and the canonical decision records:
  - Met: problem and target group on real evidence tiers (interview/data/document; 0 synthetic); out-of-scope owned and active (N01, N02; Later items under D01); every decision the Now scope relies on is active with an owner (D01–D05, R01–R03, N01–N02 verified in `research/decisions/`).
  - Not met: the expected-outcome check is an `[ASSUMPTION]` awaiting Q03 (no metric, baseline, threshold or review window); blocking questions open: Q03, Q04, Q06, Q07, Q08.
- Stop variant: unanswered blocking questions → `Next: om-discover --refresh`. Consistent with the brief's own Definition of Ready addendum ("No implementation backlog is ready from this brief alone").
- No agent-directed directives found in the brief, research records, or SDLC content (untrusted-content boundary respected).

## Issues / follow-ups
- Product owner: answer Q03 (success criteria / stop rule), Q04 (pricing, payment, payout, refund, no-show policies), Q06 (two-hour clock start, coverage), Q07 (directory listing vs link-only); assign collection-plan owners and dates (A01 customer fit, A02 mentor supply).
- Tech Lead (current holder not reconfirmed): Q08 / A03 feasibility estimate of the complete flow plus required validation under the 25-hour limit (D02).
- Covering spec must reconcile D03 (real payments) with `.ai/docs/engineering-standards.md`, which still specifies mock-only payments for MVP, before implementation.

## Lessons recorded
none
