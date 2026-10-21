# DevMentor — Engineering Standards & Package Structure

Date: 2026-09-01
Updated: 2026-10-20 (reconciled with the repo's architecture; see `.ai/specs/2026-10-20-engineering-standards-foundation.md`)
Status: active

Grounded in the target product scope (`devmentor-training-pack-first-idea`: ~9 domain
concepts — auth, mentors, availability, bookings, payments, messages, favorites,
reviews — across a marketplace booking flow). Decisions confirmed with the project owner:
**domain sub-folders inside the existing layered packages** (not a module runtime),
**keep `awilix` DI**.

`AGENTS.md` is binding for architecture. Where this document and `AGENTS.md` ever
disagree, `AGENTS.md` wins and this document gets fixed. In particular:

- Dependency direction is `db → core`, `ui → core`, `app → everything`. `core`
  depends on nothing and imports no React, Next.js, MikroORM or Awilix.
- Services live in `packages/app/src/modules/<concept>/` (they need the forked
  `EntityManager` via repositories, so they can't live in `core`). The DI container is
  `packages/app/src/di/container.ts`, with the `Cradle` interface in the same file.
- Per-request routes and pages call `await connection()`. `export const dynamic` is
  not available, because `cacheComponents` is on (Next 16 removes it).

---

## 1. Final List of Engineering Rules

### Naming

| Element | Convention | Example |
|---|---|---|
| Package | `packages/<name>`, scoped `@devmentor/<name>` | `@devmentor/core` |
| Domain concept folder | plural, single lowercase word, matches the event namespace | `bookings`, `payments`, `mentors` |
| File | kebab-case, with a role suffix where one applies (`.entity`, `.repository`, `.service`, `.port`, `.schema`) | `booking.service.ts`, `api-call.ts`, `mentor-card.tsx` |
| Entity | PascalCase singular via `defineEntity`, file `<name>.entity.ts` inside its concept folder | `Booking` → `db/src/entities/bookings/booking.entity.ts` |
| Repository | PascalCase + `Repository`, file `<name>.repository.ts` inside its concept folder | `BookingRepository` → `db/src/repositories/bookings/booking.repository.ts` |
| DB table | snake_case, plural | `bookings` |
| DB column | snake_case (mapped from camelCase property) | `created_at` ← `createdAt` |
| Service | PascalCase class + `Service` suffix, file `<name>.service.ts` inside its concept folder | `BookingService` → `app/src/modules/bookings/booking.service.ts` |
| Port (external integration interface) | PascalCase + `Gateway`/`Port` suffix, file `<name>.port.ts`, in `core` | `PaymentGateway` → `core/src/ports/payments/payment-gateway.port.ts` |
| Adapter (port implementation) | PascalCase + adapter name, under the concept module's `adapters/` | `MockPaymentGateway` → `app/src/modules/payments/adapters/mock-payment-gateway.ts` |
| DI cradle key | camelCase, one entry per dependency | `bookingService: BookingService` |
| Zod schema | camelCase variable + `Schema` suffix, file `<name>.schema.ts`, shared client/server | `bookingCreateSchema` → `core/src/validators/bookings/booking-create.schema.ts` |
| Event ID | `concept.entity.action`, past tense, dot-separated | `bookings.booking.created` |
| API route | one `route.ts` per resource under `api/<concept>/...` | `api/bookings/route.ts`, `api/bookings/[id]/reschedule/route.ts` |
| Page | `<segment>/page.tsx`, default export `<Segment>Page` | `sessions/page.tsx` → `SessionsPage` |
| UI component | PascalCase; shadcn primitives in `components/ui/`, concept-specific shared components in `components/<concept>/`, generic admin patterns in `backend/<category>/` | `MentorCard`, `CrudForm` |
| Domain error | PascalCase + `Error` suffix, extends `AppError`, file `core/src/http/errors.ts` | `NotFoundError`, `ValidationError` |
| API route handler builder | `apiHandler` from `@/http/api-handler` (built by `createApiHandler` in `core/src/http`); `makeCrudRoute` once it exists | `export const GET = apiHandler(async () => ...)` |
| Client fetch helper | `apiCall`/`apiCallOrThrow` from `@devmentor/ui/backend/api/api-call`, never raw `fetch` | `const res = await apiCall<Booking[]>('/api/bookings')` |

### Reusable API & UI Layer (no duplicated fetch / validation / auth / CRUD code)

The single biggest risk of adding ~9 concepts one at a time is that every route and
every page re-invents fetch/validation/auth/error-handling slightly differently. Two
shared layers exist specifically to prevent that — **build a new one only when a
genuinely new pattern appears, never re-implement an existing one inline.**

Status markers: **(built)** exists today; **(deferred)** is built, in the layer listed,
by the first concept that needs it — not before.

**Server side — `packages/core/src/http/`, plus the app's configured instance:**

- `errors.ts` **(built)** — a small typed error hierarchy (`AppError` base with an
  HTTP-agnostic `kind` and a `code`; `ValidationError` (with `fieldErrors`),
  `UnauthorizedError`, `ForbiddenError`, `NotFoundError`, `ConflictError`,
  `ServiceUnavailableError`). Services throw these; nothing else. A service never
  builds an HTTP response.
- `envelope.ts` **(built)** — the `ApiResult<T>` envelope
  (`{ ok: true, data }` / `{ ok: false, error: { code, message, fieldErrors? } }`) and
  the `CSRF_HEADER` name. One definition, imported by both server and client.
- `api-handler.ts` **(built)** — `createApiHandler({ rethrow })` builds `apiHandler`,
  which wraps a route function: it maps thrown `AppError`s to the right status code and
  the envelope, logs unexpected (non-`AppError`) failures and 5xx errors, and never
  leaks a raw stack trace to the client. The app's instance,
  `packages/app/src/http/api-handler.ts`, passes Next's `unstable_rethrow` so
  `notFound()`/`redirect()` and prerender signals aren't swallowed. Every route handler
  is wrapped in it — no route writes its own `try/catch`. Logging goes through
  `console.error` until a shared logger exists.
- `make-crud-route.ts` **(deferred)** — for a resource that is genuinely just
  list/create/update/delete (e.g. `favorites`, `technologies`), pass Zod schemas +
  service method references and get back `{ GET, POST, PUT, DELETE }` to re-export from
  `route.ts`. The route file becomes configuration, not logic. Workflow endpoints that
  don't fit CRUD (booking, reschedule, payment) use `apiHandler` directly and call one
  or more service methods inside — they don't force-fit `makeCrudRoute`.
- `auth.ts` **(deferred)** — `requireSession(req)` (throws `UnauthorizedError`),
  `requireRole(session, role)` and ownership assertions (e.g. `assertOwnsBooking`)
  (throw `ForbiddenError`). Every route that isn't public calls one of these first,
  before touching a service. It will check `CSRF_HEADER` on state-changing requests.
  If it needs `next/headers` (cookies), the Next-specific part lives in `app`.

**Client side — `packages/ui/src/backend/`:**

- `api/api-call.ts` **(built)** — the only place a `fetch()` call to `/api/*` is
  allowed (ESLint enforces it). Parses the JSON envelope defensively (`readJsonSafe`,
  never `.json().catch(...)`), returns a typed `ApiResult<T>`, and `apiCallOrThrow` for
  call sites that want to throw instead of branching on `ok`. It always sends
  `CSRF_HEADER`. No component calls `fetch` directly.
- `forms/crud-form.tsx` **(deferred)** — schema-driven form: takes the same Zod schema
  used server side, renders fields, shows server-returned `fieldErrors` next to the
  right field, handles submit/cancel/loading state, and standardizes `Cmd/Ctrl+Enter`
  to submit and `Escape` to cancel. Use it for every create/edit form; write a bespoke
  form only when the UX genuinely isn't a form-over-schema (e.g. the calendar slot
  picker).
- `tables/data-table.tsx` **(deferred)** — column-config-driven list rendering with
  built-in loading/empty/error states, pagination, and row actions. Use it for every
  list screen (search results, sessions, students, reviews) instead of hand-rolling a
  `<table>`/`.map()` per page.
- `feedback/{loading-message,error-message,empty-state}.tsx` **(built)** — the only
  sanctioned loading/error/empty renderers; a page composes these instead of writing
  its own spinner/error text.

The envelope type is shared through `@devmentor/core`, because `ui` may depend on
`core`. There is no need for a separate `packages/shared`.

**Where a new reusable component goes** (so this stays a place things arrive at, not
a dumping ground):

1. A raw shadcn primitive (no app logic) → `ui/src/components/ui/`, added only via
   `npx shadcn@latest add <name>` from `packages/app` — never hand-written.
2. A generic, concept-agnostic admin pattern used across concepts (a new kind of form
   field, a new table cell renderer, a new feedback state) → `ui/src/backend/<category>/`.
3. A component tied to one concept's domain shape (renders a `Booking`, a
   `MentorProfile`, a `Review`) → `ui/src/components/<concept>/`, named after the same
   concept folder used in `db`/`app` (e.g. `components/mentors/mentor-card.tsx`).
