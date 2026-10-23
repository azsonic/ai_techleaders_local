---
title: Set up the discovery pipeline
date: 2026-10-22
agent: Codex
spec: none
status: success
---

# Set up the discovery pipeline

## Goal
Add the product planning process using the explicitly requested `om-setup-discovery-pipeline` skill.

## Summary of changes
- Preflight: read the skill and its references, repository lessons, pipeline configuration, and process document. No covering feature spec exists; this is process configuration.
- Delivery configuration and the GitHub tracker descriptor exist. No discovery configuration or discovery sections are installed yet.
- Existing untracked `.ai/specs/research/` contains user material; preserve it.
- All four optional product skills are installed.

## Verification
- Config parsed successfully; `paths.specs` is the safe relative path `.ai/specs`.
- No repo-local override exists for this skill.
- Existing delivery process includes the risk-high evidence table, `QA head:` rule, and post-merge paragraph.
- No task-routing table exists in `AGENTS.md` or `CLAUDE.md`; no routing row will be added.
- Application checks have not run; team role answers and review of the proposed diff are pending.

## Issues / follow-ups
- Ask the team about the optional roles and present the complete proposed diff before editing configuration or `SDLC.md`, as required by the invoked skill.

## Lessons recorded
none

## Team answers
- The user confirmed there is no domain expert distinct from the product owner. Set `discovery.roles.domainExpert` to `false` in the proposed configuration.
- Designer responsibility is awaiting the user's answer.

## Proposed changes for approval
The user confirmed there is no separate designer. Both optional role flags will be false.

`SDLC.md` will describe product discovery before implementation, add a Product owner role, and add a Definition of Ready checklist plus protection for the brief's non-goals, business rules, and decisions. Its existing Discovery row expands to include the product brief. Intake currently requires "enough detail to act on"; the proposed row requires the Definition of Ready checklist.

The configuration gains only the `discovery` entry. The existing research folder is preserved and gains an empty `.gitkeep`; `om-discover` reads research material there and writes decision records under `research/decisions/`. All remaining delivery settings and process prose stay as they are. The existing generic Designer role is preserved because it also covers agent-assisted design. No routing row is added because `AGENTS.md` and `CLAUDE.md` have no task-routing table.

The proposal was rendered from this skill's template in memory. JSON validation, placeholder checks, standalone marker counts, and inline marker counts passed. An initial assertion counted marker examples in prose; it was corrected to count standalone marker lines. Configuration and `SDLC.md` have not been written.

### Complete proposed diff

