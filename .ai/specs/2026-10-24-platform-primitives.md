---
title: Platform primitives: authentication, validation, CRUD and form kit
status: draft
created: 2026-10-24
updated: 2026-10-24
owner: Product owner
---

# Platform primitives: authentication, validation, CRUD and form kit

Prerequisite of `2026-10-24-mentor-supply.md` (E01, issue #8). Tracking issue: E01-T01 (see `.ai/specs/backlog.md`). Product authority: `.ai/specs/product-brief.md`. Backlog: `.ai/specs/backlog.md`. Architecture authority: `AGENTS.md` and the code in `packages/*`.

## 📝 TLDR

The application has only a health check: no authentication, no entities, no validators, no reusable form or service primitives. This spec (future behavior) builds the primitives the first epic needs (sign-in with GitHub or a magic link, sessions, roles and ownership guards, validation, a CRUD route factory, a form kit, a clock port, a mail port) and fixes the contracts of the primitives that E02–E05 will build at their first consumer, so the application grows on shared abstractions instead of per-feature copies.

## 📝 Problem Statement

The backlog (#8–#26) has five epics whose features repeat ten times over. Without shared primitives each epic would invent its own auth, validation, forms, error handling and integrations.

| Feature type | Appears in | Primitive |
|---|---|---|
| Identity, sessions, roles, ownership | E01-S01, E02-S03, E04-S01, E05 | `AuthService`, session cookie, `requireSession`, `requireRole`, `assertOwner` |
| Owner-scoped records with validated forms | E01 profile, windows, invitations | Zod schemas in `core`, `CrudService`, `makeCrudRoute`, form kit |
| Time-bound inventory | E01-S02, E02-S02 | `Clock` port (rules live in the E01 spec) |
| Searchable public lists | E02-S01 | dedicated directory service (not `CrudService`); card component |
| State machines that move money | E02-S03, E03 | contract only (three-step reserve → charge → confirm) |
| External integrations | E03 Stripe, E02-S03 mail | ports in `core`, adapters in the module; mail built now |
| Notifications | E02-S03, E03-S02 | contract only (in-product rows in booking txn; e-mail via events) |
| Access-scoped conversation | E04-S01 | contract only |
| Operator views and counters | E05, invitations | admin pages on shadcn |
| Launch gates | E05-S01 | contract only |

## 📝 Proposed Solution

Design every primitive, build only what the first epic consumes, and record the rest as contracts (gate answer Q1). Alternatives considered:

- **Build every primitive now** (payment port, events, state machine, data table): rejected. AGENTS.md defers them to their first consumer and the Tech Lead's estimate is pending (D14).
- **Only what E01 needs, no forward design:** rejected. E02–E05 would diverge on auth, validation and error handling.
- **Adopt Better Auth or Auth.js for sign-in:** rejected for now. Better Auth is the recommended direction for new projects and Auth.js is now maintained by the same team, but MikroORM v7 would need a community adapter (`better-auth-mikro-orm`, v0.x, which does not manage the schema) whose v7 support I could not verify, and both bring their own routes and response shapes beside `apiHandler` and the `ApiResult` envelope. The in-house `AuthService` is small (GitHub authorization-code flow, hashed opaque session tokens, magic links) and sits behind ports, so a library can replace it later. Revisit if sign-in grows (passwords, MFA, other providers).

`makeCrudRoute` is kept (grill answer, 2026-10-24): the backlog has several owner-scoped collection resources of this shape (messages later, operator lists), and a shared route shape is the point of this spec. It has two consumers in E01: the availability windows (list, create, remove) and the invitations collection (`GET` list and `POST` create; revoke and accept are their own routes, because revoke keeps the row). E02 directory and bookings deliberately use dedicated routes/services (filtered public discovery and a multi-step state machine), not this factory. Its contract is checked in Phase 3 against the known later resources (an owner-scoped list and a state-changing action route) and is allowed to change shape when a third consumer arrives. The form kit's first consumers are the E01 profile and window forms. These primitives are built here because that spec cannot start without them.

**Assumed deployment:** one long-running Node process behind HTTPS (grill answer). If the pilot turns out to be serverless, the in-memory rate limiter must be replaced by a database-backed one before anything ships.

## 📝 Verified in the installed packages

Checked against the installed files on 2026-10-24, not from memory:

- **MikroORM 7.2.5** (`@mikro-orm/core` `entity/defineEntity.d.ts`): `defineEntity` with property builders `p.uuid()`, `p.string()`, `p.text()`, `p.integer()`, `p.boolean()`, `p.datetime()`, `p.json<T>()`, `p.enum(...)`, `p.array()` and the relation builders (`manyToOne`, `oneToOne`, …). Chain methods include `.primary()`, `.unique()`, `.nullable()`, `.default()`, `.onCreate()`, `.onUpdate()`, `.index()`, `.check()`, `.columnType()`, and `.array()` on a scalar builder for a native array column. Table-level `uniques`, `indexes` and `checks` exist. `p.enum` on PostgreSQL defaults to a text column with a check constraint, so a `text[]` column validated by Zod is used for stacks, not an enum array. The datetime default column type on PostgreSQL is not confirmed by the types: columns set `.columnType('timestamptz')` explicitly.
- **Exclusion constraints:** the schema helper emits a table check whose expression starts with `exclude` verbatim (`SchemaHelper.isRawConstraintBody`), so an `exclude using gist (…)` constraint is declared in the entity's `checks`. The package does not create the `btree_gist` extension: the generated migration is edited to run `create extension if not exists btree_gist` first (`Migration.addSql`). Whether a later `migration:create` produces an empty diff with such a constraint is not verified; the E02 spec's booking phase includes a spike for it (the E01 spec uses a service-level overlap check instead).
- **Zod 4.6.7** is installed only transitively (through `shadcn`); it becomes a direct dependency of `@devmentor/core`. In v4, `ZodError.flatten()` is deprecated: `validateInput` maps `error.issues` (path and message) to `FieldErrors`, which also handles nested paths such as `publicLinks.0.url`.
- **Next.js 16.4.2** docs in `node_modules/next/dist/docs`: `cookies()` is async; `set` and `delete` work only in Route Handlers and Server Functions, never during Server Component rendering; with `cacheComponents` on, calling `cookies()` outside `<Suspense>` blocks prerendering, so pages that read the session call `await connection()` first (AGENTS.md rule). `redirect()` throws and must be called outside `try`/`catch`; `unstable_rethrow` is already wired into `apiHandler`. `proxy.ts` replaced `middleware.ts`; this spec does not use it, and session checks happen in the data layer.
- **Consequence:** the page behind the magic link cannot set the cookie, so consumption is a POST Route Handler (`app/api/auth/magic-link/consume/route.ts`) called from the confirmation page.
- **Not installed, version noted from the registry:** `nodemailer` 10.2.1 (to add to `@devmentor/app`). The SMTP vendor is a deployment choice, not decided here.
- **Existing gap found:** `CSRF_HEADER` is sent by `apiCall` but `createApiHandler` never checks it.

## 📝 Architecture

Placement follows the package rules in `AGENTS.md`; concept folders are plural.

```
packages/core/src/
  validators/validate-input.ts          validateInput(schema, input) → Result<T, FieldErrors>; parseInput throws ValidationError
  validators/auth/*.schema.ts           sign-in schemas (other schemas arrive with their consumers)
  auth/principal.ts                     Principal { userId, roles[] }, Role = 'mentee' | 'mentor' | 'operator'
  auth/guards.ts                        assertAuthenticated, assertRole, assertOwner → Unauthorized/Forbidden
  auth/hash-token.ts                    hashToken(token) → SHA-256 hex (node:crypto)
  http/crud-service.ts                  CrudService contract
  ports/mail/mail.port.ts               MailPort.send({ to, subject, text, html? })
  ports/auth/identity-provider.port.ts  IdentityProvider (GitHub): authorizeUrl, exchange(code) → VerifiedIdentity
  ports/clock/clock.port.ts             Clock.now(); SystemClock
  ports/security/rate-limiter.port.ts   RateLimiter.hit(key, limit, windowSeconds)
packages/db/src/
  entities/{users,auth}/*.entity.ts     User, Identity, Session, LoginToken; registered in entities/index.ts
  repositories/{users,auth}/*.repository.ts
packages/app/src/
  modules/auth/   auth.service.ts, session-cookie.ts, guards.ts (requireSession, requireRole), adapters/{github-identity-provider,memory-rate-limiter}.ts
  modules/mail/   adapters/{smtp-mailer,log-mailer}.ts, create-mailer.ts
  http/           csrf + origin check in api-handler wiring; make-crud-route.ts
  app/api/auth/… (incl. magic-link/consume), app/auth/magic/[token]/page.tsx (confirmation), app/(frontend)/sign-in/…, app/(frontend)/privacy/page.tsx
packages/ui/src/
  frontend/forms/   TextField, TextAreaField, CheckboxGroupField, FormError, SubmitButton, useApiForm
```

Takeaway: services take an explicit `Principal` argument instead of reading request state, so every service method is unit-testable without Next. Routes resolve the principal once (`requireSession`) and call one service.

### Primitives built here and contracts for later

| Primitive | Status | First consumer | Contract |
|---|---|---|---|
| Auth, roles, ownership guards | built (Phase 2) | E01 (AGENTS.md defers these to their first consumer; this is it) | as above |
| `validateInput` + Zod | built (Phase 1) | E01 | schemas live next to their concept; `ui` never imports zod |
| `Clock` | built (Phase 1) | E01-S02 | `now(): Date`; tests inject a fixed clock |
| `MailPort`, `LogMailer`, `SmtpMailer` | built (Phase 2) | magic link; E02-S03 notices | ports in `core` |
| `CrudService` + `makeCrudRoute` | built (Phase 3) | availability windows and the invitations collection (E01) | below |
| Form kit + `useApiForm` | built (Phase 3) | profile and window forms (E01) | below |
| Domain event emitter | contract | E02-S03 | `core/src/events`: `emit(name: 'concept.entity.action', payload)`, typed map, in-process, no queue |
| `PaymentGateway` port | contract | E03-S01 | `charge({ idempotencyKey, amountMinor, currency, bookingId })`, `refund({ idempotencyKey, chargeId, amountMinor? })`, `createPayoutAccount(userId)`; real Stripe adapter, mock only in unit tests (D13, R07); no composition payment double |
| Booking state machine | contract | E02-S03 | `pending → confirmed \| expired`; `confirmed → completed \| cancelled_by_mentee \| cancelled_by_mentor \| no_show_mentee \| no_show_mentor`; pure transition functions in `core`. Persist as three steps: reserve (`pending`) in one DB transaction, charge **outside** any transaction via an app-level `BookingPayment` adapter over this port, confirm in a second DB transaction. Money outcomes that must not be lost (refunds) are columns on the booking row (`refundStatus`), not in-process events alone |
| `SlotReservationReader` / `Writer` | contract | E02-S03 | `reservedIntervals(mentorId, range)`, atomic `reserve(...)` under the mentor-profile row lock with an overlap check; E01 checks window overlaps itself and does not call the reader. Directory and “nearest slot” must call `listBookableSlots` (which uses the reader once wired), never raw windows alone |
| `LaunchGate` | contract | E05-S01 | `isPaidBookingOpen(): Promise<boolean>` backed by the D16 counts; the booking service asks it before charging (R06); closed by default until E05 |
| Notification channels | contract | E02-S03 | In-product notice rows are written by `BookingService` in the confirm/cancel transaction. `NotificationChannel.deliver(userId, notice)` is the e-mail (and later) channel that subscribes to domain events after commit (R10). In-product does not subscribe via this port |
| `DataTable` | contract | E05 | built when a second list page needs it; the invitations page uses the shadcn `Table` directly |

## 📝 Data Model

UUID ids, UTC `timestamptz` columns (set explicitly, see verification above), entities in `defineEntity` registered in `entities/index.ts`.

| Entity | Fields | Notes |
|---|---|---|
| `User` | id, email (unique, lower-cased), displayName, createdAt | Roles are derived per request, never stored: everyone signed in is `mentee`; `mentor` when a `MentorProfile` exists (E01 spec); `operator` when the user's e-mail is in `OPERATOR_EMAILS` at that moment, so removing an address revokes access immediately. Signing in with any verified e-mail creates a user: intended, since E02-S03 needs mentee sign-in. |
| `Identity` | id, userId, provider (`github` \| `email`), providerUserId, unique(provider, providerUserId) | A GitHub identity links to an existing user only when GitHub reports a verified primary e-mail equal to the user's e-mail. |
| `Session` | id, userId, method (`github` \| `email`), tokenHash (unique), expiresAt, createdAt | Opaque 32-byte random token, SHA-256 hashed at rest (`node:crypto`; no custom algorithms). Fixed 30 days from sign-in, not sliding. `requireRole('operator')` also requires `method = github` and a session no older than 12 hours (checked per request from `createdAt`, so it does not depend on when the allowlist changed). |
| `LoginToken` | id, email, tokenHash (unique), expiresAt, consumedAt | Magic link: single use, 15 minutes. |

E-mail addresses are the only personal data. Tokens are stored hashed; nothing is logged with an address or token (the `LogMailer` logs a redacted recipient and the link, in test and development only).

## 📝 API Contracts

All JSON routes use the `ApiResult<T>` envelope and `AppError` subclasses through `apiHandler`. State-changing JSON routes require the `x-devmentor-request` header and, when an `Origin` header is present, that it matches `APP_URL`'s origin (there are no state-changing GET routes). This adds an option to `createApiHandler` in `core` that defaults on; the existing `/api/health` is a GET and is unaffected.

| Route | Who | Request → response |
|---|---|---|
| `POST /api/auth/magic-link` | anyone | `{ email }` → `{ sent: true }` always (no account enumeration); rate limited 5 per hour per e-mail, and 20 per hour per client address only when `TRUST_PROXY=true` (proxy headers can be spoofed otherwise) |
| `GET /api/auth/github` | anyone | redirect to GitHub with a one-time `state` cookie |
| `GET /api/auth/github/callback` | anyone | `code`, `state` → session cookie, redirect to `next` (same-origin paths only) |
| `GET /auth/magic/[token]` (page) | anyone | shows a confirmation page with a Continue button; never consumes the token, so mail scanners that fetch links cannot burn it |
| `POST /api/auth/magic-link/consume` | anyone | `{ token }` → consumes it, sets the session cookie (`method = email`), returns `{ redirectTo }`; expired or used → `ValidationError` with a clear code; behind the CSRF and Origin check |
| `POST /api/auth/sign-out` | session | deletes the session, clears the cookie |
| `GET /api/me` | session | `{ id, email, displayName, roles }` |

The two GitHub navigation routes do not return the JSON envelope: their handlers call a service that returns a `Result`, set the cookie and finish with Next's `redirect()` (success to `next`, failure to `/sign-in?error=<code>`). The `next` value must be a same-origin path starting with a single `/`; anything else goes to `/`. They stay inside `apiHandler`, which re-throws redirect control flow, so unexpected errors are still logged and answered safely.

Session cookie: `__Host-dm_session` in production (`Path=/`, no `Domain`, as the prefix requires), `dm_session` in development, `HttpOnly`, `Secure`, `SameSite=Lax`, 30 days. A new session token is issued at every sign-in.

New environment variables, all listed in `.env.example`: `APP_URL`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, `OPERATOR_EMAILS`, `MAIL_FROM`, `MAIL_TRANSPORT` (`smtp` or `log`), `SMTP_URL`, `TRUST_PROXY`. In development and test every one of these is optional: the GitHub button hides when its credentials are unset, mail goes to the log mailer, and `npm run setup` and CI need no secrets. In production a missing required variable stops startup with a clear message, and `MAIL_TRANSPORT=log` is refused, mirroring D21's real-transport-before-paid-launch condition. The founders own the sending domain (SPF and DKIM) and the Tech Lead picks an EU-region SMTP provider before Phase 2 starts. New dependencies: `zod` (core), `nodemailer` (app).

### CRUD contract

```ts
interface CrudService<TView, TCreate, TUpdate, TQuery = void> {
  list(principal: Principal, query: TQuery): Promise<TView[]>;
  get(principal: Principal, id: string): Promise<TView>;
  create(principal: Principal, input: TCreate): Promise<TView>;
  update(principal: Principal, id: string, input: TUpdate): Promise<TView>;
  remove(principal: Principal, id: string): Promise<void>;
}
```

`makeCrudRoute({ access, service, schemas })` returns the collection (`GET`, `POST`) and item (`GET`, `PUT`, `DELETE`) handlers for whichever methods the service implements. It wraps `apiHandler`, `connection()`, `withRequestScope`, the access guard (`requireRole('mentor')`) and `validateInput`. Singleton resources (a profile) use `apiHandler` directly with the same service pattern. The factory is covered by its own unit tests, so its first consumers do not need to test it again.

## 📝 UI/UX

- **Sign-in** (`/sign-in`): a GitHub button and an e-mail field; after sending, a "check your e-mail" state shown even for unknown addresses; errors from `?error=` use `ErrorMessage`; a privacy-notice link to `/privacy` (a placeholder page until the legal owner named under Q11 supplies the text). Public-world page: custom Tailwind components, not shadcn (AGENTS.md).
- **Magic-link confirmation** (`/auth/magic/[token]`): a Continue button that posts the token; an expired or used token shows the error with a link back to sign-in.
- **Admin gate:** `(backend)/admin/layout.tsx` calls `requireRole('operator')`. This is a behavior change: the existing health page under `/admin` is public today and becomes operator-only.
- **Form kit** (`ui/src/frontend/forms/`): `TextField`, `TextAreaField`, `CheckboxGroupField`, `FormError`, `SubmitButton`, and `useApiForm({ initial, validate, submit })`, which runs a `core` validator on the client for fast feedback, calls `apiCall` (imported from its AGENTS.md-mandated path, `@devmentor/ui/backend/api/api-call`), and maps `fieldErrors` back to fields. Accessibility: every field has a label and an associated error; keyboard-only completion; focus moves to the first error on a failed submit.

## 📝 Edge Cases & Failure Scenarios

- **GitHub unreachable or consent denied:** `/sign-in?error=github` with the e-mail option; no session is created.
- **GitHub account with no verified primary e-mail:** no link to an existing user and no new account; the page asks for e-mail sign-in.
- **Mail send fails:** the `LoginToken` is deleted and the user sees "we could not send the e-mail, try again"; no usable token remains.
- **Magic link opened twice, expired, or in another browser:** the second consume fails with a clear message; another browser works, since the token is the credential; a mail scanner that only fetches the link sees the confirmation page and consumes nothing.
- **Operator allowlist changed:** access follows the allowlist on the next request; an operator without a GitHub session or with a session older than 12 hours is sent to sign in with GitHub.
- **Expired rows:** expired sessions, login tokens and invitations are deleted opportunistically during auth operations; there is no cleanup job (AGENTS.md: no queue or worker).
- **Session and CSRF:** new token at every sign-in; the header and Origin checks protect JSON routes; the cookie is `SameSite=Lax`; OAuth callbacks rely on the one-time `state` cookie.

## 📝 Risks & Impact Review

- **Owning authentication is the largest risk.** Mitigation: `node:crypto` primitives only, hashed single-use tokens, short expiries, rate limits, a security test list, and a port boundary for replacement. The in-memory rate limiter works only for one instance and resets on restart; that matches the pilot and must be replaced before running more than one instance.
- **Hard to reverse:** the `User` table and the cookie name; migrations are forward-only.
- **Public contract change:** `createApiHandler` gains a CSRF/Origin check that defaults on.
- **Behavior change:** `/admin` becomes operator-only.
- **Privacy:** mentor profiles are published personal data (name, experience, links). The pilot ships with a privacy-notice link and manual account deletion by the operator on request; there is no self-service deletion. The legal text waits for the owner named under Q11 (D27), and no public invitation goes out before the notice exists.
- **Unverified:** the cached state of `cookies()` under `cacheComponents` in practice (verify by loading the sign-in and a protected page in `npm run dev`), and the SMTP vendor.
- **Cost:** the Tech Lead's estimate (Q08) may force a first cut; any paid thin slice needs a superseding scope row (D14).

## 📝 Defaults recorded

Small choices confirmed in the grill (2026-10-24):

1. A new user's display name defaults to the GitHub name, or the e-mail's local part, and is edited on the mentor profile form (E01 spec).
2. Expired sessions, login tokens and invitations are deleted opportunistically during auth operations.
3. E-mail addresses are trimmed and lower-cased before storing or comparing.
4. The sign-in `next` parameter accepts only same-origin paths starting with a single `/`.
5. Sessions are not sliding: 30 days from sign-in, 12 hours for the operator role.

## 📝 Decisions in play

Relies on: D10 (GitHub sign-in with e-mail fallback; this spec picks the magic link as the mechanism D10 left open), D21 and R10 (real mail transport before the paid launch), D13 and R07 (for the payment contract), D14 (scope), N01, N02. Recorded as D25 (operator access) and D27 (privacy and sending-domain prerequisites): operators are identified by the `OPERATOR_EMAILS` allowlist for the pilot with no management UI, and need a GitHub session of at most 12 hours.

## 📋 Build order across both specs

1. Platform Phase 1, 2. platform Phase 2, 3. platform Phase 3 (the form kit, and the CRUD factory with its contract check), 4. E01 Phase 1 (invitations, profile, public card), 5. E01 Phase 2 (availability), 6. E01 Phase 3 (hardening). Steps 1–4 are the minimum cut that lets mentors join and publish a profile; the supply gate cannot pass before step 5, because it counts mentors with a bookable slot. The Tech Lead's estimate (Q08) is given per step.

## 📋 Phasing

1. **Foundations** (`core`, `db`): validator helper, guards, hash helper, ports, the four auth entities, one migration. No user-visible change.
2. **Authentication:** sign-in, sessions, magic link, GitHub, mail, CSRF and Origin check, rate limit, admin gate.
3. **CRUD and form kit:** `CrudService`, `makeCrudRoute`, the form components.

## 📋 Implementation Plan

### Phase 1 — Foundations

1. Add `zod@^4` to `@devmentor/core`; add `validators/validate-input.ts` (`validateInput`, `parseInput`) mapping `error.issues` to `FieldErrors`; tests for nested and array paths.
2. Add `Principal`, `Role`, guards and `hashToken` in `core/src/auth/` with tests for every role and ownership case.
3. Add ports `MailPort`, `IdentityProvider`, `Clock` with `SystemClock`, `RateLimiter`; export through `core/src/index.ts`; tests.
4. Add the sign-in Zod schemas.
5. Add entities `User`, `Identity`, `Session`, `LoginToken` (`columnType('timestamptz')`, `text`/`uuid` builders), register them, generate the migration, add repositories with intention-revealing methods and tests, run `npm run db:migrate`.
   Verify: `npm run lint`, `typecheck`, `test` (100%), `build`.

### Phase 2 — Authentication

1. `AuthService` (request magic link, consume, create and resolve session, sign out, link or create user); register in `container.ts` and the `Cradle` type; unit tests with fake repositories and a fixed `Clock`.
2. `GithubIdentityProvider` over `fetch` (code exchange, `/user`, `/user/emails`), tests with a mocked `fetch`; `SmtpMailer` (`nodemailer`) and `LogMailer`; `createMailer(env)` selects by `MAIL_TRANSPORT` and refuses `log` in production (unit-tested).
3. `MemoryRateLimiter` and its use on the magic-link request; tests for limit and window expiry.
4. CSRF and Origin check in the `createApiHandler` wiring; update its tests and the `apiHandler` wrapper.
5. Session helpers (`session-cookie.ts`, `requireSession`, `requireRole` with the operator GitHub-and-12-hour rule) using the async `cookies()`; routes under `/api/auth/*`, `/api/me`, `POST /api/auth/magic-link/consume` and the confirmation page `app/auth/magic/[token]/page.tsx`; tests including a redirect target that must stay on the origin and a consume that is not triggered by a plain GET.
6. `/sign-in`, check-e-mail and `/privacy` (placeholder) pages with `ErrorMessage`; update `.env.example` for every new variable, all optional outside production, with production startup validation.
7. Gate `/admin` with `requireRole('operator')` in the admin layout; update the layout, page and health-panel tests and the integration test that visits it.
   Verify: lint, typecheck, test, build; manual sign-in through the log mailer in `npm run dev`; an integration test seeds a `LoginToken` row with `hashToken`, visits the magic link and clicks Continue (GitHub is covered by unit tests with a mocked `fetch` and a documented manual check; the production refusal of `MAIL_TRANSPORT=log` is a unit test, since the integration suite boots `next start` with the real configuration).

### Phase 3 — CRUD and form kit

1. `CrudService` contract in `core`; `makeCrudRoute` in `app/src/http/` with tests for method wiring (including a service that implements only list and create), access guard, validation errors and the envelope. Check the contract on paper against an owner-scoped list and an action route (not E02 directory/bookings — those stay custom), and record any adjustment in this spec.
2. Form components and `useApiForm` in `ui/src/frontend/forms/` with tests (labels, errors, focus on first error, submit state).
   Verify: lint, typecheck, test, build. The first routes and forms that use these arrive in the E01 spec.

## ✅ Acceptance criteria

- [ ] A visitor can sign in with GitHub or by magic link; an existing user is linked by verified e-mail only.
- [ ] Magic-link tokens are single use and expire; session and login tokens are stored hashed.
- [ ] The session cookie is `HttpOnly`, `Secure` and `SameSite=Lax`, with the `__Host-` prefix in production.
- [ ] State-changing JSON routes reject requests without the CSRF header or from a foreign `Origin`.
- [ ] The magic-link request never reveals whether an address has an account and is rate limited; opening the link with a plain GET does not consume the token.
- [ ] The operator role requires a GitHub session no older than 12 hours; other sessions last 30 days.
- [ ] With no auth variables set, `npm run setup`, development and the integration suite work; in production a missing variable stops startup.
- [ ] `/privacy` exists and is linked from sign-in.
- [ ] `/admin` and its routes deny non-operators, including the existing health page.
- [ ] Roles are derived per request: removing an address from `OPERATOR_EMAILS` revokes access at once.
- [ ] `makeCrudRoute` and the form kit have unit tests, and no primitive marked "contract" is scaffolded in code.
- [ ] `npm run lint`, `typecheck`, `test` (100% coverage), `build` and `test:integration` pass.

## ⚠️ Open questions (non-blocking)

- **SMTP provider and sending domain:** the founders own the domain and the Tech Lead picks the provider before Phase 2 (decision D27); the name is not yet known.
- **Privacy text:** waits for the owner named under Q11.