4. A component used by exactly one page → colocate it next to that `page.tsx`; only
   promote it into `components/<concept>/` the moment a second page needs it.

### Architecture

- Keep the enforced dependency direction from `AGENTS.md`: `core` imports nothing;
  `db` and `ui` import only `core`; `app` imports everything; nothing imports `app`.
  ESLint `no-restricted-imports` (root `eslint.boundaries.mjs`) enforces it. This
  boundary is doing real work and should not be loosened for convenience.
- A concept folder is created **only when its first entity/service is added** — do
  not pre-scaffold empty folders for concepts not yet implemented.
- External integrations (payment, and later notifications/video) are accessed through
  a **port interface in `core`**, with a mock/in-memory adapter for MVP and a real
  adapter (Stripe, etc.) added later in the concept's `app` module without touching
  callers — this is required by UC04/UC06's "Stripe adapter" stretch goal and keeps
  `db`/`core` free of vendor SDKs.
- Domain events use a **lightweight typed emitter in `core/src/events`**, registered
  as a singleton in the app's `Cradle` — not a queue. Background workers/queues are
  explicitly out of scope for MVP; events are for in-process side effects (logging,
  triggering a message, cache invalidation) only.
- Shared Zod schemas live in `core/src/validators/<concept>/`, imported by both the
  API route (server validation) and the form component (client validation) — one
  schema, two call sites, never redefined.
