---
title: One-command DevMentor installer (npm run setup)
status: implemented
created: 2026-10-22
updated: 2026-10-22
owner: Arunas
---

# One-command DevMentor installer (`npm run setup`)

Tracking issue: #3.

## 📝 TLDR

A developer cloning DevMentor today runs five README commands by hand, in order, and a missed or repeated step gives confusing errors. This spec proposes one command, `npm run setup`, that does the same work and is safe to re-run: every step looks at the real state of the machine and skips itself when its job is already done. The manual steps stay in the README as an alternative.

## 📝 Problem Statement

README "Getting started" asks for `npm install`, `cp .env.example .env.local`, `docker compose up -d`, `npm run db:migrate` and `npm run dev`. The order matters (migrating before PostgreSQL is healthy fails; `.env.local` must exist before `db:migrate` can read `DATABASE_URL`, see `packages/db/src/config.ts`). Repeating `cp` can overwrite a developer's edited `.env.local`. Who has this problem: a developer setting up locally for the first time, or returning after a pause (taken from issue #3; no `product-brief.md` exists).

## Scope

### In scope

- `npm run setup`: preflight, install dependencies, create `.env.local`, ensure PostgreSQL is reachable, apply migrations, print the next step.
- Idempotency: a second run changes nothing and exits 0. Steps 2–4 report `skipped`; the cheap check-only steps (preflight, migrate) report `up to date`.
- README: lead with `npm run setup`, keep the manual steps as an alternative; `AGENTS.md` Commands list mentions it.
- 100% unit coverage of the installer, including extending the coverage gate so it measures it.

### Out of scope

- Starting the dev server (see assumption A1).
- Installing Node.js or Docker. The script only checks and explains.
- Native Windows. macOS, Linux and WSL are supported (assumption A6).
- Seeding data (no seeders exist), CI changes, production deployment.
- Changing `.env.example`, `docker-compose.yml`, or any existing script name.

## 📝 Proposed Solution

A small, dependency-free Node program run as `node scripts/setup.mjs`, organised as an ordered list of **steps**. Each step has `check` (is the work already done, judged from the real world, never from a marker file) and `run`. The runner executes the steps in order, prints one status line per step (`done`, `skipped`, or `failed`), stops at the first failure with a non-zero exit code, and finishes with the next-step hint.

State is derived from the machine, not remembered. So a developer who did half the README by hand, or a run that failed midway, resumes cleanly, and a re-run is a no-op.

Alternatives considered:

- **Shell script (`setup.sh`).** Rejected: the repo is Node-only and the `engines` check, `.env` parsing and URL parsing are easier and testable in JavaScript.
- **TypeScript run with `tsx`.** Rejected: `tsx` is a devDependency of `@devmentor/db` and does not exist before `npm install`, which is the first step. Node 22.17 (`engines`) does not strip types by default.
- **A state file (`.setup-state.json`).** Rejected: goes stale when the user acts manually or deletes `node_modules`.
- **Put it in a workspace package.** Rejected: it is repo tooling, not application code, and has to run before any package is installed. `AGENTS.md` keeps the root for shared dev tooling.

### Market research

Rails' `bin/setup` and Discourse's `bin/docker/setup` are the reference: idempotent, one command, install gems, prepare the database. Rails also starts the server by default; we default to not starting it because a long-running process hides the step summary and makes the script's exit status meaningless (A1). Rails' `db:prepare` is the idempotent-migration model we match with `db:migrate`.

## 📝 Architecture

New root-level, plain ESM JavaScript using only `node:` built-ins. No new dependency in any `package.json`.

```
scripts/
├── setup.mjs                    entry: calls main(), sets process.exitCode
└── setup/
    ├── main.mjs                 main({ root, io, system }) → exit code; wires steps and the runner
    ├── run-steps.mjs            runs steps in order, prints status lines, stops on first failure
    ├── system.mjs               real adapters: exec, tcpProbe, fs helpers, log (the only impure file)
    └── steps/
        ├── preflight.mjs        Node version vs package.json engines
        ├── install-dependencies.mjs
        ├── create-env-file.mjs
        ├── ensure-database.mjs
        └── migrate-database.mjs
```

