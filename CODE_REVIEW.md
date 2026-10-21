# Code review rules

Applied automatically by `om-code-review` (and so `om-auto-review-pr`) on top of its built-in checklist. The binding sources are `AGENTS.md` and `.ai/docs/engineering-standards.md` (§ Code Review Checklist); where this file disagrees with `AGENTS.md`, `AGENTS.md` wins. Severities: **blocker** (must fix before merge), **major** (fix unless a maintainer waives it on the PR), **minor** (defer or follow-up issue).

## Review priorities

1. **Correctness** — the change does what the PR and linked spec say; error and empty paths are handled where they occur.
2. **Security** — see the checklist below.
3. **Contracts** — nothing in `BACKWARD_COMPATIBILITY.md` is broken without the required path.
4. **Architecture** — package boundaries, DI rules and placement per `AGENTS.md`.
5. **Tests and quality** — coverage, regression tests, no dead code.

## Repo-specific checks

### Architecture and placement
- **blocker** — a cross-package import breaks the dependency rules (`core` → nothing; `db` → `core`; `ui` → `core`; `app` → all) or reaches into another package by deep relative path instead of its public entry.
- **blocker** — `@devmentor/db` or the DI container is imported into a Client Component; server-only modules lack `import 'server-only'` (but `server-only` must not be imported from code the MikroORM CLI loads).
- **major** — code sits in the wrong package (framework-agnostic code outside `core`, data-less UI outside `ui`, business logic in a page/route/action instead of a service in `packages/app/src/modules/<concept>/`).
- **major** — a concept folder is scaffolded empty, or file names break the convention (kebab-case, role suffix `.entity`/`.repository`/`.service`/`.schema`).
- **major** — a new framework, ORM, DI container or styling system appears without an approved spec.

### API routes and client calls
- **blocker** — a route handler is not wrapped in `apiHandler`, hand-builds `Response.json`, or adds its own `try/catch`; DB work does not go through `withRequestScope`.
- **blocker** — a per-request route or page does I/O without `await connection()`, or uses `export const dynamic` (removed under `cacheComponents`).
- **major** — a service builds responses instead of throwing the typed `AppError` subclasses; an API response is not the `ApiResult<T>` envelope.
- **major** — browser code calls `/api/*` with raw `fetch` instead of `apiCall` / `apiCallOrThrow`; a bespoke spinner or error text replaces `LoadingMessage` / `ErrorMessage` / `EmptyState`.

### Database (MikroORM v7)
- **blocker** — schema change without a committed migration (and `.snapshot-*.json`), an applied migration edited instead of a new one added, or `schema:update` used against a shared database.
- **blocker** — the global `EntityManager` is used, or `MikroORM.init` is called outside `getOrm()`; the pool is configured ad hoc instead of through `createOrmConfig()`.
- **blocker** — raw SQL or `em.execute()` with interpolated user input; a request body spread into `em.create()` / `em.assign()` (mass assignment).
- **major** — an entity uses decorators instead of `defineEntity`, or is not registered in `src/entities/index.ts`; a repository leaks query-builder details into `app`.

### Dependency injection (Awilix)
- **blocker** — `container.resolve` called inside a service (service locator), or a scoped service resolved from the root container.
- **major** — constructor does not take a single destructured dependencies object; `CLASSIC` injection mode; `Cradle` interface not updated with a new registration.

### UI
- **major** — a shadcn primitive is hand-written instead of added via `npx shadcn@latest add` (from `packages/app`); shadcn primitives used on public frontend pages (Tailwind-only) or the reverse rules ignored for admin pages.
- **major** — a link styled as a button does not use `cn(buttonVariants(...))`, or uses `<Button render={<Link/>}>`.
- **major** — a `packages/ui` component fetches data or touches DI instead of receiving props.

### Tests
- **blocker** — `npm run test` drops below 100% statements, branches, functions or lines on `packages/*/src/**/*.{ts,tsx}` and `packages/app/next.config.ts`; the threshold is lowered or a file excluded to land the change.
- **major** — a behavior change has no test that fails on the pre-change code; a bug fix lacks a regression test.
- **major** — a user-visible flow has no `agent-browser` scenario in `packages/app/test/integration/`.
- **major** — a unit test imports the real `server-only` package instead of relying on the Vitest alias.

## Security checklist

- **blocker** — auth not enforced server-side on a non-public route; authorization checks only "logged in" instead of the specific record (IDOR); missing ownership check.
- **blocker** — a check-then-act on a shared resource (slot availability, booking status) without a transaction and/or unique constraint.
- **blocker** — secret, token, password or full JWT in a log line, error response or client-visible payload; a secret hardcoded or committed (`.env*` stays git-ignored; every required variable is listed in `.env.example`).
- **blocker** — untrusted input reaches a query, shell command or file path unparameterized or uncanonicalized; error handling around a security decision fails open.
- **blocker** — a state-changing route lacks CSRF defense (`CSRF_HEADER` check plus `sameSite` cookies).
- **blocker** — a client-supplied price, owner or ID that affects money or ownership is trusted instead of recomputed or revalidated server-side.
- **major** — auth-cookie flags (`httpOnly`, `secure`, `sameSite`) are weakened; JWT stored in `localStorage`; login/register/reset lacks a brute-force control; auth errors reveal whether an email is registered.
- **major** — a security bug fix ships without a regression test.

## Code quality

- **major** — `any`, empty `catch`, swallowed errors; `console.log`, dead or commented-out code left in.
- **minor** — magic numbers/strings without a named constant; deep nesting where an early return fits; a bare boolean argument at a call site.
- **major** — the diff does not trace to the PR's stated purpose (drive-by renames, formatting passes, speculative options, features the scope excludes: RBAC, multi-tenancy, queues).

## Process

- The PR passes the full validation gate in `SDLC.md` (`npm run lint`, `typecheck`, `test`, `build`, and `test:integration` for user-visible changes) before sign-off; failures are listed in the review, not skipped.
- A user-facing change carries `needs-qa`; docs-only, test-only, CI-only or dependency-only changes carry `skip-qa`.
- A lesson from a correction is recorded in `.ai/lessons.md`; a spec that the change implements is moved to `.ai/specs/implemented/` with criteria checked off.