- DB access happens only in routes/pages that call `await connection()` first (per
  request, never prerendered); the app must build and boot with no database reachable.
  If the database can't be reached, `withRequestScope` throws `ServiceUnavailableError`
  (503).
- Booking/payment flows that mutate shared state (slot availability) go through a DB
  transaction in the service layer — never split a check-then-write across two
  round-trips without a transaction.

### Engineering Principles (the ones that actually earn their keep here)

These are not abstract OOP trivia — each one maps to a real decision already made in
this codebase or in the structure proposed above. When two principles pull in
different directions, prefer the one that keeps the change **smaller and more
explicit**, not the one that looks more "enterprise."

- **SRP — one file, one reason to change.** An entity file owns schema/columns only;
  a service file owns one concept's business rules; a route file owns HTTP
  wiring only (validation → auth → service call → envelope). Example: `booking.service.ts`
  decides whether a slot is bookable; it never builds a `Response`, and
  `api/bookings/route.ts` never contains a slot-availability check inline.
- **DRY — one definition, every call site imports it.** A Zod schema is written once
  in `core/src/validators/<concept>/` and imported by both the route handler and the
  `CrudForm`; the fetch/error-envelope logic is written once in `apiCall`/`apiHandler`,
  never re-typed per route or per page. If you're about to copy a `try/catch` or a
  validation block, stop and extract it instead.