Root `package.json` gains `"setup": "node scripts/setup.mjs"`. Steps receive their dependencies (`exec`, `tcpProbe`, `fs`, `log`, `env`, `root`) as one object, so unit tests drive every branch with fakes and never touch Docker, npm or the network. Only `system.mjs` is impure, and it is tested against real primitives (a throwaway local TCP server, `node -e` as the spawned command, a temp directory).

Existing consumers: none. Nothing imports the installer, and the installer imports no workspace package.

### Step contracts

| # | Step | Skip when (already done) | Otherwise |
|---|---|---|---|
| 1 | **Preflight** | never skipped; cheap | Fail if `process.versions.node` < the `engines.node` floor read from root `package.json` (currently `>=22.17`). Docker is checked later, only if needed. |
| 2 | **Install dependencies** | `node_modules/.package-lock.json` exists and is not older than `package-lock.json` (npm writes the hidden lockfile after installing, so equal or newer mtimes mean up to date; a test covers equal mtimes) | `npm install` (stdio inherited so progress is visible) |
| 3 | **Create `.env.local`** | `.env.local` exists (never overwritten, A2). Reported as `skipped (warning: DATABASE_URL missing)` when the variable is absent. | Copy `.env.example` → `.env.local` with `COPYFILE_EXCL`. |
| 4 | **Ensure database** | A TCP connect to the host and port of `DATABASE_URL` (parsed with `util.parseEnv` from `.env.local`) succeeds | `docker compose up -d --wait --wait-timeout 60` (waits on the `postgres` healthcheck in `docker-compose.yml`). If `docker compose version` fails: fail with a message offering "install Docker" or "start PostgreSQL and set `DATABASE_URL` in `.env.local`". |
| 5 | **Migrate database** | never skipped; `npm run db:migrate` (`mikro-orm migration:up`) is itself idempotent, so the step reports `done (schema up to date)` | `npm run db:migrate` |

The issue suggested using `db:migration:list` to skip step 5. That command lists *executed* migrations, not pending ones, so it cannot answer "is anything pending". `migration:pending` exists in the MikroORM CLI but has no script, and parsing its table output is fragile. Resolved as A4.

### Output and exit codes

Plain text, one line per step, no colour dependency, readable in CI logs:

```
[done]    Install dependencies
[skipped] Create .env.local (already exists)
[done]    Ensure database (started with docker compose)
[done]    Migrate database (schema up to date)

Setup complete. Next: npm run dev  ->  http://localhost:3000  (admin: /admin)
```

Exit `0` on success, `1` on the first failed step, with a one-line cause and what to do next.

## 📝 Data Model

None. No entity, migration or env variable is added.

## 📝 API Contracts

One new root command: `npm run setup` (no flags, no arguments). Additive for `BACKWARD_COMPATIBILITY.md` row 6; nothing is renamed or removed.

## 📝 Edge Cases & Failure Scenarios

| Situation | Behavior |
|---|---|
| Node older than `engines` | Step 1 fails before anything runs: `Node 22.17 or newer required, found X`. Nothing was changed. |
| Run from a subdirectory (`cd packages/app && npm run setup`) | The script resolves the repo root from its own location (`import.meta.url`), not `process.cwd()`. (`npm run setup` from a workspace dir has no `setup` script and npm says so; the README documents running it at the root.) |
| `npm install` fails (network) | Step 2 fails, exit 1. Re-run retries it: the `node_modules/.package-lock.json` check is not satisfied by a partial install. |
| `.env.local` exists with edited values | Never touched. |
| `.env.local` exists but lacks `DATABASE_URL` | Step 3 warns; step 4 fails with "DATABASE_URL is not set in .env.local". |
| `.env.example` missing | Step 3 fails with the path it looked for. |
| Another project's PostgreSQL already holds port 5432 | The TCP probe succeeds, so Docker is skipped, and step 5 fails with MikroORM's authentication error, which is shown unmodified. The README troubleshooting note says to stop it or change the port in both `docker-compose.yml` and `.env.local`. |
| Docker not installed or daemon stopped, and no reachable database | Step 4 fails with both remedies. |
| Database container takes longer than 60 s | `--wait` times out, step 4 fails, the compose output is shown. Re-run continues. |
| Ctrl-C mid-run | No state file to corrupt. Re-run re-derives state. A killed `npm install` is detected by step 2's check. |
| Second run on a healthy machine | Steps 2–4 skipped; step 5 runs and reports up to date; exit 0, no file changed. |
| Secrets | `DATABASE_URL` carries a password. Only `host:port` is ever printed, never the URL. Spawned commands use fixed argument arrays (no shell, no interpolation of env content). |