```diff
--- a/.ai/agentic.config.json
+++ b/.ai/agentic.config.json
@@ -33,5 +33,9 @@
     "qa": ".ai/qa"
   },
   "reviewChecklist": null,
-  "closeKeywords": []
+  "closeKeywords": [],
+  "discovery": {
+    "enabled": true,
+    "roles": { "domainExpert": false, "designer": false }
+  }
 }
--- a/SDLC.md
+++ b/SDLC.md
@@ -8,20 +8,25 @@
 
 Before intake, the work is shaped: `om-brainstorm` turns a single idea or question into a routing decision and a brief, and the spec skills (`om-spec-writing`, `om-auto-write-spec`) turn a feature into a design document before anything is built. Those steps feed the table below; they are not the ticket flow itself.
 
+<!-- discovery:start -->
+Before any of that, `om-discover` establishes the product context every later decision reads: `.ai/specs/product-brief.md` — who the users are, what hurts, what the product is not, which rules and decisions bind the work. The Definition of Ready below is the contract between that context and Intake.
+<!-- discovery:end -->
+
 ## Roles
 
 - **Author** — the human or agent who writes the change. Owns the ticket from claim to a merge-ready PR.
 - **Reviewer** — reads the diff and approves or requests changes. May be a human or the `om-auto-review-pr` skill; the `om-code-review` checklist applies either way. The reviewer is also the second person a `risk-high` change needs and signs off the spec when a feature requires one; a team that names a tech lead or an architect puts them here.
 - **Designer** — owns the flow and its states before the code exists, and the design contract the UI review reads back. May be a human, `om-ux-shape` for the shaping, `om-ux-review-pr` for the pass over a PR's screens.
 - **QA reviewer** — exercises user-facing changes before they merge, with `om-prepare-test-env` to boot the app once and `om-auto-qa-pr` to walk it in a real browser. Manual means a person judges the result and owns `qa-approved`; it does not mean the work is unassisted. Always referenced by role, never by name or handle: assignments change.
+- **Product owner** — owns the why and the value: the product brief, the scope split (now, later, not doing), the success criteria, and the ticket-level tier of the Definition of Ready. Confirms the brief before it is written and the backlog tree before it is filed; owns every product decision in the brief that names no other owner. Referenced by role, never by name. <!-- discovery -->
 - **Maintainer** — owns branch protection, the label taxonomy, the config, this document, and the installed skills with their repo-local overrides under `.ai/skills/`; arbitrates when gates conflict. Acts as the release manager unless the team names one.
 
 ## Ticket lifecycle
 
 | Stage | What happens | Driven by | Done when |
 |---|---|---|---|
-| Discovery | An idea, question, or itch is talked through before any artifact exists: the problem is questioned, alternatives (including building nothing) are weighed, and the conversation ends in a routing decision — an answer, a filed ticket, a brief for a spec, or a direct change. | `om-brainstorm` or a human | Conversation routed; a brief written when the work continues |
-| Intake | A ticket or task brief is filed in github with enough detail to act on: what is wrong or wanted, for whom, and what done looks like. `om-prepare-issue` files it with SDLC labels. | Anyone, `om-prepare-issue` | Ticket exists |
+| Discovery | The product context is established before any idea is weighed — problem and who has it, stakeholders, rules, flows, success criteria, scope — from material that exists, with every claim tagged by its evidence and every decision owned by a person; the product owner confirms the brief before it is written. Then an idea, question, or itch is talked through: the problem is questioned, alternatives (including building nothing) are weighed, and the conversation ends in a routing decision. | `om-discover` (product level, with the product owner), `om-synthetic-users` (first panel), `om-mockup-prototype` (optional low-fi flow), `om-discover --refresh`, `om-backlog --dry-run`, and `om-brainstorm` (one idea), or a human | A product brief, or a routed conversation with a brief when the work continues <!-- discovery --> |
+| Intake | A ticket or task brief is filed in github and meets the Definition of Ready below. `om-prepare-issue` and `om-backlog` file it with SDLC labels and the ready sections; `om-auto-manage-issues` reports what an existing ticket still lacks. | Anyone, `om-prepare-issue`, `om-backlog`, `om-auto-manage-issues` | Ticket exists and is ready, or its gaps are named on the ticket <!-- discovery --> |
 | Triage | Confirm the issue is real, still unfixed on `main`, and not already claimed or covered by an open PR. Read-only; stops the chain cleanly when there is nothing to do. | `om-verify-in-repo` or a human | Confirmed actionable, or closed as no-action |
 | Claim | The author claims the ticket so concurrent agents back off. See the claim protocol below. | `om-fix` / `om-auto-create-pr`, or a human | Claim visible on the ticket |
 | Design | For a user-facing change, the flow and its states are settled before the code exists: what the screen does when empty, loading, in error, and without permission, and what the change deliberately does not do. A ticket that touches no UI skips this stage. | `om-ux-shape`, or a human designer | The flow and its states are decided, or the ticket is not user-facing |
@@ -34,6 +39,40 @@
 
 After merge, this process stops. Deployment, smoke tests, monitoring, and rollback belong to the repository's release process, not to this document: the Maintainer — or a release manager, when the team names one — drafts the changelog with `om-auto-update-changelog` and reconciles the tracker with `om-close-fixed-issues`, and `om-pipeline-retro` reads finished runs to rank what second passes cost. Merge is where this document ends; delivering the change to users is a separate process the team owns.
 
+<!-- discovery:start -->
+## Definition of Ready
+
+A ticket is ready for implementation when the answers below are on the ticket or in a spec it links. They come in two tiers, because a spec can supply the second but never the first.
+
+**Ticket-level — only a human can supply these:**
+
+- the problem or need, and who has it (a user or a role);
+- the expected outcome, and how it will be checked;
+- what is out of scope;
+- open questions, each marked blocking or non-blocking — no blocking question left unanswered;
+- any autonomous assumption confirmed by a human (the resolved-assumptions comment on a spec PR).
+
+**Spec-level — a covering spec supplies these, and `om-auto-write-spec` writes them when they are missing:**
+
+- acceptance criteria;
+- business rules;
+- the happy path and the main unhappy paths;
+- impact on data and permissions;
+- dependencies;
+- a link to the prototype or mockups when the change is user-facing.
+
+For a bug, ready means reproducible: `om-verify-in-repo` is that gate, and the list above applies only to its ticket-level items. Enforcement: `om-prepare-issue` files tickets with these sections; `om-auto-manage-issues` records `READY_STATUS` per issue and posts a not-ready comment naming what is missing; `om-auto-fix-issue`'s feature route stops on a ticket that fails the ticket-level tier instead of speccing around the gap, the way `om-verify-in-repo` stops on a bug that is not real. Spec-level gaps are not a stop — the spec is authored. A maintainer may waive an item by saying so on the ticket. This section is what those skills read: a repository whose `SDLC.md` has no Definition of Ready gets no readiness check.
+
+## Product decisions as a protected contract
+
+When `om-discover` has written `.ai/specs/product-brief.md`, its **Non-goals**, **Business rules**, and **Decisions** tables are protected the way `BACKWARD_COMPATIBILITY.md` protects contract surfaces. Each entry carries a stable id (`N01`, `R03`, `D07`), an owner, a status (`active` or `superseded`), a review-by date, and a required path for changing it. The rules:
+
+- A PR that builds something a non-goal excludes, or contradicts a business rule or a decision, without a superseding entry in the same PR is a **blocker** in review, quoting the entry and its id. The way out is never "delete the code": it is "change the decision explicitly" — a superseding row approved by the entry's owner, with the maintainer arbitrating a dispute, as in Roles.
+- The decisions in play are surfaced where people work, not remembered: `om-auto-manage-issues` lists them in its implementation-notes comment, `om-spec-writing` carries a *Decisions in play* section, and every PR body carries *Decisions touched*. A newcomer or a new agent reads them at the issue, the spec, or the PR, not in a chat history.
+- An autonomous assumption a human confirmed on a spec PR (the resolved-assumptions comment) is recorded as a decision on the next `om-discover --refresh`, with the confirmer as owner, so the reason a thing is the way it is survives the people who decided it.
+- Decisions age: an entry past its review-by date is flagged in review as due for a look, not enforced blindly. Which entries block more than they protect is a retro question.
+<!-- discovery:end -->
+
 ## Label state machine
 
 Pipeline labels are mutually exclusive: a PR carries at most one, and it names where the PR sits in the flow.
@@ -130,6 +169,10 @@
 ## Amending this process
 
 This document and `.ai/agentic.config.json` describe the same process: change them together, and re-run the `om-setup-agent-pipeline` skill when the toolchain or label taxonomy changes.
+
+<!-- discovery:start -->
+The product-layer blocks between `<!-- discovery:start -->` and `<!-- discovery:end -->` are owned by `om-setup-discovery-pipeline`: re-run it to add or refresh them, and edit everything else by hand.
+<!-- discovery:end -->
 
 The design contract the Design and Review stages read is set up once: `om-ux-setup` extracts it from the repository and is re-run when the design system changes.
 
diff --git a/.ai/specs/research/.gitkeep b/.ai/specs/research/.gitkeep
new file mode 100644
--- /dev/null
+++ b/.ai/specs/research/.gitkeep
```