- **Separation of Concerns — layers don't leak.** Persistence stays in `db`, business
  rules stay in the `app` modules, HTTP/rendering stays in `app` routes and pages,
  presentation stays in `ui`, framework-agnostic contracts (errors, envelope, ports,
  schemas) stay in `core`. `core` never imports `next`/`react` (enforced by ESLint); a
  page component never issues a raw MikroORM query.
- **Dependency Inversion — depend on a port, not a vendor SDK.** `BookingService`
  depends on the `PaymentGateway` interface, not on the Stripe SDK. The MVP's
  `MockPaymentGateway` and a later `StripePaymentGateway` are interchangeable because
  callers only ever see the port. This is also why `db` is the only package allowed to
  import `@mikro-orm/*` — nothing else should be coupled to the specific ORM.
  `awilix` is the mechanism that wires the chosen adapter in at startup.
- **Explicit over implicit.** `container.ts` registers every dependency by hand — no
  `loadModules` globbing — specifically so every binding is greppable. Keep this
  discipline as services grow to ~9: a new service is a new explicit registration and
  a new `Cradle` entry in `container.ts`, never auto-discovered from a folder scan.
- **Convention over configuration, scoped narrowly.** The `<concept>/` folder
  convention (Section 2) replaces what a module system would otherwise need a config
  file to declare. It only works because it's applied consistently — a concept that
  doesn't follow the folder convention breaks the convention for everyone reading the
  code afterward.
- **YAGNI — no speculative structure.** Don't create `messages/` before there's a
  `Message` entity to put in it; don't add a generic plugin/module loader because
  Open Mercato has one — this product's scope document explicitly excludes that. The
  four-package boundary plus concept folders is exactly as much structure as ~9
  concepts need, not more.
- **Composition over inheritance.** Prefer small functions/services composed together
  over class hierarchies. A `BookingService` composes a `SlotService` and a
  `PaymentGateway` port rather than a base `Service` class with template methods.
- **Fail closed, not open.** Any error inside an authorization or ownership check
  results in denial, never in falling through to "allow." A booking action with an
  ambiguous ownership result is a 403, not a best-effort 200.
- **Idempotency where retries can happen.** Payment confirmation and webhook-driven
  state transitions (UC04: "transitions booking to `confirmed` **exactly once**") must
  tolerate being invoked twice without double-charging or double-booking — this is
  the concrete reason the booking flow needs a DB transaction and a unique constraint
  on the slot, not just an application-level check.

### Security & Validation — Minimum Requirements

- **Password hashing:** `bcrypt`/`bcryptjs`, cost factor **≥ 12** (OWASP's floor is
  10; raise it since this is a small user base and the extra ~50ms per login is free).
  If a faster/stronger option becomes desirable later, the documented upgrade path is
  `argon2id` (memory ≥ 19 MiB, iterations ≥ 2, parallelism 1) — don't switch without a
  reason, but don't invent a third option either.
- **JWT:** signed with `HS256` minimum, using a secret ≥ 32 random bytes loaded from
  a zod-validated env module — never hardcoded, never committed. Short expiry (e.g.
  24h); there is no refresh-token flow in MVP scope — document that as a known
  limitation, don't silently extend the token lifetime to compensate.
- **Cookies:** `httpOnly`, `secure` in production, `sameSite=lax` (or `strict` for
  auth-only routes), scoped `path`. Never put the JWT in `localStorage` or a
  non-HttpOnly cookie.