## 📝 Risks & Impact Review

- **Reversibility:** high. The script only creates `.env.local` (when absent), `node_modules`, and a Docker container/volume that the README already tells developers to create. Removing it later removes one root script and a folder.
- **Coverage gate gap (important):** `vitest.config.ts` includes only `packages/**/*.test.{ts,tsx}` (line 17) and measures only `packages/*/src` (lines 25–31). A root `scripts/` folder would otherwise be silently untested, against the `AGENTS.md` rule that every feature is 100% covered. This spec widens `include` and `coverage.include` to the installer, and does not lower thresholds or exclude files.
- **Lint and typecheck gap:** `npm run lint` and `npm run typecheck` run per workspace (`--workspaces --if-present`), so root `scripts/` is neither linted nor type-checked. Accepted for now (A5); JSDoc types document intent, tests carry the correctness. Adding a root ESLint config is a separate decision.
- **Port-conflict false positive** (table above): a reachable foreign PostgreSQL skips Docker. The failure is loud and the README documents the fix; the alternative (always run Docker) breaks the "any PostgreSQL instance" README promise.
- **`docker compose --wait` requires Compose v2.1+.** Older Compose fails at step 4 with Docker's own message. Acceptable; Compose v2 is the supported baseline.
- **Product direction vs repo rule:** not starting the dev server is a direction call (A1), not a repo-rule matter.

## Resolved assumptions (autonomous defaults)

| # | Question | Chosen answer | Rationale |
|---|---|---|---|
| A1 | Should `npm run setup` also start `npm run dev`? | **No.** It prints the next command and the two URLs. | Smallest scope; the server is long-running and would hide the summary and exit status. A `--dev` flag can be added later without breaking anything. |
| A2 | Existing `.env.local` that differs from `.env.example`? | **Never overwrite**, warn only if `DATABASE_URL` is missing. | A developer's local edits are not recoverable; a missing copy is. |
| A3 | Where does the code live and in what language? | Root `scripts/`, plain `.mjs`, `node:` built-ins only. | Must run before `npm install`; Node 22.17 does not strip TypeScript types; no new dependency. |
| A4 | How is the migrate step made "skippable"? | It is not skipped: it always runs `npm run db:migrate`, which MikroORM makes idempotent, and reports `schema up to date`. | `db:migration:list` shows executed, not pending, migrations; no migrations exist yet; no new `db:*` script or output parsing is justified. |
| A5 | Lint and typecheck for root `scripts/`? | Not added; tests carry the correctness. | Adding a root ESLint/tsc setup is a separate repo-wide decision. |
| A6 | Native Windows support? | **No**; macOS, Linux, WSL. | The README targets Docker plus Node on those platforms; spawning `npm.cmd` needs a shell and widens the attack surface. |

None of these weakens security, data scoping or a documented compatibility surface, so none carries `⚠ NEEDS HUMAN CONFIRMATION`.

## Decisions in play

No `product-brief.md` exists. The only documents bounding this spec are `BACKWARD_COMPATIBILITY.md` (rows 5 and 6 are respected: no env variable, compose setting or script is renamed) and `AGENTS.md` (100% coverage rule, root holds only shared dev tooling).

## 📋 Phasing

- **Phase 1 — Installer engine and steps, fully tested.** Ships a working `npm run setup`. Nothing else in the repo depends on it, so the app keeps working throughout.
- **Phase 2 — Documentation.** README and `AGENTS.md` describe the command and keep the manual route.

## 📋 Implementation Plan

### Phase 1 — Installer