### Pending
Wait for approval of this exact proposal before writing configuration or `SDLC.md`. No commit has been requested.

## Approved implementation
- The user approved the complete proposed diff. Applied it to `.ai/agentic.config.json` and `SDLC.md`, and added the research placeholder.
- Product owner is accountable for direction and business rules; the maintainer fills that role when nobody else does. No distinct Domain expert or Discovery design owner was declared.
- Preserved existing research material, delivery settings, generic Designer responsibility, and agent instruction files.
- Validation is in progress. No commit has been requested.

## Final verification and handoff
- `npm run lint` — passed in all four workspaces.
- `npm run typecheck` — passed in all four workspaces.
- `npm run test` — sandboxed attempt failed because the TCP probe test could not listen on localhost (`EPERM`). Approved rerun passed: 37 files, 110 tests; 100% statements, branches, functions, and lines.
- `npm run build` — sandboxed attempt could not fetch Google Fonts. Approved rerun progressed past fonts but failed in Turbopack's CSS processing because binding to a local port was denied (`Operation not permitted`). Application build verification remains limited by the environment; no application source was changed to work around it.
- `npm run test:integration` — not run: this change only configures the planning process and adds documentation; it changes no user-visible application flow.
- Exact-content checks confirmed the installed configuration and `SDLC.md` match the approved proposal.
- Removing only the added discovery key from the config reproduces the original file byte-for-byte. Removing the new marked content and restoring the two original lifecycle rows reproduces the original `SDLC.md` byte-for-byte.
- Verified one Discovery row, one Intake row, and the original generic Designer role; no unresolved template placeholders. The research placeholder is an empty file.
- Product skills `om-discover`, `om-synthetic-users`, `om-backlog`, and `om-mockup-prototype` are all installed.
- `git diff --check` passed. Existing untracked research artifacts were preserved; no tracker operations, commits, or pushes were performed.
- Added the marker-validation lesson to `.ai/lessons.md`.
- No product brief exists yet. Next command: `/om-discover`.

## Removing this setup later
Prepare and review a removal diff first. Restore the exact pre-install Discovery and Intake rows from the approved diff above, then remove the remaining discovery-marked paragraphs, sections, role, any discovery routing entry, and the `discovery` configuration key. Keep the existing generic Designer role and all brief, research, and prototype artifacts. The current installation has no routing entry because the agent instruction files have no task-routing table.

## Final status
Approved planning setup is installed. Lint, type checks, unit tests, coverage, and setup checks pass. The production build is unverified because the environment denies Turbopack's local port binding. Changes are uncommitted; offer a commit without including the user's pre-existing untracked research material.