- **CSRF:** because auth relies on a cookie, every state-changing route needs a CSRF
  defense — `sameSite` cookies plus a check that the request carries `CSRF_HEADER`
  (`apiCall` always sets it; a plain HTML form post can't) is the minimum bar.
- **Rate limiting:** `login`, `register`, and any future password-reset endpoint need
  a brute-force control — a simple per-IP+email attempt counter with a cooldown is
  enough for MVP; note it explicitly as needing a stronger backend before real
  production traffic.
- **Ownership over role.** This product has no RBAC (explicitly out of scope), but
  every mutation still needs an ownership check: a student can only reschedule/cancel
  *their own* booking, a mentor can only edit *their own* profile/availability. Treat
  a missing ownership check exactly like a missing auth check — both are blockers.
- **Mass assignment:** a route never spreads the raw request body into `em.create()`;
  it always goes through the Zod schema's parsed, explicitly-typed output, so a client
  can't smuggle in fields like `id`, `status`, or `mentorId` on someone else's record.
- **Injection:** all persistence goes through MikroORM's entity/query APIs — no raw
  SQL string concatenation, no `raw()`/`em.execute()` with interpolated user input.
- **Money correctness:** booking price is always recomputed server-side from
  `mentor.rate × duration`; a client-supplied price is parsed by the schema but never
  trusted or persisted as-is (UC04's own acceptance criterion).
- **Secrets & logging:** all secrets via env, validated by the zod env schema, `.env*`
  git-ignored; logs never contain passwords, tokens, or full JWTs — when a structured
  logger (e.g. `pino`) is introduced, redact those fields explicitly in its config.
- **Auth error messages:** generic on login/register ("invalid credentials"), never
  revealing whether a given email is registered.
- **IDs:** UUID for every entity (define it on the shared base entity when the first
  entity lands) — avoids sequential-ID enumeration of bookings/payments/messages
  across users.
- **Dependency hygiene:** run `npm audit` as part of the validation gate; don't add a
  dependency for something 20 lines of local code covers.

### Code Quality

- No `any`; narrow unknown types at runtime instead of disabling type-checking.
- Self-documenting code; a comment only for a non-obvious *why*.
- Three similar lines are fine; a copy-pasted block with branching logic is not —
  extract it (see DRY above).
- No feature you don't need yet (no RBAC, no multi-tenant, no queue) — the product
  scope explicitly excludes these; don't smuggle them back in "for later" (see YAGNI
  above).
- Every function does one thing at one level of abstraction; flatten deep nesting
  with early returns rather than nested `if`s.
- Error and empty/null paths are handled where they occur, not woven through the
  happy path — an early return beats a five-level-deep `if`.
- No empty `catch` blocks — handle, log with context, or rethrow (wrapping in an
  `AppError` with `cause`); never swallow an error silently.
- No magic numbers/strings — name the constant and, where the value isn't obvious
  (a rate-limit window, a reschedule cutoff of 12 hours), say why that value.
- Booleans read positively at the call site (`isConfirmed`, not `!isNotConfirmed`);
  a bare `true`/`false` argument at a call site is replaced with a named option or a
  separate function.
- Dead code, commented-out code, and debug `console.log`s are removed before review,
  not left "just in case."
- A PR's diff traces entirely to its stated purpose — no drive-by renames, formatting
  passes, or speculative options mixed into a behavioral change.

### Code Review Checklist

#### Structure & conventions

- Concept folder naming matches the table above and the entity/service pairing exists
  on both sides (no entity without a service, no service without its entity).
- No import breaks the package dependency rules (`npm run lint` catches the package
  boundaries) or reaches into another concept's internals instead of its public
  service method.
- New routes use `apiHandler` (and `makeCrudRoute` once it exists) rather than a
  hand-rolled `try/catch`; new forms use `CrudForm`; new lists use `DataTable` — a
  bespoke implementation of any of these needs a stated reason in the PR description.
  If the shared piece doesn't exist yet, the first PR that needs it builds it.
- `npm run lint`, `npm run typecheck`, and relevant tests pass before requesting
  review.

**Security fundamentals** (adapted from Open Mercato's shared review checklist —
kept to what actually applies to a project with no RBAC/multi-tenancy):

- [ ] Auth is enforced **server-side** on every route that isn't explicitly public —
  "the button is hidden in the UI" is not enforcement. (blocker)
- [ ] Authorization checks **the specific record**, not just "is logged in" — can this
  student cancel *this* booking, can this mentor edit *this* profile (no insecure
  direct object references). (blocker)
- [ ] Any check-then-act sequence on a shared resource — slot availability, booking
  status — is protected by a DB transaction and/or a unique constraint, not a
  read-then-write with a race window. (blocker for bookings/payments)
- [ ] No secret, token, password, or full JWT appears in a log line, error response,
  or client-visible payload. (blocker)
- [ ] No untrusted input reaches a query, shell command, or file path unparameterized
  or uncanonicalized. (blocker)
- [ ] A write endpoint parses an explicit Zod-typed shape — it never spreads the raw
  request body into `em.create()`/`em.assign()` (no mass assignment). (blocker)
- [ ] Cookie flags (`httpOnly`, `secure`, `sameSite`) are preserved whenever
  auth-cookie code is touched. (major)
- [ ] Error handling around a security decision fails **closed** (deny) on an
  unexpected error, never open (allow). (blocker)
- [ ] A bug fix for a security-relevant flow ships with a regression test that fails
  without the fix. (major)
- [ ] Rate limiting or another brute-force control is present on login/register/any
  password-reset endpoint touched by the change. (major)

#### Correctness & tests

- Race-condition-sensitive flows (booking, reschedule) are covered by an integration
  test that simulates the concurrent case, not just the happy path.
- Server-side revalidation exists for anything client-supplied that affects money or
  ownership (price, mentor ID, student ID).
- A behavior change ships with a test that fails on the pre-change code; a bug fix
  ships a regression test reproducing the original bug.

---

## 2. How to Place & Generate a New Example (for the agent)

When asked to scaffold a new domain concept (e.g., "add reviews"), start with a spec
(`AGENTS.md` workflow), then:

1. Create `packages/db/src/entities/<concept>/<name>.entity.ts`. Register it in
   `entities/index.ts`. Add `packages/db/src/repositories/<concept>/<name>.repository.ts`
   with intention-revealing methods, export it from `packages/db/src/index.ts`, and
   generate a migration.
2. Create `packages/app/src/modules/<concept>/<name>.service.ts`. Register the
   repository and service in `packages/app/src/di/container.ts`
   (`asClass(...).scoped()`) and add both to its `Cradle` interface.
3. Add shared validation at `packages/core/src/validators/<concept>/<name>-<action>.schema.ts`
   — this is not optional once there's a create/update input to validate. (The first
   concept to do this adds `zod` to `@devmentor/core`.)