1. **Widen the gate first.** In `vitest.config.ts`, add `scripts/**/*.test.mjs` to `test.include` and `scripts/**/*.mjs` to `coverage.include`; keep `exclude` for test files (`**/*.test.mjs`). Run the installer tests in the `node` environment for every file (the global default is `jsdom`; the installer touches real sockets and `import.meta.url`): use a per-glob `environmentMatchGlobs`-style setting or a Vitest project for `scripts/**`, whichever the installed Vitest 5 supports (check its `.d.ts`), and fall back to `// @vitest-environment node` in each test file. Thresholds stay at 100. Verify: `npm run test` still passes (no installer code exists yet; the include patterns match nothing and coverage of existing code is unchanged).
2. **`scripts/setup/run-steps.mjs` + test.** Runs `{ title, check, run }` steps in order, prints `[done]`/`[skipped]`/`[failed]` lines through an injected `log`, stops at the first failure and returns the exit code. Test: all run, all skipped, mixed, failing step stops later steps, `check` throwing counts as a failure. Every `scripts/**` test runs in the `node` environment (step 1; lesson 2026-10-21).
3. **`scripts/setup/steps/preflight.mjs` + test.** Compare `process.versions.node` to the floor parsed from `engines.node`. Tests: older, equal, newer Node; unparsable `engines` value.
4. **`install-dependencies.mjs` + test.** Skip rule on the two mtimes; missing `node_modules`; stale lockfile; `exec` failure.
5. **`create-env-file.mjs` + test.** Copy with `COPYFILE_EXCL`; exists → skipped; exists without `DATABASE_URL` → warning; example missing → failure.
6. **`ensure-database.mjs` + test.** Parse `DATABASE_URL` with `util.parseEnv` and `new URL`; reachable → skipped; unreachable and compose available → `docker compose up -d --wait --wait-timeout 60`; unreachable and no compose → both remedies in the message; missing or malformed `DATABASE_URL`; logs only `host:port`.
7. **`migrate-database.mjs` + test.** Runs `npm run db:migrate`; success → `done (schema up to date)`; failure surfaces the child's output.
8. **`system.mjs` + test.** Real `exec` (spawn without shell, stdio inherited, rejects on non-zero exit), `tcpProbe` (against a local `net` server and a closed port, with a short timeout), fs helpers on a temp directory.
9. **`main.mjs`, `scripts/setup.mjs` and tests.** Resolve the repo root from `import.meta.url`; build the step list; run; print the closing hint. The entry file is a two-line call to `main()`, tested with the module mocked. Add `"setup": "node scripts/setup.mjs"` to root `package.json`. Verify: `npm run lint`, `typecheck`, `test` (100%), `build`, and a manual run on a clean clone plus a second run (all steps skipped, no file changed).

### Phase 2 — Documentation

10. **README.** In "Getting started": lead with `npm run setup` (what it does, that it is safe to re-run, run it from the repo root), keep the existing five commands under "Manual setup (alternative)" unchanged, add a short note on the port-5432 conflict, add `npm run setup` to the command table. Verify: every command shown in the README matches a script in `package.json`.
11. **`AGENTS.md`.** Add `npm run setup` to the Commands list. Verify: `npm run lint`, `typecheck`, `test`, `build` pass; `npm run test:integration` is unaffected (it provisions its own Testcontainers database and does not call the installer).

## Acceptance criteria

- [x] `npm run setup` on a fresh clone installs dependencies, creates `.env.local`, makes PostgreSQL reachable, runs migrations and prints the next step.
- [x] A second run skips the completed steps, changes no file and exits 0.
- [x] An existing `.env.local` is never overwritten.
- [x] A reachable PostgreSQL at `DATABASE_URL` means Docker is not touched.
- [x] Old Node, missing Docker with no reachable database, or an unhealthy container stops the run with a clear message and exit code 1.
- [x] The password in `DATABASE_URL` is never printed.
- [x] README leads with `npm run setup` and keeps the manual steps; `AGENTS.md` lists the command.
- [x] `vitest.config.ts` measures the installer at 100% (statements, branches, functions, lines) without lowering thresholds or excluding files.
- [x] `npm run lint`, `typecheck`, `test`, `build` pass.

## Open questions

None remaining; all were resolved as autonomous defaults above.

## Notes

- Corrects the tracking issue on one point: step 5 does not use `db:migration:list` (see A4).
- Pickup: `om-auto-implement-spec .ai/specs/2026-10-22-devmentor-installer.md`.
- Implemented in PR #5 (spec PR #4). Deviations from the plan: none in behavior. Step 1 used the allowed fallback of `// @vitest-environment node` in each `scripts/**` test file, because Vitest 5 has no per-glob environment setting. A prerelease Node version string is compared by its release number (found in review).
- Verification evidence: lint, typecheck, build and integration tests pass; unit tests pass at 100% coverage (110 tests); two live `npm run setup` runs against a running local PostgreSQL both exited 0 and the second skipped install, `.env.local` and Docker. The Docker start path and the missing-Docker and old-Node failures are covered by unit tests with fake adapters, not run live.