4. If the concept emits domain events, add them to `core/src/events` using the
   `concept.entity.action` naming and emit from the service after a successful
   mutation. (The first concept to do this creates the emitter.)
5. Add the HTTP surface in `packages/app/src/app/api/<concept>/route.ts`:
   - Every handler is wrapped in `apiHandler` from `@/http/api-handler`, calls
     `await connection()`, and runs service calls through `withRequestScope` from
     `@/di/container`. Follow `api/health/route.ts`.
   - Plain CRUD resource → `export const { GET, POST, PUT, DELETE } = makeCrudRoute({ schema, service })`
     (the first CRUD concept builds `makeCrudRoute`).
   - Custom workflow (booking, payment, reschedule) → `apiHandler` directly, call the
     session/ownership assertions from `auth.ts` first, then one or more service methods.
   - Never write a bare `try/catch` + manual `Response.json` — that's what
     `apiHandler`/`makeCrudRoute` exist to remove.
6. Add the page(s) under the matching route group: public and persona pages under
   `(frontend)/` (persona groups such as `(student)`, `(mentor)`, `(auth)` nest inside
   it), back-office pages under `(backend)/admin/`:
   - Fetch from client components through `apiCall`/`apiCallOrThrow` — never a raw
     `fetch`. Server components call services through `withRequestScope` directly.
   - Create/edit UI → `CrudForm` bound to the same schema from step 3.
   - List UI → `DataTable`.
   - Loading/error/empty states → the shared `feedback/` components, not bespoke JSX.
   - Before writing any new component, check `ui/src/backend/` (generic pattern?) and
     `ui/src/components/<concept>/` (this concept already has it?) per the placement
     decision tree in Section 1 — only write a new one if neither applies.
7. Never add a per-concept `setup.ts`/`acl.ts` or any auto-discovery mechanism — the
   four packages and the concept-folder convention are the only structure.

---

## 3. Changes Applied to `AGENTS.md`

Applied on 2026-10-20: `AGENTS.md` now has the "Engineering standards", "Domain
concept convention" and "Reusable API & UI layer" subsections after "Monorepo
layout". It also mentions the ESLint-enforced dependency rules, `withRequestScope`,
the `components/ui/` primitive location and the `.ai/docs/` folder.

The original plan also called for editing `docs/product-scope.md` (its "no DI
container" line). That file isn't in this repository. If it's brought in, qualify that
line: the decision is to keep `awilix`.

---

## 4. Target Package Structure

Concept folders appear only as their concepts are implemented. The tree shows the
end state; **(exists)** marks what's in the repo today.

```
packages/
  app/
    src/
      app/
        (frontend)/                                   # public + persona pages (Tailwind)
          page.tsx                                    # S01 landing (exists)
          mentors/page.tsx                            # S02 search results
          mentors/[mentorId]/page.tsx                 # S03 mentor profile
          (auth)/login/page.tsx                       # S04
          (auth)/register/page.tsx
          (student)/book/[mentorId]/page.tsx          # S05 booking flow
          (student)/checkout/[bookingId]/page.tsx     # S06 checkout
          (student)/dashboard/page.tsx                # S07
          (student)/sessions/page.tsx                 # S08 my sessions
          (student)/sessions/[bookingId]/reschedule/page.tsx  # S09
          (student)/messages/page.tsx                 # S10
          (student)/favorites/page.tsx                # S11
          (student)/settings/page.tsx                 # S12
          (mentor)/mentor/dashboard/page.tsx          # M01
          (mentor)/mentor/availability/page.tsx       # M02
          (mentor)/mentor/sessions/page.tsx           # M03
          (mentor)/mentor/profile/page.tsx            # M04
          (mentor)/mentor/students/page.tsx           # M05 (stretch)
          (mentor)/mentor/reviews/page.tsx            # M06
        (backend)/admin/                              # back office (shadcn/ui) (exists)
        api/
          health/route.ts                             # reference example (exists)
          auth/route.ts
          mentors/route.ts
          mentors/[id]/route.ts
          availability/route.ts
          bookings/route.ts
          bookings/[id]/reschedule/route.ts
          bookings/[id]/cancel/route.ts
          payments/route.ts
          payments/webhook/route.ts
          messages/route.ts
          messages/[conversationId]/route.ts
          favorites/route.ts
          reviews/route.ts
      di/container.ts                                 # composition root + Cradle (exists)
      http/api-handler.ts                             # apiHandler with unstable_rethrow (exists)
      modules/
        health/health.service.ts                      # (exists)
        auth/user.service.ts
        mentors/mentor.service.ts
        mentors/technology.service.ts
        availability/availability.service.ts
        bookings/booking.service.ts
        payments/payment.service.ts
        payments/adapters/mock-payment-gateway.ts     # MVP adapter
        messages/message.service.ts
        favorites/favorite.service.ts
        reviews/review.service.ts

  core/
    src/
      http/
        errors.ts                                     # AppError hierarchy (exists)
        envelope.ts                                   # ApiResult + CSRF_HEADER (exists)
        api-handler.ts                                # createApiHandler (exists)
        make-crud-route.ts                            # config-driven CRUD routes
      events/
        event-bus.ts                                  # typed emitter, in-process only
        event-map.ts                                  # `concept.entity.action` registry
      ports/
        payments/payment-gateway.port.ts              # interface
      validators/
        auth/register.schema.ts
        bookings/booking-create.schema.ts
        mentors/profile-update.schema.ts
        ...

  db/
    src/
      entities/
        index.ts                                      # explicit registry (exists)
        auth/user.entity.ts
        mentors/mentor-profile.entity.ts
        mentors/technology.entity.ts
        availability/slot.entity.ts
        bookings/booking.entity.ts
        payments/payment.entity.ts
        messages/conversation.entity.ts
        messages/message.entity.ts
        favorites/favorite.entity.ts
        reviews/review.entity.ts
      repositories/
        health/health.repository.ts                   # (exists)
        <concept>/<name>.repository.ts

  ui/
    src/
      components/
        ui/                                           # shadcn primitives only (exists)
        mentors/mentor-card.tsx                       # concept-specific shared components,
        availability/time-slot-picker.tsx             # one folder per concept, same names
        messages/conversation-thread.tsx              # as entities/ and modules/
        reviews/review-stars.tsx
      frontend/                                       # custom Tailwind components for public pages (exists)
      backend/                                        # generic, concept-agnostic admin patterns
        api/api-call.ts                               # (exists)
        feedback/{loading-message,error-message,empty-state}.tsx  # (exists)
        forms/crud-form.tsx
        tables/data-table.tsx
```

Dependency direction is unchanged from `AGENTS.md`. Only the internal layout of
`entities/`, `repositories/`, `modules/`, `validators/`, `api/`/pages, and
`ui/src/components/` gains a concept sub-folder — no new packages, no new
architectural boundary. `ui/src/backend/` is the one folder in this tree that is
*not* concept-scoped by design: it's the designated growth point for reusable
admin building blocks shared across every concept, mirroring `core/src/http/` on the
server side.

---

## 5. Migration Status (current repo → this structure)

Do this incrementally, one buildable step at a time — never one giant move-everything
commit.

1. **Done (2026-10-20).** Existing code moved into the convention: `HealthRepository`
   → `repositories/health/`, shadcn primitives → `components/ui/`. (The original plan
   named `user`/`mentor-profile` files; they don't exist yet and will be created in
   place.)
2. **Done (2026-10-20).** `core/src/http/` (`errors.ts`, `envelope.ts`,
   `api-handler.ts`) and `ui/src/backend/` (`api/api-call.ts`, `feedback/*`) built.
   ESLint package boundaries and the raw-`/api`-fetch ban added.
3. **Done (2026-10-20).** Reference example: `/api/health` uses `apiHandler` +
   `withRequestScope`, and the admin dashboard's health panel fetches through
   `apiCall` and renders `LoadingMessage`/`ErrorMessage`. Every later route and page
   copies this.
4. **Next concept with a list/create/edit screen** builds `makeCrudRoute`,
   `CrudForm` and `DataTable` (and adds `zod` + `core/src/validators/`) against its
   own real use case — likely `auth/register.schema.ts` if auth forms come first.
5. **First authenticated route** builds `auth.ts` (session, ownership assertions,
   CSRF header check) together with the JWT/cookie/rate-limit rules above.
6. **First feature that emits an event** (bookings or messages) adds
   `core/src/events/`. **First external integration** (payments) adds its port in
   `core/src/ports/`.
7. **For every new concept** (`availability`, `bookings`, `payments`, `messages`,
   `favorites`, `reviews`), follow Section 2 exactly — create folders only when adding
   that concept's first file, and reuse `apiHandler`/`apiCall`/`feedback` (and
   `makeCrudRoute`/`CrudForm`/`DataTable` once built) before writing anything bespoke.
8. After each step, confirm `npm run lint`, `npm run build` and `/api/health` /
   `/admin` still work — they're the regression check until real features replace them.
